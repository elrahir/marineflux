# MarineFlux Installation Guide

## Windows PowerShell Script Execution Policy Issue

If you encounter `UnauthorizedAccess` errors when running npm commands on Windows PowerShell, follow these steps:

### Option 1: Use Command Prompt (Recommended)

1. Open Command Prompt (CMD) as Administrator
2. Navigate to your project directory:
```cmd
cd C:\Users\chart\OneDrive\Desktop\Marineflux
```

3. Install dependencies:
```cmd
npm install
```

4. Run the development server:
```cmd
npm run dev
```

### Option 2: Change PowerShell Execution Policy (Advanced)

**Warning**: This changes your system's security settings. Only do this if you understand the implications.

1. Open PowerShell as Administrator
2. Check current policy:
```powershell
Get-ExecutionPolicy
```

3. Change policy for current user:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

4. Confirm by typing 'Y' and pressing Enter

5. Now you can run npm commands:
```powershell
npm install
npm run dev
```

### Option 3: Use VS Code Terminal

1. Open the project in Visual Studio Code
2. Open Terminal (Ctrl + `)
3. If using PowerShell, switch to CMD or Git Bash
4. Run commands normally

## Installation Steps

### 1. Install Node.js

Make sure you have Node.js 18 or higher installed:

```bash
node --version
```

If not installed, download from [nodejs.org](https://nodejs.org/)

### 2. Install Dependencies

Using Command Prompt or PowerShell (with proper permissions):

```bash
npm install
```

This will install all required packages including:
- Next.js
- React
- Firebase SDK
- Tailwind CSS
- TypeScript
- And all other dependencies

### 3. Set Up Environment Variables

1. Create a `.env.local` file in the root directory
2. Copy the template from `ENV-TEMPLATE.md`
3. Fill in your Firebase configuration values

### 4. Firebase Setup

Follow the detailed guide in `FIREBASE-SETUP.md`:

1. Create Firebase project
2. Enable Authentication
3. Create Firestore database
4. Deploy security rules
5. Get configuration values

### 5. Run Development Server

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

## Troubleshooting

### "Cannot find module" errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Port already in use

```bash
# Use a different port
npm run dev -- -p 3001
```

### Firebase errors

- Check `.env.local` file exists and has correct values
- Verify Firebase project is set up correctly
- Check Firebase security rules are deployed

### TypeScript errors

```bash
# Clear TypeScript cache
rm -rf .next
npm run dev
```

## Next Steps

After installation:

1. Visit http://localhost:3000
2. You'll see the landing page
3. Set up your first admin user (see FIREBASE-SETUP.md)
4. Log in and explore the platform

## Development Tools (Optional)

### Recommended VS Code Extensions

- ESLint
- Prettier
- Tailwind CSS IntelliSense
- Firebase Explorer
- GitLens

### Browser Extensions

- React Developer Tools
- Redux DevTools (if using Redux later)

## Common Commands

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Type check
npx tsc --noEmit
```

## Need Help?

- Check `README.md` for general information
- See `FIREBASE-SETUP.md` for Firebase configuration
- Review `DEPLOYMENT.md` for deployment instructions
- Check `CONTRIBUTING.md` for development guidelines

## Support

If you encounter any issues during installation:

1. Check the error message carefully
2. Search for similar issues in documentation
3. Verify all prerequisites are met
4. Ensure environment variables are correct
5. Try clearing caches and reinstalling

Good luck! 🚀



