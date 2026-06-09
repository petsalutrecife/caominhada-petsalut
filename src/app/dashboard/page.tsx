'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Logo from '@/components/Logo';
import ThemeToggle from '@/components/ThemeToggle';
import { supabaseMock, Registration } from '@/lib/supabaseMock';
import { LogOut, Calendar, MapPin, Award, CheckCircle2, Clock, ShieldAlert, CreditCard, ClipboardList, RefreshCw, X, Download } from 'lucide-react';
import { jsPDF } from 'jspdf';

export default function ParticipantDashboard() {
  const router = useRouter();
  
  // Auth state
  const [user, setUser] = useState<any>(null);
  const [registration, setRegistration] = useState<Registration | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Pix modal state
  const [pixModalOpen, setPixModalOpen] = useState(false);
  const [isPaying, setIsPaying] = useState(false);

  useEffect(() => {
    const currentUser = supabaseMock.getCurrentUser();
    if (!currentUser || currentUser.role !== 'participant') {
      router.push('/login');
      return;
    }

    setUser(currentUser);
    
    // Fetch user registration details
    const regs = supabaseMock.getRegistrations();
    const userReg = regs.find(r => r.id === currentUser.id);
    
    if (userReg) {
      setRegistration(userReg);
    } else {
      router.push('/login');
    }
    
    setIsLoading(false);
  }, [router]);

  const handleLogout = () => {
    supabaseMock.signOut();
    router.push('/login');
  };

  const handlePixPayment = () => {
    if (!registration) return;
    
    setIsPaying(true);
    
    // Simulate gateway delay
    setTimeout(() => {
      try {
        const updated = supabaseMock.updateRegistration(registration.id, {
          statusPayment: 'Aprovado',
          statusKit: 'Liberado' // Kit gets released once paid!
        });
        setRegistration(updated);
        setIsPaying(false);
        setPixModalOpen(false);
      } catch (err) {
        setIsPaying(false);
        alert('Erro ao processar pagamento simulado.');
      }
    }, 1500);
  };

  const handleDownloadCertificate = () => {
    if (!registration) return;
    
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    // A4 landscape size: 297mm x 210mm
    
    // Outer border (Primary Blue)
    doc.setDrawColor(0, 58, 140);
    doc.setLineWidth(4);
    doc.rect(6, 6, 285, 198);

    // Inner border (Primary Green)
    doc.setDrawColor(167, 207, 0);
    doc.setLineWidth(1.5);
    doc.rect(10, 10, 277, 190);

    // Header Logo Mock
    doc.setTextColor(0, 58, 140);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(26);
    doc.text('Petsalut', 148, 32, { align: 'center' });
    
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('PLANOS DE SAÚDE ANIMAL', 148, 38, { align: 'center' });

    // Certificate Title
    doc.setTextColor(0, 58, 140);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(32);
    doc.text('CERTIFICADO DE PARTICIPAÇÃO', 148, 64, { align: 'center' });

    // Accent Line
    doc.setDrawColor(167, 207, 0);
    doc.setLineWidth(2);
    doc.line(85, 74, 212, 74);

    // Certificate text
    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(15);
    doc.text('Certificamos com alegria e reconhecimento que o tutor', 148, 92, { align: 'center' });
    
    doc.setTextColor(0, 58, 140);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text(registration.tutorName, 148, 106, { align: 'center' });

    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(15);
    doc.text(`e seu fiel pet ${registration.petName} (${registration.petBreed})`, 148, 118, { align: 'center' });
    
    doc.text('completaram com sucesso o circuito oficial da', 148, 130, { align: 'center' });
    doc.text('Cãominhada Petsalut 2026 no Parque Central.', 148, 140, { align: 'center' });

    // Registration metadata
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(11);
    doc.setTextColor(100, 116, 139);
    doc.text(`Nº Inscrição: ${registration.regNumber}  •  Data do Evento: 20/09/2026`, 148, 156, { align: 'center' });

    // Signature stamp line
    doc.setFont('helvetica', 'normal');
    doc.setDrawColor(148, 163, 184);
    doc.setLineWidth(0.5);
    doc.line(100, 180, 197, 180);
    doc.setFontSize(9);
    doc.text('DIRETORIA DE PROJETOS E EVENTOS PETSALUT', 148, 186, { align: 'center' });

    // Save
    doc.save(`Certificado_Caominhada_${registration.regNumber}.pdf`);
  };

  if (isLoading || !registration) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 text-slate-500">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-8 w-8 animate-spin text-primary-blue dark:text-lime-500" />
          <p className="font-semibold text-sm">Carregando painel do participante...</p>
        </div>
      </div>
    );
  }

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(registration.qrCode)}`;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 transition-colors">
      {/* Header */}
      <header className="h-20 flex items-center justify-between px-6 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
        <Link href="/">
          <Logo />
        </Link>
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

      {/* Main Dashboard Layout */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 flex-1 flex flex-col gap-8">
        
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-blue-900 to-slate-900 dark:from-slate-950 dark:to-slate-900 p-8 rounded-3xl text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-md">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-poppins">Olá, {registration.tutorName.split(' ')[0]}!</h2>
            <p className="text-sm text-slate-300 mt-1">Bem-vindo ao seu painel oficial da Cãominhada Petsalut 2026.</p>
          </div>
          <div className="px-4 py-2 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 text-xs font-bold flex items-center gap-2">
            <ClipboardList className="h-4 w-4" /> Inscrição: <span className="font-mono text-lime-400">{registration.regNumber}</span>
          </div>
        </div>

        {/* Dashboard Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Side: Status and actions */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            
            {/* Status Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* Payment Card */}
              <div className="bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between hover-lift">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 rounded-2xl">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  {registration.statusPayment === 'Aprovado' ? (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400">Aprovado</span>
                  ) : (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-400">Pendente</span>
                  )}
                </div>
                
                <div>
                  <h4 className="text-xs uppercase tracking-wider font-bold text-slate-400">Status do Pagamento</h4>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mt-2">
                    {registration.statusPayment === 'Aprovado' ? 'Sua participação está confirmada!' : 'Aguardando pagamento da taxa.'}
                  </p>
                </div>

                {registration.statusPayment === 'Pendente' && (
                  <button
                    onClick={() => setPixModalOpen(true)}
                    className="mt-6 w-full py-2.5 rounded-xl text-xs font-bold bg-primary-blue hover:bg-blue-800 text-white dark:bg-lime-500 dark:hover:bg-lime-600 dark:text-slate-950 transition-colors"
                  >
                    Efetuar Pagamento (Simulado)
                  </button>
                )}
              </div>

              {/* Kit Distribution Card */}
              <div className="bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between hover-lift">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 rounded-2xl">
                    <Award className="h-5 w-5" />
                  </div>
                  {registration.statusKit === 'Retirado' && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">Retirado</span>
                  )}
                  {registration.statusKit === 'Liberado' && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400">Liberado</span>
                  )}
                  {registration.statusKit === 'Aguardando' && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-400 font-mono">Aguardando</span>
                  )}
                </div>

                <div>
                  <h4 className="text-xs uppercase tracking-wider font-bold text-slate-400">Status do Kit</h4>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mt-2">
                    {registration.statusKit === 'Retirado' && 'Kit já retirado. Excelente caminhada!'}
                    {registration.statusKit === 'Liberado' && 'Kit liberado para retirada!'}
                    {registration.statusKit === 'Aguardando' && 'Aguardando aprovação do pagamento.'}
                  </p>
                </div>

                <div className="mt-4 text-[10px] text-slate-500 flex flex-col gap-1">
                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3 text-slate-400" /> Parque Central (Bolsão A)</span>
                  <span className="flex items-center gap-1"><Calendar className="h-3 w-3 text-slate-400" /> Sábado 19/09 das 09h às 17h ou no dia 20/09 às 08h</span>
                </div>
              </div>

            </div>

            {/* Certificate Area Card */}
            <div className="bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover-lift">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white font-poppins">Certificado Digital</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Disponível para download após a confirmação da retirada do seu kit.
              </p>

              <hr className="border-slate-100 dark:border-slate-900 my-4" />

              {registration.statusKit === 'Retirado' ? (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/50 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                    <div>
                      <span className="text-sm font-bold text-slate-800 dark:text-slate-200">Certificado Liberado!</span>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">Baixe e guarde a recordação da participação de {registration.petName}.</p>
                    </div>
                  </div>
                  <button
                    onClick={handleDownloadCertificate}
                    className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 hover-lift"
                  >
                    <Download className="h-4 w-4" /> Baixar Certificado PDF
                  </button>
                </div>
              ) : (
                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-850 flex items-start gap-3">
                  <ShieldAlert className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Acesso ainda bloqueado</span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      O certificado estará disponível assim que o kit especial da Cãominhada for retirado ou o evento for finalizado.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Event Schedule Brief */}
            <div className="bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover-lift">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white font-poppins">Informações para o dia do Evento</h3>
              <p className="text-xs text-slate-500 mt-1 mb-4">Lembre-se das regras importantes para garantir o conforto de todos.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-350 block mb-1">📅 Dia do Evento</span>
                  <p className="text-[11px] text-slate-500">Domingo, 20/09/2026 às 08h00 para alongamento. Largada às 09h00.</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-350 block mb-1">🦮 Guias e Coleiras</span>
                  <p className="text-[11px] text-slate-500">Uso obrigatório de guia curta durante todo o evento por segurança.</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-350 block mb-1">💧 Hidratação</span>
                  <p className="text-[11px] text-slate-500">Pontos de água a cada 500m. Ofereça água em pequenas doses ao pet.</p>
                </div>
              </div>
            </div>

          </div>

          {/* Right Side: QR Code and Pet Details */}
          <div className="lg:col-span-4 flex flex-col gap-8">
            
            {/* QR Code Card */}
            <div className="bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center text-center hover-lift">
              <span className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-4">QR Code Credencial</span>
              <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm w-44 h-44 flex items-center justify-center">
                <img src={qrUrl} alt="QR Code Inscrição" className="w-full h-full object-contain" />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-4 leading-relaxed">
                Apresente este código na tenda de credenciamento para liberar a retirada do seu kit físico e brindes.
              </p>
            </div>

            {/* Pet Card */}
            <div className="bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover-lift">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white font-poppins mb-4">Dados do Pet Cadastrado</h3>
              <div className="flex flex-col gap-3 text-sm">
                <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-900">
                  <span className="text-slate-400 font-medium">Nome</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{registration.petName}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-900">
                  <span className="text-slate-400 font-medium">Raça</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{registration.petBreed}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-900">
                  <span className="text-slate-400 font-medium">Porte</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{registration.petSize}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-slate-400 font-medium">Idade</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{registration.petAge} {registration.petAge === 1 ? 'ano' : 'anos'}</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </main>

      {/* PIX Payment Modal */}
      {pixModalOpen && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-950 max-w-sm w-full rounded-3xl p-6 border border-slate-200 dark:border-slate-850 shadow-2xl flex flex-col items-center text-center relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setPixModalOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950 text-primary-blue dark:text-blue-400 uppercase tracking-widest block mb-4">Simulador de Pagamento Pix</span>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white font-poppins">Taxa de Inscrição</h3>
            <span className="text-3xl font-extrabold text-primary-blue dark:text-lime-400 font-poppins mt-2">R$ 29,90</span>

            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-250 dark:border-slate-800 w-full my-6 flex flex-col items-center">
              {/* Fake Pix QR Code image */}
              <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-inner w-36 h-36 flex items-center justify-center">
                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=00020126580014BR.GOV.BCB.PIX0136ps-caominhada-event-key-2026520400005303986540529.905802BR5915Petsalut%20Eventos6009Sao%20Paulo62070503***6304CA12`} alt="Pix QR Code" className="w-full h-full object-contain" />
              </div>
              <span className="text-[10px] text-slate-400 mt-3 font-mono break-all select-all">Copy/Paste Key: 00020126580014BR.GOV.BCB.PIX...</span>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed px-2">
              Esta é uma simulação de pagamento via Pix. Clique no botão abaixo para aprovar imediatamente a inscrição e liberar o kit.
            </p>

            <button
              onClick={handlePixPayment}
              disabled={isPaying}
              className="mt-6 w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-colors flex items-center justify-center gap-2 hover-lift disabled:opacity-50"
            >
              {isPaying ? 'Processando Pix...' : 'Confirmar Pagamento Pix'}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
