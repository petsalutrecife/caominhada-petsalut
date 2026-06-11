'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Logo from '@/components/Logo';
import ThemeToggle from '@/components/ThemeToggle';
import { supabaseMock, Registration, Institution } from '@/lib/supabaseMock';
import { 
  LogOut, Heart, DollarSign, Users, Award, ShieldCheck, Check, 
  X, Eye, ClipboardList, RefreshCw, MessageSquare, AlertCircle, FileText
} from 'lucide-react';

export default function InstitutionDashboard() {
  const router = useRouter();
  
  const [mounted, setMounted] = useState(false);
  const [institutionUser, setInstitutionUser] = useState<any>(null);
  const [currentInst, setCurrentInst] = useState<Institution | null>(null);
  
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [allInstitutions, setAllInstitutions] = useState<Institution[]>([]);
  
  // Modals & inputs
  const [viewReceiptUrl, setViewReceiptUrl] = useState<string | null>(null);
  const [rejectionModalOpen, setRejectionModalOpen] = useState(false);
  const [selectedRegId, setSelectedRegId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  
  const [notesModalOpen, setNotesModalOpen] = useState(false);
  const [noteContent, setNoteContent] = useState('');

  useEffect(() => {
    setMounted(true);
    const user = supabaseMock.getCurrentUser();
    if (!user || user.role !== 'institution') {
      router.push('/institution/login');
      return;
    }
    setInstitutionUser(user);
    
    const insts = supabaseMock.getInstitutions();
    setAllInstitutions(insts);
    
    const foundInst = insts.find(i => i.id === user.id);
    if (foundInst) {
      setCurrentInst(foundInst);
    }
    
    refreshData();
  }, [router]);

  const refreshData = () => {
    setRegistrations(supabaseMock.getRegistrations());
  };

  const handleLogout = () => {
    supabaseMock.signOut();
    router.push('/institution/login');
  };

  if (!mounted || !institutionUser || !currentInst) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 text-slate-500">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-8 w-8 animate-spin text-[#003A8C] dark:text-lime-500" />
          <p className="font-semibold text-sm">Carregando painel...</p>
        </div>
      </div>
    );
  }

  // Filter registrations for this institution only
  const instRegistrations = registrations.filter(r => r.selectedInstitution === currentInst.id);

  // Statistics calculations
  const approvedDonations = instRegistrations.filter(r => r.donationStatus === 'APROVADA');
  const totalArrecadado = approvedDonations.reduce((acc, curr) => acc + curr.donationValue, 0);
  const totalDoacoesCount = instRegistrations.length;
  
  const pendingCount = instRegistrations.filter(r => r.donationStatus === 'AGUARDANDO VALIDAÇÃO').length;
  const inAnalysisCount = instRegistrations.filter(r => r.donationStatus === 'EM ANÁLISE').length;
  const approvedCount = approvedDonations.length;
  const rejectedCount = instRegistrations.filter(r => r.donationStatus === 'REJEITADA').length;

  // Actions
  const handleApprove = (id: string) => {
    try {
      supabaseMock.updateRegistration(id, {
        donationStatus: 'APROVADA',
        statusPayment: 'Aprovado',
        statusKit: 'Liberado'
      });
      refreshData();
      alert('Doação validada com sucesso! O participante recebeu um e-mail de confirmação e a sua inscrição com QR Code está liberada.');
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
      alert('Doação rejeitada. O participante foi notificado por e-mail com a justificativa.');
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
      alert('Nova solicitação de comprovante enviada ao participante.');
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
      alert('Observação salva!');
    } catch {
      alert('Erro ao salvar observação.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 transition-colors">
      
      {/* Header */}
      <header className="h-20 flex items-center justify-between px-6 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <Link href="/"><Logo /></Link>
          <span className="hidden sm:inline-block px-3 py-1 rounded-full text-[10px] font-bold bg-[#8DC63F]/10 text-[#8DC63F] border border-[#8DC63F]/20 uppercase tracking-widest">
            {currentInst.name}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" /> Sair
          </button>
        </div>
      </header>

      {/* Main Panel Area */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 flex-1 flex flex-col gap-8 animate-in fade-in duration-300">
        
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-blue-900 to-slate-900 dark:from-slate-950 dark:to-slate-900 p-8 rounded-3xl text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-md">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-white text-slate-900 flex items-center justify-center text-4xl shadow-inner">
              {currentInst.logo}
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold font-poppins">{currentInst.name}</h2>
              <p className="text-sm text-slate-350 mt-1">Painel Institucional • Gestão de Comprovantes PIX da Cãominhada 2026</p>
            </div>
          </div>
          <div className="px-4 py-2 rounded-2xl bg-white/10 border border-white/10 text-xs font-bold flex items-center gap-1.5">
            <Heart className="h-4 w-4 text-red-400" /> Doações Parceiras
          </div>
        </div>

        {/* Statistics Widgets */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
          {/* Card: Total Arrecadado */}
          <div className="bg-white dark:bg-slate-950 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between col-span-2 lg:col-span-1 hover-lift">
            <span className="text-[10px] uppercase font-bold text-slate-400">Total Arrecadado</span>
            <div className="flex justify-between items-baseline mt-4">
              <span className="text-xl font-extrabold font-poppins text-emerald-600 dark:text-emerald-400">
                R$ {totalArrecadado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Card: Total Enbiado / Doacoes */}
          <div className="bg-white dark:bg-slate-950 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between hover-lift">
            <span className="text-[10px] uppercase font-bold text-slate-400">Total Recebido</span>
            <div className="flex justify-between items-baseline mt-4">
              <span className="text-2xl font-extrabold text-slate-900 dark:text-white font-poppins">{totalDoacoesCount}</span>
              <span className="text-[10px] text-slate-400">inscrições</span>
            </div>
          </div>

          {/* Card: Aguardando Validação */}
          <div className="bg-white dark:bg-slate-950 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between hover-lift">
            <span className="text-[10px] uppercase font-bold text-slate-400">Pendentes</span>
            <div className="flex justify-between items-baseline mt-4">
              <span className="text-2xl font-extrabold text-amber-500 font-poppins">{pendingCount + inAnalysisCount}</span>
              <span className="text-[10px] text-amber-400 font-semibold">{inAnalysisCount} em análise</span>
            </div>
          </div>

          {/* Card: Aprovados */}
          <div className="bg-white dark:bg-slate-950 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between hover-lift">
            <span className="text-[10px] uppercase font-bold text-slate-400">Aprovados</span>
            <div className="flex justify-between items-baseline mt-4">
              <span className="text-2xl font-extrabold text-emerald-650 dark:text-emerald-450 font-poppins">{approvedCount}</span>
              <span className="text-[10px] text-emerald-500">validados</span>
            </div>
          </div>

          {/* Card: Rejeitados */}
          <div className="bg-white dark:bg-slate-950 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between hover-lift">
            <span className="text-[10px] uppercase font-bold text-slate-400">Rejeitados</span>
            <div className="flex justify-between items-baseline mt-4">
              <span className="text-2xl font-extrabold text-red-500 font-poppins">{rejectedCount}</span>
              <span className="text-[10px] text-red-400">recusados</span>
            </div>
          </div>
        </div>

        {/* Donations List Section */}
        <div className="flex flex-col gap-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white font-poppins">Comprovantes Recebidos</h3>
          
          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-850 text-slate-400 uppercase font-bold">
                    <th className="p-4">Participante</th>
                    <th className="p-4">Pet</th>
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
                        <span className="text-[10px] text-slate-400 block mt-0.5">{reg.tutorEmail}</span>
                        <span className="text-[10px] text-slate-400 block font-mono">{reg.regNumber}</span>
                      </td>
                      <td className="p-4">
                        <span className="font-semibold block">{reg.petName}</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">{reg.petSpecies} • {reg.petBreed}</span>
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
                            ? 'bg-emerald-100 dark:bg-emerald-950/45 text-emerald-850 dark:text-emerald-400'
                            : reg.donationStatus === 'REJEITADA'
                              ? 'bg-red-100 dark:bg-red-950/45 text-red-850 dark:text-red-400'
                              : 'bg-amber-100 dark:bg-amber-950/45 text-amber-850 dark:text-amber-400'
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
                              className="p-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-650 text-white transition-colors"
                              title="Aprovar/Validar doação"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                          )}
                          {reg.donationStatus !== 'REJEITADA' && (
                            <button
                              onClick={() => openRejectionModal(reg.id)}
                              className="p-1.5 rounded-lg bg-red-500 hover:bg-red-650 text-white transition-colors"
                              title="Rejeitar doação"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          )}
                          {reg.donationStatus === 'AGUARDANDO VALIDAÇÃO' && (
                            <button
                              onClick={() => handleRequestNewReceipt(reg.id)}
                              className="p-1.5 rounded-lg bg-blue-500 hover:bg-blue-650 text-white transition-colors"
                              title="Solicitar Reenvio/Análise"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => openNotesModal(reg)}
                            className="p-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-705 text-slate-700 dark:text-slate-200 transition-colors"
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
                      <td colSpan={7} className="text-center p-10 text-slate-400 font-semibold">Nenhuma doação recebida até o momento.</td>
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
          <div className="bg-white dark:bg-slate-950 max-w-lg w-full rounded-3xl p-6 border border-slate-200 dark:border-slate-850 shadow-2xl flex flex-col relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setViewReceiptUrl(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-base font-bold text-slate-900 dark:text-white font-poppins mb-4">Comprovante de Doação</h3>
            
            <div className="bg-slate-100 dark:bg-slate-900 p-4 rounded-2xl flex items-center justify-center max-h-[350px] overflow-auto border border-slate-200 dark:border-slate-800">
              {viewReceiptUrl.startsWith('data:application/pdf') ? (
                <div className="flex flex-col items-center gap-3 py-10">
                  <FileText className="h-16 w-16 text-slate-450" />
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
          <div className="bg-white dark:bg-slate-950 max-w-sm w-full rounded-3xl p-6 border border-slate-250 dark:border-slate-850 shadow-2xl flex flex-col relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setRejectionModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-400 hover:text-slate-650 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            
            <div className="text-center mb-4">
              <span className="p-2 rounded-full bg-red-100 dark:bg-red-950/30 text-red-500 inline-block mb-3">
                <AlertCircle className="h-6 w-6" />
              </span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white font-poppins">Rejeitar Doação</h3>
              <p className="text-xs text-slate-500 mt-1">Por favor, informe o motivo da rejeição do comprovante. Isso será enviado por e-mail para o tutor do pet.</p>
            </div>

            <form onSubmit={handleReject} className="flex flex-col gap-4">
              <textarea
                required
                placeholder="Ex: Valor inferior ao mínimo de R$ 50,00 ou Comprovante inválido / ilegível."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-xs focus:outline-none focus:ring-2 focus:ring-red-500/30 h-24"
              />
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-red-500 hover:bg-red-650 text-white text-xs font-bold transition-all shadow-sm shadow-red-500/10"
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
          <div className="bg-white dark:bg-slate-950 max-w-sm w-full rounded-3xl p-6 border border-slate-250 dark:border-slate-850 shadow-2xl flex flex-col relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setNotesModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-400 hover:text-slate-650 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            
            <div className="text-center mb-4">
              <span className="p-2 rounded-full bg-slate-100 dark:bg-slate-900 text-slate-500 inline-block mb-3">
                <MessageSquare className="h-6 w-6" />
              </span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white font-poppins">Adicionar Observação</h3>
              <p className="text-xs text-slate-500 mt-1">Escreva uma nota interna ou instrução para esta inscrição.</p>
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
