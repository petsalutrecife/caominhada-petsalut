'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Logo from '@/components/Logo';
import ThemeToggle from '@/components/ThemeToggle';
import { supabaseMock } from '@/lib/supabaseMock';
import { Mail, Shield, ArrowLeft, ArrowRight, Heart, Sparkles } from 'lucide-react';

const QUICK_ACCOUNTS = [
  {
    id: 'inst-1',
    name: 'Abrigo de Seu Alberto',
    email: 'abrigodoseualberto@petsalute.com',
    password: 'alberto2026',
    emoji: '🐕',
    highlight: true,
    badge: 'Comprovantes Ativos'
  },
  {
    id: 'inst-2',
    name: 'Projeto Amor sem Fronteiras',
    email: 'amorsemfronteiras@petsalute.com',
    password: 'amor2026',
    emoji: '❤️',
    highlight: false,
    badge: 'Parceiro Oficial'
  },
  {
    id: 'inst-3',
    name: 'Todos por Guerreiro',
    email: 'todosporguerreiro@petsalute.com',
    password: 'guerreiro2026',
    emoji: '🐾',
    highlight: false,
    badge: 'Parceiro Oficial'
  }
];

export default function InstitutionLoginPage() {
  const router = useRouter();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Initial sync
    supabaseMock.syncFromSupabase();

    // Redirect if already logged in as institution or admin
    const user = supabaseMock.getCurrentUser();
    if (user && (user.role === 'institution' || user.role === 'admin')) {
      router.push('/institution/dashboard');
    }
  }, [router]);

  const performLogin = (targetEmail: string, targetPass: string) => {
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      const res = supabaseMock.signIn(targetEmail, targetPass);
      setIsLoading(false);

      if (res.success && (res.user?.role === 'institution' || res.user?.role === 'admin')) {
        router.push('/institution/dashboard');
      } else {
        setError(res.error || 'Credenciais inválidas para instituição parceira.');
      }
    }, 400);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Preencha o e-mail e a senha institucional.');
      return;
    }
    performLogin(email, password);
  };

  const handleQuickSelect = (item: typeof QUICK_ACCOUNTS[0]) => {
    setEmail(item.email);
    setPassword(item.password);
    performLogin(item.email, item.password);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 transition-colors">
      <header className="h-20 flex items-center justify-between px-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 sticky top-0 z-40">
        <Link href="/">
          <Logo />
        </Link>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link href="/" className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center gap-1">
            <ArrowLeft className="h-3.5 w-3.5" /> Voltar ao Site
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="max-w-md w-full bg-white dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden p-6 sm:p-8 flex flex-col animate-in zoom-in-95 duration-200">
          
          <div className="text-center mb-6">
            <span className="px-3.5 py-1.5 rounded-full text-[10px] font-extrabold border border-[#8DC63F] text-[#8DC63F] bg-[#8DC63F]/10 mb-3 inline-block uppercase tracking-wider font-poppins">
              Painel Parceiro
            </span>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white font-poppins">Login da Instituição</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Acesse para gerenciar comprovantes PIX e validar inscrições.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && (
              <div className="p-3.5 rounded-2xl bg-red-100 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-400 font-semibold">
                {error}
              </div>
            )}

            {/* Email Field */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                E-mail Institucional
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  id="email"
                  type="email"
                  placeholder="abrigodoseualberto@petsalute.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue/30 dark:focus:ring-lime-500/30 transition-all text-slate-800 dark:text-slate-200"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Senha de Acesso
              </label>
              <div className="relative">
                <Shield className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue/30 dark:focus:ring-lime-500/30 transition-all text-slate-800 dark:text-slate-200"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-1 py-3 rounded-2xl font-bold bg-[#003A8C] hover:bg-blue-800 text-white dark:bg-lime-500 dark:hover:bg-lime-600 dark:text-slate-950 transition-colors flex items-center justify-center gap-2 hover-lift disabled:opacity-50 text-sm shadow-md"
            >
              {isLoading ? 'Autenticando...' : 'Entrar no Painel'} <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Fast 1-Tap Access for Mobile */}
          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-850 flex flex-col gap-2.5">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <span className="flex items-center gap-1"><Sparkles className="h-3.5 w-3.5 text-amber-500" /> Acesso Rápido 1-Toque</span>
              <span>Selecione a ONG</span>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {QUICK_ACCOUNTS.map((ong) => (
                <button
                  key={ong.id}
                  type="button"
                  onClick={() => handleQuickSelect(ong)}
                  className={`flex items-center justify-between p-2.5 rounded-xl border text-left transition-all ${
                    ong.highlight 
                      ? 'border-[#8DC63F]/40 bg-[#8DC63F]/5 hover:bg-[#8DC63F]/15 dark:bg-[#8DC63F]/10' 
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-lg shrink-0">{ong.emoji}</span>
                    <div className="truncate">
                      <span className="font-bold text-xs text-slate-800 dark:text-slate-200 block truncate">{ong.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono block truncate">{ong.email}</span>
                    </div>
                  </div>
                  <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 shrink-0 ml-2">
                    {ong.badge}
                  </span>
                </button>
              ))}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
