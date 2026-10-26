import React, { useState } from 'react';

function resolveImageUrl(value?: string) {
  if (!value) return '';
  try {
    const url = new URL(value);
    if (url.hostname === 'drive.google.com' || url.hostname === 'www.drive.google.com') {
      const fileId = url.pathname.match(/\/file\/d\/([^/]+)/)?.[1] || url.searchParams.get('id');
      if (fileId) return `https://drive.google.com/thumbnail?id=${encodeURIComponent(fileId)}&sz=w1200`;
    }
  } catch {
    // Keep non-URL values unchanged so the browser's normal image error handling applies.
  }
  return value;
}

export const TeamMemberAvatar: React.FC<{
  name: string;
  avatarUrl?: string;
  className: string;
}> = ({ name, avatarUrl, className }) => {
  const imageUrl = resolveImageUrl(avatarUrl);
  const [failedImageUrl, setFailedImageUrl] = useState('');
  const initials = name.trim().split(/\s+/).filter(Boolean).map((part) => part[0]).join('').slice(0, 2).toUpperCase();
  const hue = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 360;

  return (
    <div className={`${className} overflow-hidden flex items-center justify-center shrink-0`}>
      {imageUrl && failedImageUrl !== imageUrl ? (
        <img
          src={imageUrl}
          alt={name}
          loading="lazy"
          className="w-full h-full object-cover"
          onError={() => setFailedImageUrl(imageUrl)}
        />
      ) : (
        <div
          className="w-full h-full flex items-center justify-center font-display font-bold select-none"
          style={{ backgroundColor: `hsl(${hue}, 45%, 88%)`, color: `hsl(${hue}, 55%, 35%)` }}
          aria-label={`${name} initials`}
        >
          {initials}
        </div>
      )}
    </div>
  );
};
