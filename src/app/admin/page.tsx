'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Logo from '@/components/Logo';
import ThemeToggle from '@/components/ThemeToggle';
import { supabaseMock, Registration, Sponsor, Expense, Institution } from '@/lib/supabaseMock';
import { 
  LogOut, ClipboardList, TrendingUp, Users, Award, Landmark, Plus, Trash2, 
  Download, Edit, Search, Filter, ShieldCheck, Check, DollarSign, Upload, Globe, FileText, CheckSquare, RefreshCw,
  Heart, Building2, X, Eye, ShieldAlert, AlertCircle
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell 
} from 'recharts';
import { jsPDF } from 'jspdf';

export default function AdminDashboard() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  
  // Auth state
  const [adminUser, setAdminUser] = useState<any>(null);

  // Tabs: 'dashboard' | 'participants' | 'institutions' | 'financial' | 'sponsors'
  const [activeTab, setActiveTab] = useState<'dashboard' | 'participants' | 'institutions' | 'financial' | 'sponsors'>('dashboard');

  // Database states
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);

  // Search & Filter states (Participants)
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPayment, setFilterPayment] = useState<string>('All');
  const [filterKit, setFilterKit] = useState<string>('All');
  const [filterDonation, setFilterDonation] = useState<string>('All');
  const [filterInstitution, setFilterInstitution] = useState<string>('All');
  const [viewReceiptUrl, setViewReceiptUrl] = useState<string | null>(null);

  // Institution CRUD states
  const [instModalOpen, setInstModalOpen] = useState(false);
  const [editingInstId, setEditingInstId] = useState<string | null>(null);
  
  const [instName, setInstName] = useState('');
  const [instLogo, setInstLogo] = useState('🏠');
  const [instDesc, setInstDesc] = useState('');
  const [instMission, setInstMission] = useState('');
  const [instCity, setInstCity] = useState('');
  const [instState, setInstState] = useState('PE');
  const [instPixKey, setInstPixKey] = useState('');
  const [instPixType, setInstPixType] = useState('CNPJ');
  const [instRespName, setInstRespName] = useState('');
  const [instRespEmail, setInstRespEmail] = useState('');
  const [instRespPhone, setInstRespPhone] = useState('');
  const [instStatus, setInstStatus] = useState<'Ativo' | 'Inativo'>('Ativo');
  const [instEmail, setInstEmail] = useState('');
  const [instPassword, setInstPassword] = useState('');
  
  // Stats
  const [instAnimalsServed, setInstAnimalsServed] = useState<number>(100);
  const [instCastrations, setInstCastrations] = useState<number>(150);
  const [instRescues, setInstRescues] = useState<number>(120);
  const [instPhoto, setInstPhoto] = useState('');
  const [instBanner, setInstBanner] = useState('');

  // New Sponsor Form states
  const [newSponsorName, setNewSponsorName] = useState('');
  const [newSponsorLogo, setNewSponsorLogo] = useState('');
  const [newSponsorCategory, setNewSponsorCategory] = useState<'Master' | 'Ouro' | 'Prata' | 'Apoio'>('Ouro');
  const [newSponsorInvested, setNewSponsorInvested] = useState(0);
  const [newSponsorDesc, setNewSponsorDesc] = useState('');
  const [newSponsorWebsite, setNewSponsorWebsite] = useState('');

  // New Expense Form states
  const [newExpenseTitle, setNewExpenseTitle] = useState('');
  const [newExpenseCategory, setNewExpenseCategory] = useState<'Marketing' | 'Estrutura' | 'Brindes' | 'Equipe' | 'Alimentação' | 'Outros'>('Estrutura');
  const [newExpenseValue, setNewExpenseValue] = useState(0);
  const [newExpenseDate, setNewExpenseDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    setMounted(true);
    const currentUser = supabaseMock.getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
      router.push('/login');
      return;
    }
    setAdminUser(currentUser);

    // Initial load of database
    refreshData();
  }, [router]);

  const refreshData = async () => {
    setRegistrations(supabaseMock.getRegistrations());
    setSponsors(supabaseMock.getSponsors());
    setExpenses(supabaseMock.getExpenses());
    setInstitutions(supabaseMock.getInstitutions());

    await supabaseMock.syncFromSupabase();

    setRegistrations(supabaseMock.getRegistrations());
    setSponsors(supabaseMock.getSponsors());
    setExpenses(supabaseMock.getExpenses());
    setInstitutions(supabaseMock.getInstitutions());
  };

  const handleLogout = () => {
    supabaseMock.signOut();
    router.push('/login');
  };

  // --- Actions ---

  // Approve donation (validates the receipt)
  const handleApproveDonation = (id: string) => {
    supabaseMock.updateRegistration(id, {
      donationStatus: 'APROVADA',
      statusPayment: 'Aprovado',
      statusKit: 'Liberado'
    });
    refreshData();
  };

  // Reject donation
  const handleRejectDonation = (id: string) => {
    const reason = prompt('Informe o motivo da rejeição do comprovante:');
    if (reason === null) return;
    
    supabaseMock.updateRegistration(id, {
      donationStatus: 'REJEITADA',
      statusPayment: 'Pendente',
      statusKit: 'Aguardando',
      rejectionReason: reason
    });
    refreshData();
  };

  // Update participant kit status
  const handleUpdateKit = (id: string, nextStatus: 'Aguardando' | 'Liberado' | 'Retirado') => {
    supabaseMock.updateRegistration(id, { statusKit: nextStatus });
    refreshData();
  };

  // Delete participant
  const handleDeleteParticipant = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta inscrição?')) {
      supabaseMock.deleteRegistration(id);
      refreshData();
    }
  };

  // CRUD Institutions
  const openNewInstModal = () => {
    setEditingInstId(null);
    setInstName('');
    setInstLogo('🏠');
    setInstDesc('');
    setInstMission('');
    setInstCity('');
    setInstState('PE');
    setInstPixKey('');
    setInstPixType('CNPJ');
    setInstRespName('');
    setInstRespEmail('');
    setInstRespPhone('');
    setInstStatus('Ativo');
    setInstEmail('');
    setInstPassword('');
    setInstAnimalsServed(100);
    setInstCastrations(150);
    setInstRescues(120);
    setInstPhoto('https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600&h=400&fit=crop&q=80');
    setInstBanner('https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=1200&h=400&fit=crop&q=80');
    setInstModalOpen(true);
  };

  const openEditInstModal = (inst: Institution) => {
    setEditingInstId(inst.id);
    setInstName(inst.name);
    setInstLogo(inst.logo);
    setInstDesc(inst.description);
    setInstMission(inst.mission);
    setInstCity(inst.city);
    setInstState(inst.state);
    setInstPixKey(inst.pixKey);
    setInstPixType(inst.pixType);
    setInstRespName(inst.responsibleName || '');
    setInstRespEmail(inst.responsibleEmail || '');
    setInstRespPhone(inst.responsiblePhone || '');
    setInstStatus(inst.status);
    setInstEmail(inst.email || '');
    setInstPassword(inst.password || '');
    setInstAnimalsServed(inst.animalsServed);
    setInstCastrations(inst.castrations);
    setInstRescues(inst.rescues);
    setInstPhoto(inst.photo);
    setInstBanner(inst.banner);
    setInstModalOpen(true);
  };

  const handleSaveInstitution = (e: React.FormEvent) => {
    e.preventDefault();
    if (!instName.trim() || !instPixKey.trim() || !instEmail.trim() || !instPassword.trim()) {
      alert('Preencha os campos obrigatórios (Nome, Chave PIX, E-mail e Senha).');
      return;
    }

    const instData: Omit<Institution, 'id'> = {
      name: instName,
      logo: instLogo,
      description: instDesc,
      mission: instMission,
      city: instCity,
      state: instState,
      pixKey: instPixKey,
      pixType: instPixType,
      responsibleName: instRespName,
      responsibleEmail: instRespEmail,
      responsiblePhone: instRespPhone,
      status: instStatus,
      email: instEmail,
      password: instPassword,
      animalsServed: Number(instAnimalsServed),
      castrations: Number(instCastrations),
      rescues: Number(instRescues),
      photo: instPhoto || 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600&h=400&fit=crop&q=80',
      banner: instBanner || 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=1200&h=400&fit=crop&q=80',
      totalDonations: editingInstId ? (institutions.find(i => i.id === editingInstId)?.totalDonations || 0) : 0
    };

    if (editingInstId) {
      supabaseMock.updateInstitution(editingInstId, instData);
    } else {
      supabaseMock.saveInstitution(instData);
    }

    setInstModalOpen(false);
    refreshData();
    alert(editingInstId ? 'Instituição atualizada com sucesso!' : 'Instituição cadastrada com sucesso!');
  };

  const handleDeleteInstitution = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta instituição?')) {
      supabaseMock.deleteInstitution(id);
      refreshData();
    }
  };

  // Add Sponsor
  const handleAddSponsor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSponsorName.trim() || !newSponsorLogo.trim()) {
      alert('Nome e logo do patrocinador são obrigatórios.');
      return;
    }

    supabaseMock.saveSponsor({
      name: newSponsorName,
      logo: newSponsorLogo,
      category: newSponsorCategory,
      investedValue: Number(newSponsorInvested),
      description: newSponsorDesc,
      website: newSponsorWebsite || '#'
    });

    setNewSponsorName('');
    setNewSponsorLogo('');
    setNewSponsorInvested(0);
    setNewSponsorDesc('');
    setNewSponsorWebsite('');
    
    refreshData();
    alert('Patrocinador adicionado!');
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewSponsorLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteSponsor = (id: string) => {
    if (confirm('Deseja excluir este patrocinador?')) {
      supabaseMock.deleteSponsor(id);
      refreshData();
    }
  };

  // Add Expense
  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpenseTitle.trim() || newExpenseValue <= 0) {
      alert('Título e valor válido da despesa são obrigatórios.');
      return;
    }

    supabaseMock.saveExpense({
      title: newExpenseTitle,
      category: newExpenseCategory,
      value: Number(newExpenseValue),
      date: newExpenseDate
    });

    setNewExpenseTitle('');
    setNewExpenseValue(0);
    
    refreshData();
    alert('Despesa cadastrada!');
  };

  const handleDeleteExpense = (id: string) => {
    if (confirm('Deseja excluir esta despesa?')) {
      supabaseMock.deleteExpense(id);
      refreshData();
    }
  };

  // Exports
  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Inscricao,Tutor,CPF,Telefone,WhatsApp,Email,Cidade,Estado,Pet,Especie,Raca,Porte,Idade,Instituicao,Valor Doacao,Status Doacao,Kit,Data Cadastro\n';
    
    registrations.forEach(r => {
      const instName = institutions.find(i => i.id === r.selectedInstitution)?.name || '';
      const row = [
        r.regNumber,
        r.tutorName,
        r.tutorCpf,
        r.tutorPhone,
        r.tutorWhatsApp || '',
        r.tutorEmail,
        r.tutorCity || '',
        r.tutorState || '',
        r.petName,
        r.petSpecies || '',
        r.petBreed,
        r.petSize,
        r.petAge,
        instName,
        r.donationValue,
        r.donationStatus || '',
        r.statusKit,
        r.createdAt
      ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(',');
      csvContent += row + '\n';
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Participantes_Caominhada_Petsalut_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    doc.setTextColor(0, 58, 140);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.text('Relatório Oficial de Participantes', 15, 20);
    
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Cãominhada Petsalut 2026 • Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 15, 26);
    
    doc.setDrawColor(0, 58, 140);
    doc.setLineWidth(0.5);
    doc.line(15, 30, 195, 30);

    let y = 40;
    doc.setTextColor(30, 41, 59);
    
    registrations.forEach((r, idx) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      
      const instName = institutions.find(i => i.id === r.selectedInstitution)?.name || '';
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text(`${idx + 1}. [${r.regNumber}] - Tutor: ${r.tutorName}`, 15, y);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(`Pet: ${r.petName} (${r.petBreed}) • Inst: ${instName} (R$ ${r.donationValue.toFixed(2)}) • CPF: ${r.tutorCpf}`, 15, y + 5);
      doc.text(`Doação: ${r.donationStatus} • Kit: ${r.statusKit}`, 15, y + 10);
      
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.2);
      doc.line(15, y + 13, 195, y + 13);
      
      y += 18;
    });

    doc.save(`Relatorio_Participantes_Caominhada_${Date.now()}.pdf`);
  };

  // Calculations
  const totalInscritos = registrations.length;
  const totalPagos = registrations.filter(r => r.donationStatus === 'APROVADA').length;
  const totalKitsEntregues = registrations.filter(r => r.statusKit === 'Retirado').length;
  const totalPatrocinadores = sponsors.length;
  const totalDoacoesValidadas = registrations.filter(r => r.donationStatus === 'APROVADA').length;
  const totalDoacoesPendentes = registrations.filter(r => r.donationStatus === 'AGUARDANDO VALIDAÇÃO').length;
  const totalDoacoesRejeitadas = registrations.filter(r => r.donationStatus === 'REJEITADA').length;

  // Revenue math: Sum of actual validated donationValues
  const receitaDoacoes = registrations
    .filter(r => r.donationStatus === 'APROVADA')
    .reduce((acc, curr) => acc + curr.donationValue, 0);

  const receitaPatrocinios = sponsors.reduce((acc, curr) => acc + curr.investedValue, 0);
  const receitaTotal = receitaDoacoes + receitaPatrocinios;

  const despesaTotal = expenses.reduce((acc, curr) => acc + curr.value, 0);
  const lucroLiquido = receitaTotal - despesaTotal;

  // Recharts Data Processing
  // 1. Registrations count by day
  const registrationsByDay: Record<string, number> = {};
  registrations.forEach(r => {
    const day = new Date(r.createdAt).toLocaleDateString('pt-BR', { month: '2-digit', day: '2-digit' });
    registrationsByDay[day] = (registrationsByDay[day] || 0) + 1;
  });
  const chartRegData = Object.entries(registrationsByDay).map(([day, val]) => ({ name: day, Inscritos: val }));

  // 2. Pet Sizes
  const sizePequeno = registrations.filter(r => r.petSize === 'Pequeno').length;
  const sizeMedio = registrations.filter(r => r.petSize === 'Médio').length;
  const sizeGrande = registrations.filter(r => r.petSize === 'Grande').length;
  const chartPetSizeData = [
    { name: 'Pequeno', value: sizePequeno },
    { name: 'Médio', value: sizeMedio },
    { name: 'Grande', value: sizeGrande }
  ];

  // 3. Arrecadação por Instituição
  const institutionRevenueData = institutions.map(inst => {
    const totalInstDonations = registrations
      .filter(r => r.selectedInstitution === inst.id && r.donationStatus === 'APROVADA')
      .reduce((acc, curr) => acc + curr.donationValue, 0);
    return {
      name: inst.name,
      Arrecadado: totalInstDonations
    };
  });

  // Ranking de Arrecadação (Sorted)
  const sortedInstitutionsRanking = [...institutions].map(inst => {
    const totalInstDonations = registrations
      .filter(r => r.selectedInstitution === inst.id && r.donationStatus === 'APROVADA')
      .reduce((acc, curr) => acc + curr.donationValue, 0);
    return {
      ...inst,
      collected: totalInstDonations
    };
  }).sort((a, b) => b.collected - a.collected);

  // COLORS for charts
  const PET_COLORS = ['#8DC63F', '#003A8C', '#F59E0B'];

  const getInstName = (instId: string) => institutions.find(i => i.id === instId)?.name || 'N/A';

  const filteredRegistrations = registrations.filter(r => {
    const matchesSearch = 
      r.tutorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.petName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.regNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.tutorCpf.includes(searchQuery);

    const matchesPayment = filterPayment === 'All' || r.statusPayment === filterPayment;
    const matchesKit = filterKit === 'All' || r.statusKit === filterKit;
    const matchesDonation = filterDonation === 'All' || r.donationStatus === filterDonation;
    const matchesInstitution = filterInstitution === 'All' || r.selectedInstitution === filterInstitution;

    return matchesSearch && matchesPayment && matchesKit && matchesDonation && matchesInstitution;
  });

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

      {/* Page Body Wrapper */}
      <div className="flex-1 flex flex-col md:flex-row max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 gap-8">
        
        {/* Navigation Sidebar */}
        <div className="w-full md:w-64 shrink-0 flex flex-row md:flex-col gap-2 p-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl h-fit shadow-sm overflow-x-auto">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex-1 md:flex-initial flex items-center justify-center md:justify-start gap-2.5 px-4 py-3 rounded-2xl text-xs font-bold transition-all shrink-0 ${
              activeTab === 'dashboard'
                ? 'bg-[#003A8C] text-white dark:bg-lime-500 dark:text-slate-950'
                : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900'
            }`}
          >
            <TrendingUp className="h-4 w-4" /> Visão Geral
          </button>
          <button
            onClick={() => setActiveTab('participants')}
            className={`flex-1 md:flex-initial flex items-center justify-center md:justify-start gap-2.5 px-4 py-3 rounded-2xl text-xs font-bold transition-all shrink-0 ${
              activeTab === 'participants'
                ? 'bg-[#003A8C] text-white dark:bg-lime-500 dark:text-slate-950'
                : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900'
            }`}
          >
            <Users className="h-4 w-4" /> Participantes
          </button>
          <button
            onClick={() => setActiveTab('institutions')}
            className={`flex-1 md:flex-initial flex items-center justify-center md:justify-start gap-2.5 px-4 py-3 rounded-2xl text-xs font-bold transition-all shrink-0 ${
              activeTab === 'institutions'
                ? 'bg-[#003A8C] text-white dark:bg-lime-500 dark:text-slate-950'
                : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900'
            }`}
          >
            <Heart className="h-4 w-4" /> Instituições
          </button>
          <button
            onClick={() => setActiveTab('financial')}
            className={`flex-1 md:flex-initial flex items-center justify-center md:justify-start gap-2.5 px-4 py-3 rounded-2xl text-xs font-bold transition-all shrink-0 ${
              activeTab === 'financial'
                ? 'bg-[#003A8C] text-white dark:bg-lime-500 dark:text-slate-950'
                : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900'
            }`}
          >
            <Landmark className="h-4 w-4" /> Gestão Financeira
          </button>
          <button
            onClick={() => setActiveTab('sponsors')}
            className={`flex-1 md:flex-initial flex items-center justify-center md:justify-start gap-2.5 px-4 py-3 rounded-2xl text-xs font-bold transition-all shrink-0 ${
              activeTab === 'sponsors'
                ? 'bg-[#003A8C] text-white dark:bg-lime-500 dark:text-slate-950'
                : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900'
            }`}
          >
            <Award className="h-4 w-4" /> Patrocinadores
          </button>
        </div>

        {/* Content Panel */}
        <div className="flex-1 flex flex-col gap-6">

          {/* TAB 1: VISÃO GERAL (DASHBOARD) */}
          {activeTab === 'dashboard' && (
            <div className="flex flex-col gap-8 animate-in fade-in duration-200">
              
              {/* Metrics Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* Metric: Total Registrations */}
                <div className="bg-white dark:bg-slate-950 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between hover-lift">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Total de Inscritos</span>
                  <div className="flex justify-between items-baseline mt-4">
                    <span className="text-3xl font-extrabold font-poppins text-slate-900 dark:text-white">{totalInscritos}</span>
                    <span className="text-[10px] text-slate-400 font-medium">Pets & Tutores</span>
                  </div>
                </div>

                {/* Metric: Revenue */}
                <div className="bg-white dark:bg-slate-950 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between hover-lift">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Receita Total</span>
                  <div className="flex justify-between items-baseline mt-4">
                    <span className="text-xl sm:text-2xl font-extrabold font-poppins text-emerald-600 dark:text-emerald-400">
                      R$ {receitaTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                {/* Metric: Kits Delivered */}
                <div className="bg-white dark:bg-slate-950 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between hover-lift">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Kits Entregues</span>
                  <div className="flex justify-between items-baseline mt-4">
                    <span className="text-3xl font-extrabold font-poppins text-slate-900 dark:text-white">{totalKitsEntregues}</span>
                    <span className="text-xs font-semibold text-slate-400">
                      {totalInscritos > 0 ? `${Math.round((totalKitsEntregues / totalInscritos) * 100)}%` : '0%'}
                    </span>
                  </div>
                </div>

                {/* Metric: Donations Validated */}
                <div className="bg-white dark:bg-slate-950 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between hover-lift">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Doações Validadas</span>
                  <div className="flex justify-between items-baseline mt-4">
                    <span className="text-3xl font-extrabold font-poppins text-emerald-600 dark:text-emerald-400">{totalDoacoesValidadas}</span>
                    <span className="text-xs font-semibold text-amber-500">
                      {totalDoacoesPendentes} pendentes
                    </span>
                  </div>
                </div>

              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Chart: Arrecadação por Instituição */}
                <div className="bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <h4 className="text-sm font-bold text-slate-850 dark:text-slate-200 font-poppins mb-6">Arrecadação de Doações por Instituição</h4>
                  <div className="h-64 w-full">
                    {institutionRevenueData.some(d => d.Arrecadado > 0) ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={institutionRevenueData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:hidden" />
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" className="hidden dark:block" />
                          <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
                          <YAxis stroke="#64748b" fontSize={10} />
                          <Tooltip formatter={(value) => `R$ ${value}`} />
                          <Bar dataKey="Arrecadado" fill="#003A8C" radius={[8, 8, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-xs text-slate-400 font-medium">Nenhuma doação validada para gerar dados.</div>
                    )}
                  </div>
                </div>

                {/* Ranking de Arrecadação */}
                <div className="bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <h4 className="text-sm font-bold text-slate-850 dark:text-slate-200 font-poppins mb-6">Ranking de Arrecadação</h4>
                  <div className="flex flex-col gap-4 overflow-y-auto max-h-64 pr-2">
                    {sortedInstitutionsRanking.map((inst, index) => (
                      <div key={inst.id} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-850">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-black text-slate-400 w-5">#{index + 1}</span>
                          <span className="text-2xl">{inst.logo}</span>
                          <div>
                            <span className="text-xs font-bold block text-slate-800 dark:text-slate-200">{inst.name}</span>
                            <span className="text-[9px] text-slate-400 block">{inst.city}/{inst.state}</span>
                          </div>
                        </div>
                        <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-450">R$ {inst.collected.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Volume de Inscrições / Pet sizes */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Volume por Dia */}
                <div className="bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <h4 className="text-sm font-bold text-slate-850 dark:text-slate-200 font-poppins mb-6">Volume de Inscrições por Dia</h4>
                  <div className="h-64 w-full">
                    {chartRegData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartRegData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:hidden" />
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" className="hidden dark:block" />
                          <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                          <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
                          <Tooltip />
                          <Line type="monotone" dataKey="Inscritos" stroke="#003A8C" strokeWidth={3} activeDot={{ r: 8 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-xs text-slate-400 font-medium">Nenhum dado registrado.</div>
                    )}
                  </div>
                </div>

                {/* Porte dos Pets */}
                <div className="bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <h4 className="text-sm font-bold text-slate-850 dark:text-slate-200 font-poppins mb-6">Porte do Pet dos Participantes</h4>
                  <div className="h-64 w-full flex items-center justify-center">
                    {totalInscritos > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={chartPetSizeData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {chartPetSizeData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={PET_COLORS[index % PET_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend verticalAlign="bottom" height={36} />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="text-xs text-slate-400 font-medium">Cadastre pets para ver estatísticas.</div>
                    )}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: PARTICIPANTES */}
          {activeTab === 'participants' && (
            <div className="flex flex-col gap-6 animate-in fade-in duration-200">
              
              {/* Header actions */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white font-poppins">Gestão de Participantes</h3>
                  <p className="text-xs text-slate-500">Total filtrado: {filteredRegistrations.length} participantes</p>
                </div>

                <div className="flex gap-3 w-full sm:w-auto">
                  <button
                    onClick={handleExportCSV}
                    className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Download className="h-3.5 w-3.5" /> CSV / Excel
                  </button>
                  <button
                    onClick={handleExportPDF}
                    className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <FileText className="h-3.5 w-3.5" /> Exportar PDF
                  </button>
                </div>
              </div>

              {/* Filters Block */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm">
                
                {/* Search */}
                <div className="relative sm:col-span-2 lg:col-span-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Buscar por nome, pet, CPF..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-xs focus:outline-none focus:ring-2 focus:ring-primary-blue/20 dark:focus:ring-lime-500/20"
                  />
                </div>

                {/* Filter Donation Status */}
                <div className="flex items-center gap-2">
                  <Heart className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <select
                    value={filterDonation}
                    onChange={(e) => setFilterDonation(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-xs focus:outline-none text-slate-650 dark:text-slate-350"
                  >
                    <option value="All">Status Doação</option>
                    <option value="AGUARDANDO VALIDAÇÃO">Aguardando Validação</option>
                    <option value="EM ANÁLISE">Em Análise</option>
                    <option value="APROVADA">Aprovada</option>
                    <option value="REJEITADA">Rejeitada</option>
                  </select>
                </div>

                {/* Filter Institution */}
                <div className="flex items-center gap-2">
                  <Building2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <select
                    value={filterInstitution}
                    onChange={(e) => setFilterInstitution(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-xs focus:outline-none text-slate-650 dark:text-slate-355"
                  >
                    <option value="All">Todas Instituições</option>
                    {institutions.map(inst => (
                      <option key={inst.id} value={inst.id}>{inst.name}</option>
                    ))}
                  </select>
                </div>

                {/* Filter Kit */}
                <div className="flex items-center gap-2">
                  <CheckSquare className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <select
                    value={filterKit}
                    onChange={(e) => setFilterKit(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-xs focus:outline-none text-slate-650 dark:text-slate-355"
                  >
                    <option value="All">Todos Status de Kit</option>
                    <option value="Aguardando">Aguardando</option>
                    <option value="Liberado">Liberado</option>
                    <option value="Retirado">Retirado</option>
                  </select>
                </div>

              </div>

              {/* Table Container */}
              <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-850 text-slate-400 uppercase font-bold">
                        <th className="p-4">Nº Inscrição</th>
                        <th className="p-4">Tutor</th>
                        <th className="p-4">Pet</th>
                        <th className="p-4">Instituição</th>
                        <th className="p-4">Doação (R$)</th>
                        <th className="p-4">Kit</th>
                        <th className="p-4 text-center">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-900">
                      {filteredRegistrations.map((r) => (
                        <tr key={r.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 text-slate-750 dark:text-slate-300">
                          <td className="p-4 font-mono font-bold text-[#003A8C] dark:text-blue-400">{r.regNumber}</td>
                          <td className="p-4">
                            <span className="font-bold block text-slate-900 dark:text-white">{r.tutorName}</span>
                            <span className="text-[10px] text-slate-400 block mt-0.5">{r.tutorEmail}</span>
                            <span className="text-[10px] text-slate-450 block">{r.tutorCity || ''}{r.tutorState ? `/${r.tutorState}` : ''}</span>
                          </td>
                          <td className="p-4">
                            <span className="font-semibold block text-slate-900 dark:text-white">{r.petName}</span>
                            <span className="text-[10px] text-slate-400 block mt-0.5">{r.petSpecies} • {r.petBreed} • {r.petSize}</span>
                          </td>
                          <td className="p-4 font-medium">{getInstName(r.selectedInstitution)}</td>
                          <td className="p-4">
                            <div className="flex flex-col gap-1.5">
                              <span className="font-bold block text-slate-900 dark:text-white">R$ {r.donationValue.toFixed(2)}</span>
                              <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-lg font-bold text-[9px] uppercase tracking-wider w-fit ${
                                r.donationStatus === 'APROVADA'
                                  ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-400'
                                  : r.donationStatus === 'AGUARDANDO VALIDAÇÃO'
                                    ? 'bg-blue-100 dark:bg-blue-950/50 text-blue-800 dark:text-blue-400'
                                    : r.donationStatus === 'REJEITADA'
                                      ? 'bg-red-100 dark:bg-red-950/50 text-red-800 dark:text-red-400'
                                      : 'bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-400'
                              }`}>
                                {r.donationStatus}
                              </span>
                              {r.donationStatus === 'AGUARDANDO VALIDAÇÃO' && (
                                <div className="flex gap-1.5 mt-1">
                                  <button
                                    onClick={() => handleApproveDonation(r.id)}
                                    className="px-2 py-0.5 rounded-md bg-emerald-500 hover:bg-emerald-600 text-white text-[8px] font-bold flex items-center gap-0.5 transition-colors"
                                    title="Aprovar"
                                  >
                                    <Check className="h-3 w-3" /> Validar
                                  </button>
                                  <button
                                    onClick={() => handleRejectDonation(r.id)}
                                    className="px-2 py-0.5 rounded-md bg-red-500 hover:bg-red-650 text-white text-[8px] font-bold flex items-center gap-0.5 transition-colors"
                                    title="Rejeitar"
                                  >
                                    <X className="h-3 w-3" /> Rejeitar
                                  </button>
                                </div>
                              )}
                              {r.donationReceipt && (
                                <button
                                  onClick={() => setViewReceiptUrl(r.donationReceipt || null)}
                                  className="text-[9px] text-blue-500 hover:text-blue-700 font-semibold flex items-center gap-0.5 mt-1"
                                >
                                  <Eye className="h-3 w-3" /> Ver comprovante
                                </button>
                              )}
                            </div>
                          </td>
                          <td className="p-4">
                            <select
                              value={r.statusKit}
                              onChange={(e) => handleUpdateKit(r.id, e.target.value as any)}
                              className="p-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-[10px] focus:outline-none"
                            >
                              <option value="Aguardando">Aguardando</option>
                              <option value="Liberado">Liberado</option>
                              <option value="Retirado">Retirado</option>
                            </select>
                          </td>
                          <td className="p-4 text-center">
                            <button
                              onClick={() => handleDeleteParticipant(r.id)}
                              className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/35 text-slate-450 hover:text-red-500 transition-colors"
                              title="Excluir Inscrição"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {filteredRegistrations.length === 0 && (
                        <tr>
                          <td colSpan={7} className="text-center p-8 text-slate-400 font-semibold">Nenhum participante correspondente aos filtros.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: INSTITUIÇÕES (CRUD) */}
          {activeTab === 'institutions' && (
            <div className="flex flex-col gap-6 animate-in fade-in duration-200">
              
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white font-poppins">Instituições Parceiras</h3>
                  <p className="text-xs text-slate-500">Cadastre e gerencie as entidades parceiras da Cãominhada 2026.</p>
                </div>
                <button
                  onClick={openNewInstModal}
                  className="px-4 py-2.5 rounded-xl bg-[#003A8C] hover:bg-blue-800 text-white dark:bg-lime-500 dark:hover:bg-lime-600 dark:text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors hover-lift"
                >
                  <Plus className="h-4 w-4" /> Nova Instituição
                </button>
              </div>

              {/* Institutions List Table */}
              <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-850 text-slate-400 uppercase font-bold">
                        <th className="p-4">Logo/Nome</th>
                        <th className="p-4">Contato / Responsável</th>
                        <th className="p-4">PIX</th>
                        <th className="p-4">Credenciais Login</th>
                        <th className="p-4 text-center">Indicadores</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-center">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-900">
                      {institutions.map((inst) => (
                        <tr key={inst.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 text-slate-700 dark:text-slate-350">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <span className="text-3xl shrink-0">{inst.logo}</span>
                              <div>
                                <span className="font-bold text-slate-900 dark:text-white block">{inst.name}</span>
                                <span className="text-[10px] text-slate-400 block mt-0.5">{inst.city}/{inst.state}</span>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="font-bold block text-slate-900 dark:text-white">{inst.responsibleName || 'N/A'}</span>
                            <span className="text-[10px] text-slate-400 block mt-0.5">{inst.responsibleEmail || 'N/A'}</span>
                            <span className="text-[10px] text-slate-400 block">{inst.responsiblePhone || 'N/A'}</span>
                          </td>
                          <td className="p-4">
                            <span className="font-mono bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded text-[10px] font-bold select-all block w-fit max-w-[150px] truncate" title={inst.pixKey}>
                              {inst.pixKey}
                            </span>
                            <span className="text-[9px] text-slate-400 mt-1 block font-semibold">Tipo: {inst.pixType}</span>
                          </td>
                          <td className="p-4">
                            <span className="text-[10px] text-slate-700 dark:text-slate-300 block">E: <strong>{inst.email || 'N/A'}</strong></span>
                            <span className="text-[10px] text-slate-700 dark:text-slate-300 block">S: <strong>{inst.password || 'N/A'}</strong></span>
                          </td>
                          <td className="p-4 text-center">
                            <div className="inline-flex flex-col text-[10px] text-left gap-0.5">
                              <span>Atendidos: <strong>{inst.animalsServed}</strong></span>
                              <span>Castrados: <strong>{inst.castrations}</strong></span>
                              <span>Resgatados: <strong>{inst.rescues}</strong></span>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                              inst.status === 'Ativo'
                                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-850 dark:text-emerald-455'
                                : 'bg-slate-100 dark:bg-slate-900 text-slate-500'
                            }`}>
                              {inst.status}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <div className="flex justify-center gap-2">
                              <button
                                onClick={() => openEditInstModal(inst)}
                                className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/30 text-slate-400 hover:text-blue-500 transition-colors"
                                title="Editar"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteInstitution(inst.id)}
                                className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-slate-400 hover:text-red-500 transition-colors"
                                title="Deletar"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {institutions.length === 0 && (
                        <tr>
                          <td colSpan={7} className="text-center p-8 text-slate-450 font-semibold">Nenhuma instituição parceira cadastrada.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* TAB 4: FINANCEIRO */}
          {activeTab === 'financial' && (
            <div className="flex flex-col gap-8 animate-in fade-in duration-200">
              
              {/* Financial Metrics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                
                {/* Revenue Card */}
                <div className="bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Total Receitas</span>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                      R$ {receitaTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                    <div className="p-2 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 rounded-xl">
                      <DollarSign className="h-5 w-5" />
                    </div>
                  </div>
                  <span className="text-[9px] text-slate-400 mt-2 block">
                    Doações: R$ {receitaDoacoes.toFixed(2)} + Patrocínios: R$ {receitaPatrocinios.toFixed(2)}
                  </span>
                </div>

                {/* Expenses Card */}
                <div className="bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Total Despesas</span>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-2xl font-extrabold text-red-600 dark:text-red-400">
                      R$ {despesaTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                    <div className="p-2 bg-red-50 dark:bg-red-950/20 text-red-500 rounded-xl">
                      <Trash2 className="h-5 w-5" />
                    </div>
                  </div>
                  <span className="text-[9px] text-slate-450 mt-2 block">Operações operacionais do circuito</span>
                </div>

                {/* Balance Card */}
                <div className="bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Balanço do Evento</span>
                  <div className="mt-4 flex items-center justify-between">
                    <span className={`text-2xl font-extrabold ${lucroLiquido >= 0 ? 'text-emerald-600 dark:text-emerald-450' : 'text-red-500'}`}>
                      R$ {lucroLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg uppercase tracking-wider ${lucroLiquido >= 0 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950' : 'bg-red-100 text-red-800'}`}>
                      {lucroLiquido >= 0 ? 'Superavit' : 'Deficit'}
                    </span>
                  </div>
                  <span className="text-[9px] text-slate-450 mt-2 block">Saldo líquido restante pós-operação</span>
                </div>

              </div>

              {/* Form & Table */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Add Expense Form */}
                <div className="bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm h-fit">
                  <h4 className="text-sm font-bold text-slate-850 dark:text-slate-200 font-poppins mb-4">Adicionar Despesa</h4>
                  
                  <form onSubmit={handleAddExpense} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5 text-left">
                      <label htmlFor="expTitle" className="text-xs font-bold text-slate-700 dark:text-slate-350">Item de Despesa</label>
                      <input id="expTitle" type="text" placeholder="Ex: Medalhas, Impressão..." value={newExpenseTitle} onChange={(e) => setNewExpenseTitle(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-xs focus:outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5 text-left">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-350">Categoria</label>
                      <select value={newExpenseCategory} onChange={(e) => setNewExpenseCategory(e.target.value as any)}
                        className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:outline-none"
                      >
                        <option value="Marketing">Marketing</option>
                        <option value="Estrutura">Estrutura</option>
                        <option value="Brindes">Brindes</option>
                        <option value="Equipe">Equipe de Apoio</option>
                        <option value="Alimentação">Alimentação / Hidratação</option>
                        <option value="Outros">Outros</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5 text-left">
                      <label htmlFor="expVal" className="text-xs font-bold text-slate-700 dark:text-slate-350">Valor (R$)</label>
                      <input id="expVal" type="number" placeholder="0,00" value={newExpenseValue || ''} onChange={(e) => setNewExpenseValue(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-xs focus:outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5 text-left">
                      <label htmlFor="expDate" className="text-xs font-bold text-slate-700 dark:text-slate-350">Data da Despesa</label>
                      <input id="expDate" type="date" value={newExpenseDate} onChange={(e) => setNewExpenseDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-xs focus:outline-none"
                      />
                    </div>
                    <button type="submit" className="w-full py-3 rounded-2xl bg-[#003A8C] hover:bg-blue-800 text-white dark:bg-lime-500 dark:text-slate-950 font-bold text-xs">
                      Cadastrar Despesa
                    </button>
                  </form>
                </div>

                {/* Expenses list */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
                  <h4 className="p-5 font-bold text-slate-850 dark:text-slate-200 font-poppins border-b border-slate-100 dark:border-slate-900 text-sm text-left">Lançamentos de Despesas</h4>
                  
                  <div className="overflow-x-auto max-h-[380px] overflow-y-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-850 text-slate-400 uppercase font-bold">
                          <th className="p-4">Item</th>
                          <th className="p-4">Categoria</th>
                          <th className="p-4">Data</th>
                          <th className="p-4">Valor</th>
                          <th className="p-4 text-center">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-900">
                        {expenses.map((exp) => (
                          <tr key={exp.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 text-slate-705 dark:text-slate-300">
                            <td className="p-4 font-bold text-slate-900 dark:text-white">{exp.title}</td>
                            <td className="p-4">
                              <span className="px-2 py-0.5 rounded-lg font-bold text-[9px] uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                {exp.category}
                              </span>
                            </td>
                            <td className="p-4">{new Date(exp.date).toLocaleDateString('pt-BR')}</td>
                            <td className="p-4 font-bold text-red-500">R$ {exp.value.toFixed(2)}</td>
                            <td className="p-4 text-center">
                              <button
                                onClick={() => handleDeleteExpense(exp.id)}
                                className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-slate-400 hover:text-red-500 transition-colors"
                                title="Excluir despesa"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 5: PATROCINADORES */}
          {activeTab === 'sponsors' && (
            <div className="flex flex-col gap-6 animate-in fade-in duration-200">
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form to add sponsor */}
                <div className="bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm h-fit">
                  <h4 className="text-sm font-bold text-slate-850 dark:text-slate-200 font-poppins mb-4">Novo Patrocinador</h4>
                  
                  <form onSubmit={handleAddSponsor} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5 text-left">
                      <label htmlFor="spName" className="text-xs font-bold text-slate-700 dark:text-slate-350">Nome da Empresa</label>
                      <input id="spName" type="text" placeholder="Nome do Patrocinador" value={newSponsorName} onChange={(e) => setNewSponsorName(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-xs focus:outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5 text-left">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-350">Categoria</label>
                      <select value={newSponsorCategory} onChange={(e) => setNewSponsorCategory(e.target.value as any)}
                        className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:outline-none"
                      >
                        <option value="Master">Master</option>
                        <option value="Ouro">Ouro</option>
                        <option value="Prata">Prata</option>
                        <option value="Apoio">Apoio</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5 text-left">
                      <label htmlFor="spValue" className="text-xs font-bold text-slate-700 dark:text-slate-350">Valor Investido (R$)</label>
                      <input id="spValue" type="number" placeholder="0,05" value={newSponsorInvested || ''} onChange={(e) => setNewSponsorInvested(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-xs focus:outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5 text-left">
                      <label htmlFor="spWebsite" className="text-xs font-bold text-slate-700 dark:text-slate-350">Site oficial (URL)</label>
                      <input id="spWebsite" type="text" placeholder="https://..." value={newSponsorWebsite} onChange={(e) => setNewSponsorWebsite(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-xs focus:outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5 text-left">
                      <label htmlFor="spDesc" className="text-xs font-bold text-slate-700 dark:text-slate-350">Breve Descrição</label>
                      <textarea id="spDesc" placeholder="Descrição do patrocínio..." value={newSponsorDesc} onChange={(e) => setNewSponsorDesc(e.target.value)}
                        className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-xs focus:outline-none h-16"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5 text-left">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-350">Logotipo</label>
                      <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-850">
                        <div className="h-14 w-14 rounded-xl border border-slate-250 flex items-center justify-center overflow-hidden shrink-0 bg-slate-100 dark:bg-slate-800">
                          {newSponsorLogo ? <img src={newSponsorLogo} alt="Sponsor logo" className="h-full w-full object-cover" /> : <Upload className="h-5 w-5 text-slate-400" />}
                        </div>
                        <label className="px-4 py-2 rounded-xl bg-[#003A8C] text-white text-[10px] font-bold cursor-pointer transition-colors hover:bg-blue-700">
                          Carregar Logo
                          <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                        </label>
                      </div>
                    </div>
                    <button type="submit" className="w-full py-3 rounded-2xl bg-[#003A8C] hover:bg-blue-800 text-white dark:bg-lime-500 dark:text-slate-950 font-bold text-xs">
                      Adicionar Patrocinador
                    </button>
                  </form>
                </div>

                {/* Sponsors List Table */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
                  <h4 className="p-5 font-bold text-slate-850 dark:text-slate-200 font-poppins border-b border-slate-100 dark:border-slate-900 text-sm text-left">Patrocinadores Cadastrados</h4>
                  
                  <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-850 text-slate-400 uppercase font-bold">
                          <th className="p-4">Empresa</th>
                          <th className="p-4">Categoria</th>
                          <th className="p-4">Investimento</th>
                          <th className="p-4 text-center">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-900">
                        {sponsors.map((sp) => (
                          <tr key={sp.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 text-slate-705 dark:text-slate-300">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 overflow-hidden flex items-center justify-center shrink-0">
                                  {sp.logo.startsWith('http') || sp.logo.startsWith('data:') ? (
                                    <img src={sp.logo} alt={sp.name} className="h-full w-full object-contain" />
                                  ) : (
                                    <span className="font-bold text-slate-400 uppercase">{sp.name.substring(0,2)}</span>
                                  )}
                                </div>
                                <div className="text-left">
                                  <span className="font-bold text-slate-900 dark:text-white block">{sp.name}</span>
                                  {sp.website !== '#' && <span className="text-[10px] text-slate-450 block truncate max-w-[160px]">{sp.website}</span>}
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <span className={`inline-flex px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wider ${
                                sp.category === 'Master'
                                  ? 'bg-[#003A8C] text-white dark:bg-lime-500 dark:text-slate-950'
                                  : sp.category === 'Ouro'
                                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950'
                                    : sp.category === 'Prata'
                                      ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-350'
                                      : 'bg-blue-50 text-blue-600 dark:bg-blue-950'
                              }`}>
                                {sp.category}
                              </span>
                            </td>
                            <td className="p-4 font-bold text-emerald-600 dark:text-emerald-450">R$ {sp.investedValue.toFixed(2)}</td>
                            <td className="p-4 text-center">
                              <button
                                onClick={() => handleDeleteSponsor(sp.id)}
                                className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-slate-400 hover:text-red-500 transition-colors"
                                title="Excluir Patrocinador"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>

            </div>
          )}

        </div>
      </div>

      {/* COMPROVANTE VIEWER MODAL */}
      {viewReceiptUrl && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-950 max-w-lg w-full rounded-3xl p-6 border border-slate-200 dark:border-slate-850 shadow-2xl flex flex-col relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setViewReceiptUrl(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-400 hover:text-slate-605 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-base font-bold text-slate-900 dark:text-white font-poppins mb-4">Comprovante de Doação</h3>
            
            <div className="bg-slate-100 dark:bg-slate-900 p-4 rounded-2xl flex items-center justify-center max-h-[350px] overflow-auto border border-slate-200 dark:border-slate-800">
              {viewReceiptUrl.startsWith('data:application/pdf') ? (
                <div className="flex flex-col items-center gap-3 py-10">
                  <FileText className="h-16 w-16 text-slate-450" />
                  <span className="text-xs font-bold text-slate-550">Documento PDF Carregado</span>
                  <a href={viewReceiptUrl} download="comprovante.pdf" className="px-4 py-2 bg-[#003A8C] text-white rounded-lg text-xs font-bold">Download do PDF</a>
                </div>
              ) : (
                <img src={viewReceiptUrl} alt="Comprovante de pagamento" className="max-w-full h-auto object-contain rounded-lg" />
              )}
            </div>
          </div>
        </div>
      )}

      {/* INSTITUTION CREATE/EDIT MODAL */}
      {instModalOpen && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-950 max-w-2xl w-full rounded-3xl p-6 border border-slate-200 dark:border-slate-850 shadow-2xl flex flex-col relative animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setInstModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="text-center mb-6">
              <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950 text-primary-blue dark:text-blue-400 uppercase tracking-widest inline-block mb-2">
                {editingInstId ? 'Editar Instituição' : 'Nova Instituição'}
              </span>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white font-poppins">Configurações da Instituição</h3>
              <p className="text-xs text-slate-500 mt-1">Insira os dados da instituição e suas chaves Pix para receber as doações diretas.</p>
            </div>

            <form onSubmit={handleSaveInstitution} className="flex flex-col gap-5 text-left">
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Nome */}
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Nome da Instituição *</label>
                  <input required type="text" placeholder="Nome Completo" value={instName} onChange={(e) => setInstName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-xs focus:outline-none"
                  />
                </div>
                {/* Logo emoji */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Logo (Emoji/Ícone) *</label>
                  <input required type="text" placeholder="Ex: 🐾, 🏠, 💚" value={instLogo} onChange={(e) => setInstLogo(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-xs text-center focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Descrição */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Breve Descrição *</label>
                  <textarea required placeholder="Sobre o trabalho da instituição..." value={instDesc} onChange={(e) => setInstDesc(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-xs focus:outline-none h-16"
                  />
                </div>
                {/* Missão */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Missão Principal *</label>
                  <textarea required placeholder="Objetivo geral ou meta social..." value={instMission} onChange={(e) => setInstMission(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-xs focus:outline-none h-16"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Chave Pix */}
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Chave PIX para Recebimento *</label>
                  <input required type="text" placeholder="CNPJ, E-mail, Celular ou Aleatória" value={instPixKey} onChange={(e) => setInstPixKey(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-xs focus:outline-none font-mono"
                  />
                </div>
                {/* Tipo de Chave */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Tipo de Chave *</label>
                  <select value={instPixType} onChange={(e) => setInstPixType(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:outline-none"
                  >
                    <option value="CNPJ">CNPJ</option>
                    <option value="E-mail">E-mail</option>
                    <option value="Telefone">Telefone</option>
                    <option value="Chave Aleatória">Chave Aleatória</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Cidade */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Cidade *</label>
                  <input required type="text" placeholder="Ex: Recife" value={instCity} onChange={(e) => setInstCity(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-xs focus:outline-none"
                  />
                </div>
                {/* Estado */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Estado *</label>
                  <input required type="text" maxLength={2} placeholder="Ex: PE" value={instState} onChange={(e) => setInstState(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-850 flex flex-col gap-3">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Dados do Responsável</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-slate-500">Nome Responsável</label>
                    <input type="text" placeholder="Nome" value={instRespName} onChange={(e) => setInstRespName(e.target.value)}
                      className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent text-[11px] focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-slate-500">E-mail</label>
                    <input type="email" placeholder="email@responsavel.org" value={instRespEmail} onChange={(e) => setInstRespEmail(e.target.value)}
                      className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent text-[11px] focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-slate-500">Telefone</label>
                    <input type="text" placeholder="(81) 99999-9999" value={instRespPhone} onChange={(e) => setInstRespPhone(e.target.value)}
                      className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent text-[11px] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Login credentials */}
              <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 flex flex-col gap-3">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#003A8C] dark:text-blue-400 block">Credenciais de Acesso (Painel Parceiro)</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-600 dark:text-slate-350">E-mail para Login *</label>
                    <input required type="email" placeholder="login@email.org" value={instEmail} onChange={(e) => setInstEmail(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900 text-xs focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-600 dark:text-slate-355">Senha *</label>
                    <input required type="text" placeholder="Senha de Acesso" value={instPassword} onChange={(e) => setInstPassword(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900 text-xs focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                {/* Animals Served */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Animais Atendidos</label>
                  <input type="number" value={instAnimalsServed} onChange={(e) => setInstAnimalsServed(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-xs focus:outline-none"
                  />
                </div>
                {/* Castrations */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Castrações</label>
                  <input type="number" value={instCastrations} onChange={(e) => setInstCastrations(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-xs focus:outline-none"
                  />
                </div>
                {/* Rescues */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Resgates</label>
                  <input type="number" value={instRescues} onChange={(e) => setInstRescues(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-xs focus:outline-none"
                  />
                </div>
                {/* Status */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Status Parceiro</label>
                  <select value={instStatus} onChange={(e) => setInstStatus(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:outline-none"
                  >
                    <option value="Ativo">Ativo</option>
                    <option value="Inativo">Inativo</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Photo URL */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">URL Foto da Entidade</label>
                  <input type="text" placeholder="https://unsplash.com/..." value={instPhoto} onChange={(e) => setInstPhoto(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-xs focus:outline-none"
                  />
                </div>
                {/* Banner URL */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">URL Banner da Entidade</label>
                  <input type="text" placeholder="https://unsplash.com/..." value={instBanner} onChange={(e) => setInstBanner(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-4 mt-2">
                <button type="button" onClick={() => setInstModalOpen(false)}
                  className="flex-1 py-3.5 rounded-2xl font-bold bg-slate-105 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors text-center text-xs"
                >
                  Cancelar
                </button>
                <button type="submit"
                  className="flex-[2] py-3.5 rounded-2xl font-bold bg-[#003A8C] hover:bg-blue-800 text-white dark:bg-lime-500 dark:hover:bg-lime-600 dark:text-slate-950 transition-colors text-center text-xs shadow-md"
                >
                  {editingInstId ? 'Salvar Alterações' : 'Cadastrar Instituição'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
