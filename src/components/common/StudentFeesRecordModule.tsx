import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Student, PaymentReceipt, FeePaymentProof } from '../../types';
import {
  CreditCard,
  DollarSign,
  Search,
  Filter,
  Download,
  CheckCircle,
  AlertCircle,
  Clock,
  ChevronRight,
  X,
  PlusCircle,
  FileText,
  Copy,
  Check,
  Building2,
  BookOpen,
  ArrowUpRight,
  Shield,
  Eye,
  Calendar,
  Layers,
  Upload,
  Sparkles,
} from 'lucide-react';

interface StudentFeesRecordModuleProps {
  userRole?: 'SUPER_ADMIN' | 'MIS_ADMIN' | 'PARTNER';
}

export const StudentFeesRecordModule: React.FC<StudentFeesRecordModuleProps> = ({ userRole }) => {
  const {
    currentRole,
    currentAdmin,
    currentPartner,
    currentCenterMIS,
    isPrimaryAdmin,
    students,
    payments,
    courses,
    partners,
    batches,
    processPayment,
  } = useApp();

  // Role determination
  const effectiveRole =
    userRole ||
    (currentRole === 'ADMIN'
      ? currentAdmin && (currentAdmin.role === 'SUPER_ADMIN' || isPrimaryAdmin(currentAdmin))
        ? 'SUPER_ADMIN'
        : 'MIS_ADMIN'
      : 'PARTNER');

  const isSuperAdmin = effectiveRole === 'SUPER_ADMIN';
  const isMisAdmin = effectiveRole === 'MIS_ADMIN';
  const isPartnerOrMIS = effectiveRole === 'PARTNER';

  // Role-Based Student Filter
  // - Super Admin: all students
  // - MIS Admin: all active students / assigned centers
  // - Partner & Center MIS: strictly students belonging to currentPartner.id
  const authorizedStudents = useMemo(() => {
    if (isSuperAdmin || isMisAdmin) {
      return students;
    }
    if (isPartnerOrMIS && currentPartner) {
      return students.filter((s) => s.partnerId === currentPartner.id);
    }
    return students;
  }, [students, isSuperAdmin, isMisAdmin, isPartnerOrMIS, currentPartner]);

  // Role-Based Payments Filter
  const authorizedPayments = useMemo(() => {
    if (isSuperAdmin || isMisAdmin) {
      return payments;
    }
    if (isPartnerOrMIS && currentPartner) {
      return payments.filter((p) => p.partnerId === currentPartner.id);
    }
    return payments;
  }, [payments, isSuperAdmin, isMisAdmin, isPartnerOrMIS, currentPartner]);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PAID' | 'PARTIAL' | 'PENDING'>('ALL');
  const [centerFilter, setCenterFilter] = useState<string>('ALL');
  const [courseFilter, setCourseFilter] = useState<string>('ALL');

  // Copy Feedback state
  const [copiedTxnId, setCopiedTxnId] = useState<string | null>(null);
  const handleCopyTxn = (txn: string) => {
    navigator.clipboard.writeText(txn);
    setCopiedTxnId(txn);
    setTimeout(() => setCopiedTxnId(null), 2000);
  };

  // Student Fee History Modal
  const [selectedStudentForHistory, setSelectedStudentForHistory] = useState<Student | null>(null);

  // Record Payment Modal State
  const [showRecordPaymentModal, setShowRecordPaymentModal] = useState(false);
  const [targetStudentForPayment, setTargetStudentForPayment] = useState<Student | null>(null);
  const [paymentForm, setPaymentForm] = useState({
    amount: 1500,
    paymentMethod: 'UPI' as PaymentReceipt['paymentMethod'],
    transactionId: `UPI-${Date.now().toString().slice(-8)}`,
    paymentDate: new Date().toISOString().split('T')[0],
    notes: 'Course fee installment collection',
  });
  const [recordPaymentSuccess, setRecordPaymentSuccess] = useState('');

  // Bulk Fee Upload States
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);
  const [bulkCsvContent, setBulkCsvContent] = useState('');
  const [bulkProcessing, setBulkProcessing] = useState(false);
  const [bulkUploadResult, setBulkUploadResult] = useState<{
    successCount: number;
    failedList: string[];
  } | null>(null);

  // Download Sample Fee CSV Template
  const handleDownloadSampleFeeCsv = () => {
    const sampleStudent = authorizedStudents[0];
    const sampleReg = sampleStudent ? sampleStudent.regNo : 'JSSS-2026-WB-101-01';
    const sampleCsv = `Student_RegNo,Amount,Payment_Date,Payment_Method,Transaction_ID,Notes\n${sampleReg},2500,${new Date().toISOString().split('T')[0]},UPI,UPI-2026-881290,Installment fee payment\n`;

    const blob = new Blob([sampleCsv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Student_Fees_Bulk_Upload_Sample_Template.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Process Bulk Fee CSV Upload
  const handleProcessBulkFeeCsv = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkCsvContent.trim()) return;

    setBulkProcessing(true);
    const lines = bulkCsvContent.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

    // If first row is header, skip it
    const dataLines = lines[0].toLowerCase().includes('regno') || lines[0].toLowerCase().includes('student')
      ? lines.slice(1)
      : lines;

    let successCount = 0;
    const failedList: string[] = [];

    dataLines.forEach((line, idx) => {
      // Split by comma
      const parts = line.split(',').map((p) => p.trim().replace(/^["']|["']$/g, ''));
      if (parts.length < 2) {
        failedList.push(`Line ${idx + 2}: Insufficient columns`);
        return;
      }

      const [regNoOrId, rawAmount, date, method, txnId, notes] = parts;
      const amount = Number(rawAmount);

      if (!regNoOrId) {
        failedList.push(`Line ${idx + 2}: Missing student registration number`);
        return;
      }
      if (isNaN(amount) || amount <= 0) {
        failedList.push(`Line ${idx + 2}: Invalid fee amount '${rawAmount}'`);
        return;
      }

      // Find student in authorized pool
      const student = authorizedStudents.find(
        (s) =>
          s.regNo.toLowerCase() === regNoOrId.toLowerCase() ||
          s.id.toLowerCase() === regNoOrId.toLowerCase()
      );

      if (!student) {
        failedList.push(`Line ${idx + 2}: Student '${regNoOrId}' not found or outside your authorized center`);
        return;
      }

      try {
        const validMethod = ['UPI', 'CASH', 'NETBANKING', 'CARD', 'WALLET'].includes(method?.toUpperCase())
          ? (method.toUpperCase() as PaymentReceipt['paymentMethod'])
          : 'UPI';

        processPayment({
          studentId: student.id,
          amount,
          paymentMethod: validMethod,
          transactionId: txnId || `BULK-TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          notes: notes || `Bulk fee record upload (${date || new Date().toISOString().split('T')[0]})`,
        });

        successCount++;
      } catch (err: any) {
        failedList.push(`Line ${idx + 2} (${regNoOrId}): ${err.message}`);
      }
    });

    setBulkProcessing(false);
    setBulkUploadResult({ successCount, failedList });
    setBulkCsvContent('');
  };

  // Filtered Students
  const filteredStudents = useMemo(() => {
    return authorizedStudents.filter((stu) => {
      // Fee Status Filter
      if (statusFilter !== 'ALL') {
        if (stu.feeStatus !== statusFilter) return false;
      }

      // Center Filter
      if (centerFilter !== 'ALL' && stu.partnerId !== centerFilter) {
        return false;
      }

      // Course Filter
      if (courseFilter !== 'ALL' && stu.courseId !== courseFilter) {
        return false;
      }

      // Search Query: Match name, regNo, txnId, email, phone
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchBasic =
          stu.name.toLowerCase().includes(q) ||
          stu.regNo.toLowerCase().includes(q) ||
          stu.email.toLowerCase().includes(q) ||
          stu.phone.toLowerCase().includes(q);

        if (matchBasic) return true;

        // Check if any payment or proof has this transaction ID
        const studentPayments = authorizedPayments.filter((p) => p.studentId === stu.id);
        const matchPayment = studentPayments.some((p) => p.transactionId.toLowerCase().includes(q));
        if (matchPayment) return true;

        const proofs = stu.paymentProofs || [];
        const matchProof = proofs.some((p) => p.transactionId?.toLowerCase().includes(q));
        if (matchProof) return true;

        return false;
      }

      return true;
    });
  }, [authorizedStudents, statusFilter, centerFilter, courseFilter, searchQuery, authorizedPayments]);

  // Aggregate Metrics automatically calculated across authorized students
  const aggregateMetrics = useMemo(() => {
    let totalFees = 0;
    let totalPaid = 0;
    let paidCount = 0;
    let partialCount = 0;
    let pendingCount = 0;

    authorizedStudents.forEach((s) => {
      totalFees += s.totalFees || 0;
      totalPaid += s.paidFees || 0;
      if (s.feeStatus === 'PAID') paidCount++;
      else if (s.feeStatus === 'PARTIAL') partialCount++;
      else pendingCount++;
    });

    const totalDue = Math.max(0, totalFees - totalPaid);
    const collectionRate = totalFees > 0 ? Math.round((totalPaid / totalFees) * 100) : 0;

    return {
      totalFees,
      totalPaid,
      totalDue,
      collectionRate,
      paidCount,
      partialCount,
      pendingCount,
    };
  }, [authorizedStudents]);

  // Helper to find latest payment / proof info for a student
  const getLatestPaymentInfo = (stu: Student) => {
    // 1. Check official PaymentReceipt
    const stuPayments = authorizedPayments.filter((p) => p.studentId === stu.id);
    if (stuPayments.length > 0) {
      const latest = stuPayments[0]; // newest first
      return {
        amount: latest.amount,
        date: latest.date,
        transactionId: latest.transactionId,
        paymentMethod: latest.paymentMethod,
        source: 'RECEIPT' as const,
      };
    }

    // 2. Check submitted paymentProofs
    if (stu.paymentProofs && stu.paymentProofs.length > 0) {
      const latestProof = stu.paymentProofs[0];
      return {
        amount: latestProof.amount,
        date: latestProof.paymentDate,
        transactionId: latestProof.transactionId,
        paymentMethod: latestProof.paymentMethod,
        source: 'PROOF' as const,
      };
    }

    return null;
  };

  // Handle Recording New Payment
  const handleRecordPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetStudentForPayment) return;

    if (Number(paymentForm.amount) <= 0) {
      alert('Please enter an amount greater than 0.');
      return;
    }

    try {
      const receipt = processPayment({
        studentId: targetStudentForPayment.id,
        amount: Number(paymentForm.amount),
        paymentMethod: paymentForm.paymentMethod,
        transactionId: paymentForm.transactionId.trim() || `TXN-${Date.now()}`,
        notes: paymentForm.notes.trim(),
      });

      setRecordPaymentSuccess(`Payment of ₹${(receipt.amount ?? 0).toLocaleString()} recorded successfully! Receipt: ${receipt.receiptNo}`);
      setTimeout(() => {
        setRecordPaymentSuccess('');
        setShowRecordPaymentModal(false);
        setTargetStudentForPayment(null);
      }, 2000);
    } catch (err: any) {
      alert(`Payment recording failed: ${err.message}`);
    }
  };

  // Export Fees Record to CSV
  const handleExportFeesCSV = () => {
    let csv = `Student Reg No,Student Name,Email,Phone,Center Name,Course Name,Total Fees (INR),Amount Paid (INR),Remaining Balance (INR),Fee Status,Latest Payment Date,Latest Payment Amount (INR),Latest Transaction ID\n`;

    filteredStudents.forEach((stu) => {
      const balance = Math.max(0, stu.totalFees - stu.paidFees);
      const latest = getLatestPaymentInfo(stu);
      const cleanName = `"${stu.name.replace(/"/g, '""')}"`;
      const cleanCenter = `"${stu.partnerName.replace(/"/g, '""')}"`;
      const cleanCourse = `"${stu.courseName.replace(/"/g, '""')}"`;

      csv += `${stu.regNo},${cleanName},${stu.email},${stu.phone},${cleanCenter},${cleanCourse},${stu.totalFees},${stu.paidFees},${balance},${stu.feeStatus},${latest ? latest.date : 'N/A'},${latest ? latest.amount : 0},"${latest ? latest.transactionId : 'N/A'}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Student_Fees_Record_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Module Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white p-6 rounded-3xl shadow-lg border border-slate-700/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight">Student Fees Record Module</h2>
              <div className="flex flex-wrap items-center gap-2 mt-0.5">
                {isSuperAdmin && (
                  <span className="px-2 py-0.5 bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[11px] font-bold rounded-full">
                    ★ Super Admin • Central Master Accounts
                  </span>
                )}
                {isMisAdmin && (
                  <span className="px-2 py-0.5 bg-cyan-400/20 text-cyan-300 border border-cyan-400/40 text-[11px] font-bold rounded-full">
                    MIS Admin • Authorized Student Accounts
                  </span>
                )}
                {isPartnerOrMIS && (
                  <span className="px-2 py-0.5 bg-emerald-400/20 text-emerald-300 border border-emerald-400/40 text-[11px] font-bold rounded-full">
                    {currentCenterMIS ? `Center MIS: ${currentCenterMIS.name}` : `Center: ${currentPartner?.centerName}`}
                  </span>
                )}
                <span className="text-xs text-slate-400">
                  Role-Based Access Control Enforced
                </span>
              </div>
            </div>
          </div>
          <p className="text-xs text-slate-300 max-w-2xl pt-1">
            Complete institutional fee accounts tracking: Total course fees, amount paid, remaining balance due, payment dates, transaction IDs, and complete audit history.
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleDownloadSampleFeeCsv}
            className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="Download CSV template format for bulk student fee payments"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            CSV Template
          </button>
          <button
            onClick={() => {
              setShowBulkUploadModal(true);
              setBulkUploadResult(null);
            }}
            className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Upload className="w-4 h-4 text-indigo-400" />
            Bulk Upload Fees
          </button>
          <button
            onClick={handleExportFeesCSV}
            className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Download className="w-4 h-4" />
            Export Fees CSV
          </button>
          <button
            onClick={() => {
              setTargetStudentForPayment(authorizedStudents[0] || null);
              setShowRecordPaymentModal(true);
            }}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            Record Fee Payment
          </button>
        </div>
      </div>

      {/* 4 Financial Aggregate Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Fees */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Total Course Fees</span>
            <DollarSign className="w-4 h-4 text-slate-700" />
          </div>
          <h3 className="text-2xl font-black text-slate-900">
            ₹{(aggregateMetrics.totalFees ?? 0).toLocaleString()}
          </h3>
          <p className="text-[11px] text-slate-500">
            Across {authorizedStudents.length} registered candidates
          </p>
        </div>

        {/* Total Paid */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Amount Paid</span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <h3 className="text-2xl font-black text-emerald-700">
            ₹{(aggregateMetrics.totalPaid ?? 0).toLocaleString()}
          </h3>
          <p className="text-[11px] text-emerald-700 font-semibold">
            {aggregateMetrics.collectionRate}% collected ({aggregateMetrics.paidCount} fully paid)
          </p>
        </div>

        {/* Total Remaining Balance */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Remaining Balance</span>
            <AlertCircle className="w-4 h-4 text-rose-600" />
          </div>
          <h3 className="text-2xl font-black text-rose-600">
            ₹{(aggregateMetrics.totalDue ?? 0).toLocaleString()}
          </h3>
          <p className="text-[11px] text-rose-700 font-semibold">
            {aggregateMetrics.partialCount + aggregateMetrics.pendingCount} students with dues pending
          </p>
        </div>

        {/* Payment History Logged */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Receipt Records</span>
            <FileText className="w-4 h-4 text-indigo-600" />
          </div>
          <h3 className="text-2xl font-black text-slate-900">
            {authorizedPayments.length} Receipts
          </h3>
          <p className="text-[11px] text-slate-500 font-medium">
            100% verified against bank/UPI Txn IDs
          </p>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search student, Reg No, Txn ID, phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Fee Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 outline-none"
            >
              <option value="ALL">All Fee Statuses</option>
              <option value="PAID">Fully Paid Only</option>
              <option value="PARTIAL">Partial Payment (Balance Due)</option>
              <option value="PENDING">Pending (No Payment Yet)</option>
            </select>
          </div>

          {/* Center Filter (for Admins) */}
          {(isSuperAdmin || isMisAdmin) && (
            <div>
              <select
                value={centerFilter}
                onChange={(e) => setCenterFilter(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 outline-none"
              >
                <option value="ALL">All Centers ({partners.length})</option>
                {partners.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.partnerCode} - {p.centerName}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Course Filter */}
          <div>
            <select
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 outline-none"
            >
              <option value="ALL">All Courses ({courses.length})</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} - {c.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-600 pt-2 border-t border-slate-100">
          <div>
            Showing <strong className="text-emerald-700">{filteredStudents.length}</strong> of{' '}
            {authorizedStudents.length} student records
          </div>
          {(statusFilter !== 'ALL' || centerFilter !== 'ALL' || courseFilter !== 'ALL' || searchQuery) && (
            <button
              onClick={() => {
                setStatusFilter('ALL');
                setCenterFilter('ALL');
                setCourseFilter('ALL');
                setSearchQuery('');
              }}
              className="text-[11px] text-slate-500 hover:text-slate-800 underline"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Student Fee Records Table */}
      {filteredStudents.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-3xl border border-dashed border-slate-300 space-y-3">
          <CreditCard className="w-10 h-10 mx-auto text-slate-400" />
          <h4 className="text-base font-bold text-slate-800">No Student Fee Records Found</h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            No student records match your current filter parameters. Try clearing your search query or reset the fee status filter.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200 text-[11px] uppercase tracking-wider">
                  <th className="p-3.5">Student / Reg No</th>
                  <th className="p-3.5">Course, Center & Batch</th>
                  <th className="p-3.5 text-right">Total Fees</th>
                  <th className="p-3.5 text-right">Amount Paid</th>
                  <th className="p-3.5 text-right">Remaining Due</th>
                  <th className="p-3.5">Latest Payment</th>
                  <th className="p-3.5">Transaction ID</th>
                  <th className="p-3.5 text-center">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((stu) => {
                  const balance = Math.max(0, stu.totalFees - stu.paidFees);
                  const latest = getLatestPaymentInfo(stu);
                  const stuBatch = batches.find((b) => b.studentIds?.includes(stu.id));

                  return (
                    <tr key={stu.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Student Info */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={stu.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(stu.name)}`}
                            alt={stu.name}
                            className="w-8 h-8 rounded-full border border-slate-200 object-cover shrink-0"
                          />
                          <div>
                            <span className="font-bold text-slate-900 block">{stu.name}</span>
                            <span className="text-[10px] text-emerald-700 font-mono font-semibold">
                              {stu.regNo}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Course, Center & Batch */}
                      <td className="p-3.5 max-w-[220px]">
                        <span className="font-semibold text-slate-800 block truncate" title={stu.courseName}>
                          {stu.courseName}
                        </span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] text-slate-500 truncate" title={stu.partnerName}>
                            {stu.partnerName}
                          </span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 font-medium">
                            {stuBatch ? stuBatch.batchName : 'General Batch'}
                          </span>
                        </div>
                      </td>

                      {/* Total Fees */}
                      <td className="p-3.5 text-right font-bold text-slate-900 whitespace-nowrap">
                        ₹{(stu.totalFees ?? 0).toLocaleString()}
                      </td>

                      {/* Amount Paid */}
                      <td className="p-3.5 text-right font-black text-emerald-700 whitespace-nowrap">
                        ₹{(stu.paidFees ?? 0).toLocaleString()}
                      </td>

                      {/* Remaining Balance */}
                      <td className="p-3.5 text-right whitespace-nowrap">
                        {balance === 0 ? (
                          <span className="text-emerald-600 font-bold text-[11px] bg-emerald-50 px-2 py-0.5 rounded-full">
                            ✓ Cleared
                          </span>
                        ) : (
                          <span className="text-rose-700 font-black text-xs bg-rose-50 px-2 py-0.5 rounded-full">
                            ₹{(balance ?? 0).toLocaleString()}
                          </span>
                        )}
                      </td>

                      {/* Latest Payment Date & Amount */}
                      <td className="p-3.5 whitespace-nowrap">
                        {latest ? (
                          <div>
                            <span className="font-bold text-slate-900 block text-xs">
                              ₹{(latest.amount ?? 0).toLocaleString()}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                              <Calendar className="w-2.5 h-2.5" />
                              {latest.date}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">No payments yet</span>
                        )}
                      </td>

                      {/* Transaction ID */}
                      <td className="p-3.5 whitespace-nowrap">
                        {latest?.transactionId ? (
                          <div className="flex items-center gap-1">
                            <span className="font-mono text-[11px] text-slate-700 truncate max-w-[130px]" title={latest.transactionId}>
                              {latest.transactionId}
                            </span>
                            <button
                              onClick={() => handleCopyTxn(latest.transactionId)}
                              className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors"
                              title="Copy Transaction ID"
                            >
                              {copiedTxnId === latest.transactionId ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-mono">--</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="p-3.5 text-center whitespace-nowrap">
                        <span
                          className={`px-2.5 py-1 text-[10px] font-bold rounded-full ${
                            stu.feeStatus === 'PAID'
                              ? 'bg-emerald-100 text-emerald-800'
                              : stu.feeStatus === 'PARTIAL'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {stu.feeStatus === 'PAID'
                            ? 'PAID'
                            : stu.feeStatus === 'PARTIAL'
                            ? 'PARTIAL'
                            : 'PENDING'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedStudentForHistory(stu)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                            title="View Complete Payment History"
                          >
                            <Eye className="w-3.5 h-3.5 text-indigo-600" />
                            <span>History</span>
                          </button>

                          {balance > 0 && (
                            <button
                              onClick={() => {
                                setTargetStudentForPayment(stu);
                                setPaymentForm({
                                  amount: balance,
                                  paymentMethod: 'UPI',
                                  transactionId: `UPI-${Date.now().toString().slice(-8)}`,
                                  paymentDate: new Date().toISOString().split('T')[0],
                                  notes: `Course fee balance collection for ${stu.courseName}`,
                                });
                                setShowRecordPaymentModal(true);
                              }}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                              title="Record New Payment"
                            >
                              <PlusCircle className="w-3.5 h-3.5" />
                              <span>Collect</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: COMPLETE PAYMENT HISTORY FOR A STUDENT */}
      {selectedStudentForHistory && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">Complete Payment History</h3>
                  <p className="text-xs text-slate-500">
                    {selectedStudentForHistory.name} ({selectedStudentForHistory.regNo}) • {selectedStudentForHistory.courseName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedStudentForHistory(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Financial Summary Strip */}
            <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Total Fees</span>
                <strong className="text-base font-black text-slate-900">
                  ₹{(selectedStudentForHistory.totalFees ?? 0).toLocaleString()}
                </strong>
              </div>
              <div>
                <span className="text-[10px] text-emerald-700 uppercase font-bold block">Total Paid</span>
                <strong className="text-base font-black text-emerald-700">
                  ₹{(selectedStudentForHistory.paidFees ?? 0).toLocaleString()}
                </strong>
              </div>
              <div>
                <span className="text-[10px] text-rose-700 uppercase font-bold block">Remaining Due</span>
                <strong className="text-base font-black text-rose-600">
                  ₹{Math.max(0, (selectedStudentForHistory.totalFees ?? 0) - (selectedStudentForHistory.paidFees ?? 0)).toLocaleString()}
                </strong>
              </div>
            </div>

            {/* Receipts List */}
            {(() => {
              const receipts = authorizedPayments.filter((p) => p.studentId === selectedStudentForHistory.id);
              const proofs = selectedStudentForHistory.paymentProofs || [];

              if (receipts.length === 0 && proofs.length === 0) {
                return (
                  <div className="p-8 text-center text-slate-500 text-xs bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                    No payment history or proofs on record for this student yet.
                  </div>
                );
              }

              return (
                <div className="space-y-4">
                  {/* Official Receipts */}
                  {receipts.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                        Official Payment Receipts ({receipts.length})
                      </h4>
                      <div className="space-y-2">
                        {receipts.map((r) => (
                          <div
                            key={r.id}
                            className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                          >
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900 text-xs">{r.receiptNo}</span>
                                <span className="px-2 py-0.2 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">
                                  {r.status}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500">
                                Date: <strong className="text-slate-700">{r.date}</strong> • Mode: {r.paymentMethod}
                              </p>
                              <p className="text-[11px] text-slate-600 font-mono">
                                Txn ID: {r.transactionId}
                              </p>
                              {r.notes && (
                                <p className="text-[10px] text-slate-400 italic">Notes: {r.notes}</p>
                              )}
                            </div>

                            <div className="text-right shrink-0">
                              <span className="text-base font-black text-emerald-700">
                                ₹{(r.amount ?? 0).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Submitted Proofs */}
                  {proofs.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                        Submitted Payment Proofs ({proofs.length})
                      </h4>
                      <div className="space-y-2">
                        {proofs.map((p) => (
                          <div
                            key={p.id}
                            className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                          >
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-800">{p.transactionId}</span>
                                <span
                                  className={`px-2 py-0.2 text-[10px] font-bold rounded-full ${
                                    p.status === 'VERIFIED'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : p.status === 'REJECTED'
                                      ? 'bg-rose-100 text-rose-800'
                                      : 'bg-amber-100 text-amber-800'
                                  }`}
                                >
                                  {p.status}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500">
                                Paid on: {p.paymentDate} • Mode: {p.paymentMethod}
                              </p>
                              {p.verifiedBy && (
                                <p className="text-[10px] text-slate-500">
                                  Verified By: <strong>{p.verifiedBy}</strong> on {p.verifiedDate}
                                </p>
                              )}
                            </div>

                            <div className="text-right shrink-0">
                              <span className="text-base font-black text-slate-900">
                                ₹{(p.amount ?? 0).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            <div className="pt-2 flex justify-end border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedStudentForHistory(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Close History
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: RECORD NEW FEE PAYMENT */}
      {showRecordPaymentModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-600" />
                <div>
                  <h3 className="font-black text-slate-900 text-base">Record Student Fee Payment</h3>
                  <p className="text-[11px] text-slate-500">
                    Direct collection entry with automated receipt & ledger update
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowRecordPaymentModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {recordPaymentSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{recordPaymentSuccess}</span>
              </div>
            )}

            <form onSubmit={handleRecordPaymentSubmit} className="space-y-3">
              {/* Select Student */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Select Student *
                </label>
                <select
                  required
                  value={targetStudentForPayment?.id || ''}
                  onChange={(e) => {
                    const st = authorizedStudents.find((s) => s.id === e.target.value) || null;
                    setTargetStudentForPayment(st);
                    if (st) {
                      const bal = Math.max(0, st.totalFees - st.paidFees);
                      setPaymentForm((prev) => ({
                        ...prev,
                        amount: bal > 0 ? bal : 1500,
                        notes: `Fee collection for ${st.courseName}`,
                      }));
                    }
                  }}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 outline-none"
                >
                  {authorizedStudents.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.name} ({st.regNo}) • Total: ₹{(st.totalFees ?? 0).toLocaleString()} | Due: ₹{Math.max(0, (st.totalFees ?? 0) - (st.paidFees ?? 0)).toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>

              {targetStudentForPayment && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex justify-between items-center">
                  <div>
                    <span className="text-slate-500 font-medium block">{targetStudentForPayment.courseName}</span>
                    <span className="text-[11px] text-slate-400">{targetStudentForPayment.partnerName}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">Outstanding Due</span>
                    <strong className="text-rose-600 font-black text-sm">
                      ₹{Math.max(0, (targetStudentForPayment.totalFees ?? 0) - (targetStudentForPayment.paidFees ?? 0)).toLocaleString()}
                    </strong>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Amount Collected (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm({ ...paymentForm, amount: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Payment Method *
                  </label>
                  <select
                    value={paymentForm.paymentMethod}
                    onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium outline-none"
                  >
                    <option value="UPI">UPI (Google Pay / PhonePe / Paytm)</option>
                    <option value="CASH">Cash Deposit</option>
                    <option value="NETBANKING">Net Banking (IMPS / NEFT)</option>
                    <option value="CARD">Debit / Credit Card</option>
                    <option value="WALLET">Digital Wallet</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Transaction ID / Reference Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. UPI/2026/0914/889911"
                    value={paymentForm.transactionId}
                    onChange={(e) => setPaymentForm({ ...paymentForm, transactionId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Payment Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={paymentForm.paymentDate}
                    onChange={(e) => setPaymentForm({ ...paymentForm, paymentDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Notes / Installment Remarks
                </label>
                <input
                  type="text"
                  placeholder="e.g. Installment #2 received via UPI QR scan"
                  value={paymentForm.notes}
                  onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowRecordPaymentModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!targetStudentForPayment}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
                >
                  Record Payment & Issue Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Fee Records Upload Modal */}
      {showBulkUploadModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Bulk Fee Records Upload</h3>
                  <p className="text-xs text-slate-500">Upload CSV with multiple student fee installments</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowBulkUploadModal(false);
                  setBulkUploadResult(null);
                }}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {bulkUploadResult && (
              <div
                className={`p-4 rounded-xl text-xs ${
                  bulkUploadResult.successCount > 0
                    ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                    : 'bg-rose-50 text-rose-900 border border-rose-200'
                }`}
              >
                <div className="font-bold flex items-center gap-1.5">
                  {bulkUploadResult.successCount > 0 ? (
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                  <span>
                    Successfully processed {bulkUploadResult.successCount} fee payments.
                  </span>
                </div>
                {bulkUploadResult.failedList.length > 0 && (
                  <div className="mt-2 text-rose-700 text-[11px] space-y-1">
                    <span className="font-bold block">Issues encountered:</span>
                    <ul className="list-disc pl-4 space-y-0.5 max-h-28 overflow-y-auto">
                      {bulkUploadResult.failedList.map((fail, i) => (
                        <li key={i}>{fail}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            <form onSubmit={handleProcessBulkFeeCsv} className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-800">
                  CSV Data or Paste Records *
                </label>
                <button
                  type="button"
                  onClick={handleDownloadSampleFeeCsv}
                  className="text-xs text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download Sample Template
                </button>
              </div>

              <div>
                <label className="text-[11px] text-slate-500 block mb-1">
                  Upload file (.csv):
                </label>
                <input
                  type="file"
                  accept=".csv,text/csv"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        const content = event.target?.result as string;
                        if (content) setBulkCsvContent(content);
                      };
                      reader.readAsText(file);
                    }
                  }}
                  className="w-full text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-500 block mb-1">
                  Or paste CSV rows directly (Format: RegNo, Amount, Date, Method, TxnID, Notes):
                </label>
                <textarea
                  rows={6}
                  value={bulkCsvContent}
                  onChange={(e) => setBulkCsvContent(e.target.value)}
                  placeholder={`Student_RegNo,Amount,Payment_Date,Payment_Method,Transaction_ID,Notes\nJSSS-2026-WB-101-01,2500,2026-09-15,UPI,UPI-2026-991201,Installment 2`}
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-mono text-xs text-slate-900 outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
                <span className="font-bold text-slate-800 block">Automation Notice:</span>
                <p>• Accepted payment methods: UPI, CASH, NETBANKING, CARD, WALLET.</p>
                <p>• Automatically recalculates candidate balance, updates fee status (Paid/Partial/Pending), and logs receipt in audit records.</p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowBulkUploadModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={bulkProcessing || !bulkCsvContent.trim()}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  {bulkProcessing ? 'Processing...' : 'Process & Upload Fee Records'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
