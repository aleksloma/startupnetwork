# StartupNetwork

A simple, reliable web platform for Startupbootcamp members to share and discover startups. Built with FastAPI and JSON file storage - no database required!

## Features

- **User Authentication** - Simple username/password signup and login with bcrypt password hashing
- **Startup Profiles** - Create and manage your startup with detailed information
- **Ownership Model** - Only startup owners (and admins) can edit their startups
- **Founder Management** - Add founder and co-founder with LinkedIn profiles
- **Field Tags** - 7 default fields (AI, Education, Sport, Security, Food, Media, Data) + custom fields
- **Interactive Network Map** - Drag-and-drop visual map with field centroids
- **Search & Filter** - Find startups by name, description, or field tags
- **Admin Controls** - Admin can delete any startup and drag any icon
- **Logo Upload** - Automatic resize and optimization of startup logos
- **Responsive Design** - Works on desktop and mobile devices

## Tech Stack

- **Backend**: FastAPI 0.109+
- **Templates**: Jinja2 with Tailwind CSS (CDN)
- **Auth**: Session-based with secure signed cookies
- **Passwords**: bcrypt hashing
- **Storage**: JSON files (no database!)
- **Images**: Pillow for logo processing

## Installation

### Prerequisites

- Python 3.8+
- pip

### Step 1: Install Dependencies

```bash
pip install -r requirements.txt
```

This installs:
- fastapi - Web framework
- uvicorn - ASGI server
- jinja2 - Template engine
- pillow - Image processing
- python-multipart - File upload support
- python-dotenv - Environment variables
- bcrypt - Password hashing
- itsdangerous - Session cookies
- starlette - ASGI toolkit

### Step 2: Configure Environment

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and set your values:

```env
# Session Security (Generate with: python -c "import secrets; print(secrets.token_hex(32))")
SESSION_SECRET=your-random-secret-here-change-this-in-production

# Admin User (created automatically on first run)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```

**Important**: Change `SESSION_SECRET` to a random value in production!

### Step 3: Run the Application

```bash
python main.py
```

Or using uvicorn directly:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The app will be available at: **http://localhost:8000**

On first run, the admin user is automatically created.

## Project Structure

```
startupnetwork/
├── main.py                 # Main FastAPI application
├── requirements.txt        # Python dependencies
├── .env                    # Environment variables (create this)
├── .env.example            # Environment template
├── README.md               # This file
├── data/                   # Data storage (created automatically)
│   ├── users.json          # User accounts
│   ├── startups.json       # Startup records (includes seed data)
│   ├── fields.json         # Field tags (auto-populated with defaults)
│   └── logos/              # Uploaded logos
├── templates/              # Jinja2 templates
│   ├── base.html           # Base layout
│   ├── index.html          # Main page with network map
│   ├── signup.html         # Signup form
│   ├── login.html          # Login form
│   ├── startup_new.html    # Add startup form
│   ├── startup_edit.html   # Edit startup form
│   └── startup_detail.html # Startup detail page
├── static/                 # Static files
│   └── network.jpg         # Background image for map
└── old_unused/             # Old implementation (ignored)
```

## How It Works

### Authentication

1. Users sign up with username/password (email optional)
2. Passwords are hashed with bcrypt
3. Sessions are stored in signed cookies
4. Admin user is bootstrapped from environment variables

### Adding a Startup

1. Login/signup required
2. Fill form with all required fields
3. Upload optional logo (auto-resized to 512px)
4. Startup is owned by the user who created it
5. Only owner or admin can edit/drag it on map

### Network Map

The main page shows an interactive network map:

- **Field Centroids**: 7 colored anchor points for each default field
- **Startup Icons**: Circular icons with logos or initials
- **Draggable**: Owners/admin can drag their startup icons
- **Positioned**: Startups auto-position near their primary field centroid
- **Modal Details**: Click any startup to see full details
- **Search/Filter**: Real-time search and field filtering

### Data Storage

All data is stored in JSON files:

```json
// data/users.json
[
  {
    "username": "admin",
    "password_hash": "bcrypt-hash",
    "email": "",
    "is_admin": true,
    "created_at": "2026-01-28T12:00:00Z"
  }
]

// data/startups.json
[
  {
    "id": "unique-id",
    "startupName": "MyStartup",
    "goalOneSentence": "Short goal description",
    "websiteUrl": "https://example.com",
    "canvasIdeaDescription": "Longer description",
    "fields": ["AI", "Education"],
    "founder": {
      "name": "John Doe",
      "linkedinUrl": "https://linkedin.com/in/johndoe"
    },
    "cofounder": {
      "name": "Jane Smith",
      "linkedinUrl": "https://linkedin.com/in/janesmith"
    },
    "logoPath": "abc123.png",
    "owner_username": "user1",
    "createdAt": "2026-01-28T12:00:00Z",
    "updatedAt": "2026-01-28T12:00:00Z",
    "position": {"x": 50, "y": 30}
  }
]

// data/fields.json
[
  {"name": "AI", "color": "#3B82F6"},
  {"name": "Education", "color": "#10B981"},
  ...
]
```

