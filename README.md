# Gathering Place — Attendance System

This project recreates the visual structure shown in the supplied Gathering Place screenshots and adds a Firebase/Firestore attendance backend.

## 1. Install

```bash
npm install
```

## 2. Create Firebase

1. Open Firebase Console.
2. Create a project.
3. Add a Web App.
4. Enable **Firestore Database**.
5. Enable **Authentication → Email/Password**.
6. Create one admin user in Firebase Authentication.
7. Copy the Firebase web configuration into a `.env` file using `.env.example`.

Example:

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

## 3. Run

```bash
npm run dev
```

The site will work in demo mode even before Firebase is configured. Demo attendance is stored in the browser only.

## 4. Deploy to Firebase Hosting

Install the CLI:

```bash
npm install -g firebase-tools
firebase login
```

Build and deploy:

```bash
npm run build
firebase deploy
```

Before deploying, run:

```bash
firebase use --add
```

and select your Firebase project.

## Routes

- `/` — Gathering Place home/check-in catalogue
- `/check-in/driving-class` — Driving Class attendance
- `/check-in/movie-night` — Movie Night attendance
- `/check-in/devotional` — Devotional attendance
- `/check-in/missionary-departure` — Missionary Departure
- `/check-in/missionary-prep` — Missionary Prep
- `/check-in/institute-religion` — Institute of Religion
- `/check-in/institute-cluster` — Institute Cluster
- `/admin` — authenticated attendance dashboard

## Firestore

Attendance records are stored in:

`attendance/{recordId}`

The included `firestore.rules` permits public creation of attendance records while requiring Firebase Authentication for dashboard reads/updates/deletes.

## Next customization

Replace the sample event data in `src/data.js` with the exact Abeokuta Nigeria Stake schedule, units/wards/branches, and event dates. Replace `public/assets/logo.jpg` with the official logo for the final deployment.
