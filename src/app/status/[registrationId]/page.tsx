"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface Institution {
  name: string;
  logoUrl?: string;
}

type PaymentStatus = 'PAGAMENTO_PENDENTE' | 'AGUARDANDO_CONFIRMACAO' | 'CONFIRMADO' | 'RECUSADO';

interface Registration {
  id: string;
  tutorName: string;
  tutorEmail: string;
  tutorPhone: string;
  tutorCpf: string;
  petName: string;
  petBreed?: string;
  petAge?: number;
  paymentStatus: PaymentStatus;
  proofFileUrl?: string;
  rejectionReason?: string;
  institution?: Institution;
}

export default function StatusPage({ params }: { params: { registrationId: string } }) {
  const router = useRouter();
  const { registrationId } = params;
  const [registration, setRegistration] = useState<Registration | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/registrations/${registrationId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then((data) => {
        setRegistration(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        setRegistration(null);
      });
  }, [registrationId]);

  if (loading) return <p className="text-center mt-8">Carregando status...</p>;
  if (!registration) return <p className="text-center mt-8 text-red-600">Inscrição não encontrada.</p>;

  const statusColors: Record<PaymentStatus, string> = {
    PAGAMENTO_PENDENTE: 'bg-yellow-200 text-yellow-800',
    AGUARDANDO_CONFIRMACAO: 'bg-indigo-200 text-indigo-800',
    CONFIRMADO: 'bg-green-200 text-green-800',
    RECUSADO: 'bg-red-200 text-red-800',
  };

  const statusLabels: Record<PaymentStatus, string> = {
    PAGAMENTO_PENDENTE: 'Pagamento pendente',
    AGUARDANDO_CONFIRMACAO: 'Aguardando confirmação da instituição',
    CONFIRMADO: 'Inscrição confirmada',
    RECUSADO: 'Inscrição recusada',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex flex-col items-center p-6">
      <motion.div
        className="bg-white bg-opacity-80 backdrop-blur-md rounded-xl shadow-lg p-8 w-full max-w-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-3xl font-bold mb-6 text-gray-800 text-center">Status da Inscrição</h1>
        {registration.institution && (
          <div className="flex items-center mb-6">
            {registration.institution.logoUrl && (
              <Image src={registration.institution.logoUrl} alt={registration.institution.name} width={64} height={64} className="rounded-full mr-4" />
            )}
            <h2 className="text-xl font-semibold text-gray-700">{registration.institution.name}</h2>
          </div>
        )}
        <div className={`p-4 rounded ${statusColors[registration.paymentStatus]} mb-4 text-center`}>
          <span className="font-medium">{statusLabels[registration.paymentStatus]}</span>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
          <div><strong>Tutor:</strong> {registration.tutorName}</div>
          <div><strong>Email:</strong> {registration.tutorEmail}</div>
          <div><strong>Telefone:</strong> {registration.tutorPhone}</div>
          <div><strong>CPF:</strong> {registration.tutorCpf}</div>
          <div><strong>Pet:</strong> {registration.petName}</div>
          {registration.petBreed && <div><strong>Raça:</strong> {registration.petBreed}</div>}
          {registration.petAge && <div><strong>Idade:</strong> {registration.petAge} anos</div>}
        </div>
        {registration.paymentStatus === 'RECUSADO' && registration.rejectionReason && (
          <div className="bg-red-100 border border-red-300 text-red-800 p-3 rounded mb-4">
            <strong>Motivo da recusa:</strong> {registration.rejectionReason}
          </div>
        )}
        {registration.proofFileUrl && (
          <div className="mb-4">
            <a href={registration.proofFileUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
              Ver comprovante enviado
            </a>
          </div>
        )}
        <button
          onClick={() => router.push('/')}
          className="mt-4 w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition"
        >
          Voltar à página inicial
        </button>
      </motion.div>
    </div>
  );
}
