# Supabase Configuration - Complete Guide

**For Development, Staging, and Production environments**

---

## 🎯 Quick Summary

| Environment | Method | File | Secure? |
|-------------|--------|------|---------|
| **Local Development** | .env file (manual) | `.env` | ✅ Yes (gitignored) |
| **Development (Team)** | .env + config_helper.py | `.env` | ✅ Yes |
| **Staging** | Environment variables | Environment vars | ✅ Yes |
| **Production** | Environment variables | Environment vars | ✅ Yes |

---

## 📁 Setup Options

### Option 1: Local Development (Easiest)

**For: Developing locally on your machine**

#### Step 1: Create .env file

```bash
# Copy the example:
cp .env.example .env

# Or create manually:
# .env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

#### Step 2: Use config_helper.py

```bash
# Interactive setup
python3 config_helper.py setup

# Validate credentials
python3 config_helper.py validate

# Inject into supabase-config.js
python3 config_helper.py inject
```

#### Step 3: Start developing

```bash
python3 -m http.server 8000
```

**Security:**
- ✅ .env is gitignored
- ✅ Credentials never committed
- ✅ Local only
- ✅ Safe for team

---

### Option 2: Manual Configuration (No Setup Script)

**For: Quick setup or specific environments**

#### Step 1: Get credentials from Supabase

1. Go to https://app.supabase.com
2. Select your project
3. Click **Settings** → **API**
4. Copy:
   - **Project URL** (looks like https://xxxxx.supabase.co)
   - **anon public key** (starts with eyJ...)

#### Step 2: Edit supabase-config.js

```javascript
// src/js/supabase-config.js

const SUPABASE_URL = "https://your-project.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";
```

Replace the placeholders with actual values.

#### Step 3: Test

Open browser and check console:
```javascript
console.log(window.supabaseConfig.SUPABASE_URL);  // Should show your URL
console.log(window.supabaseConfig.SUPABASE_ANON_KEY);  // Should show your key
```

**Security Note:** Don't commit this file with real credentials!

---

### Option 3: Team Development (Shared .env)

**For: Team working on same project**

#### Setup on First Developer's Machine

```bash
# Developer 1
python3 config_helper.py setup
# Adds credentials
```

#### Share With Team

**Important:** Never commit `.env`!

Instead, share credentials via:
- [ ] Password manager (recommended)
- [ ] Secure private message
- [ ] Shared docs (auth-protected)

Each team member:
```bash
# Developer 2, 3, etc.
python3 config_helper.py setup
# Each person enters same credentials locally
```

---

### Option 4: Production Deployment

**For: Deploying to live server**

#### Using Environment Variables (Recommended)

Different platforms handle this differently:

<details>
<summary><b>Deploy to Vercel</b></summary>

1. Go to Project Settings → Environment Variables
2. Add:
   ```
   VITE_SUPABASE_URL = https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY = your-anon-key
   ```
3. Redeploy
4. Your app automatically uses environment variables

**To use in code:**
```javascript
// supabase-config.js
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
```

</details>

<details>
<summary><b>Deploy to Netlify</b></summary>

1. Netlify dashboard → Site settings → Build & deploy → Environment
2. Add variables:
   ```
   VITE_SUPABASE_URL = https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY = your-anon-key
   ```
3. Redeploy

</details>

<details>
<summary><b>Deploy to Traditional Server (cPanel, etc.)</b></summary>

Option A: Use deployment platform's env vars
```bash
# In deployment script:
export VITE_SUPABASE_URL="https://your-project.supabase.co"
export VITE_SUPABASE_ANON_KEY="your-anon-key"
# Then update supabase-config.js
```

Option B: Create production config file
```javascript
// src/js/supabase-config.production.js
// Only on production server, not in Git
const SUPABASE_URL = "https://your-project.supabase.co";
const SUPABASE_ANON_KEY = "your-anon-key";
```

</details>

<details>
<summary><b>Deploy to Docker</b></summary>

1. Add to Dockerfile:
```dockerfile
ENV VITE_SUPABASE_URL=https://your-project.supabase.co
ENV VITE_SUPABASE_ANON_KEY=your-anon-key
```

2. Or pass at runtime:
```bash
docker run -e VITE_SUPABASE_URL="..." -e VITE_SUPABASE_ANON_KEY="..." app
```

</details>

#### Current State (Static HTML)

For now, your app is vanilla HTML/JS without build process:

```javascript
// Credentials stored directly in supabase-config.js
const SUPABASE_URL = "https://your-project.supabase.co";
const SUPABASE_ANON_KEY = "your-anon-key";
```

To use env vars, you'd need:
- [ ] Build step (Vite, Webpack, etc.) - future enhancement
- [ ] OR Server-side rendering to inject values
- [ ] OR Dynamic config endpoint

**For now:** Just use supabase-config.js with credentials injected via:
```bash
python3 config_helper.py inject
```

---

## 🔐 Security Best Practices

### ✅ DO

- [ ] Store `.env` locally (gitignored)
- [ ] Use environment variables for production
- [ ] Never commit real credentials to Git
- [ ] Rotate keys periodically
- [ ] Use .env.example as template
- [ ] Different keys per environment

### ❌ DON'T

- [ ] Commit .env to Git
- [ ] Hardcode credentials in JavaScript
- [ ] Share credentials via unencrypted channels
- [ ] Use development keys in production
- [ ] Store credentials in version control

---

## 📋 Configuration Files

### .env (Development)
```ini
# This file is gitignored
# Contains YOUR credentials
# Never commit!

VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### .env.example (Template)
```ini
# This file IS committed to Git
# Shows team what credentials are needed
# Developers copy to .env and fill in

VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### .gitignore (Security)
```
# Never commit credentials
.env
.env.local
.env.*.local
```

### supabase-config.js (App Initialization)
```javascript
// This file gets credentials from .env or environment
// After setup, contains real values
// In Git with placeholder values initially

const SUPABASE_URL = "https://your-project.supabase.co";
const SUPABASE_ANON_KEY = "your-anon-key";
```

---

## 🛠️ Helper Scripts

### config_helper.py

Run in project root:

```bash
# Initial setup (interactive)
python3 config_helper.py setup

# Verify credentials configured
python3 config_helper.py validate

# Inject .env values into supabase-config.js
python3 config_helper.py inject
```

### What config_helper.py Does:
1. **setup:** Prompts for credentials, creates .env
2. **validate:** Checks .env is properly configured
3. **inject:** Updates supabase-config.js with credentials

---

## 🚀 Typical Workflow

### First Time Setup

```bash
# 1. Copy example
cp .env.example .env

# 2. Add your credentials (manual or with script)
python3 config_helper.py setup

# 3. Validate
python3 config_helper.py validate

# 4. Inject into app
python3 config_helper.py inject

# 5. Start developing
python3 -m http.server 8000

# 6. Open browser
# http://localhost:8000
```

### For Team Members

```bash
# Team member gets code from Git
git clone <repo>
cd vivarta-milestones

# Create their own .env
python3 config_helper.py setup
# Enter shared credentials (or different credentials)

# Validate and inject
python3 config_helper.py validate
python3 config_helper.py inject

# Ready to go!
python3 -m http.server 8000
```

### For Production

```bash
# In GitHub Actions, Docker, or deployment platform:
echo "SUPABASE_URL=$VITE_SUPABASE_URL" > .env
echo "SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY" >> .env
python3 config_helper.py inject

# OR manually update supabase-config.js with production credentials
# Deploy updated app
```

---

## 🔍 Troubleshooting

### "Credentials not working"

1. Check they're correct in Supabase dashboard
2. Verify no extra spaces:
```javascript
// ❌ WRONG
const SUPABASE_URL = "https://your-project.supabase.co ";

// ✅ RIGHT
const SUPABASE_URL = "https://your-project.supabase.co";
```

3. Test connection:
```javascript
// In browser console:
await window.supabaseConfig.testConnection();
// Should return: true
```

### ".env file not found"

```bash
# Create it:
cp .env.example .env

# Or run setup:
python3 config_helper.py setup
```

### "config_helper.py not working"

Ensure you're in project root:
```bash
cd /path/to/vivarta-milestones
python3 config_helper.py setup
```

---

## 📊 Configuration Matrix

| Environment | Storage | Method | Security | Team | Automatic |
|-------------|---------|--------|----------|------|-----------|
| Local Dev | File (.env) | Manual or Script | ✅ High | ✅ Yes | ✅ Yes |
| Remote Dev | Env Vars | Platform UI | ✅ High | ✅ Yes | ❌ No |
| Staging | Env Vars | CI/CD | ✅ High | ✅ Yes | ✅ Yes |
| Production | Env Vars | Platform/CI | ✅ High | ✅ Yes | ✅ Yes |

---

## ✅ Setup Verification

After configuration, verify everything works:

```javascript
// In browser console:
console.log("1. Config loaded:", !!window.supabaseConfig);
console.log("2. URL set:", window.supabaseConfig.SUPABASE_URL);
console.log("3. Key set:", window.supabaseConfig.SUPABASE_ANON_KEY?.length > 0);
console.log("4. Connection test:", await window.supabaseConfig.testConnection());

// All should be true/positive
```

---

## 📚 Related Files

- `.env.example` - Template (commit to Git)
- `.env` - Local secrets (gitignored, don't commit)
- `.gitignore` - Ignore rules (prevents accidental commits)
- `config_helper.py` - Setup automation
- `src/js/supabase-config.js` - Used by app

---

**Last Updated:** March 21, 2026  
**Status:** ✅ Production Ready  
**Version:** 1.0
