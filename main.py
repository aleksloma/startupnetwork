"""
StartupNetwork - A simple directory and network map for startups
Built with FastAPI + Jinja2 templates + JSON storage
"""

import os
import json
import secrets
import hashlib
import re
from datetime import datetime
from typing import Optional, List, Dict, Any
from pathlib import Path

from fastapi import FastAPI, Request, Form, File, UploadFile, HTTPException, Depends, status
from fastapi.responses import HTMLResponse, RedirectResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from starlette.middleware.sessions import SessionMiddleware
from PIL import Image, ImageOps
import bcrypt


# ============================================================================
# Configuration
# ============================================================================

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
LOGO_DIR = DATA_DIR / "logos"
TEMPLATES_DIR = BASE_DIR / "templates"
STATIC_DIR = BASE_DIR / "static"

# Ensure directories exist
DATA_DIR.mkdir(exist_ok=True)
LOGO_DIR.mkdir(exist_ok=True)
TEMPLATES_DIR.mkdir(exist_ok=True)
STATIC_DIR.mkdir(exist_ok=True)

# Files
USERS_FILE = DATA_DIR / "users.json"
STARTUPS_FILE = DATA_DIR / "startups.json"
FIELDS_FILE = DATA_DIR / "fields.json"

# Environment variables
SESSION_SECRET = os.getenv("SESSION_SECRET", secrets.token_hex(32))
ADMIN_USERNAME = os.getenv("ADMIN_USERNAME", "admin")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "admin123")

# Default fields with colors and centroid positions
DEFAULT_FIELDS = [
    {"name": "AI /ML", "color": "#3B82F6", "x": 50, "y": 20},        # Blue
    {"name": "Education", "color": "#10B981", "x": 85, "y": 35},     # Green
    {"name": "Sport", "color": "#F59E0B", "x": 85, "y": 65},         # Amber
    {"name": "Security", "color": "#EF4444", "x": 50, "y": 80},      # Red
    {"name": "Food", "color": "#8B5CF6", "x": 15, "y": 65},          # Purple
    {"name": "Media", "color": "#EC4899", "x": 15, "y": 35},         # Pink
    {"name": "Data", "color": "#06B6D4", "x": 50, "y": 50},          # Cyan
    {"name": "Health Care", "color": "#14B8A6", "x": 70, "y": 50},   # Teal
]


# ============================================================================
# JSON Persistence Helpers
# ============================================================================

def atomic_write(file_path: Path, data: Any):
    """Atomically write JSON data to file"""
    temp_path = file_path.with_suffix('.tmp')
    with open(temp_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    temp_path.replace(file_path)


def read_json(file_path: Path, default: Any = None) -> Any:
    """Read JSON file, return default if not exists"""
    if not file_path.exists():
        if default is not None:
            atomic_write(file_path, default)
        return default if default is not None else []
    with open(file_path, 'r', encoding='utf-8') as f:
        return json.load(f)


def process_logo_to_square(img: Image.Image, size: int = 512) -> Image.Image:
    """
    Process logo to fit perfectly in a circular container:
    - Convert to RGB if needed
    - Crop to square (center crop)
    - Resize to specified size
    - Add subtle padding for better circular display
    """
    # Convert RGBA to RGB with white background if needed
    if img.mode in ('RGBA', 'LA', 'P'):
        background = Image.new('RGB', img.size, (255, 255, 255))
        if img.mode == 'P':
            img = img.convert('RGBA')
        background.paste(img, mask=img.split()[-1] if img.mode in ('RGBA', 'LA') else None)
        img = background
    elif img.mode != 'RGB':
        img = img.convert('RGB')

    # Get dimensions
    width, height = img.size

    # Crop to square (center crop)
    if width > height:
        # Landscape - crop width
        left = (width - height) // 2
        img = img.crop((left, 0, left + height, height))
    elif height > width:
        # Portrait - crop height
        top = (height - width) // 2
        img = img.crop((0, top, width, top + width))

    # Resize to target size with high-quality resampling
    img = img.resize((size, size), Image.Resampling.LANCZOS)

    # Add 5% padding for better circular display
    padding = int(size * 0.05)
    if padding > 0:
        padded_size = size - (padding * 2)
        img = img.resize((padded_size, padded_size), Image.Resampling.LANCZOS)
        padded_img = Image.new('RGB', (size, size), (255, 255, 255))
        padded_img.paste(img, (padding, padding))
        img = padded_img

    return img


def get_users() -> List[Dict]:
    return read_json(USERS_FILE, [])


def save_users(users: List[Dict]):
    atomic_write(USERS_FILE, users)


def get_startups() -> List[Dict]:
    return read_json(STARTUPS_FILE, [])


def save_startups(startups: List[Dict]):
    atomic_write(STARTUPS_FILE, startups)


def get_fields() -> List[Dict]:
    return read_json(FIELDS_FILE, DEFAULT_FIELDS.copy())


def save_fields(fields: List[Dict]):
    atomic_write(FIELDS_FILE, fields)


# ============================================================================
# Authentication Helpers
# ============================================================================

def hash_password(password: str) -> str:
    """Hash password using bcrypt"""
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')


def verify_password(password: str, hashed: str) -> bool:
    """Verify password against hash"""
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))