## Validation Rules

- **Startup Name**: 2-100 characters
- **Goal**: Max 140 characters
- **Description**: 100-500 characters
- **Website URL**: Valid URL (optional)
- **Fields**: Select 1-2 tags
- **Founder**: Name + LinkedIn URL required
- **Co-Founder**: Optional, but both name and LinkedIn required if provided
- **LinkedIn URLs**: Must include "linkedin.com"
- **Custom Fields**: Max 2 words, case-insensitive deduplication
- **Logo**: PNG/JPG/WebP only, auto-resized to 512px

## API Endpoints

### Pages (HTML)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Main page with network map |
| GET | `/signup` | Signup form |
| POST | `/signup` | Create account |
| GET | `/login` | Login form |
| POST | `/login` | Authenticate user |
| POST | `/logout` | End session |
| GET | `/startup/new` | Add startup form (login required) |
| POST | `/startup/new` | Create startup |
| GET | `/startup/{id}` | View startup details |
| GET | `/startup/{id}/edit` | Edit form (owner/admin only) |
| POST | `/startup/{id}/edit` | Update startup |
| POST | `/startup/{id}/delete` | Delete startup (admin only) |

### API (JSON)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/startups` | List all startups (with optional search/filter) |
| GET | `/api/fields` | List all field tags |
| POST | `/api/fields` | Add custom field (login required) |
| POST | `/api/startups/{id}/position` | Update x,y position (owner/admin only) |

## Default Fields

The platform comes with 7 predefined fields, each with a distinct color:

1. **AI** - Blue (#3B82F6)
2. **Education** - Green (#10B981)
3. **Sport** - Amber (#F59E0B)
4. **Security** - Red (#EF4444)
5. **Food** - Purple (#8B5CF6)
6. **Media** - Pink (#EC4899)
7. **Data** - Cyan (#06B6D4)

Users can add custom fields (max 2 words each).

## Seed Data

The platform includes 8 seed startups covering different fields:

- AI Health Assistant (AI, Data)
- EduTech Plus (Education, AI)
- FitPro Athletics (Sport)
- SecureCloud (Security, Data)
- GreenBite (Food)
- StreamVerse (Media)
- DataInsights Pro (Data, AI)
- FinLearn (Education)

## Security

- **Password Hashing**: bcrypt with salt
- **Session Cookies**: Signed with SESSION_SECRET
- **Input Validation**: Server-side validation for all inputs
- **XSS Protection**: Jinja2 auto-escaping
- **File Upload**: Type validation and size limits
- **Ownership Checks**: Only owners/admin can modify startups

## Deployment

### Option 1: Simple Server

```bash
# Install on server
pip install -r requirements.txt

# Run with uvicorn
uvicorn main:app --host 0.0.0.0 --port 8000

# Or run in background
nohup python main.py &
```

### Option 2: With Systemd (Linux)

Create `/etc/systemd/system/startupnetwork.service`:

```ini
[Unit]
Description=StartupNetwork
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/startupnetwork
Environment="PATH=/path/to/venv/bin"
ExecStart=/path/to/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000

[Install]
WantedBy=multi-user.target
```

Then:

```bash
sudo systemctl enable startupnetwork
sudo systemctl start startupnetwork
```

### Option 3: Docker

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["python", "main.py"]
```

```bash
docker build -t startupnetwork .
docker run -p 8000:8000 -v ./data:/app/data startupnetwork
```

### Option 4: Cloud Platforms

- **Railway**: Just connect repo and deploy
- **Render**: Use `python main.py` as start command
- **DigitalOcean App Platform**: Auto-detects FastAPI
- **AWS/GCP**: Use Docker option above

## Troubleshooting

### "Module not found" error
```bash
pip install -r requirements.txt
```

### "Permission denied" on data directory
```bash
chmod -R 755 data/
```

### "Port already in use"
Change port in environment or:
```bash
python main.py --port 8001
```

### Admin user not created
Check `.env` file has correct `ADMIN_USERNAME` and `ADMIN_PASSWORD`, then restart the app.

## Maintenance

### Backup Data
```bash
# Backup entire data directory
cp -r data/ data_backup_$(date +%Y%m%d)/
```

### Reset Data
```bash
# Delete all data
rm data/users.json data/startups.json
rm data/logos/*

# App will recreate files with seed data on restart
```

## Acceptance Criteria

- ✅ No hero section - map starts immediately
- ✅ Adding/editing requires login
- ✅ Only owner/admin can edit and drag position
- ✅ Admin can delete any startup
- ✅ Default fields: AI, Education, Sport, Security, Food, Media, Data
- ✅ Centroid anchors visible in different colors with labels
- ✅ network.jpg used as background
- ✅ Footer year is 2026
- ✅ Everything runs locally with uvicorn and JSON storage

## License

MIT - Feel free to modify and use as needed.

---

**© 2026 StartupNetwork - Built for Startupbootcamp**
