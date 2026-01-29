# StartupNetwork - Simple Python Edition

A lightweight, reliable web platform for Startupbootcamp members to share and discover startups. Built with FastAPI and JSON file storage - no database required!

## What Changed?

This is a **simplified rewrite** of the original Next.js application. The old version was over-engineered with:
- Next.js + TypeScript + Prisma + Database
- Complex authentication system
- Non-functional add/edit forms
- 467MB+ of node_modules

The new version is:
- **Simple**: Pure Python + FastAPI + Jinja2 templates
- **Lightweight**: ~5MB total dependencies
- **Reliable**: No database migrations, no build steps
- **Functional**: All features actually work!

## Features

- ✅ **Add Startup**: Simple form with all required fields
- ✅ **Edit with Token**: Secure edit tokens (no complex auth)
- ✅ **Logo Upload**: Automatic resize and optimization
- ✅ **Bubble Visualization**: Interactive field-based grouping
- ✅ **List/Map Toggle**: Two view modes
- ✅ **Search & Filter**: Real-time filtering by name and fields
- ✅ **Field Management**: Predefined + custom fields (max 2 words)
- ✅ **Founder Profiles**: Founder + optional co-founder with LinkedIn
- ✅ **Validation**: Server-side validation for all inputs
- ✅ **Responsive Design**: Works on desktop and mobile

## Tech Stack

- **Backend**: FastAPI 0.109
- **Templates**: Jinja2 with Tailwind CSS (CDN)
- **Storage**: JSON files (`data/startups.json`, `data/fields.json`)
- **Images**: Pillow for logo processing
- **No Database**: Just files!

## Installation & Setup

### Prerequisites

- Python 3.8+
- pip

### Step 1: Install Dependencies

```bash
pip install -r requirements.txt
```

This installs:
- `fastapi` - Web framework
- `uvicorn` - ASGI server
- `jinja2` - Template engine
- `pillow` - Image processing
- `python-multipart` - File upload support
- `python-dotenv` - Environment variables

### Step 2: Configure Environment

Copy the example environment file:

```bash
copy .env.example .env
```

Edit `.env` and set:

```env
# Generate a random salt (run this in Python):
# python -c "import secrets; print(secrets.token_hex(32))"
TOKEN_SALT=your-random-salt-here

# Optional admin password for editing any startup
ADMIN_PASSWORD=admin123

# Server settings
HOST=0.0.0.0
PORT=8000
```

**Important**: Change `TOKEN_SALT` to a random value in production!

### Step 3: Verify Data Files

The following files should exist with seed data:
- `data/startups.json` - 10 sample startups
- `data/fields.json` - 13 predefined fields
- `data/logos/` - Empty directory for uploads

These are created automatically by the app if missing.

### Step 4: Run the Application

```bash
python app.py
```

Or using uvicorn directly:

```bash
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

The app will be available at: **http://localhost:8000**

## How It Works

### Adding a Startup

1. Go to http://localhost:8000/add
2. Fill in all required fields:
   - Startup name (2-100 chars)
   - Goal one sentence (10-140 chars)
   - Website URL (optional)
   - Description (100-500 chars)
   - Select 1-2 field tags
   - Upload logo (optional, PNG/JPG/WebP)
   - Founder name + LinkedIn URL
   - Co-founder (optional, but both name and LinkedIn required if provided)
3. Submit the form
4. **SAVE YOUR EDIT TOKEN!** It's shown once and cannot be recovered

### Editing a Startup

1. Go to the startup detail page
2. Click "Edit"
3. Enter your edit token
4. Make changes and save

**Admin Access**: If you know the admin password (from `.env`), you can edit any startup without a token.

### Data Storage

All data is stored in JSON files:

```
data/
├── startups.json      # Array of startup records
├── fields.json        # Array of field tags
└── logos/            # Uploaded logos
    ├── <random>.png
    └── ...