def get_current_user(request: Request) -> Optional[Dict]:
    """Get logged-in user from session"""
    username = request.session.get('username')
    if not username:
        return None
    users = get_users()
    return next((u for u in users if u['username'] == username), None)


def require_login(request: Request) -> Dict:
    """Dependency: require user to be logged in"""
    user = get_current_user(request)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Login required")
    return user


def is_admin(user: Dict) -> bool:
    """Check if user is admin"""
    return user.get('is_admin', False)


# ============================================================================
# Bootstrap Admin User
# ============================================================================

def bootstrap_admin():
    """Create admin user if not exists"""
    users = get_users()
    if not any(u['username'] == ADMIN_USERNAME for u in users):
        users.append({
            'username': ADMIN_USERNAME,
            'password_hash': hash_password(ADMIN_PASSWORD),
            'email': '',
            'is_admin': True,
            'created_at': datetime.utcnow().isoformat() + 'Z'
        })
        save_users(users)
        print(f"==> Admin user created: {ADMIN_USERNAME}")


# ============================================================================
# Validation Helpers
# ============================================================================

def validate_url(url: str) -> bool:
    """Basic URL validation"""
    pattern = re.compile(
        r'^https?://'  # http:// or https://
        r'(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+[A-Z]{2,6}\.?|'  # domain...
        r'localhost|'  # localhost...
        r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})'  # ...or ip
        r'(?::\d+)?'  # optional port
        r'(?:/?|[/?]\S+)$', re.IGNORECASE)
    return bool(pattern.match(url))


def validate_linkedin_url(url: str) -> bool:
    """Validate LinkedIn URL"""
    return 'linkedin.com' in url.lower() and validate_url(url)


def validate_startup_data(data: Dict) -> List[str]:
    """Validate startup data, return list of errors"""
    errors = []

    # Startup name
    name = data.get('startupName', '').strip()
    if not name or len(name) < 2:
        errors.append("Startup name is required (min 2 characters)")
    elif len(name) > 100:
        errors.append("Startup name too long (max 100 characters)")

    # Goal
    goal = data.get('goalOneSentence', '').strip()
    if not goal:
        errors.append("Goal one sentence is required")
    elif len(goal) > 140:
        errors.append("Goal must be max 140 characters")

    # Website URL (optional)
    website = data.get('websiteUrl', '').strip()
    if website and not validate_url(website):
        errors.append("Invalid website URL")

    # Canvas description
    description = data.get('canvasIdeaDescription', '').strip()
    if not description:
        errors.append("Canvas idea description is required")
    elif len(description) < 100:
        errors.append("Description too short (min 100 characters)")
    elif len(description) > 500:
        errors.append("Description too long (max 500 characters)")

    # Fields
    fields = data.get('fields', [])
    if not fields or len(fields) < 1:
        errors.append("At least 1 field is required")
    elif len(fields) > 3:
        errors.append("Maximum 3 fields allowed")

    # Founder
    founder_name = data.get('founder_name', '').strip()
    founder_linkedin = data.get('founder_linkedin', '').strip()
    if not founder_name:
        errors.append("Founder name is required")
    if not founder_linkedin:
        errors.append("Founder LinkedIn URL is required")
    elif not validate_linkedin_url(founder_linkedin):
        errors.append("Invalid founder LinkedIn URL (must include linkedin.com)")

    # Co-founder (optional but both required if one provided)
    cofounder_name = data.get('cofounder_name', '').strip()
    cofounder_linkedin = data.get('cofounder_linkedin', '').strip()
    if cofounder_name and not cofounder_linkedin:
        errors.append("Co-founder LinkedIn URL required when name is provided")
    if cofounder_linkedin and not cofounder_name:
        errors.append("Co-founder name required when LinkedIn URL is provided")
    if cofounder_linkedin and not validate_linkedin_url(cofounder_linkedin):
        errors.append("Invalid co-founder LinkedIn URL (must include linkedin.com)")

    return errors


