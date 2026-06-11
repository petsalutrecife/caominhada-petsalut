'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Logo from '@/components/Logo';
import ThemeToggle from '@/components/ThemeToggle';
import { supabaseMock } from '@/lib/supabaseMock';
import { Mail, Shield, ArrowLeft, ArrowRight } from 'lucide-react';

export default function InstitutionLoginPage() {
  const router = useRouter();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Redirect if already logged in as institution
    const user = supabaseMock.getCurrentUser();
    if (user && user.role === 'institution') {
      router.push('/institution/dashboard');
    }
  }, [router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Preencha todos os campos.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const res = supabaseMock.signIn(email, password);
      setIsLoading(false);

      if (res.success && res.user.role === 'institution') {
        router.push('/institution/dashboard');
      } else {
        setError(res.error || 'Credenciais inválidas para instituição parceira.');
      }
    }, 800);
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

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden p-8 flex flex-col animate-in zoom-in-95 duration-200">
          
          <div className="text-center mb-8">
            <span className="px-3.5 py-1.5 rounded-full text-[10px] font-extrabold border border-[#8DC63F] text-[#8DC63F] bg-white dark:bg-slate-900 mb-3 inline-block uppercase tracking-wider font-poppins">
              Painel Parceiro
            </span>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white font-poppins">Login da Instituição</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Gerencie suas doações e valide os comprovantes do evento.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {error && (
              <div className="p-3.5 rounded-2xl bg-red-100 dark:bg-red-950/20 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-400 font-semibold">
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
                  placeholder="parceiro@email.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue/30 dark:focus:ring-lime-500/30 transition-all text-slate-800 dark:text-slate-200"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Senha
              </label>
              <div className="relative">
                <Shield className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue/30 dark:focus:ring-lime-500/30 transition-all text-slate-800 dark:text-slate-200"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 py-3 rounded-2xl font-bold bg-[#003A8C] hover:bg-blue-800 text-white dark:bg-lime-500 dark:hover:bg-lime-600 dark:text-slate-950 transition-colors flex items-center justify-center gap-2 hover-lift disabled:opacity-50"
            >
              {isLoading ? 'Autenticando...' : 'Entrar no Painel'} <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="mt-8 border-t border-slate-100 dark:border-slate-900 pt-6 text-center text-xs text-slate-500">
            <p className="text-[10px] text-slate-400">
              Contas Demo: <br />
              <strong>lazaro@abrigo.org</strong> / <strong>password123</strong> <br />
              <strong>patinhas@projeto.org</strong> / <strong>password123</strong>
            </p>
          </div>

        </div>
      </main>
    </div>
  );
}
