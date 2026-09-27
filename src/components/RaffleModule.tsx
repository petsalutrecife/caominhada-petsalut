'use client';

import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { supabaseMock, Registration, Sponsor, RaffleWinner } from '@/lib/supabaseMock';
import { playTickSound, playWinnerSound } from '@/lib/raffleAudio';
import { 
  Gift, Shuffle, Sparkles, Volume2, VolumeX, MessageSquare, 
  RotateCcw, Trophy, Award, CheckCircle2, UserCheck, Trash2, 
  Download, PawPrint, Phone, ExternalLink, Filter, Cloud, HardDrive
} from 'lucide-react';

export type { RaffleWinner };

export default function RaffleModule() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  
  // Raffle Setup State
  const [prizeName, setPrizeName] = useState('Kit Brindes Especiais');
  const [selectedSponsor, setSelectedSponsor] = useState('');
  const [onlyApproved, setOnlyApproved] = useState(true);
  const [excludePreviousWinners, setExcludePreviousWinners] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  // Animation & Active Draw State
  const [isDrawing, setIsDrawing] = useState(false);
  const [displayName, setDisplayName] = useState<string>('Clique no botão para sortear');
  const [displayPet, setDisplayPet] = useState<string>('');
  const [currentWinner, setCurrentWinner] = useState<Registration | null>(null);
  const [activeWinnerData, setActiveWinnerData] = useState<RaffleWinner | null>(null);

  // Winners History State
  const [winners, setWinners] = useState<RaffleWinner[]>([]);

  // Cloud persistence state
  const [isCloudSynced, setIsCloudSynced] = useState<boolean | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load data
  useEffect(() => {
    const regs = supabaseMock.getRegistrations();
    setRegistrations(regs);
    const sps = supabaseMock.getSponsors();
    setSponsors(sps);
    if (sps.length > 0 && !selectedSponsor) {
      setSelectedSponsor(sps[0].name);
    }

    supabaseMock.getRaffleWinners().then(({ winners: savedList, isCloud }) => {
      setWinners(savedList);
      setIsCloudSynced(isCloud);
    });
  }, []);

  // Save winners history (Instant local + Async Supabase Cloud)
  const saveWinners = async (newWinner: RaffleWinner) => {
    setWinners(prev => [newWinner, ...prev.filter(w => w.id !== newWinner.id)]);
    const res = await supabaseMock.saveRaffleWinner(newWinner);
    setIsCloudSynced(res.isCloud);
  };

  // Filter eligible participants
  const eligibleParticipants = registrations.filter(r => {
    if (!r.tutorName || r.tutorName.trim() === '') return false;
    if (onlyApproved && r.donationStatus !== 'APROVADA') return false;
    if (excludePreviousWinners && winners.some(w => w.registrationId === r.id)) return false;
    return true;
  });

  const handleStartDraw = () => {
    if (eligibleParticipants.length === 0) {
      alert('Nenhum participante elegível encontrado com os filtros atuais.');
      return;
    }
    if (!prizeName.trim()) {
      alert('Por favor, informe o nome do brinde antes de sortear.');
      return;
    }

    setIsDrawing(true);
    setCurrentWinner(null);
    setActiveWinnerData(null);

    // Pick winner randomly from eligible pool
    const winnerIndex = Math.floor(Math.random() * eligibleParticipants.length);
    const selected = eligibleParticipants[winnerIndex];

    let speed = 40; // initial interval in ms
    let elapsed = 0;
    const totalDuration = 3800; // 3.8 seconds total
    const startTime = Date.now();

    const tick = () => {
      const currentElapsed = Date.now() - startTime;
      
      // Pick a random participant to show during shuffle
      const randomIdx = Math.floor(Math.random() * eligibleParticipants.length);
      const tempPerson = eligibleParticipants[randomIdx];
      setDisplayName(tempPerson.tutorName);
      setDisplayPet(tempPerson.petName ? `Pet: ${tempPerson.petName}` : '');

      if (soundEnabled) {
        playTickSound();
      }

      if (currentElapsed < totalDuration) {
        // Progressively decelerate
        const progress = currentElapsed / totalDuration;
        speed = 40 + Math.pow(progress, 2.5) * 450;
        intervalRef.current = setTimeout(tick, speed);
      } else {
        // Finish draw on the chosen winner!
        setDisplayName(selected.tutorName);
        setDisplayPet(selected.petName ? `Pet: ${selected.petName}` : '');
        setCurrentWinner(selected);
        setIsDrawing(false);

        const newWinnerRecord: RaffleWinner = {
          id: `win-${Date.now()}`,
          registrationId: selected.id,
          tutorName: selected.tutorName,
          tutorPhone: selected.tutorPhone || selected.tutorWhatsApp || '',
          tutorWhatsApp: selected.tutorWhatsApp || selected.tutorPhone || '',
          petName: selected.petName || 'Pet',
          petBreed: selected.petBreed,
          regNumber: selected.regNumber,
          prizeName: prizeName.trim(),
          sponsorName: selectedSponsor || 'CãoMinhada Pet Salut',
          wonAt: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        };

        setActiveWinnerData(newWinnerRecord);
        saveWinners(newWinnerRecord);

        if (soundEnabled) {
          playWinnerSound();
        }

        try {
          confetti({
            particleCount: 120,
            spread: 90,
            origin: { y: 0.6 }
          });
        } catch {}
      }
    };

    intervalRef.current = setTimeout(tick, speed);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearTimeout(intervalRef.current);
    };
  }, []);

  const handleSendWhatsApp = (winner: RaffleWinner) => {
    const cleanPhone = (winner.tutorWhatsApp || winner.tutorPhone || '').replace(/\D/g, '');
    if (!cleanPhone) {
      alert('Telefone do participante não cadastrado.');
      return;
    }
    const fullPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
    const text = `Olá ${winner.tutorName}! 🐾\n\n🎉 *Parabéns!* Você e ${winner.petName} acabaram de ser sorteados na *CãoMinhada Pet Salut*!\n\n🎁 *Brinde Ganho:* ${winner.prizeName}\n🌟 *Patrocinador:* ${winner.sponsorName}\n\nPor favor, dirija-se à tenda principal do evento para retirar seu prêmio! Nos vemos lá! 🐕✨`;
    const url = `https://wa.me/${fullPhone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleExportCsv = () => {
    if (winners.length === 0) {
      alert('Nenhum ganhador para exportar.');
      return;
    }
    let csv = 'Nome do Ganhador;Pet;Telefone;Brinde;Patrocinador;Horario\n';
    winners.forEach(w => {
      csv += `"${w.tutorName}";"${w.petName}";"${w.tutorWhatsApp || w.tutorPhone}";"${w.prizeName}";"${w.sponsorName}";"${w.wonAt}"\n`;
    });
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `ganhadores_caominhada_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  const handleClearHistory = async () => {
    if (confirm('Tem certeza de que deseja limpar o histórico de ganhadores?')) {
      await supabaseMock.clearRaffleWinners();
      setWinners([]);
      setCurrentWinner(null);
      setActiveWinnerData(null);
      setDisplayName('Clique no botão para sortear');
      setDisplayPet('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#003A8C] via-blue-700 to-indigo-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
          <Gift className="w-72 h-72 text-white" />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold text-lime-300">
              <Sparkles className="w-3.5 h-3.5" /> Sorteador Oficial por Nomes
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-poppins">
              Sorteio de Brindes dos Patrocinadores
            </h1>
            <p className="text-sm text-blue-100 max-w-xl">
              Sorteie os nomes dos participantes cadastrados, associe aos brindes dos parceiros e notifique o vencedor diretamente no WhatsApp.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-white transition-all flex items-center gap-2 text-xs font-bold"
              title={soundEnabled ? 'Silenciar som' : 'Ativar som'}
            >
              {soundEnabled ? <Volume2 className="h-5 w-5 text-lime-300" /> : <VolumeX className="h-5 w-5 text-white/60" />}
              <span>{soundEnabled ? 'Som Ativo' : 'Mudo'}</span>
            </button>
            <div className="px-4 py-3 rounded-2xl bg-white/15 backdrop-blur-md text-center">
              <span className="block text-2xl font-black text-lime-300">{eligibleParticipants.length}</span>
              <span className="text-[10px] uppercase font-bold tracking-wider text-blue-100">Nomes Aptos</span>
            </div>
          </div>
        </div>
      </div>

      {/* Control Panel & Sorteio Arena */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Setup Configuration (4 cols) */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 uppercase tracking-wider text-xs">
            <Filter className="h-4 w-4 text-[#003A8C] dark:text-lime-400" /> Configuração do Brinde
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Nome do Brinde que será sorteado
              </label>
              <input
                type="text"
                value={prizeName}
                onChange={(e) => setPrizeName(e.target.value)}
                placeholder="Ex: Kit Banho & Tosa, Cesta de Snacks..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm font-medium focus:ring-2 focus:ring-[#003A8C] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Patrocinador Parceiro
              </label>
              <select
                value={selectedSponsor}
                onChange={(e) => setSelectedSponsor(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm font-medium focus:ring-2 focus:ring-[#003A8C] focus:outline-none"
              >
                {sponsors.map(sp => (
                  <option key={sp.id} value={sp.name}>{sp.name} ({sp.category})</option>
                ))}
                <option value="CãoMinhada Pet Salut">CãoMinhada Pet Salut (Geral)</option>
              </select>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={onlyApproved}
                  onChange={(e) => setOnlyApproved(e.target.checked)}
                  className="rounded text-[#003A8C] focus:ring-[#003A8C] h-4 w-4"
                />
                <span>Apenas inscrições com pagamento <strong>Aprovado</strong></span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={excludePreviousWinners}
                  onChange={(e) => setExcludePreviousWinners(e.target.checked)}
                  className="rounded text-[#003A8C] focus:ring-[#003A8C] h-4 w-4"
                />
                <span>Excluir quem já foi sorteado antes ({winners.length})</span>
              </label>
            </div>

            <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-2xl border border-blue-100 dark:border-blue-900/50 text-[11px] text-blue-800 dark:text-blue-300 space-y-1">
              <span className="font-bold block">💡 Sorteio por Nome:</span>
              <span>O sorteio é realizado diretamente entre os nomes dos participantes cadastrados. Ao sortear, o nome da pessoa ganha destaque imediato.</span>
            </div>
          </div>
        </div>

        {/* Live Draw Stage Arena (8 cols) */}
        <div className="lg:col-span-8 bg-gradient-to-b from-white to-slate-50 dark:from-slate-950 dark:to-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between relative overflow-hidden">
          
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Arena de Sorteio
              </span>
            </div>
            <span className="text-xs font-semibold px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-700 dark:text-slate-300">
              Prêmio: <strong>{prizeName}</strong> ({selectedSponsor})
            </span>
          </div>

          {/* Center Stage: Name Shuffle Card */}
          <div className="my-8 py-8 px-4 rounded-3xl bg-white dark:bg-slate-900 border-2 border-dashed border-blue-200 dark:border-blue-900/60 shadow-inner flex flex-col items-center justify-center text-center min-h-[220px]">
            {isDrawing ? (
              <div className="space-y-4 animate-pulse">
                <span className="text-xs font-bold uppercase tracking-widest text-[#003A8C] dark:text-lime-400">
                  Embaralhando nomes de cadastro...
                </span>
                <h3 className="text-2xl sm:text-4xl font-extrabold text-slate-800 dark:text-white font-poppins transition-all">
                  {displayName}
                </h3>
                {displayPet && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300">
                    <PawPrint className="w-3.5 h-3.5" /> {displayPet}
                  </span>
                )}
              </div>
            ) : activeWinnerData ? (
              /* Winner Reveal State */
              <div className="space-y-3 animate-in zoom-in-95 duration-300">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-extrabold">
                  <Trophy className="h-4 w-4" /> VENCEDOR SORTEADO!
                </div>
                
                <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white font-poppins tracking-tight">
                  {activeWinnerData.tutorName}
                </h2>

                <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-bold">
                    <PawPrint className="w-3.5 h-3.5" /> Pet: {activeWinnerData.petName} {activeWinnerData.petBreed ? `(${activeWinnerData.petBreed})` : ''}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold">
                    <Phone className="w-3.5 h-3.5" /> {activeWinnerData.tutorWhatsApp || activeWinnerData.tutorPhone || 'Sem telefone'}
                  </span>
                </div>

                <div className="pt-3 text-xs text-slate-500 dark:text-slate-400">
                  Ganhou: <span className="font-bold text-slate-800 dark:text-slate-200">{activeWinnerData.prizeName}</span> oferecido por <span className="font-bold text-[#003A8C] dark:text-lime-400">{activeWinnerData.sponsorName}</span>
                </div>
              </div>
            ) : (
              /* Idle State */
              <div className="space-y-3">
                <Gift className="w-12 h-12 text-[#003A8C] dark:text-lime-400 mx-auto opacity-70" />
                <h3 className="text-xl sm:text-2xl font-bold text-slate-700 dark:text-slate-200">
                  Pronto para realizar o próximo sorteio!
                </h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  {eligibleParticipants.length} participantes aptos para concorrer a este brinde.
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            {activeWinnerData ? (
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => handleSendWhatsApp(activeWinnerData)}
                  className="flex-1 sm:flex-initial px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all hover:scale-[1.02]"
                >
                  <MessageSquare className="h-4 w-4" /> Notificar no WhatsApp
                </button>
                <button
                  onClick={handleStartDraw}
                  className="px-4 py-3 rounded-2xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-2 transition-all"
                >
                  <RotateCcw className="h-4 w-4" /> Sortear Outro Nome
                </button>
              </div>
            ) : (
              <div className="w-full sm:w-auto flex-1">
                <button
                  onClick={handleStartDraw}
                  disabled={isDrawing || eligibleParticipants.length === 0}
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#003A8C] hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-extrabold flex items-center justify-center gap-2.5 shadow-xl shadow-blue-900/20 transition-all hover:scale-[1.02] cursor-pointer"
                >
                  <Shuffle className="h-5 w-5" />
                  {isDrawing ? 'Sorteando...' : 'Sortear Nome Agora'}
                </button>
              </div>
            )}

            <span className="text-xs text-slate-400">
              {winners.length} {winners.length === 1 ? 'brinde sorteado' : 'brindes sorteados'} até o momento
            </span>
          </div>
        </div>
      </div>

      {/* Winners History Table */}
      <div className="bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Trophy className="h-5 w-5 text-amber-500" /> Histórico de Participantes Sorteados
              </h3>
              {isCloudSynced === true && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  <Cloud className="h-3.5 w-3.5 text-emerald-500" /> Salvo na Nuvem (Supabase)
                </span>
              )}
              {isCloudSynced === false && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800" title="Execute supabase_raffle_setup.sql no Supabase para ativar a sincronização na nuvem">
                  <HardDrive className="h-3.5 w-3.5 text-amber-500" /> Salvo Localmente (Offline-First)
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Relação de todos os nomes premiados durante o evento para controle e entrega.
            </p>
          </div>

          {winners.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportCsv}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-2 transition-colors"
              >
                <Download className="h-3.5 w-3.5" /> Exportar CSV
              </button>
              <button
                onClick={handleClearHistory}
                className="px-3 py-2 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-xs font-bold flex items-center gap-1.5 transition-colors"
                title="Limpar histórico"
              >
                <Trash2 className="h-3.5 w-3.5" /> Limpar
              </button>
            </div>
          )}
        </div>

        {winners.length === 0 ? (
          <div className="py-12 text-center text-slate-400 space-y-2">
            <Gift className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700" />
            <p className="text-xs">Nenhum brinde foi sorteado ainda. Os nomes sorteados aparecerão aqui.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Nome do Sorteado</th>
                  <th className="py-3 px-4">Pet</th>
                  <th className="py-3 px-4">Brinde</th>
                  <th className="py-3 px-4">Patrocinador</th>
                  <th className="py-3 px-4">Horário</th>
                  <th className="py-3 px-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {winners.map((w, idx) => (
                  <tr key={w.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                      {w.tutorName}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                      🐾 {w.petName}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-[#003A8C] dark:text-lime-400">
                      🎁 {w.prizeName}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-medium">
                      {w.sponsorName}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {w.wonAt}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleSendWhatsApp(w)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold text-[11px] transition-colors"
                      >
                        <MessageSquare className="h-3.5 w-3.5" /> WhatsApp
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
