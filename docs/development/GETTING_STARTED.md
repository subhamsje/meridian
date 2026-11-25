# MERIDIAN — Getting Started Guide

## 1. Prerequisites
- **Node.js:** v18.17+ or v20+ (`node -v`)
- **Package Manager:** `pnpm` v9+ (`corepack enable && corepack prepare pnpm@latest --activate`)
- **Python:** Python 3.10 or 3.11 (`python3 --version`)
- **System Tools:** `git`, `curl`

---

## 2. Quickstart: 3-Minute Setup

### Step 1: Clone the Repository
```bash
git clone https://github.com/subhamsje/meridian.git
cd meridian
```

### Step 2: Install Backend Dependencies
```bash
cd apps/api
pip install -r requirements.txt
```

### Step 3: Install Frontend Dependencies
```bash
cd ../web
pnpm install
```

### Step 4: Run the Development Servers
In Terminal 1 (Backend API):
```bash
cd apps/api
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

In Terminal 2 (Frontend Web):
```bash
cd apps/web
pnpm dev -p 3000
```

### Step 5: Open the Application
Navigate to [http://localhost:3000](http://localhost:3000) for the Executive Landing Page, or [http://localhost:3000/app?demo=true](http://localhost:3000/app?demo=true) to immediately launch the institutional demonstration workstation.
