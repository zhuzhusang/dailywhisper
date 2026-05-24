import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, Plus, Trash2, Eye, EyeOff, RotateCcw, Search, ExternalLink, Calendar, Check, Edit2
} from "lucide-react";
import { Quote } from "../types";

interface AdminDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  quotes: Quote[];
  onAddQuote: (quote: Omit<Quote, "id" | "createdAt">) => void;
  onDeleteQuote: (id: string) => void;
  onToggleQuote: (id: string) => void;
  onEditQuote: (id: string, updated: Partial<Quote>) => void;
  onRestoreDefaults: () => void;
  simulatedDate: string;
  onSimulatedDateChange: (dateStr: string) => void;
}

export default function AdminDrawer({
  isOpen,
  onClose,
  quotes,
  onAddQuote,
  onDeleteQuote,
  onToggleQuote,
  onEditQuote,
  onRestoreDefaults,
  simulatedDate,
  onSimulatedDateChange,
}: AdminDrawerProps) {
  const [activeTab, setActiveTab] = useState<"list" | "add">("list");
  const [search, setSearch] = useState("");
  
  // Form elements for adding quotes
  const [content, setContent] = useState("");
  const [author, setAuthor] = useState("");
  const [source, setSource] = useState("");

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [editAuthor, setEditAuthor] = useState("");
  const [editSource, setEditSource] = useState("");

  const filteredQuotes = quotes.filter((q) => {
    return (
      q.content.toLowerCase().includes(search.toLowerCase()) ||
      (q.author ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (q.source ?? "").toLowerCase().includes(search.toLowerCase())
    );
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    onAddQuote({
      content: content.trim(),
      author: author.trim() ? author.trim() : undefined,
      source: source.trim() ? source.trim() : undefined,
      enabled: true,
    });

    // Reset fields
    setContent("");
    setAuthor("");
    setSource("");
    setActiveTab("list");
  };

  const startEditing = (q: Quote) => {
    setEditingId(q.id);
    setEditContent(q.content);
    setEditAuthor(q.author ?? "");
    setEditSource(q.source ?? "");
  };

  const cancelEditing = () => {
    setEditingId(null);
  };

  const saveEdit = (id: string) => {
    if (!editContent.trim()) return;
    onEditQuote(id, {
      content: editContent.trim(),
      author: editAuthor.trim() ? editAuthor.trim() : undefined,
      source: editSource.trim() ? editSource.trim() : undefined,
    });
    setEditingId(null);
  };

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
            id="admin-backdrop"
          />

          {/* Drawer Wrapper */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 h-[85vh] max-w-2xl mx-auto bg-[#faf8f2] text-neutral-800 rounded-t-3xl shadow-2xl z-55 flex flex-col border-t-4 border-[#8c6d4f] select-none"
            id="admin-drawer"
          >
            {/* Drawer Top Pull Handle Accent */}
            <div className="w-16 h-1 bg-[#8c6d4f]/30 rounded-full mx-auto my-3" />

            {/* Header */}
            <div className="px-6 pb-4 flex justify-between items-center border-b border-[#8c6d4f]/10">
              <div>
                <h2 className="font-serif text-2xl font-semibold text-[#5c4033] flex items-center gap-2">
                  <span>🖋️</span> 每日一语 · 掌上配置
                </h2>
                <p className="text-xs text-neutral-500 font-serif mt-1">
                  在此添加、禁用或预览每日在收据纸上打印出的诗意片段
                </p>
              </div>
              <button
                id="admin-close-btn"
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center bg-[#8c6d4f]/10 text-[#5c4033] hover:bg-[#8c6d4f]/20 transition"
                title="关闭后台"
              >
                <X size={18} />
              </button>
            </div>

            {/* Sub-Header Widget: Date Simulator (Crucial for Daily Testing) */}
            <div className="bg-[#ebd9c4]/40 px-6 py-3 flex items-center justify-between border-b border-[#8c6d4f]/10 text-xs">
              <span className="font-serif font-medium text-[#5c4033] flex items-center gap-1.5">
                <Calendar size={14} className="text-[#8c6d4f]" />
                「时光漫游」测试器（模拟今天日期）：
              </span>
              <input
                id="admin-date-simulator"
                type="date"
                value={simulatedDate}
                onChange={(e) => onSimulatedDateChange(e.target.value)}
                className="px-2 py-1 rounded bg-white border border-[#8c6d4f]/20 outline-none font-mono text-neutral-700 font-semibold cursor-pointer text-xs"
                title="改变当前模拟系统日期，观察那一天对应的句子"
              />
            </div>

            {/* Nav Tabs */}
            <div className="px-6 mt-4 flex gap-4 text-sm font-serif">
              <button
                id="admin-tab-list"
                onClick={() => setActiveTab("list")}
                className={`pb-2 border-b-2 font-medium transition ${
                  activeTab === "list"
                    ? "border-[#8c6d4f] text-[#5c4033]"
                    : "border-transparent text-neutral-500 hover:text-[#5c4033]"
                }`}
              >
                句子词库列表 ({quotes.length})
              </button>
              <button
                id="admin-tab-add"
                onClick={() => setActiveTab("add")}
                className={`pb-2 border-b-2 font-medium transition ${
                  activeTab === "add"
                    ? "border-[#8c6d4f] text-[#5c4033]"
                    : "border-transparent text-neutral-500 hover:text-[#5c4033]"
                }`}
              >
                ✙ 新增唯美语录
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {activeTab === "list" ? (
                <div className="space-y-4">
                  {/* Filters bar */}
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                      <input
                        id="admin-search-input"
                        type="text"
                        placeholder="检索句子、作者或出处..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 border border-[#8c6d4f]/20 rounded-lg text-sm bg-stone-50 focus:outline-none focus:border-[#8c6d4f]"
                      />
                    </div>
                  </div>

                  {/* List */}
                  <div className="space-y-2.5">
                    {filteredQuotes.length > 0 ? (
                      filteredQuotes.map((q, idx) => {
                        const isEditing = editingId === q.id;
                        return (
                          <div
                            key={q.id}
                            id={`quote-item-${q.id}`}
                            className={`p-4 rounded-xl border transition ${
                              q.enabled 
                                ? "bg-white border-[#8c6d4f]/15" 
                                : "bg-neutral-100 border-neutral-300 opacity-60"
                            }`}
                          >
                            {isEditing ? (
                              // EDITING FORM
                              <div className="space-y-3">
                                <div>
                                  <label className="block text-[11px] uppercase tracking-wider font-mono text-[#5c4033]/60 mb-1">
                                    编辑金句内容
                                  </label>
                                  <textarea
                                    value={editContent}
                                    onChange={(e) => setEditContent(e.target.value)}
                                    className="w-full p-2 border border-[#8c6d4f]/30 rounded bg-stone-50 text-sm font-serif"
                                    rows={3}
                                  />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <label className="block text-[11px] uppercase tracking-wider font-mono text-[#5c4033]/60 mb-1">
                                      作者 (选填)
                                    </label>
                                    <input
                                      type="text"
                                      value={editAuthor}
                                      onChange={(e) => setEditAuthor(e.target.value)}
                                      className="w-full p-2 border border-[#8c6d4f]/30 rounded bg-stone-50 text-sm font-serif"
                                      placeholder="选填"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[11px] uppercase tracking-wider font-mono text-[#5c4033]/60 mb-1">
                                      出处 (如书名/电影/选段)
                                    </label>
                                    <input
                                      type="text"
                                      value={editSource}
                                      onChange={(e) => setEditSource(e.target.value)}
                                      className="w-full p-2 border border-[#8c6d4f]/30 rounded bg-stone-50 text-sm font-serif"
                                      placeholder="选填"
                                    />
                                  </div>
                                </div>
                                <div className="flex justify-end gap-2 pt-1">
                                  <button
                                    onClick={cancelEditing}
                                    className="px-3 py-1.5 border border-stone-300 rounded text-xs hover:bg-stone-50 text-neutral-600 font-serif"
                                  >
                                    取消
                                  </button>
                                  <button
                                    onClick={() => saveEdit(q.id)}
                                    className="px-3 py-1.5 bg-[#8c6d4f] text-white rounded text-xs hover:bg-[#7a5e42] font-serif flex items-center gap-1"
                                  >
                                    <Check size={12} /> 保存
                                  </button>
                                </div>
                              </div>
                            ) : (
                              // ACTIVE VIEW
                              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                <div className="flex-1 space-y-2">
                                  <p className="font-serif text-sm leading-relaxed text-[#3a2e2b]">
                                    “ {q.content} ”
                                  </p>
                                  <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500 font-serif">
                                    {q.author && <span className="font-semibold text-[#8c6d4f]">{q.author}</span>}
                                    {q.source && (
                                      <span className="text-stone-400">
                                        来自 {q.source}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center gap-1 justify-end shrink-0 border-t md:border-t-0 border-stone-100 pt-2.5 md:pt-0">
                                  <button
                                    id={`quote-toggle-btn-${q.id}`}
                                    onClick={() => onToggleQuote(q.id)}
                                    className="p-1.5 rounded hover:bg-stone-100 text-[#5c4033] transition"
                                    title={q.enabled ? "禁用这一句 (不参与打印)" : "启用这一句"}
                                  >
                                    {q.enabled ? <Eye size={15} /> : <EyeOff size={15} className="text-neutral-400" />}
                                  </button>
                                  <button
                                    id={`quote-edit-btn-${q.id}`}
                                    onClick={() => startEditing(q)}
                                    className="p-1.5 rounded hover:bg-stone-100 text-[#5c4033]"
                                    title="修改内容"
                                  >
                                    <Edit2 size={15} />
                                  </button>
                                  <button
                                    id={`quote-del-btn-${q.id}`}
                                    onClick={() => onDeleteQuote(q.id)}
                                    className="p-1.5 rounded hover:bg-red-50 text-red-600 transition"
                                    title="删除卡片"
                                  >
                                    <Trash2 size={15} />
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-10 border-2 border-dashed border-[#8c6d4f]/15 rounded-xl bg-stone-50/50">
                        <p className="font-serif text-sm text-neutral-500">没有检索到符合条件的经典句子</p>
                      </div>
                    )}
                  </div>

                  {/* Reset defaults button */}
                  <div className="pt-4 flex justify-center border-t border-dashed border-[#8c6d4f]/10">
                    <button
                      id="admin-restore-defaults"
                      onClick={() => {
                        if (confirm("确定要恢复出厂设置，恢复精选的古今华美文学金句吗？现有的修改将被覆盖。")) {
                          onRestoreDefaults();
                        }
                      }}
                      className="px-4 py-2 border border-[#8c6d4f]/30 rounded-full font-serif text-xs text-[#8c6d4f] hover:bg-[#8c6d4f]/10 flex items-center gap-2 transition"
                    >
                      <RotateCcw size={13} />
                      重置并恢复文学精选词池
                    </button>
                  </div>
                </div>
              ) : (
                /* ADD QUOTE PANEL */
                <form id="admin-add-form" onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label className="block text-xs uppercase tracking-wider font-mono text-[#5c4033]/70 font-semibold">
                      金句格言内容 *
                    </label>
                    <textarea
                      id="add-quote-content"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="写下一两句饱含情感与智慧、让人怦然心动的文青金句..."
                      required
                      rows={4}
                      className="w-full p-3 border border-[#8c6d4f]/30 rounded-xl bg-white text-sm font-serif leading-relaxed focus:outline-none focus:border-[#8c6d4f] focus:ring-1 focus:ring-[#8c6d4f]"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-xs uppercase tracking-wider font-mono text-[#5c4033]/70 font-semibold">
                        作者 / 演绎者 (选填)
                      </label>
                      <input
                        id="add-quote-author"
                        type="text"
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                        placeholder="如：三毛、网络、留空"
                        className="w-full p-3 border border-[#8c6d4f]/30 rounded-xl bg-white text-sm font-serif focus:outline-none focus:border-[#8c6d4f]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs uppercase tracking-wider font-mono text-[#5c4033]/70 font-semibold">
                        出处来源 (选填)
                      </label>
                      <input
                        id="add-quote-source"
                        type="text"
                        value={source}
                        onChange={(e) => setSource(e.target.value)}
                        placeholder="如：书名《撒哈拉的故事》、网络"
                        className="w-full p-3 border border-[#8c6d4f]/30 rounded-xl bg-white text-sm font-serif focus:outline-none focus:border-[#8c6d4f]"
                      />
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      id="add-quote-submit"
                      type="submit"
                      className="w-full py-3 bg-[#8c6d4f] hover:bg-[#75593e] text-white rounded-xl font-serif text-sm font-medium transition flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                    >
                      <Plus size={16} /> 保存到我的时光词海
                    </button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
