import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Phone, Mail, HelpCircle, CheckCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const SupportChatModal: React.FC = () => {
  const { foundationInfo } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<
    Array<{ id: string; text: string; sender: 'bot' | 'user'; time: string }>
  >([
    {
      id: 'm1',
      text: `Hello! Welcome to JSSS FOUNDATION Academy Helpdesk. How can we assist you today?`,
      sender: 'bot',
      time: 'Just now',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const quickQuestions = [
    'How do I download my certificate?',
    'What are the eligibility criteria for courses?',
    'How do I apply for a partner center franchise?',
    'How to verify a student certificate?',
  ];

  const handleSend = (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim()) return;

    const userMsg = {
      id: `u-${Date.now()}`,
      text,
      sender: 'user' as const,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsTyping(true);

    setTimeout(() => {
      let botResponse = `Thank you for reaching out! Our academic desk has logged your query: "${text}". You can also reach our Kolkata office at ${foundationInfo.contactNumbers[0]} or email ${foundationInfo.officialEmail}.`;

      const lower = text.toLowerCase();
      if (lower.includes('certificate') || lower.includes('download')) {
        botResponse = `To download your certificate: 1) Login to the Student Portal with your Registration No (e.g. JSSS/2026/0527), 2) Click on the "Exam Marks & Certificate" tab, 3) Click "Download / Print Certificate" to get your verified digital certificate!`;
      } else if (lower.includes('partner') || lower.includes('franchise') || lower.includes('center')) {
        botResponse = `To become an authorized JSSS Training Center: Click on "Partner Franchise" in the top menu, fill out your center details and upload your Trade License/ID proofs. Once submitted, Super Admin Soumen Ghosh will review and approve your center within 24-48 hours.`;
      } else if (lower.includes('verify') || lower.includes('qr')) {
        botResponse = `You can verify any JSSS Foundation certificate by going to the "Verify Certificate" tab in the top navigation and typing the Certificate ID (e.g. JSSS/2026/0527), or by scanning the QR code on the certificate with any phone camera.`;
      } else if (lower.includes('fee') || lower.includes('payment')) {
        botResponse = `Course fees can be paid seamlessly inside your Student Portal using UPI (GPay/PhonePe), Debit/Credit Cards, or Net Banking. Instant digital tax receipts are generated for every transaction.`;
      }

      const replyMsg = {
        id: `b-${Date.now()}`,
        text: botResponse,
        sender: 'bot' as const,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, replyMsg]);
      setIsTyping(false);
    }, 900);
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 print:hidden">
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-2.5 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
        >
          <div className="relative">
            <MessageCircle className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full animate-ping" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full" />
          </div>
          <span className="text-xs font-bold tracking-wide pr-1">Support & Help</span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="w-[340px] sm:w-[380px] h-[480px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200">
          {/* Header */}
          <div className="px-4 py-3.5 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-xs">JSSS Academic Helpdesk</h4>
                <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Support Online
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-7 h-7 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3 bg-slate-50 text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'bot' && (
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 text-[10px] font-bold">
                    J
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl p-2.5 leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-emerald-600 text-white rounded-br-xs'
                      : 'bg-white text-slate-800 border border-slate-200 shadow-2xs rounded-bl-xs'
                  }`}
                >
                  <p>{m.text}</p>
                  <span
                    className={`block text-[9px] mt-1 text-right ${
                      m.sender === 'user' ? 'text-emerald-100' : 'text-slate-400'
                    }`}
                  >
                    {m.time}
                  </span>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-1 text-slate-400 text-[11px] p-2 bg-white rounded-xl w-24 border border-slate-200">
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick FAQ suggestions */}
          <div className="px-3 py-2 bg-white border-t border-slate-100 flex gap-1.5 overflow-x-auto no-scrollbar">
            {quickQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                className="whitespace-nowrap px-2.5 py-1 text-[10px] bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 rounded-full border border-slate-200 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-2.5 bg-white border-t border-slate-200 flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask anything (admission, certificate, center)..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="w-9 h-9 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-xl flex items-center justify-center transition-colors shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Helpline banner */}
          <div className="bg-slate-900 px-3 py-1.5 text-[10px] text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Phone className="w-2.5 h-2.5 text-emerald-400" /> +91 7001182588
            </span>
            <span className="flex items-center gap-1">
              <Mail className="w-2.5 h-2.5 text-emerald-400" /> info@jsssfoundation.in
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
