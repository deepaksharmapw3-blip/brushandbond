const escapeHtml = (value) => value.replace(/[&<>"']/g, (character) => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}[character] ?? character));

const CLUB_EMAIL = 'brushandbondgcect22@gmail.com';
const INSTAGRAM_URL = 'https://www.instagram.com/brushandbond.gcect/';

export const buildEmail = (status, name, notes = '') => {
  const firstName = escapeHtml(name.trim().split(/\s+/)[0] || 'artist');
  if (status === 'approved') {
    return {
      subject: 'Welcome to Brush and Bond! Your application is approved',
      html: `<!doctype html><html><body style="font-family:Arial,sans-serif;color:#252525;line-height:1.6"><main style="max-width:600px;margin:0 auto;padding:24px"><p>Hello ${firstName},</p><h1>Welcome to Brush and Bond!</h1><p>Your application to join Brush and Bond has been approved. We are delighted to welcome you to the club.</p><h2>About the club</h2><p>Brush and Bond is the official art club of the Government College of Engineering and Ceramic Technology. We are a creative community where students explore art, experiment with new forms of expression, and celebrate creativity across campus.</p><h2>What happens next?</h2><ul><li>Keep an eye on your inbox for updates about workshops, exhibitions, and club activities.</li><li>Follow us on <a href="${INSTAGRAM_URL}" style="color:#7c3aed">Instagram</a> to see our latest artwork and announcements.</li></ul><h2>Questions?</h2><p>Reply to this email or contact us at <a href="mailto:${CLUB_EMAIL}">${CLUB_EMAIL}</a>.</p><p>We look forward to creating with you!</p><p>Warmly,<br>Brush and Bond<br>GCECT Art Club</p></main></body></html>`,
      text: `Hello ${name.trim().split(/\s+/)[0] || 'artist'},\n\nWelcome to Brush and Bond! Your application to join the club has been approved. We are delighted to welcome you.\n\nABOUT THE CLUB\nBrush and Bond is the official art club of the Government College of Engineering and Ceramic Technology. We are a creative community where students explore art, experiment with new forms of expression, and celebrate creativity across campus.\n\nWHAT HAPPENS NEXT?\nKeep an eye on your inbox for updates about workshops, exhibitions, and club activities. Follow us on Instagram for artwork and announcements: ${INSTAGRAM_URL}\n\nQUESTIONS?\nReply to this email or contact us at ${CLUB_EMAIL}.\n\nWe look forward to creating with you!\nBrush and Bond\nGCECT Art Club`,
    };
  }

  const noteHtml = notes ? `<p><strong>Feedback:</strong> ${escapeHtml(notes)}</p>` : '';
  const noteText = notes ? ` Feedback: ${notes}` : '';
  return {
    subject: 'An update on your Brush and Bond application',
    html: `<!doctype html><html><body style="font-family:Arial,sans-serif;color:#252525;line-height:1.6"><h1>Application update</h1><p>Hi ${firstName},</p><p>Thank you for your interest in joining Brush and Bond. After reviewing your application, we are unable to offer you membership at this time.</p>${noteHtml}<p>We appreciate your interest and wish you the best in your creative journey.</p></body></html>`,
    text: `Hi ${name.trim().split(/\s+/)[0] || 'artist'}, thank you for your interest in Brush and Bond. We are unable to offer you membership at this time.${noteText}`,
  };
};
