import React, { useEffect } from 'react';

export interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  canonicalPath?: string;
  type?: 'website' | 'article';
  structuredData?: Record<string, unknown>;
}

const DEFAULT_TITLE = 'Brush and Bond — GCECT Art Club & The Canvas Archive';
const DEFAULT_DESCRIPTION =
  'Official art club of the Government College of Engineering and Ceramic Technology (GCECT), est. 2024. Explore student artwork, campus murals, upcoming exhibitions, and salons.';
const DEFAULT_IMAGE = 'https://brushandbond.gcect.ac.in/og-image.jpg';
const BASE_URL = 'https://brushandbond.gcect.ac.in';

/**
 * SEO Component
 * Dynamically updates per-page meta tags, Open Graph, Twitter, canonical URL, and structured data.
 * Place this component at the top level of each page to ensure proper SEO.
 */
export const SEO: React.FC<SEOProps> = ({
  title,
  description = DEFAULT_DESCRIPTION,
  image = DEFAULT_IMAGE,
  canonicalPath,
  type = 'website',
  structuredData,
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

    // 3. Open Graph & Twitter Cards
    const setMetaTag = (property: string, content: string, isProperty = true) => {
      const attr = isProperty ? 'property' : 'name';
      let tag = document.querySelector(`meta[${attr}="${property}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute(attr, property);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    };

    const ogImage = image.startsWith('http') ? image : `${BASE_URL}${image}`;
    setMetaTag('og:title', fullTitle, true);
    setMetaTag('og:description', description, true);
    setMetaTag('og:image', ogImage, true);
    setMetaTag('og:type', type, true);

    const canonicalUrl = canonicalPath ? `${BASE_URL}${canonicalPath}` : window.location.href;
    setMetaTag('og:url', canonicalUrl, true);

    // Twitter Card tags
    setMetaTag('twitter:title', fullTitle, false);
    setMetaTag('twitter:description', description, false);
    setMetaTag('twitter:image', ogImage, false);

    // 4. Canonical link
    let canonicalTag = document.querySelector('link[rel="canonical"]');
    if (!canonicalTag) {
      canonicalTag = document.createElement('link');
      canonicalTag.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalTag);
    }
    canonicalTag.setAttribute('href', canonicalUrl);

    // 5. Structured Data (JSON-LD)
    if (structuredData) {
      let structuredDataScript = document.querySelector('script[data-type="structured-data"]');
      if (!structuredDataScript) {
        structuredDataScript = document.createElement('script');
        structuredDataScript.setAttribute('type', 'application/ld+json');
        structuredDataScript.setAttribute('data-type', 'structured-data');
        document.head.appendChild(structuredDataScript);
      }
      structuredDataScript.textContent = JSON.stringify(structuredData);
    }
  }, [title, description, image, canonicalPath, type, structuredData]);

  return null;
};
