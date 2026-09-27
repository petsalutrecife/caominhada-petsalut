'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Logo from '@/components/Logo';
import ThemeToggle from '@/components/ThemeToggle';
import { supabaseMock } from '@/lib/supabaseMock';
import RaffleModule from '@/components/RaffleModule';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

export default function AdminSorteadorPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [adminUser, setAdminUser] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
    const currentUser = supabaseMock.getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
      router.push('/login');
      return;
    }
    setAdminUser(currentUser);
  }, [router]);

  if (!mounted || !adminUser) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#003A8C] border-t-transparent dark:border-lime-400" />
          <p className="text-xs font-semibold text-slate-500">Carregando Sorteador...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              href="/admin" 
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Voltar ao Painel Geral
            </Link>
            <div className="h-5 w-[1px] bg-slate-200 dark:bg-slate-800 hidden sm:block" />
            <Logo />
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800">
              <ShieldCheck className="h-3.5 w-3.5" /> Painel de Sorteio Ativo
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <RaffleModule />
      </main>
    </div>
  );
}
