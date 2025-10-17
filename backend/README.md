# Mentneo Backend

Express backend that uses MongoDB for structured data and Firestore for real-time data.

Quick start

1. Install deps
```
npm install
```

2. Create `.env` (see `.env.example`) and set `MONGODB_URI` and Firebase credentials.

3. Start dev server
```
npm run dev
```

Files
- `src/app.js` - Express app (exported)
- `src/server.js` - starts the app (also imports app)
- `src/config/mongodb.js` - MongoDB connector
- `src/config/firebase.js` - Firebase Admin init (supports JSON path or JSON in env)

Firebase creds
- You can point `FIREBASE_CREDENTIALS_PATH` to a service account JSON file in the project
  or set `FIREBASE_CREDENTIALS_JSON` to the literal JSON string (not recommended).