# ============================================================================
# FastAPI App Setup
# ============================================================================

app = FastAPI(title="StartupNetwork")

# Add session middleware
app.add_middleware(SessionMiddleware, secret_key=SESSION_SECRET)

# Mount static files
app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")
app.mount("/data/logos", StaticFiles(directory=str(LOGO_DIR)), name="logos")

# Templates
templates = Jinja2Templates(directory=str(TEMPLATES_DIR))

# Add custom template filter
def get_initials(name: str) -> str:
    """Get initials from name"""
    parts = name.strip().split()
    if len(parts) >= 2:
        return (parts[0][0] + parts[-1][0]).upper()
    elif len(parts) == 1:
        return parts[0][:2].upper()
    return "ST"

templates.env.filters['initials'] = get_initials


# ============================================================================
# Routes - Auth
# ============================================================================

@app.get("/signup", response_class=HTMLResponse)
async def signup_page(request: Request):
    """Signup page"""
    return templates.TemplateResponse("signup.html", {
        "request": request,
        "current_user": get_current_user(request)
    })


@app.post("/signup")
async def signup(
    request: Request,
    username: str = Form(...),
    password: str = Form(...),
    email: str = Form(""),
):
    """Handle signup"""
    username = username.strip()
    email = email.strip()

    # Validation
    if not username or len(username) < 3:
        return templates.TemplateResponse("signup.html", {
            "request": request,
            "error": "Username must be at least 3 characters",
            "current_user": None
        })

    if not password or len(password) < 6:
        return templates.TemplateResponse("signup.html", {
            "request": request,
            "error": "Password must be at least 6 characters",
            "current_user": None
        })

    # Check if username exists
    users = get_users()
    if any(u['username'] == username for u in users):
        return templates.TemplateResponse("signup.html", {
            "request": request,
            "error": "Username already taken",
            "current_user": None
        })

    # Create user
    users.append({
        'username': username,
        'password_hash': hash_password(password),
        'email': email,
        'is_admin': False,
        'created_at': datetime.utcnow().isoformat() + 'Z'
    })
    save_users(users)

    # Auto-login
    request.session['username'] = username

    return RedirectResponse(url="/", status_code=status.HTTP_303_SEE_OTHER)


@app.get("/login", response_class=HTMLResponse)
async def login_page(request: Request):
    """Login page"""
    return templates.TemplateResponse("login.html", {
        "request": request,
        "current_user": get_current_user(request)
    })


@app.post("/login")
async def login(
    request: Request,
    username: str = Form(...),
    password: str = Form(...),
):
    """Handle login"""
    users = get_users()
    user = next((u for u in users if u['username'] == username), None)

    if not user or not verify_password(password, user['password_hash']):
        return templates.TemplateResponse("login.html", {
            "request": request,
            "error": "Invalid username or password",
            "current_user": None
        })

    request.session['username'] = username
    return RedirectResponse(url="/", status_code=status.HTTP_303_SEE_OTHER)


@app.post("/logout")
async def logout(request: Request):
    """Handle logout"""
    request.session.clear()
    return RedirectResponse(url="/", status_code=status.HTTP_303_SEE_OTHER)


# ============================================================================
# Routes - Main Page
# ============================================================================

