import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Copy, Check, Download, Share2, Clipboard, HeartCrack, Heart } from "lucide-react";
import { TornPaper } from "../types";

interface ShareCardProps {
  paper: TornPaper | null;
  onClose: () => void;
  onToggleFavorite?: (id: string) => void;
  isFavorite?: boolean;
}

export default function ShareCard({
  paper,
  onClose,
  onToggleFavorite,
  isFavorite = false,
}: ShareCardProps) {
  const [copied, setCopied] = useState(false);

  if (!paper) return null;

  const handleCopyText = async () => {
    try {
      const shareText = `「${paper.content}」 —— ${paper.author}${paper.source ? ` 来自${paper.source}` : ""}\n\n (摘自《每日一语》印票 No.${String(paper.index).padStart(3, "0")})`;
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-neutral-900/85 backdrop-blur-sm"
          onClick={onClose}
          id="share-backdrop"
        />

        {/* Floating Paper Panel */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 30 }}
          transition={{ type: "spring", damping: 20 }}
          className="relative w-full max-w-sm bg-stone-50 text-neutral-800 rounded-2xl shadow-2xl p-6 flex flex-col border border-[#ebd9c4]/50 select-text overflow-hidden"
          id="share-card-container"
        >
          {/* Aesthetic retro grain background */}
          <div className="absolute inset-0 retro-grain opacity-80 pointer-events-none" />

          {/* Aesthetic stamp illustration in background */}
          <div className="absolute right-6 top-16 w-20 h-20 rounded-full border border-dashed border-[#8c6d4f]/25 flex items-center justify-center rotate-12 pointer-events-none">
            <span className="font-serif text-[10px] text-[#8c6d4f]/35 font-bold tracking-widest leading-none text-center uppercase">
              SELECTED
              <br />
              {paper.dateStr.replace(".0", ".")}
            </span>
          </div>

          {/* Header metadata row */}
          <div className="flex justify-between items-center border-b border-[#e1d5c5] pb-4 mb-5 text-[10px] font-mono text-[#5c4033]/60 italic font-semibold">
            <span>DAILY WHISPER TICKETS</span>
            <span>NO. {String(paper.index).padStart(3, "0")}</span>
          </div>

          {/* Main Paper Receipt Body */}
          <div className="flex-1 font-serif py-3 px-1 text-center tracking-wide leading-relaxed">
            {/* Ink-stamp logo */}
            <div className="mb-6 flex justify-center items-center">
              <div className="border border-double border-[#8c6d4f] px-3 py-1 font-semibold text-xs text-[#8c6d4f] tracking-widest">
                每日一语
              </div>
            </div>

            {/* Today's Quote Content in Beautiful serif font */}
            <p className="text-[#3c2a21] text-lg font-medium leading-loose whitespace-pre-wrap px-2">
              “ {paper.content} ”
            </p>

            {/* Author Attribution */}
            <div className="mt-6 flex justify-center items-center gap-1.5 text-xs text-stone-500 font-serif">
              <span className="w-4 h-[1px] bg-[#d3bc9b]" />
              <span className="font-semibold text-[#8c6d4f]">{paper.author}</span>
              {paper.source && (
                <span className="text-stone-400 italic font-normal">
                  《{paper.source.replace(/[《》]/g, "")}》
                </span>
              )}
              <span className="w-4 h-[1px] bg-[#d3bc9b]" />
            </div>

            {/* Printed Timestamp metadata */}
            <div className="mt-10 border-t border-dashed border-[#ebd9c4] pt-4 flex flex-col justify-center items-center text-[10px] font-mono text-neutral-400">
              <p className="font-semibold">PRINT DATE: {paper.dateStr}</p>
              <p className="mt-0.5">CHRONO-ID: {paper.id.substring(0, 8).toUpperCase()}</p>
            </div>
          </div>

          {/* Barcode representation */}
          <div className="mt-6 flex flex-col items-center justify-center opacity-85 select-none shrink-0">
            <div className="flex h-7 items-end gap-0.5" title="Aesthetic barcode">
              {[1,3,1,2,4,1,1,2,1,3,1,2,1,1,4,1,2,1,3,1,1,2,1,4,1,3,1].map((w, idx) => (
                <div 
                  key={idx} 
                  className="bg-neutral-800" 
                  style={{ width: `${w * 1}px`, height: idx % 3 === 0 ? '100%' : '85%' }} 
                />
              ))}
            </div>
            <p className="text-[8px] font-mono tracking-[4px] mt-1 text-stone-500 font-semibold">
              * DAILY WHISPER *
            </p>
          </div>

          {/* Button Interactivity Panel - Only 'Exit' button as requested */}
          <div className="mt-6 border-t border-[#e1d5c5] pt-4 flex flex-col shrink-0 select-none">
            <button
              id="share-dismiss-btn"
              onClick={onClose}
              className="w-full py-2.5 px-4 rounded-lg bg-[#0abab5] hover:bg-[#079c98] text-white shadow-sm font-serif font-medium text-center text-xs tracking-wider transition active:scale-98 hover:shadow-md cursor-pointer"
            >
              退出
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
