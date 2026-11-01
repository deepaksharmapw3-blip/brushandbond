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

/**
 * Run this once from the editor after configuring Script Properties and
 * approving the Gmail/URL Fetch permissions. The recurring job only broadcasts
 * messages with an explicit [B&B EVENT|ANNOUNCEMENT|ACHIEVEMENT|UPDATE] prefix.
 */
function runMemberEmailAutomation() {
  scanSentMemberBroadcasts();
  dispatchPendingMemberBroadcasts();
}

function installMemberEmailAutomation() {
  const config = getBroadcastConfig();
  if (!config.functionUrl || !config.publishableKey || !config.secret) {
    throw new Error('Set BROADCAST_FUNCTION_URL, SUPABASE_PUBLISHABLE_KEY, and RELAY_SECRET in Script Properties first.');
  }
  if (String(Session.getEffectiveUser().getEmail() || '').toLowerCase() !== config.senderEmail) {
    throw new Error('Run this script as the official Brush & Bond Gmail account.');
  }

  ScriptApp.getProjectTriggers()
    .filter(trigger => trigger.getHandlerFunction() === 'runMemberEmailAutomation')
    .forEach(trigger => ScriptApp.deleteTrigger(trigger));
  ScriptApp.newTrigger('runMemberEmailAutomation').timeBased().everyMinutes(5).create();
  return 'Member email automation is scheduled every five minutes.';
}

function authorizeMemberEmailAutomation() {
  GmailApp.search('in:sent newer_than:1d', 0, 1);
  MailApp.getRemainingDailyQuota();
  UrlFetchApp.fetch('https://www.google.com/generate_204', { muteHttpExceptions: true });
  return 'Gmail read, mail send, and URL Fetch permissions are ready.';
}

function scanSentMemberBroadcasts() {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(1000)) return;
  try {
    const config = getBroadcastConfig();
    const processedLabelName = 'B&B Broadcast Processed';
    const processedLabel = GmailApp.getUserLabelByName(processedLabelName) || GmailApp.createLabel(processedLabelName);
    const query = 'in:sent newer_than:30d {subject:"[B&B EVENT]" subject:"[B&B ANNOUNCEMENT]" subject:"[B&B ACHIEVEMENT]" subject:"[B&B UPDATE]"} -label:"B&B Broadcast Processed"';
    const threads = GmailApp.search(query, 0, 50);

    threads.forEach(thread => {
      let matchingMessages = 0;
      let everyMessageAccepted = true;
      thread.getMessages().forEach(message => {
        const subject = String(message.getSubject() || '').trim();
        const sender = emailAddressFromHeader(message.getFrom());
        const body = String(message.getPlainBody() || '').trim().slice(0, 3500);
        if (!/^\[B&B\s+(EVENT|ANNOUNCEMENT|ACHIEVEMENT|UPDATE)\]\s*.+/i.test(subject)) return;
        if (sender !== config.senderEmail || !body) return;

        matchingMessages++;
        try {
          const response = callBroadcastFunction(config, {
            action: 'ingest',
            gmailMessageId: message.getId(),
            senderEmail: sender,
            subject,
            bodyText: body,
          });
          if (response.success !== true) everyMessageAccepted = false;
        } catch (error) {
          everyMessageAccepted = false;
          console.error('Could not queue Gmail message:', error && error.message ? error.message : 'Unknown error');
        }
      });
      if (matchingMessages > 0 && everyMessageAccepted) thread.addLabel(processedLabel);
    });
  } finally {
    lock.releaseLock();
  }
}

function dispatchPendingMemberBroadcasts() {
  const config = getBroadcastConfig();
  const properties = PropertiesService.getScriptProperties();
  const pauseUntil = Number(properties.getProperty('BROADCAST_PAUSE_UNTIL') || 0);
  if (Date.now() < pauseUntil) return;

  const response = callBroadcastFunction(config, { action: 'dispatch' });
  if (response.paused === true) {
    // Consumer Gmail quota resets 24 hours after the first send in its quota window.
    properties.setProperty('BROADCAST_PAUSE_UNTIL', String(Date.now() + 24 * 60 * 60 * 1000));
  } else if (pauseUntil) {
    properties.deleteProperty('BROADCAST_PAUSE_UNTIL');
  }
}

function getBroadcastConfig() {
  const properties = PropertiesService.getScriptProperties();
  const senderEmail = String(properties.getProperty('SENDER_EMAIL') || '').trim().toLowerCase();
  const functionUrl = String(properties.getProperty('BROADCAST_FUNCTION_URL') || '').trim();
  const publishableKey = String(properties.getProperty('SUPABASE_PUBLISHABLE_KEY') || '').trim();
  const secret = String(properties.getProperty('RELAY_SECRET') || '');
  if (senderEmail !== 'brushandbondgcect22@gmail.com') throw new Error('SENDER_EMAIL must be brushandbondgcect22@gmail.com.');
  if (!/^https:\/\/[a-z0-9-]+\.supabase\.co\/functions\/v1\/member-email-broadcast$/i.test(functionUrl)) {
    throw new Error('BROADCAST_FUNCTION_URL must be the HTTPS member-email-broadcast function URL.');
  }
  if (!publishableKey || !secret) throw new Error('Supabase publishable key and relay secret are required.');
  return { senderEmail, functionUrl, publishableKey, secret };
}

function callBroadcastFunction(config, payload) {
  const response = UrlFetchApp.fetch(config.functionUrl, {
    method: 'post',
    contentType: 'application/json',
    headers: {
      apikey: config.publishableKey,
      Authorization: 'Bearer ' + config.publishableKey,
      'x-broadcast-secret': config.secret,
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
  });
  const result = JSON.parse(response.getContentText() || '{}');
  if (response.getResponseCode() < 200 || response.getResponseCode() >= 300 || result.success !== true) {
    console.error('Member broadcast automation failed:', result.error || response.getResponseCode());
    throw new Error(result.error || 'Member broadcast endpoint failed.');
  }
  return result;
}

function emailAddressFromHeader(value) {
  const input = String(value || '').trim().toLowerCase();
  const bracketed = input.match(/<([^<>]+)>/);
  return (bracketed ? bracketed[1] : input).trim();
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
