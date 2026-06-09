"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface Institution {
  id: string;
  name: string;
  logoUrl?: string;
}

type PaymentStatus = 'PAGAMENTO_PENDENTE' | 'AGUARDANDO_CONFIRMACAO' | 'CONFIRMADO' | 'RECUSADO';

interface Registration {
  id: string;
  tutorName: string;
  tutorEmail: string;
  petName: string;
  paymentStatus: PaymentStatus;
  proofFileUrl?: string;
  rejectionReason?: string;
  institution?: Institution;
}

export default function InstitutionDashboard() {
  const router = useRouter();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRegistrations = async () => {
    try {
      const res = await fetch('/api/institution/registrations');
      if (!res.ok) throw new Error('unauthorized');
      const data = await res.json();
      setRegistrations(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const handleConfirm = async (id: string) => {
    await fetch(`/api/institution/registrations/${id}/confirm`, { method: 'POST' });
    fetchRegistrations();
  };

  const handleReject = async (id: string) => {
    const reason = prompt('Informe o motivo da recusa');
    if (!reason) return;
    await fetch(`/api/institution/registrations/${id}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason }),
    });
    fetchRegistrations();
  };

  if (loading) return <p className="text-center mt-8">Carregando dashboard...</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 p-6">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">Dashboard da Instituição</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {registrations.map((reg) => (
          <motion.div
            key={reg.id}
            whileHover={{ scale: 1.02 }}
            className="bg-white bg-opacity-80 backdrop-blur-md rounded-xl shadow-lg p-4 flex flex-col"
          >
            <div className="flex items-center mb-3">
              {reg.institution?.logoUrl && (
                <Image src={reg.institution.logoUrl} alt={reg.institution.name} width={48} height={48} className="rounded-full mr-2" />
              )}
              <h2 className="text-lg font-semibold text-gray-700">{reg.tutorName}</h2>
            </div>
            <p className="text-sm text-gray-600 mb-1"><strong>Pet:</strong> {reg.petName}</p>
            <p className="text-sm text-gray-600 mb-1"><strong>Email:</strong> {reg.tutorEmail}</p>
            <p className="text-sm mb-2">
              <span className="font-medium">Status:</span> {reg.paymentStatus.replace('_', ' ')}
            </p>
            {reg.proofFileUrl && (
              <a href={reg.proofFileUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline mb-2">
                Ver comprovante
              </a>
            )}
            {reg.paymentStatus !== 'CONFIRMADO' && reg.paymentStatus !== 'RECUSADO' && (
              <div className="mt-auto space-y-2">
                <button
                  onClick={() => handleConfirm(reg.id)}
                  className="w-full bg-green-600 text-white py-1 rounded-md hover:bg-green-700 transition"
                >
                  Confirmar
                </button>
                <button
                  onClick={() => handleReject(reg.id)}
                  className="w-full bg-red-600 text-white py-1 rounded-md hover:bg-red-700 transition"
                >
                  Recusar
                </button>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
