'use client';

import { useMemo } from 'react';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  BarChart3, 
  Users, 
  Calendar, 
  CreditCard,
  TrendingUp,
  TrendingDown,
  FileText
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePatients } from '@/hooks/use-patients';
import { useAppointments } from '@/hooks/use-appointments';
import { useInvoices } from '@/hooks/use-invoices';
import { usePrescriptions } from '@/hooks/use-prescriptions';
import { useOrgSettings } from '@/hooks/use-org-settings';
import { formatMoney } from '@/lib/format';

export default function ReportsPage() {
  const { patients } = usePatients();
  const { currency } = useOrgSettings();
  const { appointments } = useAppointments();
  const { invoices } = useInvoices();
  const { prescriptions } = usePrescriptions();

  const stats = useMemo(() => {
    const now = new Date();
    const thirtyDaysAgo = subDays(now, 30);
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    // Patients stats
    const totalPatients = patients.length;
    const newPatientsThisMonth = patients.filter(p => 
      new Date(p.createdAt) >= monthStart && new Date(p.createdAt) <= monthEnd
    ).length;

    // Appointments stats
    const totalAppointments = appointments.length;
    const completedAppointments = appointments.filter(a => a.status === 'completed').length;
    const cancelledAppointments = appointments.filter(a => a.status === 'cancelled').length;
    const appointmentsThisMonth = appointments.filter(a => 
      new Date(a.createdAt) >= monthStart && new Date(a.createdAt) <= monthEnd
    ).length;

    // Revenue stats
    const totalRevenue = invoices
      .filter(i => i.status === 'paid')
      .reduce((sum, i) => sum + i.total, 0);
    
    const revenueThisMonth = invoices
      .filter(i => i.status === 'paid' && 
        new Date(i.createdAt) >= monthStart && new Date(i.createdAt) <= monthEnd
      )
      .reduce((sum, i) => sum + i.total, 0);

    const pendingRevenue = invoices
      .filter(i => i.status === 'pending')
      .reduce((sum, i) => sum + i.total, 0);

    // Prescriptions stats
    const totalPrescriptions = prescriptions.length;
    const activePrescriptions = prescriptions.filter(p => p.status === 'active').length;

    // Appointment types distribution
    const appointmentTypes = appointments.reduce((acc, appointment) => {
      acc[appointment.type] = (acc[appointment.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Monthly trends (last 6 months)
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStart = startOfMonth(date);
      const monthEnd = endOfMonth(date);
      
      const monthAppointments = appointments.filter(a => 
        new Date(a.createdAt) >= monthStart && new Date(a.createdAt) <= monthEnd
      ).length;
      
      const monthRevenue = invoices
        .filter(i => i.status === 'paid' && 
          new Date(i.createdAt) >= monthStart && new Date(i.createdAt) <= monthEnd
        )
        .reduce((sum, i) => sum + i.total, 0);

      monthlyData.push({
        month: format(date, 'MMM yyyy', { locale: es }),
        appointments: monthAppointments,
        revenue: monthRevenue
      });
    }

    return {
      totalPatients,
      newPatientsThisMonth,
      totalAppointments,
      completedAppointments,
      cancelledAppointments,
      appointmentsThisMonth,
      totalRevenue,
      revenueThisMonth,
      pendingRevenue,
      totalPrescriptions,
      activePrescriptions,
      appointmentTypes,
      monthlyData,
      completionRate: totalAppointments > 0 ? Math.round((completedAppointments / totalAppointments) * 100) : 0,
      cancellationRate: totalAppointments > 0 ? Math.round((cancelledAppointments / totalAppointments) * 100) : 0,
    };
  }, [patients, appointments, invoices, prescriptions]);

  const typeLabels = {
    consultation: 'Consultas',
    checkup: 'Chequeos',
    procedure: 'Procedimientos',
    'follow-up': 'Seguimientos',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <BarChart3 className="h-8 w-8 text-teal-600" />
          Reportes y Análisis
        </h1>
        <p className="text-gray-600 mt-1">
          Análisis detallado del rendimiento de la clínica
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Pacientes</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalPatients}</p>
                <p className="text-sm text-emerald-600 flex items-center mt-1">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  +{stats.newPatientsThisMonth} este mes
                </p>
              </div>
              <div className="p-3 rounded-full bg-teal-100">
                <Users className="h-6 w-6 text-teal-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Citas Completadas</p>
                <p className="text-3xl font-bold text-gray-900">{stats.completedAppointments}</p>
                <p className="text-sm text-gray-600 mt-1">
                  {stats.completionRate}% tasa de completado
                </p>
              </div>
              <div className="p-3 rounded-full bg-emerald-100">
                <Calendar className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ingresos Totales</p>
                <p className="text-3xl font-bold text-gray-900">{formatMoney(stats.totalRevenue, currency)}</p>
                <p className="text-sm text-emerald-600 flex items-center mt-1">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  {formatMoney(stats.revenueThisMonth, currency)} este mes
                </p>
              </div>
              <div className="p-3 rounded-full bg-emerald-100">
                <CreditCard className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Prescripciones Activas</p>
                <p className="text-3xl font-bold text-gray-900">{stats.activePrescriptions}</p>
                <p className="text-sm text-gray-600 mt-1">
                  de {stats.totalPrescriptions} totales
                </p>
              </div>
              <div className="p-3 rounded-full bg-amber-100">
                <FileText className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Appointment Types Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Distribución por Tipo de Cita</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(stats.appointmentTypes).map(([type, count]) => {
                const percentage = stats.totalAppointments > 0 
                  ? Math.round((count / stats.totalAppointments) * 100) 
                  : 0;
                
                return (
                  <div key={type} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 bg-teal-500 rounded"></div>
                      <span className="text-sm font-medium">
                        {typeLabels[type as keyof typeof typeLabels] || type}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">{count}</span>
                      <span className="text-sm text-gray-500">({percentage}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Financial Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Resumen Financiero</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-emerald-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-emerald-800">Ingresos Cobrados</p>
                  <p className="text-2xl font-bold text-emerald-900">{formatMoney(stats.totalRevenue, currency)}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-emerald-600" />
              </div>
              
              <div className="flex justify-between items-center p-4 bg-amber-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-amber-800">Pendiente de Cobro</p>
                  <p className="text-2xl font-bold text-amber-900">{formatMoney(stats.pendingRevenue, currency)}</p>
                </div>
                <CreditCard className="h-8 w-8 text-amber-600" />
              </div>
              
              <div className="flex justify-between items-center p-4 bg-teal-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-teal-800">Ingresos Este Mes</p>
                  <p className="text-2xl font-bold text-teal-900">{formatMoney(stats.revenueThisMonth, currency)}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-teal-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Métricas de Rendimiento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Tasa de Completado</span>
                  <span className="text-sm text-gray-600">{stats.completionRate}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-emerald-500 h-2 rounded-full" 
                    style={{ width: `${stats.completionRate}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Tasa de Cancelación</span>
                  <span className="text-sm text-gray-600">{stats.cancellationRate}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-red-500 h-2 rounded-full" 
                    style={{ width: `${stats.cancellationRate}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stats.appointmentsThisMonth}</p>
                    <p className="text-sm text-gray-600">Citas este mes</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stats.newPatientsThisMonth}</p>
                    <p className="text-sm text-gray-600">Nuevos pacientes</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Tendencias Mensuales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.monthlyData.map((month, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{month.month}</p>
                    <p className="text-sm text-gray-600">{month.appointments} citas</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{formatMoney(month.revenue, currency)}</p>
                    <p className="text-sm text-gray-600">ingresos</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}