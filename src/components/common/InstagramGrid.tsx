import React from 'react';
import { Heart, ArrowUpRight } from 'lucide-react';
import { InstagramIcon } from './Icons';

export interface InstagramPost {
  id: string;
  imageUrl: string;
  likes: number;
  caption: string;
  permalink?: string;
}

const DEFAULT_POSTS: InstagramPost[] = [
  {
    id: 'post-1',
    imageUrl: '/artworks/studio-workshop.jpg',
    likes: 248,
    caption: 'Throwing 36 hours straight. Studio 204 smells like damp terracotta and tea.',
    permalink: 'https://instagram.com/brushandbond',
  },
  {
    id: 'post-2',
    imageUrl: '/artworks/campus-art/mural-painting-progress.jpg',
    likes: 312,
    caption: 'Scaffolding up at the north courtyard wall. Paint under our fingernails.',
    permalink: 'https://instagram.com/brushandbond',
  },
  {
    id: 'post-3',
    imageUrl: '/artworks/campus-art/festival-clay-pandal.jpg',
    likes: 420,
    caption: '450 unglazed terracotta pots lit by evening bulbs. Saraswati Puja at GCECT.',
    permalink: 'https://instagram.com/brushandbond',
  },
  {
    id: 'post-4',
    imageUrl: '/artworks/campus-art/wall-canteen-hub.jpg',
    likes: 195,
    caption: 'Eat. Code. Sleep. Repeat. Canteen walls finished before finals.',
    permalink: 'https://instagram.com/brushandbond',
  },
  {
    id: 'post-5',
    imageUrl: '/artworks/circuits-and-clay.jpg',
    likes: 289,
    caption: 'Copper traces embedded in glazed stoneware. Tech meets craft.',
    permalink: 'https://instagram.com/brushandbond',
  },
  {
    id: 'post-6',
    imageUrl: '/artworks/terracotta_sculpture_1792344138019.jpg',
    likes: 350,
    caption: 'The Centenary Totem fresh from the reduction kiln firing.',
    permalink: 'https://instagram.com/brushandbond',
  },
];

export interface InstagramGridProps {
  posts?: InstagramPost[];
  handle?: string;
  className?: string;
}

export const InstagramGrid: React.FC<InstagramGridProps> = ({
  posts = DEFAULT_POSTS,
  handle = '@brushandbond',
  className = '',
}) => {
  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--line)] pb-4">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2 text-xs font-mono text-[var(--accent)] font-semibold uppercase">
            <InstagramIcon size={14} />
            <span>COMMUNITY FEED</span>
          </div>
          <h3 className="font-display text-2xl font-bold text-[var(--ink)]">
            Follow {handle}
          </h3>
        </div>

        <a
          href="https://instagram.com/brushandbond"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-mono text-[var(--accent)] hover:underline inline-flex items-center gap-1 font-semibold"
        >
          <span>View full Instagram feed</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </a>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {posts.slice(0, 6).map((post) => (
          <a
            key={post.id}
            href={post.permalink || 'https://instagram.com/brushandbond'}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative aspect-square rounded-[4px] overflow-hidden bg-[var(--paper)] border border-[var(--line)] block shadow-xs"
          >
            <img
              src={post.imageUrl}
              alt="Community artwork capture"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />

            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-between text-white text-xs">
              <div className="flex items-center justify-end">
                <InstagramIcon size={16} className="text-white/80" />
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1.5 font-mono text-white font-semibold text-[11px]">
                  <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                  <span>{post.likes}</span>
                </div>
                <p className="line-clamp-2 text-[10px] text-white/90 font-sans leading-tight">
                  {post.caption}
                </p>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};
