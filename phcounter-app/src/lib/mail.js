import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Template Khusus Anomali pH AeroFeed
export const getAnomalyTemplate = (batchName, phValue, deviceLabel) => {
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 20px; overflow: hidden;">
      <div style="background-color: #064e3b; padding: 25px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 20px;">🚨 PH ANOMALY DETECTED</h1>
      </div>
      <div style="padding: 30px; background-color: #ffffff;">
        <p style="color: #475569;">Sistem monitoring mendeteksi kondisi tidak normal pada fermentasi Anda:</p>
        <div style="background-color: #fef2f2; padding: 20px; border-radius: 12px; margin: 20px 0; border: 1px solid #fee2e2;">
          <p style="margin: 5px 0;"><strong>Batch:</strong> ${batchName}</p>
          <p style="margin: 5px 0;"><strong>Device:</strong> ${deviceLabel}</p>
          <p style="margin: 5px 0; color: #dc2626;"><strong>Nilai pH:</strong> ${phValue}</p>
        </div>
        <p style="color: #475569; font-size: 14px;">Segera lakukan pengecekan pada alat untuk menghindari kegagalan produksi.</p>
        <div style="text-align: center; margin-top: 25px;">
          <a href="https://aerofeed.vercel.app/dashboard" style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 10px; font-weight: bold; display: inline-block;">Cek Dashboard</a>
        </div>
      </div>
    </div>
  `;
};

export const sendEmail = async ({ to, subject, html }) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
    });
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("SMTP Error:", error);
    throw error;
  }
};