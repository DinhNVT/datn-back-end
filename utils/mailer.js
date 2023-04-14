import nodemailer from "nodemailer";

export const sendMail = async (to, subject, htmlContent) => {
  // create reusable transporter object using the default SMTP transport
  const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.MAIL_USERNAME, // generated ethereal user
      pass: process.env.MAIL_PASSWORD, // generated ethereal password
    },
  });

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: process.env.MAIL_FROM_ADDRESS, // sender address
    to: to, // list of receivers
    subject: subject, // Subject line
    html: htmlContent, // html body
  });

  return info;
};
