import React, { useState, useRef, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { OfflinePaymentEntry, Student } from '../../types';
import { OfficialUpiQrCard } from './OfficialUpiQrCard';
import {
  QrCode,
  CreditCard,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  Download,
  Printer,
  Plus,
  FileText,
  AlertCircle,
  Eye,
  ShieldCheck,
  Building2,
  DollarSign,
  ArrowRight,
  Upload,
  Copy,
  ExternalLink,
  ChevronRight,
  X,
  Smartphone,
  Landmark,
  Check,
  Phone,
  Mail,
  Sparkles,
  HelpCircle,
  Layers,
  Award,
} from 'lucide-react';

export interface OfflinePaymentsModuleProps {
  userRole?: 'SUPER_ADMIN' | 'MIS_ADMIN' | 'PARTNER';
  initialSection?: 'QR_REMITTANCE' | 'REMITTANCE_LIST';
}

export const OfflinePaymentsModule: React.FC<OfflinePaymentsModuleProps> = ({
  userRole,
  initialSection = 'QR_REMITTANCE',
}) => {
  const {
    accessibleOfflinePayments,
    accessibleStudents,
    courses,
    batches,
    partners,
    foundationInfo,
    addOfflinePayment,
    verifyOfflinePayment,
    deleteOfflinePayment,
    currentRole,
    currentAdmin,
    currentPartner,
    currentCenterMIS,
  } = useApp();

  const isAdmin = currentRole === 'ADMIN' && currentAdmin !== null;
  const isSuperAdmin = isAdmin && (currentAdmin?.role === 'SUPER_ADMIN' || currentAdmin?.isPrimaryAdmin);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'VERIFIED' | 'REJECTED'>('ALL');
  const [methodFilter, setMethodFilter] = useState<string>('ALL');
  const [centerFilter, setCenterFilter] = useState<string>('ALL');

  // Active Section: Head Office QR & Remittance Standee vs Remittance Records List
  const [activeSection, setActiveSection] = useState<'QR_REMITTANCE' | 'REMITTANCE_LIST'>(initialSection);

  // Dedicated Head Office QR & Remittance Section States
  const [qrCustomAmount, setQrCustomAmount] = useState<number | ''>(4500);
  const [qrStudentId, setQrStudentId] = useState<string>('');
  const [qrCustomNote, setQrCustomNote] = useState<string>('JSSS Course Fee Remittance');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2500);
  };

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewingReceipt, setViewingReceipt] = useState<OfflinePaymentEntry | null>(null);
  const [viewingProof, setViewingProof] = useState<OfflinePaymentEntry | null>(null);
  const [rejectingPayment, setRejectingPayment] = useState<OfflinePaymentEntry | null>(null);
  const [rejectionReasonText, setRejectionReasonText] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // New Offline Payment Form State
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [paymentAmount, setPaymentAmount] = useState<number | ''>('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<OfflinePaymentEntry['paymentMethod']>('DYNAMIC_QR');
  const [transactionId, setTransactionId] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [proofFileObj, setProofFileObj] = useState<{ url: string; fileName: string } | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Interactive Live QR Generator State for the selected amount
  const [showQRCard, setShowQRCard] = useState(true);
  const [copiedUPI, setCopiedUPI] = useState(false);

  const selectedStudent = useMemo(() => {
    return accessibleStudents.find((s) => s.id === selectedStudentId);
  }, [accessibleStudents, selectedStudentId]);

  // Derived Fee Metrics for the selected student
  const studentFeeMetrics = useMemo(() => {
    if (!selectedStudent) return { totalFee: 0, paid: 0, due: 0 };
    const totalFee = selectedStudent.totalFees || 4500;
    const paid = selectedStudent.paidFees || 0;
    const due = Math.max(0, totalFee - paid);
    return { totalFee, paid, due };
  }, [selectedStudent]);

  // Auto-fill student details on change
  const handleStudentSelect = (stuId: string) => {
    setSelectedStudentId(stuId);
    const stu = accessibleStudents.find((s) => s.id === stuId);
    if (stu) {
      const remaining = Math.max(0, stu.totalFees - stu.paidFees);
      setPaymentAmount(remaining > 0 ? remaining : stu.totalFees || 4500);
      setTransactionId(`UPI-${Date.now().toString().slice(-8)}`);
    }
  };

  const selectedQrStudent = useMemo(() => {
    return accessibleStudents.find((s) => s.id === qrStudentId);
  }, [accessibleStudents, qrStudentId]);

  const handleQrStudentSelect = (stuId: string) => {
    setQrStudentId(stuId);
    if (!stuId) {
      setQrCustomNote('JSSS Course Fee Remittance');
      return;
    }
    const stu = accessibleStudents.find((s) => s.id === stuId);
    if (stu) {
      const remaining = Math.max(0, (stu.totalFees || 4500) - (stu.paidFees || 0));
      setQrCustomAmount(remaining > 0 ? remaining : stu.totalFees || 4500);
      setQrCustomNote(`Course Fee: ${stu.name} (${stu.regNo}) - ${stu.courseName || 'Vocational Training'}`);
    }
  };

  const handleStartRemittanceFromQR = () => {
    if (qrStudentId) {
      handleStudentSelect(qrStudentId);
    } else if (accessibleStudents.length > 0 && !selectedStudentId) {
      handleStudentSelect(accessibleStudents[0].id);
    }
    if (qrCustomAmount && typeof qrCustomAmount === 'number') {
      setPaymentAmount(qrCustomAmount);
    }
    setPaymentNotes(qrCustomNote);
    setPaymentMethod('DYNAMIC_QR');
    setShowAddModal(true);
  };

  // Proof File Upload handler
  const handleProofSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setFormError('Receipt/Proof screenshot cannot exceed 10 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setProofFileObj({
        url: reader.result as string,
        fileName: file.name,
      });
      setFormError(null);
    };
    reader.readAsDataURL(file);
  };

  // Handle New Offline Payment Submission
  const handleAddPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) {
      setFormError('Please select a valid enrolled student.');
      return;
    }
    const numAmount = Number(paymentAmount);
    if (!numAmount || numAmount <= 0) {
      setFormError('Please enter a valid payment amount greater than ₹0.');
      return;
    }
    if (!transactionId.trim()) {
      setFormError('Please enter the Transaction ID, UTR Number, or Cheque/DD reference.');
      return;
    }

    const assignedPartner = partners.find((p) => p.id === selectedStudent.partnerId);
    const assignedCourse = courses.find((c) => c.id === selectedStudent.courseId);
    const assignedBatch = batches.find((b) => b.id === selectedStudent.batchId);

    const submitterName =
      currentAdmin?.name ||
      currentCenterMIS?.name ||
      currentPartner?.ownerName ||
      'Authorized Center Representative';

    const submitterRole: OfflinePaymentEntry['submittedByRole'] =
      isAdmin ? 'ADMIN' : currentCenterMIS ? 'CENTER_MIS' : 'PARTNER';

    const qrDetails =
      paymentMethod === 'DYNAMIC_QR' || paymentMethod === 'UPI'
        ? {
            upiId: foundationInfo.upiId || '9907323533-1@okbizaxis',
            merchantName: foundationInfo.legalName || 'Jeeb Seva Shib Seva Foundation',
            amount: numAmount,
            transactionNote: `Course Fee: ${selectedStudent.name} (${selectedStudent.regNo})`,
          }
        : undefined;

    // Center Partner/MIS creates with PENDING; Admin can auto-verify if chosen
    const initialStatus: OfflinePaymentEntry['paymentStatus'] = isAdmin ? 'VERIFIED' : 'PENDING';

    const newPayment = addOfflinePayment({
      studentId: selectedStudent.id,
      studentName: selectedStudent.name,
      studentRegNo: selectedStudent.regNo,
      partnerId: selectedStudent.partnerId,
      partnerName: assignedPartner?.centerName || 'Partner Skill Center',
      courseId: selectedStudent.courseId,
      courseName: assignedCourse?.title || selectedStudent.courseName || 'Vocational Training',
      batchId: selectedStudent.batchId,
      batchName: assignedBatch?.batchName || 'Standard Center Batch',
      amount: numAmount,
      paymentDate,
      paymentMethod,
      transactionId: transactionId.trim(),
      receiptProofUrl: proofFileObj?.url || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
      receiptFileName: proofFileObj?.fileName || 'Official_Remittance_Slip.png',
      qrPaymentDetails: qrDetails,
      paymentStatus: initialStatus,
      totalCourseFees: studentFeeMetrics.totalFee,
      totalPaid: studentFeeMetrics.paid + (initialStatus === 'VERIFIED' ? numAmount : 0),
      totalDue: Math.max(0, studentFeeMetrics.due - (initialStatus === 'VERIFIED' ? numAmount : 0)),
      remainingBalance: Math.max(0, studentFeeMetrics.due - (initialStatus === 'VERIFIED' ? numAmount : 0)),
      notes: paymentNotes.trim() || undefined,
      submittedByRole: submitterRole,
      submittedByName: submitterName,
      verifiedBy: initialStatus === 'VERIFIED' ? currentAdmin?.name || 'Administrator' : undefined,
      verifiedDate: initialStatus === 'VERIFIED' ? new Date().toISOString().split('T')[0] : undefined,
    });

    setFeedback({
      type: 'success',
      message: `Offline payment entry recorded successfully (Receipt No: ${newPayment.receiptNumber}). ${
        initialStatus === 'VERIFIED' ? 'Student fee record updated.' : 'Awaiting Directorate MIS verification.'
      }`,
    });

    setShowAddModal(false);
    setSelectedStudentId('');
    setPaymentAmount('');
    setTransactionId('');
    setPaymentNotes('');
    setProofFileObj(null);
    setFormError(null);
    setTimeout(() => setFeedback(null), 6000);
  };

  // Handle Admin Verification
  const handleVerify = (payment: OfflinePaymentEntry) => {
    const success = verifyOfflinePayment(payment.id, true, undefined, currentAdmin?.name || 'Directorate MIS Admin');
    if (success) {
      setFeedback({
        type: 'success',
        message: `Offline payment ${payment.receiptNumber} verified and credited to ${payment.studentName}!`,
      });
      setTimeout(() => setFeedback(null), 5000);
    }
  };

  // Handle Admin Rejection
  const handleRejectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingPayment) return;
    if (!rejectionReasonText.trim()) {
      alert('Please specify a rejection reason for the training partner.');
      return;
    }

    const success = verifyOfflinePayment(
      rejectingPayment.id,
      false,
      rejectionReasonText.trim(),
      currentAdmin?.name || 'Directorate MIS Admin'
    );

    if (success) {
      setFeedback({
        type: 'error',
        message: `Payment ${rejectingPayment.receiptNumber} was rejected. Rejection reason recorded.`,
      });
      setRejectingPayment(null);
      setRejectionReasonText('');
      setTimeout(() => setFeedback(null), 5000);
    }
  };

  // Copy UPI details helper
  const handleCopyUPI = (upiString: string) => {
    navigator.clipboard.writeText(upiString);
    setCopiedUPI(true);
    setTimeout(() => setCopiedUPI(false), 2000);
  };

  // Print Receipt handler
  const handlePrintReceipt = () => {
    window.print();
  };

  // Filtered payment records
  const filteredPayments = useMemo(() => {
    return accessibleOfflinePayments.filter((p) => {
      const matchesSearch =
        p.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.studentRegNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.receiptNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.transactionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.partnerName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'ALL' || p.paymentStatus === statusFilter;
      const matchesMethod = methodFilter === 'ALL' || p.paymentMethod === methodFilter;
      const matchesCenter = centerFilter === 'ALL' || p.partnerId === centerFilter;

      return matchesSearch && matchesStatus && matchesMethod && matchesCenter;
    });
  }, [accessibleOfflinePayments, searchQuery, statusFilter, methodFilter, centerFilter]);

  // Aggregate Metrics
  const stats = useMemo(() => {
    let totalVerifiedAmount = 0;
    let totalPendingAmount = 0;
    let pendingCount = 0;
    let verifiedCount = 0;
    let rejectedCount = 0;

    accessibleOfflinePayments.forEach((p) => {
      if (p.paymentStatus === 'VERIFIED') {
        totalVerifiedAmount += p.amount;
        verifiedCount++;
      } else if (p.paymentStatus === 'PENDING') {
        totalPendingAmount += p.amount;
        pendingCount++;
      } else if (p.paymentStatus === 'REJECTED') {
        rejectedCount++;
      }
    });

    return {
      totalVerifiedAmount,
      totalPendingAmount,
      pendingCount,
      verifiedCount,
      rejectedCount,
      totalCount: accessibleOfflinePayments.length,
    };
  }, [accessibleOfflinePayments]);

  const upiId = foundationInfo.upiId || '9907323533-1@okbizaxis';
  const qrString = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(
    foundationInfo.legalName || 'Jeeb Seva Shib Seva Foundation'
  )}&cu=INR${paymentAmount ? `&am=${paymentAmount}` : ''}&tn=Course%20Fee`;

  return (
    <div className="space-y-6" id="offline-payments-module">
      {/* Top Banner & Quick Stats */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-400/30">
              <QrCode className="w-3.5 h-3.5" />
              Offline Payments & Official SBI QR Remittance Module
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Offline Payments & QR Remittance
            </h2>
            <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
              Record, verify, and track bank transfers, offline cash slips, UPI merchant QR remittances, and demand drafts with complete receipt audit trails and student fee balance synchronization.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              id="new-offline-payment-btn"
              onClick={() => {
                setShowAddModal(true);
                setFormError(null);
                if (accessibleStudents.length > 0 && !selectedStudentId) {
                  handleStudentSelect(accessibleStudents[0].id);
                }
              }}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-lg shadow-emerald-600/30 transition-all cursor-pointer transform active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Record Offline Payment / QR Entry
            </button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800">
          <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
            <span className="text-[11px] font-medium text-slate-400 block">Total Remittances</span>
            <span className="text-xl font-bold text-white mt-1 block">
              ₹{stats.totalVerifiedAmount.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-emerald-400 font-medium">
              {stats.verifiedCount} Verified Transactions
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-800/40">
            <span className="text-[11px] font-medium text-amber-300 block">Pending Verification</span>
            <span className="text-xl font-bold text-amber-200 mt-1 block">
              ₹{stats.totalPendingAmount.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-amber-400 font-medium">
              {stats.pendingCount} Entries Awaiting Review
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
            <span className="text-[11px] font-medium text-slate-400 block">Total Records</span>
            <span className="text-xl font-bold text-white mt-1 block">{stats.totalCount}</span>
            <span className="text-[10px] text-slate-400 font-medium">Across all center batches</span>
          </div>

          <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-800/40">
            <span className="text-[11px] font-medium text-rose-300 block">Rejected Remittances</span>
            <span className="text-xl font-bold text-rose-200 mt-1 block">{stats.rejectedCount}</span>
            <span className="text-[10px] text-rose-400 font-medium">Requires partner resubmission</span>
          </div>
        </div>
      </div>

      {/* Global Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between gap-3 text-sm font-medium border ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800'
              : 'bg-rose-50 text-rose-900 border-rose-200 dark:bg-rose-950/30 dark:text-rose-300 dark:border-rose-800'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="p-1 hover:bg-black/5 rounded-lg text-slate-500">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Section Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3" id="remittance-section-tabs">
        <div className="flex flex-wrap items-center gap-2">
          <button
            id="tab-btn-head-office-qr"
            type="button"
            onClick={() => setActiveSection('QR_REMITTANCE')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
              activeSection === 'QR_REMITTANCE'
                ? 'bg-slate-900 text-white shadow-sm ring-2 ring-emerald-500/50'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
            }`}
          >
            <QrCode className="w-4 h-4 text-emerald-400" />
            <span>Head Office Official QR & Bank Remittance Standee</span>
            <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-mono">
              9907323533-1@okbizaxis
            </span>
          </button>

          <button
            id="tab-btn-remittance-records"
            type="button"
            onClick={() => setActiveSection('REMITTANCE_LIST')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
              activeSection === 'REMITTANCE_LIST'
                ? 'bg-slate-900 text-white shadow-sm ring-2 ring-indigo-500/50'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
            }`}
          >
            <CreditCard className="w-4 h-4 text-indigo-400" />
            <span>Remittance Records & Ledger ({stats.totalCount})</span>
            {stats.pendingCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-amber-500 text-white text-[10px]">
                {stats.pendingCount} Pending
              </span>
            )}
          </button>
        </div>

        <button
          type="button"
          onClick={() => {
            setShowAddModal(true);
            setFormError(null);
            if (accessibleStudents.length > 0 && !selectedStudentId) {
              handleStudentSelect(accessibleStudents[0].id);
            }
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Record Remittance Entry</span>
        </button>
      </div>

      {/* 🏛️ VIEW 1: HEAD OFFICE OFFICIAL QR & REMITTANCE SECTION */}
      {activeSection === 'QR_REMITTANCE' && (
        <div className="space-y-8" id="head-office-qr-section">
          {/* Section 1: Main Remittance Hub (Standee + Interactive Remittance Generator) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Standee Column: Google Pay Official Standee */}
            <div className="lg:col-span-5 flex flex-col items-center">
              <OfficialUpiQrCard
                amount={typeof qrCustomAmount === 'number' && qrCustomAmount > 0 ? qrCustomAmount : undefined}
                note={qrCustomNote}
                studentName={selectedQrStudent?.name}
                courseName={selectedQrStudent?.courseName}
                showActions={true}
                compact={false}
                className="w-full"
              />

              <div className="mt-4 text-center space-y-1">
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  Official NPCI Unified Payments Interface (UPI) 2.0 Merchant Terminal
                </p>
                <p className="text-[10px] text-slate-400 font-mono">
                  Beneficiary: JEEB SEVA SHIB SEVA FOUNDATION • Axis Bank VPA Gateway
                </p>
              </div>
            </div>

            {/* Control & Customizer Column */}
            <div className="lg:col-span-7 space-y-6">
              {/* Dynamic Amount & Student Note Configurator */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-600" />
                      Live QR Remittance Generator
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Customize the payable amount and reference notes. The QR standee on the left updates dynamically in real-time.
                    </p>
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 rounded-full text-[11px] font-bold self-start">
                    Zero Surcharge • Instant Credit
                  </span>
                </div>

                {/* Quick Preset Buttons */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Select Preset Amount or Enter Custom Value
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {[500, 1000, 2000, 2500, 4500, 10000].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setQrCustomAmount(amt)}
                        className={`py-2 px-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                          qrCustomAmount === amt
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs scale-105'
                            : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        ₹{amt.toLocaleString('en-IN')}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Custom Amount Input */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Remittance Amount (₹ INR)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm">₹</span>
                      <input
                        type="number"
                        min="1"
                        value={qrCustomAmount}
                        onChange={(e) => setQrCustomAmount(e.target.value === '' ? '' : Number(e.target.value))}
                        placeholder="e.g. 4500"
                        className="w-full pl-8 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Student Picker (Optional) */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Link to Student (Auto-Fill Due & Note)
                    </label>
                    <select
                      value={qrStudentId}
                      onChange={(e) => handleQrStudentSelect(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="">-- General Remittance (No Student) --</option>
                      {accessibleStudents.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.regNo}) - Due: ₹{Math.max(0, (s.totalFees || 4500) - (s.paidFees || 0))}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Custom Note Input */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    UPI Transaction Reference / Purpose Note
                  </label>
                  <input
                    type="text"
                    value={qrCustomNote}
                    onChange={(e) => setQrCustomNote(e.target.value)}
                    placeholder="e.g. Batch 2026 Examination Fee Remittance"
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Actions Bar */}
                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={handleStartRemittanceFromQR}
                    className="flex-1 min-w-[220px] inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Record Remittance For This Payment</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <a
                    href={`upi://pay?pa=${encodeURIComponent(foundationInfo.upiId || '9907323533-1@okbizaxis')}&pn=${encodeURIComponent(
                      foundationInfo.legalName || 'Jeeb Seva Shib Seva Foundation'
                    )}&cu=INR${qrCustomAmount ? `&am=${qrCustomAmount}` : ''}&tn=${encodeURIComponent(qrCustomNote || 'Course Fee')}`}
                    className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition-all"
                  >
                    <Smartphone className="w-4 h-4 text-emerald-400" />
                    <span>Pay via UPI App</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Official Bank Account Details Card (SBI Wire Transfer) */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400 flex items-center justify-center font-black">
                      <Landmark className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        Direct Bank Wire Transfer (NEFT / RTGS / IMPS)
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        State Bank of India Corporate Current Account
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-blue-50 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300 rounded-full text-[10px] font-bold">
                    SBI Core Banking
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {/* Beneficiary */}
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Beneficiary Name</span>
                      <span className="font-bold text-slate-900 dark:text-white text-xs mt-0.5 block">
                        {foundationInfo.legalName}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(foundationInfo.legalName, 'beneficiary')}
                      className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-500 cursor-pointer"
                      title="Copy Beneficiary Name"
                    >
                      {copiedField === 'beneficiary' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {/* Bank Name */}
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Bank Name & Branch</span>
                    <span className="font-bold text-slate-900 dark:text-white text-xs mt-0.5 block">
                      {foundationInfo.bankName || 'State Bank of India'} (Sagar Sapkhali Branch - 06481)
                    </span>
                  </div>

                  {/* Account Number */}
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Current Account Number</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white text-sm mt-0.5 block tracking-wider">
                        40489912048
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard('40489912048', 'account')}
                      className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-500 cursor-pointer"
                      title="Copy Account Number"
                    >
                      {copiedField === 'account' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {/* IFSC Code */}
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">IFSC Code</span>
                      <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400 text-sm mt-0.5 block tracking-wider">
                        {foundationInfo.bankIfsc || 'SBIN0006481'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(foundationInfo.bankIfsc || 'SBIN0006481', 'ifsc')}
                      className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-500 cursor-pointer"
                      title="Copy IFSC Code"
                    >
                      {copiedField === 'ifsc' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Statutory Affiliations & Regulatory Compliance */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-md border border-slate-800 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-full text-[10px] font-bold mb-1.5">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Ministry of Corporate Affairs & Govt. of India Registered</span>
                </div>
                <h3 className="text-lg font-bold text-white tracking-tight">
                  Statutory Accreditations & Tax Exemption Credentials
                </h3>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                <span>CIN: {foundationInfo.cin}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Legal Entity</span>
                <span className="font-bold text-white text-xs mt-1 block">Section 8 Non-Profit</span>
                <span className="text-[10px] text-slate-400">Govt. of India</span>
              </div>

              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Corporate ID (CIN)</span>
                <span className="font-mono font-bold text-emerald-400 text-xs mt-1 block truncate" title={foundationInfo.cin}>
                  {foundationInfo.cin}
                </span>
                <span className="text-[10px] text-slate-400">RoC Kolkata</span>
              </div>

              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Permanent A/C (PAN)</span>
                <span className="font-mono font-bold text-white text-xs mt-1 block">
                  {foundationInfo.pan || 'AAFCJ3732J'}
                </span>
                <span className="text-[10px] text-slate-400">Govt. Income Tax</span>
              </div>

              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">NITI Aayog NGO Darpan</span>
                <span className="font-mono font-bold text-white text-xs mt-1 block truncate" title={foundationInfo.ngoDarpanId}>
                  {foundationInfo.ngoDarpanId}
                </span>
                <span className="text-[10px] text-slate-400">Govt. Portal Verified</span>
              </div>

              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">MSME Udyam</span>
                <span className="font-mono font-bold text-white text-xs mt-1 block truncate" title={foundationInfo.udyamMsme}>
                  {foundationInfo.udyamMsme}
                </span>
                <span className="text-[10px] text-slate-400">Enterprise Reg.</span>
              </div>

              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">12A & 80G Approval</span>
                <span className="font-bold text-emerald-400 text-xs mt-1 block">Tax Deductible</span>
                <span className="text-[10px] text-slate-400">Section 80G Eligible</span>
              </div>
            </div>
          </div>

          {/* Section 3: Standard Operating Procedure (SOP) & Helplines */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 4-Step SOP Guide */}
            <div className="md:col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-600" />
                Standard Remittance Workflow & Verification SOP
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    1
                  </span>
                  <div>
                    <strong className="text-slate-900 dark:text-white block font-semibold">Scan QR or Transfer via SBI</strong>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Use GPay, PhonePe, Paytm, BHIM, or your bank's NEFT/RTGS app to remit funds to the Head Office.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    2
                  </span>
                  <div>
                    <strong className="text-slate-900 dark:text-white block font-semibold">Save 12-Digit UTR / Ref Number</strong>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Note down the bank transaction reference / UTR number and capture a clear screenshot of the payment receipt.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    3
                  </span>
                  <div>
                    <strong className="text-slate-900 dark:text-white block font-semibold">Submit Remittance Entry</strong>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Click "Record Remittance", select the student, enter the UTR number, and upload the payment proof screenshot.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    4
                  </span>
                  <div>
                    <strong className="text-slate-900 dark:text-white block font-semibold">MIS Verification & Digital Receipt</strong>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Directorate accounts team verifies the transfer and issues an instant, tamper-proof student fee receipt.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Accounts Desk & Helpline */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-600" />
                Directorate Accounts Desk
              </h4>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Phone Support</span>
                  <div className="font-bold text-slate-900 dark:text-white text-xs">+91 99073 23533 / +91 70011 82588</div>
                  <span className="text-[10px] text-slate-500 block">Mon - Sat: 10:00 AM - 6:30 PM IST</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Billing & Remittance Inquiries</span>
                  <div className="font-mono text-emerald-600 dark:text-emerald-400 font-bold text-xs truncate">
                    info@jsssfoundation.in
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Kolkata Liaison Office</span>
                  <div className="text-[11px] text-slate-600 dark:text-slate-300">
                    270 Sisir Bagan Road, Behala Jaysree More, Kolkata – 700034
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 📋 VIEW 2: REMITTANCE RECORDS & VERIFICATION LEDGER */}
      {activeSection === 'REMITTANCE_LIST' && (
        <div className="space-y-4" id="remittance-records-view">
          {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            id="search-offline-payments"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search student, reg no, UTR, receipt..."
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending Verification</option>
            <option value="VERIFIED">Verified & Credited</option>
            <option value="REJECTED">Rejected</option>
          </select>

          {/* Payment Method Filter */}
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="ALL">All Payment Methods</option>
            <option value="DYNAMIC_QR">Dynamic QR Remittance</option>
            <option value="UPI">UPI Direct / GPay / PhonePe</option>
            <option value="BANK_TRANSFER">Bank Transfer (NEFT / RTGS)</option>
            <option value="CASH">Cash at Center</option>
            <option value="CHEQUE">Cheque</option>
            <option value="DEMAND_DRAFT">Demand Draft (DD)</option>
          </select>

          {/* Center Filter (For Admin) */}
          {isAdmin && (
            <select
              value={centerFilter}
              onChange={(e) => setCenterFilter(e.target.value)}
              className="px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="ALL">All Centers</option>
              {partners.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.centerName} ({p.partnerCode})
                </option>
              ))}
            </select>
          )}

          {/* Print Report */}
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Log
          </button>
        </div>
      </div>

      {/* Offline Payments Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Receipt / Date</th>
                <th className="py-3.5 px-4">Student Details</th>
                <th className="py-3.5 px-4">Center & Course</th>
                <th className="py-3.5 px-4">Amount & Method</th>
                <th className="py-3.5 px-4">Transaction ID / UTR</th>
                <th className="py-3.5 px-4">Balance Breakdown</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <div className="space-y-2">
                      <CreditCard className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600" />
                      <p className="font-medium">No offline payment remittances found</p>
                      <p className="text-[11px] text-slate-500">
                        Click "Record Offline Payment" to enter a student fee transaction.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredPayments.map((payment) => (
                  <tr
                    key={payment.id}
                    id={`offline-payment-row-${payment.id}`}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    {/* Receipt & Date */}
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-bold text-slate-900 dark:text-white">
                        {payment.receiptNumber}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        {payment.paymentDate}
                      </div>
                    </td>

                    {/* Student Name & Reg */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {payment.studentName}
                      </div>
                      <div className="font-mono text-[11px] text-indigo-600 dark:text-indigo-400">
                        {payment.studentRegNo}
                      </div>
                    </td>

                    {/* Center & Course */}
                    <td className="py-3.5 px-4 max-w-[200px]">
                      <div className="truncate font-medium text-slate-800 dark:text-slate-200" title={payment.courseName}>
                        {payment.courseName}
                      </div>
                      <div className="truncate text-[11px] text-slate-400" title={payment.partnerName}>
                        {payment.partnerName}
                      </div>
                    </td>

                    {/* Amount & Method */}
                    <td className="py-3.5 px-4">
                      <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                        ₹{(payment.amount ?? 0).toLocaleString('en-IN')}
                      </div>
                      <span className="inline-block text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 mt-0.5">
                        {(payment.paymentMethod || 'PAYMENT').replace('_', ' ')}
                      </span>
                    </td>

                    {/* Transaction ID / Proof */}
                    <td className="py-3.5 px-4 font-mono text-[11px]">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">
                        {payment.transactionId}
                      </div>
                      {payment.receiptProofUrl && (
                        <button
                          onClick={() => setViewingProof(payment)}
                          className="text-[10px] text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 underline cursor-pointer mt-0.5 block"
                        >
                          View Receipt Slip
                        </button>
                      )}
                    </td>

                    {/* Balance Breakdown */}
                    <td className="py-3.5 px-4">
                      <div className="text-[11px] text-slate-500">
                        Total Fee: <span className="font-semibold text-slate-700 dark:text-slate-300">₹{payment.totalCourseFees}</span>
                      </div>
                      <div className="text-[11px] text-emerald-600">
                        Paid: ₹{payment.totalPaid}
                      </div>
                      <div className="text-[11px] font-semibold text-rose-600">
                        Due: ₹{payment.remainingBalance}
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4">
                      {payment.paymentStatus === 'VERIFIED' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Verified & Credited
                        </span>
                      )}
                      {payment.paymentStatus === 'PENDING' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                          <Clock className="w-3.5 h-3.5" />
                          Pending Review
                        </span>
                      )}
                      {payment.paymentStatus === 'REJECTED' && (
                        <div className="space-y-0.5">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                            <XCircle className="w-3.5 h-3.5" />
                            Rejected
                          </span>
                          {payment.rejectionReason && (
                            <p className="text-[10px] text-rose-600 dark:text-rose-400 font-medium max-w-[150px] truncate" title={payment.rejectionReason}>
                              {payment.rejectionReason}
                            </p>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right space-x-1">
                      {/* Print Official Receipt Modal */}
                      <button
                        onClick={() => setViewingReceipt(payment)}
                        title="Download / Print Official Receipt"
                        className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors cursor-pointer"
                      >
                        <Printer className="w-4 h-4" />
                      </button>

                      {/* Admin Verification Controls */}
                      {isAdmin && payment.paymentStatus === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleVerify(payment)}
                            title="Verify & Credit Fees"
                            className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-colors cursor-pointer"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setRejectingPayment(payment);
                              setRejectionReasonText('');
                            }}
                            title="Reject Remittance"
                            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )}

      {/* RECORD OFFLINE PAYMENT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Record Offline Payment & QR Remittance
                  </h3>
                  <p className="text-xs text-slate-500">
                    UPI Merchant Scanner • Bank NEFT/RTGS • Cash at Center • Cheque
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleAddPaymentSubmit} className="space-y-4">
              {/* Student Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Select Enrolled Student *
                </label>
                <select
                  required
                  value={selectedStudentId}
                  onChange={(e) => handleStudentSelect(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">-- Choose a Student --</option>
                  {accessibleStudents.map((stu) => (
                    <option key={stu.id} value={stu.id}>
                      {stu.name} ({stu.regNo}) • Total Fee: ₹{stu.totalFees} • Due: ₹
                      {Math.max(0, stu.totalFees - stu.paidFees)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Student Fee Details Card */}
              {selectedStudent && (
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-xs grid grid-cols-3 gap-3">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Total Course Fee</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                      ₹{studentFeeMetrics.totalFee}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Total Amount Paid</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                      ₹{studentFeeMetrics.paid}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Current Remaining Due</span>
                    <span className="font-bold text-rose-600 dark:text-rose-400 text-sm">
                      ₹{studentFeeMetrics.due}
                    </span>
                  </div>
                </div>
              )}

              {/* Payment Amount & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Payment Amount (₹) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                      ₹
                    </span>
                    <input
                      type="number"
                      required
                      min={1}
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="e.g. 3000"
                      className="w-full pl-8 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Payment Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Payment Method *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'DYNAMIC_QR', label: 'Dynamic QR Remittance', icon: QrCode },
                    { id: 'UPI', label: 'Direct UPI / GPay', icon: Smartphone },
                    { id: 'BANK_TRANSFER', label: 'NEFT / RTGS Transfer', icon: Landmark },
                    { id: 'CASH', label: 'Cash at Center', icon: DollarSign },
                    { id: 'CHEQUE', label: 'Cheque Deposit', icon: FileText },
                    { id: 'DEMAND_DRAFT', label: 'Demand Draft (DD)', icon: Building2 },
                  ].map((m) => {
                    const Icon = m.icon;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setPaymentMethod(m.id as any)}
                        className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-medium transition-all text-left cursor-pointer ${
                          paymentMethod === m.id
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-900 dark:bg-emerald-950/40 dark:border-emerald-500 dark:text-emerald-200'
                            : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{m.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic QR Live Remittance Box */}
              {(paymentMethod === 'DYNAMIC_QR' || paymentMethod === 'UPI') && (
                <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-slate-900 border border-emerald-200 dark:border-emerald-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                      <QrCode className="w-4 h-4 text-emerald-600" />
                      Official Directorate Merchant UPI QR
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyUPI(upiId)}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-white dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-700 hover:bg-emerald-50 cursor-pointer"
                    >
                      <Copy className="w-3 h-3" />
                      {copiedUPI ? 'Copied!' : 'Copy UPI ID'}
                    </button>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-4 bg-white dark:bg-slate-800 p-3.5 rounded-xl border border-emerald-100 dark:border-emerald-900">
                    {/* Live SVG QR representation */}
                    <div className="w-24 h-24 bg-slate-900 p-2 rounded-xl flex items-center justify-center text-white flex-shrink-0 shadow-sm">
                      <div className="text-center space-y-1">
                        <QrCode className="w-12 h-12 mx-auto text-emerald-400" />
                        <span className="text-[9px] font-bold block text-emerald-300">SCAN TO PAY</span>
                      </div>
                    </div>

                    <div className="space-y-1 text-xs text-slate-700 dark:text-slate-300 w-full">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Merchant:</span>
                        <span className="font-semibold text-slate-900 dark:text-white truncate max-w-[200px]">
                          {foundationInfo.legalName}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Official UPI ID:</span>
                        <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          {upiId}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Amount to Remit:</span>
                        <span className="font-bold text-slate-900 dark:text-white">
                          ₹{paymentAmount || 0}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-700">
                        Scan from PhonePe, GPay, Paytm, or BHIM. Enter transaction reference below once completed.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Transaction ID / UTR Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Transaction ID / UTR / Reference Number *
                </label>
                <input
                  type="text"
                  required
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="e.g. UPI/123456789012 or UTR-SBIN0029381029 or Cash Slip #204"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Receipt / Proof Upload */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Upload Receipt / Proof of Remittance (Max 10 MB)
                </label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  ref={fileInputRef}
                  onChange={handleProofSelection}
                  className="hidden"
                />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 rounded-xl p-4 text-center cursor-pointer bg-slate-50/60 dark:bg-slate-800/40"
                >
                  {proofFileObj ? (
                    <div className="flex items-center justify-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{proofFileObj.fileName}</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
                      <Upload className="w-4 h-4" />
                      <span>Click to attach bank slip screenshot or payment voucher</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Narration / Notes
                </label>
                <input
                  type="text"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  placeholder="e.g. Student deposited 1st installment cash at counter"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
                >
                  Record Payment Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW / PRINT OFFICIAL RECEIPT MODAL */}
      {viewingReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white text-slate-900 rounded-2xl max-w-xl w-full p-8 shadow-2xl border border-slate-200 space-y-6 animate-in fade-in zoom-in-95 duration-150 print:p-0 print:border-none print:shadow-none">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b-2 border-slate-900">
              <div className="space-y-1">
                <h2 className="text-lg font-black uppercase tracking-wider text-slate-900">
                  {foundationInfo.legalName}
                </h2>
                <p className="text-[11px] text-slate-600">
                  Govt. Registered Vocational & Skill Development Educational Trust
                </p>
                <p className="text-[10px] text-slate-500">
                  Reg No: {foundationInfo.registrationNo || foundationInfo.cin} • NITI Aayog NGO Darpan: {foundationInfo.ngoDarpanId}
                </p>
              </div>
              <div className="text-right">
                <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold uppercase">
                  Fee Receipt
                </span>
                <p className="font-mono text-xs font-bold text-slate-900 mt-1">
                  {viewingReceipt.receiptNumber}
                </p>
              </div>
            </div>

            {/* Receipt Body */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Student Name:</span>
                <span className="font-bold text-sm text-slate-900">{viewingReceipt.studentName}</span>
              </div>

              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Registration No:</span>
                <span className="font-mono font-bold text-slate-900">{viewingReceipt.studentRegNo}</span>
              </div>

              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Enrolled Course:</span>
                <span className="font-semibold text-slate-800">{viewingReceipt.courseName}</span>
              </div>

              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Training Center:</span>
                <span className="font-semibold text-slate-800">{viewingReceipt.partnerName}</span>
              </div>

              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Payment Date:</span>
                <span className="font-medium text-slate-800">{viewingReceipt.paymentDate}</span>
              </div>

              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Payment Method:</span>
                <span className="font-semibold text-slate-800">
                  {viewingReceipt.paymentMethod.replace('_', ' ')}
                </span>
              </div>

              <div className="col-span-2">
                <span className="text-slate-500 block text-[10px] uppercase">Transaction ID / Reference:</span>
                <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded">
                  {viewingReceipt.transactionId}
                </span>
              </div>
            </div>

            {/* Amount Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
              <div className="bg-slate-100 px-4 py-2 font-bold flex justify-between">
                <span>Description</span>
                <span>Amount (INR)</span>
              </div>
              <div className="p-4 space-y-2">
                <div className="flex justify-between text-slate-700">
                  <span>Course Tuition & Laboratory Examination Fee</span>
                  <span className="font-semibold">₹{(viewingReceipt.amount ?? 0).toLocaleString('en-IN')}.00</span>
                </div>
                <div className="flex justify-between text-slate-500 text-[11px] pt-1 border-t border-slate-100">
                  <span>Total Course Fee</span>
                  <span>₹{viewingReceipt.totalCourseFees ?? 0}.00</span>
                </div>
                <div className="flex justify-between text-slate-500 text-[11px]">
                  <span>Total Cumulative Paid</span>
                  <span>₹{viewingReceipt.totalPaid ?? 0}.00</span>
                </div>
                <div className="flex justify-between text-rose-600 font-semibold text-[11px]">
                  <span>Remaining Due Balance</span>
                  <span>₹{viewingReceipt.remainingBalance ?? 0}.00</span>
                </div>
                <div className="flex justify-between font-bold text-sm text-slate-900 pt-2 border-t-2 border-slate-900">
                  <span>Net Amount Paid</span>
                  <span className="text-emerald-600">₹{(viewingReceipt.amount ?? 0).toLocaleString('en-IN')}.00</span>
                </div>
              </div>
            </div>

            {/* Signatures */}
            <div className="pt-6 flex items-end justify-between text-xs text-slate-500 border-t border-slate-200">
              <div className="space-y-1">
                <p className="text-[10px]">Verified By: <strong>{viewingReceipt.verifiedBy || 'Directorate MIS'}</strong></p>
                <p className="text-[10px]">System Generated Official E-Receipt</p>
              </div>
              <div className="text-center">
                <div className="w-32 border-b border-slate-400 mb-1"></div>
                <span className="text-[10px] font-semibold text-slate-700 uppercase">
                  Authorized Signatory
                </span>
              </div>
            </div>

            {/* Action buttons (Hidden during printing) */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 print:hidden">
              <button
                onClick={() => setViewingReceipt(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={handlePrintReceipt}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-2 shadow-sm cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                Print / Save PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW PROOF SCREENSHOT MODAL */}
      {viewingProof && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Payment Proof Voucher
              </h3>
              <button onClick={() => setViewingProof(null)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 max-h-80 flex items-center justify-center p-2">
              <img
                src={viewingProof.receiptProofUrl}
                alt="Proof"
                className="max-h-72 object-contain rounded-lg"
              />
            </div>

            <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
              <p>Student: <strong>{viewingProof.studentName}</strong> ({viewingProof.studentRegNo})</p>
              <p>Txn ID: <span className="font-mono">{viewingProof.transactionId}</span></p>
              <p>Amount: <strong className="text-emerald-600">₹{viewingProof.amount}</strong></p>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setViewingProof(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADMIN REJECTION REASON MODAL */}
      {rejectingPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center">
              <XCircle className="w-5 h-5" />
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Reject Offline Payment Remittance
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Provide a reason for rejecting payment <strong>{rejectingPayment.receiptNumber}</strong> (₹{rejectingPayment.amount} for {rejectingPayment.studentName}). The partner will see this reason.
              </p>
            </div>

            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Rejection Reason *
                </label>
                <textarea
                  required
                  rows={3}
                  value={rejectionReasonText}
                  onChange={(e) => setRejectionReasonText(e.target.value)}
                  placeholder="e.g. UTR number not matching bank statement, or invalid screenshot attached..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setRejectingPayment(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold cursor-pointer"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default OfflinePaymentsModule;
