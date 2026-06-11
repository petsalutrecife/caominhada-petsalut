'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Logo from '@/components/Logo';
import ThemeToggle from '@/components/ThemeToggle';
import { supabaseMock } from '@/lib/supabaseMock';
import { Mail, Shield, User, ArrowRight, ArrowLeft, Building } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  
  // Tabs: 'participant' | 'institution' | 'admin'
  const [activeTab, setActiveTab] = useState<'participant' | 'institution' | 'admin'>('participant');
  
  // Form fields
  const [email, setEmail] = useState('');
  const [passwordOrCpf, setPasswordOrCpf] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Clear error on tab switch
    setError('');
    setEmail('');
    setPasswordOrCpf('');
  }, [activeTab]);

  // Mask CPF input if on participant tab
  const handleCpfChange = (value: string) => {
    let clean = value.replace(/\D/g, '');
    if (clean.length <= 11) {
      clean = clean.replace(/(\d{3})(\d)/, '$1.$2');
      clean = clean.replace(/(\d{3})(\d)/, '$1.$2');
      clean = clean.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
      setPasswordOrCpf(clean);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (activeTab === 'participant') {
      handleCpfChange(value);
    } else {
      setPasswordOrCpf(value);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !passwordOrCpf.trim()) {
      setError('Preencha todos os campos.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const res = supabaseMock.signIn(email, passwordOrCpf);
      setIsLoading(false);

      if (res.success) {
        if (res.user.role === 'admin') {
          router.push('/admin');
        } else if (res.user.role === 'institution') {
          router.push('/institution/dashboard');
        } else {
          router.push('/dashboard');
        }
      } else {
        setError(res.error || 'Erro ao realizar login.');
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
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white font-poppins">Acesse sua Área</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Escolha seu tipo de acesso para continuar.
            </p>
          </div>

          {/* Triple Tab Switcher */}
          <div className="grid grid-cols-3 p-1.5 bg-slate-100 dark:bg-slate-900 rounded-2xl mb-8 font-poppins">
            <button
              onClick={() => setActiveTab('participant')}
              className={`py-2 px-1 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'participant'
                  ? 'bg-white dark:bg-slate-850 text-primary-blue dark:text-lime-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <span className="flex items-center justify-center gap-1">
                <User className="h-3.5 w-3.5" /> Tutor
              </span>
            </button>
            <button
              onClick={() => setActiveTab('institution')}
              className={`py-2 px-1 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'institution'
                  ? 'bg-white dark:bg-slate-850 text-primary-blue dark:text-lime-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <span className="flex items-center justify-center gap-1">
                <Building className="h-3.5 w-3.5" /> Instituição
              </span>
            </button>
            <button
              onClick={() => setActiveTab('admin')}
              className={`py-2 px-1 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'admin'
                  ? 'bg-white dark:bg-slate-850 text-primary-blue dark:text-lime-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <span className="flex items-center justify-center gap-1">
                <Shield className="h-3.5 w-3.5" /> Admin
              </span>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            {error && (
              <div className="p-3.5 rounded-2xl bg-danger/10 border border-danger/20 text-xs text-danger font-semibold">
                {error}
              </div>
            )}

            {/* Email Field */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                E-mail Cadastrado
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  id="email"
                  type="email"
                  placeholder="exemplo@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue/30 dark:focus:ring-lime-500/30 transition-all text-slate-800 dark:text-slate-200"
                />
              </div>
            </div>

            {/* CPF / Password Field */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="authInput" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {activeTab === 'participant' ? 'CPF do Tutor' : activeTab === 'institution' ? 'Senha da Instituição' : 'Senha de Administrador'}
              </label>
              <div className="relative">
                <Shield className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  id="authInput"
                  type={activeTab === 'participant' ? 'text' : 'password'}
                  placeholder={activeTab === 'participant' ? '000.000.000-00' : '••••••••'}
                  value={passwordOrCpf}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue/30 dark:focus:ring-lime-500/30 transition-all text-slate-800 dark:text-slate-200"
                />
              </div>
              {activeTab === 'participant' && (
                <span className="text-[10px] text-slate-400">Use o CPF exatamente como cadastrado na inscrição.</span>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 py-3 rounded-2xl font-bold bg-primary-blue hover:bg-blue-800 text-white dark:bg-lime-500 dark:hover:bg-lime-600 dark:text-slate-950 transition-colors flex items-center justify-center gap-2 hover-lift disabled:opacity-50"
            >
              {isLoading ? 'Autenticando...' : 'Entrar no Painel'} <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Quick Info / Hints */}
          <div className="mt-8 border-t border-slate-100 dark:border-slate-900 pt-6 text-center text-xs text-slate-500">
            {activeTab === 'participant' && (
              <p>
                Não tem uma inscrição?{' '}
                <Link href="/register" className="text-primary-blue dark:text-lime-400 font-bold hover:underline">
                  Inscreva-se aqui
                </Link>
              </p>
            )}
            {activeTab === 'institution' && (
              <p className="text-[10px] text-slate-400">
                Acesso para ONGs parceiras. <br />
                Exemplo: <strong>lazaro@abrigo.org</strong> / <strong>password123</strong>
              </p>
            )}
            {activeTab === 'admin' && (
              <p className="text-[10px] text-slate-400">
                Acesso administrativo restrito. <br />
                Demo Admin: <strong>admin@petsalut.com.br</strong> / <strong>admin123</strong>
              </p>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
