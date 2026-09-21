'use client';

import Link from 'next/link';
import {
  Stethoscope,
  Calendar,
  ClipboardList,
  FileText,
  Wallet,
  Boxes,
  Activity,
  CreditCard,
  Check,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Globe,
  DollarSign,
  Languages,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const features = [
  {
    icon: Calendar,
    title: 'Agenda y calendario',
    text: 'Citas por doctor, sin choques de horario, recordatorios y vista de calendario.',
  },
  {
    icon: ClipboardList,
    title: 'Historia clínica digital',
    text: 'Triaje, signos vitales, diagnóstico e indicaciones en un expediente por paciente.',
  },
  {
    icon: FileText,
    title: 'Recetas con firma',
    text: 'Recetario electrónico imprimible con la firma digital de cada profesional.',
  },
  {
    icon: Wallet,
    title: 'Caja diaria',
    text: 'Ingresos y egresos del día, desglosados por efectivo, punto y transferencia.',
  },
  {
    icon: CreditCard,
    title: 'Facturación USD / Bs',
    text: 'Facturas en dólares o bolívares con tasa del BCV actualizada automáticamente.',
  },
  {
    icon: Boxes,
    title: 'Inventario inteligente',
    text: 'Stock mínimo, proveedores y descuento automático de consumibles y medicamentos.',
  },
  {
    icon: Activity,
    title: 'Triaje de urgencias',
    text: 'Clasificación por niveles (verde, amarillo, rojo) para priorizar la atención.',
  },
  {
    icon: ShieldCheck,
    title: 'Roles y auditoría',
    text: 'Cada usuario ve solo lo que le toca. Registro completo de accesos y acciones.',
  },
];

const plans = [
  {
    name: 'Doctor Privado',
    price: 15,
    tagline: 'Para consultorios de 1 a 3 usuarios',
    featured: false,
    features: [
      'Agenda y calendario',
      'Historia clínica digital',
      'Recetas con firma digital',
      'Caja básica',
      'Facturación USD / Bs',
      'Hasta 3 usuarios',
    ],
  },
  {
    name: 'Centro Médico',
    price: 39,
    tagline: 'Para policonsultorios y ambulatorios',
    featured: true,
    features: [
      'Todo lo del plan Doctor',
      'Triaje de urgencias',
      'Inventario con proveedores',
      'Reportes por médico',
      'Usuarios con roles ilimitados*',
      'Hasta 15 usuarios',
    ],
  },
  {
    name: 'Hospital',
    price: 79,
    tagline: 'Para clínicas y hospitales',
    featured: false,
    features: [
      'Todo lo del plan Centro Médico',
      'Multi-sucursal',
      'Auditoría completa de seguridad',
      'Logo propio en documentos',
      'Capacitación del equipo',
      'Usuarios ilimitados',
    ],
  },
];

const steps = [
  {
    title: 'Crea tu cuenta',
    text: 'Regístrate con el nombre de tu consultorio o clínica en menos de 2 minutos.',
  },
  {
    title: 'Configura tu equipo',
    text: 'Invita a tus doctores, enfermeras y recepcionistas, cada uno con su rol.',
  },
  {
    title: 'Atiende sin papeles',
    text: 'Agenda, historia clínica, recetas, facturación y caja — todo en un solo lugar.',
  },
];


const WHATSAPP_PHONE = process.env.NEXT_PUBLIC_WHATSAPP_PHONE?.replace(/\D/g, '') ?? '584242399671';
const WHATSAPP_MESSAGE = 'Hola, quiero más información del sistema MediControl';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 antialiased">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Stethoscope className="h-7 w-7 text-teal-600" />
            <span className="text-lg font-bold tracking-tight">MediControl</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
            <a href="#funciones" className="hover:text-teal-600 transition-colors">Funciones</a>
            <a href="#como-funciona" className="hover:text-teal-600 transition-colors">Cómo funciona</a>
            <a href="#planes" className="hover:text-teal-600 transition-colors">Planes</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/panel">
              <Button variant="ghost" className="min-h-[40px]">Iniciar sesión</Button>
            </Link>
            <Link href="/registrarse">
              <Button className="min-h-[40px] bg-teal-600 hover:bg-teal-700">Probar gratis</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-teal-50/80 via-white to-white" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-20 md:pt-24 md:pb-28 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-100 text-teal-800 px-3 py-1 text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5" />
            7 días gratis · Sin tarjeta
          </span>
          <h1 className="mt-6 text-4xl md:text-6xl font-bold tracking-tight text-balance leading-[1.1]">
            El sistema que ordena tu{' '}
            <span className="text-teal-600">consultorio</span> en un solo lugar
          </h1>
          <p className="mt-6 text-lg md:text-xl text-gray-600 max-w-2xl mx-auto text-pretty leading-relaxed">
            Agenda, historia clínica, recetas, inventario y facturación en dólares
            y bolívares. Diseñado para médicos y clínicas de Venezuela.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/registrarse">
              <Button size="lg" className="min-h-[48px] px-8 text-base bg-teal-600 hover:bg-teal-700">
                Empezar mi prueba gratis
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <a href="#planes">
              <Button size="lg" variant="outline" className="min-h-[48px] px-8 text-base">
                Ver planes
              </Button>
            </a>
          </div>
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto text-sm">
            {[
              { icon: Globe, text: '100% en la nube' },
              { icon: DollarSign, text: 'Tasa BCV automática' },
              { icon: Languages, text: 'Español e inglés' },
              { icon: ShieldCheck, text: 'Datos protegidos' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center justify-center gap-2 text-gray-600">
                <Icon className="h-4 w-4 text-teal-600 shrink-0" />
                {text}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Funciones */}
      <section id="funciones" className="py-20 md:py-24 bg-gray-50/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-balance">
              Todo lo que tu consultorio necesita
            </h2>
            <p className="mt-4 text-gray-600 text-pretty">
              Deja atrás los cuadernos y los Excel. MediControl conecta la atención
              al paciente con el dinero de tu práctica.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map(({ icon: Icon, title, text }) => (
              <div
                key={title}
                className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-black/5 hover:shadow-md hover:-translate-y-0.5 transition-all"
              >
                <div className="h-10 w-10 rounded-lg bg-teal-50 flex items-center justify-center">
                  <Icon className="h-5 w-5 text-teal-600" />
                </div>
                <h3 className="mt-4 font-semibold">{title}</h3>
                <p className="mt-1.5 text-sm text-gray-600 leading-relaxed text-pretty">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cómo funciona */}
      <section id="como-funciona" className="py-20 md:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-balance">
              Empieza a usarlo hoy mismo
            </h2>
            <p className="mt-4 text-gray-600 text-pretty">
              Sin instalaciones ni equipos costosos. Si tienes internet, tienes MediControl.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {steps.map((step, i) => (
              <div key={step.title} className="text-center">
                <div className="mx-auto h-12 w-12 rounded-full bg-teal-600 text-white flex items-center justify-center text-lg font-bold tabular-nums">
                  {i + 1}
                </div>
                <h3 className="mt-4 font-semibold">{step.title}</h3>
                <p className="mt-1.5 text-sm text-gray-600 leading-relaxed text-pretty">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Planes */}
      <section id="planes" className="py-20 md:py-24 bg-gray-50/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-balance">
              Planes simples, sin sorpresas
            </h2>
            <p className="mt-4 text-gray-600 text-pretty">
              Precios mensuales en dólares. Empieza con 7 días gratis en cualquier plan.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={cn(
                  'relative flex flex-col rounded-2xl p-8',
                  plan.featured
                    ? 'bg-teal-600 text-white shadow-xl shadow-teal-600/20 md:-my-4 py-12'
                    : 'bg-white ring-1 ring-black/5 shadow-sm'
                )}
              >
                {plan.featured && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-amber-400 text-amber-950 px-4 py-1 text-xs font-bold uppercase tracking-wide">
                    Más popular
                  </span>
                )}
                <h3 className="text-lg font-bold">{plan.name}</h3>
                <p className={cn('mt-1 text-sm', plan.featured ? 'text-teal-100' : 'text-gray-500')}>
                  {plan.tagline}
                </p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-bold tracking-tight tabular-nums">${plan.price}</span>
                  <span className={cn('text-sm', plan.featured ? 'text-teal-100' : 'text-gray-500')}>/mes</span>
                </div>
                <ul className="mt-6 space-y-3 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm">
                      <Check className={cn('h-4 w-4 mt-0.5 shrink-0', plan.featured ? 'text-teal-200' : 'text-teal-600')} />
                      <span className={plan.featured ? 'text-teal-50' : 'text-gray-700'}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/registrarse" className="mt-8">
                  <Button
                    className={cn(
                      'w-full min-h-[44px]',
                      plan.featured
                        ? 'bg-white text-teal-700 hover:bg-teal-50'
                        : 'bg-teal-600 hover:bg-teal-700'
                    )}
                  >
                    Probar 7 días gratis
                  </Button>
                </Link>
              </div>
            ))}
          </div>
          <p className="mt-8 text-center text-xs text-gray-400">
            *Roles según el tamaño de tu equipo. Precios en USD; también aceptamos pago en bolívares a tasa BCV.
          </p>
        </div>
      </section>

      {/* CTA final */}
      <section className="py-20 md:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-balance">
            Tu consultorio ordenado desde mañana
          </h2>
          <p className="mt-4 text-gray-600 max-w-xl mx-auto text-pretty">
            Crea tu cuenta hoy y carga tus pacientes en minutos. Si te convence,
            activas tu licencia cuando quieras.
          </p>
          <Link href="/registrarse" className="inline-block mt-8">
            <Button size="lg" className="min-h-[48px] px-10 text-base bg-teal-600 hover:bg-teal-700">
              Crear mi cuenta gratis
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <Stethoscope className="h-5 w-5 text-teal-600" />
            <span className="font-semibold text-gray-900">MediControl</span>
          </div>
          <p>© {new Date().getFullYear()} MediControl · Gestión médica en la nube</p>
          <a href={`mailto:${process.env.NEXT_PUBLIC_SALES_EMAIL ?? 'elgranjm3000@gmail.com'}`} className="hover:text-teal-600 transition-colors">
            {process.env.NEXT_PUBLIC_SALES_EMAIL ?? 'elgranjm3000@gmail.com'}
          </a>
        </div>
      </footer>

      {/* Botón flotante de WhatsApp: fijo durante el scroll */}
      <a
        href={`https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Escríbenos por WhatsApp"
        className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full bg-[#25D366] pl-3.5 pr-4 py-3 text-sm font-semibold text-white shadow-lg shadow-black/20 hover:bg-[#1ebe5a] hover:scale-105 active:scale-95 transition-all"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6 shrink-0" aria-hidden="true">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
        </svg>
        WhatsApp
      </a>
    </div>
  );
}
