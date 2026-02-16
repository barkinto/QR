require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const PDF_PATH = path.resolve(process.env.PDF_PATH || './assets/document.pdf');

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function createTransporter() {
  const required = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS'];
  for (const key of required) {
    if (!process.env[key]) {
      throw new Error(`${key} eksik. Lütfen .env dosyasını kontrol edin.`);
    }
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
}

app.post('/api/send-pdf', async (req, res) => {
  const { email } = req.body;

  if (!email || !isValidEmail(email)) {
    return res.status(400).json({ message: 'Geçerli bir e-posta adresi girin.' });
  }

  if (!fs.existsSync(PDF_PATH)) {
    return res.status(500).json({
      message: `PDF bulunamadı. Dosyayı ${PDF_PATH} konumuna ekleyin veya PDF_PATH ayarlayın.`
    });
  }

  try {
    const transporter = createTransporter();

    await transporter.sendMail({
      from: process.env.FROM_EMAIL || process.env.SMTP_USER,
      to: email,
      subject: 'PDF Belgeniz',
      text: 'Merhaba, talep ettiğiniz PDF ektedir.',
      attachments: [
        {
          filename: path.basename(PDF_PATH),
          path: PDF_PATH
        }
      ]
    });

    return res.json({ message: 'PDF başarıyla gönderildi.' });
  } catch (error) {
    return res.status(500).json({
      message: 'Mail gönderimi sırasında hata oluştu.',
      error: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Sunucu çalışıyor: http://localhost:${PORT}`);
});
