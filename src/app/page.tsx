'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Logo from '@/components/Logo';
import ThemeToggle from '@/components/ThemeToggle';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { 
  Calendar, MapPin, Clock, ArrowRight, Dog, Mail, CheckCircle2
} from 'lucide-react';

export default function ComingSoonPage() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  // Event Date: Sept 27, 2026 06:00:00
  const eventDate = new Date('2026-09-27T06:00:00').getTime();

  useEffect(() => {
    setMounted(true);

    const updateTimer = () => {
      const now = new Date().getTime();
      const difference = eventDate - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        setTimeLeft({ days, hours, minutes, seconds });
      }
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);

    return () => clearInterval(timer);
  }, [eventDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Por favor, insira seu e-mail.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Por favor, insira um e-mail válido.');
      return;
    }

    // Success simulation
    setIsSubmitted(true);
    
    // Confetti effect
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#8DC63F', '#003A8C', '#3B82F6', '#FFD700']
    });
  };

  // Paw icons for floating background animation
  const paws = [
    { id: 1, top: '10%', left: '15%', delay: 0, duration: 8, scale: 0.8 },
    { id: 2, top: '25%', left: '80%', delay: 1, duration: 10, scale: 1.2 },
    { id: 3, top: '65%', left: '8%', delay: 2, duration: 9, scale: 0.9 },
    { id: 4, top: '75%', left: '85%', delay: 1.5, duration: 11, scale: 1.1 },
    { id: 5, top: '45%', left: '75%', delay: 3, duration: 12, scale: 0.7 },
  ];

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 dark:bg-slate-950 transition-colors duration-300 relative overflow-hidden font-sans selection:bg-[#8DC63F] selection:text-slate-950">
      
      {/* Background Decorative Gradient Blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-blue-500/10 dark:bg-blue-500/5 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-[#8DC63F]/10 dark:bg-[#8DC63F]/5 blur-[100px] pointer-events-none" />

      {/* Floating Animated Paws */}
      {mounted && paws.map((paw) => (
        <motion.div
          key={paw.id}
          className="absolute text-slate-200 dark:text-slate-900 pointer-events-none select-none hidden sm:block"
          style={{ top: paw.top, left: paw.left }}
          initial={{ y: 20, opacity: 0 }}
          animate={{ 
            y: [-20, 20, -20],
            rotate: [0, 15, -15, 0],
            opacity: [0.15, 0.35, 0.15]
          }}
          transition={{
            duration: paw.duration,
            repeat: Infinity,
            delay: paw.delay,
            ease: "easeInOut"
          }}
        >
          <svg 
            viewBox="0 0 100 100" 
            fill="currentColor" 
            className="w-16 h-16"
            style={{ transform: `scale(${paw.scale})` }}
          >
            <path d="M50,45 C40,45 35,53 35,62 C35,72 42,78 50,78 C58,78 65,72 65,62 C65,53 60,45 50,45 Z" />
            <circle cx="28" cy="38" r="9" />
            <circle cx="43" cy="25" r="10" />
            <circle cx="57" cy="25" r="10" />
            <circle cx="72" cy="38" r="9" />
          </svg>
        </motion.div>
      ))}

      {/* Header */}
      <header className="w-full max-w-7xl mx-auto px-6 h-24 flex items-center justify-between z-10">
        <Logo size="md" />
        <ThemeToggle />
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-10 z-10 w-full max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full backdrop-blur-md bg-white/60 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/40 rounded-[2.5rem] shadow-2xl p-8 sm:p-12 text-center"
        >
          {/* Badge */}
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-[#8DC63F]/10 dark:bg-[#8DC63F]/20 text-[#003A8C] dark:text-lime-400 font-poppins border border-[#8DC63F]/20 dark:border-lime-500/20 mb-6">
            <Dog className="h-4 w-4 animate-bounce" />
            Em Breve
          </span>

          {/* Heading */}
          <h1 className="text-3xl sm:text-5xl font-black text-[#003A8C] dark:text-white font-poppins leading-tight tracking-tight max-w-2xl mx-auto">
            O Maior Evento Pet da Região está Chegando!
          </h1>
          
          <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-400 font-medium font-inter max-w-xl mx-auto leading-relaxed">
            Prepare-se para uma manhã cheia de saúde, diversão e solidariedade ao lado do seu melhor amigo na **Cãominhada Pet Salute 2026**.
          </p>

          {/* Countdown Area */}
          <div className="mt-10 max-w-lg mx-auto bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-inner">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8DC63F] dark:text-lime-400 mb-6 font-poppins">
              ⏱️ Contagem Regressiva para a Largada
            </p>

            <div className="grid grid-cols-4 gap-2 text-center font-poppins">
              {/* Days */}
              <div className="flex flex-col items-center">
                <span className="text-3xl sm:text-4xl font-black text-[#003A8C] dark:text-blue-400 leading-none">
                  {mounted ? timeLeft.days : '00'}
                </span>
                <span className="text-[9px] uppercase font-bold text-slate-400 dark:text-slate-500 mt-2">Dias</span>
              </div>
              
              {/* Hours */}
              <div className="flex flex-col items-center border-l border-slate-200 dark:border-slate-850">
                <span className="text-3xl sm:text-4xl font-black text-[#003A8C] dark:text-blue-400 leading-none">
                  {mounted ? String(timeLeft.hours).padStart(2, '0') : '00'}
                </span>
                <span className="text-[9px] uppercase font-bold text-slate-400 dark:text-slate-500 mt-2">Horas</span>
              </div>

              {/* Minutes */}
              <div className="flex flex-col items-center border-l border-slate-200 dark:border-slate-850">
                <span className="text-3xl sm:text-4xl font-black text-[#003A8C] dark:text-blue-400 leading-none">
                  {mounted ? String(timeLeft.minutes).padStart(2, '0') : '00'}
                </span>
                <span className="text-[9px] uppercase font-bold text-slate-400 dark:text-slate-500 mt-2">Minutos</span>
              </div>

              {/* Seconds */}
              <div className="flex flex-col items-center border-l border-slate-200 dark:border-slate-850">
                <span className="text-3xl sm:text-4xl font-black text-[#8DC63F] dark:text-lime-400 leading-none">
                  {mounted ? String(timeLeft.seconds).padStart(2, '0') : '00'}
                </span>
                <span className="text-[9px] uppercase font-bold text-[#8DC63F] dark:text-lime-400 mt-2">Segundos</span>
              </div>
            </div>
          </div>

          {/* Form and Sign Up */}
          <div className="mt-10 max-w-md mx-auto">
            <AnimatePresence mode="wait">
              {!isSubmitted ? (
                <motion.form 
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleSubmit}
                  className="flex flex-col gap-3 font-poppins"
                >
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-2 font-medium">
                    Quer ser avisado quando abrirmos as inscrições? Inscreva seu e-mail abaixo!
                  </p>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-1">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
                      <input 
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Seu melhor e-mail"
                        className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white dark:bg-slate-950 text-sm font-semibold border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-[#8DC63F]/50 focus:border-[#8DC63F] transition-all dark:text-white placeholder-slate-400"
                      />
                    </div>
                    <button 
                      type="submit"
                      className="px-6 py-3.5 rounded-2xl bg-[#8DC63F] hover:bg-lime-600 text-white dark:text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 hover-lift transition-all shadow-lg shadow-lime-500/15 shrink-0"
                    >
                      Me Avise 🐾
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>

                  {error && (
                    <motion.p 
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs text-red-500 font-semibold mt-1 text-left sm:text-center"
                    >
                      {error}
                    </motion.p>
                  )}
                </motion.form>
              ) : (
                <motion.div 
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-lime-500/10 dark:bg-lime-500/20 border border-[#8DC63F]/30 rounded-2xl p-6 flex flex-col items-center gap-3 text-center"
                >
                  <div className="h-12 w-12 rounded-full bg-[#8DC63F]/20 flex items-center justify-center text-[#8DC63F] dark:text-lime-400">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <h3 className="font-extrabold text-[#003A8C] dark:text-lime-400 font-poppins text-base">
                    Inscrição Confirmada!
                  </h3>
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-350 leading-relaxed max-w-sm">
                    Excelente! Nós te avisaremos assim que o site oficial estiver no ar e as inscrições começarem. Fique atento à sua caixa de entrada! 🐾
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Quick Info Bar */}
          <div className="mt-12 pt-8 border-t border-slate-200/50 dark:border-slate-800/40 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl mx-auto text-left font-poppins">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-50 dark:bg-blue-950/40 rounded-xl text-[#003A8C] dark:text-blue-400 shrink-0">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block leading-none mb-1">Data</span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">27 de Setembro de 2026</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-50 dark:bg-blue-950/40 rounded-xl text-[#003A8C] dark:text-blue-400 shrink-0">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block leading-none mb-1">Horário</span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Largada às 06h00</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-50 dark:bg-blue-950/40 rounded-xl text-[#003A8C] dark:text-blue-400 shrink-0">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block leading-none mb-1">Localização</span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1">Forte do Brum, Recife</span>
              </div>
            </div>
          </div>

        </motion.div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-8 flex flex-col sm:flex-row justify-between items-center gap-4 z-10 text-xs text-slate-500">
        <div>
          <p>Copyright © 2026 Petsalut. Todos os direitos reservados.</p>
        </div>
        
        {/* Social Links */}
        <div className="flex gap-4 items-center">
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-400 hover:text-pink-500 transition-colors" aria-label="Instagram">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
          </a>
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-400 hover:text-blue-600 transition-colors" aria-label="Facebook">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
          </a>
          <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-400 hover:text-red-500 transition-colors" aria-label="YouTube">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>
          </a>
          
          <span className="text-slate-350 dark:text-slate-800">|</span>

          {/* Secure link to access standard app routes like /login or /admin */}
          <Link 
            href="/login" 
            className="hover:underline text-slate-400 hover:text-[#003A8C] dark:hover:text-lime-400 font-semibold"
          >
            Acesso Restrito
          </Link>
        </div>
      </footer>
    </div>
  );
}
