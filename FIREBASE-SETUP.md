# Firebase Setup Guide for MarineFlux

## Step 1: Create Firebase Project

1. Go to https://console.firebase.google.com
2. Click "Add Project"
3. Enter project name: `marineflux` (or your preferred name)
4. Enable/Disable Google Analytics (optional)
5. Click "Create Project"

## Step 2: Register Web App

1. In Firebase Console, click on the web icon (`</>`)
2. Register app nickname: `MarineFlux Web`
3. Check "Also set up Firebase Hosting" (optional)
4. Click "Register app"
5. Copy the Firebase configuration (firebaseConfig object)

## Step 3: Enable Authentication

1. In Firebase Console sidebar, click "Authentication"
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Enable "Email/Password"
5. Click "Save"

## Step 4: Create Firestore Database

1. In Firebase Console sidebar, click "Firestore Database"
2. Click "Create database"
3. Select "Start in production mode"
4. Choose your Cloud Firestore location (closest to your users)
5. Click "Enable"

## Step 5: Set Up Firestore Collections

### Initial Collections Structure

Create these collections manually or let the app create them:

#### users
```javascript
{
  uid: "string",
  email: "string",
  role: "admin" | "shipowner" | "supplier",
  companyName: "string",
  createdAt: timestamp,
  createdBy: "string"
}
```

#### shipowners
```javascript
{
  uid: "string",
  vessels: [],
  activeOrders: 0,
  totalSpent: 0
}
```

#### suppliers
```javascript
{
  uid: "string",
  companyName: "string",
  serviceTypes: [],
  rating: 0,
  reviewCount: 0,
  totalOrders: 0,
  isVerified: false
}
```

## Step 6: Deploy Security Rules

1. Install Firebase CLI:
```bash
npm install -g firebase-tools
```

2. Login to Firebase:
```bash
firebase login
```

3. Initialize Firebase in your project:
```bash
firebase init
```

Select:
- Firestore
- Storage

4. Replace the generated `firestore.rules` with the one in this project

5. Deploy rules:
```bash
firebase deploy --only firestore:rules
firebase deploy --only storage
```

## Step 7: Enable Storage

1. In Firebase Console sidebar, click "Storage"
2. Click "Get started"
3. Keep the default security rules
4. Choose your storage location
5. Click "Done"

## Step 8: Set Up Cloud Messaging (for Push Notifications)

1. In Firebase Console, go to Project Settings
2. Go to "Cloud Messaging" tab
3. Under "Web configuration", click "Generate key pair"
4. Copy the "Web Push certificate" key
5. Save it for later use in environment variables

## Step 9: Create First Admin User

### Method 1: Using Firebase Console

1. Go to Authentication > Users
2. Click "Add user"
3. Enter email and password
4. Click "Add user"
5. Copy the User UID

6. Go to Firestore Database
7. Create a new document in `users` collection:
   - Document ID: paste the User UID
   - Fields:
     ```
     uid: [paste User UID]
     email: [admin email]
     role: "admin"
     companyName: "MarineFlux Admin"
     createdAt: [select timestamp, use current]
     ```

### Method 2: Using Firebase Admin SDK (Advanced)

Create a script `scripts/create-admin.js`:

```javascript
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function createAdmin() {
  const email = 'admin@marineflux.com';
  const password = 'SecurePassword123!';
  
  // Create user
  const userRecord = await admin.auth().createUser({
    email: email,
    password: password,
  });
  
  // Add to Firestore
  await admin.firestore().collection('users').doc(userRecord.uid).set({
    uid: userRecord.uid,
    email: email,
    role: 'admin',
    companyName: 'MarineFlux Admin',
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });
  
  console.log('Admin user created:', userRecord.uid);
}

createAdmin().catch(console.error);
```

## Step 10: Get Service Account Key (for Admin Operations)

1. Go to Project Settings > Service Accounts
2. Click "Generate new private key"
3. Click "Generate key"
4. Save the JSON file securely (DO NOT commit to git)

## Step 11: Configure Environment Variables

Create `.env.local` file in your project root:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

## Step 12: Test Your Setup

1. Start your development server:
```bash
npm run dev
```

2. Go to http://localhost:3000/tr/login

3. Try logging in with your admin credentials

4. Check if you're redirected to the admin dashboard

## Firestore Indexes (Create as needed)

Some queries may require composite indexes. Firebase will show errors in console with links to create them automatically.

Common indexes needed:

### RFQs
- Collection: `rfqs`
- Fields: `status` (Ascending), `createdAt` (Descending)

### Orders
- Collection: `orders`
- Fields: `shipownerUid` (Ascending), `createdAt` (Descending)
- Fields: `supplierUid` (Ascending), `createdAt` (Descending)

### Quotations
- Collection: `quotations`
- Fields: `rfqId` (Ascending), `createdAt` (Descending)

## Security Best Practices

1. **Never commit** `.env.local` or service account keys to version control
2. Use Firebase Security Rules to protect data
3. Enable App Check for additional security
4. Set up budget alerts in Firebase console
5. Regularly review Firebase usage and logs
6. Use strong passwords for all accounts
7. Enable 2FA for Firebase Console access

## Troubleshooting

### "Permission denied" errors
- Check your Firestore security rules
- Ensure user is authenticated
- Verify user role in Firestore

### "Firebase not initialized" errors
- Check environment variables
- Ensure Firebase config is correct
- Verify `.env.local` is in root directory

### "Invalid API key" errors
- Regenerate API key in Firebase Console
- Update `.env.local`
- Restart development server

## Next Steps

1. Create test users (shipowners and suppliers)
2. Test RFQ creation
3. Test quotation submission
4. Test order workflow
5. Configure email notifications (optional)
6. Set up monitoring and analytics

## Support Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Data Model](https://firebase.google.com/docs/firestore/data-model)
- [Firebase Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Authentication](https://firebase.google.com/docs/auth)



