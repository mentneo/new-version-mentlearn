exports.createDemo = (firestore) => async (req, res, next) => {
  try {
    const payload = req.body; // { name, email, phone, preferredTime, course }
    payload.createdAt = new Date();
    const docRef = await firestore.collection('demoBookings').add(payload);
    res.status(201).json({ id: docRef.id, ...payload });
  } catch (err) {
    next(err);
  }
};

exports.getDemos = (firestore) => async (req, res, next) => {
  try {
    const snap = await firestore.collection('demoBookings').orderBy('createdAt', 'desc').limit(100).get();
    const items = [];
    snap.forEach(doc => items.push({ id: doc.id, ...doc.data() }));
    res.json(items);
  } catch (err) {
    next(err);
  }
};
