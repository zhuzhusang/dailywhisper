import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { BookOpen, Trash2, Calendar, Clipboard, Share2, Search, ArrowLeft, Heart } from "lucide-react";
import { TornPaper } from "../types";

interface CollectionsProps {
  isOpen: boolean;
  onClose: () => void;
  favorites: TornPaper[];
  onDeleteFavorite: (id: string) => void;
  onViewPaper: (paper: TornPaper) => void;
}

export default function Collections({
  isOpen,
  onClose,
  favorites,
  onDeleteFavorite,
  onViewPaper,
}: CollectionsProps) {
  const [search, setSearch] = useState("");

  const filtered = favorites.filter(
    (f) =>
      f.content.toLowerCase().includes(search.toLowerCase()) ||
      (f.author ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (f.source ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-neutral-900 z-40"
            onClick={onClose}
            id="collections-backdrop"
          />

          {/* Book / Notebook Body */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 180 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-[#f6faf9] text-neutral-800 shadow-2xl z-50 flex flex-col border-l border-[#0abab5]/20 font-serif"
            id="collections-ledger"
          >
            {/* Soft ambient grain overlay */}
            <div className="absolute inset-0 retro-grain opacity-60 pointer-events-none" />

            {/* Header with wood/leather trim look */}
            <div className="bg-[#03837e] text-white px-6 py-5 flex items-center gap-3 shrink-0 relative shadow-sm">
              <button
                id="collections-back-btn"
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 text-[#d8f8f7] transition"
              >
                <ArrowLeft size={18} />
              </button>
              <div>
                <h2 className="text-lg font-semibold tracking-wide flex items-center gap-2 text-[#d8f8f7]">
                  <BookOpen size={18} className="text-[#d8f8f7]" /> 时光留金簿 · 收藏
                </h2>
                <p className="text-[10px] text-[#d8f8f7]/75 font-serif italic mt-0.5">
                  The Literary Journal / Pins of Time
                </p>
              </div>
            </div>

            {/* Subheader summary stats */}
            <div className="px-6 py-3 bg-[#bfeeed]/30 border-b border-[#0abab5]/10 text-xs text-[#065c59] flex justify-between items-center shrink-0">
              <span>已收录的灵魂句子数</span>
              <span className="font-mono font-bold bg-[#0abab5]/10 px-2 py-0.5 rounded-full text-xs">
                {favorites.length} 张
              </span>
            </div>

            {/* Filter */}
            <div className="px-6 py-3 border-b border-[#0abab5]/10 shrink-0">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  id="collections-search"
                  type="text"
                  placeholder="探索印刻在心底的词句..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-[#0abab5]/15 rounded-full text-xs bg-white focus:outline-none focus:border-[#0abab5] font-serif"
                />
              </div>
            </div>

            {/* Collection journal list */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
              {filtered.length > 0 ? (
                filtered.map((paper, idx) => (
                  <motion.div
                    key={paper.id}
                    id={`fav-item-${paper.id}`}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    className="relative bg-white border border-[#e1d5c5] rounded-xl p-4 shadow-sm hover:shadow-md transition cursor-pointer group"
                    onClick={() => onViewPaper(paper)}
                  >
                    {/* Tiny antique pinned stamp detail */}
                    <div className="absolute right-3 top-3 flex items-center gap-1">
                      <span className="font-mono text-[9px] text-[#08837f]/60 font-semibold">
                        No. {String(paper.index).padStart(3, "0")}
                      </span>
                    </div>

                    <div className="space-y-3">
                      {/* Quote Text Preview */}
                      <p className="font-serif text-sm leading-relaxed text-[#3a2e2b] line-clamp-3 italic pr-4">
                        “ {paper.content} ”
                      </p>

                      {/* Author Line */}
                      <div className="flex items-center justify-between text-xs font-serif border-t border-[#bfeeed]/40 pt-2.5">
                        <div className="flex items-center gap-1.5 text-stone-500">
                          <Calendar size={11} className="text-[#099c98]" />
                          <span className="text-[10px] font-mono">{paper.dateStr}</span>
                          {paper.author && (
                            <span className="text-[10px] font-semibold text-[#08837f]">· {paper.author}</span>
                          )}
                        </div>

                        {/* Action buttons on hover/scroll */}
                        <div className="flex items-center gap-1.5">
                          <button
                            id={`fav-del-btn-${paper.id}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm("确定要删除这张珍藏的诗意纸片吗？")) {
                                onDeleteFavorite(paper.id);
                              }
                            }}
                            className="p-1 px-2 rounded-md hover:bg-red-50 text-[#08837f] hover:text-red-700 transition flex items-center gap-1 text-[10px]"
                            title="撕掉本页"
                          >
                            <Trash2 size={11} />
                            <span>移除</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-20 border border-dashed border-[#0abab5]/20 bg-stone-50/50 rounded-2xl flex flex-col items-center justify-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-[#bfeeed]/30 flex items-center justify-center text-stone-400">
                    <Heart size={20} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-neutral-500">留金簿空空如也</p>
                    <p className="text-[11px] text-neutral-400 max-w-[200px] leading-relaxed mx-auto">
                      点击打字机上的「印制」按钮并撕下纸条，每一份温润文字都会自动保存记录在册。
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Ledger footer design */}
            <div className="px-6 py-4 border-t border-[#bfeeed] text-center bg-[#f0faf9] text-[10px] text-stone-400 font-serif">
              “ 记录有温度的文字，留住时间的倒影 ”
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
