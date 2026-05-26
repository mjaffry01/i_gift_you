# Gift a Smile

Gift a Smile is a React + Firebase marketplace for giving away unused items for free. Visitors can browse available gifts, upload new gifts, contact gifters on WhatsApp, and subscribe for new-item email alerts.

## Local Development

```bash
npm install
npm run dev
```

Open `http://127.0.0.1:5173/`.

## Build

```bash
npm run build
```

## New Item Email Alerts

Subscriptions are stored in Firestore under `subscribers`. New gifts are stored under `items`.

The backend alert flow is handled by the Firebase Function in `functions/index.js`:

1. A new document is created in `items`.
2. `notifySubscribersOnNewItem` reads subscriber emails from `subscribers`.
3. It sends an email alert through SendGrid.
4. It writes a delivery summary to `notificationLogs`.

### Configure Alerts

Install Firebase CLI if needed:

```bash
npm install -g firebase-tools
firebase login
```

Set the SendGrid API key as a Firebase secret:

```bash
firebase functions:secrets:set SENDGRID_API_KEY
```

Set Firebase Functions v2 parameters by creating `functions/.env` before deploy:

```env
ALERT_FROM_EMAIL=verified-sender@example.com
SITE_URL=https://mjaffry01.github.io/i_gift_you/
```

The `ALERT_FROM_EMAIL` address must be a verified sender in SendGrid.

Deploy the function:

```bash
npm --prefix functions install
npm run functions:deploy
```

After deploy, every newly uploaded item will trigger subscriber email alerts.
