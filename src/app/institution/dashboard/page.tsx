'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Logo from '@/components/Logo';
import ThemeToggle from '@/components/ThemeToggle';
import { supabaseMock, Registration, Institution } from '@/lib/supabaseMock';
import { 
  LogOut, Heart, DollarSign, Users, Award, ShieldCheck, Check, 
  X, Eye, ClipboardList, RefreshCw, MessageSquare, AlertCircle, 
  FileText, Search, Phone, Mail, CheckCircle2, ChevronDown, Filter, Sparkles
} from 'lucide-react';

export default function InstitutionDashboard() {
  const router = useRouter();
  
  const [mounted, setMounted] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('');
  
  const [institutionUser, setInstitutionUser] = useState<any>(() => {
    if (typeof window !== 'undefined') return supabaseMock.getCurrentUser();
    return null;
  });

  const [allInstitutions, setAllInstitutions] = useState<Institution[]>(() => {
    if (typeof window !== 'undefined') return supabaseMock.getInstitutions();
    return [];
  });

  const [selectedInstId, setSelectedInstId] = useState<string>('inst-1');
  
  const [registrations, setRegistrations] = useState<Registration[]>(() => {
    if (typeof window !== 'undefined') return supabaseMock.getRegistrations();
    return [];
  });
  
  // Search & Status filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'AGUARDANDO VALIDAÇÃO' | 'EM ANÁLISE' | 'APROVADA' | 'REJEITADA'>('ALL');

  // Modals & inputs
  const [viewReceiptUrl, setViewReceiptUrl] = useState<string | null>(null);
  const [rejectionModalOpen, setRejectionModalOpen] = useState(false);
  const [selectedRegId, setSelectedRegId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [notesModalOpen, setNotesModalOpen] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  
  const refreshData = () => {
    const regs = supabaseMock.getRegistrations();
    setRegistrations(regs);
    const insts = supabaseMock.getInstitutions();
    setAllInstitutions(insts);
    
    const user = supabaseMock.getCurrentUser();
    if (user) {
      setInstitutionUser(user);
    }
    setLastSyncTime(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      await supabaseMock.syncFromSupabase();
      refreshData();
    } finally {
      setTimeout(() => setIsSyncing(false), 500);
    }
  };

  useEffect(() => {
    setMounted(true);
    const user = supabaseMock.getCurrentUser();
    if (!user || (user.role !== 'institution' && user.role !== 'admin')) {
      router.push('/institution/login');
      return;
    }
    setInstitutionUser(user);
    
    const insts = supabaseMock.getInstitutions();
    setAllInstitutions(insts);

    // Initial selected institution based on user session if institution
    if (user.role === 'institution' && user.id) {
      const match = insts.find(i => i.id === user.id || (i.email && user.email && i.email.toLowerCase() === user.email.toLowerCase()));
      if (match) {
        setSelectedInstId(match.id);
      } else {
        setSelectedInstId('inst-1');
      }
    } else {
      setSelectedInstId('all'); // Admin defaults to view all
    }

    refreshData();

    // Subscribe to realtime database and cross-tab events
    const unsubscribe = supabaseMock.subscribe(() => {
      refreshData();
    });

    // Background sync from Supabase
    supabaseMock.syncFromSupabase().then(() => {
      refreshData();
    });

    // Polling safety timer to guarantee fresh state
    const interval = setInterval(() => {
      refreshData();
    }, 2500);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [router]);

  const handleLogout = () => {
    supabaseMock.signOut();
    router.push('/institution/login');
  };

  // Find active institution object
  const currentInst = useMemo(() => {
    if (selectedInstId === 'all') return null;
    return allInstitutions.find(i => i.id === selectedInstId) || allInstitutions[0] || null;
  }, [selectedInstId, allInstitutions]);

  // Filter registrations for this institution (matches by ID, name, or slug)
  const instRegistrations = useMemo(() => {
    return registrations.filter(r => {
      // 1. Institution filter
      if (selectedInstId !== 'all') {
        const targetInst = allInstitutions.find(i => i.id === selectedInstId);
        const instId = String(selectedInstId || '').toLowerCase().trim();
        const instName = String(targetInst?.name || '').toLowerCase().trim();
        const regInst = String(r.selectedInstitution || '').toLowerCase().trim();
        
        const matchesInst = 
          regInst === instId ||
          regInst === instName ||
          (instName && regInst && (instName.includes(regInst) || regInst.includes(instName))) ||
          (regInst && instId && regInst.includes(instId.replace('inst-', ''))) ||
          (instId === 'inst-1' && (regInst.includes('alberto') || regInst === '1')) ||
          (instId === 'inst-2' && (regInst.includes('amor') || regInst === '2')) ||
          (instId === 'inst-3' && (regInst.includes('guerreiro') || regInst === '3'));
        
        if (!matchesInst) return false;
      }

      // 2. Status filter
      if (statusFilter !== 'ALL' && r.donationStatus !== statusFilter) {
        return false;
      }

      // 3. Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const tutor = (r.tutorName || '').toLowerCase();
        const cpf = (r.tutorCpf || '').replace(/\D/g, '');
        const pet = (r.petName || '').toLowerCase();
        const regNum = (r.regNumber || '').toLowerCase();
        const email = (r.tutorEmail || '').toLowerCase();

        return tutor.includes(query) || cpf.includes(query.replace(/\D/g, '')) || pet.includes(query) || regNum.includes(query) || email.includes(query);
      }

      return true;
    });
  }, [registrations, selectedInstId, allInstitutions, statusFilter, searchQuery]);

  // Statistics calculations (based on selected institution or all)
  const baseRegistrationsForStats = useMemo(() => {
    if (selectedInstId === 'all') return registrations;
    return registrations.filter(r => {
      const targetInst = allInstitutions.find(i => i.id === selectedInstId);
      const instId = String(selectedInstId || '').toLowerCase().trim();
      const instName = String(targetInst?.name || '').toLowerCase().trim();
      const regInst = String(r.selectedInstitution || '').toLowerCase().trim();
      return (
        regInst === instId ||
        regInst === instName ||
        (instName && regInst && (instName.includes(regInst) || regInst.includes(instName))) ||
        (regInst && instId && regInst.includes(instId.replace('inst-', ''))) ||
        (instId === 'inst-1' && (regInst.includes('alberto') || regInst === '1')) ||
        (instId === 'inst-2' && (regInst.includes('amor') || regInst === '2')) ||
        (instId === 'inst-3' && (regInst.includes('guerreiro') || regInst === '3'))
      );
    });
  }, [registrations, selectedInstId, allInstitutions]);

  const approvedDonations = baseRegistrationsForStats.filter(r => r.donationStatus === 'APROVADA');
  const totalArrecadado = approvedDonations.reduce((acc, curr) => acc + curr.donationValue, 0);
  const totalDoacoesCount = baseRegistrationsForStats.length;
  
  const pendingCount = baseRegistrationsForStats.filter(r => r.donationStatus === 'AGUARDANDO VALIDAÇÃO').length;
  const inAnalysisCount = baseRegistrationsForStats.filter(r => r.donationStatus === 'EM ANÁLISE').length;
  const approvedCount = approvedDonations.length;
  const rejectedCount = baseRegistrationsForStats.filter(r => r.donationStatus === 'REJEITADA').length;

  // Counts per institution for badges
  const getInstCount = (instId: string) => {
    return registrations.filter(r => {
      const regInst = String(r.selectedInstitution || '').toLowerCase().trim();
      return (
        regInst === instId ||
        (instId === 'inst-1' && (regInst.includes('alberto') || regInst === '1')) ||
        (instId === 'inst-2' && (regInst.includes('amor') || regInst === '2')) ||
        (instId === 'inst-3' && (regInst.includes('guerreiro') || regInst === '3'))
      );
    }).length;
  };

  // Actions
  const handleApprove = (id: string) => {
    try {
      supabaseMock.updateRegistration(id, {
        donationStatus: 'APROVADA',
        statusPayment: 'Aprovado',
        statusKit: 'Aguardando'
      });
      refreshData();
      alert('✅ Doação validada com sucesso! A inscrição do participante foi confirmada.');
    } catch {
      alert('Erro ao aprovar doação.');
    }
  };

  const openRejectionModal = (id: string) => {
    setSelectedRegId(id);
    setRejectionReason('');
    setRejectionModalOpen(true);
  };

  const handleReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRegId || !rejectionReason.trim()) return;

    try {
      supabaseMock.updateRegistration(selectedRegId, {
        donationStatus: 'REJEITADA',
        statusPayment: 'Pendente',
        statusKit: 'Aguardando',
        rejectionReason: rejectionReason
      });
      refreshData();
      setRejectionModalOpen(false);
      setSelectedRegId(null);
      alert('❌ Doação rejeitada com sucesso. O motivo foi registrado.');
    } catch {
      alert('Erro ao rejeitar doação.');
    }
  };

  const handleRequestNewReceipt = (id: string) => {
    try {
      supabaseMock.updateRegistration(id, {
        donationStatus: 'EM ANÁLISE',
        rejectionReason: 'Por favor, envie um novo comprovante legível.'
      });
      refreshData();
      alert('🔍 Status alterado para "EM ANÁLISE".');
    } catch {
      alert('Erro ao atualizar status.');
    }
  };

  const openNotesModal = (reg: Registration) => {
    setSelectedRegId(reg.id);
    setNoteContent(reg.notes || '');
    setNotesModalOpen(true);
  };

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRegId) return;

    try {
      supabaseMock.updateRegistration(selectedRegId, {
        notes: noteContent
      });
      refreshData();
      setNotesModalOpen(false);
      setSelectedRegId(null);
      alert('📝 Observação salva!');
    } catch {
      alert('Erro ao salvar observação.');
    }
  };

  if (!mounted || !institutionUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 text-slate-500">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-8 w-8 animate-spin text-[#003A8C] dark:text-lime-500" />
          <p className="font-semibold text-sm">Carregando painel institucional...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 transition-colors">
      
      {/* Header */}
      <header className="h-20 flex items-center justify-between px-4 sm:px-6 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center gap-2 sm:gap-3 overflow-hidden">
          <Link href="/" className="shrink-0"><Logo /></Link>
          <span className="inline-flex items-center px-2.5 sm:px-3 py-1 rounded-full text-[9px] sm:text-[10px] font-extrabold bg-[#8DC63F]/10 text-[#8DC63F] border border-[#8DC63F]/20 uppercase tracking-widest truncate max-w-[140px] sm:max-w-[260px]">
            {currentInst ? currentInst.name : 'Visão Geral (Todas as ONGs)'}
          </span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={handleManualSync}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
            title="Sincronizar dados em tempo real"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin text-[#003A8C] dark:text-lime-400' : ''}`} />
            <span className="hidden sm:inline">{isSyncing ? 'Sincronizando...' : 'Atualizar'}</span>
          </button>

          <ThemeToggle />
          
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Sair</span>
          </button>
        </div>
      </header>

      {/* Main Panel Area */}
      <main className="max-w-7xl mx-auto w-full px-3 sm:px-6 lg:px-8 py-6 sm:py-8 flex-1 flex flex-col gap-6 animate-in fade-in duration-300">
        
        {/* ONG Selector Tabs / Bar */}
        <div className="bg-white dark:bg-slate-950 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300 shrink-0">
            <Heart className="h-4 w-4 text-[#8DC63F]" />
            <span>Visualizando ONG:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {allInstitutions.map((inst) => {
              const count = getInstCount(inst.id);
              const isSelected = selectedInstId === inst.id;
              return (
                <button
                  key={inst.id}
                  onClick={() => setSelectedInstId(inst.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    isSelected
                      ? 'bg-[#003A8C] text-white dark:bg-lime-500 dark:text-slate-950 shadow-sm'
                      : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span>{inst.logo}</span>
                  <span className="truncate max-w-[120px] sm:max-w-[180px]">{inst.name}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                    isSelected
                      ? 'bg-white/20 text-white dark:bg-slate-950/30 dark:text-slate-950'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}

            <button
              onClick={() => setSelectedInstId('all')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedInstId === 'all'
                  ? 'bg-[#003A8C] text-white dark:bg-lime-500 dark:text-slate-950 shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              <span>🌐</span>
              <span>Todas as ONGs</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                selectedInstId === 'all'
                  ? 'bg-white/20 text-white dark:bg-slate-950/30 dark:text-slate-950'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}>
                {registrations.length}
              </span>
            </button>
          </div>
        </div>

        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-blue-900 to-slate-900 dark:from-slate-950 dark:to-slate-900 p-6 sm:p-8 rounded-3xl text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-md">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-white text-slate-900 flex items-center justify-center text-3xl sm:text-4xl shadow-inner shrink-0">
              {currentInst ? currentInst.logo : '🐾'}
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold font-poppins">
                {currentInst ? currentInst.name : 'Painel Geral de Todas as Doações'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                {currentInst?.mission || 'Gestão e validação em tempo real dos comprovantes PIX da Cãominhada 2026.'}
              </p>
            </div>
          </div>
          {lastSyncTime && (
            <div className="px-3 py-1.5 rounded-xl bg-white/10 border border-white/10 text-[11px] font-semibold text-slate-300 flex items-center gap-1.5 self-end sm:self-auto">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Sincronizado: {lastSyncTime}
            </div>
          )}
        </div>

        {/* Statistics Widgets */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
          {/* Card: Total Arrecadado */}
          <div className="bg-white dark:bg-slate-950 p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between col-span-2 lg:col-span-1">
            <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">Total Arrecadado</span>
            <div className="mt-2 sm:mt-4">
              <span className="text-xl sm:text-2xl font-extrabold font-poppins text-emerald-600 dark:text-emerald-400 block">
                R$ {totalArrecadado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
              <span className="text-[10px] text-slate-400 font-semibold">{approvedCount} doações confirmadas</span>
            </div>
          </div>

          {/* Card: Total Recebido */}
          <div className="bg-white dark:bg-slate-950 p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">Inscrições</span>
            <div className="flex justify-between items-baseline mt-2 sm:mt-4">
              <span className="text-2xl font-extrabold text-slate-900 dark:text-white font-poppins">{totalDoacoesCount}</span>
              <span className="text-[10px] text-slate-400">total</span>
            </div>
          </div>

          {/* Card: Pendentes */}
          <div className="bg-white dark:bg-slate-950 p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <span className="text-[10px] uppercase font-extrabold text-amber-500 tracking-wider">Pendentes</span>
            <div className="flex justify-between items-baseline mt-2 sm:mt-4">
              <span className="text-2xl font-extrabold text-amber-500 font-poppins">{pendingCount + inAnalysisCount}</span>
              <span className="text-[10px] text-amber-400 font-semibold">{inAnalysisCount} em análise</span>
            </div>
          </div>

          {/* Card: Aprovados */}
          <div className="bg-white dark:bg-slate-950 p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <span className="text-[10px] uppercase font-extrabold text-emerald-500 tracking-wider">Validados</span>
            <div className="flex justify-between items-baseline mt-2 sm:mt-4">
              <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-poppins">{approvedCount}</span>
              <span className="text-[10px] text-emerald-500 font-semibold">aprovados</span>
            </div>
          </div>

          {/* Card: Rejeitados */}
          <div className="bg-white dark:bg-slate-950 p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <span className="text-[10px] uppercase font-extrabold text-red-500 tracking-wider">Rejeitados</span>
            <div className="flex justify-between items-baseline mt-2 sm:mt-4">
              <span className="text-2xl font-extrabold text-red-500 font-poppins">{rejectedCount}</span>
              <span className="text-[10px] text-red-400 font-semibold">recusados</span>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-950 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          {/* Search Field */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por participante, pet, CPF ou número PET-2026..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-primary-blue/30 dark:focus:ring-lime-500/30 text-slate-800 dark:text-slate-200"
            />
          </div>

          {/* Status Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {[
              { id: 'ALL', label: 'Todos' },
              { id: 'AGUARDANDO VALIDAÇÃO', label: 'Pendentes' },
              { id: 'EM ANÁLISE', label: 'Em Análise' },
              { id: 'APROVADA', label: 'Aprovados' },
              { id: 'REJEITADA', label: 'Rejeitados' }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setStatusFilter(f.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                  statusFilter === f.id
                    ? 'bg-[#003A8C] text-white dark:bg-lime-500 dark:text-slate-950'
                    : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Donations List Section */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-poppins flex items-center gap-2">
              <FileText className="h-5 w-5 text-[#003A8C] dark:text-lime-400" />
              Comprovantes e Participantes
            </h3>
            <span className="text-xs font-bold text-slate-400 bg-white dark:bg-slate-950 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-800">
              {instRegistrations.length} {instRegistrations.length === 1 ? 'encontrado' : 'encontrados'}
            </span>
          </div>

          {/* Mobile Cards View (Visible on screens < md) */}
          <div className="md:hidden flex flex-col gap-3.5">
            {instRegistrations.map((reg) => (
              <div key={reg.id} className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col gap-3">
                
                {/* Tutor Header */}
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block text-sm">{reg.tutorName}</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-slate-400 font-mono">{reg.regNumber}</span>
                      {reg.shirtSize && (
                        <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900">
                          Camisa: {reg.shirtSize}
                        </span>
                      )}
                    </div>
                  </div>

                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider shrink-0 ${
                    reg.donationStatus === 'APROVADA'
                      ? 'bg-emerald-100 dark:bg-emerald-950/45 text-emerald-800 dark:text-emerald-400'
                      : reg.donationStatus === 'REJEITADA'
                        ? 'bg-red-100 dark:bg-red-950/45 text-red-800 dark:text-red-400'
                        : 'bg-amber-100 dark:bg-amber-950/45 text-amber-800 dark:text-amber-400'
                  }`}>
                    {reg.donationStatus}
                  </span>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-850">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Pet</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{reg.petName} ({reg.petBreed || reg.petSpecies})</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Valor PIX</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">R$ {reg.donationValue.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Telefone/WhatsApp</span>
                    <a 
                      href={`https://wa.me/55${(reg.tutorWhatsApp || reg.tutorPhone || '').replace(/\D/g, '')}`} 
                      target="_blank" 
                      rel="noreferrer"
                      className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 text-[11px]"
                    >
                      <Phone className="h-3 w-3" /> {reg.tutorWhatsApp || reg.tutorPhone || 'Não informado'}
                    </a>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Data Envio</span>
                    <span className="text-[11px] text-slate-600 dark:text-slate-400">
                      {new Date(reg.createdAt).toLocaleDateString('pt-BR')} às {new Date(reg.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                {reg.notes && (
                  <div className="text-[11px] text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
                    <span className="font-bold text-slate-500">Obs:</span> {reg.notes}
                  </div>
                )}

                {/* Mobile Actions Footer */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-850">
                  {reg.donationReceipt ? (
                    <button
                      onClick={() => setViewReceiptUrl(reg.donationReceipt || null)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 font-bold text-xs text-[#003A8C] dark:text-lime-400"
                    >
                      <Eye className="h-3.5 w-3.5" /> Comprovante
                    </button>
                  ) : (
                    <span className="text-slate-400 italic text-[11px]">Sem comprovante</span>
                  )}

                  <div className="flex items-center gap-1.5">
                    {reg.donationStatus !== 'APROVADA' && (
                      <button
                        onClick={() => handleApprove(reg.id)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-1 shadow-sm"
                        title="Aprovar doação"
                      >
                        <Check className="h-3.5 w-3.5" /> Aprovar
                      </button>
                    )}
                    {reg.donationStatus !== 'REJEITADA' && (
                      <button
                        onClick={() => openRejectionModal(reg.id)}
                        className="p-2 rounded-xl bg-red-500 hover:bg-red-600 text-white transition-colors"
                        title="Rejeitar doação"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                    {reg.donationStatus === 'AGUARDANDO VALIDAÇÃO' && (
                      <button
                        onClick={() => handleRequestNewReceipt(reg.id)}
                        className="p-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white transition-colors"
                        title="Solicitar Reenvio"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => openNotesModal(reg)}
                      className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors"
                      title="Adicionar Nota"
                    >
                      <MessageSquare className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {instRegistrations.length === 0 && (
              <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center flex flex-col items-center gap-3">
                <span className="text-3xl">🐾</span>
                <p className="text-slate-500 dark:text-slate-400 font-semibold text-xs">
                  Nenhuma inscrição encontrada para este filtro.
                </p>
                {selectedInstId !== 'inst-1' && (
                  <button
                    onClick={() => setSelectedInstId('inst-1')}
                    className="mt-1 px-4 py-2 rounded-xl bg-[#003A8C] text-white dark:bg-lime-500 dark:text-slate-950 font-bold text-xs"
                  >
                    Ver doações do Abrigo de Seu Alberto ({getInstCount('inst-1')})
                  </button>
                )}
              </div>
            )}
          </div>
          
          {/* Desktop Table View (Hidden on mobile) */}
          <div className="hidden md:block bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-850 text-slate-400 uppercase font-bold">
                    <th className="p-4">Participante</th>
                    <th className="p-4">Pet</th>
                    <th className="p-4">Contato / WhatsApp</th>
                    <th className="p-4">Valor PIX</th>
                    <th className="p-4">Data Envio</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-center">Comprovante</th>
                    <th className="p-4 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-900">
                  {instRegistrations.map((reg) => (
                    <tr key={reg.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 text-slate-700 dark:text-slate-350">
                      <td className="p-4">
                        <span className="font-bold text-slate-900 dark:text-white block">{reg.tutorName}</span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-slate-400 font-mono">{reg.regNumber}</span>
                          {reg.shirtSize && (
                            <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900">
                              Tam: {reg.shirtSize}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="font-semibold block">{reg.petName}</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">{reg.petSpecies} • {reg.petBreed}</span>
                      </td>
                      <td className="p-4">
                        <a 
                          href={`https://wa.me/55${(reg.tutorWhatsApp || reg.tutorPhone || '').replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline flex items-center gap-1"
                        >
                          <Phone className="h-3.5 w-3.5" />
                          {reg.tutorWhatsApp || reg.tutorPhone || reg.tutorEmail}
                        </a>
                      </td>
                      <td className="p-4 font-bold text-slate-900 dark:text-white">
                        R$ {reg.donationValue.toFixed(2)}
                      </td>
                      <td className="p-4 font-medium">
                        {new Date(reg.createdAt).toLocaleDateString('pt-BR')} <br />
                        <span className="text-[10px] text-slate-400">
                          {new Date(reg.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                          reg.donationStatus === 'APROVADA'
                            ? 'bg-emerald-100 dark:bg-emerald-950/45 text-emerald-800 dark:text-emerald-400'
                            : reg.donationStatus === 'REJEITADA'
                              ? 'bg-red-100 dark:bg-red-950/45 text-red-800 dark:text-red-400'
                              : 'bg-amber-100 dark:bg-amber-950/45 text-amber-800 dark:text-amber-400'
                        }`}>
                          {reg.donationStatus}
                        </span>
                        {reg.notes && (
                          <span className="text-[9px] text-slate-400 block mt-1 truncate max-w-[140px]" title={reg.notes}>
                            Obs: {reg.notes}
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        {reg.donationReceipt ? (
                          <button
                            onClick={() => setViewReceiptUrl(reg.donationReceipt || null)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 font-semibold text-[10px] transition-colors"
                          >
                            <Eye className="h-3.5 w-3.5 text-[#003A8C] dark:text-lime-400" /> Visualizar
                          </button>
                        ) : (
                          <span className="text-slate-400 italic text-[10px]">Sem anexo</span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          {reg.donationStatus !== 'APROVADA' && (
                            <button
                              onClick={() => handleApprove(reg.id)}
                              className="p-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white transition-colors"
                              title="Aprovar doação"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                          )}
                          {reg.donationStatus !== 'REJEITADA' && (
                            <button
                              onClick={() => openRejectionModal(reg.id)}
                              className="p-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors"
                              title="Rejeitar doação"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          )}
                          {reg.donationStatus === 'AGUARDANDO VALIDAÇÃO' && (
                            <button
                              onClick={() => handleRequestNewReceipt(reg.id)}
                              className="p-1.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors"
                              title="Solicitar Reenvio"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => openNotesModal(reg)}
                            className="p-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
                            title="Observação"
                          >
                            <MessageSquare className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {instRegistrations.length === 0 && (
                    <tr>
                      <td colSpan={8} className="text-center p-10 text-slate-400 font-semibold">
                        Nenhuma doação encontrada para este filtro.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </main>

      {/* COMPROVANTE VIEWER MODAL */}
      {viewReceiptUrl && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-950 max-w-lg w-full rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setViewReceiptUrl(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-base font-bold text-slate-900 dark:text-white font-poppins mb-4">Comprovante de Doação PIX</h3>
            
            <div className="bg-slate-100 dark:bg-slate-900 p-4 rounded-2xl flex items-center justify-center max-h-[350px] overflow-auto border border-slate-200 dark:border-slate-800">
              {viewReceiptUrl.startsWith('data:application/pdf') ? (
                <div className="flex flex-col items-center gap-3 py-10">
                  <FileText className="h-16 w-16 text-slate-400" />
                  <span className="text-xs font-bold text-slate-500">Documento PDF Carregado</span>
                  <a href={viewReceiptUrl} download="comprovante.pdf" className="px-4 py-2 bg-[#003A8C] text-white rounded-lg text-xs font-bold">Download do PDF</a>
                </div>
              ) : (
                <img src={viewReceiptUrl} alt="Comprovante de pagamento" className="max-w-full h-auto object-contain rounded-lg" />
              )}
            </div>
          </div>
        </div>
      )}

      {/* REJECTION REASON MODAL */}
      {rejectionModalOpen && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-950 max-w-sm w-full rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setRejectionModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            
            <div className="text-center mb-4">
              <span className="p-2 rounded-full bg-red-100 dark:bg-red-950/30 text-red-500 inline-block mb-3">
                <AlertCircle className="h-6 w-6" />
              </span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white font-poppins">Rejeitar Doação</h3>
              <p className="text-xs text-slate-500 mt-1">Informe a justificativa da recusa para registrar no histórico.</p>
            </div>

            <form onSubmit={handleReject} className="flex flex-col gap-4">
              <textarea
                required
                placeholder="Ex: Valor incorreto ou Comprovante ilegível."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-xs focus:outline-none focus:ring-2 focus:ring-red-500/30 h-24 text-slate-800 dark:text-slate-200"
              />
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-bold transition-all shadow-sm"
              >
                Confirmar Rejeição
              </button>
            </form>
          </div>
        </div>
      )}

      {/* GENERAL OBSERVATION/NOTES MODAL */}
      {notesModalOpen && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-950 max-w-sm w-full rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setNotesModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            
            <div className="text-center mb-4">
              <span className="p-2 rounded-full bg-slate-100 dark:bg-slate-900 text-slate-500 inline-block mb-3">
                <MessageSquare className="h-6 w-6" />
              </span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white font-poppins">Adicionar Observação</h3>
              <p className="text-xs text-slate-500 mt-1">Escreva uma nota interna para esta inscrição.</p>
            </div>

            <form onSubmit={handleSaveNote} className="flex flex-col gap-4">
              <textarea
                placeholder="Escreva sua observação aqui..."
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-xs focus:outline-none focus:ring-2 focus:ring-primary-blue/30 h-24 text-slate-800 dark:text-slate-200"
              />
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#003A8C] hover:bg-blue-800 dark:bg-lime-500 dark:hover:bg-lime-600 dark:text-slate-950 text-white text-xs font-bold transition-all shadow-sm"
              >
                Salvar Nota
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
