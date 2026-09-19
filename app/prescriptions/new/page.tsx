'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { PrescriptionForm } from '@/components/prescription-form';
import { usePrescriptions } from '@/hooks/use-prescriptions';

export default function NewPrescriptionPage() {
  const router = useRouter();
  const { addPrescription } = usePrescriptions();

  const handleSubmit = async (prescriptionData: any) => {
    try {
      await addPrescription(prescriptionData);
      toast.success('Prescripción creada correctamente');
      router.push('/prescriptions');
    } catch {
      toast.error('No se pudo guardar. Intentá de nuevo.');
    }
  };

  const handleCancel = () => {
    router.push('/prescriptions');
  };

  return (
    <div className="max-w-7xl mx-auto px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Nueva Prescripción</h1>
        <p className="text-gray-600 mt-1">
          Crea una nueva prescripción electrónica
        </p>
      </div>
      
      <PrescriptionForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </div>
  );
}