import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

// تهيئة Firebase Admin باستخدام متغيرات البيئة لضمان الأمان
if (!getApps().length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  initializeApp({
    credential: cert(serviceAccount)
  });
}

const db = getFirestore();

export default async function handler(req, res) {
  const userId = req.query.subid;
  const payout = parseFloat(req.query.payout) || 0;

  // التحقق من وجود معرف المستخدم
  if (!userId) {
    return res.status(400).json({ error: 'Missing subid parameter' });
  }

  try {
    // الإشارة إلى مستند المستخدم في مجموعة users
    const userRef = db.collection('users').doc(userId);
    const doc = await userRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'User not found in database' });
    }

    // تحديث الرصيد بإضافة قيمة الأرباح الجديدة (payout) إلى الرصيد الحالي
    await userRef.update({
      balance: FieldValue.increment(payout)
    });

    // الرد بكلمة OK لتأكيد استلام ونجاح العملية لـ CPALead
    return res.status(200).send('OK');
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
