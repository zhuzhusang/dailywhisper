import React, { useState, useEffect } from "react";
import { motion, useAnimation, AnimatePresence } from "motion/react";
import { Scissors, RefreshCw, Volume2, VolumeX, Sparkles, HelpCircle } from "lucide-react";
import { Quote, TornPaper } from "../types";
import { playClickSound, startPrinterSound, stopPrinterSound, playTearSound } from "../utils/audio";

interface PrinterProps {
  currentQuote: Quote | null;
  onTear: (paper: TornPaper) => void;
  simulatedDateStr: string;
  onPrintAnotherRandom: () => void;
  isCustomQuote: boolean;
  totalActiveCount: number;
}

export default function Printer({
  currentQuote,
  onTear,
  simulatedDateStr,
  onPrintAnotherRandom,
  isCustomQuote,
  totalActiveCount,
}: PrinterProps) {
  const [printStatus, setPrintStatus] = useState<"idle" | "printing" | "printed" | "torn">("idle");
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [paperIndex, setPaperIndex] = useState(42);
  const [printType, setPrintType] = useState<"daily" | "inspiration">("daily");
  
  const controls = useAnimation();

  useEffect(() => {
    const counts = localStorage.getItem("whisper_print_count_v1");
    if (counts) {
      setPaperIndex(parseInt(counts, 10));
    } else {
      setPaperIndex(0);
    }
  }, []);

  // Clean up sound on unmount
  useEffect(() => {
    return () => {
      stopPrinterSound();
    };
  }, []);

  const handlePrint = async () => {
    if (printStatus === "printing") return;

    if (audioEnabled) {
      playClickSound();
    }

    setPrintStatus("printing");

    // Decouple to find out if it's today's main quote or an inspiration
    // If we already had printed and deleted/reset, or if they manually refresh
    
    if (audioEnabled) {
      // Small delay before starting mechanical print sound
      setTimeout(() => {
        if (printStatus !== "printed") {
          startPrinterSound();
        }
      }, 150);
    }

    // Vibration/shake feedback of the printer body is disabled as requested
    controls.start({
      x: 0,
      y: 0,
      transition: { duration: 0.1 }
    });

    // Slow feed scrolling paper animation is handled by motion.div below
    setTimeout(() => {
      stopPrinterSound();
      setPrintStatus("printed");
    }, 3200);
  };

  const handleTear = () => {
    if (!currentQuote) return;
    
    if (audioEnabled) {
      playTearSound();
    }

    const currentCount = paperIndex;
    const torn: TornPaper = {
      id: "paper_" + Math.random().toString(36).substring(2, 11),
      quoteId: currentQuote.id,
      content: currentQuote.content,
      author: currentQuote.author,
      source: currentQuote.source,
      printedAt: Date.now(),
      dateStr: simulatedDateStr.replace(/-/g, "."),
      index: currentCount,
    };

    const nextCount = currentCount + 1;
    setPaperIndex(nextCount);
    localStorage.setItem("whisper_print_count_v1", String(nextCount));

    setPrintStatus("torn");
    // Call parent handler
    onTear(torn);

    // Reset back to idle after tear so they can print again
    setTimeout(() => {
      setPrintStatus("idle");
    }, 300);
  };

  const toggleSound = () => {
    setAudioEnabled(!audioEnabled);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full" id="printer-root-box">

      {/* STUNNING VINTAGE PRINTER ILLUSTRATIVE BOX */}
      <div className="real-printer-stage relative w-full max-w-[360px] flex flex-col items-center select-none" id="printer-body-wrapper">
        
        {/* UPPER MACHINE SHADOW BASE */}
        <div className="real-machine-cast-shadow absolute -top-3 w-5/6 h-5 bg-[#0e2c2a]/15 blur-md rounded-full pointer-events-none" />

        {/* --- EXQUISITE TYPEWRITER CASING (Inspired by Hermes 3000) --- */}
        <motion.div
          animate={controls}
          className="real-printer-chassis relative w-full h-[238px] rounded-t-[56px] rounded-b-[34px] border-x-[16px] border-t-[14px] flex flex-col justify-start p-4 z-20 overflow-visible"
          id="printer-chassis"
        >
          {/* SKEUOMORPHIC 3D SIDE BULGES (Cast metallic rounded retro outline for premium curvature) */}
          <div className="real-side-cowl real-side-cowl-left absolute -left-[22px] top-[42px] bottom-[20px] w-[24px] rounded-l-[28px] pointer-events-none z-10" />
          <div className="real-side-cowl real-side-cowl-right absolute -right-[22px] top-[42px] bottom-[20px] w-[24px] rounded-r-[28px] pointer-events-none z-10" />

          {/* SKEUOMORPHIC SHINES & HIGHLIGHTS */}
          {/* Glass Specular Reflection on top curve */}
          <div className="absolute inset-x-8 top-[1px] h-[34px] bg-gradient-to-b from-white/45 via-white/5 to-transparent rounded-t-[32px] pointer-events-none z-15" />
          {/* Vertical hardware shine on left edge */}
          <div className="absolute left-[2px] top-2 bottom-2 w-[6px] bg-gradient-to-r from-white/35 to-transparent pointer-events-none z-15" />
          {/* Shadow on right edge */}
          <div className="absolute right-[2px] top-2 bottom-2 w-[6px] bg-black/25 pointer-events-none z-15" />
          
          {/* Typwriter Metal Carriage / Paper Guide bar */}
          <div className="real-carriage absolute -top-8 left-2 right-2 h-9 rounded-t-lg border-x border-[#054c4a] z-5 flex items-center justify-between px-3">
            {/* Fine metal ruler lines to align page */}
            <div className="w-18 h-[1px] bg-stone-500/50 flex justify-between">
              {[...Array(6)].map((_, i) => (
                <span key={i} className="w-[1px] h-2 bg-stone-700/80" />
              ))}
            </div>
            
            {/* Typwriter Paper Carrier center clip in Chrome */}
            <div className="real-center-plate w-8 h-5 rounded-b shadow font-mono text-[7px] text-stone-900 font-bold flex items-center justify-center border-t border-stone-100/45">
              3000
            </div>

            <div className="w-18 h-[1px] bg-[#005d59]/20 flex justify-between">
              {[...Array(6)].map((_, i) => (
                <span key={i} className="w-[1px] h-2 bg-stone-700/80" />
              ))}
            </div>
          </div>

          {/* Majestic silver paper advance lever (Chrome arm) with 3D shadows */}
          <div 
            className="real-return-arm absolute -left-[31px] -top-5 w-12 h-16 rounded-r-full z-25 origin-right cursor-pointer hover:-rotate-3 active:scale-95 transition"
            title="Line space paper return arm"
            onClick={toggleSound}
          >
            {/* Fine joint grip and shadow */}
            <div className="absolute top-0 right-0 w-3.5 h-3.5 bg-gradient-to-b from-stone-600 to-stone-800 rounded-full border border-stone-500" />
            <div className="absolute bottom-2 left-2 w-7 h-2 bg-stone-500 rounded shadow" />
          </div>

          {/* Top panel bezel */}
          <div className="real-top-deck flex justify-between items-center pb-2.5 pt-1.5 select-none z-10">
            {/* Beautiful Magical Incantation Badge (Skeuomorphic cream porcelain badge with golden borders) */}
            <div className="real-brand-badge px-3 py-1 rounded-md text-[10px] text-[#2c3d35] font-serif font-bold tracking-[2px] scale-90 origin-left flex items-center gap-1">
              <span className="text-[#c9b793]">✿</span>
              <span className="text-teal-900 drop-shadow-[0_0.5px_0_rgba(255,255,255,0.5)] font-bold">WHISPER 3000</span>
              <span className="text-[#c9b793]">✿</span>
            </div>
            
            {/* Skeuomorphic glowing indicator light */}
            <div className="real-status-pill flex items-center gap-2 px-2.5 py-1 rounded-full">
              <span className="text-[7.5px] font-mono text-cyan-200/90 font-extrabold uppercase tracking-wide">ONLINE</span>
              <div 
                className={`w-2.5 h-2.5 rounded-full border border-neutral-900 transition-all duration-300 relative ${
                  printStatus === "printing" 
                    ? "bg-amber-400 shadow-[0_0_12px_#fbbf24,inset_0_1px_1px_rgba(255,255,255,0.6)]" 
                    : "bg-[#10b981] animate-[pulse_1.5s_infinite] shadow-[0_0_10px_#10b981,inset_0_1px_1px_rgba(255,255,255,0.7)]"
                }`} 
                title="Status indicator bulb"
              >
                {/* Lit hot spot center */}
                <span className="absolute top-0.5 left-0.5 w-1 h-1 bg-white/85 rounded-full pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Machine side rotary scroll wheels (metallic platen cylinders with ribbed handles and 3D end guards) */}
          <div className="real-platen-knob absolute -left-[30px] top-11 w-5 h-10 hover:scale-105 rounded-l cursor-pointer transform rotate-180 flex flex-col justify-between py-1 px-[2.5px] z-30" title="Platen knob left">
            {[...Array(6)].map((_, i) => <div key={i} className="w-full h-[1.5px] bg-neutral-600 rounded-full" />)}
          </div>
          <div className="real-platen-knob absolute -right-[30px] top-11 w-5 h-10 hover:scale-105 rounded-r cursor-pointer flex flex-col justify-between py-1 px-[2.5px] z-30" title="Platen knob right">
            {[...Array(6)].map((_, i) => <div key={i} className="w-full h-[1.5px] bg-neutral-600 rounded-full" />)}
          </div>

          {/* Elegant curved metallic Segment Basket / typing head reservoir with 3D depth inset shadow */}
          <div className="real-typebasket w-11/12 h-11 mx-auto rounded-b-2xl flex justify-center items-end pb-1.5 overflow-hidden z-10">
            {/* Fine vertical strike arms (the metal segment guides) */}
            <div className="flex gap-[3.5px] select-none scale-y-80 transform origin-bottom">
              {[...Array(16)].map((_, idx) => {
                const angle = (idx - 7.5) * 5.2;
                return (
                  <div 
                    key={idx} 
                    style={{ transform: `rotate(${angle}deg)` }} 
                    className="w-[2.5px] h-7 bg-gradient-to-b from-stone-300 via-stone-400 to-stone-500 rounded-t shadow-sm border-t border-white/20"
                  />
                );
              })}
            </div>
          </div>

          {/* --- PAPER OUTLET SLOT (Deeps of the machine) --- */}
          <div className="real-paper-slot relative w-full h-[38px] rounded-lg flex justify-center z-30 mt-2" id="paper-mouth-slit">
            {/* Shiny silver tear blade guard bar */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-b from-stone-200 via-stone-400 to-stone-500 border-b border-zinc-950 shadow-[0_1px_2px_rgba(0,0,0,0.4)] rounded-t-sm opacity-95 z-40 flex items-center justify-center">
              {/* Fine etched steel segment */}
              <div className="w-5/6 h-[1px] bg-stone-600/50" />
            </div>

            {/* PAPER SPOOL ESCAPE ANIMATION */}
            <AnimatePresence>
              {(printStatus === "printing" || printStatus === "printed") && currentQuote && (
                <motion.div
                  key={currentQuote.id}
                  id="printed-paper-tape"
                  initial={{ height: 0, opacity: 1, y: 3 }}
                  animate={{ 
                    height: "auto",
                    y: 4
                  }}
                  exit={{ 
                    y: 120, 
                    opacity: 0, 
                    height: 0,
                    transition: { duration: 0.3 } 
                  }}
                  style={{ overflow: "hidden" }}
                  transition={{ 
                    height: { duration: 3.0, ease: "linear" } 
                  }}
                  className="real-receipt absolute top-0 w-11/12 origin-top text-stone-800 rounded-b-sm border-x border-b border-stone-300 shadow-xl p-4 flex flex-col z-10 select-none cursor-default"
                >
                  {/* Parchment background grain */}
                  <div className="absolute inset-0 retro-grain opacity-85 pointer-events-none" />

                  {/* Red/Brown border margins inside receipt */}
                  <div className="flex-1 border-t border-dashed border-[#e1d5c5] pt-3 text-center flex flex-col items-center">
                    
                    {/* Retro Stamp Header */}
                    <div className="text-[9px] font-mono tracking-widest text-[#08837f] font-semibold italic mt-1 leading-none shrink-0">
                      DAILY WHISPER TICKET
                    </div>
                    {/* Simulated Printed Stamp */}
                    <div className="border border-double border-[#0abab5]/40 px-2 py-0.5 rounded text-[8px] tracking-[3px] text-[#0abab5]/70 font-semibold mt-2 shrink-0">
                      文学印记
                    </div>

                    {/* Sequential ticket numbering */}
                    <p className="text-[8px] font-mono text-stone-400 mt-2.5 tracking-wider shrink-0">
                      TICKET NO. {String(paperIndex).padStart(3, "0")}
                    </p>

                    {/* Today's printed Quote content - scrolls line by line in height transition */}
                    <div className="my-5 w-full shrink-0">
                      <p className="font-serif text-sm font-semibold leading-relaxed text-[#3a2e2b] text-center tracking-wide px-1 whitespace-pre-wrap animate-[fadeIn_0.5s_ease-out]">
                        {currentQuote.content}
                      </p>
                    </div>

                    {/* Author Attribution */}
                    {(currentQuote.author || currentQuote.source) && (
                      <p className="text-[11px] font-serif text-[#08837f] font-bold tracking-wider shrink-0">
                        {currentQuote.author ? `—— ${currentQuote.author} ` : ""}
                        {currentQuote.source ? `《${currentQuote.source.replace(/[《》]/g, "")}》` : ""}
                      </p>
                    )}

                    {/* Print time & dates */}
                    <p className="text-[8px] font-mono text-stone-400 mt-6 tracking-widest uppercase shrink-0">
                      {simulatedDateStr.replace(/-/g, ".")} · PRINTED
                    </p>

                    {/* Aesthetic Scissor line placeholder or actual tear trigger */}
                    <div className="w-full mt-6 border-t border-dashed border-stone-300 relative shrink-0">
                      <div className="absolute left-1/2 -top-2 -translate-x-1/2 bg-[#faf8f4] px-2 text-[9px] text-[#08837f] flex items-center gap-1 font-serif">
                        <Scissors size={10} className="rotate-270" />
                        <span>沿虚线撕下纸条</span>
                      </div>
                    </div>

                    {/* REAL ACTIVE TEAR TRIGGER (Only when printed) */}
                    <div className="w-full mt-5 shrink-0">
                      {printStatus === "printed" ? (
                        <button
                          id="btn-tear-tape-trigger"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTear();
                          }}
                          className="w-full py-2 bg-[#0abab5]/10 border border-[#0abab5]/20 hover:bg-[#0abab5] hover:text-white rounded font-serif text-xs px-3 text-[#076461] tracking-wider transition flex items-center justify-center gap-1.5 font-bold cursor-pointer hover:shadow-md"
                        >
                          <Scissors size={12} />
                          <span>撕下此张语录</span>
                        </button>
                      ) : (
                        <div className="text-[9px] text-stone-400 font-serif flex items-center justify-center gap-1 animate-pulse">
                          <span>正在刻字中，请稍候...</span>
                        </div>
                      )}
                    </div>

                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </motion.div>

        {/* PRINTER BOTTOM DECORATION BED */}
        <div className="real-printer-base w-11/12 h-[42px] rounded-b-[24px] z-10 flex items-center justify-center">
          {/* Typwriter bottom space bar lever bar decoration */}
          <div className="w-2/3 h-2.5 bg-gradient-to-b from-stone-200 via-stone-400 to-stone-500 rounded-full shadow border-y border-stone-500 flex items-center justify-center" />
        </div>

        {/* --- PRINT BUTTON ANIMATED PORTAL: DISAPPEARS AFTER PRESS, REAPPEARS AFTER TEAR/RESET --- */}
        <div className="overflow-visible w-full flex flex-col items-center">
          <AnimatePresence mode="wait">
            {printStatus === "idle" ? (
              <motion.div
                key="print-activation-dashboard"
                initial={{ opacity: 0, scale: 0.9, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.85, y: -10 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="mt-8 flex flex-col items-center gap-1 z-30"
                id="tactile-button-deck"
              >
                {/* Huge circular physical press button */}
                <motion.button
                  id="main-print-trigger-btn"
                  onClick={handlePrint}
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.94 }}
                  className="real-print-button w-[78px] h-[78px] rounded-full flex flex-col items-center justify-center transition border-[5px] focus:outline-none cursor-pointer text-[#f7fdfa]"
                  title="开启印制"
                >
                  <div className="font-serif text-sm font-bold tracking-wider">
                    印制
                  </div>
                  <div className="text-[8px] font-mono uppercase tracking-[2px] mt-0.5 opacity-90">
                    PRINT
                  </div>
                </motion.button>
              </motion.div>
            ) : printStatus === "printing" ? (
              <motion.div
                key="print-mechanical-running"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mt-8 flex flex-col items-center"
              >
                <div className="w-12 h-12 rounded-full border-2 border-dashed border-[#0abab5] flex items-center justify-center bg-white shadow-sm">
                  <RefreshCw size={18} className="text-[#076461] animate-spin" />
                </div>
                <p className="text-[11px] text-[#076461] font-serif mt-3 tracking-widest animate-pulse font-semibold">
                  ⚙️ 印刷齿轮运转中 · 逐字剔刻...
                </p>
              </motion.div>
            ) : (
              // printed state showing nice hints to tear paper
              <motion.div
                key="print-completed-tear-notice"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-8 text-center px-6 max-w-xs"
              >
                <div className="inline-flex items-center gap-1 px-3 py-1 bg-[#0abab5]/10 rounded-full border border-[#0abab5]/25 text-[11px] text-[#076461] font-serif font-bold mb-2">
                  <Scissors size={10} />
                  <span>请向上提起并撕下纸条</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
