# Deployment Guide

This project is **fully deployable** and ready for production! ✅

## Pre-Deployment Checklist

- ✅ Build completes successfully
- ✅ Firebase configuration is set up
- ✅ Environment variables are configured
- ✅ All dependencies are installed

## Deployment Options

### Option 1: Vercel (Recommended - Easiest)

1. **Install Vercel CLI** (optional):
   ```bash
   npm i -g vercel
   ```

2. **Deploy**:
   ```bash
   vercel
   ```
   Or connect your GitHub repo at [vercel.com](https://vercel.com)

3. **Add Environment Variables** in Vercel Dashboard:
   - Go to Project Settings → Environment Variables
   - Add all variables from your `.env` file:
     - `VITE_FIREBASE_API_KEY`
     - `VITE_FIREBASE_AUTH_DOMAIN`
     - `VITE_FIREBASE_DATABASE_URL`
     - `VITE_FIREBASE_PROJECT_ID`
     - `VITE_FIREBASE_STORAGE_BUCKET`
     - `VITE_FIREBASE_MESSAGING_SENDER_ID`
     - `VITE_FIREBASE_APP_ID`
     - `VITE_FIREBASE_MEASUREMENT_ID`

4. **Build Settings** (auto-detected):
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

### Option 2: Netlify

1. **Install Netlify CLI** (optional):
   ```bash
   npm i -g netlify-cli
   ```

2. **Deploy**:
   ```bash
   netlify deploy --prod
   ```
   Or connect your GitHub repo at [netlify.com](https://netlify.com)

3. **Add Environment Variables** in Netlify Dashboard:
   - Go to Site Settings → Environment Variables
   - Add all variables from your `.env` file

4. **Build Settings**:
   - Build command: `npm run build`
   - Publish directory: `dist`

### Option 3: Firebase Hosting

1. **Install Firebase CLI**:
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**:
   ```bash
   firebase login
   ```

3. **Initialize Firebase Hosting**:
   ```bash
   firebase init hosting
   ```
   - Select your existing project: `whiteboardscratch`
   - Public directory: `dist`
   - Configure as single-page app: `Yes`
   - Set up automatic builds: `No` (or `Yes` if using GitHub)

4. **Build and Deploy**:
   ```bash
   npm run build
   firebase deploy --only hosting
   ```

5. **Environment Variables**:
   - Firebase Hosting serves static files, so environment variables need to be set at build time
   - For CI/CD, set them in your build environment
   - Or use Firebase Functions if you need server-side env vars

### Option 4: GitHub Pages

1. **Install gh-pages**:
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Update `package.json`**:
   ```json
   {
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d dist"
     }
   }
   ```

3. **Deploy**:
   ```bash
   npm run deploy
   ```

4. **Note**: Environment variables need to be set at build time. Use GitHub Actions secrets for CI/CD.

### Option 5: Any Static Hosting Service

The built `dist` folder can be deployed to:
- AWS S3 + CloudFront
- Azure Static Web Apps
- Cloudflare Pages
- DigitalOcean App Platform
- Any static file hosting service

## Important Notes

### Environment Variables

⚠️ **Security**: Never commit your `.env` file to version control!

For deployment platforms:
- Set environment variables in the platform's dashboard
- They will be available during build time as `import.meta.env.VITE_*`

### Firebase Configuration

Your Firebase config is already set up with fallback values in `src/firebase/config.js`. However, for production:

1. **Recommended**: Use environment variables (more secure)
2. **Current Setup**: Has fallback values (works but less secure)

### Firebase Realtime Database Rules

Before deploying, ensure your Firebase Realtime Database rules are set correctly:

```json
{
  "rules": {
    "rooms": {
      "$roomId": {
        ".read": "auth != null",
        ".write": "auth != null",
        "strokes": {
          ".read": "auth != null",
          ".write": "auth != null"
        },
        "texts": {
          ".read": "auth != null",
          ".write": "auth != null"
        }
      }
    }
  }
}
```

### Firebase Authentication

Make sure Email/Password authentication is enabled:
- Firebase Console → Authentication → Sign-in method
- Enable "Email/Password"

### Build Optimization

The build shows a warning about chunk size (>500KB). This is normal for React + Firebase apps. To optimize:

1. **Code Splitting** (optional):
   - Use React.lazy() for route-based splitting
   - Dynamic imports for heavy components

2. **Current Status**: ✅ Deployable as-is (warning is not a blocker)

## Quick Deploy Commands

### Vercel (Fastest)
```bash
npm i -g vercel
vercel
```

### Netlify
```bash
npm i -g netlify-cli
netlify deploy --prod
```

### Firebase Hosting
```bash
npm run build
firebase deploy --only hosting
```

## Post-Deployment

1. ✅ Test authentication (sign up/sign in)
2. ✅ Test room creation
3. ✅ Test real-time drawing sync
4. ✅ Test on mobile devices
5. ✅ Verify Firebase Analytics (if enabled)

## Troubleshooting

### Build Fails
- Check all environment variables are set
- Verify Node.js version (v16+)
- Run `npm install` again

### Firebase Errors
- Verify Firebase project settings
- Check Realtime Database rules
- Ensure Authentication is enabled

### CORS Issues
- Add your domain to Firebase authorized domains
- Firebase Console → Authentication → Settings → Authorized domains

## Production Checklist

- [ ] Environment variables configured
- [ ] Firebase Realtime Database rules set
- [ ] Firebase Authentication enabled
- [ ] Domain added to Firebase authorized domains
- [ ] Build completes successfully
- [ ] Tested authentication flow
- [ ] Tested real-time collaboration
- [ ] Tested on mobile devices
- [ ] Analytics configured (optional)

---

**Status**: ✅ **Ready to Deploy!**

The project builds successfully and is ready for production deployment on any modern hosting platform.

