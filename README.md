## QR ile PDF Mail Gönderimi

Bu proje, QR kod okutulunca açılan bir form üzerinden kullanıcı e-postasını alır ve PDF dosyasını otomatik olarak mail atar.

### 1) Kurulum

```bash
npm install
cp .env.example .env
```

### 2) Mail sağlayıcısı seçimi

`.env` içinde `MAIL_PROVIDER` değeri ile sağlayıcı seçebilirsiniz:

- `MAIL_PROVIDER=smtp` (Gmail SMTP)
- `MAIL_PROVIDER=resend` (önerilen, Render'da daha stabil)

### 3) SMTP ayarı (MAIL_PROVIDER=smtp)

`.env` dosyasındaki aşağıdaki alanları doldurun:

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `FROM_EMAIL` (opsiyonel)
- `PDF_PATH` (opsiyonel, varsayılan: `./assets/document.pdf`)

> Gmail kullanıyorsanız normal şifre yerine **App Password** kullanın.

### 4) Resend ayarı (MAIL_PROVIDER=resend)

`.env` dosyasında:

- `MAIL_PROVIDER=resend`
- `RESEND_API_KEY`
- `FROM_EMAIL` (Resend üzerinde doğrulanmış gönderen adres)

### 5) PDF dosyası

PDF dosyanızı `assets/document.pdf` olarak ekleyin.

### 6) Çalıştırma

```bash
npm start
```

Uygulama: `http://localhost:3000`

### 7) QR kod

QR kod içeriği olarak form URL'sini verin:

- Yerelde test: `http://localhost:3000`
- Yayında: `https://alanadiniz.com`

Kullanıcı QR'ı okuttuğunda bu sayfa açılır, mail adresini girer ve PDF otomatik gönderilir.

### 8) GitHub üzerinden internete açma (Render)

1. Projeyi GitHub'a yükleyin.
2. Render hesabı açın: `https://render.com`
3. Render'da **New +** -> **Blueprint** seçin ve GitHub repo'nuzu bağlayın.
4. Repoda bulunan `render.yaml` otomatik okunur ve servis oluşturulur.
5. Render panelinde `MAIL_PROVIDER=resend` kullanın ve aşağıdakileri doldurun:
	- `RESEND_API_KEY`
	- `FROM_EMAIL` (Resend'de doğrulanmış adres)
6. SMTP kullanacaksanız ek olarak:
	- `SMTP_HOST`
	- `SMTP_PORT`
	- `SMTP_USER`
	- `SMTP_PASS` (Gmail App Password)
7. Deploy tamamlanınca Render size bir URL verir (`https://xxx.onrender.com`).
8. QR kod içeriğine bu URL'yi yazın.

Not: Bu projede PDF yolu varsayılan olarak `./assets/document.pdf` kullanır.
