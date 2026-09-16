import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

export default async function handler(req, res) {
  try {
    if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
      return res.status(500).json({ error: "FIREBASE_SERVICE_ACCOUNT env var is missing" });
    }

    if (!getApps().length) {
      initializeApp({
        credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT))
      });
    }

    const db = getFirestore();
    const subid = req.query.subid;
    const payout = parseFloat(req.query.payout) || 0;

    if (!subid) {
      return res.status(400).json({ error: 'Missing subid parameter' });
    }

    const userRef = db.collection('users').doc(subid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found in database' });
    }

    await userRef.update({
      points: FieldValue.increment(payout)
    });

    return res.status(200).send('OK');
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
        }
