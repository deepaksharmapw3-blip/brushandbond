import React from 'react';
import { useParams } from 'react-router-dom';
import { GalleryPage } from './GalleryPage';
import { ArtworkDetailPage } from './ArtworkDetailPage';

const VALID_CATEGORIES = [
  'sketches',
  'paintings',
  'digital-art',
  'photography',
  'calligraphy',
  'doodles',
  'campus-art',
];

export const GalleryRouteHandler: React.FC = () => {
  const { param } = useParams<{ param: string }>();

  if (param && VALID_CATEGORIES.includes(param.toLowerCase())) {
    return <GalleryPage />;
  }

  // Otherwise treat as artwork id
  return <ArtworkDetailPage />;
};
