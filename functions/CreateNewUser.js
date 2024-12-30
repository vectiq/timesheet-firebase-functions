const functions = require("firebase-functions");
const admin = require('firebase-admin');
admin.initializeApp();
exports.createUser = functions.https.onCall(async (request) => {
    // Log headers
    console.log('Data:', JSON.stringify(request.data));

    // // Check Authorization header
    if (!request.auth || !request.auth.token) {
        throw new HttpsError(
            'unauthenticated',
            'You must be authenticated to call this function.'
        );
    }

    const uid = request.auth.uid;

    // Verify the admin role in Firestore
    const userDoc = await admin.firestore().collection("users").doc(uid).get();
    if (!userDoc.exists || userDoc.data().role !== "admin") {
        throw new functions.https.HttpsError(
            "permission-denied",
            "Only admins can create new users."
        );
    }

    const { email, password } = request.data;

    try {
        const userRecord = await admin.auth().createUser({
            email,
            password,
        });
        return { success: true, uid: userRecord.uid };
    } catch (error) {
        throw new functions.https.HttpsError(
            "internal",
            "Error creating new user",
            error.message
        );
    }
});
