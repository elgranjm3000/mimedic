import type { MetadataRoute } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://medicontrol.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // El panel y el registro muestran contenido según sesión; no interesa indexarlos
      disallow: ['/panel', '/patients', '/appointments', '/records', '/invoices', '/cash', '/inventory', '/perfil'],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
