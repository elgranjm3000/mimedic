'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { PatientForm } from '@/components/patient-form';
import { usePatients } from '@/hooks/use-patients';

export default function NewPatientPage() {
  const router = useRouter();
  const { addPatient } = usePatients();

  const handleSubmit = async (patientData: any) => {
    try {
      await addPatient(patientData);
      toast.success('Paciente creado correctamente');
      router.push('/patients');
    } catch {
      toast.error('No se pudo guardar. Intentá de nuevo.');
    }
  };

  const handleCancel = () => {
    router.push('/patients');
  };

  return (
    <div className="max-w-7xl mx-auto px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Nuevo Paciente</h1>
        <p className="text-gray-600 mt-1">
          Registra un nuevo paciente en el sistema
        </p>
      </div>
      
      <PatientForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </div>
  );
}