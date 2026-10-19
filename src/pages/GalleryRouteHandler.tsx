import React from 'react';
import { useParams } from 'react-router-dom';
import { GalleryPage } from './GalleryPage';
import { ArtworkDetailPage } from './ArtworkDetailPage';
import { CampusArtPage } from './CampusArtPage';

const VALID_CATEGORIES = [
  'sketches',
  'paintings',
  'digital-art',
  'photography',
  'calligraphy',
  'doodles',
];

export const GalleryRouteHandler: React.FC = () => {
  const { param } = useParams<{ param: string }>();

  if (param && param.toLowerCase() === 'campus-art') {
    return <CampusArtPage />;
  }

  if (param && VALID_CATEGORIES.includes(param.toLowerCase())) {
    return <GalleryPage />;
  }

  // Otherwise treat as artwork id
  return <ArtworkDetailPage />;
};
