# Blyza Platform - Production Deployment Guide

## 🚀 Deploy to Vercel

### Step 1: Prepare for Production

1. **Build the project locally first** to test:
```bash
cd /Users/azzu/Downloads/emptytest/blyza-platform/client
npm run build
```

2. **Test the build**:
```bash
npm run preview
```

### Step 2: Deploy to Vercel

#### Option A: Vercel CLI (Recommended)
```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy from the client directory
cd /Users/azzu/Downloads/emptytest/blyza-platform/client
vercel

# Follow the prompts:
# - Set up and deploy? Y
# - Which scope? Your personal account
# - Link to existing project? N
# - Project name: blyza-platform
# - Directory: ./
# - Override settings? N
```

#### Option B: GitHub + Vercel Dashboard
1. **Push to GitHub** (if not already done)
2. **Go to Vercel Dashboard**: https://vercel.com/dashboard
3. **Import Project** → Connect your GitHub repo
4. **Configure**:
   - Framework: Vite
   - Root Directory: `client`
   - Build Command: `npm run build`
   - Output Directory: `dist`

### Step 3: Configure Environment Variables

In **Vercel Dashboard** → **Project Settings** → **Environment Variables**, add:

```
VITE_FIREBASE_API_KEY=AIzaSyDdakBr79jNfAjxJx8uQGso7iDwPNRPPMo
VITE_FIREBASE_AUTH_DOMAIN=blyza-platform.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://blyza-platform-default-rtdb.firebaseio.com/
VITE_FIREBASE_PROJECT_ID=blyza-platform
VITE_FIREBASE_STORAGE_BUCKET=blyza-platform.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=485718265314
VITE_FIREBASE_APP_ID=1:485718265314:web:780050a5c628ca2028bdbb
```

### Step 4: Update Firebase Auth Domain

In **Firebase Console** → **Authentication** → **Settings** → **Authorized domains**:
- Add your Vercel domain: `your-app-name.vercel.app`

### Step 5: Test Multi-User Flow

Once deployed:
1. **Manager**: Open `https://your-app.vercel.app` → Sign up as Manager → Create game
2. **Employee 1**: Open in incognito/different browser → Sign up as Employee → Join game
3. **Employee 2**: Open on different device/browser → Sign up as Employee → Join game
4. **Test real-time**: All players should see updates in real-time!

## 🔧 Vercel Configuration File

Create this file in your client directory:
