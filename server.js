require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const PDF_PATH = path.resolve(process.env.PDF_PATH || './assets/document.pdf');
const MAIL_PROVIDER = (process.env.MAIL_PROVIDER || 'smtp').toLowerCase();

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

function getFromEmail() {
  if (process.env.FROM_EMAIL) {
    return process.env.FROM_EMAIL;
  }

  if (MAIL_PROVIDER === 'smtp') {
    return process.env.SMTP_USER;
  }

  throw new Error('FROM_EMAIL eksik. Lütfen .env dosyasını kontrol edin.');
}

async function sendWithSmtp(recipientEmail) {
  const transporter = createTransporter();

  await transporter.sendMail({
    from: getFromEmail(),
    to: recipientEmail,
    subject: 'PDF Belgeniz',
    text: 'Merhaba, talep ettiğiniz PDF ektedir.',
    attachments: [
      {
        filename: path.basename(PDF_PATH),
        path: PDF_PATH
      }
    ]
  });
}

async function sendWithResend(recipientEmail) {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY eksik. Lütfen .env dosyasını kontrol edin.');
  }

  const fileContent = fs.readFileSync(PDF_PATH).toString('base64');

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: getFromEmail(),
      to: [recipientEmail],
      subject: 'PDF Belgeniz',
      text: 'Merhaba, talep ettiğiniz PDF ektedir.',
      attachments: [
        {
          filename: path.basename(PDF_PATH),
          content: fileContent
        }
      ]
    })
  });

  if (!response.ok) {
    const responseText = await response.text();
    throw new Error(`Resend API hatası: ${responseText}`);
  }
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
    if (MAIL_PROVIDER === 'resend') {
      await sendWithResend(email);
    } else {
      await sendWithSmtp(email);
    }

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
