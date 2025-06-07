import nodemailer from "nodemailer";

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendEmail(toEmail) {
  const otp = generateOTP();
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "huuquyle9@gmail.com",
      pass: "hxcn jqal kika zqgu", // App password, không phải mật khẩu thật
    },
  });

  let info = await transporter.sendMail({
    from: '"Tên bạn" <your@gmail.com>',
    to: toEmail,
    subject: "Mã OTP của bạn",
    text: `Mã xác thực của bạn là: ${otp}`,
  });
  console.log("Email sent:", info.messageId);
  return otp;
}

export default sendEmail;
