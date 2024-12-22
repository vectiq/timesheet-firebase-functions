const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

exports.createUser = functions.https.onCall(async (data, context) => {
    // Check if the request is authenticated
    if (!context.auth || !context.auth.token.admin) {
        throw new functions.https.HttpsError(
            "permission-denied",
            "Only admins can create new users."
        );
    }

    const { email, password } = data;

    try {
        const userRecord = await admin.auth().createUser({
            email: email,
            password: password,
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
