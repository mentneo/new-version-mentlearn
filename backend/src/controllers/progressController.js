/**
 * Progress data is stored in Firestore under collection: progress
 * Document structure: progress/{studentId}_{courseId} -> { studentId, courseId, percent, modules: [...] }
 */

exports.getProgress = (firestore) => async (req, res, next) => {
  try {
    const { studentId, courseId } = req.query;
    let q = firestore.collection('progress');
    if (studentId) q = q.where('studentId', '==', studentId);
    if (courseId) q = q.where('courseId', '==', courseId);
    const snap = await q.get();
    const items = [];
    snap.forEach(doc => items.push({ id: doc.id, ...doc.data() }));
    res.json(items);
  } catch (err) {
    next(err);
  }
};

exports.syncProgress = (firestore) => async (req, res, next) => {
  try {
    const payload = req.body; // expect { studentId, courseId, percent, modules }
    if (!payload.studentId || !payload.courseId) return res.status(400).json({ message: 'studentId and courseId required' });
    const docId = `${payload.studentId}_${payload.courseId}`;
    await firestore.collection('progress').doc(docId).set(payload, { merge: true });
    res.json({ id: docId, ...payload });
  } catch (err) {
    next(err);
  }
};
