'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Logo from '@/components/Logo';
import ThemeToggle from '@/components/ThemeToggle';
import { supabaseMock, Registration } from '@/lib/supabaseMock';
import { ArrowLeft, User, Phone, Mail, Award, CheckCircle2, Copy, ExternalLink, Calendar, Heart, Shield } from 'lucide-react';
import confetti from 'canvas-confetti';

// CPF validation function (Brazilian Check Digits)
function validateCPF(cpf: string): boolean {
  const cleanCpf = cpf.replace(/\D/g, '');
  if (cleanCpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cleanCpf)) return false; // Reject sequences like 111.111.111-11

  let sum = 0;
  let remainder;

  for (let i = 1; i <= 9; i++) {
    sum = sum + parseInt(cleanCpf.substring(i - 1, i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCpf.substring(9, 10))) return false;

  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum = sum + parseInt(cleanCpf.substring(i - 1, i)) * (12 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCpf.substring(10, 11))) return false;

  return true;
}

export default function RegisterPage() {
  const router = useRouter();
  
  // Form state
  const [tutorName, setTutorName] = useState('');
  const [tutorCpf, setTutorCpf] = useState('');
  const [tutorPhone, setTutorPhone] = useState('');
  const [tutorEmail, setTutorEmail] = useState('');
  
  const [petName, setPetName] = useState('');
  const [petBreed, setPetBreed] = useState('');
  const [petSize, setPetSize] = useState<'Pequeno' | 'Médio' | 'Grande'>('Médio');
  const [petAge, setPetAge] = useState<number>(3);
  
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Flow states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registeredUser, setRegisteredUser] = useState<Registration | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Mask CPF inputs
  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length <= 11) {
      value = value.replace(/(\d{3})(\d)/, '$1.$2');
      value = value.replace(/(\d{3})(\d)/, '$1.$2');
      value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
      setTutorCpf(value);
      if (errors.tutorCpf) {
        setErrors(prev => ({ ...prev, tutorCpf: '' }));
      }
    }
  };

  // Mask Phone inputs
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length <= 11) {
      if (value.length > 10) {
        value = value.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
      } else if (value.length > 5) {
        value = value.replace(/^(\d{2})(\d{4})(\d{0,4})$/, '($1) $2-$3');
      } else if (value.length > 2) {
        value = value.replace(/^(\d{2})(\d{0,5})$/, '($1) $2');
      } else if (value.length > 0) {
        value = value.replace(/^(\d*)$/, '($1');
      }
      setTutorPhone(value);
      if (errors.tutorPhone) {
        setErrors(prev => ({ ...prev, tutorPhone: '' }));
      }
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!tutorName.trim()) newErrors.tutorName = 'Nome completo é obrigatório.';
    
    if (!tutorCpf) {
      newErrors.tutorCpf = 'CPF é obrigatório.';
    } else if (!validateCPF(tutorCpf)) {
      newErrors.tutorCpf = 'CPF inválido. Verifique os dígitos.';
    }
    
    if (!tutorPhone) {
      newErrors.tutorPhone = 'Telefone é obrigatório.';
    } else if (tutorPhone.replace(/\D/g, '').length < 10) {
      newErrors.tutorPhone = 'Telefone deve ter DDD e no mínimo 10 dígitos.';
    }
    
    if (!tutorEmail.trim()) {
      newErrors.tutorEmail = 'E-mail é obrigatório.';
    } else if (!/\S+@\S+\.\S+/.test(tutorEmail)) {
      newErrors.tutorEmail = 'E-mail inválido.';
    }
    
    if (!petName.trim()) newErrors.petName = 'Nome do pet é obrigatório.';
    if (!petBreed.trim()) newErrors.petBreed = 'Raça do pet é obrigatória (coloque SRD/Vira-lata se não souber).';
    if (petAge < 0 || petAge > 30) newErrors.petAge = 'Idade inválida.';
    
    if (!termsAccepted) newErrors.termsAccepted = 'Você deve aceitar os termos do regulamento.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    setTimeout(() => {
      try {
        const saved = supabaseMock.saveRegistration({
          tutorName,
          tutorCpf,
          tutorPhone,
          tutorEmail,
          petName,
          petBreed,
          petSize,
          petAge,
          statusPayment: 'Pendente', // Starts pending until payment simulation
          statusKit: 'Aguardando'
        });
        
        setRegisteredUser(saved);
        setIsSubmitting(false);
        
        // Confetti burst for great UX
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (err) {
        setIsSubmitting(false);
        alert('Erro ao realizar a inscrição. Tente novamente.');
      }
    }, 1200);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleGoToDashboard = () => {
    if (registeredUser) {
      // Auto sign in user for demonstration
      supabaseMock.signIn(registeredUser.tutorEmail, registeredUser.tutorCpf);
      router.push('/dashboard');
    }
  };

  if (registeredUser) {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(registeredUser.qrCode)}`;

    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 transition-colors">
        <header className="h-20 flex items-center justify-between px-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
          <Link href="/">
            <Logo />
          </Link>
          <ThemeToggle />
        </header>

        <main className="flex-1 flex items-center justify-center p-4 py-12">
          <div className="max-w-2xl w-full bg-white dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden p-8 flex flex-col items-center text-center animate-in zoom-in-95 duration-300">
            <div className="p-3 bg-lime-100 dark:bg-lime-950/50 rounded-full text-lime-600 dark:text-lime-400 mb-6">
              <CheckCircle2 className="h-12 w-12" />
            </div>

            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white font-poppins">Inscrição Realizada!</h2>
            <p className="mt-2 text-slate-500 dark:text-slate-400 max-w-md">
              Parabéns, {registeredUser.tutorName.split(' ')[0]}! Sua inscrição para a Cãominhada Petsalut 2026 foi registrada com sucesso.
            </p>

            {/* QR Code and Number Card */}
            <div className="mt-8 bg-slate-50 dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md flex flex-col items-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Número de Inscrição</span>
              <div className="flex items-center gap-2 mb-6">
                <span className="text-xl font-mono font-bold text-primary-blue dark:text-blue-400">{registeredUser.regNumber}</span>
                <button
                  onClick={() => copyToClipboard(registeredUser.regNumber)}
                  className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors"
                  title="Copiar número"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>

              {/* QR Code Container */}
              <div className="relative bg-white p-4 rounded-2xl border border-slate-200 shadow-sm w-48 h-48 flex items-center justify-center">
                <img
                  src={qrUrl}
                  alt={`QR Code para inscrição ${registeredUser.regNumber}`}
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-[10px] text-slate-400 mt-3 max-w-[200px] leading-tight">Apresente este QR Code no dia do evento para retirar seu kit.</span>
            </div>

            {/* Email Confirmation Simulation Card */}
            <div className="mt-6 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 p-5 rounded-2xl w-full max-w-md text-left">
              <div className="flex items-center gap-2.5 text-primary-blue dark:text-blue-400 font-semibold text-sm mb-2">
                <Mail className="h-4 w-4" />
                <span>Simulação de E-mail de Confirmação</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Enviamos um e-mail para <strong>{registeredUser.tutorEmail}</strong> contendo o regulamento, instruções para o dia do evento e um link direto para acessar o seu painel de participante.
              </p>
            </div>

            {/* Next Steps Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4 w-full max-w-md">
              <button
                onClick={handleGoToDashboard}
                className="flex-1 py-3.5 rounded-2xl font-bold bg-primary-blue hover:bg-blue-800 text-white dark:bg-lime-500 dark:hover:bg-lime-600 dark:text-slate-950 hover-lift text-center"
              >
                Acessar Área do Participante
              </button>
              <Link
                href="/"
                className="py-3.5 px-6 rounded-2xl font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors text-center"
              >
                Voltar para o Início
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 transition-colors">
      {/* Header */}
      <header className="h-20 flex items-center justify-between px-6 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
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

      {/* Main Registration Layout */}
      <main className="flex-1 flex items-center justify-center p-4 py-12">
        <div className="max-w-4xl w-full bg-white dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          
          {/* Left panel: Info */}
          <div className="lg:col-span-4 bg-gradient-to-br from-blue-900 via-slate-900 to-slate-950 dark:from-slate-950 dark:via-slate-900 dark:to-emerald-950/20 p-8 text-white flex flex-col justify-between">
            <div className="flex flex-col gap-6">
              <h3 className="text-2xl font-extrabold font-poppins">Inscrição Cãominhada</h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                Garanta o seu lugar e do seu pet no maior evento canino do ano! Preencha as informações para gerar seu número de inscrição.
              </p>

              <div className="flex flex-col gap-4 mt-4 text-xs text-slate-300">
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-lime-400 shrink-0" />
                  <span>20 de Setembro de 2026, 08h</span>
                </div>
                <div className="flex items-center gap-3">
                  <Heart className="h-4 w-4 text-red-400 shrink-0" />
                  <span>Parque Central (Bolsão A)</span>
                </div>
                <div className="flex items-center gap-3">
                  <Award className="h-4 w-4 text-lime-400 shrink-0" />
                  <span>Kit Completo Incluso</span>
                </div>
              </div>
            </div>

            <div className="mt-8 border-t border-slate-800 pt-6 text-[11px] text-slate-500">
              Precisa de ajuda com a inscrição? <br />
              Entre em contato em <strong>eventos@petsalut.com.br</strong>
            </div>
          </div>

          {/* Right panel: Form */}
          <form onSubmit={handleSubmit} className="lg:col-span-8 p-8 flex flex-col gap-6">
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white font-poppins">Ficha de Inscrição</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Preencha os dados do tutor e do cão participante.</p>
            </div>

            <hr className="border-slate-100 dark:border-slate-800" />

            {/* Section 1: Tutor Info */}
            <div className="flex flex-col gap-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-primary-blue dark:text-lime-400">1. Dados do Tutor</h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Tutor Name */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="tutorName" className="text-xs font-bold text-slate-700 dark:text-slate-300">Nome Completo</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      id="tutorName"
                      type="text"
                      placeholder="Seu nome completo"
                      value={tutorName}
                      onChange={(e) => {
                        setTutorName(e.target.value);
                        if (errors.tutorName) setErrors(prev => ({ ...prev, tutorName: '' }));
                      }}
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl border bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue/30 dark:focus:ring-lime-500/30 transition-all ${
                        errors.tutorName ? 'border-danger' : 'border-slate-200 dark:border-slate-800'
                      }`}
                    />
                  </div>
                  {errors.tutorName && <span className="text-[10px] font-semibold text-danger">{errors.tutorName}</span>}
                </div>

                {/* Tutor CPF */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="tutorCpf" className="text-xs font-bold text-slate-700 dark:text-slate-300">CPF (apenas números)</label>
                  <div className="relative">
                    <Shield className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      id="tutorCpf"
                      type="text"
                      placeholder="000.000.000-00"
                      value={tutorCpf}
                      onChange={handleCpfChange}
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl border bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue/30 dark:focus:ring-lime-500/30 transition-all ${
                        errors.tutorCpf ? 'border-danger' : 'border-slate-200 dark:border-slate-800'
                      }`}
                    />
                  </div>
                  {errors.tutorCpf && <span className="text-[10px] font-semibold text-danger">{errors.tutorCpf}</span>}
                </div>

                {/* Tutor Phone */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="tutorPhone" className="text-xs font-bold text-slate-700 dark:text-slate-300">Telefone com DDD</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      id="tutorPhone"
                      type="text"
                      placeholder="(00) 00000-0000"
                      value={tutorPhone}
                      onChange={handlePhoneChange}
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl border bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue/30 dark:focus:ring-lime-500/30 transition-all ${
                        errors.tutorPhone ? 'border-danger' : 'border-slate-200 dark:border-slate-800'
                      }`}
                    />
                  </div>
                  {errors.tutorPhone && <span className="text-[10px] font-semibold text-danger">{errors.tutorPhone}</span>}
                </div>

                {/* Tutor Email */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="tutorEmail" className="text-xs font-bold text-slate-700 dark:text-slate-300">E-mail</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      id="tutorEmail"
                      type="email"
                      placeholder="seu.email@exemplo.com"
                      value={tutorEmail}
                      onChange={(e) => {
                        setTutorEmail(e.target.value);
                        if (errors.tutorEmail) setErrors(prev => ({ ...prev, tutorEmail: '' }));
                      }}
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl border bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue/30 dark:focus:ring-lime-500/30 transition-all ${
                        errors.tutorEmail ? 'border-danger' : 'border-slate-200 dark:border-slate-800'
                      }`}
                    />
                  </div>
                  {errors.tutorEmail && <span className="text-[10px] font-semibold text-danger">{errors.tutorEmail}</span>}
                </div>
              </div>
            </div>

            <hr className="border-slate-100 dark:border-slate-800" />

            {/* Section 2: Pet Info */}
            <div className="flex flex-col gap-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-primary-blue dark:text-lime-400">2. Dados do Cão</h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Pet Name */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="petName" className="text-xs font-bold text-slate-700 dark:text-slate-300">Nome do Pet</label>
                  <input
                    id="petName"
                    type="text"
                    placeholder="Ex: Mel, Thor, Rocky"
                    value={petName}
                    onChange={(e) => {
                      setPetName(e.target.value);
                      if (errors.petName) setErrors(prev => ({ ...prev, petName: '' }));
                    }}
                    className={`w-full px-4 py-2.5 rounded-xl border bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue/30 dark:focus:ring-lime-500/30 transition-all ${
                      errors.petName ? 'border-danger' : 'border-slate-200 dark:border-slate-800'
                    }`}
                  />
                  {errors.petName && <span className="text-[10px] font-semibold text-danger">{errors.petName}</span>}
                </div>

                {/* Pet Breed */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="petBreed" className="text-xs font-bold text-slate-700 dark:text-slate-300">Raça</label>
                  <input
                    id="petBreed"
                    type="text"
                    placeholder="Ex: Golden, Poodle, SDR/Vira-lata"
                    value={petBreed}
                    onChange={(e) => {
                      setPetBreed(e.target.value);
                      if (errors.petBreed) setErrors(prev => ({ ...prev, petBreed: '' }));
                    }}
                    className={`w-full px-4 py-2.5 rounded-xl border bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue/30 dark:focus:ring-lime-500/30 transition-all ${
                      errors.petBreed ? 'border-danger' : 'border-slate-200 dark:border-slate-800'
                    }`}
                  />
                  {errors.petBreed && <span className="text-[10px] font-semibold text-danger">{errors.petBreed}</span>}
                </div>

                {/* Pet Size */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="petSize" className="text-xs font-bold text-slate-700 dark:text-slate-300">Porte</label>
                  <select
                    id="petSize"
                    value={petSize}
                    onChange={(e) => setPetSize(e.target.value as any)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue/30 dark:focus:ring-lime-500/30 transition-all"
                  >
                    <option value="Pequeno">Pequeno (Até 10kg - Ex: Shih Tzu, Poodle)</option>
                    <option value="Médio">Médio (De 10kg a 25kg - Ex: Beagle, Cocker)</option>
                    <option value="Grande">Grande (Acima de 25kg - Ex: Golden, Labrador)</option>
                  </select>
                </div>

                {/* Pet Age */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="petAge" className="text-xs font-bold text-slate-700 dark:text-slate-300">Idade (anos)</label>
                  <input
                    id="petAge"
                    type="number"
                    min="0"
                    max="30"
                    placeholder="Ex: 3"
                    value={petAge}
                    onChange={(e) => {
                      setPetAge(Number(e.target.value));
                      if (errors.petAge) setErrors(prev => ({ ...prev, petAge: '' }));
                    }}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue/30 dark:focus:ring-lime-500/30 transition-all"
                  />
                  {errors.petAge && <span className="text-[10px] font-semibold text-danger">{errors.petAge}</span>}
                </div>
              </div>
            </div>

            <hr className="border-slate-100 dark:border-slate-800" />

            {/* Terms and Submission */}
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-3 select-none">
                <input
                  id="terms"
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => {
                    setTermsAccepted(e.target.checked);
                    if (errors.termsAccepted) setErrors(prev => ({ ...prev, termsAccepted: '' }));
                  }}
                  className="mt-1 h-4 w-4 rounded border-slate-300 dark:border-slate-800 text-primary-blue focus:ring-primary-blue/30 cursor-pointer"
                />
                <label htmlFor="terms" className="text-xs text-slate-500 dark:text-slate-400 cursor-pointer leading-relaxed">
                  Declaro que li e aceito as regras do <Link href="/regulamento" className="text-primary-blue dark:text-lime-400 font-bold hover:underline" target="_blank">Regulamento do Evento</Link>, responsabilizo-me pela saúde e comportamento do meu pet durante a Cãominhada e autorizo o uso de imagem.
                </label>
              </div>
              {errors.termsAccepted && <span className="text-[10px] font-semibold text-danger">{errors.termsAccepted}</span>}

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-4 w-full py-4 rounded-2xl font-bold bg-primary-blue hover:bg-blue-800 text-white dark:bg-lime-500 dark:hover:bg-lime-600 dark:text-slate-950 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 hover-lift shadow-lg shadow-blue-500/10 dark:shadow-lime-500/10"
              >
                {isSubmitting ? 'Processando Inscrição...' : 'Concluir Inscrição'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
