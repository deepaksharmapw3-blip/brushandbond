import React, { useEffect } from 'react';

export interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  canonicalPath?: string;
  type?: 'website' | 'article';
}

const DEFAULT_TITLE = 'Brush and Bond — GCECT Art Club & The Canvas Archive';
const DEFAULT_DESCRIPTION =
  'Official art club of the Government College of Engineering and Ceramic Technology (GCECT), est. 2024. Explore student artwork, campus murals, upcoming exhibitions, and salons.';
const DEFAULT_IMAGE = 'https://brushandbond.gcect.ac.in/og-image.jpg';
const BASE_URL = 'https://brushandbond.gcect.ac.in';

export const SEO: React.FC<SEOProps> = ({
  title,
  description = DEFAULT_DESCRIPTION,
  image = DEFAULT_IMAGE,
  canonicalPath,
  type = 'website',
}) => {
  useEffect(() => {
    // 1. Document title
    const fullTitle = title ? `${title} | Brush and Bond` : DEFAULT_TITLE;
    document.title = fullTitle;

    // 2. Meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', description);

    // 3. Open Graph
    const setMetaTag = (property: string, content: string) => {
      let tag = document.querySelector(`meta[property="${property}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('property', property);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    };

    setMetaTag('og:title', fullTitle);
    setMetaTag('og:description', description);
    setMetaTag('og:image', image.startsWith('http') ? image : `${BASE_URL}${image}`);
    setMetaTag('og:type', type);

    const canonicalUrl = canonicalPath ? `${BASE_URL}${canonicalPath}` : window.location.href;
    setMetaTag('og:url', canonicalUrl);

    // 4. Canonical link
    let canonicalTag = document.querySelector('link[rel="canonical"]');
    if (!canonicalTag) {
      canonicalTag = document.createElement('link');
      canonicalTag.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalTag);
    }
    canonicalTag.setAttribute('href', canonicalUrl);
  }, [title, description, image, canonicalPath, type]);

  return null;
};
