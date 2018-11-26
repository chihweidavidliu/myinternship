const nodemailer = require('nodemailer');

let sendWelcomeEmail = (req, res, next) => {
  // send email with credentials
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'chihweiliu1993@gmail.com',
      pass: 'qwertyuiop1993'
    }
  });

  let mailOptions = {
    from: 'chihweiliu1993@gmail.com',
    to: 'chihweiliu1993@gmail.com',
    subject: 'Your Myinternship sign-in credentials',
    html: `Dear ${req.body["name"]},
    <p>Thank you for signing up to Myinternship.<br>
    Here are your sign-in credentials. Please keep them safe.<br>
    <p>Your <strong>studentid</strong> is ${req.body["studentid"]}<br>
    Your <strong>password</strong> is ${req.body["password"]}<br></p></p>
      <br>
      From the Myinternship Team`
  };

  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
}

module.exports = {
  sendWelcomeEmail: sendWelcomeEmail,
}
