const { createUser } = require('./CreateNewUser');
const { sendEmail } = require('./SendEmail');
const { approveTimesheet } = require('./timesheetApproval');

exports.createUser = createUser;
exports.sendEmail = sendEmail;
exports.approveTimesheet = approveTimesheet;