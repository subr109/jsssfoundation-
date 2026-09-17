import React from 'react';
import { useApp } from '../../context/AppContext';
import { Logo } from './Logo';
import {
  MapPin,
  Phone,
  Mail,
  Globe,
  Building,
  ShieldCheck,
  Award,
  CheckCircle,
  FileText,
  ExternalLink,
} from 'lucide-react';

export const Footer: React.FC = () => {
  const { foundationInfo, setCurrentView, isPublishedMode, togglePublishedMode } = useApp();

  return (
    <footer className="bg-slate-950 text-slate-300 pt-12 pb-8 border-t border-slate-800 print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Main 4-column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-12 border-b border-slate-800/80">
          {/* Col 1: About Organization */}
          <div className="space-y-4">
            <Logo size="md" />
            <p className="text-xs text-slate-400 leading-relaxed">
              <strong className="text-slate-200">{foundationInfo.legalName}</strong> is a premier Section 8 Not-for-Profit registered under the Ministry of Corporate Affairs, Govt. of India, empowering youth with vocational education, skill development, and employment opportunities.
            </p>
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-[11px] space-y-1">
              <div className="flex items-center gap-1 text-emerald-400 font-bold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Central Govt. Certified</span>
              </div>
              <p className="text-slate-400 font-mono text-[10px]">CIN: {foundationInfo.cin}</p>
              <p className="text-slate-400 font-mono text-[10px]">ROC: {foundationInfo.roc}</p>
            </div>
          </div>

          {/* Col 2: Quick Links & Portals */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white tracking-wider uppercase">Academy Portals</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => setCurrentView('student-portal')}
                  className="hover:text-emerald-400 transition-colors flex items-center gap-1.5"
                >
                  <span>›</span> Student Registration & Login
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentView('partner-portal')}
                  className="hover:text-emerald-400 transition-colors flex items-center gap-1.5"
                >
                  <span>›</span> Franchise Training Partner Desk
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentView('verify-certificate')}
                  className="hover:text-emerald-400 transition-colors flex items-center gap-1.5"
                >
                  <span>›</span> Online Certificate Verification
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentView('courses-catalog')}
                  className="hover:text-emerald-400 transition-colors flex items-center gap-1.5"
                >
                  <span>›</span> Vocational Courses & Syllabus
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentView('admin-portal')}
                  className="hover:text-emerald-400 transition-colors flex items-center gap-1.5"
                >
                  <span>›</span> Super Admin Central Console
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentView('legal-documents')}
                  className="hover:text-emerald-400 transition-colors flex items-center gap-1.5 text-amber-300 font-medium"
                >
                  <span>›</span> Legal Documents & NGO Registrations
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Legal & Regulatory Registrations */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white tracking-wider uppercase">NGO Registrations</h4>
            <div className="space-y-1.5 text-xs text-slate-400 font-mono">
              <div className="p-2 bg-slate-900/80 rounded-lg border border-slate-800/60">
                <span className="text-slate-500 block text-[10px]">NGO Darpan ID:</span>
                <span className="text-emerald-300 font-semibold">{foundationInfo.ngoDarpanId}</span>
              </div>
              <div className="p-2 bg-slate-900/80 rounded-lg border border-slate-800/60">
                <span className="text-slate-500 block text-[10px]">12A / 80G Tax Exemption:</span>
                <span className="text-slate-200">{foundationInfo.registration80G}</span>
              </div>
              <div className="p-2 bg-slate-900/80 rounded-lg border border-slate-800/60">
                <span className="text-slate-500 block text-[10px]">CSR & Udyam MSME:</span>
                <span className="text-slate-200">{foundationInfo.csrRegistration} • {foundationInfo.udyamMsme}</span>
              </div>
            </div>
          </div>

          {/* Col 4: Contact & Office Locations */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white tracking-wider uppercase">Offices & Contact</h4>
            <div className="space-y-2.5 text-xs text-slate-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-200 block text-[11px]">Kolkata Office:</strong>
                  <span>{foundationInfo.kolkataOffice}</span>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Building className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-200 block text-[11px]">Registered Office:</strong>
                  <span>{foundationInfo.registeredOffice}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  {foundationInfo.contactNumbers.map((num, i) => (
                    <span key={i} className="mr-2 text-slate-300 font-medium">
                      {num}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <a href={`mailto:${foundationInfo.officialEmail}`} className="text-emerald-400 hover:underline">
                  {foundationInfo.officialEmail}
                </a>
              </div>

              <div className="p-2 bg-slate-900 rounded-lg border border-slate-800 text-[11px]">
                <span className="text-slate-400 block text-[10px]">Official Bank:</span>
                <span className="text-white font-semibold">State Bank of India (IFSC: {foundationInfo.bankIfsc})</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright & certification bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} {foundationInfo.legalName}. All Rights Reserved.
          </div>
          <div className="flex flex-wrap items-center gap-3 text-slate-400 text-[11px]">
            <span>Signatory Authority: {foundationInfo.directorName} (Director)</span>
            <span>•</span>
            <span>{foundationInfo.projectDirectorName} (Project Director)</span>
            <span>•</span>
            <button
              onClick={togglePublishedMode}
              title="Click to toggle Published Mode (Hides all demo IDs and passwords for live deployment)"
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer border ${
                isPublishedMode
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-600/60 hover:bg-emerald-900/80'
                  : 'bg-amber-950/80 text-amber-300 border-amber-600/60 hover:bg-amber-900/80'
              }`}
            >
              <ShieldCheck className="w-3 h-3" />
              <span>{isPublishedMode ? 'Published Mode: IDs & Passwords Removed' : 'Dev Mode: Demo Passwords Visible'}</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