```

**Startup Record Structure:**
```json
{
  "id": "unique-id",
  "startupName": "StartupName",
  "goalOneSentence": "Short goal description",
  "websiteUrl": "https://...",
  "canvasIdeaDescription": "Longer description",
  "fields": ["AI", "Health"],
  "founder": {
    "name": "John Doe",
    "linkedinUrl": "https://linkedin.com/in/johndoe"
  },
  "cofounder": {
    "name": "Jane Smith",
    "linkedinUrl": "https://linkedin.com/in/janesmith"
  },
  "logoPath": "abc123.png",
  "editTokenHash": "sha256-hash",
  "createdAt": "2024-01-15T10:00:00Z",
  "updatedAt": "2024-01-15T10:00:00Z"
}
```

## Security

### Edit Tokens

- Generated using `secrets.token_urlsafe(32)` (256-bit entropy)
- Stored as SHA-256 hash with salt
- Never stored in plain text
- Shown once to user after creation

### Admin Password

- Simple shared password from `.env`
- Can be used to edit any startup
- Optional - remove from `.env` to disable

### Input Validation

- All inputs validated server-side
- URL validation for websites and LinkedIn
- File type validation for logos
- Character limits enforced
- XSS protection via Jinja2 auto-escaping

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Home page with bubble visualization |
| GET | `/add` | Add startup form |
| POST | `/add` | Create startup (returns token) |
| GET | `/edit/{id}` | Edit startup form (requires token) |
| POST | `/edit/{id}` | Update startup |
| GET | `/startup/{id}` | View startup details |
| GET | `/api/startups` | Get all startups (JSON) |
| GET | `/api/fields` | Get all fields (JSON) |
| POST | `/api/fields` | Add custom field |

### Query Parameters

- `/api/startups?search=query` - Search by name/description
- `/api/startups?field=AI` - Filter by field tag

## File Structure

```
startupnetwork/
├── app.py                  # Main FastAPI application
├── requirements.txt        # Python dependencies
├── .env                    # Environment variables (create this)
├── .env.example           # Environment template
├── NEW_README.md          # This file
├── data/                  # Data storage
│   ├── startups.json      # Startup records
│   ├── fields.json        # Field tags
│   └── logos/            # Uploaded logos
├── templates/             # Jinja2 templates
│   ├── base.html          # Base layout
│   ├── index.html         # Home page with visualization
│   ├── add.html           # Add startup form
│   ├── edit.html          # Edit startup form
│   ├── token_display.html # Token shown after creation
│   └── startup_detail.html # Startup detail page
└── static/                # Static files (empty, using CDN)
```

## Deployment

### Local Network

Already accessible on your local network at `http://<your-ip>:8000`

### Production Deployment

**Option 1: Simple Server**
```bash
# Install on server
pip install -r requirements.txt

# Run with uvicorn
uvicorn app:app --host 0.0.0.0 --port 8000

# Or run in background
nohup python app.py &
```

**Option 2: With Systemd (Linux)**

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
ExecStart=/path/to/venv/bin/uvicorn app:app --host 0.0.0.0 --port 8000

[Install]
WantedBy=multi-user.target
```

Then:
```bash
sudo systemctl enable startupnetwork
sudo systemctl start startupnetwork
```

**Option 3: Docker**

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["python", "app.py"]
```

```bash
docker build -t startupnetwork .
docker run -p 8000:8000 -v ./data:/app/data startupnetwork
```

**Option 4: Cloud Platforms**

- **Railway**: Just connect repo and deploy
- **Render**: Use `python app.py` as start command
- **DigitalOcean App Platform**: Auto-detects FastAPI
- **AWS/GCP**: Use Docker option above

### Nginx Reverse Proxy

```nginx
server {
    listen 80;
    server_name startupnetwork.yourdomain.com;

    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

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
Change port in `.env` or:
```bash
python app.py --port 8001
```

### Lost edit token
- Use admin password if configured
- Or manually edit `data/startups.json` (not recommended in production)

## Maintenance

### Backup Data
```bash
# Backup entire data directory
cp -r data/ data_backup_$(date +%Y%m%d)/

# Or just the JSON files
cp data/*.json backups/
```

### Reset Data
```bash
# Delete startups
rm data/startups.json

# Delete uploaded logos
rm data/logos/*

# App will recreate files on restart
```

### Add Admin User
Edit `.env`:
```env
ADMIN_PASSWORD=your-secure-password
```

Restart the app.

## Comparison: Old vs New

| Feature | Old (Next.js) | New (Python) |
|---------|--------------|--------------|
| Dependencies | 467MB | 5MB |
| Setup time | 10+ minutes | 2 minutes |
| Add startup | Broken | ✅ Works |
| Edit startup | Broken | ✅ Works |
| Auth system | LinkedIn OAuth (broken) | Simple tokens |
| Database | SQLite + Prisma | JSON files |
| Build required | Yes | No |
| Logo upload | Missing | ✅ Works |
| Visualization | Working | ✅ Working |

## Support & Development

### Adding Features

The codebase is simple and well-commented. Key files:
- `app.py` - All backend logic
- `templates/index.html` - Main visualization
- `templates/add.html` - Add form

### Common Modifications

**Change field limit from 2 to 3:**
```python
# In app.py, line ~160
elif len(fields) > 3:  # Changed from 2
    errors.append("Maximum 3 field tags allowed")
```

**Add more predefined fields:**
```python
# In app.py, line ~50
PREDEFINED_FIELDS = [
    # ... existing fields ...
    {"name": "YourField", "color": "#FF5733"}
]
```

**Change character limits:**
```python
# In app.py, validate_startup_data() function
# Example: increase description max to 1000
elif len(description.strip()) > 1000:
    errors.append("Description too long (max 1000 characters)")
```

## License

MIT - Feel free to modify and use as needed.

---

**Built for Startupbootcamp** | Simple, reliable, and actually works!
