"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface Institution {
  id: string;
  name: string;
  description?: string;
  logoUrl?: string;
}

export default function ChooseInstitutionPage({ params }: { params: { registrationId: string } }) {
  const router = useRouter();
  const { registrationId } = params;
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/institutions')
      .then((res) => res.json())
      .then((data) => {
        setInstitutions(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSelect = async (institutionId: string) => {
    const res = await fetch(`/api/registrations/${registrationId}/choose-institution`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ institutionId }),
    });
    if (res.ok) {
      router.push(`/payment/${registrationId}`);
    } else {
      alert('Erro ao selecionar instituição');
    }
  };

  if (loading) return <p className="text-center mt-8">Carregando instituições…</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 p-6 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Escolha a Instituição Parceira</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 w-full max-w-5xl">
        {institutions.map((inst) => (
          <motion.div
            key={inst.id}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="bg-white bg-opacity-70 backdrop-blur-md rounded-xl shadow-lg p-4 cursor-pointer hover:shadow-xl transition"
            onClick={() => handleSelect(inst.id)}
          >
            {inst.logoUrl && (
              <div className="flex justify-center mb-3">
                <Image src={inst.logoUrl} alt={inst.name} width={80} height={80} className="rounded-full" />
              </div>
            )}
            <h2 className="text-xl font-semibold text-gray-800 text-center">{inst.name}</h2>
            {inst.description && (
              <p className="text-sm text-gray-600 mt-2 text-center line-clamp-3">{inst.description}</p>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
