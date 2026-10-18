import React from 'react';
import { ExternalLink, Heart, MessageCircle } from 'lucide-react';

export interface InstagramPost {
  id: string;
  imageUrl: string;
  caption: string;
  likes: number;
  comments: number;
  postUrl?: string;
}

interface InstagramStripProps {
  posts?: InstagramPost[];
  handle?: string;
}

const defaultPosts: InstagramPost[] = [
  {
    id: 'post-1',
    imageUrl: '/artworks/terracotta-flame.jpg',
    caption: 'Pulled glowing hot from 1000°C kilns during our Raku intensive. Studio 204 smells like wood-smoke.',
    likes: 184,
    comments: 24,
  },
  {
    id: 'post-2',
    imageUrl: '/artworks/oil-twilight.jpg',
    caption: 'Evening impasto study along Hooghly riverbanks. Cobalt, raw umber, and wet breeze.',
    likes: 240,
    comments: 31,
  },
  {
    id: 'post-3',
    imageUrl: '/artworks/circuits-and-clay.jpg',
    caption: 'When CSE algorithmic geometry meets high-fire stoneware. New prints coming to the gallery.',
    likes: 198,
    comments: 18,
  },
  {
    id: 'post-4',
    imageUrl: '/artworks/kiln-archways.jpg',
    caption: 'Midnight sketch crawl through the 1941 brick kilns. Charcoal on Arches deckle-edge paper.',
    likes: 215,
    comments: 27,
  },
  {
    id: 'post-5',
    imageUrl: '/artworks/monsoon-streets.jpg',
    caption: 'Rain wash drying on the studio easels. Monsoon wet-on-wet watercolor.',
    likes: 176,
    comments: 15,
  },
  {
    id: 'post-6',
    imageUrl: '/artworks/courtyard-mural.jpg',
    caption: '36 volunteer hours and 40-foot brick wall. Our collective courtyard mural is complete.',
    likes: 420,
    comments: 52,
  },
];

export const InstagramStrip: React.FC<InstagramStripProps> = ({
  posts = defaultPosts,
  handle = '@brushandbond',
}) => {
  return (
    <section className="gallery-container space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-[var(--line)] pb-4 gap-4">
        <div>
          <h2 className="section-title text-[var(--ink)]">
            Follow our creative journey
          </h2>
          <p className="text-xs font-mono text-[var(--muted)] mt-1">
            Studio moments, fresh kiln pulls, and sketch crawl dispatches
          </p>
        </div>

        <a
          href="https://instagram.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-mono text-[var(--accent)] hover:underline inline-flex items-center gap-1.5 font-semibold"
        >
          <span>{handle} on Instagram</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Grid of 6 Posts */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {posts.slice(0, 6).map((post) => (
          <a
            key={post.id}
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative aspect-square rounded-[4px] overflow-hidden bg-[var(--paper)] border border-[var(--line)] block"
          >
            <img
              src={post.imageUrl}
              alt={post.caption}
              className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            />

            {/* Hover Overlay with caption snippet & stats */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-between text-white text-xs">
              <p className="line-clamp-3 text-[11px] font-sans leading-snug">
                {post.caption}
              </p>
              <div className="flex items-center justify-between text-[11px] font-mono pt-2 border-t border-white/20">
                <span className="flex items-center gap-1">
                  <Heart className="w-3 h-3 fill-current text-[var(--accent)]" />
                  <span>{post.likes}</span>
                </span>
                <span className="flex items-center gap-1">
                  <MessageCircle className="w-3 h-3 text-white/80" />
                  <span>{post.comments}</span>
                </span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
};
