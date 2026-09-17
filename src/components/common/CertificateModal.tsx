import React from 'react';
import { Certificate } from '../../types';
import { CertificateCard } from './CertificateCard';
import { X, Award, CheckCircle2 } from 'lucide-react';

interface CertificateModalProps {
  certificate: Certificate | null;
  onClose: () => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({ certificate, onClose }) => {
  if (!certificate) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 print:p-0 print:bg-white">
      <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 print:border-none print:shadow-none">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                Official Digital Certificate of Completion
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </h3>
              <p className="text-xs text-slate-500">
                Issued by JSSS FOUNDATION • ID: <span className="font-mono font-semibold text-slate-700">{certificate.certificateNo}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-8 bg-slate-100/60 overflow-x-auto flex justify-center print:p-0 print:bg-white">
          <CertificateCard certificate={certificate} />
        </div>
      </div>
    </div>
  );
};
