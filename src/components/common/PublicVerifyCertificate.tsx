import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Certificate } from '../../types';
import { CertificateCard } from './CertificateCard';
import {
  Search,
  CheckCircle,
  ShieldAlert,
  Award,
  QrCode,
  FileCheck,
  Calendar,
  Building,
  User,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export const PublicVerifyCertificate: React.FC = () => {
  const { certificates, students, foundationInfo } = useApp();
  const [query, setQuery] = useState('');
  const [searched, setSearched] = useState(false);
  const [matchedCert, setMatchedCert] = useState<Certificate | null>(null);

  // Check URL query parameters for ?verify=JSSS/2026/0527
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const verifyParam = params.get('verify');
    if (verifyParam) {
      setQuery(verifyParam);
      handleSearch(verifyParam);
    }
  }, [certificates]);

  const handleSearch = (searchTerm?: string) => {
    const term = (searchTerm !== undefined ? searchTerm : query).trim().toLowerCase();
    setSearched(true);
    if (!term) {
      setMatchedCert(null);
      return;
    }

    const found = certificates.find(
      (c) =>
        c.certificateNo.toLowerCase() === term ||
        c.studentRegNo.toLowerCase() === term ||
        c.verificationHash.toLowerCase() === term ||
        c.studentName.toLowerCase().includes(term)
    );

    setMatchedCert(found || null);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Verification Title Banner */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full border border-emerald-200">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Official Govt. Registered Academy Credential Verification Portal
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Verify JSSS Foundation Certificate
          </h1>
          <p className="text-sm text-slate-600 max-w-xl mx-auto">
            Instantly validate the authenticity of certificates issued by{' '}
            <span className="font-semibold text-slate-800">{foundationInfo.legalName}</span>. Enter the unique Certificate ID or Student Registration Number below.
          </p>
        </div>

        {/* Search Input Box */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl border border-slate-200 max-w-2xl mx-auto">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Enter Certificate No (e.g. JSSS/2026/0527) or Reg No"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-mono"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
            >
              <span>Verify Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Certificate IDs */}
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span className="font-medium">Try Sample Verified Certificates:</span>
            {certificates.slice(0, 3).map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  setQuery(c.certificateNo);
                  handleSearch(c.certificateNo);
                }}
                className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 font-mono text-[11px] rounded-lg border border-slate-200 transition-colors"
              >
                {c.certificateNo} ({c.studentName})
              </button>
            ))}
          </div>
        </div>

        {/* Verification Result Display */}
        {searched && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            {matchedCert ? (
              <div className="space-y-6">
                {/* Green Validated Alert Banner */}
                <div className="p-5 bg-emerald-50 border-2 border-emerald-500/80 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-emerald-600 text-white rounded-xl flex items-center justify-center shrink-0 shadow-md">
                      <CheckCircle className="w-7 h-7" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black px-2 py-0.5 bg-emerald-600 text-white rounded uppercase tracking-wider">
                          100% VERIFIED & AUTHENTIC
                        </span>
                        <span className="text-xs text-emerald-800 font-bold">Status: {matchedCert.status}</span>
                      </div>
                      <h3 className="text-lg font-extrabold text-slate-900 mt-0.5">
                        Certificate ID: <span className="font-mono text-emerald-700">{matchedCert.certificateNo}</span>
                      </h3>
                      <p className="text-xs text-slate-600">
                        Awarded to <strong className="text-slate-900">{matchedCert.studentName}</strong> for {matchedCert.courseName}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Detailed Summary Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Candidate Name</span>
                    <span className="text-sm font-extrabold text-slate-900 block mt-1">{matchedCert.studentName}</span>
                    <span className="text-xs text-slate-500 font-mono">Reg: {matchedCert.studentRegNo}</span>
                  </div>

                  <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Course Title</span>
                    <span className="text-sm font-extrabold text-slate-900 block mt-1">{matchedCert.courseName}</span>
                    <span className="text-xs text-emerald-700 font-semibold">{matchedCert.courseDuration}</span>
                  </div>

                  <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Performance Grade</span>
                    <span className="text-sm font-extrabold text-amber-600 block mt-1">{matchedCert.grade}</span>
                    <span className="text-xs text-slate-500">Score: {matchedCert.percentage}% Marks</span>
                  </div>

                  <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Signatory Authorities</span>
                    <span className="text-xs font-bold text-slate-900 block mt-1">
                      {matchedCert.signatoryDirector} (Director)
                    </span>
                    <span className="text-xs text-slate-600">
                      {matchedCert.signatoryProjectDirector} (Project Director)
                    </span>
                  </div>
                </div>

                {/* Render Official High-Res Certificate Preview */}
                <div className="pt-4">
                  <h3 className="text-center text-sm font-bold text-slate-700 uppercase tracking-widest mb-4">
                    Official Digital Certificate Record
                  </h3>
                  <CertificateCard certificate={matchedCert} />
                </div>
              </div>
            ) : (
              /* Not Found Card */
              <div className="p-8 bg-rose-50 border border-rose-200 rounded-2xl text-center space-y-3">
                <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-full mx-auto flex items-center justify-center">
                  <ShieldAlert className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-rose-950">Certificate Not Found</h3>
                <p className="text-xs text-rose-700 max-w-md mx-auto">
                  No certificate record matches "{query}". Please verify the Certificate ID (e.g. JSSS/2026/0527) or contact the JSSS Academic Examination Cell at{' '}
                  <span className="font-semibold">{foundationInfo.officialEmail}</span>.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
