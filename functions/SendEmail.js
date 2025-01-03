const functions = require('firebase-functions');
const admin = require('firebase-admin');
const sgMail = require('@sendgrid/mail');
const { defineString, defineSecret } = require('firebase-functions/params');

const db = admin.firestore();
const sendGridApiKey = defineSecret('SENDGRID_API_KEY');

exports.sendEmail = functions.https.onCall({secrets: [sendGridApiKey]},async (request) => {
    // Check if the user is authenticated
    if (!request.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Emails must be triggerd by an authenticated session.');
    }

    console.log('SendGrid API Key:', sendGridApiKey.value());
    sgMail.setApiKey(sendGridApiKey.value());

    const { recipient, subject, body, type } = request.data;

    // Construct the email message
    const senderEmail = defineString('SENDGRID_FROM_EMAIL');

    const msg = {
        to: recipient,
        from: senderEmail.value(),
        subject: subject,
        html: body,
    };

    try {
        // Send the email
        await sgMail.send(msg);

        // Save the notification details to Firestore
        await db.collection('notifications').add({
            recipient: recipient,
            subject: subject,
            notificationType: type,
            sentAt: admin.firestore.FieldValue.serverTimestamp(),
            triggeredBy: request.auth.uid,
        });

        return { success: true, message: 'Email sent successfully.' };
    } catch (error) {
        console.error('Error sending email:', error);
        throw new functions.https.HttpsError('internal', 'Failed to send email.');
    }
});