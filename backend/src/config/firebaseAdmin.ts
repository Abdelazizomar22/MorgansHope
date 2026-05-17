import admin from 'firebase-admin';

const projectId = process.env.FIREBASE_PROJECT_ID?.trim();
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim();
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

function getFirebaseApp() {
  if (admin.apps.length) return admin.app();

  if (projectId && clientEmail && privateKey) {
    return admin.initializeApp({
      credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
    });
  }

  return admin.initializeApp(projectId ? { projectId } : undefined);
}

export const firebaseAdmin = getFirebaseApp();

export const verifyFirebaseIdToken = (idToken: string) =>
  firebaseAdmin.auth().verifyIdToken(idToken);
