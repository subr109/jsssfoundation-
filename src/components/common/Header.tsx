import React, { useState } from 'react';
import { useApp, AppView } from '../../context/AppContext';
import { Logo } from './Logo';
import { OfficialPaymentQrModal } from './OfficialPaymentQrModal';
import {
  GraduationCap,
  Briefcase,
  ShieldCheck,
  Search,
  BookOpen,
  FileText,
  UserCheck,
  LogOut,
  Phone,
  Mail,
  Menu,
  X,
  KeyRound,
  Award,
  QrCode,
  CreditCard,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    currentRole,
    currentStudent,
    currentPartner,
    currentAdmin,
    logout,
    foundationInfo,
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  const navItems: { label: string; view: AppView; icon: React.ReactNode; badge?: string }[] = [
    { label: 'Home', view: 'landing', icon: null },
    { label: 'Courses', view: 'courses-catalog', icon: <BookOpen className="w-3.5 h-3.5" /> },
    { label: 'Student Portal', view: 'student-portal', icon: <GraduationCap className="w-3.5 h-3.5" /> },
    { label: 'Partner Franchise', view: 'partner-portal', icon: <Briefcase className="w-3.5 h-3.5" /> },
    { label: 'Verify Certificate', view: 'verify-certificate', icon: <Award className="w-3.5 h-3.5" />, badge: 'Live QR' },
    { label: 'Admin Console', view: 'admin-portal', icon: <ShieldCheck className="w-3.5 h-3.5" /> },
    { label: 'Legal & Compliance', view: 'legal-documents', icon: <FileText className="w-3.5 h-3.5" /> },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs print:hidden">
      {/* Top NGO Gov Compliance Bar */}
      <div className="bg-slate-900 text-slate-300 text-[11px] px-4 py-1.5 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar">
            <span className="flex items-center gap-1 text-emerald-400 font-semibold whitespace-nowrap">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              CIN: {foundationInfo.cin}
            </span>
            <span className="text-slate-600 hidden sm:inline">|</span>
            <span className="text-slate-400 hidden sm:inline whitespace-nowrap">
              NITI Aayog Darpan: {foundationInfo.ngoDarpanId}
            </span>
            <span className="text-slate-600 hidden md:inline">|</span>
            <span className="text-slate-400 hidden md:inline whitespace-nowrap">
              12A: {foundationInfo.registration12A} • 80G: {foundationInfo.registration80G}
            </span>
          </div>

          <div className="flex items-center gap-4 text-slate-300">
            <a
              href={`tel:${foundationInfo.contactNumbers[0]}`}
              className="flex items-center gap-1 hover:text-white transition-colors"
            >
              <Phone className="w-3 h-3 text-emerald-400" />
              <span>{foundationInfo.contactNumbers[0]}</span>
            </a>
            <span className="text-slate-700 hidden sm:inline">•</span>
            <a
              href={`mailto:${foundationInfo.officialEmail}`}
              className="hidden sm:flex items-center gap-1 hover:text-white transition-colors"
            >
              <Mail className="w-3 h-3 text-emerald-400" />
              <span>{foundationInfo.officialEmail}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between">
        <div
          onClick={() => setCurrentView('landing')}
          className="cursor-pointer transition-opacity hover:opacity-95"
        >
          <Logo size="md" />
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          {navItems.map((item) => {
            const isActive = currentView === item.view;
            return (
              <button
                key={item.view}
                onClick={() => setCurrentView(item.view)}
                className={`relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-800 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.badge && (
                  <span className="text-[9px] font-bold px-1.5 py-0.2 bg-amber-500 text-slate-950 rounded-md">
                    {item.badge}
                  </span>
                )}
                {isActive && (
                  <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-emerald-600 rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* User Status / Quick Actions */}
        <div className="hidden sm:flex items-center gap-2">
          {/* Quick Pay Fees QR trigger */}
          <button
            onClick={() => setIsQrModalOpen(true)}
            className="px-3 py-2 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            title="Pay Course Fees via Google Pay / BHIM UPI"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Pay Fees (UPI QR)</span>
          </button>

          {currentRole !== 'GUEST' ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="text-right">
                <span className="text-xs font-bold text-slate-900 block leading-tight">
                  {currentRole === 'STUDENT' && currentStudent?.name}
                  {currentRole === 'PARTNER' && currentPartner?.centerName}
                  {currentRole === 'ADMIN' && currentAdmin?.name}
                </span>
                <span className="text-[10px] text-emerald-700 font-semibold uppercase">
                  {currentRole} ACTIVE
                </span>
              </div>
              <button
                onClick={logout}
                title="Logout"
                className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 flex items-center justify-center transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentView('student-portal')}
                className="px-3.5 py-2 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <GraduationCap className="w-3.5 h-3.5" />
                Student Login
              </button>
              <button
                onClick={() => setCurrentView('partner-portal')}
                className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-1.5"
              >
                <Briefcase className="w-3.5 h-3.5" />
                Partner Portal
              </button>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden px-4 py-3 bg-white border-b border-slate-200 space-y-1 shadow-lg animate-in slide-in-from-top-2">
          {navItems.map((item) => {
            const isActive = currentView === item.view;
            return (
              <button
                key={item.view}
                onClick={() => {
                  setCurrentView(item.view);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold ${
                  isActive ? 'bg-emerald-50 text-emerald-800 font-bold' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 bg-amber-500 text-slate-950 rounded">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          <div className="pt-2 border-t border-slate-100 mt-2 space-y-2">
            <button
              onClick={() => {
                setIsQrModalOpen(true);
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
            >
              <QrCode className="w-4 h-4" />
              Pay Course Fees (Official Google Pay UPI QR)
            </button>

            {currentRole !== 'GUEST' ? (
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-rose-50 text-rose-600 rounded-xl text-xs font-bold"
              >
                <LogOut className="w-4 h-4" />
                Sign Out ({currentRole})
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setCurrentView('student-portal');
                    setMobileMenuOpen(false);
                  }}
                  className="py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold text-center"
                >
                  Student Portal
                </button>
                <button
                  onClick={() => {
                    setCurrentView('partner-portal');
                    setMobileMenuOpen(false);
                  }}
                  className="py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold text-center"
                >
                  Partner Portal
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Official Payment QR Modal */}
      {isQrModalOpen && (
        <OfficialPaymentQrModal isOpen={isQrModalOpen} onClose={() => setIsQrModalOpen(false)} />
      )}
    </header>
  );
};
