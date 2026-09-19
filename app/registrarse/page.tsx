'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Hospital, Building, Stethoscope, Loader2, CheckCircle2, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CURRENCIES } from '@/lib/format';
import { OrganizationType } from '@/lib/types';
import { cn } from '@/lib/utils';

const typeOptions: { value: OrganizationType; label: string; description: string; icon: typeof Hospital }[] = [
  {
    value: 'clinic',
    label: 'Clínica',
    description: 'Centro médico con consultas y atención ambulatoria.',
    icon: Building,
  },
  {
    value: 'hospital',
    label: 'Hospital',
    description: 'Institución de salud con múltiples servicios.',
    icon: Hospital,
  },
  {
    value: 'private_doctor',
    label: 'Doctor Privado',
    description: 'Consulta independiente de un profesional.',
    icon: Stethoscope,
  },
];

export default function RegisterPage() {
  const router = useRouter();

  const [orgName, setOrgName] = useState('');
  const [type, setType] = useState<OrganizationType>('clinic');
  const [currency, setCurrency] = useState('USD');
  const [adminFirstName, setAdminFirstName] = useState('');
  const [adminLastName, setAdminLastName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!orgName || !adminFirstName || !adminLastName || !adminEmail || !adminPassword) {
      setError('Todos los campos son obligatorios.');
      return;
    }
    if (adminPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orgName, type, currency,
          adminFirstName, adminLastName, adminEmail, adminPassword,
        }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || 'Error al registrar');

      // Auto-login: guarda la sesión y entra al sistema
      const loginRes = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: adminEmail, password: adminPassword }),
      });
      const user = await loginRes.json();
      if (loginRes.ok) {
        localStorage.setItem('medical_current_user', JSON.stringify(user));
        window.location.href = '/';
        return;
      }
      // Si el auto-login falla, igual la cuenta existe
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrar');
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-indigo-100 py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/">
            <Button variant="ghost" size="icon" className="min-h-[40px] min-w-[40px]">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Crear cuenta</h1>
            <p className="text-gray-600 mt-1 flex items-center gap-2">
              <Gift className="h-4 w-4 text-teal-600" />
              Probá MediControl gratis durante 7 días, sin tarjeta
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tu organización</CardTitle>
              <CardDescription>Será el espacio privado donde gestionarás tus pacientes y citas.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {typeOptions.map((option) => {
                  const Icon = option.icon;
                  const selected = type === option.value;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setType(option.value)}
                      className={cn(
                        'flex flex-col items-start gap-2 rounded-lg border p-4 text-left transition-colors min-h-[44px]',
                        selected
                          ? 'border-teal-600 bg-teal-50 ring-1 ring-teal-600'
                          : 'border-gray-200 hover:border-teal-300 hover:bg-gray-50'
                      )}
                    >
                      <Icon className={cn('h-5 w-5', selected ? 'text-teal-600' : 'text-gray-400')} />
                      <span className={cn('font-medium text-sm', selected ? 'text-teal-700' : 'text-gray-900')}>
                        {option.label}
                      </span>
                      <span className="text-xs text-gray-500">{option.description}</span>
                    </button>
                  );
                })}
              </div>

              <div className="space-y-2">
                <Label htmlFor="orgName">Nombre de la organización</Label>
                <Input
                  id="orgName"
                  placeholder="Ej: Clínica Santa María"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">Moneda de facturación</Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger id="currency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((c) => (
                      <SelectItem key={c.code} value={c.code}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tu cuenta de administrador</CardTitle>
              <CardDescription>
                Como administrador podrás invitar doctores, enfermeras y recepcionistas a tu organización.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="adminFirstName">Nombre</Label>
                  <Input id="adminFirstName" value={adminFirstName} onChange={(e) => setAdminFirstName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="adminLastName">Apellido</Label>
                  <Input id="adminLastName" value={adminLastName} onChange={(e) => setAdminLastName(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="adminEmail">Email</Label>
                <Input
                  id="adminEmail"
                  type="email"
                  placeholder="admin@tuclinica.com"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="adminPassword">Contraseña</Label>
                <Input
                  id="adminPassword"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-md px-4 py-3">{error}</p>
          )}

          <div className="flex items-center justify-end gap-3">
            <Link href="/">
              <Button type="button" variant="outline" disabled={saving}>Cancelar</Button>
            </Link>
            <Button type="submit" disabled={saving} className="flex items-center gap-2 min-h-[44px]">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              Crear cuenta y empezar prueba
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
