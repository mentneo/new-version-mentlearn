const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

/**
 * Initializes Firebase Admin SDK.
 * Expects either FIREBASE_CREDENTIALS_PATH pointing to a JSON file in the filesystem,
 * or FIREBASE_CREDENTIALS_JSON containing the JSON content.
 * If neither is available, it falls back to application default credentials.
 */
function initFirebase() {
  if (admin.apps.length) return admin.firestore();

  const credsPath = process.env.FIREBASE_CREDENTIALS_PATH;
  const credsJson = process.env.FIREBASE_CREDENTIALS_JSON;

  let credential;
  if (credsJson) {
    try {
      const parsed = JSON.parse(credsJson);
      credential = admin.credential.cert(parsed);
    } catch (err) {
      console.error('Invalid FIREBASE_CREDENTIALS_JSON');
      throw err;
    }
  } else if (credsPath) {
    const full = path.isAbsolute(credsPath) ? credsPath : path.join(process.cwd(), credsPath);
    if (fs.existsSync(full)) {
      try {
        credential = admin.credential.cert(require(full));
      } catch (err) {
        console.error('Error loading Firebase credentials from', full, err.message);
        console.warn('Falling back to application default credentials.');
        credential = admin.credential.applicationDefault();
      }
    } else {
      console.warn(`Firebase credentials file not found at ${full}. Falling back to application default credentials.`);
      credential = admin.credential.applicationDefault();
    }
  } else {
    // try default application credentials
    credential = admin.credential.applicationDefault();
  }

  admin.initializeApp({ credential });

  console.log('✅ Firebase Admin initialized');
  return admin.firestore();
}

module.exports = initFirebase;
