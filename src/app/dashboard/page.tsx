'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Logo from '@/components/Logo';
import ThemeToggle from '@/components/ThemeToggle';
import { supabaseMock, Registration, Institution } from '@/lib/supabaseMock';
import { 
  LogOut, Calendar, MapPin, Award, CheckCircle2, Clock, ShieldAlert, 
  CreditCard, ClipboardList, RefreshCw, X, Download, Camera, Upload, 
  Heart, Check, FileText, AlertTriangle
} from 'lucide-react';
import { jsPDF } from 'jspdf';

export default function ParticipantDashboard() {
  const router = useRouter();
  
  // Auth state
  const [user, setUser] = useState<any>(null);
  const [registration, setRegistration] = useState<Registration | null>(null);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Re-upload state
  const [reuploadModalOpen, setReuploadModalOpen] = useState(false);
  const [newReceipt, setNewReceipt] = useState('');
  const [newReceiptName, setNewReceiptName] = useState('');
  const [isSubmittingReceipt, setIsSubmittingReceipt] = useState(false);

  useEffect(() => {
    const currentUser = supabaseMock.getCurrentUser();
    if (!currentUser || currentUser.role !== 'participant') {
      router.push('/login');
      return;
    }

    setUser(currentUser);
    setInstitutions(supabaseMock.getInstitutions());
    
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

  const handleReuploadReceipt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReceipt || !registration) return;

    setIsSubmittingReceipt(true);

    setTimeout(() => {
      try {
        const updated = supabaseMock.updateRegistration(registration.id, {
          donationReceipt: newReceipt,
          donationStatus: 'AGUARDANDO VALIDAÇÃO',
          rejectionReason: ''
        });
        setRegistration(updated);
        setIsSubmittingReceipt(false);
        setReuploadModalOpen(false);
        setNewReceipt('');
        setNewReceiptName('');
        alert('Comprovante enviado com sucesso para validação!');
      } catch (err) {
        setIsSubmittingReceipt(false);
        alert('Erro ao reenviar comprovante. Tente novamente.');
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

  const inst = institutions.find(i => i.id === registration.selectedInstitution);
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(registration.qrCode)}`;
  const isApproved = registration.donationStatus === 'APROVADA';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 transition-colors">
      {/* Header */}
      <header className="h-20 flex items-center justify-between px-6 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
        <Link href="/"><Logo /></Link>
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
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 flex-1 flex flex-col gap-8 animate-in fade-in duration-300">
        
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-blue-900 to-slate-900 dark:from-slate-950 dark:to-slate-900 p-8 rounded-3xl text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-md">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-poppins">Olá, {registration.tutorName.split(' ')[0]}!</h2>
            <p className="text-sm text-slate-350 mt-1">Acompanhe aqui o andamento de sua inscrição e doação parceira.</p>
          </div>
          <div className="px-4 py-2 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 text-xs font-bold flex items-center gap-2 font-mono">
            <ClipboardList className="h-4 w-4" /> Inscrição: <span className="text-lime-400">{registration.regNumber}</span>
          </div>
        </div>

        {/* Status Notification Alert cards based on donationStatus */}
        {!isApproved && (
          <div className="w-full">
            {registration.donationStatus === 'REJEITADA' ? (
              <div className="bg-red-50 dark:bg-red-950/20 border-2 border-red-200 dark:border-red-900 p-6 rounded-3xl text-left flex flex-col sm:flex-row items-start gap-4">
                <AlertTriangle className="h-8 w-8 text-red-500 shrink-0 mt-1" />
                <div className="flex-1">
                  <h4 className="font-extrabold text-red-800 dark:text-red-400 text-base font-poppins">Comprovante de Doação Rejeitado</h4>
                  <p className="text-xs text-red-700 dark:text-red-300 mt-1.5 leading-relaxed">
                    A instituição <strong>{inst?.name}</strong> analisou seu comprovante e rejeitou a validação. <br />
                    <strong>Motivo da rejeição:</strong> <span className="underline font-semibold">{registration.rejectionReason || 'Não informado pela instituição.'}</span>
                  </p>
                  <button
                    onClick={() => setReuploadModalOpen(true)}
                    className="mt-4 px-5 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white flex items-center gap-1.5 transition-all shadow-sm shadow-red-500/10"
                  >
                    <Upload className="h-3.5 w-3.5" /> Reenviar Comprovante
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-amber-50 dark:bg-amber-950/20 border-2 border-amber-250 dark:border-amber-900/60 p-6 rounded-3xl text-left flex flex-col sm:flex-row items-start gap-4">
                <Clock className="h-8 w-8 text-amber-500 shrink-0 mt-1" />
                <div>
                  <h4 className="font-extrabold text-amber-800 dark:text-amber-400 text-base font-poppins">Doação em Processo de Validação</h4>
                  <p className="text-xs text-amber-700 dark:text-amber-300 mt-1.5 leading-relaxed">
                    Sua doação de <strong>R$ {registration.donationValue.toFixed(2)}</strong> para <strong>{inst?.name}</strong> está em análise ({registration.donationStatus.toLowerCase()}). 
                    O prazo de validação é de até 24h. Fique tranquilo, assim que a instituição aprovar, liberaremos seu QR Code de acesso e Kit.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Dashboard Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Side: Status, Certificate and "Minhas Doações" */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            
            {/* Status Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* Payment Card */}
              <div className="bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between hover-lift">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 rounded-2xl">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  {isApproved ? (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400">Confirmado</span>
                  ) : (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-400">Aguardando</span>
                  )}
                </div>
                
                <div>
                  <h4 className="text-xs uppercase tracking-wider font-bold text-slate-400">Inscrição</h4>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mt-2">
                    {isApproved ? 'Sua participação está confirmada! 🎉' : 'Inscrição pendente de validação de doação.'}
                  </p>
                </div>
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
                  {registration.statusKit === 'Liberado' && isApproved && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400">Liberado</span>
                  )}
                  {(registration.statusKit === 'Aguardando' || !isApproved) && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-400 font-mono">Bloqueado</span>
                  )}
                </div>

                <div>
                  <h4 className="text-xs uppercase tracking-wider font-bold text-slate-400">Status do Kit</h4>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mt-2">
                    {registration.statusKit === 'Retirado' && 'Kit já retirado. Excelente caminhada!'}
                    {registration.statusKit === 'Liberado' && isApproved && 'Kit liberado para retirada!'}
                    {(!isApproved || registration.statusKit === 'Aguardando') && 'Será liberado assim que a doação for aprovada.'}
                  </p>
                </div>

                <div className="mt-4 text-[10px] text-slate-500 flex flex-col gap-1">
                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3 text-slate-400" /> Parque Central (Bolsão A)</span>
                  <span className="flex items-center gap-1"><Calendar className="h-3 w-3 text-slate-400" /> Sábado 19/09 das 09h às 17h ou no dia 20/09 às 08h</span>
                </div>
              </div>

            </div>

            {/* SECTION: Minhas Doações */}
            <div className="bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white font-poppins flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                Minhas Doações
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Abaixo estão listadas as suas contribuições enviadas para as instituições do evento.
              </p>

              <hr className="border-slate-100 dark:border-slate-900 my-4" />

              <div className="overflow-x-auto w-full">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-850 text-slate-400 uppercase font-bold">
                      <th className="p-3">Instituição</th>
                      <th className="p-3">Valor</th>
                      <th className="p-3">Data</th>
                      <th className="p-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="text-slate-700 dark:text-slate-300">
                      <td className="p-3 flex items-center gap-2">
                        <span className="text-xl">{inst?.logo || '🐾'}</span>
                        <div>
                          <span className="font-bold block text-slate-900 dark:text-white">{inst?.name || 'Carregando...'}</span>
                          <span className="text-[9px] text-slate-450">{inst?.city}/{inst?.state}</span>
                        </div>
                      </td>
                      <td className="p-3 font-bold text-slate-900 dark:text-white">
                        R$ {registration.donationValue.toFixed(2)}
                      </td>
                      <td className="p-3 font-medium">
                        {new Date(registration.createdAt).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="p-3 text-right">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                          registration.donationStatus === 'APROVADA'
                            ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400'
                            : registration.donationStatus === 'REJEITADA'
                              ? 'bg-red-100 dark:bg-red-950/40 text-red-800 dark:text-red-400'
                              : 'bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400'
                        }`}>
                          {registration.donationStatus}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Certificate Area Card */}
            <div className="bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover-lift">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white font-poppins">Certificado Digital</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Disponível para download após a confirmação da retirada do seu kit.
              </p>

              <hr className="border-slate-100 dark:border-slate-900 my-4" />

              {registration.statusKit === 'Retirado' && isApproved ? (
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
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Acesso bloqueado</span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      O certificado estará disponível assim que o kit especial da Cãominhada for retirado. A liberação do kit requer que o comprovante de doação seja validado pela instituição.
                    </p>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Right Side: QR Code and Pet Details */}
          <div className="lg:col-span-4 flex flex-col gap-8">
            
            {/* QR Code Card */}
            <div className="bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center text-center hover-lift">
              <span className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-4">QR Code Credencial</span>
              
              {isApproved ? (
                <>
                  <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm w-44 h-44 flex items-center justify-center">
                    <img src={qrUrl} alt="QR Code Inscrição" className="w-full h-full object-contain" />
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-4 leading-relaxed">
                    Apresente este código na tenda de credenciamento para liberar a retirada do seu kit físico e brindes.
                  </p>
                </>
              ) : (
                <div className="py-8 px-4 flex flex-col items-center gap-4">
                  <div className="h-28 w-28 rounded-2xl bg-slate-100 dark:bg-slate-900 border-2 border-dashed border-slate-350 dark:border-slate-800 flex items-center justify-center text-slate-350">
                    <ShieldAlert className="h-10 w-10 text-slate-450 dark:text-slate-500" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">Aguardando Validação</h4>
                  <p className="text-[10px] text-slate-400 leading-relaxed max-w-[180px]">
                    Seu QR Code de credenciamento será ativado assim que a doação for aprovada pela instituição parceira.
                  </p>
                </div>
              )}
            </div>

            {/* Pet Card */}
            <div className="bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover-lift">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white font-poppins mb-4">Dados do Pet Cadastrado</h3>
              
              <div className="flex flex-col items-center gap-3 mb-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-850">
                <div className="relative h-28 w-28 rounded-full border-4 border-white dark:border-slate-800 shadow-md overflow-hidden group bg-slate-200 dark:bg-slate-700">
                  {registration.petPhoto ? (
                    <img src={registration.petPhoto} alt="Foto do Pet" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 dark:text-slate-500">
                      <Camera className="h-10 w-10" />
                    </div>
                  )}
                  
                  {/* Photo upload hover overlay */}
                  <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer text-white text-[10px] font-bold">
                    <Upload className="h-5 w-5 mb-1" />
                    Alterar Foto
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            const newPhoto = reader.result as string;
                            const updated = supabaseMock.updateRegistration(registration.id, { petPhoto: newPhoto });
                            setRegistration(updated);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                </div>
                
                {!registration.petPhoto ? (
                  <label className="text-xs font-bold text-primary-blue dark:text-lime-400 hover:underline cursor-pointer flex items-center gap-1">
                    <Upload className="h-3 w-3" /> Enviar foto do pet
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            const newPhoto = reader.result as string;
                            const updated = supabaseMock.updateRegistration(registration.id, { petPhoto: newPhoto });
                            setRegistration(updated);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                ) : (
                  <span className="text-[10px] text-slate-400">Passe o mouse para alterar a foto</span>
                )}
              </div>

              <div className="flex flex-col gap-3 text-sm">
                <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-900">
                  <span className="text-slate-400 font-medium">Nome</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{registration.petName}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-900">
                  <span className="text-slate-400 font-medium">Espécie</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{registration.petSpecies}</span>
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

      {/* RE-UPLOAD COMPROVANTE MODAL */}
      {reuploadModalOpen && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-950 max-w-md w-full rounded-3xl p-6 border border-slate-250 dark:border-slate-850 shadow-2xl flex flex-col relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setReuploadModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="text-center mb-6">
              <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950 text-primary-blue dark:text-blue-400 uppercase tracking-widest inline-block mb-3">Reenviar Comprovante</span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white font-poppins">Substituir comprovante de doação</h3>
              <p className="text-xs text-slate-500 mt-1">O seu comprovante anterior foi rejeitado. Por favor, faça o upload de um comprovante válido de doação PIX mínima de R$ 50,00.</p>
            </div>

            <form onSubmit={handleReuploadReceipt} className="flex flex-col gap-4">
              <div className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed transition-all ${
                newReceipt 
                  ? 'border-[#8DC63F] bg-lime-50/20 dark:bg-lime-950/10' 
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50'
              }`}>
                {newReceipt ? (
                  <div className="flex flex-col items-center gap-3">
                    <FileText className="h-10 w-10 text-[#003A8C] dark:text-blue-400" />
                    <div className="text-center">
                      <span className="text-xs font-bold block text-slate-800 dark:text-slate-200 truncate max-w-[200px]">{newReceiptName || 'comprovante.pdf'}</span>
                      <span className="text-[10px] text-slate-400 block font-semibold">Pronto para envio</span>
                    </div>
                    <button type="button" onClick={() => { setNewReceipt(''); setNewReceiptName(''); }} className="text-[10px] text-red-400 hover:text-red-650 font-bold flex items-center gap-1">
                      <X className="h-3 w-3" /> Remover
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="h-8 w-8 text-slate-400" />
                    <label className="px-4 py-2 rounded-xl bg-[#003A8C] hover:bg-blue-700 text-white text-xs font-bold cursor-pointer flex items-center gap-1.5 transition-all">
                      <Upload className="h-3.5 w-3.5" /> Escolher Arquivo
                      <input type="file" accept="image/*,.pdf"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            if (file.size > 10 * 1024 * 1024) {
                              alert('O arquivo excede o limite máximo de 10MB.');
                              return;
                            }
                            setNewReceiptName(file.name);
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setNewReceipt(reader.result as string);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                    <span className="text-[9px] text-slate-400">PDF, PNG, JPG até 10MB</span>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={!newReceipt || isSubmittingReceipt}
                className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-colors flex items-center justify-center gap-2 hover-lift disabled:opacity-50"
              >
                {isSubmittingReceipt ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Enviando comprovante...
                  </>
                ) : (
                  'Confirmar Reenvio'
                )}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
