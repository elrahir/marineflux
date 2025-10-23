# Environment Variables Template

Create a `.env.local` file in the root directory with the following variables:

```env
# Firebase Configuration
# Get these values from Firebase Console > Project Settings > Your apps > SDK setup and configuration

NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id_here
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id_here
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id_here
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id_here

# Firebase Admin SDK (Optional - for server-side operations)
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"..."}
```

## How to Get Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project or select existing one
3. Go to Project Settings (gear icon)
4. Scroll down to "Your apps" section
5. Click on the web app icon (</>)
6. Copy the configuration values
7. Enable Authentication > Email/Password
8. Create Firestore Database
9. Deploy the security rules from `firestore.rules` and `storage.rules`

## Important Notes

- Never commit `.env.local` to version control
- All Firebase client-side variables must start with `NEXT_PUBLIC_`
- The `.env.local` file is already added to `.gitignore`



