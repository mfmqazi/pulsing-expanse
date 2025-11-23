# Firebase Setup Instructions

## Prerequisites
- Node.js installed
- Firebase account (free tier is fine)

## Setup Steps

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add Project" or use existing project
3. Follow the prompts to create your project

### 2. Enable Authentication
1. In Firebase Console, go to **Build > Authentication**
2. Click "Get Started"
3. Click on "Email/Password" provider
4. Enable it and save

### 3. Enable Firestore Database
1. In Firebase Console, go to **Build > Firestore Database**
2. Click "Create database"
3. Choose "Start in test mode" (for development)
4. Select a location closest to you
5. Click "Enable"

### 4. Get Firebase Configuration
1. In Firebase Console, go to **Project Settings** (gear icon)
2. Scroll down to "Your apps"
3. Click the web icon (`</>`) to add a web app
4. Register your app with a nickname (e.g., "Al-Hafiz")
5. Copy the `firebaseConfig` object

### 5. Update Configuration in Code
1. Open `src/firebase.js`
2. Replace the placeholder `firebaseConfig` with your actual config from step 4
3. Save the file

### 6. Security Rules (Production)
When ready for production, update Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      // Users can only read/write their own data
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 7. Deploy
Once Firebase is configured:
```bash
npm run build
npm run deploy
```

## Environment Variables (Optional - Recommended for Production)
Create a `.env` file in the root:
```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

Then update `firebase.js` to use these:
```javascript
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};
```

## Notes
- Firebase free tier includes:
  - 50K reads/day
  - 20K writes/day
  - 1GB storage
- This should be more than enough for personal use
- You'll need to add `.env` to `.gitignore` to keep keys private