@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    """Main page with network map"""
    return templates.TemplateResponse("index.html", {
        "request": request,
        "current_user": get_current_user(request)
    })


# ============================================================================
# Routes - Startup CRUD
# ============================================================================

@app.get("/startup/new", response_class=HTMLResponse)
async def new_startup_page(request: Request, user: Dict = Depends(require_login)):
    """Add startup form"""
    fields = get_fields()
    return templates.TemplateResponse("startup_new.html", {
        "request": request,
        "current_user": user,
        "fields": fields
    })


@app.post("/startup/new")
async def create_startup(
    request: Request,
    user: Dict = Depends(require_login),
    startupName: str = Form(...),
    goalOneSentence: str = Form(...),
    websiteUrl: str = Form(""),
    canvasIdeaDescription: str = Form(...),
    fields: List[str] = Form(...),
    founder_name: str = Form(...),
    founder_linkedin: str = Form(...),
    cofounder_name: str = Form(""),
    cofounder_linkedin: str = Form(""),
    logo: Optional[UploadFile] = File(None),
):
    """Create new startup"""
    # Prepare data
    data = {
        'startupName': startupName,
        'goalOneSentence': goalOneSentence,
        'websiteUrl': websiteUrl,
        'canvasIdeaDescription': canvasIdeaDescription,
        'fields': fields,
        'founder_name': founder_name,
        'founder_linkedin': founder_linkedin,
        'cofounder_name': cofounder_name,
        'cofounder_linkedin': cofounder_linkedin,
    }

    # Validate
    errors = validate_startup_data(data)

    # Handle logo upload
    logo_path = None
    if logo:
        # Check file type
        content_type = logo.content_type
        if content_type not in ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']:
            errors.append("Logo must be PNG, JPG, or WebP")
        else:
            try:
                # Save and resize logo
                logo_filename = f"{secrets.token_hex(16)}.png"
                logo_path = LOGO_DIR / logo_filename

                # Read and process to square with padding for circular display
                img = Image.open(logo.file)
                img = process_logo_to_square(img, size=512)
                img.save(logo_path, "PNG")

                logo_path = logo_filename  # Store relative path
            except Exception as e:
                errors.append(f"Error processing logo: {str(e)}")

    # If errors, show form again
    if errors:
        all_fields = get_fields()
        return templates.TemplateResponse("startup_new.html", {
            "request": request,
            "current_user": user,
            "fields": all_fields,
            "errors": errors,
            "form_data": data
        })

    # Create startup
    startup_id = secrets.token_hex(8)
    startup = {
        'id': startup_id,
        'startupName': startupName.strip(),
        'goalOneSentence': goalOneSentence.strip(),
        'websiteUrl': websiteUrl.strip(),
        'canvasIdeaDescription': canvasIdeaDescription.strip(),
        'fields': fields,
        'founder': {
            'name': founder_name.strip(),
            'linkedinUrl': founder_linkedin.strip()
        },
        'owner_username': user['username'],
        'createdAt': datetime.utcnow().isoformat() + 'Z',
        'updatedAt': datetime.utcnow().isoformat() + 'Z',
        'position': {'x': 0, 'y': 0}  # Will be set on first drag
    }

    if cofounder_name.strip():
        startup['cofounder'] = {
            'name': cofounder_name.strip(),
            'linkedinUrl': cofounder_linkedin.strip()
        }

    if logo_path:
        startup['logoPath'] = logo_path

    # Save
    startups = get_startups()
    startups.append(startup)
    save_startups(startups)

    return RedirectResponse(url=f"/startup/{startup_id}", status_code=status.HTTP_303_SEE_OTHER)


@app.get("/startup/{startup_id}", response_class=HTMLResponse)
async def view_startup(request: Request, startup_id: str):
    """View startup details"""
    startups = get_startups()
    startup = next((s for s in startups if s['id'] == startup_id), None)

    if not startup:
        raise HTTPException(status_code=404, detail="Startup not found")

    current_user = get_current_user(request)
    can_edit = False
    if current_user:
        can_edit = startup['owner_username'] == current_user['username'] or is_admin(current_user)

    return templates.TemplateResponse("startup_detail.html", {
        "request": request,
        "current_user": current_user,
        "startup": startup,
        "can_edit": can_edit
    })


