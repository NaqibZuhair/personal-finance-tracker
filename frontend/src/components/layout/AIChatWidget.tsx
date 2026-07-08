import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Sparkles, Camera, X, Send, Bot, User, CheckCircle, RefreshCw, Minimize2, Maximize2, Image as ImageIcon, Mic, MicOff, Brain } from 'lucide-react';
import { aiService, type AIChatMessage } from '../../services/aiService';

export default function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<AIChatMessage[]>([
    {
      role: 'assistant',
      content: '👋 Halo bro! Aku **Agentic AI Wealth Advisor** kamu! ✨\n\n🎯 Aku punya **Ingatan Jangka Panjang (AI Memory)** & tahu semua habit belanjamu.\n🎙️ Kamu bisa **tanya pakai Voice Note (Mic)**, upload foto struk belanja (OCR), atau suruh aku catat transaksi kilat & fungsi keuangan lainnya!',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [executedTools, setExecutedTools] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
    }
  }, [messages, isOpen, isMinimized, loading]);

  // Fitur Voice Note (Speech-to-Text Lisan Indonesia)
  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('⚠️ Browser kamu belum mendukung Voice Note Lisan. Gunakan Chrome atau Edge.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'id-ID';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
      };

      recognition.onresult = (event: any) => {
        const speechToText = event.results[0][0].transcript;
        setInput((prev) => (prev ? `${prev} ${speechToText}` : speechToText));
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        console.error('[Speech Recognition Error]:', event.error);
        setIsListening(false);
        if (event.error !== 'no-speech') {
          setError(`⚠️ Gagal merekam suara: ${event.error}`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.error('[Speech Recognition Init Error]:', err);
      setIsListening(false);
      setError('⚠️ Gagal mengakses mikrofon.');
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('⚠️ Format file harus berupa gambar (JPG, PNG, WEBP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('⚠️ Ukuran gambar maksimal 5MB ya bro.');
      return;
    }

    setError(null);
    const url = URL.createObjectURL(file);
    setImagePreviewUrl(url);

    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setSelectedImage(null);
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
      setImagePreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() && !selectedImage) return;
    if (loading) return;

    const userText = input.trim() || 'Tolong baca dan catat transaksi dari struk belanja ini';
    const currentImage = selectedImage;

    const newMsg: AIChatMessage = {
      role: 'user',
      content: userText,
      image: currentImage || undefined,
    };

    const updatedHistory = [...messages, newMsg];
    setMessages(updatedHistory);
    setInput('');
    removeImage();
    setLoading(true);
    setError(null);

    try {
      const result = await aiService.chat(userText, messages, currentImage || undefined);
      
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: result.response || '✅ Pesan berhasil diproses oleh AI Advisor.',
        },
      ]);

      if (result.executedTools && result.executedTools.length > 0) {
        setExecutedTools((prev) => Array.from(new Set([...prev, ...result.executedTools])));
      }
    } catch (err: any) {
      setError(err.message || '⚠️ Gagal memanggil AI Advisor.');
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `⚠️ Kendala koneksi AI:\n_${err.message || 'Error tidak diketahui'}_\n\nPastikan server backend di port 5000 aktif dan coba lagi ya bro!`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        role: 'assistant',
        content: '👋 Sesi obrolan diulang! Mau mulai pencatatan baru, pakai Voice Note, atau scan struk lagi bro? ✨',
      },
    ]);
    setExecutedTools([]);
    setError(null);
    removeImage();
  };

  const renderFormattedText = (text: string) => {
    return text.split('\n').map((line, idx) => {
      const parts = line.split(/(\*\*.*?\*\*|\*.*?\*)/g);
      return (
        <span key={idx} className="block mb-1">
          {parts.map((part, pIdx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={pIdx} className="font-semibold text-indigo-400 dark:text-indigo-300">{part.slice(2, -2)}</strong>;
            } else if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
              return <strong key={pIdx} className="font-semibold text-indigo-400 dark:text-indigo-300">{part.slice(1, -1)}</strong>;
            }
            return part;
          })}
        </span>
      );
    });
  };

  return (
    <>
      {/* Tombol Floating Launcher - Posisi disesuaikan agar tidak menabrak tombol + di BottomNav Mobile */}
      {!isOpen && (
        <div className="fixed bottom-24 right-4 md:bottom-6 md:right-6 z-50 flex flex-col items-end">
          <button
            onClick={() => setIsOpen(true)}
            className="group flex items-center gap-3 px-5 py-3.5 rounded-full bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-500 text-white font-medium shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-[1.04] active:scale-[0.98] transition-all duration-200 border border-indigo-400/30 backdrop-blur-md"
          >
            <div className="relative flex items-center justify-center w-6 h-6">
              <MessageSquare className="w-6 h-6 transition-transform group-hover:rotate-12" />
              <Sparkles className="w-3.5 h-3.5 absolute -top-1 -right-1 text-yellow-300 animate-pulse" />
            </div>
            <span className="text-sm tracking-wide">AI Advisor & Scanner</span>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </button>
        </div>
      )}

      {/* Window Chat & OCR Scanner Drawer - Fullscreen di Mobile agar nyaman & tidak tertutup */}
      {isOpen && (
        <div
          className={`fixed z-[100] transition-all duration-300 flex flex-col overflow-hidden shadow-2xl backdrop-blur-xl
            ${
              isMinimized
                ? 'bottom-24 right-4 w-72 h-14 rounded-2xl bg-slate-900/95 border border-slate-800 md:bottom-6 md:right-6 md:w-[420px] md:h-16'
                : 'inset-0 top-0 bottom-0 left-0 right-0 w-full h-full bg-slate-900 md:inset-auto md:bottom-6 md:right-6 md:w-[420px] md:h-[600px] md:max-h-[85vh] md:rounded-2xl md:border md:border-slate-800/80'
            }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3.5 bg-gradient-to-r from-indigo-900/80 via-purple-900/60 to-slate-900 border-b border-slate-800/80">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-inner">
                <Bot className="w-5 h-5 animate-bounce" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-1.5">
                  AI Wealth Advisor
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">Omnichannel</span>
                </h3>
                <p className="text-[10px] text-slate-300 flex items-center gap-1">
                  <Brain className="w-3 h-3 text-purple-400" /> Long-Term Memory & VN Ready
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors hidden md:block"
                title={isMinimized ? 'Maximize' : 'Minimize'}
              >
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={handleResetChat}
                className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-slate-800/60 transition-colors"
                title="Reset Sesi Chat"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800/60 transition-colors"
                title="Tutup AI Chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Isi Area Chat */}
          {!isMinimized && (
            <>
              {/* Alert Status Tools */}
              {executedTools.length > 0 && (
                <div className="px-4 py-2 bg-indigo-500/10 border-b border-indigo-500/20 flex items-center justify-between text-xs text-indigo-300 shrink-0">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="truncate">Ledger & Memory: <strong>{executedTools.join(', ')}</strong></span>
                  </div>
                  <button onClick={() => setExecutedTools([])} className="text-slate-400 hover:text-slate-200 shrink-0">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}

              {/* Area Daftar Pesan */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-800">
                {messages.map((msg, index) => (
                  <div key={index} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${
                        msg.role === 'user'
                          ? 'bg-indigo-600/20 border-indigo-500/40 text-indigo-400'
                          : 'bg-purple-600/20 border-purple-500/40 text-purple-400'
                      }`}
                    >
                      {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>
                    <div
                      className={`max-w-[82%] rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-md ${
                        msg.role === 'user'
                          ? 'bg-indigo-600 text-white rounded-tr-none'
                          : 'bg-slate-800/80 text-slate-200 border border-slate-700/60 rounded-tl-none'
                      }`}
                    >
                      {msg.image && (
                        <div className="mb-2 rounded-xl overflow-hidden border border-white/20 shadow-sm">
                          <img src={msg.image} alt="Receipt OCR Upload" className="w-full h-auto max-h-48 object-cover" />
                          <div className="bg-black/60 px-2 py-1 text-[10px] text-emerald-300 flex items-center gap-1">
                            <ImageIcon className="w-3 h-3" /> Struk Terlampir untuk OCR Scanner
                          </div>
                        </div>
                      )}
                      {renderFormattedText(msg.content)}
                    </div>
                  </div>
                ))}

                {/* Loading Indicator */}
                {loading && (
                  <div className="flex gap-3 flex-row items-center">
                    <div className="w-8 h-8 rounded-full bg-purple-600/20 border border-purple-500/40 text-purple-400 flex items-center justify-center shrink-0">
                      <Bot className="w-4 h-4 animate-spin" />
                    </div>
                    <div className="bg-slate-800/80 text-slate-300 border border-slate-700/60 rounded-2xl rounded-tl-none px-4 py-3 text-xs flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse shrink-0" />
                      <span>AI sedang berpikir & mengakses memori keuanganmu...</span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Error Message */}
              {error && (
                <div className="mx-4 mb-2 px-3 py-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-[11px] flex items-center justify-between shrink-0">
                  <span className="pr-2">{error}</span>
                  <button onClick={() => setError(null)} className="shrink-0"><X className="w-3.5 h-3.5" /></button>
                </div>
              )}

              {/* Area Preview Foto Struk yang Akan Dikirim */}
              {imagePreviewUrl && (
                <div className="mx-4 mb-2 p-2 rounded-xl bg-slate-800/90 border border-indigo-500/40 flex items-center justify-between shadow-lg shrink-0">
                  <div className="flex items-center gap-2.5">
                    <img src={imagePreviewUrl} alt="Preview" className="w-10 h-10 rounded-lg object-cover border border-slate-700" />
                    <div>
                      <p className="text-[11px] font-medium text-slate-200 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-yellow-400" /> Struk Belanja Terpilih
                      </p>
                      <p className="text-[10px] text-emerald-400">Siap diekstrak line items & merchant!</p>
                    </div>
                  </div>
                  <button onClick={removeImage} className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-700/60 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Form Input Pesan, VN Mic, & Upload Struk */}
              <form onSubmit={handleSend} className="p-3 pb-6 md:pb-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2 shrink-0">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageSelect}
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={`p-2.5 rounded-xl transition-all shrink-0 ${
                    selectedImage
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm'
                      : 'bg-slate-800 text-slate-300 hover:text-indigo-400 hover:bg-slate-700/80 border border-slate-700/60'
                  }`}
                  title="Upload Foto Struk / Tagihan untuk Scan OCR"
                >
                  <Camera className="w-5 h-5" />
                </button>
                
                {/* Tombol Voice Note (VN) Speech Recognition */}
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`p-2.5 rounded-xl transition-all shrink-0 ${
                    isListening
                      ? 'bg-rose-500 text-white animate-pulse shadow-lg shadow-rose-500/40 border border-rose-400'
                      : 'bg-slate-800 text-slate-300 hover:text-rose-400 hover:bg-slate-700/80 border border-slate-700/60'
                  }`}
                  title={isListening ? 'Klik untuk berhenti merekam suara' : 'Klik untuk bicara (Voice Note STT)'}
                >
                  {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>

                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={
                    isListening
                      ? '🎙️ Mendengarkan suara kamu...'
                      : selectedImage
                      ? 'Ketik keterangan tambahan struk ini...'
                      : 'Tanya AI atau ketik "catat 50rb makan"...'
                  }
                  disabled={loading}
                  className="flex-1 min-w-0 bg-slate-800/60 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={loading || (!input.trim() && !selectedImage)}
                  className="p-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 active:scale-95 transition-all disabled:opacity-40 disabled:hover:bg-indigo-600 disabled:active:scale-100 shadow-md shadow-indigo-600/30 shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </>
  );
}
