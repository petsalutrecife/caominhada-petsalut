'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Logo from '@/components/Logo';
import ThemeToggle from '@/components/ThemeToggle';
import { supabaseMock, Registration, Sponsor, Expense } from '@/lib/supabaseMock';
import { 
  LogOut, ClipboardList, TrendingUp, Users, Award, Landmark, Plus, Trash2, 
  Download, Edit, Search, Filter, ShieldCheck, Check, DollarSign, Upload, Globe, FileText, CheckSquare, RefreshCw
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

  // Tabs: 'dashboard' | 'participants' | 'financial' | 'sponsors'
  const [activeTab, setActiveTab] = useState<'dashboard' | 'participants' | 'financial' | 'sponsors'>('dashboard');

  // Database states
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  // Search & Filter states (Participants)
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPayment, setFilterPayment] = useState<string>('All');
  const [filterKit, setFilterKit] = useState<string>('All');

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

  const refreshData = () => {
    setRegistrations(supabaseMock.getRegistrations());
    setSponsors(supabaseMock.getSponsors());
    setExpenses(supabaseMock.getExpenses());
  };

  const handleLogout = () => {
    supabaseMock.signOut();
    router.push('/login');
  };

  // --- Actions ---

  // Update participant payment
  const handleUpdatePayment = (id: string, currentStatus: 'Pendente' | 'Aprovado') => {
    const nextStatus = currentStatus === 'Pendente' ? 'Aprovado' : 'Pendente';
    const updates: Partial<Registration> = { statusPayment: nextStatus };
    
    // Automatically liberate kit if payment is approved
    if (nextStatus === 'Aprovado') {
      updates.statusKit = 'Liberado';
    } else {
      updates.statusKit = 'Aguardando';
    }

    supabaseMock.updateRegistration(id, updates);
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

    // Reset Form
    setNewSponsorName('');
    setNewSponsorLogo('');
    setNewSponsorInvested(0);
    setNewSponsorDesc('');
    setNewSponsorWebsite('');
    
    refreshData();
    alert('Patrocinador adicionado com sucesso!');
  };

  // Handle Logo file upload (converting to base64 DataURI)
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

  // Delete Sponsor
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

  // Delete Expense
  const handleDeleteExpense = (id: string) => {
    if (confirm('Deseja excluir esta despesa?')) {
      supabaseMock.deleteExpense(id);
      refreshData();
    }
  };

  // --- Exports ---

  // Export Participants as CSV
  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Inscricao,Tutor,CPF,Telefone,Email,Pet,Raca,Porte,Idade,Pagamento,Kit,Data Cadastro\n';
    
    registrations.forEach(r => {
      const row = [
        r.regNumber,
        r.tutorName,
        r.tutorCpf,
        r.tutorPhone,
        r.tutorEmail,
        r.petName,
        r.petBreed,
        r.petSize,
        r.petAge,
        r.statusPayment,
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

  // Export PDF Report of Participants
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
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text(`${idx + 1}. [${r.regNumber}] - Tutor: ${r.tutorName}`, 15, y);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(`Pet: ${r.petName} (${r.petBreed}, ${r.petSize}) • Contato: ${r.tutorEmail} • CPF: ${r.tutorCpf}`, 15, y + 5);
      doc.text(`Status Pagamento: ${r.statusPayment} • Kit: ${r.statusKit}`, 15, y + 10);
      
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.2);
      doc.line(15, y + 13, 195, y + 13);
      
      y += 18;
    });

    doc.save(`Relatorio_Participantes_Caominhada_${Date.now()}.pdf`);
  };

  // --- Calculations for Analytics ---

  const totalInscritos = registrations.length;
  const totalPagos = registrations.filter(r => r.statusPayment === 'Aprovado').length;
  const totalKitsEntregues = registrations.filter(r => r.statusKit === 'Retirado').length;
  const totalPatrocinadores = sponsors.length;
  
  // Registration Fee = R$ 29,90
  const receitaInscricoes = totalPagos * 29.90;
  const receitaPatrocinios = sponsors.reduce((acc, curr) => acc + curr.investedValue, 0);
  const receitaTotal = receitaInscricoes + receitaPatrocinios;

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

  // COLORS for charts
  const PET_COLORS = ['#A7CF00', '#003A8C', '#F59E0B'];

  // Filtered registrations list for manager table
  const filteredRegistrations = registrations.filter(r => {
    const matchesSearch = 
      r.tutorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.petName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.regNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.tutorCpf.includes(searchQuery);

    const matchesPayment = filterPayment === 'All' || r.statusPayment === filterPayment;
    const matchesKit = filterKit === 'All' || r.statusKit === filterKit;

    return matchesSearch && matchesPayment && matchesKit;
  });

  if (!mounted || !adminUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 text-slate-500">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-8 w-8 animate-spin text-primary-blue dark:text-lime-500" />
          <p className="font-semibold text-sm">Carregando painel de controle...</p>
        </div>
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
        
        {/* Navigation Sidebar/Bar */}
        <div className="w-full md:w-64 shrink-0 flex flex-row md:flex-col gap-2 p-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl h-fit shadow-sm overflow-x-auto">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex-1 md:flex-initial flex items-center justify-center md:justify-start gap-2.5 px-4 py-3 rounded-2xl text-xs font-bold transition-all shrink-0 ${
              activeTab === 'dashboard'
                ? 'bg-primary-blue text-white dark:bg-lime-500 dark:text-slate-950'
                : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900'
            }`}
          >
            <TrendingUp className="h-4 w-4" /> Visão Geral
          </button>
          <button
            onClick={() => setActiveTab('participants')}
            className={`flex-1 md:flex-initial flex items-center justify-center md:justify-start gap-2.5 px-4 py-3 rounded-2xl text-xs font-bold transition-all shrink-0 ${
              activeTab === 'participants'
                ? 'bg-primary-blue text-white dark:bg-lime-500 dark:text-slate-950'
                : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900'
            }`}
          >
            <Users className="h-4 w-4" /> Participantes
          </button>
          <button
            onClick={() => setActiveTab('financial')}
            className={`flex-1 md:flex-initial flex items-center justify-center md:justify-start gap-2.5 px-4 py-3 rounded-2xl text-xs font-bold transition-all shrink-0 ${
              activeTab === 'financial'
                ? 'bg-primary-blue text-white dark:bg-lime-500 dark:text-slate-950'
                : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900'
            }`}
          >
            <Landmark className="h-4 w-4" /> Gestão Financeira
          </button>
          <button
            onClick={() => setActiveTab('sponsors')}
            className={`flex-1 md:flex-initial flex items-center justify-center md:justify-start gap-2.5 px-4 py-3 rounded-2xl text-xs font-bold transition-all shrink-0 ${
              activeTab === 'sponsors'
                ? 'bg-primary-blue text-white dark:bg-lime-500 dark:text-slate-950'
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
                      R$ {receitaTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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

                {/* Metric: Confirmed */}
                <div className="bg-white dark:bg-slate-950 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between hover-lift">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Confirmados (Pagos)</span>
                  <div className="flex justify-between items-baseline mt-4">
                    <span className="text-3xl font-extrabold font-poppins text-slate-900 dark:text-white">{totalPagos}</span>
                    <span className="text-xs font-semibold text-slate-400">
                      {totalInscritos > 0 ? `${Math.round((totalPagos / totalInscritos) * 100)}%` : '0%'}
                    </span>
                  </div>
                </div>

              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Chart: Registrations per day */}
                <div className="bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-250 font-poppins mb-6">Volume de Inscrições por Dia</h4>
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

                {/* Chart: Pet Sizes */}
                <div className="bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-250 font-poppins mb-6">Distribuição por Porte do Pet</h4>
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

              {/* Quick Actions / Recent Activity */}
              <div className="bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-250 font-poppins mb-4">Painel Rápido de Ações</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button 
                    onClick={() => setActiveTab('participants')}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-all"
                  >
                    <span className="text-xs font-bold text-primary-blue dark:text-lime-400 block">Gerenciar Inscrições</span>
                    <p className="text-[11px] text-slate-500 mt-1">Veja todos os inscritos, aprove pagamentos Pix e libere kits.</p>
                  </button>
                  <button 
                    onClick={() => setActiveTab('financial')}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-all"
                  >
                    <span className="text-xs font-bold text-primary-blue dark:text-lime-400 block">Gerenciar Finanças</span>
                    <p className="text-[11px] text-slate-500 mt-1">Adicione despesas operacionais do evento e veja o balanço.</p>
                  </button>
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
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm">
                
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Buscar por nome, pet, CPF..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-xs focus:outline-none focus:ring-2 focus:ring-primary-blue/20 dark:focus:ring-lime-500/20"
                  />
                </div>

                {/* Filter Payment */}
                <div className="flex items-center gap-2">
                  <Filter className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <select
                    value={filterPayment}
                    onChange={(e) => setFilterPayment(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-xs focus:outline-none text-slate-600 dark:text-slate-350"
                  >
                    <option value="All">Todos Pagamentos</option>
                    <option value="Aprovado">Aprovado</option>
                    <option value="Pendente">Pendente</option>
                  </select>
                </div>

                {/* Filter Kit */}
                <div className="flex items-center gap-2">
                  <CheckSquare className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <select
                    value={filterKit}
                    onChange={(e) => setFilterKit(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-xs focus:outline-none text-slate-600 dark:text-slate-350"
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
                      <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase font-bold">
                        <th className="p-4">Nº Inscrição</th>
                        <th className="p-4">Tutor (Contato)</th>
                        <th className="p-4">Pet (Porte/Idade)</th>
                        <th className="p-4">Pagamento</th>
                        <th className="p-4">Entrega Kit</th>
                        <th className="p-4 text-center">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-900">
                      {filteredRegistrations.map((r) => (
                        <tr key={r.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 text-slate-700 dark:text-slate-300">
                          <td className="p-4 font-mono font-bold text-primary-blue dark:text-blue-400">{r.regNumber}</td>
                          <td className="p-4">
                            <span className="font-bold block text-slate-900 dark:text-white">{r.tutorName}</span>
                            <span className="text-[10px] text-slate-400 block mt-0.5">{r.tutorEmail} • {r.tutorPhone}</span>
                          </td>
                          <td className="p-4">
                            <span className="font-semibold block">{r.petName}</span>
                            <span className="text-[10px] text-slate-400 block mt-0.5">{r.petBreed} • {r.petSize} ({r.petAge}a)</span>
                          </td>
                          <td className="p-4">
                            <button
                              onClick={() => handleUpdatePayment(r.id, r.statusPayment)}
                              className={`px-2 py-1 rounded-lg font-bold text-[9px] uppercase tracking-wider flex items-center gap-1 ${
                                r.statusPayment === 'Aprovado'
                                  ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-400'
                                  : 'bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-400'
                              }`}
                              title="Clique para alternar o pagamento"
                            >
                              {r.statusPayment === 'Aprovado' ? <ShieldCheck className="h-3 w-3" /> : null}
                              {r.statusPayment}
                            </button>
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
                              className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/35 text-slate-400 hover:text-red-500 transition-colors"
                              title="Excluir Inscrição"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {filteredRegistrations.length === 0 && (
                        <tr>
                          <td colSpan={6} className="text-center p-8 text-slate-400 font-semibold">Nenhum participante correspondente aos filtros.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: FINANCEIRO */}
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
                    Inscrições: R$ {receitaInscricoes.toFixed(2)} + Patrocínios: R$ {receitaPatrocinios.toFixed(2)}
                  </span>
                </div>

                {/* Expenses Card */}
                <div className="bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Total Despesas</span>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-2xl font-extrabold text-red-500">
                      R$ {despesaTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                    <div className="p-2 bg-red-50 dark:bg-red-950/20 text-red-500 rounded-xl">
                      <Trash2 className="h-5 w-5" />
                    </div>
                  </div>
                  <span className="text-[9px] text-slate-400 mt-2 block">Custo operacional cadastrado</span>
                </div>

                {/* Profit Card */}
                <div className="bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Lucro Líquido</span>
                  <div className="mt-4 flex items-center justify-between">
                    <span className={`text-2xl font-extrabold ${lucroLiquido >= 0 ? 'text-primary-blue dark:text-lime-400' : 'text-red-500'}`}>
                      R$ {lucroLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                    <div className="p-2 bg-blue-50 dark:bg-blue-950/20 text-primary-blue dark:text-blue-400 rounded-xl">
                      <Landmark className="h-5 w-5" />
                    </div>
                  </div>
                  <span className="text-[9px] text-slate-400 mt-2 block">Receitas menos Despesas</span>
                </div>

              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Left Side: Register Expense Form */}
                <div className="lg:col-span-5 bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-4">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white font-poppins">Cadastrar Nova Despesa</h4>
                  
                  <form onSubmit={handleAddExpense} className="flex flex-col gap-4 text-xs">
                    
                    <div className="flex flex-col gap-1.5">
                      <label className="font-bold text-slate-700 dark:text-slate-350">Descrição / Título</label>
                      <input
                        type="text"
                        placeholder="Ex: Confecção de medalhas"
                        value={newExpenseTitle}
                        onChange={(e) => setNewExpenseTitle(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="font-bold text-slate-700 dark:text-slate-350">Categoria</label>
                        <select
                          value={newExpenseCategory}
                          onChange={(e) => setNewExpenseCategory(e.target.value as any)}
                          className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none"
                        >
                          <option value="Marketing">Marketing</option>
                          <option value="Estrutura">Estrutura</option>
                          <option value="Brindes">Brindes</option>
                          <option value="Equipe">Equipe</option>
                          <option value="Alimentação">Alimentação</option>
                          <option value="Outros">Outros</option>
                        </select>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="font-bold text-slate-700 dark:text-slate-350">Valor (R$)</label>
                        <input
                          type="number"
                          placeholder="0,00"
                          value={newExpenseValue || ''}
                          onChange={(e) => setNewExpenseValue(Number(e.target.value))}
                          className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent"
                          required
                          min="0.01"
                          step="0.01"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="font-bold text-slate-700 dark:text-slate-350">Data de Vencimento / Pgto</label>
                      <input
                        type="date"
                        value={newExpenseDate}
                        onChange={(e) => setNewExpenseDate(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="mt-2 py-3 rounded-xl font-bold bg-primary-blue hover:bg-blue-800 text-white dark:bg-lime-500 dark:hover:bg-lime-600 dark:text-slate-950 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Plus className="h-4 w-4" /> Registrar Despesa
                    </button>

                  </form>
                </div>

                {/* Right Side: Expenses List */}
                <div className="lg:col-span-7 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
                  <div className="p-4 border-b border-slate-150 dark:border-slate-900 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-750 dark:text-slate-300">Tabela de Fluxo de Despesas</span>
                  </div>
                  <div className="overflow-x-auto text-xs">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold bg-slate-50 dark:bg-slate-900/10">
                          <th className="p-3">Título</th>
                          <th className="p-3">Categoria</th>
                          <th className="p-3">Data</th>
                          <th className="p-3 text-right">Valor</th>
                          <th className="p-3 text-center">Excluir</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-900">
                        {expenses.map(e => (
                          <tr key={e.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 text-slate-700 dark:text-slate-300">
                            <td className="p-3 font-semibold">{e.title}</td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                {e.category}
                              </span>
                            </td>
                            <td className="p-3 text-slate-500">{new Date(e.date).toLocaleDateString('pt-BR')}</td>
                            <td className="p-3 text-right font-mono font-bold text-red-500">R$ {e.value.toFixed(2)}</td>
                            <td className="p-3 text-center">
                              <button
                                onClick={() => handleDeleteExpense(e.id)}
                                className="p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 text-slate-400 hover:text-red-500"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                        {expenses.length === 0 && (
                          <tr>
                            <td colSpan={5} className="text-center p-8 text-slate-400">Nenhuma despesa cadastrada ainda.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 4: PATROCINADORES */}
          {activeTab === 'sponsors' && (
            <div className="flex flex-col gap-8 animate-in fade-in duration-200">
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Left Side: Register Sponsor */}
                <div className="lg:col-span-5 bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-4">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white font-poppins">Cadastrar Patrocinador</h4>
                  
                  <form onSubmit={handleAddSponsor} className="flex flex-col gap-4 text-xs">
                    
                    <div className="flex flex-col gap-1.5">
                      <label className="font-bold text-slate-700 dark:text-slate-350">Nome do Patrocinador</label>
                      <input
                        type="text"
                        placeholder="Ex: Royal Canin"
                        value={newSponsorName}
                        onChange={(e) => setNewSponsorName(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="font-bold text-slate-700 dark:text-slate-350">Cota / Categoria</label>
                        <select
                          value={newSponsorCategory}
                          onChange={(e) => setNewSponsorCategory(e.target.value as any)}
                          className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none"
                        >
                          <option value="Master">Master</option>
                          <option value="Ouro">Ouro</option>
                          <option value="Prata">Prata</option>
                          <option value="Apoio">Apoio</option>
                        </select>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="font-bold text-slate-700 dark:text-slate-350">Valor Investido (R$)</label>
                        <input
                          type="number"
                          placeholder="Valor do patrocínio"
                          value={newSponsorInvested || ''}
                          onChange={(e) => setNewSponsorInvested(Number(e.target.value))}
                          className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent"
                          required
                          min="0"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="font-bold text-slate-700 dark:text-slate-350">Website</label>
                      <div className="relative">
                        <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                          type="url"
                          placeholder="https://site.com.br"
                          value={newSponsorWebsite}
                          onChange={(e) => setNewSponsorWebsite(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent"
                        />
                      </div>
                    </div>

                    {/* Image / Logo Upload simulation */}
                    <div className="flex flex-col gap-2">
                      <label className="font-bold text-slate-700 dark:text-slate-350">Logotipo</label>
                      <div className="flex gap-4 items-center">
                        <label className="flex items-center gap-1.5 px-3 py-2 border border-slate-250 dark:border-slate-800 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 rounded-xl cursor-pointer font-semibold text-[10px] transition-colors">
                          <Upload className="h-3.5 w-3.5" /> Fazer Upload
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleLogoUpload}
                            className="hidden"
                          />
                        </label>
                        <span className="text-[10px] text-slate-400 flex-1 truncate">
                          {newSponsorLogo ? 'Imagem selecionada!' : 'Nenhuma logo selecionada'}
                        </span>
                      </div>
                      
                      {/* Logo Preview */}
                      {newSponsorLogo && (
                        <div className="mt-2 relative w-16 h-16 p-1 border border-slate-200 bg-white rounded-xl">
                          <img src={newSponsorLogo} alt="Preview" className="w-full h-full object-contain" />
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="font-bold text-slate-700 dark:text-slate-350">Descrição Curta</label>
                      <textarea
                        placeholder="Ex: Parceria Master na cãominhada..."
                        value={newSponsorDesc}
                        onChange={(e) => setNewSponsorDesc(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent h-16 resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="mt-2 py-3 rounded-xl font-bold bg-primary-blue hover:bg-blue-800 text-white dark:bg-lime-500 dark:hover:bg-lime-600 dark:text-slate-950 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Plus className="h-4 w-4" /> Adicionar Patrocinador
                    </button>

                  </form>
                </div>

                {/* Right Side: Sponsors List */}
                <div className="lg:col-span-7 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
                  <div className="p-4 border-b border-slate-150 dark:border-slate-900 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center text-xs font-bold text-slate-750">
                    <span>Lista de Patrocinadores Cadastrados</span>
                  </div>
                  <div className="overflow-x-auto text-xs">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold bg-slate-50 dark:bg-slate-900/10">
                          <th className="p-3">Logo</th>
                          <th className="p-3">Nome</th>
                          <th className="p-3">Categoria</th>
                          <th className="p-3 text-right">Investimento</th>
                          <th className="p-3 text-center">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-900">
                        {sponsors.map(s => (
                          <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 text-slate-700 dark:text-slate-300">
                            <td className="p-3">
                              <div className="relative w-10 h-10 p-0.5 bg-white border border-slate-200 rounded-lg overflow-hidden">
                                <img src={s.logo} alt={s.name} className="w-full h-full object-contain" />
                              </div>
                            </td>
                            <td className="p-3 font-bold">{s.name}</td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold ${
                                s.category === 'Master' ? 'bg-primary-blue text-white' : 
                                s.category === 'Ouro' ? 'bg-amber-100 text-amber-800' : 
                                s.category === 'Prata' ? 'bg-slate-100 text-slate-700' : 'bg-lime-100 text-lime-850'
                              }`}>
                                {s.category}
                              </span>
                            </td>
                            <td className="p-3 text-right font-mono font-bold">R$ {s.investedValue.toLocaleString('pt-BR')}</td>
                            <td className="p-3 text-center">
                              <button
                                onClick={() => handleDeleteSponsor(s.id)}
                                className="p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 text-slate-400 hover:text-red-500"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                        {sponsors.length === 0 && (
                          <tr>
                            <td colSpan={5} className="text-center p-8 text-slate-400">Nenhum patrocinador cadastrado.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}
