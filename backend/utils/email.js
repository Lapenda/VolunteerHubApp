import {
  ETHEREAL_USERNAME,
  ETHEREAL_PASS,
  ETHEREAL_HOST,
  ETHEREAL_PORT,
} from "../config/env.js";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: ETHEREAL_HOST,
  port: ETHEREAL_PORT,
  auth: {
    user: ETHEREAL_USERNAME,
    pass: ETHEREAL_PASS,
  },
});

export const sendEmail = async (to, subject, text) => {
  try {
    const mailOptions = {
      from: '"Volunteer Platform" <no-reply@volunteerplatform.com>',
      to,
      subject,
      text,
    };
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};
