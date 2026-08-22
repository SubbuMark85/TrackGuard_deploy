# TrackGuard — Full-Stack Firebase Safety Platform

TrackGuard is a full-stack React + TypeScript + Vite safety monitoring platform powered by Firebase Authentication, Cloud Firestore, and Firebase Storage. Designed for family safety, child monitoring, and senior protection.

> [!IMPORTANT]
> **Pilot / Demo Safety Platform Disclaimer**: TrackGuard is strictly designated as a Pilot / Demo Safety Platform. It does **not** perform automatic 911, police, or ambulance dispatch. Emergency triggers notify registered guardians exclusively via real-time Cloud Firestore records and in-app notifications.

---

## Technical Stack
- **Frontend Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS / Custom Dark Theme
- **State & Context**: React Context (`AuthContext`)
- **Authentication**: Firebase Auth (Email/Password, Google Popup Sign-In, Password Reset)
- **Database**: Cloud Firestore (Modular SDK v9+ with real-time `onSnapshot` listeners)
- **Storage**: Firebase Storage
- **Forms & Validation**: React Hook Form + Zod
- **Icons**: Lucide React

---

## Setup & Deployment Guide

### 1. Firebase Project Setup
1. Go to the [Firebase Console](https://console.firebase.google.com/) and click **Add project**.
2. Name your project `trackguard-app` and create the project.
3. Register a Web App in the project dashboard and copy the `firebaseConfig` keys.

### 2. Enable Authentication Providers
1. In the Firebase Console, navigate to **Build > Authentication**.
2. Click **Get Started** and navigate to the **Sign-in method** tab.
3. Enable **Email/Password** authentication.
4. Enable **Google** sign-in (select your project support email).

### 3. Setting Environment Variables
Create a `.env` file in the root of the project by copying `.env.example`:
```bash
cp .env.example .env
```
Fill in your Firebase credentials in `.env`:
```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=1234567890
VITE_FIREBASE_APP_ID=1:1234567890:web:...
VITE_FIREBASE_MEASUREMENT_ID=G-...
```

> [!CAUTION]
> Never commit `.env` or service account keys to source control. `.env` is included in `.gitignore`.

### 4. Create Firestore Database in Production Mode
1. In the Firebase Console, go to **Build > Firestore Database**.
2. Click **Create Database**.
3. Select **Start in production mode** (all read/write requests denied by default until rules are deployed).
4. Choose a Cloud Firestore location (e.g., `us-central` or `europe-west`).

### 5. Deploying Firestore Security Rules & Storage Rules
Install the Firebase CLI if you haven't already:
```bash
npm install -g firebase-tools
```
Log in to your Firebase account and link the project:
```bash
firebase login
firebase use --add
```
Deploy the rules included in `firestore.rules` and `storage.rules`:
```bash
firebase deploy --only firestore:rules,storage
```

---

## Local Development & Build

### Running Locally
```bash
npm run dev
```
Open your browser at `http://localhost:5173`.

### Building for Production
```bash
npm run build
```

---

## Database Schema (Cloud Firestore)

All documents are scoped under `users/{uid}` for secure owner access:
- `users/{uid}`: Guardian account profile and preferences
- `users/{uid}/familyMembers/{memberId}`: Monitored family members
- `users/{uid}/emergencyContacts/{contactId}`: Emergency contacts
- `users/{uid}/bands/{bandId}`: TrackGuard safety bands
- `users/{uid}/alerts/{alertId}`: Real-time safety alerts (Read/Create/Update only, no delete)
- `users/{uid}/trips/{tripId}`: Travel plans and itineraries
- `users/{uid}/safeZones/{safeZoneId}`: Geofence safe zones
- `users/{uid}/sosIncidents/{incidentId}`: Emergency SOS incidents
- `users/{uid}/activityLogs/{logId}`: Audit trail logs

---

## Future Hardware & Backend Integration Notes
- **ESP32 & BLE Connectivity**: Physical safety bands will communicate over Bluetooth Low Energy (BLE) to the companion smartphone app or via direct cellular MQTT to Cloud Functions.
- **GPS Telemetry Ingestion**: Live location coordinates will be streamed into `currentLocation` via background mobile services.
- **Firebase Cloud Messaging (FCM)**: Push notification tokens will be registered via `notificationService.ts` for push alerts.
- **SMS Fallback & Twilio Integration**: Secure Cloud Functions will invoke SMS dispatch for offline guardians.
- **Cloud Functions**: Cascade account deletion and automated geofence evaluation will be processed server-side.
