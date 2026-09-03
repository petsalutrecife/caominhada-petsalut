'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Logo from '@/components/Logo';
import ThemeToggle from '@/components/ThemeToggle';
import { supabaseMock, Sponsor, Institution } from '@/lib/supabaseMock';
import { 
  Calendar, MapPin, Clock, Award, ShieldAlert, Heart, Trophy, Users, 
  ChevronRight, Menu, X, ArrowRight, Info, Compass, Dog, Route
} from 'lucide-react';

export default function LandingPage() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('inicio');
  const [timeLeft, setTimeLeft] = useState({ days: 360, hours: 14, minutes: 27, seconds: 45 });

  const navItems = [
    { id: 'inicio', label: 'Início', href: '#inicio' },
    { id: 'sobre', label: 'Sobre o Evento', href: '#sobre' },
    { id: 'instituicoes', label: 'Instituições Ajudadas', href: '#instituicoes' },
    { id: 'percurso', label: 'Percurso', href: '#percurso' },
    { id: 'patrocinadores', label: 'Patrocinadores', href: '#patrocinadores' },
    { id: 'informacoes', label: 'Informações', href: '#informacoes' },
  ];

  // Event Date: Sept 27, 2026 05:30:00
  const eventDate = new Date('2026-09-27T05:30:00').getTime();

  useEffect(() => {
    setMounted(true);
    setSponsors(supabaseMock.getSponsors());
    setInstitutions(supabaseMock.getInstitutions());

    // Fetch from Supabase and refresh data
    supabaseMock.syncFromSupabase().then(() => {
      setInstitutions(supabaseMock.getInstitutions());
    });

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const difference = eventDate - now;

      if (difference <= 0) {
        clearInterval(timer);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        setTimeLeft({ days, hours, minutes, seconds });
      }
    }, 1000);

    const handleScroll = () => {
      const scrollPosition = window.scrollY + 140;
      for (let i = navItems.length - 1; i >= 0; i--) {
        const section = document.getElementById(navItems[i].id);
        if (section && section.offsetTop <= scrollPosition) {
          setActiveTab(navItems[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      clearInterval(timer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [eventDate]);

  const scheduleItems = [
    { time: '05:30', title: 'Abertura do Evento', desc: 'Abertura do Evento, apresentação dos patrocinadores e apoios e preparação para saída.' },
    { time: '05:40', title: 'Aquecimento & Alongamento', desc: 'Sessão divertida de alongamento com adestradores e orientação aos tutores.' },
    { time: '06:00', title: 'Largada da Cãominhada', desc: 'Início da Caminhada de 1,12km e 3.4km com hidratação e suporte veterinário especializado.' },
    { time: '07:30', title: 'Chegada & Entrega de Medalhas', desc: 'Recepção festiva e entrega das medalhas de participação para todos os pets.' },
    { time: '08:00', title: 'Encerramento & Sorteio de Brindes', desc: 'Grande sorteio de brindes dos patrocinadores, fotos oficiais e encerramento.' },
  ];

  const benefits = [
    { icon: <Heart className="h-6 w-6 text-red-500" />, title: 'Saúde & Exercício', desc: 'Uma caminhada de 3km com ritmo leve, ideal para exercitar e divertir cães de todas as idades.' },
    { icon: <Award className="h-6 w-6 text-[#8DC63F]" />, title: 'Kit Exclusivo', desc: 'Cada inscrição inclui camiseta Petsalut para o tutor, bandana para o pet, sacochila e medalha.' },
    { icon: <Users className="h-6 w-6 text-blue-500" />, title: 'Socialização Pet', desc: 'Oportunidade perfeita para o seu cão interagir com outros pets em um ambiente amigável e seguro.' },
    { icon: <Trophy className="h-6 w-6 text-amber-500" />, title: 'Brindes & Sorteios', desc: 'Desfiles interativos com premiações e sorteio de kits completos oferecidos por nossos patrocinadores.' },
  ];

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-100 bg-white/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/">
            <Logo />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1 sm:gap-2 font-poppins">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <a
                  key={item.id}
                  href={item.href}
                  onClick={() => setActiveTab(item.id)}
                  className={`px-3.5 py-2 rounded-xl text-sm transition-all duration-300 relative group flex items-center justify-center ${
                    isActive
                      ? 'font-bold text-[#003A8C] bg-[#8DC63F]/12'
                      : 'font-medium text-slate-650 hover:text-[#003A8C] hover:bg-[#8DC63F]/10'
                  }`}
                >
                  <span>{item.label}</span>
                  {/* Traço verde com efeito glow ao ativar ou passar o mouse */}
                  <span
                    className={`absolute bottom-[-24px] left-2 right-2 h-[3.5px] bg-[#8DC63F] rounded-full shadow-[0_2px_8px_rgba(141,198,63,0.6)] transition-all duration-300 transform origin-center ${
                      isActive
                        ? 'scale-x-100 opacity-100'
                        : 'scale-x-0 opacity-0 group-hover:scale-x-100 group-hover:opacity-75'
                    }`}
                  />
                </a>
              );
            })}
          </nav>

          <div className="hidden lg:flex items-center gap-4">
            <Link
              href="/login"
              className="px-6 py-2.5 rounded-xl text-sm font-bold text-[#003A8C] border-2 border-[#003A8C]/20 bg-[#003A8C]/5 hover:bg-[#003A8C] hover:text-white hover:border-[#003A8C] hover:shadow-[0_4px_20px_rgba(0,58,140,0.35)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="px-6 py-2.5 rounded-xl text-sm font-bold bg-[#8DC63F] hover:bg-[#7cb335] text-white flex items-center gap-2 shadow-lg shadow-[#8DC63F]/30 hover:shadow-[0_6px_25px_rgba(141,198,63,0.55)] hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 relative overflow-hidden group"
            >
              <span className="relative z-10 flex items-center gap-2">Inscreva-se Agora 🐾</span>
              <span className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center gap-3 lg:hidden">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-[#8DC63F]/15 text-slate-700 transition-colors"
              aria-label="Abrir menu"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {menuOpen && (
          <div className="lg:hidden px-4 pt-2 pb-6 bg-white border-b border-slate-200 animate-in fade-in slide-in-from-top-5 duration-200">
            <div className="flex flex-col gap-2">
              {navItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <a
                    key={item.id}
                    href={item.href}
                    onClick={() => {
                      setActiveTab(item.id);
                      setMenuOpen(false);
                    }}
                    className={`px-4 py-3 rounded-2xl text-base transition-all duration-200 flex items-center justify-between ${
                      isActive
                        ? 'font-bold text-[#003A8C] bg-[#8DC63F]/15 border-l-4 border-[#8DC63F]'
                        : 'font-semibold text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{item.label}</span>
                    {isActive && <div className="h-2 w-2 rounded-full bg-[#8DC63F] shadow-[0_0_8px_#8DC63F]" />}
                  </a>
                );
              })}
              <hr className="border-slate-100 my-2" />
              <Link href="/login" onClick={() => setMenuOpen(false)} className="w-full text-center py-3 rounded-2xl text-base font-semibold border-2 border-[#003A8C]/20 bg-[#003A8C]/5 hover:bg-[#003A8C] hover:text-white transition-colors">
                Login
              </Link>
              <Link href="/register" onClick={() => setMenuOpen(false)} className="w-full text-center py-3 rounded-2xl text-base font-bold bg-[#8DC63F] text-white shadow-md shadow-[#8DC63F]/30">
                Inscreva-se Agora 🐾
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section id="inicio" className="relative flex flex-col justify-between overflow-hidden bg-white">
        
        {/* Full-bleed mockup Image on Desktop - aligns perfectly on right, fades to white on left */}
        <div className="absolute right-0 top-0 bottom-0 w-1/2 hidden lg:block select-none z-0">
          <div className="relative w-full h-full">
            <img
              src="/hero-dogs.png"
              alt="Cãominhada Petsalut Evento"
              className="w-full h-full object-cover object-right"
            />
            {/* Gradient mask to blend nicely on large screens */}
            <div className="absolute inset-0 bg-gradient-to-r from-white via-white/5 to-transparent" />
          </div>
        </div>

        {/* Content Wrapper */}
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-12 lg:pt-16 pb-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          
          {/* Left Column: Title Image, Subtitle, Buttons, Countdown Card */}
          <div className="lg:col-span-6 flex flex-col items-start text-left z-20">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[10px] font-extrabold border border-[#8DC63F] text-[#8DC63F] bg-white mb-6 uppercase tracking-wider font-poppins shadow-sm">
              <svg viewBox="0 0 100 100" fill="currentColor" className="h-3.5 w-3.5">
                <path d="M50,45 C40,45 35,53 35,62 C35,72 42,78 50,78 C58,78 65,72 65,62 C65,53 60,45 50,45 Z" />
                <circle cx="28" cy="38" r="9" />
                <circle cx="43" cy="25" r="10" />
                <circle cx="57" cy="25" r="10" />
                <circle cx="72" cy="38" r="9" />
              </svg>
              Vem aí!
            </span>

            {/* Custom Typography Logo Image replacing raw HTML text title */}
            <div className="relative w-full max-w-[480px] select-none mb-4">
              <img
                src="/logocorrida.png"
                alt="Cãominhada Petsalut 2026"
                className="w-full h-auto object-contain"
              />
            </div>

            <p className="mt-2 text-base sm:text-lg text-slate-600 max-w-xl font-medium leading-relaxed font-inter">
              Caminhando pela saúde, diversão e bem-estar dos nossos melhores amigos.
            </p>

            {/* Mockup Action Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4 w-full sm:w-auto font-poppins">
              <Link href="/register" className="px-7 py-3.5 rounded-full font-bold bg-[#8DC63F] hover:bg-[#7cb335] text-white text-center flex items-center justify-center gap-3 shadow-lg shadow-lime-500/10 hover-lift">
                Inscreva-se Agora
                <span className="h-5 w-5 rounded-full bg-white flex items-center justify-center">
                  <ArrowRight className="h-3.5 w-3.5 text-[#8DC63F]" />
                </span>
              </Link>
              <a href="#sobre" className="px-7 py-3.5 rounded-full font-bold bg-white hover:bg-slate-50 text-[#003A8C] border border-[#003A8C] text-center flex items-center justify-center gap-2 transition-all">
                Saiba Mais
                <Info className="h-5 w-5 text-[#003A8C] dark:text-white" strokeWidth={1.5} />
              </a>
            </div>

            {/* Mockup Floating Countdown Card */}
            <div className="mt-10 w-full max-w-[430px] bg-white rounded-[2rem] border-2 border-slate-100 shadow-xl overflow-hidden">
              <div className="p-6 flex flex-col items-center">
                <span className="text-[10px] font-black text-[#8DC63F] uppercase tracking-[0.2em] block mb-4 flex items-center gap-2 font-poppins">
                  <svg viewBox="0 0 100 100" fill="currentColor" className="h-3 w-3">
                    <path d="M50,45 C40,45 35,53 35,62 C35,72 42,78 50,78 C58,78 65,72 65,62 C65,53 60,45 50,45 Z" />
                    <circle cx="28" cy="38" r="9" />
                    <circle cx="43" cy="25" r="10" />
                    <circle cx="57" cy="25" r="10" />
                    <circle cx="72" cy="38" r="9" />
                  </svg>
                  Faltam para o evento
                  <svg viewBox="0 0 100 100" fill="currentColor" className="h-3 w-3">
                    <path d="M50,45 C40,45 35,53 35,62 C35,72 42,78 50,78 C58,78 65,72 65,62 C65,53 60,45 50,45 Z" />
                    <circle cx="28" cy="38" r="9" />
                    <circle cx="43" cy="25" r="10" />
                    <circle cx="57" cy="25" r="10" />
                    <circle cx="72" cy="38" r="9" />
                  </svg>
                </span>
                
                <div className="grid grid-cols-4 w-full text-center relative font-poppins">
                  {/* Days */}
                  <div className="flex flex-col items-center">
                    <span className="text-3xl sm:text-4xl font-black text-[#003A8C] leading-none">
                      {mounted ? timeLeft.days : '360'}
                    </span>
                    <span className="text-[9px] uppercase font-bold text-slate-400 mt-2">Dias</span>
                  </div>
                  
                  {/* Divider */}
                  <div className="absolute left-[25%] top-1/4 h-1/2 w-[1.5px] bg-slate-150" />
                  
                  {/* Hours */}
                  <div className="flex flex-col items-center">
                    <span className="text-3xl sm:text-4xl font-black text-[#003A8C] leading-none">
                      {mounted ? timeLeft.hours : '14'}
                    </span>
                    <span className="text-[9px] uppercase font-bold text-slate-400 mt-2">Horas</span>
                  </div>
                  
                  {/* Divider */}
                  <div className="absolute left-[50%] top-1/4 h-1/2 w-[1.5px] bg-slate-150" />

                  {/* Minutes */}
                  <div className="flex flex-col items-center">
                    <span className="text-3xl sm:text-4xl font-black text-[#003A8C] leading-none">
                      {mounted ? timeLeft.minutes : '27'}
                    </span>
                    <span className="text-[9px] uppercase font-bold text-slate-400 mt-2">Minutos</span>
                  </div>
                  
                  {/* Divider */}
                  <div className="absolute left-[75%] top-1/4 h-1/2 w-[1.5px] bg-slate-150" />

                  {/* Seconds (Green highlighted) */}
                  <div className="flex flex-col items-center">
                    <span className="text-3xl sm:text-4xl font-black text-[#8DC63F] leading-none">
                      {mounted ? timeLeft.seconds : '45'}
                    </span>
                    <span className="text-[9px] uppercase font-bold text-[#8DC63F] mt-2">Segundos</span>
                  </div>
                </div>
              </div>

              {/* Blue Card Footer */}
              <div className="bg-[#003A8C] px-4 py-3.5 text-white flex flex-col sm:flex-row justify-between items-center gap-2 text-[11px] font-bold font-poppins">
                <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4 text-[#8DC63F]" /> 27 de Setembro de 2026</span>
                <span className="flex items-center gap-1.5"><Clock className="h-4 w-4 text-[#8DC63F]" /> Abertura 05h30 | Largada 06h00</span>
                <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-[#8DC63F]" /> Museu Militar do Forte do Brum - Recife/PE</span>
              </div>
            </div>
          </div>

          {/* Mobile Hero Image */}
          <div className="lg:hidden relative h-[280px] w-full rounded-3xl overflow-hidden shadow-lg border border-slate-150 mt-4">
            <img
              src="/hero-dogs.png"
              alt="Cãominhada Petsalut Evento"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Mockup bottom Metrics Bar */}
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 z-20 relative">
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl py-6 px-8 sm:px-12 grid grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Metric 1: Inscritos */}
            <div className="flex items-center gap-4 justify-start">
              {/* Green Paw Print Icon */}
              <svg viewBox="0 0 100 100" fill="currentColor" className="h-8 w-8 text-[#8DC63F] shrink-0">
                <path d="M50,45 C40,45 35,53 35,62 C35,72 42,78 50,78 C58,78 65,72 65,62 C65,53 60,45 50,45 Z" />
                <circle cx="28" cy="38" r="9" />
                <circle cx="43" cy="25" r="10" />
                <circle cx="57" cy="25" r="10" />
                <circle cx="72" cy="38" r="9" />
              </svg>
              <div className="font-poppins text-left">
                <span className="text-2xl sm:text-3xl font-black text-[#003A8C] leading-none block">1.245</span>
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-450 block mt-1">Inscritos</span>
              </div>
            </div>

            {/* Metric 2: Pets */}
            <div className="flex items-center gap-4 justify-start">
              <Dog className="h-8 w-8 text-[#8DC63F] shrink-0" strokeWidth={1.5} />
              <div className="font-poppins text-left">
                <span className="text-2xl sm:text-3xl font-black text-[#003A8C] leading-none block">876</span>
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-450 block mt-1">Pets Participantes</span>
              </div>
            </div>

            {/* Metric 3: Patrocinadores */}
            <div className="flex items-center gap-4 justify-start">
              <Heart className="h-8 w-8 text-red-500 shrink-0" strokeWidth={1.5} />
              <div className="font-poppins text-left">
                <span className="text-2xl sm:text-3xl font-black text-[#003A8C] leading-none block">28</span>
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-450 block mt-1">Patrocinadores</span>
              </div>
            </div>

            {/* Metric 4: Percurso */}
            <div className="flex items-center gap-4 justify-start">
              <Route className="h-8 w-8 text-[#8DC63F] shrink-0" strokeWidth={1.5} />
              <div className="font-poppins text-left">
                <span className="text-2xl sm:text-3xl font-black text-[#003A8C] leading-none block">3 km</span>
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-450 block mt-1">Percurso Total</span>
              </div>
            </div>
          </div>
        </div>

      </section>

      {/* Seção Sobre */}
      <section id="sobre" className="py-24 px-4 bg-white transition-colors scroll-mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#003A8C] font-poppins">
              Sobre o Evento
            </h2>
            <p className="mt-4 text-slate-600 text-lg">
              A Cãominhada Petsalut é uma iniciativa de lazer e saúde dedicada a reunir pets e tutores em uma manhã cheia de diversão, exercícios ao ar livre e confraternização.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Info Column */}
            <div className="flex flex-col gap-6 text-slate-700 text-left">
              <h3 className="text-2xl font-bold text-[#003A8C] font-poppins">
                Criando memórias saudáveis com quem te dá amor incondicional
              </h3>
              <p className="leading-relaxed text-slate-600">
                Nosso evento foi projetado com toda a estrutura necessária para que você e seu companheiro canino curtam o trajeto sem preocupações. O percurso de 3km no Museu Militar do Forte do Brum é plano, arborizado e conta com suporte especializado ao longo de todo o caminho.
              </p>
              <p className="leading-relaxed text-slate-600">
                Além de caminhar, o evento é uma oportunidade fantástica para conscientização sobre a saúde animal, alimentação saudável e cuidados preventivos fornecidos pela equipe de veterinários Petsalut.
              </p>

              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex items-start gap-4">
                <MapPin className="h-6 w-6 text-[#8DC63F] shrink-0 mt-1" />
                <div className="text-left">
                  <h4 className="font-bold text-slate-950">Percurso de 3km no Museu Militar do Forte do Brum</h4>
                  <p className="text-sm text-slate-550 mt-1">
                    Largada e Chegada no Bolsão principal do Museu Militar do Forte do Brum. Pontos de hidratação e refresco a cada 500 metros para os cães.
                  </p>
                </div>
              </div>
            </div>

            {/* Grid of benefits */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {benefits.map((benefit, index) => (
                <div key={index} className="bg-slate-50 p-6 rounded-2xl border border-slate-100 hover-lift text-left">
                  <div className="p-3 bg-white rounded-xl w-fit shadow-sm">
                    {benefit.icon}
                  </div>
                  <h4 className="mt-4 font-bold text-slate-950 font-poppins">{benefit.title}</h4>
                  <p className="mt-2 text-sm text-slate-605 leading-relaxed">{benefit.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Seção Instituições Ajudadas */}
      <section id="instituicoes" className="py-24 px-4 bg-slate-50 transition-colors scroll-mt-20">
        <div className="max-w-7xl mx-auto text-center">
          <div className="max-w-3xl mx-auto mb-16">
            <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#8DC63F]/10 text-[#8DC63F] uppercase tracking-widest font-poppins">
              Solidariedade & Cuidado Animal
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#003A8C] font-poppins mt-3">
              Instituições Parceiras que Você Ajudará
            </h2>
            <p className="mt-4 text-slate-600 text-lg leading-relaxed">
              O propósito da Cãominhada Petsalut 2026 é apoiar o trabalho incansável de resgate e reabilitação de animais abandonados. 
              Ao se inscrever, a sua doação mínima de <strong>R$ 50,00</strong> vai diretamente para a conta da instituição de sua escolha.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {institutions
              .filter(inst => inst.status === 'Ativo')
              .sort((a, b) => {
                const order = ['Amor sem Fronteiras', 'Guerreiro', 'Alberto'];
                const indexA = order.findIndex(k => a.name.includes(k));
                const indexB = order.findIndex(k => b.name.includes(k));
                return (indexA === -1 ? 99 : indexA) - (indexB === -1 ? 99 : indexB);
              })
              .map((inst) => (
              <div 
                key={inst.id} 
                className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden hover-lift flex flex-col justify-between text-left group"
              >
                <div>
                  {/* Photo Banner with Logo Overlay */}
                  <div className="relative h-48 w-full overflow-hidden">
                    <img 
                      src={inst.photo || 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600&h=400&fit=crop&q=80'} 
                      alt={inst.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/20 to-transparent" />
                    
                    {/* Floating Logo Badge */}
                    <div className="absolute top-4 left-4 h-12 w-12 rounded-2xl bg-white flex items-center justify-center text-2xl shadow-md border border-slate-100">
                      {inst.logo}
                    </div>

                    {/* Location Badge */}
                    <div className="absolute bottom-4 left-4 flex items-center gap-1 text-xs font-semibold text-white">
                      <MapPin className="h-3.5 w-3.5 text-[#8DC63F]" strokeWidth={2} />
                      <span>{inst.city} - {inst.state}</span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6">
                    <h3 className="font-bold text-slate-900 text-xl font-poppins tracking-tight line-clamp-1">
                      {inst.name}
                    </h3>
                    
                    <p className="text-xs font-semibold text-slate-500 mt-2 h-16 overflow-hidden line-clamp-3 leading-relaxed">
                      {inst.description}
                    </p>

                    {/* Mission Text box */}
                    <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] font-bold text-[#003A8C] uppercase tracking-widest block mb-1">
                        Propósito & Missão
                      </span>
                      <p className="text-[11px] font-medium text-slate-650 italic line-clamp-3 leading-relaxed">
                        "{inst.mission}"
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <div className="p-6 pt-2">
                  <Link 
                    href="/register" 
                    className="w-full py-3 rounded-2xl bg-[#8DC63F] hover:bg-[#7cb335] text-white font-bold text-xs flex items-center justify-center gap-2 hover-lift transition-all shadow-sm shadow-lime-500/10"
                  >
                    Apoiar esta ONG 🐾
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Seção Cronograma */}
      <section id="cronograma" className="py-24 px-4 bg-slate-50 transition-colors scroll-mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#003A8C] font-poppins">
              Cronograma do Evento
            </h2>
            <p className="mt-4 text-slate-600 text-lg">
              Programação completa do grande dia <strong>27 de Setembro de 2026</strong>.
            </p>
          </div>

          {/* Card de Pontos de Apoio / Retirada dos Kits */}
          <div className="max-w-4xl mx-auto mb-12 bg-white p-6 sm:p-8 rounded-3xl border-2 border-[#8DC63F]/40 shadow-lg shadow-[#8DC63F]/10 flex flex-col md:flex-row items-center justify-between gap-6 text-left">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-[#8DC63F]/15 rounded-2xl text-[#003A8C] shrink-0 mt-1">
                <Award className="h-8 w-8 text-[#8DC63F]" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#8DC63F]">Retirada Antecipada dos Kits</span>
                <h3 className="text-xl font-extrabold text-[#003A8C] font-poppins mt-0.5">Pontos de Apoio Oficial</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Retire seu kit nos dias <strong>19 de Setembro</strong> e <strong>26 de Setembro</strong> em um dos nossos pontos parceiros:
                </p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0 font-poppins">
              <div className="px-4 py-3 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center gap-3">
                <MapPin className="h-5 w-5 text-[#8DC63F]" />
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Zona Sul</span>
                  <span className="text-xs font-bold text-[#003A8C]">Pet Happy</span>
                </div>
              </div>

              <div className="px-4 py-3 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center gap-3">
                <MapPin className="h-5 w-5 text-[#8DC63F]" />
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Zona Norte</span>
                  <span className="text-xs font-bold text-[#003A8C]">Oh Pet Graças</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 max-w-5xl mx-auto">
            {scheduleItems.map((item, index) => (
              <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/50 flex flex-col relative hover-lift text-left">
                <div className="inline-flex items-center justify-center p-2 rounded-xl bg-blue-50 text-[#003A8C] font-bold font-poppins w-fit text-sm mb-4">
                  <Clock className="h-4 w-4 mr-1.5" /> {item.time}
                </div>
                <h4 className="font-bold text-slate-950 font-poppins text-lg">{item.title}</h4>
                <p className="mt-2 text-sm text-slate-500 leading-relaxed flex-1">{item.desc}</p>
                {index < 4 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 -translate-y-1/2 z-10 text-slate-305">
                    <ChevronRight className="h-6 w-6" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Seção Percurso */}
      <section id="percurso" className="py-24 px-4 bg-white transition-colors scroll-mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Map styling */}
            <div className="bg-slate-100 p-8 rounded-3xl border border-slate-200 shadow-inner relative overflow-hidden h-[350px] flex items-center justify-center">
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#003a8c_1px,transparent_1px)] [background-size:16px_16px]" />
              
              <div className="relative z-10 w-full h-full flex flex-col justify-between">
                <span className="px-3 py-1.5 rounded-xl bg-[#003A8C] text-white text-xs font-bold w-fit">Mapa Ilustrativo do Percurso</span>
                
                {/* Visual Image representing the 3km walk map */}
                <div className="w-full max-w-sm mx-auto my-auto h-36 relative flex items-center justify-center overflow-hidden rounded-2xl">
                  <img
                    src="/mapa.png"
                    alt="Mapa do Percurso"
                    className="max-w-full max-h-full object-contain rounded-xl"
                  />
                </div>

                <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-200/50">
                  <span className="text-xs font-bold text-slate-550 flex items-center gap-1.5"><MapPin className="h-4 w-4 text-[#8DC63F]" /> Extensão: 3.0 km</span>
                  <span className="text-xs font-bold text-slate-550 flex items-center gap-1.5"><Heart className="h-4 w-4 text-red-500" /> Pontos de Hidratação: 3</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-6 text-left">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#003A8C] font-poppins">
                Estrutura e Segurança no Percurso
              </h2>
              <p className="text-slate-600 leading-relaxed">
                Nossa caminhada foi pensada priorizando a saúde dos cães. O percurso possui pisos confortáveis e áreas de grama para evitar queimar as patinhas. Além disso, as seguintes medidas de segurança serão tomadas:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex gap-3 items-start">
                  <div className="h-2 w-2 rounded-full bg-[#8DC63F] shrink-0 mt-2.5" />
                  <p className="text-sm text-slate-600"><strong>Ponto veterinário móvel</strong>: ambulância veterinária de plantão para qualquer intercorrência.</p>
                </div>
                <div className="flex gap-3 items-start">
                  <div className="h-2 w-2 rounded-full bg-[#8DC63F] shrink-0 mt-2.5" />
                  <p className="text-sm text-slate-600"><strong>Água fresca constante</strong>: recipientes descartáveis com água fresca e gelada nos postos de parada.</p>
                </div>
                <div className="flex gap-3 items-start">
                  <div className="h-2 w-2 rounded-full bg-[#8DC63F] shrink-0 mt-2.5" />
                  <p className="text-sm text-slate-600"><strong>Fiscais de percurso</strong>: monitores ao longo do trajeto garantindo que todos façam a caminhada com segurança.</p>
                </div>
                <div className="flex gap-3 items-start">
                  <div className="h-2 w-2 rounded-full bg-[#8DC63F] shrink-0 mt-2.5" />
                  <p className="text-sm text-slate-600"><strong>Descarte ecológico</strong>: fornecimento de saquinhos biodegradáveis para coleta de fezes ao longo do caminho.</p>
                </div>
              </div>

              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
                <ShieldAlert className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800 leading-relaxed">
                  <strong>Atenção</strong>: Todos os pets participantes devem, obrigatoriamente, utilizar guia e coleira durante todo o percurso. Cães de grande porte ou raças com obrigatoriedade de focinheira por lei estadual devem usar o equipamento.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Seção Patrocinadores */}
      <section id="patrocinadores" className="py-24 px-4 bg-slate-50 transition-colors scroll-mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="px-4 py-1.5 rounded-full bg-[#8DC63F]/15 text-[#003A8C] font-bold text-xs uppercase tracking-widest inline-block mb-3">
              Apoio & Parceria
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#003A8C] font-poppins">
              Patrocinadores Premium
            </h2>
            <p className="mt-4 text-slate-600 text-base sm:text-lg">
              Marcas incríveis que apoiam o bem-estar animal e viabilizam a Cãominhada.
            </p>
          </div>

          {/* Premium Sponsors Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 max-w-7xl mx-auto">
            {(sponsors && sponsors.length > 0 && !sponsors.some(s => s.name.includes('Royal Canin') || s.name.includes('Petsalut Plano')) ? sponsors : [
              { id: 'sp-1', name: 'Oh Pet Club', logo: '/sponsors/ohpet.png', category: 'Premium', description: 'Clínica veterinária e petshop especializado. Ponto de apoio Zona Norte.', website: 'https://ohpet.com.br' },
              { id: 'sp-2', name: 'Amigo Bicho', logo: '/sponsors/amigobicho.png', category: 'Premium', description: 'Cuidado, amor e produtos de alta qualidade para o seu pet.', website: 'https://amigobicho.com.br' },
              { id: 'sp-3', name: 'Metrópole', logo: '/sponsors/metropole.png', category: 'Premium', description: 'Excelência em serviços e grande parceiro da Cãominhada.', website: 'https://metropole.com.br' },
              { id: 'sp-4', name: 'Pet Happy', logo: '/sponsors/pethappy.png', category: 'Premium', description: 'Centro de estética e cuidados pet. Ponto de apoio Zona Sul.', website: 'https://pethappy.com.br' },
              { id: 'sp-5', name: 'Eu Pet', logo: '/sponsors/eupet.png', category: 'Premium', description: 'Plano de Saúde Pet completo para a saúde do seu melhor amigo.', website: 'https://eupet.com.br' }
            ]).map((s) => (
              <a
                key={s.id}
                href={s.website}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col items-center justify-between bg-white p-8 rounded-3xl border-2 border-slate-100 shadow-lg shadow-slate-200/50 hover:border-[#8DC63F] hover:shadow-[0_12px_35px_rgba(141,198,63,0.25)] hover:-translate-y-1.5 transition-all duration-300 relative overflow-hidden"
              >
                {/* Top Premium Tag */}
                <div className="w-full flex justify-between items-center mb-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#8DC63F] bg-[#8DC63F]/10 px-2.5 py-1 rounded-lg">
                    {s.category || 'Premium'}
                  </span>
                  <span className="h-2 w-2 rounded-full bg-[#8DC63F] shadow-[0_0_8px_#8DC63F]" />
                </div>

                {/* Larger Transparent Logo Container */}
                <div className="relative w-full h-36 my-4 flex items-center justify-center p-2">
                  <img
                    src={s.logo}
                    alt={s.name}
                    className="max-w-full max-h-full object-contain transition-transform duration-300 group-hover:scale-110 drop-shadow-sm"
                  />
                </div>

                {/* Name & Description */}
                <div className="text-center mt-2 w-full">
                  <span className="font-extrabold text-slate-900 text-lg group-hover:text-[#003A8C] transition-colors block font-poppins">
                    {s.name}
                  </span>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed line-clamp-2">
                    {s.description}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Seção Informações (FAQ) */}
      <section id="informacoes" className="py-24 px-4 bg-white transition-colors scroll-mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#003A8C] font-poppins">
              Informações Importantes
            </h2>
            <p className="mt-4 text-slate-605 text-sm">
              Prepare-se para o evento consultando as principais diretrizes de segurança e convivência.
            </p>
          </div>

          <div className="max-w-3xl mx-auto flex flex-col gap-6 text-left">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <h4 className="font-bold text-slate-900 font-poppins text-sm flex items-center gap-2">🐾 Onde e quando retirar o kit?</h4>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                A retirada dos kits (camiseta, bandana do pet e sacochila) será realizada nos dias <strong>19 de Setembro</strong> e <strong>26 de Setembro</strong> em nossos 2 Pontos de Apoio Oficiais:<br />
                • <strong>Zona Sul</strong>: Pet Happy<br />
                • <strong>Zona Norte</strong>: Oh Pet Graças<br />
                Apresente seu QR Code ou comprovante de participante no momento da retirada.
              </p>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <h4 className="font-bold text-slate-900 font-poppins text-sm flex items-center gap-2">🩺 Como funciona a segurança veterinária?</h4>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Teremos veterinários Petsalut espalhados pelo circuito de 3km e uma ambulância de UTI veterinária posicionada na largada/chegada para dar o suporte necessário ao seu cãozinho se ele cansar ou precisar de cuidados médicos.
              </p>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <h4 className="font-bold text-slate-900 font-poppins text-sm flex items-center gap-2">🐶 Cães de todas as raças e portes podem participar?</h4>
              <p className="text-xs text-slate-650 mt-2 leading-relaxed">
                Sim! Cães de todos os portes e idades são bem-vindos. Exigimos apenas o uso constante de coleira e guia. Para cães de raças consideradas de guarda (como Pitbull, Rottweiler, Mastim, etc.), é obrigatório o uso de focinheira por lei.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 dark:bg-slate-950 text-slate-400 py-16 px-4 border-t border-slate-800">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 mb-12">
          <div className="md:col-span-5 flex flex-col gap-4 text-left">
            <Logo showText={true} variant="dark" className="text-white" />
            <p className="text-sm text-slate-500 max-w-sm mt-2 leading-relaxed">
              Incentivando a saúde preventiva e o bem-estar animal através da convivência harmoniosa e da prática de atividades saudáveis em família.
            </p>
          </div>

          <div className="md:col-span-3 text-left">
            <h4 className="font-bold text-white text-sm uppercase tracking-wider mb-4 font-poppins">Navegação</h4>
            <div className="flex flex-col gap-3 text-sm">
              <a href="#inicio" className="hover:text-white transition-colors">Início</a>
              <a href="#sobre" className="hover:text-white transition-colors">Sobre o Evento</a>
              <a href="#instituicoes" className="hover:text-white transition-colors">Instituições Ajudadas</a>
              <a href="#percurso" className="hover:text-white transition-colors">Percurso</a>
              <a href="#patrocinadores" className="hover:text-white transition-colors">Patrocinadores</a>
            </div>
          </div>

          <div className="md:col-span-4 text-left">
            <h4 className="font-bold text-white text-sm uppercase tracking-wider mb-4 font-poppins">Suporte e Documentos</h4>
            <div className="flex flex-col gap-3 text-sm">
              <Link href="/regulamento" className="hover:text-white transition-colors">Regulamento Oficial</Link>
              <Link href="/privacidade" className="hover:text-white transition-colors">Política de Privacidade</Link>
              <span className="block text-xs mt-2 text-slate-500">Dúvidas? Entre em contato pelo e-mail: <br /><strong>eventos@petsalut.com.br</strong></span>
            </div>
          </div>
        </div>

        <hr className="border-slate-800 my-8" />

        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-550">
          <p>Copyright © 2026 Petsalut. Todos os direitos reservados. CNPJ: 12.345.678/0001-90</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-slate-400 transition-colors">Instagram</a>
            <a href="#" className="hover:text-slate-400 transition-colors">Facebook</a>
            <a href="#" className="hover:text-slate-400 transition-colors">YouTube</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
