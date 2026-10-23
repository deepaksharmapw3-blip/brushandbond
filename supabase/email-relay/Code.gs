/**
 * Brush and Bond Gmail relay.
 * Deploy as a Web App that executes as your Google account and is accessible
 * to anyone. The random RELAY_SECRET protects the public web-app endpoint.
 */
function doPost(event) {
  try {
    const config = PropertiesService.getScriptProperties();
    const expectedSecret = config.getProperty('RELAY_SECRET') || '';
    const senderEmail = config.getProperty('SENDER_EMAIL') || '';
    if (!expectedSecret || !senderEmail) return respond({ error: 'Relay is not configured.' });
    if (String(Session.getEffectiveUser().getEmail() || '').toLowerCase() !== senderEmail.toLowerCase()) {
      return respond({ error: 'SENDER_EMAIL must match the Gmail account that owns this script.' });
    }

    const payload = JSON.parse(event && event.postData && event.postData.contents || '{}');
    if (!safeEqual(String(payload.secret || ''), expectedSecret)) return respond({ error: 'Unauthorized.' });

    const to = String(payload.to || '').trim().toLowerCase();
    const replyTo = String(payload.replyTo || senderEmail).trim().toLowerCase();
    const subject = String(payload.subject || '').trim();
    const html = String(payload.html || '');
    const plainText = String(payload.text || '');
    const key = String(payload.idempotencyKey || '');
    if (!isEmail(to) || !isEmail(replyTo) || !subject || subject.length > 200 || !html || html.length > 40000 || plainText.length > 20000 || !/^[a-zA-Z0-9_-]{1,100}$/.test(key)) {
      return respond({ error: 'Invalid message.' });
    }

    // Serialize delivery so two retries cannot send the same decision twice.
    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      const propertyKey = 'sent_' + key;
      if (config.getProperty(propertyKey)) return respond({ ok: true, alreadySent: true });
      if (MailApp.getRemainingDailyQuota() < 1) return respond({ error: 'Daily Gmail sending quota is exhausted.' });

      MailApp.sendEmail(to, subject, plainText || 'Please view this message in an HTML-capable email client.', {
        htmlBody: html,
        replyTo: replyTo,
        name: 'Brush and Bond',
      });
      config.setProperty(propertyKey, new Date().toISOString());
      return respond({ ok: true, alreadySent: false });
    } finally {
      lock.releaseLock();
    }
  } catch (error) {
    console.error('Mail relay failed:', error && error.message ? error.message : 'Unknown error');
    return respond({ error: 'Mail relay failed.' });
  }
}

// Run this once from the editor to trigger Google's mail permission prompt.
function authorizeMail() {
  return MailApp.getRemainingDailyQuota();
}

function isEmail(value) {
  return /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(value) && value.length <= 254;
}

function safeEqual(left, right) {
  let difference = left.length ^ right.length;
  const max = Math.max(left.length, right.length);
  for (let index = 0; index < max; index++) {
    difference |= (left.charCodeAt(index) || 0) ^ (right.charCodeAt(index) || 0);
  }
  return difference === 0;
}

function respond(body) {
  // ContentService doesn't let web apps choose an HTTP status code; the JSON
  // `error` / `ok` fields are therefore authoritative for the caller.
  return ContentService.createTextOutput(JSON.stringify(body))
    .setMimeType(ContentService.MimeType.JSON);
}
