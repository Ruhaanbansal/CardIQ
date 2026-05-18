import React from 'react';

type JsonLdProps = {
  data: Record<string, any>;
};

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// Pre-defined Schemas
export const OrganizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'CardIQ',
  url: 'https://cardiq.ai',
  logo: 'https://cardiq.ai/logo.png',
  description: 'AI-powered credit card optimization platform.',
};

export const SoftwareAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'CardIQ Optimizer',
  operatingSystem: 'Web',
  applicationCategory: 'FinanceApplication',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'INR',
  },
};
