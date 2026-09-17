import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { OfficialUpiQrCard } from './OfficialUpiQrCard';
import { PaymentReceipt } from '../../types';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  Printer,
  Copy,
  Check,
  Building2,
  FileCheck2,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

interface OfficialPaymentQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCourseId?: string;
  defaultAmount?: number;
}

export const OfficialPaymentQrModal: React.FC<OfficialPaymentQrModalProps> = ({
  isOpen,
  onClose,
  defaultCourseId,
  defaultAmount,
}) => {
  const { courses, students, currentStudent, processPayment, foundationInfo } = useApp();

  const [selectedCourseId, setSelectedCourseId] = useState<string>(
    defaultCourseId || currentStudent?.courseId || courses[0]?.id || 'CRS-01'
  );
  const selectedCourse = courses.find((c) => c.id === selectedCourseId) || courses[0];

  const [amount, setAmount] = useState<number>(
    defaultAmount ||
      (currentStudent
        ? currentStudent.totalFees - currentStudent.paidFees > 0
          ? currentStudent.totalFees - currentStudent.paidFees
          : selectedCourse?.fees || 4500
        : selectedCourse?.fees || 4500)
  );

  const [studentName, setStudentName] = useState(currentStudent?.name || '');
  const [studentRegOrPhone, setStudentRegOrPhone] = useState(
    currentStudent?.regNo || currentStudent?.phone || ''
  );
  const [utrNumber, setUtrNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [receipt, setReceipt] = useState<PaymentReceipt | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmitUtr = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (utrNumber.trim().length < 6) {
      setErrorMsg('Please enter a valid 12-digit UPI UTR or Transaction Reference number.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      // Find matching student or use current student or create virtual record
      const matchedStudent =
        currentStudent ||
        students.find(
          (s) =>
            s.regNo.toLowerCase() === studentRegOrPhone.trim().toLowerCase() ||
            s.phone === studentRegOrPhone.trim() ||
            s.email.toLowerCase() === studentRegOrPhone.trim().toLowerCase()
        ) ||
        students[0];

      const newReceipt = processPayment({
        studentId: matchedStudent?.id || 'STU-01',
        amount: Number(amount),
        paymentMethod: 'UPI',
        transactionId: `UPI-UTR-${utrNumber.trim().toUpperCase()}`,
        notes: `Course Fee for ${selectedCourse?.title || 'JSSS Course'} (Paid via Official Google Pay QR)`,
      });

      setIsSubmitting(false);
      setReceipt(newReceipt);
    }, 1000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 print:p-0">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base">Official Course Fees Payment QR</h3>
              <p className="text-[10px] text-slate-400">
                JEEB SEVA SHIB SEVA FOUNDATION • Govt of India Registered Section 8
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        {receipt ? (
          /* Receipt View */
          <div className="p-6 sm:p-8 space-y-5 text-center">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <h4 className="text-xl font-extrabold text-slate-900">Payment Recorded Successfully!</h4>
              <p className="text-xs text-slate-500 mt-1">
                Your course fee payment has been registered with the Foundation.
              </p>
            </div>

            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 text-left text-xs space-y-2.5">
              <div className="flex justify-between pb-2 border-b border-slate-200 font-bold">
                <span className="text-slate-600">Receipt Number:</span>
                <span className="font-mono text-emerald-700 font-bold">{receipt.receiptNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Student Name:</span>
                <span className="font-semibold text-slate-900">{receipt.studentName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Registration / ID:</span>
                <span className="font-mono text-slate-800">{receipt.studentRegNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Course:</span>
                <span className="font-medium text-slate-800">{receipt.courseName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Amount Paid:</span>
                <span className="font-extrabold text-slate-900 text-sm">₹{receipt.amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">UTR / Ref Number:</span>
                <span className="font-mono font-semibold text-slate-800">{receipt.transactionId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Beneficiary:</span>
                <span className="font-semibold text-slate-800">{foundationInfo.legalName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Date & Timestamp:</span>
                <span className="text-slate-700">{receipt.date}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2 print:hidden">
              <button
                onClick={handlePrint}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
              >
                <Printer className="w-4 h-4" />
                Print / Save Fee Receipt
              </button>
              <button
                onClick={onClose}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* QR & Verification Form */
          <div className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* Left Column: Official Google Pay UPI QR Card */}
            <div className="md:col-span-6 flex flex-col items-center justify-center">
              <OfficialUpiQrCard
                amount={amount}
                note={`JSSS Fee - ${selectedCourse?.code || 'Course'}`}
                courseName={selectedCourse?.title}
                compact={true}
              />
            </div>

            {/* Right Column: Step by Step Guide & UTR Confirmation */}
            <div className="md:col-span-6 space-y-4">
              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-2">
                <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  How to Pay Course Fees:
                </span>
                <ol className="text-xs text-slate-700 space-y-1.5 list-decimal list-inside">
                  <li>Open <strong>Google Pay</strong>, <strong>PhonePe</strong>, or <strong>Paytm</strong> on your phone.</li>
                  <li>Scan the official QR code on the left.</li>
                  <li>Verify payee: <strong className="text-emerald-800">{foundationInfo.upiName || 'Jeeb Seva Shib Seva Foundation'}</strong></li>
                  <li>Enter amount & complete the transaction securely.</li>
                  <li>Submit your 12-digit UPI UTR / Transaction ID below for instant clearance!</li>
                </ol>
              </div>

              {/* Fee and Course Selection */}
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Select Course
                  </label>
                  <select
                    value={selectedCourseId}
                    onChange={(e) => {
                      setSelectedCourseId(e.target.value);
                      const crs = courses.find((c) => c.id === e.target.value);
                      if (crs) setAmount(crs.fees);
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900"
                  >
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title} (₹{c.fees})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Fee Amount (₹ INR)
                  </label>
                  <input
                    type="number"
                    min="100"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                  />
                </div>
              </div>

              {/* UTR Verification Form */}
              <form onSubmit={handleSubmitUtr} className="space-y-3 pt-2 border-t border-slate-200">
                <h5 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <FileCheck2 className="w-3.5 h-3.5 text-emerald-600" />
                  Confirm Payment (Enter UTR / Ref ID)
                </h5>

                {!currentStudent && (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-medium text-slate-600 mb-0.5">
                        Student Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Candidate Name"
                        value={studentName}
                        onChange={(e) => setStudentName(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-medium text-slate-600 mb-0.5">
                        Reg No or Mobile *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Reg No / Mobile"
                        value={studentRegOrPhone}
                        onChange={(e) => setStudentRegOrPhone(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    12-Digit UPI Transaction UTR / Ref Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 423871928374 or TXN1029384"
                    value={utrNumber}
                    onChange={(e) => setUtrNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 uppercase focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">
                    Found in your Google Pay / PhonePe / Paytm receipt details.
                  </span>
                </div>

                {errorMsg && (
                  <p className="text-[11px] text-rose-600 font-semibold">{errorMsg}</p>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Verifying Transaction...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      Submit UTR & Generate Official Receipt
                    </>
                  )}
                </button>
              </form>

              {/* Foundation Bank Details Fallback */}
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-[10px] text-slate-600 space-y-0.5">
                <span className="font-bold text-slate-800 block">Official Bank Account Transfer:</span>
                <p>Bank: {foundationInfo.bankName} | IFSC: <code className="text-emerald-700 font-bold">{foundationInfo.bankIfsc}</code></p>
                <p>UPI ID: <code className="text-emerald-700 font-bold">{foundationInfo.upiId || '9907323533-1@okbizaxis'}</code></p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
