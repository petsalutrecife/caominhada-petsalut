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
  const [timeLeft, setTimeLeft] = useState({ days: 360, hours: 14, minutes: 27, seconds: 45 });

  // Event Date: Sept 20, 2026 07:00:00
  const eventDate = new Date('2026-09-20T07:00:00').getTime();

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

    return () => clearInterval(timer);
  }, [eventDate]);

  const scheduleItems = [
    { time: '07:00', title: 'Abertura & Retirada de Kits', desc: 'Credenciamento de última hora e entrega dos kits especiais para tutores e pets.' },
    { time: '07:30', title: 'Aquecimento & Alongamento', desc: 'Sessão divertida de alongamento com adestradores profissionais e dicas para a caminhada.' },
    { time: '08:00', title: 'Largada da Cãominhada', desc: 'Início do percurso de 3km com pontos de hidratação exclusivos para cães e tutores.' },
    { time: '09:30', title: 'Chegada & Entrega de Medalhas', desc: 'Recepção festiva com entrega de medalhas de participação exclusivas para todos os pets.' },
    { time: '10:00', title: 'Desfile, Brindes & Encerramento', desc: 'Desfile de fantasias e talentos pet, sorteios especiais dos patrocinadores e fotos oficiais.' },
  ];

  const benefits = [
    { icon: <Heart className="h-6 w-6 text-red-500" />, title: 'Saúde & Exercício', desc: 'Uma caminhada de 3km com ritmo leve, ideal para exercitar e divertir cães de todas as idades.' },
    { icon: <Award className="h-6 w-6 text-[#8DC63F]" />, title: 'Kit Exclusivo', desc: 'Cada inscrição inclui camiseta Petsalut para o tutor, bandana para o pet, sacochila e medalha.' },
    { icon: <Users className="h-6 w-6 text-blue-500" />, title: 'Socialização Pet', desc: 'Oportunidade perfeita para o seu cão interagir com outros pets em um ambiente amigável e seguro.' },
    { icon: <Trophy className="h-6 w-6 text-amber-500" />, title: 'Brindes & Sorteios', desc: 'Desfiles interativos com premiações e sorteio de kits completos oferecidos por nossos patrocinadores.' },
  ];

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 transition-colors">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-100 dark:border-slate-805 bg-white/95 dark:bg-slate-950/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/">
            <Logo />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8 font-poppins">
            <a href="#inicio" className="text-sm font-bold text-[#003A8C] dark:text-lime-400 transition-colors relative after:content-[''] after:absolute after:bottom-[-29px] after:left-0 after:w-full after:h-[3px] after:bg-[#8DC63F]">Início</a>
            <a href="#sobre" className="text-sm font-medium text-slate-650 dark:text-slate-350 hover:text-[#003A8C] dark:hover:text-lime-400 transition-colors">Sobre o Evento</a>
            <a href="#instituicoes" className="text-sm font-medium text-slate-650 dark:text-slate-350 hover:text-[#003A8C] dark:hover:text-lime-400 transition-colors">Instituições Ajudadas</a>
            <a href="#percurso" className="text-sm font-medium text-slate-650 dark:text-slate-355 hover:text-[#003A8C] dark:hover:text-lime-400 transition-colors">Percurso</a>
            <a href="#patrocinadores" className="text-sm font-medium text-slate-655 dark:text-slate-355 hover:text-[#003A8C] dark:hover:text-lime-400 transition-colors">Patrocinadores</a>
            <a href="#informacoes" className="text-sm font-medium text-slate-655 dark:text-slate-355 hover:text-[#003A8C] dark:hover:text-lime-400 transition-colors">Informações</a>
          </nav>

          <div className="hidden lg:flex items-center gap-4">
            <ThemeToggle />
            <Link href="/login" className="px-6 py-2 rounded-xl text-sm font-bold text-[#003A8C] dark:text-slate-200 border border-[#003A8C] dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              Login
            </Link>
            <Link href="/register" className="px-6 py-2.5 rounded-xl text-sm font-bold bg-[#8DC63F] hover:bg-lime-600 text-white dark:text-slate-950 flex items-center gap-2 hover-lift shadow-sm shadow-lime-500/10">
              Inscreva-se Agora 🐾
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center gap-3 lg:hidden">
            <ThemeToggle />
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
              aria-label="Abrir menu"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {menuOpen && (
          <div className="lg:hidden px-4 pt-2 pb-6 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 animate-in fade-in slide-in-from-top-5 duration-200">
            <div className="flex flex-col gap-4">
              <a href="#inicio" onClick={() => setMenuOpen(false)} className="px-4 py-2 rounded-xl text-base font-bold hover:bg-slate-55">Início</a>
              <a href="#sobre" onClick={() => setMenuOpen(false)} className="px-4 py-2 rounded-xl text-base font-semibold hover:bg-slate-55">Sobre o Evento</a>
              <a href="#instituicoes" onClick={() => setMenuOpen(false)} className="px-4 py-2 rounded-xl text-base font-semibold hover:bg-slate-55">Instituições Ajudadas</a>
              <a href="#percurso" onClick={() => setMenuOpen(false)} className="px-4 py-2 rounded-xl text-base font-semibold hover:bg-slate-55">Percurso</a>
              <a href="#patrocinadores" onClick={() => setMenuOpen(false)} className="px-4 py-2 rounded-xl text-base font-semibold hover:bg-slate-55">Patrocinadores</a>
              <a href="#informacoes" onClick={() => setMenuOpen(false)} className="px-4 py-2 rounded-xl text-base font-semibold hover:bg-slate-55">Informações</a>
              <hr className="border-slate-100 dark:border-slate-800" />
              <Link href="/login" onClick={() => setMenuOpen(false)} className="w-full text-center py-3 rounded-2xl text-base font-semibold border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                Login
              </Link>
              <Link href="/register" onClick={() => setMenuOpen(false)} className="w-full text-center py-3 rounded-2xl text-base font-bold bg-[#8DC63F] text-white dark:text-slate-950">
                Inscreva-se Agora 🐾
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section id="inicio" className="relative flex flex-col justify-between overflow-hidden bg-white dark:bg-slate-950">
        
        {/* Full-bleed mockup Image on Desktop - aligns perfectly on right, fades to white on left */}
        <div className="absolute right-0 top-0 bottom-0 w-1/2 hidden lg:block select-none z-0">
          <div className="relative w-full h-full">
            <img
              src="/hero-dogs.png"
              alt="Cãominhada Petsalut Evento"
              className="w-full h-full object-cover object-right"
            />
            {/* Gradient mask to blend nicely on large screens */}
            <div className="absolute inset-0 bg-gradient-to-r from-white via-white/5 to-transparent dark:from-slate-950" />
          </div>
        </div>

        {/* Content Wrapper */}
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-12 lg:pt-16 pb-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          
          {/* Left Column: Title Image, Subtitle, Buttons, Countdown Card */}
          <div className="lg:col-span-6 flex flex-col items-start text-left z-20">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[10px] font-extrabold border border-[#8DC63F] text-[#8DC63F] bg-white dark:bg-slate-900 mb-6 uppercase tracking-wider font-poppins shadow-sm">
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
                src="/logocorrida.jpeg"
                alt="Cãominhada Petsalut 2026"
                className="w-full h-auto object-contain"
              />
            </div>

            <p className="mt-2 text-base sm:text-lg text-slate-650 dark:text-slate-350 max-w-xl font-medium leading-relaxed font-inter">
              Caminhando pela saúde, diversão e bem-estar dos nossos melhores amigos.
            </p>

            {/* Mockup Action Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4 w-full sm:w-auto font-poppins">
              <Link href="/register" className="px-7 py-3.5 rounded-full font-bold bg-[#8DC63F] hover:bg-[#7cb335] text-white dark:text-slate-950 text-center flex items-center justify-center gap-3 shadow-lg shadow-lime-500/10 hover-lift">
                Inscreva-se Agora
                <span className="h-5 w-5 rounded-full bg-white flex items-center justify-center">
                  <ArrowRight className="h-3.5 w-3.5 text-[#8DC63F]" />
                </span>
              </Link>
              <a href="#sobre" className="px-7 py-3.5 rounded-full font-bold bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-[#003A8C] dark:text-white border border-[#003A8C] dark:border-slate-600 text-center flex items-center justify-center gap-2 transition-all">
                Saiba Mais
                <Info className="h-5 w-5 text-[#003A8C] dark:text-white" strokeWidth={1.5} />
              </a>
            </div>

            {/* Mockup Floating Countdown Card */}
            <div className="mt-10 w-full max-w-[430px] bg-white dark:bg-slate-900 rounded-[2rem] border-2 border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden">
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
                    <span className="text-3xl sm:text-4xl font-black text-[#003A8C] dark:text-blue-400 leading-none">
                      {mounted ? timeLeft.days : '360'}
                    </span>
                    <span className="text-[9px] uppercase font-bold text-slate-400 mt-2">Dias</span>
                  </div>
                  
                  {/* Divider */}
                  <div className="absolute left-[25%] top-1/4 h-1/2 w-[1.5px] bg-slate-150 dark:bg-slate-800" />
                  
                  {/* Hours */}
                  <div className="flex flex-col items-center">
                    <span className="text-3xl sm:text-4xl font-black text-[#003A8C] dark:text-blue-400 leading-none">
                      {mounted ? timeLeft.hours : '14'}
                    </span>
                    <span className="text-[9px] uppercase font-bold text-slate-400 mt-2">Horas</span>
                  </div>
                  
                  {/* Divider */}
                  <div className="absolute left-[50%] top-1/4 h-1/2 w-[1.5px] bg-slate-150 dark:bg-slate-800" />

                  {/* Minutes */}
                  <div className="flex flex-col items-center">
                    <span className="text-3xl sm:text-4xl font-black text-[#003A8C] dark:text-blue-400 leading-none">
                      {mounted ? timeLeft.minutes : '27'}
                    </span>
                    <span className="text-[9px] uppercase font-bold text-slate-400 mt-2">Minutos</span>
                  </div>
                  
                  {/* Divider */}
                  <div className="absolute left-[75%] top-1/4 h-1/2 w-[1.5px] bg-slate-150 dark:bg-slate-800" />

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
              <div className="bg-[#003A8C] dark:bg-slate-950 px-4 py-3.5 text-white flex flex-col sm:flex-row justify-between items-center gap-2 text-[11px] font-bold font-poppins">
                <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4 text-[#8DC63F]" /> 20 de Setembro de 2026</span>
                <span className="flex items-center gap-1.5"><Clock className="h-4 w-4 text-[#8DC63F]" /> Largada 07h00</span>
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
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-xl py-6 px-8 sm:px-12 grid grid-cols-2 lg:grid-cols-4 gap-8">
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
                <span className="text-2xl sm:text-3xl font-black text-[#003A8C] dark:text-white leading-none block">1.245</span>
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-450 dark:text-slate-400 block mt-1">Inscritos</span>
              </div>
            </div>

            {/* Metric 2: Pets */}
            <div className="flex items-center gap-4 justify-start">
              <Dog className="h-8 w-8 text-[#8DC63F] shrink-0" strokeWidth={1.5} />
              <div className="font-poppins text-left">
                <span className="text-2xl sm:text-3xl font-black text-[#003A8C] dark:text-white leading-none block">876</span>
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-450 dark:text-slate-400 block mt-1">Pets Participantes</span>
              </div>
            </div>

            {/* Metric 3: Patrocinadores */}
            <div className="flex items-center gap-4 justify-start">
              <Heart className="h-8 w-8 text-red-500 shrink-0" strokeWidth={1.5} />
              <div className="font-poppins text-left">
                <span className="text-2xl sm:text-3xl font-black text-[#003A8C] dark:text-white leading-none block">28</span>
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-450 dark:text-slate-400 block mt-1">Patrocinadores</span>
              </div>
            </div>

            {/* Metric 4: Percurso */}
            <div className="flex items-center gap-4 justify-start">
              <Route className="h-8 w-8 text-[#8DC63F] shrink-0" strokeWidth={1.5} />
              <div className="font-poppins text-left">
                <span className="text-2xl sm:text-3xl font-black text-[#003A8C] dark:text-white leading-none block">3 km</span>
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-450 dark:text-slate-400 block mt-1">Percurso Total</span>
              </div>
            </div>
          </div>
        </div>

      </section>

      {/* Seção Sobre */}
      <section id="sobre" className="py-24 px-4 bg-white dark:bg-slate-950 transition-colors scroll-mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#003A8C] dark:text-white font-poppins">
              Sobre o Evento
            </h2>
            <p className="mt-4 text-slate-600 dark:text-slate-400 text-lg">
              A Cãominhada Petsalut é uma iniciativa de lazer e saúde dedicada a reunir pets e tutores em uma manhã cheia de diversão, exercícios ao ar livre e confraternização.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Info Column */}
            <div className="flex flex-col gap-6 text-slate-700 dark:text-slate-350 text-left">
              <h3 className="text-2xl font-bold text-[#003A8C] dark:text-blue-400 font-poppins">
                Criando memórias saudáveis com quem te dá amor incondicional
              </h3>
              <p className="leading-relaxed text-slate-600 dark:text-slate-400">
                Nosso evento foi projetado com toda a estrutura necessária para que você e seu companheiro canino curtam o trajeto sem preocupações. O percurso de 3km no Museu Militar do Forte do Brum é plano, arborizado e conta com suporte especializado ao longo de todo o caminho.
              </p>
              <p className="leading-relaxed text-slate-600 dark:text-slate-400">
                Além de caminhar, o evento é uma oportunidade fantástica para conscientização sobre a saúde animal, alimentação saudável e cuidados preventivos fornecidos pela equipe de veterinários Petsalut.
              </p>

              <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-start gap-4">
                <MapPin className="h-6 w-6 text-[#8DC63F] shrink-0 mt-1" />
                <div className="text-left">
                  <h4 className="font-bold text-slate-950 dark:text-white">Percurso de 3km no Museu Militar do Forte do Brum</h4>
                  <p className="text-sm text-slate-550 mt-1">
                    Largada e Chegada no Bolsão principal do Museu Militar do Forte do Brum. Pontos de hidratação e refresco a cada 500 metros para os cães.
                  </p>
                </div>
              </div>
            </div>

            {/* Grid of benefits */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {benefits.map((benefit, index) => (
                <div key={index} className="bg-slate-50 dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 hover-lift text-left">
                  <div className="p-3 bg-white dark:bg-slate-800 rounded-xl w-fit shadow-sm">
                    {benefit.icon}
                  </div>
                  <h4 className="mt-4 font-bold text-slate-950 dark:text-white font-poppins">{benefit.title}</h4>
                  <p className="mt-2 text-sm text-slate-605 dark:text-slate-400 leading-relaxed">{benefit.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Seção Instituições Ajudadas */}
      <section id="instituicoes" className="py-24 px-4 bg-slate-50 dark:bg-slate-900/40 transition-colors scroll-mt-20">
        <div className="max-w-7xl mx-auto text-center">
          <div className="max-w-3xl mx-auto mb-16">
            <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#8DC63F]/10 dark:bg-lime-400/10 text-[#8DC63F] dark:text-lime-400 uppercase tracking-widest font-poppins">
              Solidariedade & Cuidado Animal
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#003A8C] dark:text-white font-poppins mt-3">
              Instituições Parceiras que Você Ajudará
            </h2>
            <p className="mt-4 text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
              O propósito da Cãominhada Petsalut 2026 é apoiar o trabalho incansável de resgate e reabilitação de animais abandonados. 
              Ao se inscrever, a sua doação mínima de <strong>R$ 50,00</strong> vai diretamente para a conta da instituição de sua escolha.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {institutions.filter(inst => inst.status === 'Ativo').map((inst) => (
              <div 
                key={inst.id} 
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden hover-lift flex flex-col justify-between text-left group"
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
                    <div className="absolute top-4 left-4 h-12 w-12 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center text-2xl shadow-md border border-slate-100 dark:border-slate-700">
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
                    <h3 className="font-bold text-slate-900 dark:text-white text-xl font-poppins tracking-tight line-clamp-1">
                      {inst.name}
                    </h3>
                    
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-2 h-16 overflow-hidden line-clamp-3 leading-relaxed">
                      {inst.description}
                    </p>

                    {/* Mission Text box */}
                    <div className="mt-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80">
                      <span className="text-[10px] font-bold text-[#003A8C] dark:text-blue-400 uppercase tracking-widest block mb-1">
                        Propósito & Missão
                      </span>
                      <p className="text-[11px] font-medium text-slate-650 dark:text-slate-300 italic line-clamp-3 leading-relaxed">
                        "{inst.mission}"
                      </p>
                    </div>
                  </div>
                </div>

                {/* Counters and Action Button */}
                <div className="p-6 pt-0">
                  <div className="grid grid-cols-3 gap-2 border-t border-slate-150 dark:border-slate-800 pt-4 mb-4 text-center">
                    <div>
                      <span className="text-sm font-black text-[#003A8C] dark:text-blue-400 block">{inst.animalsServed}</span>
                      <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase">Atendidos</span>
                    </div>
                    <div className="border-x border-slate-150 dark:border-slate-800">
                      <span className="text-sm font-black text-[#8DC63F] block">{inst.castrations}</span>
                      <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase">Castrados</span>
                    </div>
                    <div>
                      <span className="text-sm font-black text-amber-500 block">{inst.rescues}</span>
                      <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase">Resgates</span>
                    </div>
                  </div>

                  <Link 
                    href="/register" 
                    className="w-full py-3 rounded-2xl bg-[#8DC63F] hover:bg-[#7cb335] text-white dark:text-slate-950 font-bold text-xs flex items-center justify-center gap-2 hover-lift transition-all shadow-sm shadow-lime-500/10"
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
      <section id="cronograma" className="py-24 px-4 bg-slate-50 dark:bg-slate-900/60 transition-colors scroll-mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#003A8C] dark:text-white font-poppins">
              Cronograma do Evento
            </h2>
            <p className="mt-4 text-slate-600 dark:text-slate-400 text-lg">
              Programação completa de atividades planejadas para manter você e seu pet ativos e entretidos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 max-w-5xl mx-auto">
            {scheduleItems.map((item, index) => (
              <div key={index} className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200/50 dark:border-slate-800/50 flex flex-col relative hover-lift text-left">
                <div className="inline-flex items-center justify-center p-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-[#003A8C] dark:text-blue-400 font-bold font-poppins w-fit text-sm mb-4">
                  <Clock className="h-4 w-4 mr-1.5" /> {item.time}
                </div>
                <h4 className="font-bold text-slate-950 dark:text-white font-poppins text-lg">{item.title}</h4>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 leading-relaxed flex-1">{item.desc}</p>
                {index < 4 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 -translate-y-1/2 z-10 text-slate-305 dark:text-slate-700">
                    <ChevronRight className="h-6 w-6" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Seção Percurso */}
      <section id="percurso" className="py-24 px-4 bg-white dark:bg-slate-950 transition-colors scroll-mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Map styling */}
            <div className="bg-slate-100 dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-inner relative overflow-hidden h-[350px] flex items-center justify-center">
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

                <div className="flex justify-between items-center bg-white dark:bg-slate-950 p-4 rounded-2xl shadow-sm border border-slate-200/50 dark:border-slate-800/50">
                  <span className="text-xs font-bold text-slate-550 flex items-center gap-1.5"><MapPin className="h-4 w-4 text-[#8DC63F]" /> Extensão: 3.0 km</span>
                  <span className="text-xs font-bold text-slate-550 flex items-center gap-1.5"><Heart className="h-4 w-4 text-red-500" /> Pontos de Hidratação: 3</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-6 text-left">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#003A8C] dark:text-white font-poppins">
                Estrutura e Segurança no Percurso
              </h2>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Nossa caminhada foi pensada priorizando a saúde dos cães. O percurso possui pisos confortáveis e áreas de grama para evitar queimar as patinhas. Além disso, as seguintes medidas de segurança serão tomadas:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex gap-3 items-start">
                  <div className="h-2 w-2 rounded-full bg-[#8DC63F] shrink-0 mt-2.5" />
                  <p className="text-sm text-slate-600 dark:text-slate-400"><strong>Ponto veterinário móvel</strong>: ambulância veterinária de plantão para qualquer intercorrência.</p>
                </div>
                <div className="flex gap-3 items-start">
                  <div className="h-2 w-2 rounded-full bg-[#8DC63F] shrink-0 mt-2.5" />
                  <p className="text-sm text-slate-600 dark:text-slate-400"><strong>Água fresca constante</strong>: recipientes descartáveis com água fresca e gelada nos postos de parada.</p>
                </div>
                <div className="flex gap-3 items-start">
                  <div className="h-2 w-2 rounded-full bg-[#8DC63F] shrink-0 mt-2.5" />
                  <p className="text-sm text-slate-600 dark:text-slate-400"><strong>Fiscais de percurso</strong>: monitores ao longo do trajeto garantindo que todos façam a caminhada com segurança.</p>
                </div>
                <div className="flex gap-3 items-start">
                  <div className="h-2 w-2 rounded-full bg-[#8DC63F] shrink-0 mt-2.5" />
                  <p className="text-sm text-slate-600 dark:text-slate-400"><strong>Descarte ecológico</strong>: fornecimento de saquinhos biodegradáveis para coleta de fezes ao longo do caminho.</p>
                </div>
              </div>

              <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-2xl flex items-start gap-3">
                <ShieldAlert className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                  <strong>Atenção</strong>: Todos os pets participantes devem, obrigatoriamente, utilizar guia e coleira durante todo o percurso. Cães de grande porte ou raças com obrigatoriedade de focinheira por lei estadual devem usar o equipamento.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Seção Patrocinadores */}
      <section id="patrocinadores" className="py-24 px-4 bg-slate-50 dark:bg-slate-900/60 transition-colors scroll-mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#003A8C] dark:text-white font-poppins">
              Nossos Patrocinadores
            </h2>
            <p className="mt-4 text-slate-650 dark:text-slate-400 text-lg">
              Marcas incríveis que apoiam o bem-estar animal e tornam a Cãominhada possível.
            </p>
          </div>

          {/* Master Category */}
          {sponsors.filter(s => s.category === 'Master').length > 0 && (
            <div className="mb-16">
              <h3 className="text-center text-xs uppercase tracking-[0.2em] font-extrabold text-slate-400 mb-6">Patrocinador Master</h3>
              <div className="flex justify-center">
                {sponsors.filter(s => s.category === 'Master').map((s) => (
                  <a
                    key={s.id}
                    href={s.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex flex-col items-center bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md max-w-sm w-full hover-lift transition-all"
                  >
                    <div className="relative w-48 h-24 mb-4">
                      <Image src={s.logo} alt={s.name} fill className="object-contain filter grayscale group-hover:grayscale-0 transition-all" />
                    </div>
                    <span className="font-bold text-slate-900 dark:text-white text-lg group-hover:text-[#003A8C] dark:group-hover:text-lime-400">{s.name}</span>
                    <p className="text-xs text-slate-550 dark:text-slate-400 text-center mt-2 px-4">{s.description}</p>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Gold Category */}
          {sponsors.filter(s => s.category === 'Ouro').length > 0 && (
            <div className="mb-16">
              <h3 className="text-center text-xs uppercase tracking-[0.2em] font-extrabold text-slate-400 mb-6">Patrocínio Ouro</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-3xl mx-auto">
                {sponsors.filter(s => s.category === 'Ouro').map((s) => (
                  <a
                    key={s.id}
                    href={s.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex flex-col items-center bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover-lift transition-all"
                  >
                    <div className="relative w-36 h-20 mb-4">
                      <Image src={s.logo} alt={s.name} fill className="object-contain filter grayscale group-hover:grayscale-0 transition-all" />
                    </div>
                    <span className="font-bold text-slate-900 dark:text-white group-hover:text-[#003A8C] dark:group-hover:text-lime-400">{s.name}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Silver Category */}
          {sponsors.filter(s => s.category === 'Prata').length > 0 && (
            <div className="mb-16">
              <h3 className="text-center text-xs uppercase tracking-[0.2em] font-extrabold text-slate-400 mb-6">Patrocínio Prata</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
                {sponsors.filter(s => s.category === 'Prata').map((s) => (
                  <a
                    key={s.id}
                    href={s.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex flex-col items-center bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover-lift transition-all"
                  >
                    <div className="relative w-28 h-16 mb-2">
                      <Image src={s.logo} alt={s.name} fill className="object-contain filter grayscale group-hover:grayscale-0 transition-all" />
                    </div>
                    <span className="font-bold text-sm text-slate-800 dark:text-slate-200 text-center">{s.name}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Apoio Category */}
          {sponsors.filter(s => s.category === 'Apoio').length > 0 && (
            <div>
              <h3 className="text-center text-xs uppercase tracking-[0.2em] font-extrabold text-slate-400 mb-6">Apoio</h3>
              <div className="flex flex-wrap justify-center gap-6 max-w-4xl mx-auto">
                {sponsors.filter(s => s.category === 'Apoio').map((s) => (
                  <a
                    key={s.id}
                    href={s.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group bg-white dark:bg-slate-900 py-3 px-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-slate-700 dark:text-slate-300 font-semibold text-sm hover:text-[#003A8C] dark:hover:text-lime-400 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                  >
                    {s.name}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Seção Informações (FAQ) */}
      <section id="informacoes" className="py-24 px-4 bg-white dark:bg-slate-950 transition-colors scroll-mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#003A8C] dark:text-white font-poppins">
              Informações Importantes
            </h2>
            <p className="mt-4 text-slate-605 dark:text-slate-400 text-sm">
              Prepare-se para o evento consultando as principais diretrizes de segurança e convivência.
            </p>
          </div>

          <div className="max-w-3xl mx-auto flex flex-col gap-6 text-left">
            <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
              <h4 className="font-bold text-slate-900 dark:text-white font-poppins text-sm flex items-center gap-2">🐾 Onde e quando retirar o kit?</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                Os kits contendo a camiseta, a bandana do pet e a sacochila serão entregues no **Museu Militar do Forte do Brum**, no sábado (19/09/2026) das 09h às 17h, ou na tenda de credenciamento do evento no domingo (20/09/2026) a partir das 07h00. Apresente seu QR Code de participante.
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
              <h4 className="font-bold text-slate-900 dark:text-white font-poppins text-sm flex items-center gap-2">🩺 Como funciona a segurança veterinária?</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                Teremos veterinários Petsalut espalhados pelo circuito de 3km e uma ambulância de UTI veterinária posicionada na largada/chegada para dar o suporte necessário ao seu cãozinho se ele cansar ou precisar de cuidados médicos.
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
              <h4 className="font-bold text-slate-900 dark:text-white font-poppins text-sm flex items-center gap-2">🐶 Cães de todas as raças e portes podem participar?</h4>
              <p className="text-xs text-slate-650 dark:text-slate-400 mt-2 leading-relaxed">
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
            <Logo showText={true} className="text-white" />
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
