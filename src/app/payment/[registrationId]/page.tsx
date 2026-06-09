"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface Registration {
  id: string;
  paymentStatus: string;
  institution: {
    name: string;
    pixKey?: string;
    pixReceiverName?: string;
    pixBankName?: string;
    pixQrCodeUrl?: string;
  };
}

export default function PaymentPage({ params }: { params: { registrationId: string } }) {
  const router = useRouter();
  const { registrationId } = params;
  const [registration, setRegistration] = useState<Registration | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetch(`/api/registrations/${registrationId}`)
      .then((res) => res.json())
      .then(setRegistration)
      .catch(() => setRegistration(null));
  }, [registrationId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`/api/registrations/${registrationId}/upload-proof`, {
      method: 'POST',
      body: formData,
    });
    setUploading(false);
    if (res.ok) {
      router.push(`/status/${registrationId}`);
    } else {
      alert('Falha ao enviar comprovante');
    }
  };

  if (!registration) return <p className="text-center mt-8">Carregando pagamento...</p>;

  const { institution } = registration;
  const pixKey = institution.pixKey ?? '00000000000'; // placeholder
  const qrUrl = institution.pixQrCodeUrl ?? '/placeholder-qr.png'; // static placeholder image

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-100 flex flex-col items-center p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Pagamento via PIX</h1>
      <div className="bg-white bg-opacity-70 backdrop-blur-md rounded-xl shadow-lg p-6 w-full max-w-lg">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">{institution.name}</h2>
        <p className="text-sm text-gray-600 mb-2">Chave PIX: <span className="font-mono bg-gray-200 px-2 py-1 rounded">{pixKey}</span></p>
        <p className="text-sm text-gray-600 mb-4">Destinatário: {institution.pixReceiverName ?? 'Instituição XYZ'}</p>
        <div className="flex justify-center mb-6">
          <Image src={qrUrl} alt="QR Code PIX" width={200} height={200} className="rounded" />
        </div>
        <div className="border-t pt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Comprovante de pagamento</label>
          <input type="file" accept="image/*,application/pdf" onChange={handleFileChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:bg-indigo-600 file:text-white hover:file:bg-indigo-700" />
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleUpload}
            disabled={!file || uploading}
            className="mt-4 w-full bg-indigo-600 text-white py-2 rounded-md disabled:opacity-50"
          >
            {uploading ? 'Enviando...' : 'Enviar comprovante'}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
