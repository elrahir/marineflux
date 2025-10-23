# MarineFlux Deployment Guide

This guide will help you deploy MarineFlux to production.

## Prerequisites

- Firebase project set up
- Vercel account (recommended) or other hosting provider
- GitHub repository

## Firebase Setup

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add project"
3. Follow the wizard to create your project

### 2. Enable Authentication

1. In Firebase Console, go to Authentication
2. Click "Get started"
3. Enable "Email/Password" sign-in method

### 3. Create Firestore Database

1. Go to Firestore Database
2. Click "Create database"
3. Choose production mode
4. Select your region

### 4. Deploy Security Rules

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project
firebase init

# Select:
# - Firestore
# - Storage
# - Hosting (optional)

# Deploy rules
firebase deploy --only firestore:rules,storage
```

### 5. Get Firebase Configuration

1. Go to Project Settings (gear icon)
2. Scroll to "Your apps"
3. Add a web app (</>)
4. Copy the configuration values

### 6. Create Service Account (for Admin SDK)

1. Go to Project Settings > Service Accounts
2. Click "Generate new private key"
3. Save the JSON file securely
4. Convert to single-line JSON for environment variable

## Vercel Deployment

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin your-repo-url
git push -u origin main
```

### 2. Import to Vercel

1. Go to [Vercel](https://vercel.com)
2. Click "Import Project"
3. Select your GitHub repository
4. Configure project:
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`

### 3. Add Environment Variables

In Vercel project settings, add all variables from `.env.local`:

```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=...
```

### 4. Deploy

1. Click "Deploy"
2. Wait for build to complete
3. Visit your deployed site

## Post-Deployment

### 1. Update Firebase Authorized Domains

1. Go to Firebase Console > Authentication > Settings
2. Add your Vercel domain to "Authorized domains"

### 2. Create Admin User

You'll need to manually create the first admin user in Firestore:

```javascript
// In Firebase Console > Firestore
// Create a document in 'users' collection:
{
  uid: "user-id-from-auth",
  email: "admin@example.com",
  role: "admin",
  companyName: "Admin",
  createdAt: timestamp
}
```

Then create the user in Authentication:
1. Go to Authentication > Users
2. Add user with email and password
3. Copy the UID and update the Firestore document

### 3. Configure Cloud Messaging (Optional)

For push notifications:

1. Go to Project Settings > Cloud Messaging
2. Generate Web Push certificates
3. Add to your environment variables

## Monitoring

### Vercel Analytics

1. Enable Vercel Analytics in project settings
2. Monitor performance and errors

### Firebase Analytics

1. Enable Google Analytics in Firebase
2. Track user engagement and conversions

## Security Checklist

- [ ] Environment variables are set correctly
- [ ] Firebase security rules are deployed
- [ ] Authorized domains are configured
- [ ] CORS is properly configured
- [ ] API routes are protected
- [ ] Rate limiting is enabled (consider adding)
- [ ] Error logging is set up (consider Sentry)

## Backup Strategy

1. Enable Firestore automated backups
2. Set up regular exports
3. Store in Cloud Storage bucket

## Custom Domain (Optional)

1. In Vercel project settings, go to Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Add domain to Firebase authorized domains

## Continuous Deployment

Vercel automatically deploys when you push to main branch:

```bash
git add .
git commit -m "Your changes"
git push
```

## Troubleshooting

### Build Errors

- Check environment variables
- Ensure all dependencies are in package.json
- Check Node version compatibility

### Authentication Issues

- Verify Firebase configuration
- Check authorized domains
- Ensure security rules are deployed

### Database Connection Issues

- Verify Firestore is enabled
- Check security rules
- Ensure correct project ID

## Support

For issues, check:
- [Next.js Documentation](https://nextjs.org/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Vercel Documentation](https://vercel.com/docs)