@app.get("/startup/{startup_id}/edit", response_class=HTMLResponse)
async def edit_startup_page(request: Request, startup_id: str, user: Dict = Depends(require_login)):
    """Edit startup form"""
    startups = get_startups()
    startup = next((s for s in startups if s['id'] == startup_id), None)

    if not startup:
        raise HTTPException(status_code=404, detail="Startup not found")

    # Check ownership
    if startup['owner_username'] != user['username'] and not is_admin(user):
        raise HTTPException(status_code=403, detail="Not authorized")

    fields = get_fields()
    return templates.TemplateResponse("startup_edit.html", {
        "request": request,
        "current_user": user,
        "startup": startup,
        "fields": fields
    })


@app.post("/startup/{startup_id}/edit")
async def update_startup(
    request: Request,
    startup_id: str,
    user: Dict = Depends(require_login),
    startupName: str = Form(...),
    goalOneSentence: str = Form(...),
    websiteUrl: str = Form(""),
    canvasIdeaDescription: str = Form(...),
    fields: List[str] = Form(...),
    founder_name: str = Form(...),
    founder_linkedin: str = Form(...),
    cofounder_name: str = Form(""),
    cofounder_linkedin: str = Form(""),
    logo: Optional[UploadFile] = File(None),
):
    """Update startup"""
    startups = get_startups()
    startup_idx = next((i for i, s in enumerate(startups) if s['id'] == startup_id), None)

    if startup_idx is None:
        raise HTTPException(status_code=404, detail="Startup not found")

    startup = startups[startup_idx]

    # Check ownership
    if startup['owner_username'] != user['username'] and not is_admin(user):
        raise HTTPException(status_code=403, detail="Not authorized")

    # Prepare data
    data = {
        'startupName': startupName,
        'goalOneSentence': goalOneSentence,
        'websiteUrl': websiteUrl,
        'canvasIdeaDescription': canvasIdeaDescription,
        'fields': fields,
        'founder_name': founder_name,
        'founder_linkedin': founder_linkedin,
        'cofounder_name': cofounder_name,
        'cofounder_linkedin': cofounder_linkedin,
    }

    # Validate
    errors = validate_startup_data(data)

    # Handle logo upload
    logo_path = startup.get('logoPath')
    if logo:
        content_type = logo.content_type
        if content_type not in ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']:
            errors.append("Logo must be PNG, JPG, or WebP")
        else:
            try:
                logo_filename = f"{secrets.token_hex(16)}.png"
                new_logo_path = LOGO_DIR / logo_filename

                img = Image.open(logo.file)
                img = process_logo_to_square(img, size=512)
                img.save(new_logo_path, "PNG")

                # Delete old logo
                if logo_path:
                    old_path = LOGO_DIR / logo_path
                    if old_path.exists():
                        old_path.unlink()

                logo_path = logo_filename
            except Exception as e:
                errors.append(f"Error processing logo: {str(e)}")

    # If errors, show form again
    if errors:
        all_fields = get_fields()
        return templates.TemplateResponse("startup_edit.html", {
            "request": request,
            "current_user": user,
            "startup": startup,
            "fields": all_fields,
            "errors": errors,
            "form_data": data
        })

    # Update startup
    startup['startupName'] = startupName.strip()
    startup['goalOneSentence'] = goalOneSentence.strip()
    startup['websiteUrl'] = websiteUrl.strip()
    startup['canvasIdeaDescription'] = canvasIdeaDescription.strip()
    startup['fields'] = fields
    startup['founder'] = {
        'name': founder_name.strip(),
        'linkedinUrl': founder_linkedin.strip()
    }
    startup['updatedAt'] = datetime.utcnow().isoformat() + 'Z'

    if cofounder_name.strip():
        startup['cofounder'] = {
            'name': cofounder_name.strip(),
            'linkedinUrl': cofounder_linkedin.strip()
        }
    else:
        startup.pop('cofounder', None)

    if logo_path:
        startup['logoPath'] = logo_path

    # Save
    startups[startup_idx] = startup
    save_startups(startups)

    return RedirectResponse(url=f"/startup/{startup_id}", status_code=status.HTTP_303_SEE_OTHER)


