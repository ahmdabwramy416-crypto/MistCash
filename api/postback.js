export default async function handler(req, res) {
  const userId = req.query.subid;
  const payout = req.query.payout;

  if (!userId) {
    return res.status(400).json({ error: 'Missing subid' });
  }

  try {
    // يمكنك هنا إتمام عملية تحديث قاعدة البيانات أو طباعة النجاح للتأكد
    console.log(`User ID: ${userId}, Payout: ${payout}`);
    
    // الرد بنجاح لـ CPALead
    return res.status(200).send('OK');
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
