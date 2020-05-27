//-- Module Dependencies
const nodemailer = require('nodemailer');

const stmpTransporter = nodemailer.createTransport({
  service: 'aol',
  secure: false,
  auth: {
    user: 'myproject2019@aol.com',
    pass: 'yumi ycup suqy pafg'
  }
});

exports.sendMail = (
  options = {
    to: '',
    from: '',
    subject: '',
    text: '',
    html: '',
    attachments: [{ path: '' }]
  }
) => {
  return new Promise((resolve, reject) => {
    try {
      stmpTransporter.sendMail(options, (err, info) => {
        if (err) {
          return reject(err);
        }

        return resolve(info);
      });
    } catch (err) {
      reject(err);
    }
  });
};
