# 🔥 FIREBASE SETUP REQUIRED - Action Items for You

## 1. Firebase Console Setup (YOU MUST DO THIS)

### Step 1: Create Firebase Project
1. Go to https://console.firebase.google.com/
2. Click "Create a project"
3. Name it "blyza-platform" or similar
4. Enable Google Analytics (optional)

### Step 2: Enable Authentication
1. In Firebase Console → Authentication → Get Started
2. Go to "Sign-in method" tab
3. Enable these providers:
   - ✅ **Email/Password** (required)
   - ✅ **Google** (recommended for easier sign-up)

### Step 3: Create Firestore Database
1. In Firebase Console → Firestore Database → Create database
2. Start in **test mode** for now (we'll secure later)
3. Choose your region (closest to your users)

### Step 4: Enable Realtime Database
1. In Firebase Console → Realtime Database → Create database
2. Start in **test mode** for now
3. Choose your region

### Step 5: Get Your Config Keys
1. Go to Project Settings (gear icon)
2. Scroll down to "Your apps"
3. Click "Add app" → Web app (</>) 
4. Register app name: "blyza-client"
5. Copy the config object that looks like:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  databaseURL: "https://your-project-default-rtdb.firebaseio.com/",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};
```

## 2. Update Your .env File

Replace the contents of `/client/.env` with:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com/
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=your-app-id

# Analytics (Optional)
VITE_N8N_WEBHOOK_URL=your-n8n-webhook-if-you-have-one
```

## 3. Firebase Security Rules (CRITICAL)

### Firestore Rules
In Firebase Console → Firestore → Rules, replace with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Users can read other users' basic info (for game sessions)
    match /users/{userId} {
      allow read: if request.auth != null;
    }
  }
}
```

### Realtime Database Rules  
In Firebase Console → Realtime Database → Rules, replace with:

```json
{
  "rules": {
    "gameSessions": {
      "$sessionId": {
        ".read": "auth != null",
        ".write": "auth != null && (
          !data.exists() || 
          data.child('managerId').val() == auth.uid ||
          data.child('players').child(auth.uid).exists()
        )",
        "players": {
          "$playerId": {
            ".write": "auth != null && $playerId == auth.uid"
          }
        },
        "gameState": {
          ".write": "auth != null && (
            root.child('gameSessions').child($sessionId).child('managerId').val() == auth.uid ||
            root.child('gameSessions').child($sessionId).child('players').child(auth.uid).exists()
          )"
        }
      }
    },
    "presence": {
      "$userId": {
        ".read": "auth != null",
        ".write": "auth != null && $userId == auth.uid"
      }
    }
  }
}
```

## 4. Test Your Setup

After completing the above:

1. **Restart your frontend**: `npm run dev`
2. **Open**: http://localhost:3000
3. **Try signing up** as a new user
4. **Check Firebase Console** → Authentication → Users (should see your new user)
5. **Check Firestore** → Data → users collection (should see user profile)

## 5. Common Issues & Solutions

### Issue: "Firebase not initialized"
- ✅ Check all env variables are set correctly
- ✅ Restart dev server after changing .env

### Issue: "Permission denied" 
- ✅ Make sure you published the security rules
- ✅ Check that Authentication is enabled

### Issue: "Network error"
- ✅ Check your Firebase project is active
- ✅ Verify the databaseURL in your config

---

## ⚠️ IMMEDIATE ACTION REQUIRED:

1. **Set up Firebase project** (15 minutes)
2. **Update your .env file** with the config keys
3. **Set the security rules** for Firestore and RTDB
4. **Restart the dev server**

Without these steps, the app cannot authenticate users or sync game data!

Let me know when you've completed these steps and I'll help debug any issues.
