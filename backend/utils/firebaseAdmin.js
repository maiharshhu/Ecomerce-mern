import admin from "firebase-admin";

let firebaseAdmin = null;

const loadServiceAccount = () => {
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (!raw) return null;

    try {
        const parsed = JSON.parse(raw);
        if (parsed.private_key) {
            parsed.private_key = parsed.private_key.replace(/\\n/g, "\n");
        }
        return parsed;
    } catch (error) {
        console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT:", error);
        return null;
    }
};

export const getFirebaseAdmin = () => {
    if (firebaseAdmin) return firebaseAdmin;

    const serviceAccount = loadServiceAccount();
    if (!serviceAccount) return null;

    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
    }

    firebaseAdmin = admin;
    return firebaseAdmin;
};
