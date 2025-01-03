const functions = require('firebase-functions/v2');
const admin = require('firebase-admin');

exports.approveTimesheet = functions.https.onRequest(async (req, res) => {
    const id = req.query.id;

    if (!id) {
        return res.status(400).send('Missing id or action parameter');
    }

    try {
        const docRef = admin.firestore().collection('approvals').doc(id);
        const doc = await docRef.get();

        if (!doc.exists) {
            return res.status(404).send('Document not found');
        }

        const updateData = {
            status: 'approved',
            approvalActionDate: admin.firestore.FieldValue.serverTimestamp(),
            approvalActionPerformedBy: req.headers['x-forwarded-for'] || req.connection.remoteAddress
        };

        await docRef.update(updateData);

        return res.status(200).send('Timesheet approved, thanks!');
    } catch (error) {
        console.error('Error updating document:', error);
        return res.status(500).send('Internal Server Error');
    }
});