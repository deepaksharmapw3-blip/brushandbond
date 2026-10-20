import React from 'react';
import { useGallery } from '../../context/GalleryContext';

export const ClubNumbers: React.FC = () => {
  const { artworks, artists, events, isLoadingSharedData, sharedDataError } = useGallery();

  if (isLoadingSharedData || sharedDataError) return null;

  const stats = [
    { value: events.length, label: 'Events in calendar' },
    { value: artists.length, label: 'Artist profiles' },
    { value: artworks.length, label: 'Published artworks' },
    { value: events.filter((event) => event.category === 'Workshop').length, label: 'Workshops in calendar' },
  ];

  return (
    <section className="gallery-container">
      <div className="border-t-2 border-[var(--ink)] pt-10 sm:pt-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12 text-left">
          {stats.map((stat) => (
            <div key={stat.label} className="space-y-2">
              <div className="font-display font-black text-4xl sm:text-6xl text-[var(--ink)] tracking-tight">
                {stat.value}
              </div>
              <p className="text-xs sm:text-sm font-mono text-[var(--muted)] font-medium">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
