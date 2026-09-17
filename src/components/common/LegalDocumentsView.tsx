import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  FileText,
  ShieldCheck,
  Building,
  CheckCircle,
  Building2,
  Phone,
  Mail,
  ExternalLink,
  Download,
  Landmark,
  Scale,
} from 'lucide-react';

export const LegalDocumentsView: React.FC = () => {
  const { foundationInfo } = useApp();

  const legalItems = [
    { label: 'Legal Entity Name', value: foundationInfo.legalName, highlight: true },
    { label: 'Short Name / Acronym', value: foundationInfo.shortName },
    { label: 'Legal Status', value: foundationInfo.legalStatus, badge: 'Govt. of India' },
    { label: 'Corporate Identity Number (CIN)', value: foundationInfo.cin, mono: true, highlight: true },
    { label: 'Registration Number', value: foundationInfo.registrationNo, mono: true },
    { label: 'Date of Incorporation', value: foundationInfo.incorporationDate },
    { label: 'Registrar of Companies (ROC)', value: foundationInfo.roc },
    { label: 'Registration Authority', value: foundationInfo.registrationAuthority },
    { label: 'Permanent Account Number (PAN)', value: foundationInfo.pan, mono: true },
    { label: 'Tax Deduction Account Number (TAN)', value: foundationInfo.tan, mono: true },
    { label: '12A Income Tax Registration', value: foundationInfo.registration12A, mono: true, badge: 'Tax Exempt' },
    { label: '80G Tax Exemption Certificate', value: foundationInfo.registration80G, mono: true, badge: 'Donor 50% Exemption' },
    { label: 'MCA CSR Registration Number', value: foundationInfo.csrRegistration, mono: true, badge: 'CSR Eligible' },
    { label: 'NGO Darpan ID (NITI Aayog, Govt. of India)', value: foundationInfo.ngoDarpanId, mono: true, highlight: true },
    { label: 'Udyam / MSME Registration', value: foundationInfo.udyamMsme, mono: true },
    { label: 'FCRA Regulatory Status', value: foundationInfo.fcraStatus },
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white p-8 rounded-3xl shadow-xl relative overflow-hidden">
          <div className="relative z-10 space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-bold rounded-full border border-emerald-500/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              Statutory Transparency & Legal Disclosures
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              {foundationInfo.legalName}
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Complete official registration documents, tax exemption recognitions, and statutory compliance details under the Ministry of Corporate Affairs, Govt. of India.
            </p>
          </div>
          {/* Decorative crest */}
          <div className="absolute right-6 -bottom-10 opacity-10 pointer-events-none">
            <Scale className="w-64 h-64 text-emerald-300" />
          </div>
        </div>

        {/* Legal Grid Table */}
        <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-600" />
              <h2 className="font-bold text-slate-900 text-base">
                Statutory Registration & Verification Master Registry
              </h2>
            </div>
            <span className="text-xs text-slate-500 font-mono">Incorporated: 2021-10-21</span>
          </div>

          <div className="divide-y divide-slate-100">
            {legalItems.map((item, idx) => (
              <div
                key={idx}
                className={`grid grid-cols-1 md:grid-cols-3 p-4 sm:px-6 hover:bg-slate-50/70 transition-colors ${
                  item.highlight ? 'bg-emerald-50/30' : ''
                }`}
              >
                <div className="text-xs font-semibold text-slate-600 flex items-center gap-2">
                  <span>{item.label}</span>
                </div>
                <div className="md:col-span-2 flex flex-wrap items-center justify-between gap-2 mt-1 md:mt-0">
                  <span
                    className={`text-xs sm:text-sm text-slate-900 ${
                      item.mono ? 'font-mono font-bold' : 'font-medium'
                    }`}
                  >
                    {item.value}
                  </span>
                  {item.badge && (
                    <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full border border-emerald-200">
                      {item.badge}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Offices & Banking Master Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Offices */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Building className="w-4 h-4 text-emerald-600" />
              Official Registered & Operating Premises
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-800 block text-[11px] uppercase tracking-wider mb-0.5">
                  Kolkata Operating Office
                </span>
                <p className="text-slate-700">{foundationInfo.kolkataOffice}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-800 block text-[11px] uppercase tracking-wider mb-0.5">
                  Registered Head Office (Sagar Island)
                </span>
                <p className="text-slate-700">{foundationInfo.registeredOffice}</p>
              </div>
            </div>
          </div>

          {/* Banking & Verification */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Landmark className="w-4 h-4 text-emerald-600" />
              Designated Institutional Banking Details
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Bank Name:</span>
                  <span className="font-bold text-slate-900">{foundationInfo.bankName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">IFSC Code:</span>
                  <span className="font-mono font-bold text-emerald-700">{foundationInfo.bankIfsc}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Beneficiary:</span>
                  <span className="font-semibold text-slate-800">{foundationInfo.legalName}</span>
                </div>
              </div>

              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-[11px] text-emerald-900 space-y-1">
                <span className="font-bold block">Signatory Authorities for Certifications & Audits:</span>
                <p>• {foundationInfo.directorName} (Director)</p>
                <p>• {foundationInfo.projectDirectorName} (Project Director)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
