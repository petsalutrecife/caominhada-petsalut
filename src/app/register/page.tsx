'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Logo from '@/components/Logo';
import ThemeToggle from '@/components/ThemeToggle';
import { supabaseMock, Registration, Institution } from '@/lib/supabaseMock';
import { 
  ArrowLeft, ArrowRight, User, Phone, Mail, Award, CheckCircle2, Copy, 
  Calendar, Heart, Shield, Camera, Upload, MapPin, MessageCircle,
  PawPrint, Building2, CreditCard, FileCheck, ChevronRight, Check, X,
  Compass, DollarSign, FileText
} from 'lucide-react';
import confetti from 'canvas-confetti';

// Brazilian states
const brazilianStates = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG',
  'PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'
];

// CPF validation function (Brazilian Check Digits)
function validateCPF(cpf: string): boolean {
  const cleanCpf = cpf.replace(/\D/g, '');
  if (cleanCpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cleanCpf)) return false;

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

const stepLabels = [
  { label: 'Participante', icon: User },
  { label: 'Pet', icon: PawPrint },
  { label: 'Escolha', icon: Compass },
  { label: 'Instituição', icon: Heart },
  { label: 'PIX', icon: CreditCard },
  { label: 'Comprovante', icon: Upload },
];

export default function RegisterPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  
  // Step 1: Participant data
  const [tutorName, setTutorName] = useState('');
  const [tutorCpf, setTutorCpf] = useState('');
  const [tutorBirthDate, setTutorBirthDate] = useState('');
  const [tutorPhone, setTutorPhone] = useState('');
  const [tutorWhatsApp, setTutorWhatsApp] = useState('');
  const [tutorEmail, setTutorEmail] = useState('');
  const [tutorCity, setTutorCity] = useState('');
  const [tutorState, setTutorState] = useState('PE');
  
  // Step 2: Pet data
  const [petName, setPetName] = useState('');
  const [petSpecies, setPetSpecies] = useState('Cachorro');
  const [petBreed, setPetBreed] = useState('');
  const [petSize, setPetSize] = useState<'Pequeno' | 'Médio' | 'Grande'>('Médio');
  const [petAge, setPetAge] = useState<number>(3);
  const [petPhoto, setPetPhoto] = useState('');
  
  // Step 3: Institution selection
  const [selectedInstitution, setSelectedInstitution] = useState('');
  
  // Step 4: Donation Value
  const [donationValue, setDonationValue] = useState<number>(50);
  const [customValue, setCustomValue] = useState<string>('');
  
  // Step 5: PIX Donation
  const [copiedPix, setCopiedPix] = useState(false);
  
  // Step 6: Upload Receipt
  const [donationReceipt, setDonationReceipt] = useState('');
  const [donationReceiptName, setDonationReceiptName] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  
  // General
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registeredUser, setRegisteredUser] = useState<Registration | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    // Only display active institutions
    const allInsts = supabaseMock.getInstitutions();
    setInstitutions(allInsts.filter(i => i.status === 'Ativo'));
  }, []);

  // Mask CPF inputs
  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length <= 11) {
      value = value.replace(/(\d{3})(\d)/, '$1.$2');
      value = value.replace(/(\d{3})(\d)/, '$1.$2');
      value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
      setTutorCpf(value);
      if (errors.tutorCpf) setErrors(prev => ({ ...prev, tutorCpf: '' }));
    }
  };

  // Mask Phone inputs
  const handlePhoneChange = (setter: (v: string) => void, errorKey: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
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
      setter(value);
      if (errors[errorKey]) setErrors(prev => ({ ...prev, [errorKey]: '' }));
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (step === 1) {
      if (!tutorName.trim()) newErrors.tutorName = 'Nome completo é obrigatório.';
      if (!tutorCpf) {
        newErrors.tutorCpf = 'CPF é obrigatório.';
      } else if (!validateCPF(tutorCpf)) {
        newErrors.tutorCpf = 'CPF inválido. Verifique os dígitos.';
      }
      if (!tutorBirthDate) newErrors.tutorBirthDate = 'Data de nascimento é obrigatória.';
      if (!tutorPhone) {
        newErrors.tutorPhone = 'Telefone é obrigatório.';
      } else if (tutorPhone.replace(/\D/g, '').length < 10) {
        newErrors.tutorPhone = 'Telefone deve ter DDD + número.';
      }
      if (!tutorWhatsApp) {
        newErrors.tutorWhatsApp = 'WhatsApp é obrigatório.';
      } else if (tutorWhatsApp.replace(/\D/g, '').length < 10) {
        newErrors.tutorWhatsApp = 'WhatsApp deve ter DDD + número.';
      }
      if (!tutorEmail.trim()) {
        newErrors.tutorEmail = 'E-mail é obrigatório.';
      } else if (!/\S+@\S+\.\S+/.test(tutorEmail)) {
        newErrors.tutorEmail = 'E-mail inválido.';
      }
      if (!tutorCity.trim()) newErrors.tutorCity = 'Cidade é obrigatória.';
      if (!tutorState) newErrors.tutorState = 'Estado é obrigatório.';
    }
    
    if (step === 2) {
      if (!petName.trim()) newErrors.petName = 'Nome do pet é obrigatório.';
      if (!petBreed.trim()) newErrors.petBreed = 'Raça é obrigatória (coloque SRD se não souber).';
      if (petAge < 0 || petAge > 30) newErrors.petAge = 'Idade inválida.';
    }
    
    if (step === 3) {
      if (!selectedInstitution) newErrors.selectedInstitution = 'Escolha uma instituição para receber sua doação.';
    }
    
    if (step === 4) {
      const finalValue = donationValue === 0 ? Number(customValue) : donationValue;
      if (!finalValue || isNaN(finalValue) || finalValue < 50) {
        newErrors.donationValue = 'O valor da doação deve ser de no mínimo R$ 50,00.';
      }
    }

    if (step === 6) {
      if (!donationReceipt) newErrors.donationReceipt = 'Envie o comprovante de doação PIX.';
      if (!termsAccepted) newErrors.termsAccepted = 'Você deve aceitar os termos do regulamento.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 7));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    setErrors({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectInstitution = (instId: string) => {
    setSelectedInstitution(instId);
    setErrors({});
    setCurrentStep(4);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleValueSelection = (value: number) => {
    setDonationValue(value);
    setCustomValue('');
    if (errors.donationValue) setErrors(prev => ({ ...prev, donationValue: '' }));
  };

  const handleCustomValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDonationValue(0);
    setCustomValue(e.target.value);
    if (errors.donationValue) setErrors(prev => ({ ...prev, donationValue: '' }));
  };

  const getFinalDonationValue = (): number => {
    return donationValue === 0 ? Number(customValue) : donationValue;
  };

  const handleSubmit = () => {
    if (!validateStep(6)) return;

    setIsSubmitting(true);
    const finalVal = getFinalDonationValue();
    
    setTimeout(() => {
      try {
        const saved = supabaseMock.saveRegistration({
          tutorName,
          tutorCpf,
          tutorBirthDate,
          tutorPhone,
          tutorWhatsApp,
          tutorEmail,
          tutorCity,
          tutorState,
          petName,
          petSpecies,
          petBreed,
          petSize,
          petAge,
          petPhoto,
          selectedInstitution,
          donationValue: finalVal,
          donationReceipt,
          donationStatus: 'AGUARDANDO VALIDAÇÃO',
          statusPayment: 'Pendente',
          statusKit: 'Aguardando'
        });
        
        setRegisteredUser(saved);
        setCurrentStep(7);
        setIsSubmitting(false);
        
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 }
        });
      } catch {
        setIsSubmitting(false);
        alert('Erro ao realizar a inscrição. Tente novamente.');
      }
    }, 1500);
  };

  const copyToClipboard = (text: string, setter: (v: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setter(true);
    setTimeout(() => setter(false), 2500);
  };

  const handleGoToDashboard = () => {
    if (registeredUser) {
      supabaseMock.signIn(registeredUser.tutorEmail, registeredUser.tutorCpf);
      router.push('/dashboard');
    }
  };

  const selectedInst = institutions.find(i => i.id === selectedInstitution);

  // ===================== STEP 7: CONCLUSION =====================
  if (currentStep === 7 && registeredUser) {
    const instName = institutions.find(i => i.id === registeredUser.selectedInstitution)?.name || '';

    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 transition-colors">
        <header className="h-20 flex items-center justify-between px-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
          <Link href="/"><Logo /></Link>
          <ThemeToggle />
        </header>

        <main className="flex-1 flex items-center justify-center p-4 py-12">
          <div className="max-w-2xl w-full bg-white dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden p-8 flex flex-col items-center text-center animate-in zoom-in-95 duration-300">
            
            <div className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-full text-amber-500 mb-6">
              <FileCheck className="h-14 w-14" />
            </div>

            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white font-poppins">
              Recebemos sua inscrição! 🐾
            </h2>
            <p className="mt-3 text-slate-500 dark:text-slate-400 max-w-md leading-relaxed">
              Parabéns, <strong>{registeredUser.tutorName.split(' ')[0]}</strong>! Sua inscrição foi registrada com sucesso e agora está na fila de aprovação.
            </p>

            {/* Status Badge */}
            <div className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 text-sm font-bold">
              <div className="h-2.5 w-2.5 rounded-full bg-amber-500 animate-pulse" />
              Aguardando validação da instituição
            </div>

            <p className="mt-4 text-xs text-slate-500 dark:text-slate-400 max-w-lg leading-relaxed">
              Nossa equipe e a instituição parceira escolhida irão validar a sua doação. Assim que for confirmada, você receberá um e-mail de confirmação e sua inscrição com o QR Code para retirada do kit será liberada.
            </p>

            {/* Receipt Summary info */}
            <div className="mt-8 bg-slate-50 dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md text-left flex flex-col gap-3">
              <div className="flex justify-between items-center py-1.5 border-b border-slate-200/50 dark:border-slate-800/50">
                <span className="text-xs text-slate-400 font-semibold">Número da Inscrição</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-sm font-bold text-[#003A8C] dark:text-blue-400">{registeredUser.regNumber}</span>
                  <button
                    onClick={() => copyToClipboard(registeredUser.regNumber, setCopiedCode)}
                    className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors"
                    title="Copiar número"
                  >
                    {copiedCode ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-slate-200/50 dark:border-slate-800/50">
                <span className="text-xs text-slate-400 font-semibold">Instituição Escolhida</span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{instName}</span>
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-slate-200/50 dark:border-slate-800/50">
                <span className="text-xs text-slate-400 font-semibold">Valor da Doação</span>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">R$ {registeredUser.donationValue.toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center py-1.5">
                <span className="text-xs text-slate-400 font-semibold">Data de Envio</span>
                <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                  {new Date(registeredUser.createdAt).toLocaleDateString('pt-BR')} às {new Date(registeredUser.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>

            {/* Info card */}
            <div className="mt-6 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 p-5 rounded-2xl w-full max-w-md text-left">
              <div className="flex items-center gap-2.5 text-[#003A8C] dark:text-blue-400 font-semibold text-xs mb-1.5">
                <Mail className="h-4 w-4" />
                <span>Acompanhe pelo e-mail</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                Enviamos os detalhes do cadastro para <strong>{registeredUser.tutorEmail}</strong>. 
                Você pode conferir o andamento na sua área de participante a qualquer momento.
              </p>
            </div>

            {/* Action buttons */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4 w-full max-w-md">
              <button
                onClick={handleGoToDashboard}
                className="flex-1 py-3.5 rounded-2xl font-bold bg-[#003A8C] hover:bg-blue-800 text-white dark:bg-lime-500 dark:hover:bg-lime-600 dark:text-slate-950 hover-lift text-center transition-all"
              >
                Área do Participante
              </button>
              <Link
                href="/"
                className="py-3.5 px-6 rounded-2xl font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors text-center text-xs"
              >
                Voltar ao Início
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ===================== MAIN WIZARD =====================
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 transition-colors">
      {/* Header */}
      <header className="h-20 flex items-center justify-between px-6 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
        <Link href="/"><Logo /></Link>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link href="/" className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center gap-1">
            <ArrowLeft className="h-3.5 w-3.5" /> Voltar ao Site
          </Link>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-white dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800 px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between relative">
            {/* Progress Line */}
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-slate-200 dark:bg-slate-800 z-0" />
            <div 
              className="absolute top-5 left-0 h-0.5 bg-[#8DC63F] z-0 transition-all duration-500 ease-out"
              style={{ width: `${((Math.min(currentStep, 6) - 1) / 5) * 100}%` }}
            />

            {stepLabels.map((step, index) => {
              const stepNum = index + 1;
              const isCompleted = currentStep > stepNum;
              const isCurrent = currentStep === stepNum;
              const StepIcon = step.icon;

              return (
                <div key={index} className="flex flex-col items-center relative z-10">
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300
                    ${isCompleted 
                      ? 'bg-[#8DC63F] border-[#8DC63F] text-white shadow-lg shadow-lime-500/20' 
                      : isCurrent 
                        ? 'bg-[#003A8C] border-[#003A8C] text-white shadow-lg shadow-blue-500/20 scale-110' 
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-400'
                    }
                  `}>
                    {isCompleted ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <StepIcon className="h-4 w-4" />
                    )}
                  </div>
                  <span className={`
                    mt-2 text-[9px] font-bold uppercase tracking-wider transition-colors hidden sm:block
                    ${isCompleted ? 'text-[#8DC63F]' : isCurrent ? 'text-[#003A8C] dark:text-blue-400' : 'text-slate-400'}
                  `}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Form Content */}
      <main className="flex-1 flex items-start justify-center p-4 py-8">
        <div className="max-w-2xl w-full">

          {/* ========== STEP 1: DADOS DO PARTICIPANTE ========== */}
          {currentStep === 1 && (
            <div className="bg-white dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden animate-in fade-in slide-in-from-right-5 duration-300">
              <div className="bg-gradient-to-r from-[#003A8C] to-blue-700 p-6 text-white">
                <h3 className="text-xl font-extrabold font-poppins flex items-center gap-3">
                  <User className="h-6 w-6" />
                  Dados do Participante
                </h3>
                <p className="text-blue-200 text-sm mt-1">Preencha seus dados pessoais para a inscrição.</p>
              </div>

              <div className="p-6 flex flex-col gap-5">
                {/* Nome */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="tutorName" className="text-xs font-bold text-slate-700 dark:text-slate-300">Nome Completo *</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input id="tutorName" type="text" placeholder="Seu nome completo" value={tutorName}
                      onChange={(e) => { setTutorName(e.target.value); if (errors.tutorName) setErrors(prev => ({ ...prev, tutorName: '' })); }}
                      className={`w-full pl-10 pr-4 py-3 rounded-xl border bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-[#003A8C]/30 dark:focus:ring-lime-500/30 transition-all ${errors.tutorName ? 'border-red-400' : 'border-slate-200 dark:border-slate-800'}`}
                    />
                  </div>
                  {errors.tutorName && <span className="text-[10px] font-semibold text-red-500">{errors.tutorName}</span>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* CPF */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="tutorCpf" className="text-xs font-bold text-slate-700 dark:text-slate-300">CPF *</label>
                    <div className="relative">
                      <Shield className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input id="tutorCpf" type="text" placeholder="000.000.000-00" value={tutorCpf} onChange={handleCpfChange}
                        className={`w-full pl-10 pr-4 py-3 rounded-xl border bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-[#003A8C]/30 dark:focus:ring-lime-500/30 transition-all ${errors.tutorCpf ? 'border-red-400' : 'border-slate-200 dark:border-slate-800'}`}
                      />
                    </div>
                    {errors.tutorCpf && <span className="text-[10px] font-semibold text-red-500">{errors.tutorCpf}</span>}
                  </div>

                  {/* Data Nascimento */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="tutorBirthDate" className="text-xs font-bold text-slate-700 dark:text-slate-300">Data de Nascimento *</label>
                    <div className="relative">
                      <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input id="tutorBirthDate" type="date" value={tutorBirthDate}
                        onChange={(e) => { setTutorBirthDate(e.target.value); if (errors.tutorBirthDate) setErrors(prev => ({ ...prev, tutorBirthDate: '' })); }}
                        className={`w-full pl-10 pr-4 py-3 rounded-xl border bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-[#003A8C]/30 dark:focus:ring-lime-500/30 transition-all ${errors.tutorBirthDate ? 'border-red-400' : 'border-slate-200 dark:border-slate-800'}`}
                      />
                    </div>
                    {errors.tutorBirthDate && <span className="text-[10px] font-semibold text-red-500">{errors.tutorBirthDate}</span>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Telefone */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="tutorPhone" className="text-xs font-bold text-slate-700 dark:text-slate-300">Telefone *</label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input id="tutorPhone" type="text" placeholder="(00) 00000-0000" value={tutorPhone}
                        onChange={handlePhoneChange(setTutorPhone, 'tutorPhone')}
                        className={`w-full pl-10 pr-4 py-3 rounded-xl border bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-[#003A8C]/30 dark:focus:ring-lime-500/30 transition-all ${errors.tutorPhone ? 'border-red-400' : 'border-slate-200 dark:border-slate-800'}`}
                      />
                    </div>
                    {errors.tutorPhone && <span className="text-[10px] font-semibold text-red-500">{errors.tutorPhone}</span>}
                  </div>

                  {/* WhatsApp */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="tutorWhatsApp" className="text-xs font-bold text-slate-700 dark:text-slate-300">WhatsApp *</label>
                    <div className="relative">
                      <MessageCircle className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input id="tutorWhatsApp" type="text" placeholder="(00) 00000-0000" value={tutorWhatsApp}
                        onChange={handlePhoneChange(setTutorWhatsApp, 'tutorWhatsApp')}
                        className={`w-full pl-10 pr-4 py-3 rounded-xl border bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-[#003A8C]/30 dark:focus:ring-lime-500/30 transition-all ${errors.tutorWhatsApp ? 'border-red-400' : 'border-slate-200 dark:border-slate-800'}`}
                      />
                    </div>
                    {errors.tutorWhatsApp && <span className="text-[10px] font-semibold text-red-500">{errors.tutorWhatsApp}</span>}
                  </div>
                </div>

                {/* Email */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="tutorEmail" className="text-xs font-bold text-slate-700 dark:text-slate-300">E-mail *</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input id="tutorEmail" type="email" placeholder="seu.email@exemplo.com" value={tutorEmail}
                      onChange={(e) => { setTutorEmail(e.target.value); if (errors.tutorEmail) setErrors(prev => ({ ...prev, tutorEmail: '' })); }}
                      className={`w-full pl-10 pr-4 py-3 rounded-xl border bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-[#003A8C]/30 dark:focus:ring-lime-500/30 transition-all ${errors.tutorEmail ? 'border-red-400' : 'border-slate-200 dark:border-slate-800'}`}
                    />
                  </div>
                  {errors.tutorEmail && <span className="text-[10px] font-semibold text-red-500">{errors.tutorEmail}</span>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Cidade */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="tutorCity" className="text-xs font-bold text-slate-700 dark:text-slate-300">Cidade *</label>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input id="tutorCity" type="text" placeholder="Sua cidade" value={tutorCity}
                        onChange={(e) => { setTutorCity(e.target.value); if (errors.tutorCity) setErrors(prev => ({ ...prev, tutorCity: '' })); }}
                        className={`w-full pl-10 pr-4 py-3 rounded-xl border bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-[#003A8C]/30 dark:focus:ring-lime-500/30 transition-all ${errors.tutorCity ? 'border-red-400' : 'border-slate-200 dark:border-slate-800'}`}
                      />
                    </div>
                    {errors.tutorCity && <span className="text-[10px] font-semibold text-red-500">{errors.tutorCity}</span>}
                  </div>

                  {/* Estado */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="tutorState" className="text-xs font-bold text-slate-700 dark:text-slate-300">Estado *</label>
                    <select id="tutorState" value={tutorState} onChange={(e) => setTutorState(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-[#003A8C]/30 dark:focus:ring-lime-500/30 transition-all"
                    >
                      {brazilianStates.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    {errors.tutorState && <span className="text-[10px] font-semibold text-red-500">{errors.tutorState}</span>}
                  </div>
                </div>

                {/* Next button */}
                <button onClick={handleNext}
                  className="mt-4 w-full py-4 rounded-2xl font-bold bg-[#8DC63F] hover:bg-[#7cb335] text-white transition-colors flex items-center justify-center gap-2 hover-lift shadow-lg shadow-lime-500/10"
                >
                  Continuar <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}

          {/* ========== STEP 2: DADOS DO PET ========== */}
          {currentStep === 2 && (
            <div className="bg-white dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden animate-in fade-in slide-in-from-right-5 duration-300">
              <div className="bg-gradient-to-r from-[#8DC63F] to-lime-500 p-6 text-white">
                <h3 className="text-xl font-extrabold font-poppins flex items-center gap-3">
                  <PawPrint className="h-6 w-6" />
                  Dados do Pet
                </h3>
                <p className="text-lime-100 text-sm mt-1">Conte-nos sobre o seu companheiro peludo!</p>
              </div>

              <div className="p-6 flex flex-col gap-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Pet Name */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="petName" className="text-xs font-bold text-slate-700 dark:text-slate-300">Nome do Pet *</label>
                    <input id="petName" type="text" placeholder="Ex: Mel, Thor, Rocky" value={petName}
                      onChange={(e) => { setPetName(e.target.value); if (errors.petName) setErrors(prev => ({ ...prev, petName: '' })); }}
                      className={`w-full px-4 py-3 rounded-xl border bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-[#8DC63F]/30 transition-all ${errors.petName ? 'border-red-400' : 'border-slate-200 dark:border-slate-800'}`}
                    />
                    {errors.petName && <span className="text-[10px] font-semibold text-red-500">{errors.petName}</span>}
                  </div>

                  {/* Pet Species */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="petSpecies" className="text-xs font-bold text-slate-700 dark:text-slate-300">Espécie *</label>
                    <select id="petSpecies" value={petSpecies} onChange={(e) => setPetSpecies(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-[#8DC63F]/30 transition-all"
                    >
                      <option value="Cachorro">🐶 Cachorro</option>
                      <option value="Gato">🐱 Gato</option>
                      <option value="Outro">🐾 Outro</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Pet Breed */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="petBreed" className="text-xs font-bold text-slate-700 dark:text-slate-300">Raça *</label>
                    <input id="petBreed" type="text" placeholder="Ex: Golden, Poodle, SRD" value={petBreed}
                      onChange={(e) => { setPetBreed(e.target.value); if (errors.petBreed) setErrors(prev => ({ ...prev, petBreed: '' })); }}
                      className={`w-full px-4 py-3 rounded-xl border bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-[#8DC63F]/30 transition-all ${errors.petBreed ? 'border-red-400' : 'border-slate-200 dark:border-slate-800'}`}
                    />
                    {errors.petBreed && <span className="text-[10px] font-semibold text-red-500">{errors.petBreed}</span>}
                  </div>

                  {/* Pet Size */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="petSize" className="text-xs font-bold text-slate-700 dark:text-slate-300">Porte *</label>
                    <select id="petSize" value={petSize} onChange={(e) => setPetSize(e.target.value as 'Pequeno' | 'Médio' | 'Grande')}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-[#8DC63F]/30 transition-all"
                    >
                      <option value="Pequeno">Pequeno (Até 10kg)</option>
                      <option value="Médio">Médio (10kg a 25kg)</option>
                      <option value="Grande">Grande (Acima de 25kg)</option>
                    </select>
                  </div>
                </div>

                {/* Pet Age */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="petAge" className="text-xs font-bold text-slate-700 dark:text-slate-300">Idade (anos) *</label>
                  <input id="petAge" type="number" min="0" max="30" value={petAge}
                    onChange={(e) => { setPetAge(Number(e.target.value)); if (errors.petAge) setErrors(prev => ({ ...prev, petAge: '' })); }}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-[#8DC63F]/30 transition-all"
                  />
                  {errors.petAge && <span className="text-[10px] font-semibold text-red-500">{errors.petAge}</span>}
                </div>

                {/* Pet Photo Upload */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Foto do Pet (Opcional)</label>
                  <div className="flex flex-col sm:flex-row items-center gap-4 p-5 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                    <div className="relative h-24 w-24 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-slate-250 dark:border-slate-700 flex items-center justify-center overflow-hidden shrink-0">
                      {petPhoto ? (
                        <img src={petPhoto} alt="Foto do Pet" className="w-full h-full object-cover" />
                      ) : (
                        <Camera className="h-10 w-10 text-slate-400" />
                      )}
                    </div>
                    <div className="flex flex-col items-start gap-2">
                      <label className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 dark:bg-slate-850 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 cursor-pointer flex items-center gap-2 hover-lift transition-all animate-all">
                        <Upload className="h-4 w-4" /> Escolher Foto
                        <input type="file" accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => setPetPhoto(reader.result as string);
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="hidden"
                        />
                      </label>
                      <span className="text-[10px] text-slate-400">JPG, PNG. Máx 2MB.</span>
                      {petPhoto && (
                        <button onClick={() => setPetPhoto('')} className="text-[10px] text-red-400 hover:text-red-600 font-bold flex items-center gap-1">
                          <X className="h-3 w-3" /> Remover foto
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex gap-4 mt-4">
                  <button onClick={handleBack}
                    className="flex-1 py-4 rounded-2xl font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors flex items-center justify-center gap-2"
                  >
                    <ArrowLeft className="h-5 w-5" /> Voltar
                  </button>
                  <button onClick={handleNext}
                    className="flex-[2] py-4 rounded-2xl font-bold bg-[#8DC63F] hover:bg-[#7cb335] text-white transition-colors flex items-center justify-center gap-2 hover-lift shadow-lg shadow-lime-500/10"
                  >
                    Continuar <ArrowRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========== STEP 3: ESCOLHA DA INSTITUIÇÃO (3 Cards) ========== */}
          {currentStep === 3 && (
            <div className="animate-in fade-in slide-in-from-right-5 duration-300">
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50 text-red-500 text-xs font-bold mb-4">
                  <Heart className="h-4 w-4" /> Faça a diferença
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#003A8C] dark:text-white font-poppins">
                  Escolha a instituição que receberá sua doação
                </h2>
                <p className="mt-3 text-sm text-slate-550 dark:text-slate-400 max-w-lg mx-auto leading-relaxed">
                  Sua participação ajudará diretamente projetos que transformam a vida de milhares de animais.
                </p>
              </div>

              {/* Institution 3 big cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {institutions.slice(0, 3).map((inst) => (
                  <div 
                    key={inst.id}
                    className={`
                      bg-white dark:bg-slate-950 rounded-3xl border-2 overflow-hidden hover-lift shadow-md flex flex-col justify-between transition-all duration-200
                      ${selectedInstitution === inst.id ? 'border-[#8DC63F] ring-4 ring-lime-500/10' : 'border-slate-200 dark:border-slate-800'}
                    `}
                  >
                    {/* Photo */}
                    <div className="h-40 w-full relative bg-slate-100 dark:bg-slate-900">
                      <img src={inst.photo} alt={inst.name} className="h-full w-full object-cover" />
                      <div className="absolute top-3 left-3 h-10 w-10 rounded-full bg-white dark:bg-slate-900 shadow-md flex items-center justify-center text-xl">
                        {inst.logo}
                      </div>
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-extrabold text-slate-900 dark:text-white font-poppins text-base line-clamp-1">{inst.name}</h4>
                        <span className="text-[10px] font-bold text-slate-400 mt-1 block flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> {inst.city}/{inst.state}
                        </span>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 leading-relaxed line-clamp-4">
                          {inst.description}
                        </p>
                      </div>

                      <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-850 flex items-center justify-between">
                        <div className="text-left">
                          <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400">Atendidos</span>
                          <span className="block text-sm font-black text-[#003A8C] dark:text-blue-400 font-poppins">{inst.animalsServed} animais</span>
                        </div>
                        <button
                          onClick={() => handleSelectInstitution(inst.id)}
                          className="px-4 py-2 rounded-xl text-xs font-bold bg-[#8DC63F] hover:bg-[#7cb335] text-white flex items-center gap-1 hover-lift shadow-sm shadow-lime-500/10"
                        >
                          Quero ajudar <ChevronRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {errors.selectedInstitution && (
                <div className="mt-6 text-center">
                  <span className="text-sm font-semibold text-red-500">{errors.selectedInstitution}</span>
                </div>
              )}

              {/* Navigation */}
              <div className="flex gap-4 mt-8 max-w-md mx-auto">
                <button onClick={handleBack}
                  className="flex-1 py-4 rounded-2xl font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="h-5 w-5" /> Voltar
                </button>
              </div>
            </div>
          )}

          {/* ========== STEP 4: PÁGINA DA INSTITUIÇÃO ESCOLHIDA ========== */}
          {currentStep === 4 && selectedInst && (
            <div className="bg-white dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden animate-in fade-in slide-in-from-right-5 duration-300">
              
              {/* Institution Banner */}
              <div className="h-48 w-full relative bg-slate-200 dark:bg-slate-900">
                <img src={selectedInst.banner} alt={selectedInst.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
                <div className="absolute bottom-5 left-6 text-white flex items-center gap-3">
                  <div className="h-14 w-14 rounded-full bg-white dark:bg-slate-900 shadow-md flex items-center justify-center text-3xl">
                    {selectedInst.logo}
                  </div>
                  <div>
                    <h3 className="text-xl font-black font-poppins">{selectedInst.name}</h3>
                    <span className="text-xs font-semibold text-slate-250 flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {selectedInst.city}/{selectedInst.state}</span>
                  </div>
                </div>
              </div>

              <div className="p-6 flex flex-col gap-6">
                
                {/* Emotional Message */}
                <div className="text-slate-700 dark:text-slate-300">
                  <span className="text-xs uppercase font-extrabold text-[#8DC63F] tracking-widest block mb-2">Quem Apoiamos</span>
                  <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400 font-inter font-medium">
                    "Com sua contribuição você ajuda a fornecer alimentação, medicamentos e cuidados veterinários para cães e gatos resgatados."
                  </p>
                </div>

                {/* Indicators grid */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Animais Atendidos</span>
                    <span className="text-lg font-extrabold text-[#003A8C] dark:text-blue-400 font-poppins block mt-1">{selectedInst.animalsServed}</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Castrações Realizadas</span>
                    <span className="text-lg font-extrabold text-[#003A8C] dark:text-blue-400 font-poppins block mt-1">{selectedInst.castrations}</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Resgates Realizados</span>
                    <span className="text-lg font-extrabold text-[#003A8C] dark:text-blue-400 font-poppins block mt-1">{selectedInst.rescues}</span>
                  </div>
                </div>

                <hr className="border-slate-100 dark:border-slate-900" />

                {/* Donation Value Selection */}
                <div className="flex flex-col gap-3">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Selecione o valor da sua contribuição *</label>
                  <p className="text-[11px] text-slate-400">Doação mínima obrigatória de R$ 50,00 para garantir a inscrição.</p>
                  
                  {/* Preset Suggestions */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-1">
                    {[50, 75, 100, 150].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => handleValueSelection(val)}
                        className={`
                          py-3 rounded-xl font-extrabold text-sm border-2 transition-all flex items-center justify-center gap-1
                          ${donationValue === val 
                            ? 'bg-[#8DC63F] border-[#8DC63F] text-white shadow-md shadow-lime-500/10' 
                            : 'border-slate-200 dark:border-slate-850 hover:border-slate-300 dark:hover:border-slate-700 bg-transparent text-slate-700 dark:text-slate-350'
                          }
                        `}
                      >
                        R$ {val}
                      </button>
                    ))}
                  </div>

                  {/* Custom Value input */}
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs font-bold text-slate-500">Outro valor:</span>
                    <div className="relative flex-1">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">R$</span>
                      <input
                        type="number"
                        min="50"
                        placeholder="Ex: 200,00"
                        value={customValue}
                        onChange={handleCustomValueChange}
                        className={`w-full pl-9 pr-4 py-2.5 rounded-xl border bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-[#8DC63F]/30 transition-all ${donationValue === 0 && customValue ? 'border-[#8DC63F] focus:ring-[#8DC63F]/30' : 'border-slate-200 dark:border-slate-850'}`}
                      />
                    </div>
                  </div>
                  {errors.donationValue && <span className="text-[10px] font-semibold text-red-500 mt-1">{errors.donationValue}</span>}
                </div>

                {/* Navigation */}
                <div className="flex gap-4 mt-4">
                  <button onClick={handleBack}
                    className="flex-1 py-4 rounded-2xl font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors flex items-center justify-center gap-2"
                  >
                    <ArrowLeft className="h-5 w-5" /> Voltar
                  </button>
                  <button onClick={handleNext}
                    className="flex-[2] py-4 rounded-2xl font-bold bg-[#8DC63F] hover:bg-[#7cb335] text-white transition-colors flex items-center justify-center gap-2 hover-lift shadow-lg shadow-lime-500/10"
                  >
                    Continuar <ArrowRight className="h-5 w-5" />
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* ========== STEP 5: PAGAMENTO PIX ========== */}
          {currentStep === 5 && selectedInst && (
            <div className="bg-white dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden animate-in fade-in slide-in-from-right-5 duration-300">
              <div className="bg-gradient-to-r from-[#003A8C] to-blue-600 p-6 text-white">
                <h3 className="text-xl font-extrabold font-poppins flex items-center gap-3">
                  <CreditCard className="h-6 w-6" />
                  Efetuar Pagamento PIX
                </h3>
                <p className="text-blue-200 text-sm mt-1">Realize a doação diretamente para a conta da instituição.</p>
              </div>

              <div className="p-6 flex flex-col gap-6">
                
                {/* Summary donation info */}
                <div className="flex justify-between items-center p-4 rounded-2xl bg-lime-50/50 dark:bg-lime-950/10 border border-lime-200 dark:border-lime-900/30">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{selectedInst.logo}</span>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{selectedInst.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase block">Sua contribuição</span>
                    <span className="text-base font-black text-emerald-600 dark:text-emerald-400 font-poppins">R$ {getFinalDonationValue().toFixed(2)}</span>
                  </div>
                </div>

                {/* PIX Key display */}
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex flex-col gap-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                    Chave PIX ({selectedInst.pixType})
                  </span>
                  <div className="flex items-center gap-3">
                    <code className="flex-1 px-4 py-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-250 dark:border-slate-800 font-mono text-sm text-[#003A8C] dark:text-blue-400 font-bold break-all">
                      {selectedInst.pixKey}
                    </code>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(selectedInst.pixKey, setCopiedPix)}
                      className={`px-4 py-3 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
                        copiedPix 
                          ? 'bg-green-100 text-green-700 border border-green-200' 
                          : 'bg-[#003A8C] hover:bg-blue-700 text-white'
                      }`}
                    >
                      {copiedPix ? <><Check className="h-4 w-4" /> Copiado!</> : <><Copy className="h-4 w-4" /> Copiar</>}
                    </button>
                  </div>
                </div>

                {/* Fake PIX QR Code generation */}
                <div className="flex flex-col items-center p-6 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3 block">QR Code para Pagamento</span>
                  
                  <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm w-44 h-44 flex items-center justify-center">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`00020126580014BR.GOV.BCB.PIX0136${selectedInst.pixKey}5204000053039865405${getFinalDonationValue().toFixed(2)}5802BR5915${selectedInst.name.substring(0, 15)}6009Recife62070503***6304CA12`)}`} 
                      alt="PIX QR Code" 
                      className="w-full h-full object-contain" 
                    />
                  </div>
                  
                  <p className="text-[11px] text-slate-450 dark:text-slate-400 mt-4 text-center max-w-[300px] leading-relaxed">
                    Abra o app do seu banco, selecione a opção "Pagar via Pix / Copiar e colar" ou aponte a câmera para o QR Code acima.
                  </p>
                </div>

                {/* Guidance warning */}
                <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-250 dark:border-amber-900/40 flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-bold text-amber-800 dark:text-amber-300 block">Instrução importante</span>
                    <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-1 leading-relaxed">
                      "Após realizar a doação envie o comprovante abaixo para validação."
                    </p>
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex gap-4 mt-2">
                  <button onClick={handleBack}
                    className="flex-1 py-4 rounded-2xl font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors flex items-center justify-center gap-2"
                  >
                    <ArrowLeft className="h-5 w-5" /> Voltar
                  </button>
                  <button onClick={handleNext}
                    className="flex-[2] py-4 rounded-2xl font-bold bg-[#8DC63F] hover:bg-[#7cb335] text-white transition-colors flex items-center justify-center gap-2 hover-lift shadow-lg shadow-lime-500/10"
                  >
                    Já fiz o PIX <ArrowRight className="h-5 w-5" />
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* ========== STEP 6: UPLOAD DO COMPROVANTE ========== */}
          {currentStep === 6 && selectedInst && (
            <div className="bg-white dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden animate-in fade-in slide-in-from-right-5 duration-300">
              <div className="bg-gradient-to-r from-[#8DC63F] to-lime-500 p-6 text-white">
                <h3 className="text-xl font-extrabold font-poppins flex items-center gap-3">
                  <Upload className="h-6 w-6" />
                  Enviar Comprovante
                </h3>
                <p className="text-lime-100 text-sm mt-1">Envie o arquivo do comprovante para a validação da sua doação.</p>
              </div>

              <div className="p-6 flex flex-col gap-6">
                
                {/* Summary donation info */}
                <div className="flex justify-between items-center p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-850">
                  <span className="text-xs text-slate-400 font-bold">Valor informado:</span>
                  <span className="text-base font-black text-[#003A8C] dark:text-blue-400 font-poppins">R$ {getFinalDonationValue().toFixed(2)}</span>
                </div>

                {/* Receipt Upload area */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Comprovante de Doação PIX *</label>
                  <div className={`flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed transition-all ${
                    donationReceipt 
                      ? 'border-[#8DC63F] bg-lime-50/30 dark:bg-lime-950/10' 
                      : errors.donationReceipt 
                        ? 'border-red-300 bg-red-50/30 dark:bg-red-950/10' 
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50'
                  }`}>
                    {donationReceipt ? (
                      <div className="flex flex-col items-center gap-3">
                        <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-250 flex items-center gap-2">
                          <FileText className="h-8 w-8 text-[#003A8C] dark:text-blue-400" />
                          <div className="text-left">
                            <span className="text-xs font-bold block text-slate-800 dark:text-slate-200 truncate max-w-[200px]">{donationReceiptName || 'comprovante.pdf'}</span>
                            <span className="text-[9px] text-slate-400 block font-semibold">Carregado com sucesso</span>
                          </div>
                        </div>
                        <button type="button" onClick={() => { setDonationReceipt(''); setDonationReceiptName(''); }} className="text-[10px] text-red-400 hover:text-red-600 font-bold flex items-center gap-1">
                          <X className="h-3 w-3" /> Remover e enviar outro
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-3">
                        <Upload className="h-10 w-10 text-slate-400" />
                        <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                          Arraste o comprovante ou clique para selecionar
                        </p>
                        <label className="px-6 py-3 rounded-xl bg-[#003A8C] hover:bg-blue-700 text-white text-xs font-bold cursor-pointer flex items-center gap-2 hover-lift transition-all">
                          <Upload className="h-4 w-4" /> Selecionar Comprovante
                          <input type="file" accept="image/*,.pdf"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                if (file.size > 10 * 1024 * 1024) {
                                  alert('O arquivo excede o limite máximo de 10MB.');
                                  return;
                                }
                                setDonationReceiptName(file.name);
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  setDonationReceipt(reader.result as string);
                                  if (errors.donationReceipt) setErrors(prev => ({ ...prev, donationReceipt: '' }));
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                            className="hidden"
                          />
                        </label>
                        <span className="text-[10px] text-slate-400">JPG, PNG ou PDF. Máx 10MB.</span>
                      </div>
                    )}
                  </div>
                  {errors.donationReceipt && <span className="text-[10px] font-semibold text-red-500">{errors.donationReceipt}</span>}
                </div>

                {/* Terms Acceptance checkbox */}
                <div className="flex items-start gap-3 select-none">
                  <input id="terms" type="checkbox" checked={termsAccepted}
                    onChange={(e) => { setTermsAccepted(e.target.checked); if (errors.termsAccepted) setErrors(prev => ({ ...prev, termsAccepted: '' })); }}
                    className="mt-1 h-4 w-4 rounded border-slate-350 dark:border-slate-800 text-[#003A8C] focus:ring-[#003A8C]/30 cursor-pointer"
                  />
                  <label htmlFor="terms" className="text-xs text-slate-500 dark:text-slate-400 cursor-pointer leading-relaxed">
                    Declaro que li e aceito as regras do <Link href="/regulamento" className="text-[#003A8C] dark:text-lime-400 font-bold hover:underline" target="_blank">Regulamento do Evento</Link>,
                    responsabilizo-me pela saúde e comportamento do meu pet durante a Cãominhada e autorizo o uso de imagem.
                    Confirmo que realizei a doação correspondente para a instituição.
                  </label>
                </div>
                {errors.termsAccepted && <span className="text-[10px] font-semibold text-red-500">{errors.termsAccepted}</span>}

                {/* Navigation */}
                <div className="flex gap-4 mt-2">
                  <button onClick={handleBack}
                    className="flex-1 py-4 rounded-2xl font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors flex items-center justify-center gap-2"
                  >
                    <ArrowLeft className="h-5 w-5" /> Voltar
                  </button>
                  <button onClick={handleSubmit} disabled={isSubmitting}
                    className="flex-[2] py-4 rounded-2xl font-bold bg-[#8DC63F] hover:bg-[#7cb335] text-white transition-colors flex items-center justify-center gap-2 hover-lift shadow-lg shadow-lime-500/10 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Enviando Inscrição...
                      </>
                    ) : (
                      <>Finalizar Inscrição 🐾</>
                    )}
                  </button>
                </div>

              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
