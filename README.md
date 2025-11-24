# Collaborative Whiteboard Scratchpad

A real-time, collaborative digital whiteboard application designed for engineering students to solve complex visual and mathematical problems together. Built with React, Vite, and Firebase.

## Features

- 🔐 **Authentication**: Email/Password authentication using Firebase Auth
- 🎨 **Drawing Tools**: 
  - Pen with customizable color and stroke thickness
  - Eraser tool
  - Text annotation tool
- 👥 **Real-time Collaboration**: Multiple users can draw simultaneously with low latency
- 📱 **Responsive Design**: Works seamlessly on mobile, tablet, and desktop devices
- 🎯 **Room Management**: Create or join rooms using 6-digit room IDs
- 🧹 **Canvas Management**: Host can clear the entire canvas

## Prerequisites

Before running this project, make sure you have:

- Node.js (v16 or higher)
- npm or yarn package manager
- A Firebase project with:
  - Authentication enabled (Email/Password provider)
  - Realtime Database enabled

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Enable **Authentication**:
   - Go to Authentication → Sign-in method
   - Enable "Email/Password" provider
4. Enable **Realtime Database**:
   - Go to Realtime Database
   - Create database (start in test mode for development)
   - Copy the database URL

### 3. Environment Variables

Create a `.env` file in the root directory of the project with the following variables:

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://your_project_id-default-rtdb.firebaseio.com/
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

#### How to Get Firebase Configuration Values:

1. **API Key, Auth Domain, Project ID, Storage Bucket, Messaging Sender ID, App ID**:
   - Go to Firebase Console → Project Settings (gear icon)
   - Scroll down to "Your apps" section
   - Click on the web icon (`</>`) to add a web app
   - Copy the configuration values from the `firebaseConfig` object

2. **Database URL**:
   - Go to Realtime Database in Firebase Console
   - The URL is displayed at the top (format: `https://your-project-id-default-rtdb.firebaseio.com/`)

### 4. Firebase Realtime Database Rules

Update your Realtime Database rules to allow authenticated users to read/write:

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

To update rules:
- Go to Realtime Database → Rules tab
- Paste the above rules
- Click "Publish"

## Running the Application

### Development Mode

```bash
npm run dev
```

The application will start on `http://localhost:3000` (or the next available port).

### Production Build

```bash
npm run build
```

This creates an optimized production build in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## Usage Guide

1. **Sign Up / Sign In**:
   - Open the application
   - Create an account or sign in with existing credentials

2. **Create a Room**:
   - Click "Create Room" to generate a unique 6-digit room ID
   - Share this ID with collaborators

3. **Join a Room**:
   - Enter the 6-digit room ID
   - Click "Join" to enter the collaborative whiteboard

4. **Drawing**:
   - Select the pen tool
   - Choose color and stroke thickness
   - Start drawing on the canvas

5. **Eraser**:
   - Select the eraser tool
   - Click on strokes or text to remove them

6. **Text Annotation**:
   - Select the text tool
   - Click on the canvas to place text
   - Type your text and press Enter

7. **Clear Canvas** (Host only):
   - Click the "Clear" button to remove all drawings

## Project Structure

```
collaborative-whiteboard/
├── src/
│   ├── components/
│   │   ├── Auth.jsx          # Authentication component
│   │   ├── Auth.css
│   │   ├── RoomManager.jsx   # Room creation/joining
│   │   ├── RoomManager.css
│   │   ├── Whiteboard.jsx    # Main whiteboard component
│   │   └── Whiteboard.css
│   ├── firebase/
│   │   ├── config.js         # Firebase configuration
│   │   ├── auth.js           # Authentication functions
│   │   └── database.js       # Database operations
│   ├── App.jsx               # Main app component with routing
│   ├── main.jsx              # Entry point
│   └── index.css             # Global styles
├── index.html
├── package.json
├── vite.config.js
└── .env                      # Environment variables (create this)
```

## Technology Stack

- **React 18**: UI framework
- **Vite**: Build tool and dev server
- **Firebase Auth**: Authentication
- **Firebase Realtime Database**: Real-time data synchronization
- **React Router**: Client-side routing
- **HTML5 Canvas**: Drawing functionality

## Performance Features

- Optimized stroke rendering for low latency
- Touch input support for mobile devices
- Responsive toolbar that adapts to screen size
- Connection status indicator
- Efficient real-time synchronization

## Troubleshooting

### Common Issues

1. **"Firebase: Error (auth/network-request-failed)"**:
   - Check your internet connection
   - Verify Firebase configuration in `.env`

2. **"Room not found"**:
   - Ensure the room ID is correct (6 digits)
   - Make sure the room was created and hasn't been deleted

3. **Drawings not syncing**:
   - Check Firebase Realtime Database rules
   - Verify you're authenticated
   - Check browser console for errors

4. **Canvas not responsive**:
   - Clear browser cache
   - Check if viewport meta tag is present in `index.html`

## Security Notes

- Never commit your `.env` file to version control
- Use Firebase Security Rules to restrict database access
- In production, configure proper CORS settings
- Consider implementing rate limiting for room creation

## License

This project is created for educational purposes.

## Support

For issues or questions, please check:
- Firebase Documentation: https://firebase.google.com/docs
- React Documentation: https://react.dev
- Vite Documentation: https://vitejs.dev

