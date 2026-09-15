import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// تهيئة Firebase Admin (تأكد من إعداد متغيرات البيئة في Vercel أو وضع مفتاح الخدمة)
if (!getApps().length) {
  // يمكنك استخدام متغيرات البيئة في Vercel لأمان أعلى
  initializeApp({
    credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT))
  });
}

const db = getFirestore();

export default async function handler(req, res) {
  // استقبال البيانات المرسلة من CPALead عبر الـ Postback
  const userId = req.query.subid;
  const payout = parseFloat(req.query.payout) || 0;

  if (!userId) {
    return res.status(400.json({ error: 'Missing subid (user id)' }));
  }

  try {
    const userRef = db.collection('users').doc(userId);
    const doc = await userRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const currentBalance = doc.data().balance || 0;
    // تحديث رصيد المستخدم بإضافة الأرباح الجديدة
    await userRef.update({
      balance: currentBalance + payout
    });

    return res.status(200).send('OK: Points added successfully');
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}