@app.post("/startup/{startup_id}/delete")
async def delete_startup(
    request: Request,
    startup_id: str,
    user: Dict = Depends(require_login)
):
    """Delete startup (admin only)"""
    if not is_admin(user):
        raise HTTPException(status_code=403, detail="Admin access required")

    startups = get_startups()
    startup_idx = next((i for i, s in enumerate(startups) if s['id'] == startup_id), None)

    if startup_idx is None:
        raise HTTPException(status_code=404, detail="Startup not found")

    startup = startups[startup_idx]

    # Delete logo if exists
    if startup.get('logoPath'):
        logo_path = LOGO_DIR / startup['logoPath']
        if logo_path.exists():
            logo_path.unlink()

    # Remove from list
    startups.pop(startup_idx)
    save_startups(startups)

    return RedirectResponse(url="/", status_code=status.HTTP_303_SEE_OTHER)


# ============================================================================
# API Routes
# ============================================================================

@app.get("/api/startups")
async def api_get_startups(
    search: Optional[str] = None,
    field: Optional[str] = None
):
    """Get all startups (with optional filters)"""
    startups = get_startups()

    # Filter by search
    if search:
        search_lower = search.lower()
        startups = [
            s for s in startups
            if search_lower in s['startupName'].lower()
            or search_lower in s.get('canvasIdeaDescription', '').lower()
        ]

    # Filter by field
    if field:
        startups = [s for s in startups if field in s.get('fields', [])]

    return startups


@app.get("/api/fields")
async def api_get_fields():
    """Get all fields"""
    return get_fields()


@app.post("/api/startups/{startup_id}/position")
async def api_update_position(
    startup_id: str,
    request: Request,
    user: Dict = Depends(require_login)
):
    """Update startup position on map"""
    data = await request.json()
    x = data.get('x', 0)
    y = data.get('y', 0)

    startups = get_startups()
    startup_idx = next((i for i, s in enumerate(startups) if s['id'] == startup_id), None)

    if startup_idx is None:
        raise HTTPException(status_code=404, detail="Startup not found")

    startup = startups[startup_idx]

    # Check ownership
    if startup['owner_username'] != user['username'] and not is_admin(user):
        raise HTTPException(status_code=403, detail="Not authorized")

    # Update position
    startup['position'] = {'x': x, 'y': y}
    startups[startup_idx] = startup
    save_startups(startups)

    return {'status': 'ok'}


@app.post("/api/fields/{field_name}/position")
async def api_update_field_position(
    field_name: str,
    request: Request,
    user: Dict = Depends(require_login)
):
    """Update field centroid position (admin only)"""
    if not is_admin(user):
        raise HTTPException(status_code=403, detail="Admin access required")

    data = await request.json()
    x = data.get('x', 0)
    y = data.get('y', 0)

    fields = get_fields()
    field_idx = next((i for i, f in enumerate(fields) if f['name'] == field_name), None)

    if field_idx is None:
        raise HTTPException(status_code=404, detail="Field not found")

    # Update position
    fields[field_idx]['x'] = x
    fields[field_idx]['y'] = y
    save_fields(fields)

    return {'status': 'ok'}


# ============================================================================
# Admin Page
# ============================================================================

@app.get("/admin", response_class=HTMLResponse)
async def admin_page(request: Request, user: Dict = Depends(require_login)):
    """Admin dashboard"""
    if not is_admin(user):
        raise HTTPException(status_code=403, detail="Admin access required")

    startups = get_startups()
    fields = get_fields()

    return templates.TemplateResponse("admin.html", {
        "request": request,
        "current_user": user,
        "startups": startups,
        "fields": fields
    })


# ============================================================================
# Startup
# ============================================================================

@app.on_event("startup")
async def startup_event():
    """Initialize app on startup"""
    print("==> Starting StartupNetwork...")
    bootstrap_admin()

    # Ensure fields.json has defaults
    fields = get_fields()
    if not fields:
        save_fields(DEFAULT_FIELDS.copy())

    print(f"==> Data directory: {DATA_DIR}")
    print(f"==> Ready at http://localhost:8000")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
