import type { Metadata } from 'next';
import { LandingPage } from '@/components/landing-page';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://medicontrol.com';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'MediControl — Sistema de gestión médica para consultorios y clínicas en Venezuela',
    template: '%s | MediControl',
  },
  description:
    'Agenda médica, historia clínica digital, recetas con firma electrónica, inventario y facturación en dólares y bolívares con tasa BCV automática. Prueba MediControl gratis 7 días.',
  keywords: [
    'software médico Venezuela',
    'sistema para consultorios',
    'historia clínica digital',
    'agenda médica',
    'facturación médica Venezuela',
    'receta electrónica',
    'software clínica',
    'gestión de pacientes',
  ],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'es_VE',
    url: '/',
    siteName: 'MediControl',
    title: 'MediControl — El sistema que ordena tu consultorio en un solo lugar',
    description:
      'Agenda, historia clínica, recetas, inventario y facturación USD/Bs con tasa BCV. Prueba gratis 7 días, sin tarjeta.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MediControl — Sistema de gestión médica',
    description:
      'Agenda, historia clínica, recetas y facturación USD/Bs para médicos y clínicas de Venezuela. 7 días gratis.',
  },
  robots: { index: true, follow: true },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'MediControl',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  description:
    'Sistema de gestión médica en la nube para consultorios, centros médicos y clínicas de Venezuela.',
  offers: [
    { '@type': 'Offer', name: 'Doctor Privado', price: '15', priceCurrency: 'USD' },
    { '@type': 'Offer', name: 'Centro Médico', price: '39', priceCurrency: 'USD' },
    { '@type': 'Offer', name: 'Hospital', price: '79', priceCurrency: 'USD' },
  ],
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <LandingPage />
    </>
  );
}
