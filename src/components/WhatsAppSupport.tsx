'use client';

import React from 'react';

export default function WhatsAppSupport() {
  const phoneNumber = '5598984174878';
  const defaultMessage = encodeURIComponent('Olá! Preciso de suporte referente à Cãominhada Pet Salute 2026.');
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${defaultMessage}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar com suporte via WhatsApp"
      className="fixed bottom-6 right-6 z-50 group flex items-center gap-3 bg-[#25D366] hover:bg-[#20bd5a] text-white p-3.5 sm:px-5 sm:py-3.5 rounded-full shadow-2xl hover:shadow-emerald-500/40 transition-all duration-300 transform hover:scale-105 active:scale-95 border-2 border-white/20"
    >
      {/* Animated Pulse Outer Ring */}
      <span className="absolute -inset-1 rounded-full bg-[#25D366] opacity-40 group-hover:opacity-75 blur-sm transition duration-500 animate-pulse pointer-events-none" />

      {/* WhatsApp SVG Icon */}
      <svg
        className="w-6 h-6 sm:w-7 sm:h-7 fill-current relative z-10 shrink-0"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
      </svg>

      {/* Button Text */}
      <div className="relative z-10 hidden sm:flex flex-col items-start leading-none">
        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-100 opacity-90">
          Suporte Pet Salute
        </span>
        <span className="text-xs font-extrabold tracking-wide text-white mt-0.5">
          Falar no WhatsApp
        </span>
      </div>

      {/* Mobile Badge / Tooltip */}
      <span className="absolute -top-9 right-0 bg-slate-900/90 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-1 rounded-md shadow-lg border border-slate-700 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none sm:hidden">
        Suporte (98) 98417-4878
      </span>
    </a>
  );
}
