'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  Calendar, 
  Users, 
  ClipboardList, 
  Home,
  Stethoscope,
  FileText,
  CreditCard,
  BarChart3,
  Settings,
  LogOut
} from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const navItems = [
  {
    href: '/',
    label: 'Dashboard',
    icon: Home,
    roles: ['admin', 'doctor', 'nurse', 'receptionist'],
  },
  {
    href: '/patients',
    label: 'Pacientes',
    icon: Users,
    roles: ['admin', 'doctor', 'nurse', 'receptionist'],
  },
  {
    href: '/appointments',
    label: 'Citas',
    icon: ClipboardList,
    roles: ['admin', 'doctor', 'nurse', 'receptionist'],
  },
  {
    href: '/calendar',
    label: 'Calendario',
    icon: Calendar,
    roles: ['admin', 'doctor', 'nurse', 'receptionist'],
  },
  {
    href: '/prescriptions',
    label: 'Prescripciones',
    icon: FileText,
    roles: ['admin', 'doctor'],
  },
  {
    href: '/invoices',
    label: 'Facturación',
    icon: CreditCard,
    roles: ['admin', 'receptionist'],
  },
  {
    href: '/reports',
    label: 'Reportes',
    icon: BarChart3,
    roles: ['admin'],
  },
  {
    href: '/users',
    label: 'Usuarios',
    icon: Settings,
    roles: ['admin'],
  },
];

const roleLabels = {
  admin: 'Administrador',
  doctor: 'Doctor',
  nurse: 'Enfermera',
  receptionist: 'Recepcionista',
};

export function Navigation() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  if (!user) return null;

  const allowedNavItems = navItems.filter(item => item.roles.includes(user.role));

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-2">
            <Stethoscope className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">MediControl</span>
          </Link>
          
          <div className="hidden md:flex items-center space-x-8">
            {allowedNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    isActive
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600">
                      {user.firstName[0]}{user.lastName[0]}
                    </span>
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-gray-900">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {roleLabels[user.role]}
                    </p>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Cerrar Sesión</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile menu */}
          <div className="md:hidden flex items-center space-x-2">
            {allowedNavItems.slice(0, 4).map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'p-2 rounded-md transition-colors',
                    isActive
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                  )}
                >
                  <Icon className="h-5 w-5" />
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}