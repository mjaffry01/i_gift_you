const { onDocumentCreated } = require('firebase-functions/v2/firestore')
const { defineSecret, defineString } = require('firebase-functions/params')
const admin = require('firebase-admin')
const sgMail = require('@sendgrid/mail')

admin.initializeApp()

const sendgridApiKey = defineSecret('SENDGRID_API_KEY')
const alertFromEmail = defineString('ALERT_FROM_EMAIL')
const siteUrl = defineString('SITE_URL')

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function itemUrl(itemId) {
  const baseUrl = siteUrl.value() || 'https://mjaffry01.github.io/i_gift_you/'
  return `${baseUrl.replace(/\/$/, '')}/#/item/${itemId}`
}

function markGiftedUrl(itemId) {
  const baseUrl = siteUrl.value() || 'https://mjaffry01.github.io/i_gift_you/'
  return `${baseUrl.replace(/\/$/, '')}/#/mark-gifted/${itemId}`
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function buildEmail(item, itemId) {
  const title = item.title || 'a new gift'
  const category = item.category || 'Gift'
  const location = item.locationName ? ` in ${item.locationName}` : ''
  const url = itemUrl(itemId)
  const subject = `New free gift listed${location}: ${title}`
  const text = [
    `A new free gift was listed on Gift a Smile${location}.`,
    '',
    `Item: ${title}`,
    `Category: ${category}`,
    item.condition ? `Condition: ${item.condition}` : null,
    item.description ? `Description: ${item.description}` : null,
    '',
    `View it here: ${url}`,
  ].filter(Boolean).join('\n')

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.5;color:#0f172a">
      <h2 style="color:#0f766e;margin-bottom:8px">New free gift listed${escapeHtml(location)}</h2>
      <p><strong>${escapeHtml(title)}</strong> is now available on Gift a Smile.</p>
      <ul>
        <li><strong>Category:</strong> ${escapeHtml(category)}</li>
        ${item.condition ? `<li><strong>Condition:</strong> ${escapeHtml(item.condition)}</li>` : ''}
        ${item.locationName ? `<li><strong>Area:</strong> ${escapeHtml(item.locationName)}</li>` : ''}
      </ul>
      ${item.description ? `<p>${escapeHtml(item.description)}</p>` : ''}
      <p>
        <a href="${escapeHtml(url)}" style="display:inline-block;background:#0d9488;color:white;text-decoration:none;padding:10px 16px;border-radius:8px">
          View gift
        </a>
      </p>
      <p style="font-size:12px;color:#64748b">You are receiving this because you subscribed to Gift a Smile alerts.</p>
    </div>
  `

  return { subject, text, html }
}

function buildGifterEmail(item, itemId) {
  const title = item.title || 'your gift'
  const url = itemUrl(itemId)
  const giftedUrl = markGiftedUrl(itemId)
  const subject = `Your private gifted link for ${title}`
  const text = [
    `Hi ${item.gifterName || 'there'},`,
    '',
    `Your gift "${title}" is now listed on Gift a Smile.`,
    '',
    'When the item has been given, open this private link. It will mark the gift as gifted and return you to the gift page:',
    giftedUrl,
    '',
    `Gift page: ${url}`,
  ].join('\n')

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.5;color:#0f172a">
      <h2 style="color:#0f766e;margin-bottom:8px">Your gift is listed</h2>
      <p>Hi ${escapeHtml(item.gifterName || 'there')},</p>
      <p>Your gift <strong>${escapeHtml(title)}</strong> is now live on Gift a Smile.</p>
      <p>When the item has been given, open this private link. It will mark the gift as gifted and return you to the gift page.</p>
      <p>
        <a href="${escapeHtml(giftedUrl)}" style="display:inline-block;background:#0d9488;color:white;text-decoration:none;padding:10px 16px;border-radius:8px">
          Mark as gifted
        </a>
      </p>
      <p><a href="${escapeHtml(url)}">View gift page</a></p>
    </div>
  `

  return { subject, text, html }
}

function uniqueSubscriberEmails(snapshot) {
  const emails = new Set()
  snapshot.forEach((doc) => {
    const email = String(doc.data().email || '').trim().toLowerCase()
    if (email && isValidEmail(email)) {
      emails.add(email)
    }
  })
  return [...emails]
}

exports.notifySubscribersOnNewItem = onDocumentCreated({
  document: 'items/{itemId}',
  region: 'asia-south1',
  secrets: [sendgridApiKey],
}, async (event) => {
  const item = event.data && event.data.data()
  if (!item || item.status === 'gifted') return

  const from = alertFromEmail.value()
  if (!from) {
    throw new Error('Missing ALERT_FROM_EMAIL function parameter')
  }

  sgMail.setApiKey(sendgridApiKey.value())
  const subscribersSnapshot = await admin.firestore().collection('subscribers').get()
  const subscriberEmails = uniqueSubscriberEmails(subscribersSnapshot)
  const subscriberEmail = buildEmail(item, event.params.itemId)
  const messages = subscriberEmails.map((to) => ({
    to,
    from,
    subject: subscriberEmail.subject,
    text: subscriberEmail.text,
    html: subscriberEmail.html,
  }))

  const gifterEmail = String(item.gifterEmail || '').trim().toLowerCase()
  if (isValidEmail(gifterEmail)) {
    const email = buildGifterEmail(item, event.params.itemId)
    messages.push({
      to: gifterEmail,
      from,
      subject: email.subject,
      text: email.text,
      html: email.html,
    })
  }

  if (messages.length === 0) {
    console.log('No email recipients for item', event.params.itemId)
    return
  }

  for (let i = 0; i < messages.length; i += 100) {
    await sgMail.send(messages.slice(i, i + 100))
  }

  await admin.firestore().collection('notificationLogs').add({
    itemId: event.params.itemId,
    type: 'new-item-email',
    subscriberCount: subscriberEmails.length,
    gifterEmailSent: isValidEmail(gifterEmail),
    sentCount: messages.length,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  })

  console.log(`Sent ${messages.length} email(s) for ${event.params.itemId}`)
})
