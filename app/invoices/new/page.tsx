'use client';

import { useRouter } from 'next/navigation';
import { InvoiceForm } from '@/components/invoice-form';
import { useInvoices } from '@/hooks/use-invoices';

export default function NewInvoicePage() {
  const router = useRouter();
  const { addInvoice } = useInvoices();

  const handleSubmit = (invoiceData: any) => {
    addInvoice(invoiceData);
    router.push('/invoices');
  };

  const handleCancel = () => {
    router.push('/invoices');
  };

  return (
    <div className="max-w-7xl mx-auto px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Nueva Factura</h1>
        <p className="text-gray-600 mt-1">
          Crea una nueva factura para un paciente
        </p>
      </div>
      
      <InvoiceForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </div>
  );
}