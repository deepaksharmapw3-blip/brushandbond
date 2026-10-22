const escapeHtml = (value) => value.replace(/[&<>"']/g, (character) => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}[character] ?? character));

export const buildEmail = (status, name, notes = '') => {
  const firstName = escapeHtml(name.trim().split(/\s+/)[0] || 'artist');
  if (status === 'approved') {
    return {
      subject: 'Welcome to Brush and Bond! Your application is approved',
      html: `<!doctype html><html><body style="font-family:Arial,sans-serif;color:#252525;line-height:1.6"><h1>Welcome to Brush and Bond, ${firstName}!</h1><p>Your application to join Brush and Bond has been approved.</p><p>We are excited to welcome you to our community of artists and creative minds. Watch for updates about upcoming workshops, exhibitions, and collaborative projects.</p><p>Questions? Reply to this email and we will be happy to help.</p></body></html>`,
      text: `Welcome to Brush and Bond, ${name.trim().split(/\s+/)[0] || 'artist'}! Your application has been approved. We are excited to welcome you to our community.`,
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
