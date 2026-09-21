import { site, areas, services } from '../data/site';

const addr: Record<string, string> = {
  '@type': 'PostalAddress',
  addressLocality: site.address.city,
  addressRegion: site.address.region,
  postalCode: site.address.postal,
  addressCountry: site.address.country,
};
if (site.address.street) addr.streetAddress = site.address.street;

export const localBusiness = () => ({
  '@context': 'https://schema.org',
  '@type': ['LocalBusiness', 'HomeAndConstructionBusiness'],
  '@id': `${site.url}/#business`,
  name: site.name,
  legalName: site.legalName,
  url: site.url,
  telephone: '+1-814-809-9833',
  email: site.email,
  image: `${site.url}/images/hero-crew.jpg`,
  logo: `${site.url}/favicon.svg`,
  description: site.description,
  priceRange: '$$',
  foundingDate: site.founded,
  address: addr,
  geo: { '@type': 'GeoCoordinates', latitude: site.geo.lat, longitude: site.geo.lng },
  areaServed: [
    { '@type': 'GeoCircle', geoMidpoint: { '@type': 'GeoCoordinates', latitude: site.geo.lat, longitude: site.geo.lng }, geoRadius: `${site.serviceRadiusMiles * 1609}` },
    ...areas.map((a) => ({ '@type': 'City', name: `${a.name}, PA` })),
  ],
  openingHoursSpecification: [
    { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], opens: '00:00', closes: '23:59' },
  ],
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Restoration Services',
    itemListElement: services.map((s) => ({
      '@type': 'Offer',
      itemOffered: { '@type': 'Service', name: s.name, url: `${site.url}/services/${s.slug}/` },
    })),
  },
  knowsAbout: ['Water damage restoration', 'Fire damage restoration', 'Mold remediation', 'Biohazard cleanup', 'Storm damage repair', 'Insurance claims'],
  sameAs: [site.social.facebook],
});

export const serviceSchema = (s: { name: string; slug: string; metaDescription: string }) => ({
  '@context': 'https://schema.org',
  '@type': 'Service',
  '@id': `${site.url}/services/${s.slug}/#service`,
  serviceType: s.name,
  name: `${s.name} in Central Pennsylvania`,
  description: s.metaDescription,
  url: `${site.url}/services/${s.slug}/`,
  provider: { '@id': `${site.url}/#business` },
  areaServed: areas.map((a) => ({ '@type': 'City', name: `${a.name}, PA` })),
  availableChannel: { '@type': 'ServiceChannel', servicePhone: { '@type': 'ContactPoint', telephone: '+1-814-809-9833', contactType: 'emergency', availableLanguage: 'English', hoursAvailable: '24/7' } },
});

export const faqSchema = (faqs: { q: string; a: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
});

export const breadcrumbSchema = (items: { name: string; url: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: it.url })),
});

export const articleSchema = (a: { title: string; description: string; url: string; image?: string; pubDate: Date; updatedDate?: Date; author: string }) => ({
  '@context': 'https://schema.org',
  '@type': 'BlogPosting',
  headline: a.title,
  description: a.description,
  url: a.url,
  image: a.image ? `${site.url}${a.image}` : `${site.url}/images/hero-crew.jpg`,
  datePublished: a.pubDate.toISOString(),
  dateModified: (a.updatedDate ?? a.pubDate).toISOString(),
  author: { '@type': 'Organization', name: a.author, url: site.url },
  publisher: { '@id': `${site.url}/#business` },
  mainEntityOfPage: a.url,
});
