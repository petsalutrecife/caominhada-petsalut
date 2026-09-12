'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Logo from '@/components/Logo';
import ThemeToggle from '@/components/ThemeToggle';
import { supabaseMock, Registration, Institution } from '@/lib/supabaseMock';
import confetti from 'canvas-confetti';
import {
  Camera, QrCode, CheckCircle2, AlertTriangle, XCircle, Search, 
  RotateCcw, Volume2, VolumeX, ArrowLeft, MapPin, Heart, 
  User, ShieldCheck, Check, Package, Sparkles, RefreshCw, Upload,
  Smartphone, Award, Clock, Lock, KeyRound, LogOut, ArrowRight, ShieldAlert,
  SlidersHorizontal, Building
} from 'lucide-react';

export default function QrCodeValidatorPage() {
  const [mounted, setMounted] = useState(false);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  
  // Auth / Security state
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Station Filter (Posto de Atendimento)
  const [stationFilter, setStationFilter] = useState<'ALL' | 'Zona Sul' | 'Zona Norte'>('ALL');

  // Scanner state
  const [scanning, setScanning] = useState(true);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [activeFacingMode, setActiveFacingMode] = useState<'environment' | 'user'>('environment');
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  // Verification state
  const [scannedResult, setScannedResult] = useState<string | null>(null);
  const [foundRegistration, setFoundRegistration] = useState<Registration | null>(null);
  const [notFoundQuery, setNotFoundQuery] = useState<string | null>(null);
  const [isUpdatingKit, setIsUpdatingKit] = useState(false);
  const [recentScans, setRecentScans] = useState<Array<{ reg: Registration; time: string; stationMatch: boolean }>>([]);
  
  // Manual search
  const [manualQuery, setManualQuery] = useState('');
  const [searchMode, setSearchMode] = useState<'camera' | 'manual'>('camera');

  const html5QrCodeRef = useRef<any>(null);
  const scannerContainerId = 'qr-reader-container';

  // Audio beeps using Web Audio API
  const playSound = (type: 'success' | 'warning' | 'error') => {
    if (!soundEnabled || typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'success') {
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1); // A5
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      } else if (type === 'warning') {
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      } else {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        osc.frequency.setValueAtTime(160, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      }
    } catch (e) {
      console.warn('Audio playback not supported:', e);
    }
  };

  const loadData = () => {
    setRegistrations(supabaseMock.getRegistrations());
    setInstitutions(supabaseMock.getInstitutions());
  };

  useEffect(() => {
    setMounted(true);
    // Check if user is already authorized (Staff PIN saved in localStorage or Admin logged in)
    const authorized = supabaseMock.isValidatorAuthorized();
    setIsAuthorized(authorized);

    // Load saved station filter
    if (typeof window !== 'undefined') {
      const savedStation = localStorage.getItem('ps_validator_station') as any;
      if (savedStation && ['ALL', 'Zona Sul', 'Zona Norte'].includes(savedStation)) {
        setStationFilter(savedStation);
      }
    }

    loadData();

    // Realtime subscription
    const unsubscribe = supabaseMock.subscribe(() => {
      loadData();
    });

    supabaseMock.syncFromSupabase().then(() => {
      loadData();
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleStationChange = (newStation: 'ALL' | 'Zona Sul' | 'Zona Norte') => {
    setStationFilter(newStation);
    if (typeof window !== 'undefined') {
      localStorage.setItem('ps_validator_station', newStation);
    }
  };

  // Handle PIN authentication
  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPinError(null);
    setIsAuthenticating(true);

    const result = supabaseMock.verifyValidatorAccess(pinInput);
    if (result.success) {
      setIsAuthorized(true);
      setPinInput('');
      playSound('success');
    } else {
      setPinError(result.error || 'PIN inválido');
      playSound('error');
    }
    setIsAuthenticating(false);
  };

  // Quick PIN pad number click
  const handleKeypadClick = (val: string) => {
    if (pinInput.length < 8) {
      const next = pinInput + val;
      setPinInput(next);
      setPinError(null);
      
      // Auto verify when 4 digits are reached
      if (next.length === 4) {
        const result = supabaseMock.verifyValidatorAccess(next);
        if (result.success) {
          setIsAuthorized(true);
          setPinInput('');
          playSound('success');
        }
      }
    }
  };

  const handleKeypadBackspace = () => {
    setPinInput(prev => prev.slice(0, -1));
    setPinError(null);
  };

  const handleKeypadClear = () => {
    setPinInput('');
    setPinError(null);
  };

  // Lock validator again
  const handleLockValidator = () => {
    supabaseMock.logoutValidator();
    setIsAuthorized(false);
    setPinInput('');
    setPinError(null);
    handleResetScan();
  };

  // Helper to get registration pickup point
  const getRegStation = (reg: Registration): 'Zona Sul' | 'Zona Norte' | 'Outro' => {
    if (reg.notes?.includes('Zona Sul')) return 'Zona Sul';
    if (reg.notes?.includes('Zona Norte')) return 'Zona Norte';
    return 'Outro';
  };

  // Check station match
  const isStationMatch = (reg: Registration): boolean => {
    if (stationFilter === 'ALL') return true;
    const regStation = getRegStation(reg);
    return regStation === stationFilter;
  };

  // Initialize and manage Html5Qrcode scanner
  useEffect(() => {
    if (!mounted || !isAuthorized || searchMode !== 'camera') return;

    let isMounted = true;
    let scannerInstance: any = null;

    const startScanner = async () => {
      try {
        const { Html5Qrcode } = await import('html5-qrcode');
        if (!isMounted) return;

        const container = document.getElementById(scannerContainerId);
        if (!container) return;

        // Clean up previous instance if running
        if (html5QrCodeRef.current) {
          try {
            await html5QrCodeRef.current.stop();
            html5QrCodeRef.current.clear();
          } catch (e) {}
        }

        scannerInstance = new Html5Qrcode(scannerContainerId);
        html5QrCodeRef.current = scannerInstance;

        const config = {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0
        };

        await scannerInstance.start(
          { facingMode: activeFacingMode },
          config,
          (decodedText: string) => {
            if (isMounted) {
              handleCodeScanned(decodedText);
            }
          },
          () => {} // silent scan frame error
        );

        setCameraError(null);
        setScanning(true);
      } catch (err: any) {
        console.error('Camera scan error:', err);
        if (isMounted) {
          setCameraError(err.message || 'Não foi possível acessar a câmera. Verifique as permissões.');
          setScanning(false);
        }
      }
    };

    startScanner();

    return () => {
      isMounted = false;
      if (html5QrCodeRef.current) {
        try {
          html5QrCodeRef.current.stop().catch(() => {}).finally(() => {
            try { html5QrCodeRef.current.clear(); } catch (e) {}
          });
        } catch (e) {}
      }
    };
  }, [mounted, isAuthorized, searchMode, activeFacingMode]);

  // Process Scanned Code or Manual Query
  const handleCodeScanned = (rawText: string) => {
    setScannedResult(rawText);
    
    // Parse possible QR formats:
    // 1) PET-2026-0004|Tutor Name|Pet Name|Status
    // 2) PET-2026-0004
    // 3) JSON
    let lookupRegNumber = rawText.trim();
    if (rawText.includes('|')) {
      lookupRegNumber = rawText.split('|')[0].trim();
    } else if (rawText.startsWith('{') && rawText.endsWith('}')) {
      try {
        const obj = JSON.parse(rawText);
        lookupRegNumber = obj.regNumber || obj.id || rawText;
      } catch (e) {}
    }

    const allRegs = supabaseMock.getRegistrations();
    const cleanLookup = lookupRegNumber.toLowerCase().replace(/[^a-z0-9-]/g, '');
    
    const found = allRegs.find(r => 
      r.regNumber.toLowerCase() === cleanLookup ||
      r.id.toLowerCase() === cleanLookup ||
      r.qrCode.toLowerCase().includes(cleanLookup) ||
      (r.tutorCpf && r.tutorCpf.replace(/\D/g, '') === lookupRegNumber.replace(/\D/g, ''))
    );

    if (found) {
      setFoundRegistration(found);
      setNotFoundQuery(null);
      
      const match = isStationMatch(found);

      if (!match) {
        playSound('warning');
      } else if (found.statusKit === 'Retirado') {
        playSound('warning');
      } else if (found.donationStatus === 'APROVADA') {
        playSound('success');
      } else {
        playSound('warning');
      }

      // Add to recent scans
      setRecentScans(prev => [{ 
        reg: found, 
        time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        stationMatch: match
      }, ...prev.slice(0, 4)]);
    } else {
      setFoundRegistration(null);
      setNotFoundQuery(rawText);
      playSound('error');
    }
  };

  // Manual search submit
  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualQuery.trim()) return;

    const query = manualQuery.trim();
    const allRegs = supabaseMock.getRegistrations();
    const cleanDigits = query.replace(/\D/g, '');

    const found = allRegs.find(r => 
      r.regNumber.toLowerCase().includes(query.toLowerCase()) ||
      (cleanDigits.length >= 4 && r.tutorCpf.replace(/\D/g, '').includes(cleanDigits)) ||
      r.tutorName.toLowerCase().includes(query.toLowerCase()) ||
      r.petName.toLowerCase().includes(query.toLowerCase())
    );

    if (found) {
      setFoundRegistration(found);
      setNotFoundQuery(null);
      const match = isStationMatch(found);

      if (!match) playSound('warning');
      else if (found.statusKit === 'Retirado') playSound('warning');
      else if (found.donationStatus === 'APROVADA') playSound('success');
      else playSound('warning');

      setRecentScans(prev => [{ 
        reg: found, 
        time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        stationMatch: match
      }, ...prev.slice(0, 4)]);
    } else {
      setFoundRegistration(null);
      setNotFoundQuery(query);
      playSound('error');
    }
  };

  // Confirm Kit Delivery
  const handleConfirmKitDelivery = async (regId: string) => {
    setIsUpdatingKit(true);
    try {
      const updated = supabaseMock.updateRegistration(regId, {
        statusKit: 'Retirado',
        statusPayment: 'Aprovado'
      });
      
      setFoundRegistration(updated);
      loadData();
      
      // Trigger celebrate sound and confetti
      playSound('success');
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (err) {
      console.error('Erro ao confirmar entrega do kit:', err);
    } finally {
      setIsUpdatingKit(false);
    }
  };

  // Undo Kit Delivery (if misclicked)
  const handleUndoKitDelivery = (regId: string) => {
    if (confirm('Deseja reverter o status do kit para "Liberado"?')) {
      const updated = supabaseMock.updateRegistration(regId, {
        statusKit: 'Liberado'
      });
      setFoundRegistration(updated);
      loadData();
    }
  };

  // Reset to scan next
  const handleResetScan = () => {
    setFoundRegistration(null);
    setNotFoundQuery(null);
    setScannedResult(null);
    setManualQuery('');
  };

  // Upload image from gallery fallback
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const { Html5Qrcode } = await import('html5-qrcode');
      const html5QrCode = new Html5Qrcode('qr-reader-file-temp');
      const result = await html5QrCode.scanFile(file, true);
      handleCodeScanned(result);
    } catch (err) {
      alert('Não foi possível reconhecer um QR Code nesta imagem. Tente uma foto mais nítida ou digite o código.');
    }
  };

  const getInstName = (instId: string) => institutions.find(i => i.id === instId)?.name || 'Instituição Parceira';

  // Metrics based on selected station
  const filteredRegs = stationFilter === 'ALL' 
    ? registrations 
    : registrations.filter(r => getRegStation(r) === stationFilter);

  const totalKitsEntregues = filteredRegs.filter(r => r.statusKit === 'Retirado').length;
  const totalInscricoes = filteredRegs.length;

  if (!mounted) return null;

  // -------------------------------------------------------------
  // LOCKSCREEN / PIN ACCESS SCREEN
  // -------------------------------------------------------------
  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex flex-col justify-between bg-slate-950 text-slate-100 font-sans p-4 sm:p-6">
        
        {/* Top bar with back to home */}
        <div className="flex items-center justify-between max-w-sm w-full mx-auto pt-2">
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="h-4 w-4" /> Voltar ao Início
          </Link>
          <div className="flex items-center gap-1 text-[11px] text-slate-500 font-mono">
            <ShieldCheck className="h-3.5 w-3.5 text-[#8DC63F]" /> Acesso Seguro
          </div>
        </div>

        {/* Center Card with PIN & Mobile Keypad */}
        <div className="max-w-sm w-full mx-auto my-auto flex flex-col items-center text-center">
          
          <div className="relative mb-4">
            <div className="h-16 w-16 rounded-3xl bg-slate-900 border-2 border-slate-800 flex items-center justify-center text-[#8DC63F] shadow-2xl">
              <Lock className="h-8 w-8" />
            </div>
            <span className="absolute -bottom-1 -right-1 p-1 bg-[#8DC63F] rounded-full text-slate-950">
              <QrCode className="h-3.5 w-3.5" />
            </span>
          </div>

          <h2 className="text-xl font-black text-white font-poppins tracking-tight">
            Validador de Inscrição
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-[280px]">
            Área de uso exclusivo da organização e pontos de retirada. Insira o PIN da equipe:
          </p>

          {/* PIN Input / Dots Display */}
          <form onSubmit={handlePinSubmit} className="w-full mt-5 flex flex-col items-center">
            
            <div className="flex items-center justify-center gap-3 mb-4">
              {[0, 1, 2, 3].map((index) => {
                const isFilled = pinInput.length > index;
                return (
                  <div
                    key={index}
                    className={`h-12 w-12 rounded-2xl border-2 flex items-center justify-center text-lg font-black font-mono transition-all ${
                      isFilled
                        ? 'border-[#8DC63F] bg-[#8DC63F]/10 text-[#8DC63F] scale-105 shadow-[0_0_15px_rgba(141,198,63,0.3)]'
                        : 'border-slate-800 bg-slate-900 text-slate-600'
                    }`}
                  >
                    {isFilled ? '●' : ''}
                  </div>
                );
              })}
            </div>

            {pinError && (
              <div className="mb-3 px-3 py-1.5 rounded-xl bg-red-950/60 border border-red-500 text-red-300 text-xs font-semibold flex items-center gap-1.5 animate-shake">
                <ShieldAlert className="h-4 w-4 shrink-0 text-red-400" />
                <span>{pinError}</span>
              </div>
            )}

            {/* Mobile Keypad (0-9) */}
            <div className="grid grid-cols-3 gap-2 w-full max-w-[280px] my-2">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                <button
                  key={digit}
                  type="button"
                  onClick={() => handleKeypadClick(digit)}
                  className="h-14 rounded-2xl bg-slate-900 border border-slate-800 text-lg font-extrabold text-white hover:bg-slate-800 active:scale-95 transition-all flex items-center justify-center"
                >
                  {digit}
                </button>
              ))}
              
              <button
                type="button"
                onClick={handleKeypadClear}
                className="h-14 rounded-2xl bg-slate-900/60 border border-slate-850 text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 active:scale-95 transition-all flex items-center justify-center"
              >
                Limpar
              </button>

              <button
                type="button"
                onClick={() => handleKeypadClick('0')}
                className="h-14 rounded-2xl bg-slate-900 border border-slate-800 text-lg font-extrabold text-white hover:bg-slate-800 active:scale-95 transition-all flex items-center justify-center"
              >
                0
              </button>

              <button
                type="button"
                onClick={handleKeypadBackspace}
                className="h-14 rounded-2xl bg-slate-900/60 border border-slate-850 text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 active:scale-95 transition-all flex items-center justify-center"
              >
                ⌫
              </button>
            </div>

            {/* Manual text submit fallback / button */}
            <button
              type="submit"
              disabled={isAuthenticating || pinInput.length === 0}
              className="w-full max-w-[280px] mt-4 py-3.5 rounded-2xl bg-[#003A8C] hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              {isAuthenticating ? <RefreshCw className="h-4 w-4 animate-spin" /> : <>Desbloquear Validador <ArrowRight className="h-4 w-4" /></>}
            </button>

          </form>

        </div>

        {/* Footer with Admin Login Link */}
        <div className="max-w-sm w-full mx-auto pb-4 pt-2 text-center flex flex-col gap-2">
          <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
            <span>É o Administrador ou Entidade?</span>
            <Link href="/login" className="text-[#8DC63F] font-bold hover:underline">
              Fazer Login
            </Link>
          </div>
          <span className="text-[10px] text-slate-600">
            PIN padrão inicial da equipe: <strong>2026</strong> (configurável no painel)
          </span>
        </div>

      </div>
    );
  }

  // -------------------------------------------------------------
  // AUTHORIZED / SCANNER DASHBOARD
  // -------------------------------------------------------------
  const selectedRegStation = foundRegistration ? getRegStation(foundRegistration) : null;
  const hasStationDivergence = foundRegistration && stationFilter !== 'ALL' && selectedRegStation !== stationFilter;

  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-slate-100 font-sans select-none">
      
      {/* Top Header */}
      <header className="px-4 py-2.5 flex flex-col gap-2 border-b border-slate-800 bg-slate-950 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Link href="/admin" className="p-2 -ml-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-850 transition-colors" title="Painel Admin">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#8DC63F] text-slate-950 font-black text-xs">
                <QrCode className="h-4 w-4" />
              </span>
              <div className="flex flex-col text-left">
                <span className="font-extrabold text-xs sm:text-sm tracking-tight text-white font-poppins">
                  Validador de Inscrição
                </span>
                <span className="text-[9px] text-[#8DC63F] font-bold uppercase tracking-wider flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#8DC63F] animate-pulse" /> Ativo & Conectado
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title={soundEnabled ? 'Silenciar bipes' : 'Ativar bipes'}
            >
              {soundEnabled ? <Volume2 className="h-4 w-4 text-emerald-400" /> : <VolumeX className="h-4 w-4 text-slate-500" />}
            </button>
            
            <div className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold">
              {totalKitsEntregues}/{totalInscricoes} Kits
            </div>

            <button
              type="button"
              onClick={handleLockValidator}
              className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
              title="Bloquear Validador"
            >
              <Lock className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Station Selector Pill Bar (Posto de Retirada Atual) */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-[11px] font-bold">
          <span className="text-[10px] uppercase text-slate-500 px-2 flex items-center gap-1">
            <MapPin className="h-3 w-3 text-[#8DC63F]" /> Posto:
          </span>
          <div className="flex-1 grid grid-cols-3 gap-1">
            <button
              type="button"
              onClick={() => handleStationChange('ALL')}
              className={`py-1 rounded-lg text-[10px] transition-all ${
                stationFilter === 'ALL'
                  ? 'bg-slate-800 text-white shadow font-extrabold border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Geral
            </button>
            <button
              type="button"
              onClick={() => handleStationChange('Zona Sul')}
              className={`py-1 rounded-lg text-[10px] transition-all truncate ${
                stationFilter === 'Zona Sul'
                  ? 'bg-[#003A8C] text-white shadow font-extrabold border border-blue-600'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Posto Zona Sul - Pet Happy (Boa Viagem)"
            >
              Zona Sul
            </button>
            <button
              type="button"
              onClick={() => handleStationChange('Zona Norte')}
              className={`py-1 rounded-lg text-[10px] transition-all truncate ${
                stationFilter === 'Zona Norte'
                  ? 'bg-[#003A8C] text-white shadow font-extrabold border border-blue-600'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Posto Zona Norte - Oh Pet (Graças)"
            >
              Zona Norte
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-md w-full mx-auto p-4 flex flex-col gap-4">
        
        {/* Toggle Mode: Scanner vs Manual */}
        <div className="grid grid-cols-2 p-1 bg-slate-950 border border-slate-800 rounded-2xl">
          <button
            type="button"
            onClick={() => { setSearchMode('camera'); handleResetScan(); }}
            className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              searchMode === 'camera'
                ? 'bg-[#003A8C] text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Camera className="h-4 w-4" /> Câmera / Scanner
          </button>
          <button
            type="button"
            onClick={() => { setSearchMode('manual'); handleResetScan(); }}
            className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              searchMode === 'manual'
                ? 'bg-[#003A8C] text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Search className="h-4 w-4" /> Buscar Manual
          </button>
        </div>

        {/* 1. CAMERA SCANNER VIEWPORT */}
        {searchMode === 'camera' && !foundRegistration && !notFoundQuery && (
          <div className="flex flex-col gap-3">
            <div className="relative w-full aspect-square bg-black rounded-3xl overflow-hidden border-2 border-slate-800 shadow-2xl flex items-center justify-center">
              
              {/* HTML5 QR Code Mount Element */}
              <div id={scannerContainerId} className="w-full h-full object-cover" />

              {/* Animated Target Overlay */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-56 h-56 border-2 border-[#8DC63F]/80 rounded-2xl relative shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]">
                  {/* Corners */}
                  <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-[#8DC63F] rounded-tl" />
                  <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-[#8DC63F] rounded-tr" />
                  <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-[#8DC63F] rounded-bl" />
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-[#8DC63F] rounded-br" />
                  
                  {/* Laser line animation */}
                  <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-[#8DC63F] to-transparent animate-pulse top-1/2 -translate-y-1/2 shadow-[0_0_8px_#8DC63F]" />
                </div>
              </div>

              {cameraError && (
                <div className="absolute inset-0 bg-slate-950/90 p-6 flex flex-col items-center justify-center text-center gap-3">
                  <Smartphone className="h-10 w-10 text-amber-400" />
                  <span className="font-bold text-sm text-white">Acesso à câmera necessário</span>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Permita o uso da câmera do navegador para escanear os QR Codes dos participantes.
                  </p>
                  <button
                    onClick={() => setActiveFacingMode(prev => prev === 'environment' ? 'user' : 'environment')}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-bold text-slate-200 mt-2 hover:bg-slate-700"
                  >
                    Tentar outra câmera
                  </button>
                </div>
              )}
            </div>

            {/* Camera Switcher & File Upload Fallbacks */}
            <div className="flex items-center justify-between px-2 text-xs text-slate-400">
              <button
                type="button"
                onClick={() => setActiveFacingMode(prev => prev === 'environment' ? 'user' : 'environment')}
                className="flex items-center gap-1.5 hover:text-white transition-colors"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Alternar Câmera ({activeFacingMode === 'environment' ? 'Traseira' : 'Frontal'})
              </button>

              <label className="flex items-center gap-1.5 hover:text-emerald-400 cursor-pointer transition-colors">
                <Upload className="h-3.5 w-3.5" /> Ler da Galeria
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
          </div>
        )}

        {/* 2. MANUAL SEARCH FORM */}
        {searchMode === 'manual' && !foundRegistration && !notFoundQuery && (
          <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 flex flex-col gap-4">
            <h4 className="text-sm font-bold text-white font-poppins">Buscar por Número ou CPF</h4>
            <p className="text-xs text-slate-400">
              Digite o número da inscrição (ex: <code>PET-2026-0004</code>), CPF ou nome do tutor.
            </p>

            <form onSubmit={handleManualSearch} className="flex flex-col gap-3">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Ex: PET-2026-0004 ou CPF"
                  value={manualQuery}
                  onChange={(e) => setManualQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-900 border border-slate-750 text-sm font-semibold text-white placeholder:text-slate-500 focus:outline-none focus:border-[#8DC63F]"
                  autoFocus
                />
              </div>

              <button
                type="submit"
                className="py-3.5 rounded-2xl bg-[#003A8C] hover:bg-blue-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2"
              >
                <Search className="h-4 w-4" /> Buscar Participante
              </button>
            </form>
          </div>
        )}

        {/* 3. VERIFICATION RESULT CARD (SUCCESS) */}
        {foundRegistration && (
          <div className="flex flex-col gap-3 animate-in zoom-in-95 duration-200">
            
            {/* DIVERGENCE WARNING ALERT (If participant selected another pickup point) */}
            {hasStationDivergence && (
              <div className="p-4 rounded-3xl bg-amber-500/15 border-2 border-amber-500 text-amber-200 text-left flex flex-col gap-2 animate-pulse">
                <div className="flex items-center gap-2 font-extrabold text-xs text-amber-400 uppercase tracking-wide">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  Atenção: Posto de Retirada Diferente
                </div>
                <p className="text-xs leading-relaxed text-amber-100">
                  O participante cadastrou a retirada para <strong>{selectedRegStation === 'Zona Sul' ? 'Zona Sul (Pet Happy)' : 'Zona Norte (Oh Pet Graças)'}</strong>, mas este aparelho está operando o posto <strong>{stationFilter}</strong>.
                </p>
                <span className="text-[10px] text-amber-300/80">
                  Verifique a disponibilidade do kit reserva antes de prosseguir com a entrega.
                </span>
              </div>
            )}

            {/* Status Header Banner */}
            <div className={`p-5 rounded-3xl border-2 flex items-center gap-4 ${
              foundRegistration.statusKit === 'Retirado'
                ? 'bg-slate-950 border-slate-700 text-slate-300'
                : foundRegistration.donationStatus === 'APROVADA'
                  ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300'
                  : 'bg-amber-950/40 border-amber-500 text-amber-300'
            }`}>
              {foundRegistration.statusKit === 'Retirado' ? (
                <div className="h-12 w-12 rounded-2xl bg-slate-800 text-slate-300 flex items-center justify-center shrink-0">
                  <Package className="h-6 w-6" />
                </div>
              ) : foundRegistration.donationStatus === 'APROVADA' ? (
                <div className="h-12 w-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="h-7 w-7" />
                </div>
              ) : (
                <div className="h-12 w-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                  <AlertTriangle className="h-7 w-7" />
                </div>
              )}

              <div className="text-left flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest block opacity-75">
                    {foundRegistration.regNumber}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    foundRegistration.statusKit === 'Retirado'
                      ? 'bg-slate-800 text-slate-300'
                      : foundRegistration.statusKit === 'Liberado'
                        ? 'bg-emerald-500 text-slate-950 font-black'
                        : 'bg-amber-500/20 text-amber-300'
                  }`}>
                    KIT: {foundRegistration.statusKit.toUpperCase()}
                  </span>
                </div>
                
                <h3 className="text-base font-extrabold text-white font-poppins mt-0.5">
                  {foundRegistration.statusKit === 'Retirado' 
                    ? 'Kit Já Retirado' 
                    : foundRegistration.donationStatus === 'APROVADA'
                      ? 'Inscrição Válida & Liberada'
                      : 'Doação Pendente de Análise'}
                </h3>
              </div>
            </div>

            {/* Participant Full Details Card */}
            <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 flex flex-col gap-4 text-left shadow-lg">
              
              {/* Tutor & Pet */}
              <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-850">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Tutor</span>
                  <strong className="text-sm text-white block mt-0.5 truncate">{foundRegistration.tutorName}</strong>
                  <span className="text-[11px] text-slate-400 font-mono block">CPF: {foundRegistration.tutorCpf}</span>
                  <span className="text-[11px] text-slate-400 block">{foundRegistration.tutorWhatsApp}</span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Pet</span>
                  <strong className="text-sm text-[#8DC63F] block mt-0.5 truncate">{foundRegistration.petName} 🐾</strong>
                  <span className="text-[11px] text-slate-300 block">{foundRegistration.petBreed} ({foundRegistration.petSize})</span>
                  <span className="text-[11px] text-slate-400 block">{foundRegistration.petSpecies}, {foundRegistration.petAge} anos</span>
                </div>
              </div>

              {/* Pickup & Institution */}
              <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-850 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-[#8DC63F]" /> Ponto Selecionado
                  </span>
                  <strong className={`text-xs block mt-1 ${hasStationDivergence ? 'text-amber-400 font-black' : 'text-white'}`}>
                    {foundRegistration.notes?.includes('Zona Sul') 
                      ? 'Zona Sul - Pet Happy' 
                      : foundRegistration.notes?.includes('Zona Norte') 
                        ? 'Zona Norte - Oh Pet Graças' 
                        : (foundRegistration.notes ? foundRegistration.notes.replace('Retirada: ', '') : 'Não informado')}
                  </strong>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block flex items-center gap-1">
                    <Heart className="h-3 w-3 text-red-400" /> Doação Social
                  </span>
                  <strong className="text-xs text-emerald-400 block mt-1">
                    R$ {foundRegistration.donationValue.toFixed(2)} ({foundRegistration.donationStatus})
                  </strong>
                  <span className="text-[10px] text-slate-400 truncate block">
                    {getInstName(foundRegistration.selectedInstitution)}
                  </span>
                </div>
              </div>

              {/* Primary Action: Deliver Kit Button */}
              <div className="flex flex-col gap-2 pt-2">
                {foundRegistration.statusKit !== 'Retirado' ? (
                  <button
                    type="button"
                    disabled={isUpdatingKit}
                    onClick={() => handleConfirmKitDelivery(foundRegistration.id)}
                    className={`w-full py-4 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95 ${
                      hasStationDivergence
                        ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-amber-500/20'
                        : 'bg-[#8DC63F] hover:bg-[#7cb335] text-slate-950 shadow-lime-500/20'
                    }`}
                  >
                    {isUpdatingKit ? (
                      <RefreshCw className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        <Check className="h-5 w-5" /> 
                        {hasStationDivergence ? 'Entregar Kit (Mesmo com Divergência)' : 'Entregar Kit do Participante'}
                      </>
                    )}
                  </button>
                ) : (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                    <span className="text-slate-400">Kit já foi entregue a este participante.</span>
                    <button
                      type="button"
                      onClick={() => handleUndoKitDelivery(foundRegistration.id)}
                      className="text-[11px] text-amber-400 hover:underline font-bold"
                    >
                      Desfazer
                    </button>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleResetScan}
                  className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-750 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <Camera className="h-4 w-4" /> Escanear Próxima Inscrição
                </button>
              </div>

            </div>

          </div>
        )}

        {/* 4. NOT FOUND ALERT */}
        {notFoundQuery && (
          <div className="bg-red-950/40 border-2 border-red-500 p-6 rounded-3xl text-left flex flex-col gap-4 animate-in zoom-in-95">
            <div className="flex items-start gap-3">
              <XCircle className="h-8 w-8 text-red-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-base font-extrabold text-white font-poppins">Inscrição Não Encontrada</h4>
                <p className="text-xs text-red-200 mt-1 leading-relaxed">
                  Nenhum registro foi localizado para o código/texto: <br />
                  <code className="bg-red-900/60 px-2 py-1 rounded text-red-100 font-mono text-xs block mt-1 break-all">
                    {notFoundQuery}
                  </code>
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleResetScan}
                className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-colors text-center"
              >
                Tentar Novamente
              </button>
              <button
                type="button"
                onClick={() => { setSearchMode('manual'); setManualQuery(''); setNotFoundQuery(null); }}
                className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors text-center"
              >
                Buscar por Nome/CPF
              </button>
            </div>
          </div>
        )}

        {/* RECENT SCANS LOG */}
        {recentScans.length > 0 && (
          <div className="mt-4 bg-slate-950 p-4 rounded-3xl border border-slate-850 flex flex-col gap-2.5 text-left">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block px-2">
              Últimas Validações no Aparelho
            </span>
            <div className="flex flex-col gap-2">
              {recentScans.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => { setFoundRegistration(item.reg); setNotFoundQuery(null); }}
                  className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-850 cursor-pointer border border-slate-800 flex items-center justify-between text-xs transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-lg bg-[#8DC63F]/20 text-[#8DC63F] flex items-center justify-center font-bold text-xs">
                      🐾
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-white block">{item.reg.tutorName}</span>
                        {!item.stationMatch && (
                          <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 text-[9px] font-extrabold">
                            Outro Posto
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">{item.reg.regNumber} • {item.reg.petName}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 block">{item.time}</span>
                    <span className={`text-[9px] font-bold ${item.reg.statusKit === 'Retirado' ? 'text-slate-400' : 'text-emerald-400'}`}>
                      {item.reg.statusKit}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* Hidden file container for fallback scanning */}
      <div id="qr-reader-file-temp" className="hidden" />

    </div>
  );
}
