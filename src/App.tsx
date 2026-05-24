import React, { useState, useEffect } from "react";
import { Quote, TornPaper } from "./types";
import { defaultQuotes } from "./defaultQuotes";
import Printer from "./components/Printer";
import AdminDrawer from "./components/AdminDrawer";
import Collections from "./components/Collections";
import ShareCard from "./components/ShareCard";
import { BookOpen, Settings, Info, Heart, Calendar, HelpCircle, AlignLeft } from "lucide-react";

const getDeviceDateString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function App() {
  // Quotes Database State
  const [quotes, setQuotes] = useState<Quote[]>([]);
  // Device date is used by default; the picker still lets users preview another day.
  const [simulatedDate, setSimulatedDate] = useState(getDeviceDateString);
  // Collected / Favorite torn list state
  const [favorites, setFavorites] = useState<TornPaper[]>([]);
  
  // Printed history state (tracks printed quote IDs so they are not repeated)
  const [printedQuoteIds, setPrintedQuoteIds] = useState<string[]>([]);
  // Current quote loaded in the typewriter
  const [currentQuoteId, setCurrentQuoteId] = useState<string | null>(null);

  // Layout drawers toggles
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isCollectionsOpen, setIsCollectionsOpen] = useState(false);
  const [activeSharePaper, setActiveSharePaper] = useState<TornPaper | null>(null);
  
  // Helpful Help Drawer
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // Initialize Quotes, Favorites, Printed History, and Current Quote from localStorage
  useEffect(() => {
    // 1. Initialise Quotes list
    const storedQuotes = localStorage.getItem("whisper_quotes_v1");
    let activeList: Quote[] = [];
    if (storedQuotes) {
      try {
        const parsed = JSON.parse(storedQuotes);
        setQuotes(parsed);
        activeList = parsed.filter((q: Quote) => q.enabled);
      } catch (e) {
        setQuotes(defaultQuotes);
        activeList = defaultQuotes.filter((q) => q.enabled);
      }
    } else {
      localStorage.setItem("whisper_quotes_v1", JSON.stringify(defaultQuotes));
      setQuotes(defaultQuotes);
      activeList = defaultQuotes.filter((q) => q.enabled);
    }

    // 2. Initialise Favorites (Collected)
    const storedFavs = localStorage.getItem("whisper_favs_v1");
    if (storedFavs) {
      try {
        setFavorites(JSON.parse(storedFavs));
      } catch (e) {
        setFavorites([]);
      }
    }

    // 3. Initialise Printed History
    const storedPrinted = localStorage.getItem("whisper_printed_ids_v1");
    let printedIds: string[] = [];
    if (storedPrinted) {
      try {
        printedIds = JSON.parse(storedPrinted);
        setPrintedQuoteIds(printedIds);
      } catch (e) {
        setPrintedQuoteIds([]);
      }
    }

    // 4. Initialise Current Quote ID
    const storedCurrentId = localStorage.getItem("whisper_current_quote_id_v1");
    if (storedCurrentId && activeList.some((q) => q.id === storedCurrentId)) {
      setCurrentQuoteId(storedCurrentId);
    } else if (activeList.length > 0) {
      // Pick a random unprinted quote to start
      const pool = activeList.filter((q) => !printedIds.includes(q.id));
      const startingPool = pool.length > 0 ? pool : activeList;
      const randomIdx = Math.floor(Math.random() * startingPool.length);
      const chosen = startingPool[randomIdx];
      if (chosen) {
        setCurrentQuoteId(chosen.id);
        localStorage.setItem("whisper_current_quote_id_v1", chosen.id);
      }
    }
  }, []);

  // Update quotes to storage
  const saveQuotesToStore = (updated: Quote[]) => {
    setQuotes(updated);
    localStorage.setItem("whisper_quotes_v1", JSON.stringify(updated));
  };

  // Helper to ensure currentQuoteId remains valid when database changes
  const ensureValidCurrentQuote = (updatedQuotes: Quote[]) => {
    const activeList = updatedQuotes.filter((q) => q.enabled);
    if (activeList.length === 0) {
      setCurrentQuoteId(null);
      localStorage.removeItem("whisper_current_quote_id_v1");
      return;
    }
    // If current quote is still active and valid, keep it
    if (currentQuoteId && activeList.some((q) => q.id === currentQuoteId)) {
      return;
    }
    // Pick another one
    const pool = activeList.filter((q) => !printedQuoteIds.includes(q.id));
    const startingPool = pool.length > 0 ? pool : activeList;
    const randomIdx = Math.floor(Math.random() * startingPool.length);
    const chosen = startingPool[randomIdx];
    if (chosen) {
      setCurrentQuoteId(chosen.id);
      localStorage.setItem("whisper_current_quote_id_v1", chosen.id);
    }
  };

  // Add a new quote (Config backstage helper)
  const handleAddQuote = (newQuoteData: Omit<Quote, "id" | "createdAt">) => {
    const fresh: Quote = {
      ...newQuoteData,
      id: "quote_" + Math.random().toString(36).substring(2, 11),
      createdAt: Date.now(),
    };
    const updated = [...quotes, fresh];
    saveQuotesToStore(updated);
    ensureValidCurrentQuote(updated);
  };

  // Delete quote
  const handleDeleteQuote = (id: string) => {
    const updated = quotes.filter((q) => q.id !== id);
    saveQuotesToStore(updated);
    ensureValidCurrentQuote(updated);
  };

  // Toggle enable/disable quote
  const handleToggleQuote = (id: string) => {
    const updated = quotes.map((q) => {
      if (q.id === id) {
        return { ...q, enabled: !q.enabled };
      }
      return q;
    });
    saveQuotesToStore(updated);
    ensureValidCurrentQuote(updated);
  };

  // Edit quote
  const handleEditQuote = (id: string, partial: Partial<Quote>) => {
    const updated = quotes.map((q) => {
      if (q.id === id) {
        return { ...q, ...partial };
      }
      return q;
    });
    saveQuotesToStore(updated);
    ensureValidCurrentQuote(updated);
  };

  // Restore Default curated system quotes
  const handleRestoreDefaults = () => {
    saveQuotesToStore(defaultQuotes);
    ensureValidCurrentQuote(defaultQuotes);
  };

  const activeQuotes = quotes.filter((q) => q.enabled);
  const displayedQuote = activeQuotes.find((q) => q.id === currentQuoteId) || activeQuotes[0] || null;

  // Save torn receipt into collection folder and automatically pre-load the next unprinted quote
  const handleSaveTear = (torn: TornPaper) => {
    const updatedFavs = [torn, ...favorites];
    setFavorites(updatedFavs);
    localStorage.setItem("whisper_favs_v1", JSON.stringify(updatedFavs));
    
    // Add to printed history
    const quoteId = torn.quoteId;
    let nextPrintedIds = [...printedQuoteIds];
    if (!nextPrintedIds.includes(quoteId)) {
      nextPrintedIds.push(quoteId);
      setPrintedQuoteIds(nextPrintedIds);
      localStorage.setItem("whisper_printed_ids_v1", JSON.stringify(nextPrintedIds));
    }

    // Pick a new current quote ID for the next print!
    const pool = activeQuotes.filter((q) => !nextPrintedIds.includes(q.id) && q.id !== quoteId);
    let nextQuote: Quote | null = null;
    if (pool.length > 0) {
      const idx = Math.floor(Math.random() * pool.length);
      nextQuote = pool[idx];
    } else {
      // All quotes printed! Reset history but keep this one out of immediate next choice if possible
      const resetPool = activeQuotes.filter((q) => q.id !== quoteId);
      const startingPool = resetPool.length > 0 ? resetPool : activeQuotes;
      const idx = Math.floor(Math.random() * startingPool.length);
      nextQuote = startingPool[idx];
      
      setPrintedQuoteIds([]);
      localStorage.setItem("whisper_printed_ids_v1", JSON.stringify([]));
    }

    if (nextQuote) {
      setCurrentQuoteId(nextQuote.id);
      localStorage.setItem("whisper_current_quote_id_v1", nextQuote.id);
    }
    
    // Auto launch share zoomed board for review once they tear!
    setActiveSharePaper(torn);
  };

  // Remove torn paper from collection book
  const handleDeleteFavorite = (id: string) => {
    const updated = favorites.filter((f) => f.id !== id);
    setFavorites(updated);
    localStorage.setItem("whisper_favs_v1", JSON.stringify(updated));
    if (activeSharePaper?.id === id) {
      setActiveSharePaper(null);
    }
  };

  // Toggle / pin bookmark directly on the Card details
  const handleToggleCardFavorite = (id: string) => {
    const exists = favorites.some((f) => f.id === id);
    if (exists) {
      handleDeleteFavorite(id);
    } else {
      if (activeSharePaper) {
        handleSaveTear(activeSharePaper);
      }
    }
  };

  // Print another random quote trigger - excludes the current displayed quote to ensure variety!
  const handlePrintAnotherRandom = () => {
    if (activeQuotes.length === 0) return;
    
    // Find unprinted pool
    let pool = activeQuotes.filter((q) => !printedQuoteIds.includes(q.id) && q.id !== displayedQuote?.id);
    
    // If pool is empty, let's relax the printed constraint, but still exclude the current one
    if (pool.length === 0) {
      pool = activeQuotes.filter((q) => q.id !== displayedQuote?.id);
    }
    
    // If still empty (only 1 active quote), just use activeQuotes
    if (pool.length === 0) {
      pool = activeQuotes;
    }

    const randomIdx = Math.floor(Math.random() * pool.length);
    const chosen = pool[randomIdx];
    if (chosen) {
      setCurrentQuoteId(chosen.id);
      localStorage.setItem("whisper_current_quote_id_v1", chosen.id);
    }
  };

  // Format lovely date for local human displays (e.g. "2026年05月23日")
  const formatChineseDate = (dateStr: string) => {
    try {
      const parts = dateStr.split("-");
      if (parts.length === 3) {
        return `${parts[0]}年${parts[1]}月${parts[2]}日`;
      }
      return dateStr;
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="min-h-screen bg-[#f0faf9] text-stone-800 flex flex-col items-center justify-between overflow-x-hidden relative" id="app-viewport-root">
      
      {/* 1. Botanical Leaf and Tree shadows - Very elegant, semi-transparent grey-green silhouettes */}
      <div className="absolute top-0 right-0 w-[280px] h-[340px] pointer-events-none opacity-[0.06] select-none -z-10 transform scale-x-[-1] translate-x-10 -translate-y-8 blur-[1.5px]" title="Realistic leaf shadow projection">
        <svg viewBox="0 0 100 100" className="w-full h-full fill-teal-950">
          <path d="M10,90 Q30,60 50,20 Q60,40 55,55 Q63,30 75,10 Q68,45 60,60 Q75,55 90,45 Q70,70 50,80 Z" />
          <path d="M5,70 Q25,50 45,15 Q50,45 35,60 C48,40 65,30 80,15 C65,45 55,55 40,75 Z" />
        </svg>
      </div>
      <div className="absolute bottom-10 left-[-60px] w-[240px] h-[300px] pointer-events-none opacity-[0.05] select-none -z-10 rotate-[45deg] blur-[1px]" title="Botanical plant tree shadow">
        <svg viewBox="0 0 100 100" className="w-full h-full fill-teal-950">
          <path d="M15,95 Q40,65 55,25 Q58,55 45,70 Q60,45 78,20 Q65,60 55,75 Q75,70 92,60 Q75,85 50,90 Z" />
        </svg>
      </div>

      {/* Retro parchment paper grain background */}
      <div className="absolute inset-0 retro-grain opacity-[0.4] -z-15 pointer-events-none" />
      
      {/* 2. Top Header panel - Clean App Navigation with simple graphic icons */}
      <header className="w-full max-w-md mx-auto px-5 pt-6 flex items-center justify-between select-none shrink-0 z-30" id="app-mobile-header">
        <div className="flex items-center gap-1.5">
          <span className="text-xl">🖋️</span>
          <div className="flex flex-col">
            <h1 className="font-serif text-base tracking-[1px] text-stone-800 font-bold leading-none">
              每日一语
            </h1>
            <span className="font-mono text-[9px] text-[#0abab5] tracking-[1.5px] uppercase mt-0.5 font-bold">
              Daily Whisper
            </span>
          </div>
        </div>

        {/* Small simulated date banner */}
        <div className="flex items-center gap-3">
          {/* Calendar picker widget directly to let user select simulated system date */}
          <div className="flex items-center gap-1 bg-white/85 hover:bg-white border border-stone-200/80 rounded-full py-1 px-3 shadow-sm transition">
            <Calendar size={12} className="text-[#099c98]" />
            <input 
              type="date"
              value={simulatedDate}
              onChange={(e) => {
                setSimulatedDate(e.target.value);
              }}
              className="font-mono text-[10px] text-[#099c98] font-semibold bg-transparent border-none outline-none cursor-pointer w-20 text-center"
              title="模拟今日日期"
            />
          </div>

          <div className="flex items-center gap-1">
            {/* Nav Icon 1: 历史已撕藏品 ledger button with badges */}
            <button
              id="header-open-ledger-btn"
              onClick={() => setIsCollectionsOpen(true)}
              className="w-9 h-9 rounded-full bg-white/80 hover:bg-white border border-stone-200 flex items-center justify-center text-[#099c98] hover:text-[#0b7a77] shadow-sm hover:shadow active:scale-95 transition relative"
              title="时光留金簿 (历史已藏)"
            >
              <BookOpen size={16} />
              {favorites.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 border border-white text-white font-mono text-[8.5px] w-4 h-4 flex items-center justify-center rounded-full">
                  {favorites.length}
                </span>
              )}
            </button>

            {/* Nav Icon 2: 后台句库管理 settings/database admin button */}
            <button
              id="header-open-backstage-btn"
              onClick={() => setIsAdminOpen(true)}
              className="w-9 h-9 rounded-full bg-white/80 hover:bg-white border border-stone-200 flex items-center justify-center text-[#099c98] hover:text-[#0b7a77] shadow-sm hover:shadow active:scale-95 transition"
              title="字句词库后台"
            >
              <Settings size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* 3. MAIN WORKPLACE PLATFORM container */}
      <main className="w-full max-w-sm mx-auto px-4 py-4 flex-1 flex flex-col items-center justify-center relative z-10" id="main-desk-workspace">
        
        {/* Soft elegant warm morning light glow behind typewriter */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-cyan-200/10 blur-[90px] rounded-full pointer-events-none -z-10" />

        {activeQuotes.length > 0 ? (
          <Printer
            currentQuote={displayedQuote}
            onTear={handleSaveTear}
            simulatedDateStr={simulatedDate}
            onPrintAnotherRandom={handlePrintAnotherRandom}
            isCustomQuote={false}
            totalActiveCount={activeQuotes.length}
          />
        ) : (
          <div className="text-center p-8 bg-white border border-[#0abab5]/20 rounded-2xl shadow-sm text-stone-700">
            <p className="font-serif text-[#099c98] font-bold">暂无生效中的唯美句包</p>
            <p className="text-xs text-stone-400 mt-2 leading-relaxed">
              请点击右上角的「句库配置」图标，重新添加并开启句子，赋能打字机吐字！
            </p>
            <button
              onClick={() => setIsAdminOpen(true)}
              className="mt-4 px-4 py-2 bg-[#0abab5] hover:bg-[#078884] text-white text-xs rounded-lg font-serif transition shadow"
            >
              一键前往字库后台
            </button>
          </div>
        )}
      </main>

      {/* 4. Minimal bottom footer margin spacer (removed big desk bar as requested) */}
      <div className="py-4 pointer-events-none" />

      {/* --- DRAWERS AND OVERLAYS PANEL SECTION --- */}

      {/* Backdrop Help dialog tutorial overlay */}
      {isHelpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-neutral-900/75 backdrop-blur-xs" onClick={() => setIsHelpOpen(false)} />
          <div 
            className="relative bg-[#faf7f2] border-t-4 border-[#8c6d4f] text-neutral-800 rounded-2xl shadow-2xl p-6 w-full max-w-sm select-none font-serif relative"
            id="help-modal"
          >
            {/* Grainy canvas */}
            <div className="absolute inset-0 retro-grain opacity-80 pointer-events-none rounded-2xl" />

            <h3 className="text-lg font-semibold text-[#5c4033] border-b border-[#ebd9c4] pb-2 text-center mb-4">
              📜 每日一语 · 打字机使用指南
            </h3>

            <div className="space-y-4 text-xs text-stone-600 leading-relaxed max-h-[60vh] overflow-y-auto">
              <div>
                <p className="font-semibold text-neutral-800">1. 关于「今日一语」</p>
                <p className="mt-1">
                  打字机每天对应选择一句唯一的精选温暖语录。系统采用确定性的数学哈希函数，确保每天（自然日）都有全新、不重复的内容出厂印制。
                </p>
              </div>

              <div>
                <p className="font-semibold text-neutral-800">2. 自定义后台词海</p>
                <p className="mt-1">
                  点击右下角的「后台句库管理」，可呼唤出配置抽屉！在其中允许自由新增唯美金句，也可以单键禁用或精细修改，亦或点击重置一键恢复由古今名家汇集的文学精粹。
                </p>
              </div>

              <div>
                <p className="font-semibold text-neutral-800">3. 时光留金册 (收藏本)</p>
                <p className="mt-1">
                  打印好的收据纸，点击“撕下此张语录”，语录会自动掉入到您的「时光留金簿」并展现精美放大卡。在留金簿中您可以回望所有印刻过的文字，支持一键抄写复制与随时撕除。
                </p>
              </div>

              <div>
                <p className="font-semibold text-neutral-800">4. 时光漫游功能</p>
                <p className="mt-1">
                  在后台顶端的「时光漫游」日期选择器中，您可以随意模拟变动今天的日期，预览不同日历节点下出厂的每日一语。
                </p>
              </div>
            </div>

            <div className="mt-5 text-center">
              <button
                onClick={() => setIsHelpOpen(false)}
                className="px-6 py-2 bg-[#8c6d4f] hover:bg-[#7a5e42] text-white rounded-lg text-xs leading-none font-medium transition"
              >
                我知道了
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Collections Drawer panel */}
      <Collections
        isOpen={isCollectionsOpen}
        onClose={() => setIsCollectionsOpen(false)}
        favorites={favorites}
        onDeleteFavorite={handleDeleteFavorite}
        onViewPaper={(p) => setActiveSharePaper(p)}
      />

      {/* Backstage configuration drawer */}
      <AdminDrawer
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        quotes={quotes}
        onAddQuote={handleAddQuote}
        onDeleteQuote={handleDeleteQuote}
        onToggleQuote={handleToggleQuote}
        onEditQuote={handleEditQuote}
        onRestoreDefaults={handleRestoreDefaults}
        simulatedDate={simulatedDate}
        onSimulatedDateChange={(d) => {
          setSimulatedDate(d);
        }}
      />

      {/* Zoomed modal share card receipt */}
      <ShareCard
        paper={activeSharePaper}
        onClose={() => setActiveSharePaper(null)}
        onToggleFavorite={handleToggleCardFavorite}
        isFavorite={favorites.some((f) => f.id === activeSharePaper?.id)}
      />

    </div>
  );
}
