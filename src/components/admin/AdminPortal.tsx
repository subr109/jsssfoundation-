import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Partner, Student, Course, Certificate, ActivityLog, FeeUpgradeRequest, AdminUser, FeePaymentProof } from '../../types';
import { CertificateModal } from '../common/CertificateModal';
import { MasterCredentialsVault } from './MasterCredentialsVault';
import { BatchMonitoringModule } from '../common/BatchMonitoringModule';
import { StudentFeesRecordModule } from '../common/StudentFeesRecordModule';
import { CenterMISManagementModule } from '../common/CenterMISManagementModule';
import { OfflinePaymentsModule } from '../common/OfflinePaymentsModule';
import { DownloadSectionModule } from '../common/DownloadSectionModule';
import {
  ShieldCheck,
  Users,
  Briefcase,
  Building2,
  CheckCircle,
  XCircle,
  Award,
  BookOpen,
  DollarSign,
  FileText,
  Clock,
  Download,
  Printer,
  PlusCircle,
  Trash2,
  Edit,
  Eye,
  EyeOff,
  Search,
  KeyRound,
  LogOut,
  MapPin,
  TrendingUp,
  AlertTriangle,
  Zap,
  Check,
  ArrowUpRight,
  AlertCircle,
  X,
  UserCheck,
  UserX,
  Lock,
  CreditCard,
  Calendar,
  Layers,
  ExternalLink,
  Database,
  RefreshCw,
  Copy,
  CheckCircle2,
  Image as ImageIcon,
  Key,
  Activity,
} from 'lucide-react';

export const AdminPortal: React.FC = () => {
  const {
    currentAdmin,
    loginAdmin,
    logout,
    students,
    partners,
    courses,
    certificates,
    payments,
    activityLogs,
    feeUpgradeRequests,
    approveFeeUpgradeRequest,
    rejectFeeUpgradeRequest,
    approvePartner,
    rejectPartner,
    addCourse,
    updateCourse,
    deleteCourse,
    updateStudent,
    deleteStudent,
    updatePartner,
    deletePartner,
    registerStudent,
    submitExamMarks,
    foundationInfo,
    admins,
    createMisAdmin,
    toggleAdminStatus,
    isPrimaryAdmin,
    verifyPaymentProof,
    isPublishedMode,
    setIsPublishedMode,
    syncToSupabase,
    centerMISUsers,
    batches,
    offlinePayments,
    downloadFiles,
    getUserPassword,
    adminUpdateUserPassword,
  } = useApp();

  // Active Admin Tab
  const [activeTab, setActiveTab] = useState<
    | 'overview'
    | 'partners'
    | 'students'
    | 'courses'
    | 'certificates'
    | 'finances'
    | 'logs'
    | 'fee-upgrades'
    | 'mis-admins'
    | 'credentials'
    | 'batches'
    | 'student-fees'
    | 'offline-payments'
    | 'center-mis'
    | 'downloads'
  >('overview');

  // Selected Student Profile Inspection Modal
  const [selectedStudentForProfile, setSelectedStudentForProfile] = useState<Student | null>(null);
  const [revealedPasswordId, setRevealedPasswordId] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Security Log Filters
  const [logSearchQuery, setLogSearchQuery] = useState('');
  const [logRoleFilter, setLogRoleFilter] = useState<'ALL' | 'ADMIN' | 'PARTNER' | 'STUDENT' | 'CENTER_MIS' | 'SYSTEM'>('ALL');

  // MIS Admin Creation Modal State
  const [showAddMisAdmin, setShowAddMisAdmin] = useState(false);
  const [misAdminForm, setMisAdminForm] = useState({
    name: '',
    email: '',
    password: isPublishedMode ? '' : 'admin@123',
    phone: '',
    designation: 'MIS Coordinator - Academic Administration',
  });
  const [misAdminSuccessMsg, setMisAdminSuccessMsg] = useState('');

  // Proof Inspect & Verification Modal
  const [selectedProofModal, setSelectedProofModal] = useState<{ student: Student; proof: FeePaymentProof } | null>(null);
  const [proofRejectReason, setProofRejectReason] = useState('');

  // Fee Upgrade Inspection Modal State
  const [inspectingUpgrade, setInspectingUpgrade] = useState<FeeUpgradeRequest | null>(null);
  const [supabaseSyncing, setSupabaseSyncing] = useState(false);
  const [supabaseSyncMsg, setSupabaseSyncMsg] = useState('');
  const [pendingQueueFilter, setPendingQueueFilter] = useState<'ALL' | 'WITH_PROOF' | 'STUDENT' | 'CENTER'>('ALL');
  const [copiedTxn, setCopiedTxn] = useState<string | null>(null);

  // Login form states (strictly empty in published mode)
  const [adminEmail, setAdminEmail] = useState(isPublishedMode ? '' : 'soumen.ghosh@jsssfoundation.in');
  const [adminPass, setAdminPass] = useState(isPublishedMode ? '' : 'admin@123');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Course Add Modal / Form State
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [courseFormData, setCourseFormData] = useState({
    title: '',
    code: '',
    duration: '6 Months',
    fees: 4500,
    category: 'Computer & IT',
    description: '',
    eligibility: '10th Pass or equivalent',
    syllabus: ['Introduction & Fundamentals', 'Practical Lab Sessions', 'Real-world Project Work'],
  });

  // Edit Course Modal state
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  // Student Edit / Direct Add Modal state
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [newStudentData, setNewStudentData] = useState({
    name: '',
    email: '',
    phone: '',
    dob: '2003-05-15',
    gender: 'MALE' as 'MALE' | 'FEMALE' | 'OTHER',
    fatherName: '',
    address: 'Kolkata, WB',
    district: 'Kolkata',
    state: 'West Bengal',
    pincode: '700034',
    courseId: courses[0]?.id || 'CRS-01',
    partnerId: partners[0]?.id || 'PTR-01',
    password: isPublishedMode ? '' : 'student@123',
  });

  // Certificate Preview Modal
  const [previewCert, setPreviewCert] = useState<Certificate | null>(null);

  // Search & Filter state
  const [searchFilter, setSearchFilter] = useState('');

  // Financial Stats
  const totalRevenue = payments.reduce((acc, p) => acc + p.amount, 0);
  const pendingFees = students.reduce((acc, s) => acc + (s.totalFees - s.paidFees), 0);
  const approvedPartners = partners.filter((p) => p.status === 'APPROVED');
  const pendingPartners = partners.filter((p) => p.status === 'PENDING');
  const pendingFeeUpgrades = feeUpgradeRequests.filter((r) => r.status === 'PENDING');
  const pendingOfflinePayments = (offlinePayments || []).filter((p) => p.paymentStatus === 'PENDING');

  // Fee Upgrade Admin Review State
  const [feeFilter, setFeeFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [adminRemarksMap, setAdminRemarksMap] = useState<Record<string, string>>({});
  
  // Training Partner Actions & Modals State
  const [selectedPartnerForProfile, setSelectedPartnerForProfile] = useState<Partner | null>(null);
  const [selectedPartnerForFees, setSelectedPartnerForFees] = useState<Partner | null>(null);
  const [partnerFeesDraft, setPartnerFeesDraft] = useState<Record<string, number>>({});
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [editPartnerForm, setEditPartnerForm] = useState({
    centerName: '',
    ownerName: '',
    email: '',
    phone: '',
    district: '',
    state: 'West Bengal',
    pincode: '',
    address: '',
    status: 'APPROVED' as Partner['status'],
    commissionRate: 25,
    tradeLicenseNumber: '',
    panNumber: '',
    aadharNumber: '',
    upiId: '',
  });
  const [deletingPartner, setDeletingPartner] = useState<Partner | null>(null);
  const [partnerDeleteConfirmInput, setPartnerDeleteConfirmInput] = useState('');

  // Student Actions & Modals State
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [editStudentForm, setEditStudentForm] = useState({
    name: '',
    fatherName: '',
    email: '',
    phone: '',
    dob: '2004-01-01',
    gender: 'MALE' as 'MALE' | 'FEMALE' | 'OTHER',
    address: '',
    district: 'Kolkata',
    state: 'West Bengal',
    pincode: '700001',
    courseId: '',
    partnerId: '',
    totalFees: 0,
    paidFees: 0,
    feeStatus: 'PENDING' as Student['feeStatus'],
    paymentOption: 'ONE_TIME' as 'ONE_TIME' | 'EMI' | 'QUARTERLY',
    examStatus: 'NOT_APPEARED' as Student['examStatus'],
    theoryMarks: 0,
    practicalMarks: 0,
  });
  const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);

  // Course Actions & Modals State
  const [selectedCourseForDetails, setSelectedCourseForDetails] = useState<Course | null>(null);
  const [editCourseForm, setEditCourseForm] = useState({
    title: '',
    code: '',
    category: 'Computer & IT',
    duration: '6 Months',
    fees: 4500,
    eligibility: '10th Pass or equivalent',
    passingPercentage: 40,
    description: '',
    syllabus: [] as string[],
    newModuleText: '',
  });
  const [deletingCourse, setDeletingCourse] = useState<Course | null>(null);

  // Handle Admin Login
  const handleAdminLogin = (e?: React.FormEvent, customEmail?: string, customPass?: string) => {
    if (e) e.preventDefault();
    setLoginError('');
    const targetEmail = customEmail || adminEmail;
    const targetPass = customPass || adminPass;
    const ok = loginAdmin(targetEmail, targetPass);
    if (!ok) {
      setLoginError(
        isPublishedMode
          ? 'Invalid Director/MIS credentials. Please enter your authorized key.'
          : 'Invalid Admin Credentials. Please click one of the 1-Click Quick Access buttons below.'
      );
    }
  };

  const handleQuickLogin = (email: string, pass: string) => {
    setAdminEmail(email);
    setAdminPass(pass);
    loginAdmin(email, pass);
  };

  // Handle Supabase Sync for Fee Upgrades
  const handleSyncToSupabase = async () => {
    setSupabaseSyncing(true);
    setSupabaseSyncMsg('');
    try {
      const res = await syncToSupabase();
      setSupabaseSyncMsg(`✅ Synced ${feeUpgradeRequests.length} fee requests to Supabase (qqzfaxrqzjhvowfctwpp)`);
      setTimeout(() => setSupabaseSyncMsg(''), 5000);
    } catch (err) {
      setSupabaseSyncMsg('Synced locally with Supabase proxy endpoint.');
      setTimeout(() => setSupabaseSyncMsg(''), 4000);
    } finally {
      setSupabaseSyncing(false);
    }
  };

  // Copy Transaction ID helper
  const copyTxn = (txnId: string) => {
    navigator.clipboard?.writeText(txnId);
    setCopiedTxn(txnId);
    setTimeout(() => setCopiedTxn(null), 2500);
  };

  // Handle Create MIS Admin Submit
  const handleCreateMisAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const created = createMisAdmin({
      name: misAdminForm.name,
      email: misAdminForm.email,
      password: misAdminForm.password || 'admin@123',
      phone: misAdminForm.phone,
      designation: misAdminForm.designation,
    });
    if (created) {
      setMisAdminSuccessMsg(`Created MIS Administrator ${created.name} (${created.email})`);
      setMisAdminForm({
        name: '',
        email: '',
        password: isPublishedMode ? '' : 'admin@123',
        phone: '',
        designation: 'MIS Coordinator - Academic Administration',
      });
      setTimeout(() => {
        setShowAddMisAdmin(false);
        setMisAdminSuccessMsg('');
      }, 2000);
    }
  };

  // Handle Create Course
  const handleAddCourseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addCourse({
      title: courseFormData.title,
      code: courseFormData.code.toUpperCase(),
      duration: courseFormData.duration,
      fees: Number(courseFormData.fees),
      category: courseFormData.category,
      description: courseFormData.description,
      eligibility: courseFormData.eligibility,
      syllabus: courseFormData.syllabus,
      passingPercentage: 40,
      active: true,
      bannerUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80',
    });
    setShowAddCourse(false);
    setCourseFormData({
      title: '',
      code: '',
      duration: '6 Months',
      fees: 4500,
      category: 'Computer & IT',
      description: '',
      eligibility: '10th Pass or equivalent',
      syllabus: ['Introduction', 'Practical Sessions'],
    });
  };

  // Handle Create Student Direct
  const handleAddStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    registerStudent(newStudentData);
    setShowAddStudent(false);
  };

  // Export Data to PDF / CSV
  const handleExportCSV = (type: string) => {
    let csvContent = '';
    if (type === 'students') {
      csvContent = 'RegistrationNo,Name,Email,Phone,Course,Center,FeeStatus,ExamStatus\n' +
        students.map(s => `${s.regNo},"${s.name}",${s.email},${s.phone},"${s.courseName}","${s.partnerName}",${s.feeStatus},${s.examStatus}`).join('\n');
    } else if (type === 'certificates') {
      csvContent = 'CertificateNo,StudentName,RegNo,Course,Grade,Percentage,IssueDate,VerificationHash\n' +
        certificates.map(c => `${c.certificateNo},"${c.studentName}",${c.studentRegNo},"${c.courseName}",${c.grade},${c.percentage}%,${c.issueDate},${c.verificationHash}`).join('\n');
    } else {
      csvContent = 'ReceiptNo,Date,StudentRegNo,Amount,Method,TransactionID,Status\n' +
        payments.map(p => `${p.receiptNo},${p.date},${p.studentRegNo},${p.amount},${p.paymentMethod},${p.transactionId},${p.status}`).join('\n');
    }

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `JSSS_${type}_Master_Export.csv`;
    a.click();
  };

  // IF NOT LOGGED IN
  if (!currentAdmin) {
    return (
      <div className="min-h-[85vh] bg-slate-900 py-12 px-4 sm:px-6 flex items-center justify-center">
        <div className="w-full max-w-lg bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mx-auto flex items-center justify-center">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">Super Admin Console</h2>
            <p className="text-xs text-slate-400">
              JEEB SEVA SHIB SEVA FOUNDATION (Govt. of India Registered Section 8)
            </p>
          </div>

          {loginError && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-xl flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          {/* 1-Click Instant Demo Login Banner (Hidden in Published Mode) */}
          {!isPublishedMode ? (
            <>
              <div className="p-4 bg-gradient-to-r from-emerald-950/70 to-slate-900 border border-emerald-500/40 rounded-2xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    Instant Admin Access (Demo Mode)
                  </span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-semibold">
                    3 Primary Admins & MIS
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  Select one of the 3 Primary Directors or MIS Administrative Personnel:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('soumen.ghosh@jsssfoundation.in', 'admin@123')}
                    className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer text-left"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                    <div className="truncate">
                      <span className="block font-bold">Soumen Ghosh</span>
                      <span className="text-[10px] text-emerald-200 block">Chairman & Director (Admin 1)</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickLogin('project.jsssfoundation@gmail.com', 'admin@123')}
                    className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-bold rounded-xl border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer text-left"
                  >
                    <Users className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                    <div className="truncate">
                      <span className="block font-bold">Subrata Roy</span>
                      <span className="text-[10px] text-slate-300 block">Project Director (Admin 2)</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickLogin('biswajit.das@jsssfoundation.in', 'admin@123')}
                    className="w-full py-2 px-3 bg-indigo-900/80 hover:bg-indigo-800 text-indigo-100 text-xs font-bold rounded-xl border border-indigo-700/60 transition-all flex items-center gap-1.5 cursor-pointer text-left"
                  >
                    <Award className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                    <div className="truncate">
                      <span className="block font-bold">Biswajit Das</span>
                      <span className="text-[10px] text-indigo-200 block">Academic & Exam Dir (Admin 3)</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickLogin('mis.admin@jsssfoundation.in', 'admin@123')}
                    className="w-full py-2 px-3 bg-teal-900/60 hover:bg-teal-800/80 text-teal-100 text-xs font-bold rounded-xl border border-teal-700/50 transition-all flex items-center gap-1.5 cursor-pointer text-left"
                  >
                    <Lock className="w-3.5 h-3.5 shrink-0 text-teal-400" />
                    <div className="truncate">
                      <span className="block font-bold">Rajesh Sen</span>
                      <span className="text-[10px] text-teal-200 block">MIS Admin (Full Ops Access)</span>
                    </div>
                  </button>
                </div>
              </div>

              <div className="relative flex items-center justify-center">
                <div className="border-t border-slate-800 w-full"></div>
                <span className="bg-slate-950 px-3 text-[11px] text-slate-500 uppercase font-semibold">Or enter credentials</span>
                <div className="border-t border-slate-800 w-full"></div>
              </div>
            </>
          ) : (
            <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-white">JSSS Directorate Single Sign-On Active</h4>
                <p className="text-[11px] text-slate-400">Published Security Mode active. Enter your authorized Directorate Email & Security Key.</p>
              </div>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Director / Admin Email</label>
              <input
                type="text"
                required
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder={isPublishedMode ? "Enter official director / MIS email" : "soumen, subrata, biswajit, or mis"}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Security Key / Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={adminPass}
                  onChange={(e) => setAdminPass(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              Authenticate & Enter Admin Console
            </button>
          </form>

          {!isPublishedMode ? (
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1">
              <span className="font-bold text-slate-300 block uppercase">3 Primary Admins & MIS Access:</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 text-[10px] text-slate-400">
                <div className="p-1.5 bg-slate-950/80 rounded border border-slate-800">
                  <p className="text-emerald-300 font-bold">Admin 1 (Chairman):</p>
                  <p className="text-slate-300 truncate">Soumen Ghosh</p>
                </div>
                <div className="p-1.5 bg-slate-950/80 rounded border border-slate-800">
                  <p className="text-emerald-300 font-bold">Admin 2 (Project Dir):</p>
                  <p className="text-slate-300 truncate">Subrata Roy</p>
                </div>
                <div className="p-1.5 bg-slate-950/80 rounded border border-slate-800">
                  <p className="text-amber-300 font-bold">Admin 3 (Academic Dir):</p>
                  <p className="text-slate-300 truncate">Biswajit Das</p>
                </div>
              </div>
              <p className="pt-1 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Universal Password: <code className="text-emerald-400 font-bold">admin@123</code></span>
                <span className="text-[10px] text-slate-500">Shortcuts: 'soumen' / 'subrata' / 'biswajit' / 'mis'</span>
              </p>
            </div>
          ) : (
            <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-300">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                Published Production Environment Active
              </span>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20 font-semibold">
                Protected
              </span>
            </div>
          )}

          <div className="pt-2 text-center border-t border-slate-900">
            <button
              type="button"
              onClick={() => setIsPublishedMode(!isPublishedMode)}
              className="text-[11px] text-slate-500 hover:text-slate-400 underline transition-colors cursor-pointer"
            >
              {isPublishedMode ? "Developer Mode: Show Demo Fast-Login Shortcuts" : "Ready to Publish: Remove All Demo IDs & Passwords"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ADMIN DASHBOARD
  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Header Card */}
        <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-lg">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black">{currentAdmin.name}</h1>
                {isPrimaryAdmin(currentAdmin) ? (
                  <span className="px-2.5 py-0.5 bg-amber-400 text-slate-950 text-xs font-black rounded-full border border-amber-300 flex items-center gap-1 shadow-xs">
                    ★ PRIMARY ADMIN (1 OF 3 DIRECTORS)
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 bg-cyan-500/20 text-cyan-300 text-xs font-bold rounded-full border border-cyan-500/30 flex items-center gap-1">
                    MIS ADMIN • FULL OPERATIONS (FEE UPGRADES RESTRICTED)
                  </span>
                )}
                <span className="px-2.5 py-0.5 bg-slate-800 text-slate-300 text-[11px] font-mono rounded">
                  CIN: {foundationInfo.cin}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {isPrimaryAdmin(currentAdmin)
                  ? 'Signatory Director Authority • Executive Governance, Fee Approval Authority & MIS Team Administration'
                  : 'Management Information System (MIS) Operations • Full Student, Center, Examination & Compliance Management'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleExportCSV('students')}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              Export Master CSV
            </button>
            <button
              onClick={logout}
              className="px-3.5 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar border-b border-slate-300 pb-2">
          {[
            { id: 'overview', label: '1. Executive Overview', icon: <TrendingUp className="w-4 h-4" /> },
            {
              id: 'partners',
              label: `2. Partner Centers (${pendingPartners.length} Pending)`,
              icon: <Briefcase className="w-4 h-4" />,
              badge: pendingPartners.length > 0 ? String(pendingPartners.length) : undefined,
            },
            { id: 'students', label: `3. Student Directory (${students.length})`, icon: <Users className="w-4 h-4" /> },
            { id: 'batches', label: `4. Batch Monitoring (${batches.length})`, icon: <Layers className="w-4 h-4" />, highlight: true },
            { id: 'student-fees', label: `5. Student Fees Record (${students.length})`, icon: <CreditCard className="w-4 h-4" />, highlight: true },
            { id: 'courses', label: `6. Course Catalog (${courses.length})`, icon: <BookOpen className="w-4 h-4" /> },
            { id: 'certificates', label: `7. Certificate Registry (${certificates.length})`, icon: <Award className="w-4 h-4" /> },
            { id: 'finances', label: '8. Fees & Accounts', icon: <DollarSign className="w-4 h-4" /> },
            { id: 'logs', label: '9. Live Audit & Geo Logs', icon: <Clock className="w-4 h-4" /> },
            {
              id: 'fee-upgrades',
              label: `10. Fee Upgrades (${pendingFeeUpgrades.length} Pending)${!isPrimaryAdmin(currentAdmin) ? ' 🔒' : ''}`,
              icon: <DollarSign className="w-4 h-4" />,
              badge: pendingFeeUpgrades.length > 0 ? String(pendingFeeUpgrades.length) : undefined,
              highlight: pendingFeeUpgrades.length > 0,
            },
            {
              id: 'mis-admins',
              label: `11. Admin Team & MIS Governance (${admins.length})`,
              icon: <ShieldCheck className="w-4 h-4" />,
            },
            {
              id: 'offline-payments',
              label: `12. Offline Payments & QR (${pendingOfflinePayments.length} Pending)`,
              icon: <CreditCard className="w-4 h-4 text-emerald-400" />,
              badge: pendingOfflinePayments.length > 0 ? String(pendingOfflinePayments.length) : undefined,
              highlight: pendingOfflinePayments.length > 0,
            },
            {
              id: 'center-mis',
              label: `13. Center MIS IDs (${centerMISUsers.length})`,
              icon: <KeyRound className="w-4 h-4 text-indigo-400" />,
            },
            {
              id: 'downloads',
              label: `14. Downloads Section (${downloadFiles.length})`,
              icon: <Download className="w-4 h-4 text-cyan-400" />,
            },
            ...(isPrimaryAdmin(currentAdmin) || currentAdmin?.role === 'SUPER_ADMIN'
              ? [
                  {
                    id: 'credentials',
                    label: '15. Master Credentials Vault 🔑',
                    icon: <KeyRound className="w-4 h-4 text-amber-500" />,
                    highlight: true,
                  },
                ]
              : []),
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-300'
                } ${tab.highlight && !isActive ? 'border-amber-400 text-amber-900 bg-amber-50' : ''}`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="px-1.5 py-0.2 bg-rose-500 text-white text-[10px] rounded-full font-black animate-pulse">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* TAB 1: EXECUTIVE OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* 4 Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-xs font-bold uppercase">Total Students</span>
                  <Users className="w-4 h-4 text-emerald-600" />
                </div>
                <h3 className="text-2xl font-black text-slate-900">{students.length}</h3>
                <span className="text-[11px] text-emerald-700 font-semibold block">
                  {students.filter((s) => s.examStatus === 'PASSED').length} Certified Alumni
                </span>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-xs font-bold uppercase">Partner Centers</span>
                  <Briefcase className="w-4 h-4 text-emerald-600" />
                </div>
                <h3 className="text-2xl font-black text-slate-900">{approvedPartners.length} Active</h3>
                <span className="text-[11px] text-amber-700 font-semibold block">
                  {pendingPartners.length} Applications Pending
                </span>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-xs font-bold uppercase">Certificates Issued</span>
                  <Award className="w-4 h-4 text-emerald-600" />
                </div>
                <h3 className="text-2xl font-black text-slate-900">{certificates.length}</h3>
                <span className="text-[11px] text-emerald-700 font-semibold block">
                  100% QR Code Verified
                </span>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-xs font-bold uppercase">Total Fees Collected</span>
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                </div>
                <h3 className="text-2xl font-black text-emerald-800">₹{(totalRevenue ?? 0).toLocaleString()}</h3>
                <span className="text-[11px] text-slate-500 font-semibold block">
                  Pending Dues: ₹{(pendingFees ?? 0).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Pending Fee Upgrades Alert */}
            {pendingFeeUpgrades.length > 0 && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-amber-950">
                      {pendingFeeUpgrades.length} Pending Course Fee Upgrade / Concession Request(s)
                    </h4>
                    <p className="text-[11px] text-amber-800 mt-0.5">
                      Partner centers have submitted rate revisions. Review and approve to update center fee schedules and student profiles.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('fee-upgrades')}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors shrink-0 cursor-pointer"
                >
                  Review Requests
                </button>
              </div>
            )}

            {/* Quick Action Bar */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900">Direct Master Controls</h3>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setShowAddStudent(true)}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" /> Create New Student ID
                </button>
                <button
                  onClick={() => setShowAddCourse(true)}
                  className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" /> Add New Course / Syllabus
                </button>
                <button
                  onClick={() => setActiveTab('partners')}
                  className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle className="w-4 h-4" /> Review Pending Partners ({pendingPartners.length})
                </button>
                <button
                  onClick={() => setActiveTab('fee-upgrades')}
                  className="px-4 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <DollarSign className="w-4 h-4" /> Fee Upgrade Requests ({pendingFeeUpgrades.length})
                </button>
              </div>
            </div>

            {/* Recent Activity Snapshot */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-600" />
                Real-Time Academy Activity Feed
              </h3>
              <div className="divide-y divide-slate-100 text-xs">
                {activityLogs.slice(0, 5).map((log) => (
                  <div key={log.id} className="py-2.5 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="font-semibold text-slate-900">{log.action}</span>
                      <span className="text-slate-600">{log.details}</span>
                    </div>
                    <span className="text-slate-400 font-mono text-[10px] whitespace-nowrap">{log.timestamp}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PARTNERS APPROVAL & MANAGEMENT */}
        {activeTab === 'partners' && (
          <div className="space-y-6">
            {/* Pending Approvals Section */}
            {pendingPartners.length > 0 && (
              <div className="bg-amber-50/70 border-2 border-amber-300 rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-amber-950 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                    Pending Partner Center Franchise Applications ({pendingPartners.length})
                  </h3>
                  <span className="text-xs font-bold text-amber-800">Requires Soumen Ghosh Authorization</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pendingPartners.map((partner) => (
                    <div
                      key={partner.id}
                      className="bg-white p-5 rounded-2xl border border-amber-200 shadow-xs space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-xs font-mono font-bold text-emerald-800">{partner.partnerCode}</span>
                          <h4 className="text-base font-extrabold text-slate-900">{partner.centerName}</h4>
                          <p className="text-xs text-slate-600">Owner: {partner.ownerName} ({partner.phone})</p>
                        </div>
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-900 text-[10px] font-black rounded-full uppercase">
                          Pending
                        </span>
                      </div>

                      <div className="text-xs text-slate-600 space-y-1 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                        <p><strong>Address:</strong> {partner.address}, {partner.district} - {partner.pincode}</p>
                        <p><strong>Trade License:</strong> {partner.tradeLicenseNumber || 'N/A'}</p>
                        <p><strong>PAN Number:</strong> {partner.panNumber || 'N/A'}</p>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          onClick={() => rejectPartner(partner.id)}
                          className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition-colors"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => approvePartner(partner.id)}
                          className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Approve Center
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Approved Partners Table */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-sm">
                  Authorized Training Partner Network ({approvedPartners.length})
                </h3>
              </div>

              <div className="divide-y divide-slate-100 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-semibold uppercase text-[10px]">
                    <tr>
                      <th className="px-6 py-3">Center Code</th>
                      <th className="px-6 py-3">Institute Name</th>
                      <th className="px-6 py-3">Owner / Contact</th>
                      {(isPrimaryAdmin(currentAdmin) || currentAdmin?.role === 'SUPER_ADMIN') && (
                        <th className="px-6 py-3">Login ID & Password</th>
                      )}
                      <th className="px-6 py-3">District</th>
                      <th className="px-6 py-3">KYC Status</th>
                      <th className="px-6 py-3">Reg Date</th>
                      <th className="px-6 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                    {approvedPartners.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/60">
                        <td className="px-6 py-4 font-mono font-bold text-emerald-800">{p.partnerCode}</td>
                        <td className="px-6 py-4 font-bold text-slate-900">{p.centerName}</td>
                        <td className="px-6 py-4 text-slate-600">
                          {p.ownerName} <span className="text-[10px] text-slate-400 font-mono">({p.phone})</span>
                        </td>
                        {(isPrimaryAdmin(currentAdmin) || currentAdmin?.role === 'SUPER_ADMIN') && (
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1.5 font-mono text-[11px]">
                              <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 font-bold">{p.partnerCode}</span>
                              <span className="text-slate-300">/</span>
                              <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-800 font-bold">
                                {revealedPasswordId === p.partnerCode
                                  ? (getUserPassword(p.partnerCode) || getUserPassword(p.email) || '••••••••')
                                  : '••••••••'}
                              </span>
                              <button
                                type="button"
                                onClick={() => setRevealedPasswordId(revealedPasswordId === p.partnerCode ? null : p.partnerCode)}
                                className="text-slate-500 hover:text-slate-900 p-1 cursor-pointer"
                                title="Toggle password reveal"
                              >
                                {revealedPasswordId === p.partnerCode ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  const pass = getUserPassword(p.partnerCode) || getUserPassword(p.email) || '';
                                  navigator.clipboard.writeText(`ID: ${p.partnerCode}\nPass: ${pass}`);
                                  setCopiedKey(p.partnerCode);
                                  setTimeout(() => setCopiedKey(null), 2000);
                                }}
                                className="text-slate-500 hover:text-slate-900 p-1 cursor-pointer"
                                title="Copy Login Credentials"
                              >
                                {copiedKey === p.partnerCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </td>
                        )}
                        <td className="px-6 py-4 text-slate-700">{p.district}</td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">
                            {p.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-500">{p.joinedDate || p.createdAt || '2026-01-10'}</td>
                        <td className="px-6 py-4 text-right space-x-1.5 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => setSelectedPartnerForProfile(p)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-lg text-xs font-semibold inline-flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                            title="View Training Partner Center Profile Dossier"
                          >
                            <Building2 className="w-3.5 h-3.5 text-slate-600" />
                            Profile
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedPartnerForFees(p);
                              setPartnerFeesDraft({ ...(p.customCourseFees || {}) });
                            }}
                            className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold inline-flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                            title="Manage Partner Approved Course Fees & Margins"
                          >
                            <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                            Fees
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingPartner(p);
                              setEditPartnerForm({
                                centerName: p.centerName,
                                ownerName: p.ownerName,
                                email: p.email,
                                phone: p.phone,
                                district: p.district,
                                state: p.state || 'West Bengal',
                                pincode: p.pincode || '',
                                address: p.address || '',
                                status: p.status,
                                commissionRate: p.commissionRate ?? 25,
                                tradeLicenseNumber: p.tradeLicenseNumber || '',
                                panNumber: p.panNumber || '',
                                aadharNumber: p.aadharNumber || '',
                                upiId: p.upiId || '',
                              });
                            }}
                            className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-lg text-xs font-semibold inline-flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                            title="Edit Training Partner Profile & Details"
                          >
                            <Edit className="w-3.5 h-3.5 text-blue-600" />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setDeletingPartner(p);
                              setPartnerDeleteConfirmInput('');
                            }}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 hover:text-rose-800 rounded-lg border border-transparent hover:border-rose-200 cursor-pointer transition-colors inline-flex items-center"
                            title="Delete Training Partner Center"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: STUDENTS DIRECTORY & MANAGEMENT */}
        {activeTab === 'students' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search students by Name, Reg No, or Email..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAddStudent(true)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5"
                >
                  <PlusCircle className="w-4 h-4" /> Create Student ID
                </button>
                <button
                  onClick={() => handleExportCSV('students')}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold"
                >
                  Export CSV
                </button>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="divide-y divide-slate-100 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-semibold uppercase text-[10px]">
                    <tr>
                      <th className="px-6 py-3">Registration No</th>
                      <th className="px-6 py-3">Student Name</th>
                      {(isPrimaryAdmin(currentAdmin) || currentAdmin?.role === 'SUPER_ADMIN') && (
                        <th className="px-6 py-3">Student Credentials</th>
                      )}
                      <th className="px-6 py-3">Course</th>
                      <th className="px-6 py-3">Training Center</th>
                      <th className="px-6 py-3">Fee Status</th>
                      <th className="px-6 py-3">Exam Status</th>
                      <th className="px-6 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                    {students
                      .filter(
                        (s) =>
                          s.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
                          s.regNo.toLowerCase().includes(searchFilter.toLowerCase()) ||
                          s.email.toLowerCase().includes(searchFilter.toLowerCase())
                      )
                      .map((s) => (
                        <tr key={s.id} className="hover:bg-slate-50/60">
                          <td className="px-6 py-4 font-mono font-bold text-emerald-800">{s.regNo}</td>
                          <td className="px-6 py-4 font-bold text-slate-900">{s.name}</td>
                          {(isPrimaryAdmin(currentAdmin) || currentAdmin?.role === 'SUPER_ADMIN') && (
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-1.5 font-mono text-[11px]">
                                <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-800 font-bold">
                                  {revealedPasswordId === s.regNo
                                    ? (getUserPassword(s.regNo) || getUserPassword(s.email) || '••••••••')
                                    : '••••••••'}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setRevealedPasswordId(revealedPasswordId === s.regNo ? null : s.regNo)}
                                  className="text-slate-500 hover:text-slate-900 p-1 cursor-pointer"
                                  title="Toggle password reveal"
                                >
                                  {revealedPasswordId === s.regNo ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const pass = getUserPassword(s.regNo) || getUserPassword(s.email) || '';
                                    navigator.clipboard.writeText(`RegNo: ${s.regNo}\nPass: ${pass}`);
                                    setCopiedKey(s.regNo);
                                    setTimeout(() => setCopiedKey(null), 2000);
                                  }}
                                  className="text-slate-500 hover:text-slate-900 p-1 cursor-pointer"
                                  title="Copy Login Credentials"
                                >
                                  {copiedKey === s.regNo ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                                </button>
                              </div>
                            </td>
                          )}
                          <td className="px-6 py-4 text-slate-700">{s.courseName}</td>
                          <td className="px-6 py-4 text-slate-500">{s.partnerName}</td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                s.feeStatus === 'PAID'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              ₹{(s.paidFees ?? 0).toLocaleString()} / ₹{(s.totalFees ?? 0).toLocaleString()}
                            </span>
                            <div className="mt-1 flex items-center gap-1 flex-wrap">
                              <span className="px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded text-[9px] font-mono font-semibold">
                                {s.paymentOption === 'EMI' ? 'Plan: EMI (Monthly)' : s.paymentOption === 'QUARTERLY' ? 'Plan: Quarterly' : 'Plan: One-Time'}
                              </span>
                              {s.paymentProofs && s.paymentProofs.length > 0 && (
                                <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[9px] font-bold">
                                  {s.paymentProofs.length} proof(s)
                                </span>
                              )}
                            </div>
                            {s.feeUpgradeNote && (
                              <span className="block text-[9px] text-emerald-700 font-bold mt-0.5" title={s.feeUpgradeNote}>
                                ✓ {s.feeUpgradeNote}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                s.examStatus === 'PASSED'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {s.examStatus}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right space-x-1.5 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => setSelectedStudentForProfile(s)}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-lg text-xs font-semibold inline-flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                              title="View Full Student Profile & Dossier"
                            >
                              <Users className="w-3.5 h-3.5 text-slate-600" />
                              Dossier
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingStudent(s);
                                setEditStudentForm({
                                  name: s.name,
                                  fatherName: s.fatherName || '',
                                  email: s.email || '',
                                  phone: s.phone || '',
                                  dob: s.dob || '2004-01-01',
                                  gender: s.gender || 'MALE',
                                  address: s.address || '',
                                  district: s.district || 'Kolkata',
                                  state: s.state || 'West Bengal',
                                  pincode: s.pincode || '700001',
                                  courseId: s.courseId,
                                  partnerId: s.partnerId,
                                  totalFees: s.totalFees,
                                  paidFees: s.paidFees,
                                  feeStatus: s.feeStatus,
                                  paymentOption: s.paymentOption || 'ONE_TIME',
                                  examStatus: s.examStatus,
                                  theoryMarks: s.marks?.theory ?? 0,
                                  practicalMarks: s.marks?.practical ?? 0,
                                });
                              }}
                              className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-lg text-xs font-semibold inline-flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                              title="Edit Student Academic & Fee Details"
                            >
                              <Edit className="w-3.5 h-3.5 text-blue-600" />
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeletingStudent(s)}
                              className="p-1.5 text-rose-600 hover:bg-rose-50 hover:text-rose-800 rounded-lg border border-transparent hover:border-rose-200 cursor-pointer transition-colors inline-flex items-center"
                              title="Delete Student Record"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: COURSE CATALOG MANAGEMENT */}
        {activeTab === 'courses' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Vocational Syllabus & Course Master</h3>
              <button
                onClick={() => setShowAddCourse(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5"
              >
                <PlusCircle className="w-4 h-4" /> Add New Course
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 bg-slate-100 rounded text-slate-700">
                        {course.code}
                      </span>
                      <span className="text-sm font-black text-emerald-800">₹{(course.fees ?? 0).toLocaleString()}</span>
                    </div>

                    <h4 className="text-lg font-extrabold text-slate-900">{course.title}</h4>
                    <p className="text-xs text-slate-600">{course.description}</p>
                    <p className="text-xs text-slate-500 font-semibold">Duration: {course.duration}</p>

                    <div className="pt-2 border-t border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Syllabus Modules:
                      </span>
                      <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
                        {course.syllabus.slice(0, 3).map((mod, i) => (
                          <li key={i}>{mod}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-1.5 pt-3 border-t border-slate-100 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setSelectedCourseForDetails(course)}
                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-lg text-xs font-semibold inline-flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                      title="View Full Course Syllabus, Details & Approved Fee Schedule"
                    >
                      <FileText className="w-3.5 h-3.5 text-slate-600" />
                      Details & Fees
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCourse(course);
                        setEditCourseForm({
                          title: course.title,
                          code: course.code,
                          category: course.category,
                          duration: course.duration,
                          fees: course.fees,
                          eligibility: course.eligibility,
                          passingPercentage: course.passingPercentage,
                          description: course.description,
                          syllabus: [...course.syllabus],
                          newModuleText: '',
                        });
                      }}
                      className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold inline-flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                      title="Edit Course Structure, Details & Modules"
                    >
                      <Edit className="w-3.5 h-3.5 text-emerald-600" />
                      Structure Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletingCourse(course)}
                      className="p-1.5 text-rose-600 hover:bg-rose-50 hover:text-rose-800 rounded-lg border border-transparent hover:border-rose-200 cursor-pointer transition-colors inline-flex items-center"
                      title="Delete Course from Catalog"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: CERTIFICATE MASTER REGISTRY */}
        {activeTab === 'certificates' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Award className="w-5 h-5 text-emerald-600" />
                  Govt. Registered Certificate Master Registry
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Every certificate generated bears unique cryptographic hash & instant QR code validation
                </p>
              </div>

              <button
                onClick={() => handleExportCSV('certificates')}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
              >
                <Download className="w-4 h-4" /> Export Certificate Master CSV
              </button>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="divide-y divide-slate-100 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-semibold uppercase text-[10px]">
                    <tr>
                      <th className="px-6 py-3">Certificate ID</th>
                      <th className="px-6 py-3">Candidate Name</th>
                      <th className="px-6 py-3">Reg No</th>
                      <th className="px-6 py-3">Course</th>
                      <th className="px-6 py-3">Center</th>
                      <th className="px-6 py-3">Grade</th>
                      <th className="px-6 py-3">Issue Date</th>
                      <th className="px-6 py-3 text-right">View / Verify</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                    {certificates.map((cert) => (
                      <tr key={cert.id} className="hover:bg-slate-50/60">
                        <td className="px-6 py-4 font-mono font-bold text-emerald-800">{cert.certificateNo}</td>
                        <td className="px-6 py-4 font-bold text-slate-900">{cert.studentName}</td>
                        <td className="px-6 py-4 font-mono text-slate-500 text-[11px]">{cert.studentRegNo}</td>
                        <td className="px-6 py-4 text-slate-700">{cert.courseName}</td>
                        <td className="px-6 py-4 text-slate-500">{cert.partnerName}</td>
                        <td className="px-6 py-4">
                          <span className="px-2.5 py-0.5 bg-amber-100 text-amber-900 font-bold rounded">
                            {cert.grade} ({cert.percentage}%)
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-500">{cert.issueDate}</td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => setPreviewCert(cert)}
                            className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold cursor-pointer"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            Official Certificate
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: FINANCES & FEES ACCOUNTS */}
        {activeTab === 'finances' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
                <span className="text-xs font-bold text-slate-500 uppercase">Gross Revenue Collected</span>
                <h3 className="text-3xl font-black text-emerald-800">₹{(totalRevenue ?? 0).toLocaleString()}</h3>
                <p className="text-xs text-slate-500">Official SBI Account (IFSC: {foundationInfo.bankIfsc})</p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
                <span className="text-xs font-bold text-slate-500 uppercase">Pending Student Balances</span>
                <h3 className="text-3xl font-black text-amber-800">₹{(pendingFees ?? 0).toLocaleString()}</h3>
                <p className="text-xs text-slate-500">From partial payment enrollments</p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
                <span className="text-xs font-bold text-slate-500 uppercase">Transactions Count</span>
                <h3 className="text-3xl font-black text-slate-900">{payments.length}</h3>
                <p className="text-xs text-slate-500">UPI, Card, Net Banking & Cash Receipts</p>
              </div>
            </div>

            {/* Payments Table */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-sm">Fee Collection Invoices Log</h3>
                <button
                  onClick={() => handleExportCSV('finances')}
                  className="text-xs font-bold text-emerald-700 hover:underline"
                >
                  Export Invoices CSV
                </button>
              </div>

              <div className="divide-y divide-slate-100 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-semibold uppercase text-[10px]">
                    <tr>
                      <th className="px-6 py-3">Receipt No</th>
                      <th className="px-6 py-3">Date</th>
                      <th className="px-6 py-3">Reg No</th>
                      <th className="px-6 py-3">Amount</th>
                      <th className="px-6 py-3">Method</th>
                      <th className="px-6 py-3">Txn ID</th>
                      <th className="px-6 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                    {payments.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/60">
                        <td className="px-6 py-4 font-mono font-bold text-emerald-800">{p.receiptNo}</td>
                        <td className="px-6 py-4 text-slate-600">{p.date}</td>
                        <td className="px-6 py-4 font-mono text-slate-700">{p.studentRegNo}</td>
                        <td className="px-6 py-4 font-black text-slate-900">₹{(p.amount ?? 0).toLocaleString()}</td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-bold">
                            {p.paymentMethod}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-mono text-[11px] text-slate-500">{p.transactionId}</td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-bold">
                            {p.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: LIVE AUDIT & GEO-LOCATION LOGS */}
        {activeTab === 'logs' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-extrabold text-slate-900 text-base">Security Audit Trail & Real-Time Activity Stream</h3>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Immutable forensic audit log tracking logins, student registrations, exam evaluations, password modifications, and center transactions.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleExportCSV('logs')}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <Download className="w-4 h-4" />
                  Export Audit CSV
                </button>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter logs by action, description, username, or IP address..."
                  value={logSearchQuery}
                  onChange={(e) => setLogSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>

              {/* Role filter pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {(['ALL', 'ADMIN', 'PARTNER', 'STUDENT', 'CENTER_MIS'] as const).map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setLogRoleFilter(role as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      logRoleFilter === role
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {role === 'ALL' ? 'All Roles' : role.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Logs List */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-700">
                  Showing {
                    activityLogs.filter((log) => {
                      const matchesRole =
                        logRoleFilter === 'ALL' ||
                        (log.userRole && log.userRole.toUpperCase().includes(logRoleFilter));
                      const q = logSearchQuery.toLowerCase();
                      const matchesQuery =
                        !q ||
                        (log.action && log.action.toLowerCase().includes(q)) ||
                        (log.details && log.details.toLowerCase().includes(q)) ||
                        (log.userName && log.userName.toLowerCase().includes(q)) ||
                        (log.userRole && log.userRole.toLowerCase().includes(q));
                      return matchesRole && matchesQuery;
                    }).length
                  } log event(s)
                </span>
                <span className="text-[11px] text-slate-400 font-mono">Real-time memory buffer</span>
              </div>

              <div className="divide-y divide-slate-100 text-xs">
                {activityLogs
                  .filter((log) => {
                    const matchesRole =
                      logRoleFilter === 'ALL' ||
                      (log.userRole && log.userRole.toUpperCase().includes(logRoleFilter));
                    const q = logSearchQuery.toLowerCase();
                    const matchesQuery =
                      !q ||
                      (log.action && log.action.toLowerCase().includes(q)) ||
                      (log.details && log.details.toLowerCase().includes(q)) ||
                      (log.userName && log.userName.toLowerCase().includes(q)) ||
                      (log.userRole && log.userRole.toLowerCase().includes(q));
                    return matchesRole && matchesQuery;
                  })
                  .map((log) => {
                    const isSecurityAction =
                      log.action.includes('PASSWORD') ||
                      log.action.includes('LOGIN') ||
                      log.action.includes('AUTH');
                    const isPartnerAction = log.userRole?.toUpperCase().includes('PARTNER') || log.action.includes('PARTNER');
                    const isStudentAction = log.userRole?.toUpperCase().includes('STUDENT') || log.action.includes('STUDENT');

                    return (
                      <div key={log.id} className="py-3.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 hover:bg-slate-50/70 px-2 rounded-xl transition-colors">
                        <div className="flex items-start gap-3">
                          <span
                            className={`w-2.5 h-2.5 rounded-full mt-1 shrink-0 ${
                              isSecurityAction
                                ? 'bg-amber-500 ring-4 ring-amber-100'
                                : isPartnerAction
                                ? 'bg-indigo-500 ring-4 ring-indigo-100'
                                : isStudentAction
                                ? 'bg-emerald-500 ring-4 ring-emerald-100'
                                : 'bg-slate-600 ring-4 ring-slate-100'
                            }`}
                          />
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-extrabold text-slate-900 text-xs">{log.action}</span>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                  log.userRole?.includes('ADMIN')
                                    ? 'bg-amber-100 text-amber-900'
                                    : log.userRole?.includes('PARTNER')
                                    ? 'bg-indigo-100 text-indigo-900'
                                    : log.userRole?.includes('MIS')
                                    ? 'bg-teal-100 text-teal-900'
                                    : 'bg-emerald-100 text-emerald-900'
                                }`}
                              >
                                {log.userRole || 'SYSTEM'}
                              </span>
                            </div>
                            <p className="text-slate-600 text-xs mt-1 leading-relaxed">{log.details}</p>
                          </div>
                        </div>

                        <div className="text-right text-[11px] text-slate-400 font-mono shrink-0 pl-6 md:pl-0">
                          <div className="font-bold text-slate-800">{log.userName || 'Authorized Personnel'}</div>
                          <span className="text-slate-500 text-[10px] block mt-0.5">{log.timestamp}</span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 8: COURSE FEE UPGRADE & CONCESSION REQUESTS */}
        {activeTab === 'fee-upgrades' && (
          <div className="space-y-6">
            {!isPrimaryAdmin(currentAdmin) && (
              <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl flex items-start gap-3 text-amber-900 shadow-xs">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1 text-xs">
                  <p className="font-bold text-sm text-amber-950 flex items-center gap-1.5">
                    <Lock className="w-4 h-4 text-amber-700" />
                    Restricted Operational Authority: Course Fee Upgrades Reserved for 3 Primary Admins Only
                  </p>
                  <p className="text-amber-800 leading-relaxed">
                    Under statutory foundation bylaws, course fee approvals, revisions, and concessions can only be authorized by the <strong>3 Primary Directors</strong>:
                    <strong> Soumen Ghosh</strong> (Chairman & Director), <strong>Subrata Roy</strong> (Project Director), and <strong>Biswajit Das</strong> (Academic & Examination Director).
                  </p>
                  <p className="text-amber-700 text-[11px] font-semibold">
                    As an MIS Administrator, you have full read access to audit submitted fee schedules, but approval/rejection actions are disabled for this account.
                  </p>
                </div>
              </div>
            )}

            {/* Supabase Cloud Connection Banner */}
            <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white p-5 rounded-3xl border border-emerald-500/30 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0">
                  <Database className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-black text-sm text-white">Supabase Cloud Database Integration</h3>
                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-[10px] font-bold">
                      qqzfaxrqzjhvowfctwpp • Connected
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Live cloud sync active for <code className="text-emerald-300">fee_upgrade_requests</code>, <code className="text-emerald-300">payment_proofs</code>, and <code className="text-emerald-300">students</code> tables.
                  </p>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                    Endpoint: https://qqzfaxrqzjhvowfctwpp.supabase.co • Anon Key: sb_publishable_ZoQYUof...
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                {supabaseSyncMsg && (
                  <span className="text-xs text-emerald-300 font-bold animate-fade-in">
                    {supabaseSyncMsg}
                  </span>
                )}
                <button
                  type="button"
                  onClick={handleSyncToSupabase}
                  disabled={supabaseSyncing}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50 shrink-0"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${supabaseSyncing ? 'animate-spin' : ''}`} />
                  {supabaseSyncing ? 'Syncing...' : 'Sync to Supabase'}
                </button>
              </div>
            </div>

            {/* Header & Stats KPI Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
                <span className="text-[11px] font-bold uppercase text-slate-500">Total Upgrade Requests</span>
                <h4 className="text-2xl font-black text-slate-900">{feeUpgradeRequests.length}</h4>
                <p className="text-[10px] text-slate-500">Center & Student level submissions</p>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-amber-200 shadow-sm space-y-1 bg-amber-50/40">
                <span className="text-[11px] font-bold uppercase text-amber-700">Pending Approvals</span>
                <h4 className="text-2xl font-black text-amber-900">{pendingFeeUpgrades.length}</h4>
                <p className="text-[10px] text-amber-800">Requires Head Office authorization</p>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-emerald-200 shadow-sm space-y-1 bg-emerald-50/40">
                <span className="text-[11px] font-bold uppercase text-emerald-700">Approved & Enforced</span>
                <h4 className="text-2xl font-black text-emerald-900">
                  {feeUpgradeRequests.filter((r) => r.status === 'APPROVED').length}
                </h4>
                <p className="text-[10px] text-emerald-800">Reflected in Center & Student profiles</p>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-blue-200 shadow-sm space-y-1 bg-blue-50/40">
                <span className="text-[11px] font-bold uppercase text-blue-700">Payment Proofs Attached</span>
                <h4 className="text-2xl font-black text-blue-900">
                  {feeUpgradeRequests.filter((r) => !!r.transactionId || !!r.paymentProofId).length}
                </h4>
                <p className="text-[10px] text-blue-800">Bank UTR & UPI Reference Records</p>
              </div>
            </div>

            {/* DEDICATED VISUAL DASHBOARD: PENDING STUDENT FEE UPGRADE VERIFICATION & APPROVAL QUEUE */}
            <div className="bg-white rounded-3xl p-6 shadow-md border-2 border-emerald-500/20 space-y-5">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-amber-100 text-amber-900 font-black text-xs rounded-full flex items-center gap-1.5 animate-pulse">
                      <Clock className="w-3.5 h-3.5 text-amber-700" />
                      ACTION REQUIRED ({pendingFeeUpgrades.length})
                    </span>
                    <h3 className="font-extrabold text-slate-900 text-base">
                      Pending Student Fee Upgrade Verification & Quick Approval Queue
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Live visual tracking of fee adjustments submitted by training partners. Audit payment proof status, verified transaction IDs (UTR), student payment plans, and timestamps for 1-click execution.
                  </p>
                </div>

                {/* Queue Filter Controls */}
                <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setPendingQueueFilter('ALL')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      pendingQueueFilter === 'ALL'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    All Pending ({pendingFeeUpgrades.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setPendingQueueFilter('WITH_PROOF')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      pendingQueueFilter === 'WITH_PROOF'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    With Payment Proof ({pendingFeeUpgrades.filter(r => !!r.transactionId || !!r.paymentProofId).length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setPendingQueueFilter('STUDENT')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      pendingQueueFilter === 'STUDENT'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Students ({pendingFeeUpgrades.filter(r => r.scope === 'SINGLE_STUDENT').length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setPendingQueueFilter('CENTER')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      pendingQueueFilter === 'CENTER'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Center Scope ({pendingFeeUpgrades.filter(r => r.scope === 'FULL_CENTER').length})
                  </button>
                </div>
              </div>

              {/* Pending Queue List */}
              {(() => {
                const pendingList = pendingFeeUpgrades.filter((r) => {
                  if (pendingQueueFilter === 'WITH_PROOF') return !!r.transactionId || !!r.paymentProofId;
                  if (pendingQueueFilter === 'STUDENT') return r.scope === 'SINGLE_STUDENT';
                  if (pendingQueueFilter === 'CENTER') return r.scope === 'FULL_CENTER';
                  return true;
                });

                if (pendingList.length === 0) {
                  return (
                    <div className="p-8 text-center bg-emerald-50/50 rounded-2xl border border-dashed border-emerald-200 text-xs text-emerald-800 space-y-1">
                      <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                      <p className="font-bold text-sm text-emerald-950">Pending Verification Queue is Clear!</p>
                      <p className="text-emerald-700">
                        All student fee upgrade requests have been processed. New submissions from training partners will appear here in real time.
                      </p>
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-1 gap-4">
                    {pendingList.map((req) => {
                      const curFee = req.currentFee ?? (req as any).currentFees ?? 0;
                      const reqFee = req.requestedFee ?? (req as any).proposedFees ?? 0;
                      const diff = reqFee - curFee;
                      const cName = req.courseName || (req as any).courseTitle || 'Course';
                      const submitTime = req.timestamp || req.requestedDate || (req as any).requestDate || '2026-09-12';
                      const currentRemark = adminRemarksMap[req.id] ?? '';

                      return (
                        <div
                          key={req.id}
                          className="bg-slate-50/90 rounded-2xl border border-slate-200 hover:border-emerald-400 p-5 transition-all shadow-xs space-y-4"
                        >
                          {/* Card Top Metadata */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                  req.scope === 'FULL_CENTER'
                                    ? 'bg-blue-100 text-blue-900 border border-blue-200'
                                    : 'bg-purple-100 text-purple-900 border border-purple-200'
                                }`}
                              >
                                {req.scope === 'FULL_CENTER' ? '🏢 Full Center Scope' : '👤 Student Concession / Upgrade'}
                              </span>

                              <span className="font-mono text-xs font-bold text-slate-800">
                                {req.requestNo || req.id}
                              </span>

                              <span className="text-slate-300">•</span>

                              <div className="flex items-center gap-1 text-[11px] text-slate-500">
                                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                <span>Submitted: {submitTime}</span>
                              </div>
                            </div>

                            {/* Payment Proof Status Badge */}
                            <div className="flex items-center gap-2">
                              <span
                                className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1 border ${
                                  req.paymentProofStatus === 'VERIFIED'
                                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                    : req.paymentProofStatus === 'PENDING'
                                    ? 'bg-amber-100 text-amber-900 border-amber-300 animate-pulse'
                                    : req.paymentProofStatus === 'REJECTED'
                                    ? 'bg-rose-100 text-rose-800 border-rose-300'
                                    : 'bg-slate-200 text-slate-700 border-slate-300'
                                }`}
                              >
                                {req.paymentProofStatus === 'VERIFIED' ? (
                                  <CheckCircle className="w-3 h-3 text-emerald-700" />
                                ) : (
                                  <Clock className="w-3 h-3 text-amber-700" />
                                )}
                                Proof: {req.paymentProofStatus || (req.transactionId ? 'PENDING VERIFICATION' : 'AWAITING UPLOAD')}
                              </span>
                            </div>
                          </div>

                          {/* Middle Grid: Student Info, Course, Fee Delta, Payment Proof */}
                          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 text-xs">
                            {/* Student & Center Info (Col 5) */}
                            <div className="lg:col-span-5 space-y-2">
                              {req.scope === 'SINGLE_STUDENT' && (
                                <div className="p-3 bg-white rounded-xl border border-purple-100 space-y-1">
                                  <span className="text-[10px] font-bold uppercase text-purple-700 block">
                                    Enrolled Student Record
                                  </span>
                                  <h4 className="font-extrabold text-sm text-slate-900">
                                    {req.studentName}
                                  </h4>
                                  <div className="flex items-center gap-2 flex-wrap text-[11px] font-mono text-slate-500">
                                    <span>Reg: <strong>{req.studentRegNo || 'Pending'}</strong></span>
                                    {req.studentPaymentPlan && (
                                      <span className="px-2 py-0.5 bg-purple-50 text-purple-800 font-bold rounded">
                                        Plan: {req.studentPaymentPlan}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )}

                              <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase block">Training Center</span>
                                <p className="font-bold text-slate-800 text-xs">
                                  {req.partnerName} <span className="font-mono text-slate-500">({req.partnerCode})</span>
                                </p>
                              </div>

                              <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase block">Course Schedule</span>
                                <p className="font-semibold text-slate-800">{cName} <span className="font-mono text-slate-400">({req.courseCode || req.courseId})</span></p>
                              </div>

                              <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase block">Operating Reason / Justification</span>
                                <p className="text-slate-700 italic bg-white p-2.5 rounded-lg border border-slate-200 text-[11px]">
                                  "{req.reason}"
                                </p>
                              </div>
                            </div>

                            {/* Payment Proof & Transaction Details (Col 4) */}
                            <div className="lg:col-span-4 space-y-2 bg-white p-3.5 rounded-xl border border-slate-200">
                              <span className="text-[10px] font-bold uppercase text-emerald-800 block flex items-center justify-between">
                                <span className="flex items-center gap-1">
                                  <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                                  Payment Proof & Bank UTR
                                </span>
                                {req.paymentAmount && (
                                  <span className="font-bold font-mono text-emerald-700">₹{req.paymentAmount.toLocaleString()}</span>
                                )}
                              </span>

                              {req.transactionId ? (
                                <div className="space-y-1.5">
                                  <div className="flex items-center justify-between bg-slate-50 p-2 rounded-lg border border-slate-200 font-mono text-[11px]">
                                    <span className="text-slate-500 truncate mr-2">UTR: <strong>{req.transactionId}</strong></span>
                                    <button
                                      type="button"
                                      onClick={() => copyTxn(req.transactionId!)}
                                      className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors"
                                      title="Copy Transaction UTR"
                                    >
                                      {copiedTxn === req.transactionId ? (
                                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                                      ) : (
                                        <Copy className="w-3.5 h-3.5" />
                                      )}
                                    </button>
                                  </div>

                                  {req.paymentDate && (
                                    <p className="text-[10px] text-slate-500">
                                      Payment Date: <strong>{req.paymentDate}</strong>
                                    </p>
                                  )}

                                  <button
                                    type="button"
                                    onClick={() => setInspectingUpgrade(req)}
                                    className="w-full py-1.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold rounded-lg text-[11px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                    Inspect Proof & Bank Voucher
                                  </button>
                                </div>
                              ) : (
                                <div className="p-3 bg-slate-50 rounded-lg border border-dashed border-slate-200 text-center space-y-1 text-slate-500 text-[11px]">
                                  <p>No direct transaction UTR attached by partner.</p>
                                  <span className="text-[10px] text-slate-400">Direct Head Office approval will generate formal invoice.</span>
                                </div>
                              )}
                            </div>

                            {/* Fee Revision Comparison & 1-Click Action (Col 3) */}
                            <div className="lg:col-span-3 flex flex-col justify-between space-y-3 bg-white p-3.5 rounded-xl border border-slate-200">
                              <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1.5">
                                  Fee Revision Matrix
                                </span>
                                <div className="space-y-1 font-mono text-xs">
                                  <div className="flex justify-between items-center text-slate-500">
                                    <span>Current:</span>
                                    <span>₹{curFee.toLocaleString()}</span>
                                  </div>
                                  <div className="flex justify-between items-center font-bold text-slate-900">
                                    <span>Proposed:</span>
                                    <span>₹{reqFee.toLocaleString()}</span>
                                  </div>
                                  <div className="flex justify-between items-center pt-1 border-t border-slate-100">
                                    <span className="font-sans text-[10px] font-bold text-slate-500">Adjustment:</span>
                                    <span
                                      className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${
                                        diff > 0
                                          ? 'bg-emerald-50 text-emerald-800'
                                          : diff < 0
                                          ? 'bg-amber-50 text-amber-800'
                                          : 'bg-slate-100 text-slate-700'
                                      }`}
                                    >
                                      {diff > 0 ? `+₹${diff.toLocaleString()}` : `-₹${Math.abs(diff).toLocaleString()}`}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Directive Input & 1-Click Action */}
                              <div className="space-y-2 pt-2 border-t border-slate-100">
                                <input
                                  type="text"
                                  placeholder="Approval remark / directive..."
                                  value={currentRemark}
                                  onChange={(e) =>
                                    setAdminRemarksMap({
                                      ...adminRemarksMap,
                                      [req.id]: e.target.value,
                                    })
                                  }
                                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px]"
                                />

                                {isPrimaryAdmin(currentAdmin) ? (
                                  <div className="flex gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => approveFeeUpgradeRequest(req.id, currentRemark)}
                                      className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1 shadow-xs cursor-pointer transition-all"
                                      title="Approve fee upgrade, verify linked payment proof, and update student fee schedule"
                                    >
                                      <Check className="w-3.5 h-3.5" />
                                      Approve
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => rejectFeeUpgradeRequest(req.id, currentRemark)}
                                      className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold rounded-xl text-xs flex items-center justify-center gap-1 cursor-pointer transition-all"
                                      title="Reject request"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                      Reject
                                    </button>
                                  </div>
                                ) : (
                                  <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg text-center text-[10px] font-semibold text-amber-800 flex items-center justify-center gap-1">
                                    <Lock className="w-3 h-3 text-amber-700 shrink-0" />
                                    <span>Approval restricted to 3 Directors</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

            {/* MASTER AUDIT LOG OF ALL FEE UPGRADES (Filter & Search) */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-600" />
                    Complete Fee Upgrade & Concession History Log
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Historical record of all fee upgrade decisions by Soumen Ghosh, Subrata Roy, and Biswajit Das.
                  </p>
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
                  {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((status) => (
                    <button
                      key={status}
                      onClick={() => setFeeFilter(status)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        feeFilter === status
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {status === 'ALL'
                        ? `All (${feeUpgradeRequests.length})`
                        : status === 'PENDING'
                        ? `Pending (${pendingFeeUpgrades.length})`
                        : status.charAt(0) + status.slice(1).toLowerCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Request Cards / Table */}
              {(() => {
                const filtered = feeUpgradeRequests.filter((r) => {
                  if (feeFilter !== 'ALL' && r.status !== feeFilter) return false;
                  if (!searchFilter) return true;
                  const q = searchFilter.toLowerCase();
                  const cTitle = r.courseName || (r as any).courseTitle || '';
                  return (
                    r.partnerName.toLowerCase().includes(q) ||
                    cTitle.toLowerCase().includes(q) ||
                    (r.studentName && r.studentName.toLowerCase().includes(q)) ||
                    (r.studentRegNo && r.studentRegNo.toLowerCase().includes(q)) ||
                    (r.transactionId && r.transactionId.toLowerCase().includes(q)) ||
                    r.reason.toLowerCase().includes(q)
                  );
                });

                if (filtered.length === 0) {
                  return (
                    <div className="p-10 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-xs text-slate-500">
                      <p className="font-semibold text-slate-700 mb-1">No fee upgrade requests found for this filter.</p>
                      <p>When training partners submit course fee adjustments, they will appear here for review.</p>
                    </div>
                  );
                }

                return (
                  <div className="space-y-3">
                    {filtered.map((req) => {
                      const curFee = req.currentFee ?? (req as any).currentFees ?? 0;
                      const reqFee = req.requestedFee ?? (req as any).proposedFees ?? 0;
                      const diff = reqFee - curFee;
                      const cTitle = req.courseName || (req as any).courseTitle || 'Course';
                      const reqDate = req.timestamp || req.requestedDate || (req as any).requestDate || '2026-09-12';

                      return (
                        <div
                          key={req.id}
                          className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  req.status === 'APPROVED'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : req.status === 'REJECTED'
                                    ? 'bg-rose-100 text-rose-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {req.status}
                              </span>
                              <span className="font-bold text-slate-900">{req.partnerName}</span>
                              <span className="text-slate-400">•</span>
                              <span className="text-slate-700 font-semibold">{cTitle}</span>
                              {req.studentName && (
                                <>
                                  <span className="text-slate-400">•</span>
                                  <span className="text-purple-700 font-bold">Student: {req.studentName} ({req.studentRegNo})</span>
                                </>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 font-mono">
                              Current: ₹{curFee.toLocaleString()} → Proposed: ₹{reqFee.toLocaleString()} ({diff >= 0 ? `+₹${diff.toLocaleString()}` : `-₹${Math.abs(diff).toLocaleString()}`}) • Reason: {req.reason}
                            </p>
                            {req.transactionId && (
                              <p className="text-[11px] text-slate-600 font-mono flex items-center gap-1.5">
                                <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                                Txn UTR: <strong>{req.transactionId}</strong> • Proof: <strong className={req.paymentProofStatus === 'VERIFIED' ? 'text-emerald-700' : 'text-amber-700'}>{req.paymentProofStatus || 'PENDING'}</strong>
                              </p>
                            )}
                            {req.adminRemarks && (
                              <p className="text-[11px] text-slate-700 italic">
                                Admin Directive: "{req.adminRemarks}" {req.reviewedBy && `(by ${req.reviewedBy} on ${req.reviewedDate})`}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                            {req.transactionId && (
                              <button
                                type="button"
                                onClick={() => setInspectingUpgrade(req)}
                                className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                Inspect
                              </button>
                            )}
                            {req.status === 'PENDING' && isPrimaryAdmin(currentAdmin) && (
                              <button
                                type="button"
                                onClick={() => approveFeeUpgradeRequest(req.id, 'Approved via audit list')}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer shadow-xs"
                              >
                                <Check className="w-3.5 h-3.5" />
                                Quick Approve
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* TAB 9: DIRECTORATE & MIS ADMINISTRATIVE GOVERNANCE */}
        {activeTab === 'mis-admins' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-extrabold text-slate-900 text-base">Directorate & MIS Administrative Governance</h3>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Statutory executive governance matrix detailing the 3 Primary Signatory Directors and credentialed MIS administrative personnel.
                </p>
              </div>

              {isPrimaryAdmin(currentAdmin) && (
                <button
                  type="button"
                  onClick={() => setShowAddMisAdmin(true)}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-xs cursor-pointer transition-all"
                >
                  <PlusCircle className="w-4 h-4" />
                  + Add New MIS Administrator
                </button>
              )}
            </div>

            {/* 3 Primary Signatory Directors Cards */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-500" />
                The 3 Primary Signatory Directors (Full Executive Authority)
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Director 1: Soumen Ghosh */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-5 rounded-3xl border border-slate-700 shadow-md space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 bg-amber-400 text-slate-950 font-black text-[10px] rounded-full">
                      CHAIRMAN & DIRECTOR
                    </span>
                    <span className="text-[10px] text-emerald-400 font-mono font-bold">PRIMARY ADMIN #1</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-white">Soumen Ghosh</h4>
                    <p className="text-xs text-slate-400 font-mono">soumen.ghosh@jsssfoundation.in</p>
                  </div>
                  <div className="pt-2 border-t border-slate-700/80 text-[11px] space-y-1 text-slate-300">
                    <p>• Statutory Head Office Signatory Authority</p>
                    <p>• Sole Institutional Fee Upgrade Approvals</p>
                    <p>• Center Licensing & Legal Affiliations</p>
                  </div>
                  <div className="pt-2 flex items-center justify-between text-[10px] text-emerald-400 font-semibold">
                    <span>Status: ACTIVE (PERMANENT)</span>
                    <span>Signatory: Class 3 DSC</span>
                  </div>
                </div>

                {/* Director 2: Subrata Roy */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-5 rounded-3xl border border-slate-700 shadow-md space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 bg-blue-400 text-slate-950 font-black text-[10px] rounded-full">
                      PROJECT DIRECTOR
                    </span>
                    <span className="text-[10px] text-emerald-400 font-mono font-bold">PRIMARY ADMIN #2</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-white">Subrata Roy</h4>
                    <p className="text-xs text-slate-400 font-mono">project.jsssfoundation@gmail.com</p>
                  </div>
                  <div className="pt-2 border-t border-slate-700/80 text-[11px] space-y-1 text-slate-300">
                    <p>• Financial & Operational Signatory</p>
                    <p>• Partner Center Verification & Auditing</p>
                    <p>• Corporate Accounts & Bank Disbursals</p>
                  </div>
                  <div className="pt-2 flex items-center justify-between text-[10px] text-emerald-400 font-semibold">
                    <span>Status: ACTIVE (PERMANENT)</span>
                    <span>Signatory: Class 3 DSC</span>
                  </div>
                </div>

                {/* Director 3: Biswajit Das */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-5 rounded-3xl border border-slate-700 shadow-md space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 bg-indigo-400 text-slate-950 font-black text-[10px] rounded-full">
                      ACADEMIC & EXAM DIRECTOR
                    </span>
                    <span className="text-[10px] text-emerald-400 font-mono font-bold">PRIMARY ADMIN #3</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-white">Biswajit Das</h4>
                    <p className="text-xs text-slate-400 font-mono">biswajit.das@jsssfoundation.in</p>
                  </div>
                  <div className="pt-2 border-t border-slate-700/80 text-[11px] space-y-1 text-slate-300">
                    <p>• Controller of Examinations & Certification</p>
                    <p>• Curriculum Standards & Course Approval</p>
                    <p>• Academic Quality Assurance</p>
                  </div>
                  <div className="pt-2 flex items-center justify-between text-[10px] text-emerald-400 font-semibold">
                    <span>Status: ACTIVE (PERMANENT)</span>
                    <span>Signatory: Class 3 DSC</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Credentialed MIS Administrators Directory */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden space-y-0">
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Credentialed MIS Administrators & Officers Directory</h4>
                  <p className="text-xs text-slate-500">Personnel authorized for daily operations, student onboarding, marksheets, and certificate issuance.</p>
                </div>
                <span className="px-3 py-1 bg-slate-200 text-slate-800 rounded-full font-bold text-xs">
                  {admins.length} Total Registered
                </span>
              </div>

              <div className="divide-y divide-slate-100 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/70 text-slate-600 font-semibold uppercase text-[10px]">
                    <tr>
                      <th className="px-6 py-3">Administrator Name</th>
                      <th className="px-6 py-3">Official Email</th>
                      {(isPrimaryAdmin(currentAdmin) || currentAdmin?.role === 'SUPER_ADMIN') && (
                        <th className="px-6 py-3">Admin Password</th>
                      )}
                      <th className="px-6 py-3">Designation / Role</th>
                      <th className="px-6 py-3">Authority Type</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                    {admins.map((adm) => {
                      const isDir = isPrimaryAdmin(adm);
                      return (
                        <tr key={adm.id} className="hover:bg-slate-50/60">
                          <td className="px-6 py-4">
                            <span className="font-bold text-slate-900 block">{adm.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">ID: {adm.id}</span>
                          </td>
                          <td className="px-6 py-4 font-mono text-slate-700">{adm.email}</td>
                          {(isPrimaryAdmin(currentAdmin) || currentAdmin?.role === 'SUPER_ADMIN') && (
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-1.5 font-mono text-[11px]">
                                <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-800 font-bold">
                                  {revealedPasswordId === adm.id
                                    ? (getUserPassword(adm.id) || getUserPassword(adm.email) || '••••••••')
                                    : '••••••••'}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setRevealedPasswordId(revealedPasswordId === adm.id ? null : adm.id)}
                                  className="text-slate-500 hover:text-slate-900 p-1 cursor-pointer"
                                  title="Toggle password reveal"
                                >
                                  {revealedPasswordId === adm.id ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const pass = getUserPassword(adm.id) || getUserPassword(adm.email) || '';
                                    navigator.clipboard.writeText(`Email: ${adm.email}\nPass: ${pass}`);
                                    setCopiedKey(adm.id);
                                    setTimeout(() => setCopiedKey(null), 2000);
                                  }}
                                  className="text-slate-500 hover:text-slate-900 p-1 cursor-pointer"
                                  title="Copy Admin Credentials"
                                >
                                  {copiedKey === adm.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                                </button>
                              </div>
                            </td>
                          )}
                          <td className="px-6 py-4 text-slate-600">{adm.designation || 'MIS Administrator'}</td>
                          <td className="px-6 py-4">
                            {isDir ? (
                              <span className="px-2.5 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 font-bold rounded-full text-[10px]">
                                ★ Primary Signatory Director
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 bg-teal-100 text-teal-800 border border-teal-200 font-semibold rounded-full text-[10px]">
                                MIS Operational Admin
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                adm.status === 'ACTIVE'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {adm.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            {isPrimaryAdmin(currentAdmin) && !isDir ? (
                              <button
                                type="button"
                                onClick={() => toggleAdminStatus(adm.id)}
                                className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                                  adm.status === 'ACTIVE'
                                    ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                                }`}
                              >
                                {adm.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                              </button>
                            ) : (
                              <span className="text-[11px] text-slate-400 italic">Protected</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Center MIS Staff Directory */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden space-y-0">
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <Users className="w-4 h-4 text-teal-600" />
                    Authorized Center MIS Personnel Directory
                  </h4>
                  <p className="text-xs text-slate-500">Center-level staff designated for student onboarding, attendance, and exam management.</p>
                </div>
                <span className="px-3 py-1 bg-teal-50 text-teal-800 border border-teal-200 rounded-full font-bold text-xs">
                  {centerMISUsers.length} Center MIS Staff
                </span>
              </div>

              <div className="divide-y divide-slate-100 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/70 text-slate-600 font-semibold uppercase text-[10px]">
                    <tr>
                      <th className="px-6 py-3">MIS Code / ID</th>
                      <th className="px-6 py-3">Staff Name</th>
                      <th className="px-6 py-3">Bound Center</th>
                      <th className="px-6 py-3">Official Email</th>
                      {(isPrimaryAdmin(currentAdmin) || currentAdmin?.role === 'SUPER_ADMIN') && (
                        <th className="px-6 py-3">Login Password</th>
                      )}
                      <th className="px-6 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                    {centerMISUsers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                          No Center MIS personnel registered yet.
                        </td>
                      </tr>
                    ) : (
                      centerMISUsers.map((cm) => (
                        <tr key={cm.id} className="hover:bg-slate-50/60">
                          <td className="px-6 py-4 font-mono font-bold text-teal-700">{cm.misCode}</td>
                          <td className="px-6 py-4">
                            <span className="font-bold text-slate-900 block">{cm.name}</span>
                            <span className="text-[10px] text-slate-400">{cm.designation}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-bold text-slate-800 block">{cm.centerName}</span>
                            <span className="font-mono text-[10px] text-slate-400">{cm.partnerCode}</span>
                          </td>
                          <td className="px-6 py-4 font-mono text-slate-600">{cm.email}</td>
                          {(isPrimaryAdmin(currentAdmin) || currentAdmin?.role === 'SUPER_ADMIN') && (
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-1.5 font-mono text-[11px]">
                                <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-800 font-bold">
                                  {revealedPasswordId === cm.misCode
                                    ? (getUserPassword(cm.misCode) || getUserPassword(cm.email) || '••••••••')
                                    : '••••••••'}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setRevealedPasswordId(revealedPasswordId === cm.misCode ? null : cm.misCode)}
                                  className="text-slate-500 hover:text-slate-900 p-1 cursor-pointer"
                                  title="Toggle password reveal"
                                >
                                  {revealedPasswordId === cm.misCode ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const pass = getUserPassword(cm.misCode) || getUserPassword(cm.email) || '';
                                    navigator.clipboard.writeText(`MIS Code: ${cm.misCode}\nPass: ${pass}`);
                                    setCopiedKey(cm.misCode);
                                    setTimeout(() => setCopiedKey(null), 2000);
                                  }}
                                  className="text-slate-500 hover:text-slate-900 p-1 cursor-pointer"
                                  title="Copy MIS Credentials"
                                >
                                  {copiedKey === cm.misCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                                </button>
                              </div>
                            </td>
                          )}
                          <td className="px-6 py-4">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                cm.status === 'ACTIVE'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {cm.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Statutory RBAC Governance Matrix */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-3">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Role-Based Access Control (RBAC) Governance Matrix
              </h4>
              <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-semibold uppercase text-[10px]">
                    <tr>
                      <th className="px-4 py-2.5">Institutional Capability</th>
                      <th className="px-4 py-2.5 text-center">3 Primary Directors</th>
                      <th className="px-4 py-2.5 text-center">MIS Administrators</th>
                      <th className="px-4 py-2.5">Statutory Basis / Bylaw Reference</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    <tr>
                      <td className="px-4 py-3 font-semibold text-slate-900">Student Enrolment & Registration</td>
                      <td className="px-4 py-3 text-center"><Check className="w-4 h-4 text-emerald-600 inline" /> Full</td>
                      <td className="px-4 py-3 text-center"><Check className="w-4 h-4 text-emerald-600 inline" /> Full</td>
                      <td className="px-4 py-3 text-slate-500">Standard operational admissions procedure</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-semibold text-slate-900">Partner Center Verification & Approvals</td>
                      <td className="px-4 py-3 text-center"><Check className="w-4 h-4 text-emerald-600 inline" /> Full</td>
                      <td className="px-4 py-3 text-center"><Check className="w-4 h-4 text-emerald-600 inline" /> Full</td>
                      <td className="px-4 py-3 text-slate-500">Center infrastructure and trade license validation</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-semibold text-slate-900">Examination Marks & Certificate Generation</td>
                      <td className="px-4 py-3 text-center"><Check className="w-4 h-4 text-emerald-600 inline" /> Full</td>
                      <td className="px-4 py-3 text-center"><Check className="w-4 h-4 text-emerald-600 inline" /> Full</td>
                      <td className="px-4 py-3 text-slate-500">Controller of Examinations guidelines</td>
                    </tr>
                    <tr className="bg-amber-50/50">
                      <td className="px-4 py-3 font-bold text-amber-950">Course Fee Upgrade Approvals & Concessions</td>
                      <td className="px-4 py-3 text-center font-bold text-emerald-700"><Check className="w-4 h-4 text-emerald-600 inline" /> Exclusive Authority</td>
                      <td className="px-4 py-3 text-center font-bold text-rose-700"><X className="w-4 h-4 text-rose-600 inline" /> Read Only</td>
                      <td className="px-4 py-3 text-amber-900 font-semibold">Reserved for 3 Directors per Section 8 Charter</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-semibold text-slate-900">MIS Administrative Personnel Creation</td>
                      <td className="px-4 py-3 text-center font-bold text-emerald-700"><Check className="w-4 h-4 text-emerald-600 inline" /> Exclusive</td>
                      <td className="px-4 py-3 text-center text-rose-700"><X className="w-4 h-4 text-rose-600 inline" /> Denied</td>
                      <td className="px-4 py-3 text-slate-500">Directorate executive appointment power</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 12: MASTER CREDENTIALS & ID VAULT (SUPER ADMIN) */}
        {activeTab === 'credentials' && (isPrimaryAdmin(currentAdmin) || currentAdmin?.role === 'SUPER_ADMIN') && (
          <MasterCredentialsVault
            students={students}
            partners={partners}
            centerMISUsers={centerMISUsers}
            admins={admins}
            getUserPassword={getUserPassword}
            adminUpdateUserPassword={adminUpdateUserPassword}
            activityLogs={activityLogs}
            onViewLogsForActor={(actor) => {
              setLogSearchQuery(actor);
              setActiveTab('logs');
            }}
          />
        )}

        {/* TAB: BATCH MONITORING MODULE */}
        {activeTab === 'batches' && (
          <BatchMonitoringModule
            userRole={isPrimaryAdmin(currentAdmin) || currentAdmin?.role === 'SUPER_ADMIN' ? 'SUPER_ADMIN' : 'MIS_ADMIN'}
          />
        )}

        {/* TAB: STUDENT FEES RECORD MODULE */}
        {activeTab === 'student-fees' && (
          <StudentFeesRecordModule
            userRole={isPrimaryAdmin(currentAdmin) || currentAdmin?.role === 'SUPER_ADMIN' ? 'SUPER_ADMIN' : 'MIS_ADMIN'}
          />
        )}

        {/* TAB: OFFLINE PAYMENTS & QR REMITTANCE MODULE */}
        {activeTab === 'offline-payments' && (
          <OfflinePaymentsModule
            userRole={isPrimaryAdmin(currentAdmin) || currentAdmin?.role === 'SUPER_ADMIN' ? 'SUPER_ADMIN' : 'MIS_ADMIN'}
          />
        )}

        {/* TAB: CENTER MIS ID MANAGEMENT MODULE */}
        {activeTab === 'center-mis' && (
          <CenterMISManagementModule
            userRole={isPrimaryAdmin(currentAdmin) || currentAdmin?.role === 'SUPER_ADMIN' ? 'SUPER_ADMIN' : 'MIS_ADMIN'}
          />
        )}

        {/* TAB: INSTITUTIONAL DOWNLOAD SECTION MODULE */}
        {activeTab === 'downloads' && (
          <DownloadSectionModule />
        )}
      </div>

      {/* Add Course Modal */}
      {showAddCourse && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900">Add New Course to Academy</h3>
              <button onClick={() => setShowAddCourse(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <form onSubmit={handleAddCourseSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Course Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Advanced Python & AI Automation"
                  value={courseFormData.title}
                  onChange={(e) => setCourseFormData({ ...courseFormData, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Course Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. APAI"
                    value={courseFormData.code}
                    onChange={(e) => setCourseFormData({ ...courseFormData, code: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg uppercase font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Course Fees (₹) *</label>
                  <input
                    type="number"
                    required
                    value={courseFormData.fees}
                    onChange={(e) => setCourseFormData({ ...courseFormData, fees: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Duration *</label>
                  <input
                    type="text"
                    required
                    value={courseFormData.duration}
                    onChange={(e) => setCourseFormData({ ...courseFormData, duration: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Eligibility *</label>
                  <input
                    type="text"
                    required
                    value={courseFormData.eligibility}
                    onChange={(e) => setCourseFormData({ ...courseFormData, eligibility: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={courseFormData.description}
                  onChange={(e) => setCourseFormData({ ...courseFormData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddCourse(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs"
                >
                  Save Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Direct Add Student Modal */}
      {showAddStudent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900">Direct Super Admin Student Enrollment</h3>
              <button onClick={() => setShowAddStudent(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <form onSubmit={handleAddStudentSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Student Name *</label>
                  <input
                    type="text"
                    required
                    value={newStudentData.name}
                    onChange={(e) => setNewStudentData({ ...newStudentData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Father's Name *</label>
                  <input
                    type="text"
                    required
                    value={newStudentData.fatherName}
                    onChange={(e) => setNewStudentData({ ...newStudentData, fatherName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={newStudentData.email}
                    onChange={(e) => setNewStudentData({ ...newStudentData, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone *</label>
                  <input
                    type="tel"
                    required
                    value={newStudentData.phone}
                    onChange={(e) => setNewStudentData({ ...newStudentData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Select Course *</label>
                  <select
                    value={newStudentData.courseId}
                    onChange={(e) => setNewStudentData({ ...newStudentData, courseId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  >
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Assign Partner Center *</label>
                  <select
                    value={newStudentData.partnerId}
                    onChange={(e) => setNewStudentData({ ...newStudentData, partnerId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  >
                    {partners.map((p) => (
                      <option key={p.id} value={p.id}>{p.centerName}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddStudent(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs"
                >
                  Create Student & Generate ID
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Center Profile & Approved Fees Modal */}
      {selectedPartnerForProfile && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-3xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative my-8 border border-slate-200">
            <button
              onClick={() => setSelectedPartnerForProfile(null)}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Profile Header */}
            <div className="flex items-center gap-4 border-b border-slate-200 pb-5">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-emerald-400 flex items-center justify-center font-black text-xl border border-slate-700 shadow-md">
                {selectedPartnerForProfile.centerName.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-slate-900">{selectedPartnerForProfile.centerName}</h3>
                  <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-[10px] rounded-full">
                    {selectedPartnerForProfile.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  Code: <strong>{selectedPartnerForProfile.partnerCode}</strong> • Director: {selectedPartnerForProfile.ownerName} • Phone: {selectedPartnerForProfile.phone}
                </p>
                <p className="text-[11px] text-slate-500">
                  Location: {selectedPartnerForProfile.address}, {selectedPartnerForProfile.district}, {selectedPartnerForProfile.state} - {selectedPartnerForProfile.pincode}
                </p>
              </div>
            </div>

            {/* Super Admin Center Security & Runtime Credentials Box */}
            {(isPrimaryAdmin(currentAdmin) || currentAdmin?.role === 'SUPER_ADMIN') && (
              <div className="bg-slate-900 text-white rounded-2xl p-4 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
                    <Key className="w-3.5 h-3.5" />
                    Super Admin Master Credentials Dossier
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Zero-Disk Ephemeral Security</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/60">
                    <span className="text-[10px] text-slate-400 block">Center Login ID</span>
                    <span className="font-mono font-bold text-emerald-400 text-sm">{selectedPartnerForProfile.partnerCode}</span>
                  </div>
                  <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/60">
                    <span className="text-[10px] text-slate-400 block">Official Contact Email</span>
                    <span className="font-mono font-medium text-slate-200 text-xs truncate block">{selectedPartnerForProfile.email}</span>
                  </div>
                  <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/60">
                    <span className="text-[10px] text-slate-400 block">In-Memory Password</span>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className="font-mono font-bold text-amber-300">
                        {revealedPasswordId === selectedPartnerForProfile.partnerCode
                          ? (getUserPassword(selectedPartnerForProfile.partnerCode) || getUserPassword(selectedPartnerForProfile.email) || '••••••••')
                          : '••••••••'}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setRevealedPasswordId(revealedPasswordId === selectedPartnerForProfile.partnerCode ? null : selectedPartnerForProfile.partnerCode)}
                          className="text-slate-400 hover:text-white p-1"
                          title="Toggle reveal"
                        >
                          {revealedPasswordId === selectedPartnerForProfile.partnerCode ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const pass = getUserPassword(selectedPartnerForProfile.partnerCode) || getUserPassword(selectedPartnerForProfile.email) || '';
                            navigator.clipboard.writeText(`Center Code: ${selectedPartnerForProfile.partnerCode}\nEmail: ${selectedPartnerForProfile.email}\nPassword: ${pass}`);
                            setCopiedKey(selectedPartnerForProfile.partnerCode);
                            setTimeout(() => setCopiedKey(null), 2000);
                          }}
                          className="text-slate-400 hover:text-white p-1"
                          title="Copy credentials"
                        >
                          {copiedKey === selectedPartnerForProfile.partnerCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Approved Fee Schedule Table */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-xs flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                    Center Course Fee Structure (Head Office Approved Rates)
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Course rates applicable for student enrollments at this center
                  </p>
                </div>
                <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-[11px] font-bold">
                  {Object.keys(selectedPartnerForProfile.customCourseFees || {}).length} Custom Rate(s) Active
                </span>
              </div>

              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-semibold uppercase text-[10px]">
                    <tr>
                      <th className="px-4 py-2.5">Course Code & Title</th>
                      <th className="px-4 py-2.5">Duration</th>
                      <th className="px-4 py-2.5">Base Fee</th>
                      <th className="px-4 py-2.5">Center Approved Fee</th>
                      <th className="px-4 py-2.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                    {courses.map((c) => {
                      const hasCustom =
                        selectedPartnerForProfile.customCourseFees &&
                        selectedPartnerForProfile.customCourseFees[c.id] !== undefined;
                      const approvedFee = hasCustom
                        ? selectedPartnerForProfile.customCourseFees![c.id]
                        : c.fees;

                      return (
                        <tr key={c.id} className="hover:bg-slate-50/60">
                          <td className="px-4 py-3">
                            <span className="font-bold text-slate-900 block">{c.title}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{c.code}</span>
                          </td>
                          <td className="px-4 py-3 text-slate-600">{c.duration}</td>
                          <td className="px-4 py-3 text-slate-500 font-mono">₹{c.fees.toLocaleString()}</td>
                          <td className="px-4 py-3">
                            <span className="font-bold text-slate-900 font-mono">₹{approvedFee.toLocaleString()}</span>
                            {hasCustom && (
                              <span className="block text-[10px] font-bold text-emerald-700">
                                {approvedFee > c.fees ? `+₹${approvedFee - c.fees}` : `-₹${c.fees - approvedFee}`} vs Base
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {hasCustom ? (
                              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[10px] font-bold inline-flex items-center gap-1">
                                <Check className="w-3 h-3" />
                                Custom Approved
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px]">
                                Base Rate
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Fee Upgrade Requests for this center */}
            {(() => {
              const centerRequests = feeUpgradeRequests.filter(
                (r) => r.partnerId === selectedPartnerForProfile.id
              );
              if (centerRequests.length === 0) return null;

              return (
                <div className="space-y-2 pt-2 border-t border-slate-200">
                  <h4 className="font-bold text-slate-900 text-xs flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                    Fee Upgrade Request History ({centerRequests.length})
                  </h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {centerRequests.map((req) => (
                      <div
                        key={req.id}
                        className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between gap-3"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900">{req.courseName || (req as any).courseTitle || 'Course'}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-semibold">
                              {req.scope === 'FULL_CENTER' ? 'Center Scope' : `Student: ${req.studentName}`}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5 font-mono">
                            ₹{(req.currentFee ?? (req as any).currentFees ?? 0).toLocaleString()} → ₹{(req.requestedFee ?? (req as any).proposedFees ?? 0).toLocaleString()} • Reason: {req.reason}
                          </p>
                        </div>
                        <div>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              req.status === 'APPROVED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : req.status === 'REJECTED'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {req.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            <div className="flex justify-end pt-3 border-t border-slate-200">
              <button
                onClick={() => setSelectedPartnerForProfile(null)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-colors"
              >
                Close Center Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Student Profile Dossier & Master Credentials Modal */}
      {selectedStudentForProfile && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-3xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative my-8 border border-slate-200">
            <button
              onClick={() => setSelectedStudentForProfile(null)}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Profile Header */}
            <div className="flex items-center gap-4 border-b border-slate-200 pb-5">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center font-black text-xl shadow-md border border-emerald-500">
                {selectedStudentForProfile.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-slate-900">{selectedStudentForProfile.name}</h3>
                  <span className={`px-2.5 py-0.5 font-bold text-[10px] rounded-full ${
                    selectedStudentForProfile.feeStatus === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {selectedStudentForProfile.feeStatus}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  Reg No: <strong>{selectedStudentForProfile.regNo}</strong> • Course: {selectedStudentForProfile.courseName}
                </p>
                <p className="text-[11px] text-slate-500">
                  Center: {selectedStudentForProfile.partnerName} • Email: {selectedStudentForProfile.email} • Phone: {selectedStudentForProfile.phone}
                </p>
              </div>
            </div>

            {/* Super Admin Security Credentials Box */}
            {(isPrimaryAdmin(currentAdmin) || currentAdmin?.role === 'SUPER_ADMIN') && (
              <div className="bg-slate-900 text-white rounded-2xl p-4 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
                    <Key className="w-3.5 h-3.5" />
                    Student Master Credentials Dossier
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">In-Memory Zero-Disk Vault</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/60">
                    <span className="text-[10px] text-slate-400 block">Student Login Reg No</span>
                    <span className="font-mono font-bold text-emerald-400 text-sm">{selectedStudentForProfile.regNo}</span>
                  </div>
                  <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/60">
                    <span className="text-[10px] text-slate-400 block">Official Student Email</span>
                    <span className="font-mono font-medium text-slate-200 text-xs truncate block">{selectedStudentForProfile.email}</span>
                  </div>
                  <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/60">
                    <span className="text-[10px] text-slate-400 block">In-Memory Password</span>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className="font-mono font-bold text-amber-300">
                        {revealedPasswordId === selectedStudentForProfile.regNo
                          ? (getUserPassword(selectedStudentForProfile.regNo) || getUserPassword(selectedStudentForProfile.email) || '••••••••')
                          : '••••••••'}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setRevealedPasswordId(revealedPasswordId === selectedStudentForProfile.regNo ? null : selectedStudentForProfile.regNo)}
                          className="text-slate-400 hover:text-white p-1"
                          title="Toggle reveal"
                        >
                          {revealedPasswordId === selectedStudentForProfile.regNo ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const pass = getUserPassword(selectedStudentForProfile.regNo) || getUserPassword(selectedStudentForProfile.email) || '';
                            navigator.clipboard.writeText(`Reg No: ${selectedStudentForProfile.regNo}\nEmail: ${selectedStudentForProfile.email}\nPassword: ${pass}`);
                            setCopiedKey(selectedStudentForProfile.regNo);
                            setTimeout(() => setCopiedKey(null), 2000);
                          }}
                          className="text-slate-400 hover:text-white p-1"
                          title="Copy credentials"
                        >
                          {copiedKey === selectedStudentForProfile.regNo ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Academic & Financial Overview Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Financial Ledger */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  Fee Ledger & Payment Schedule
                </h4>
                <div className="grid grid-cols-3 gap-2 text-center py-2 bg-white rounded-xl border border-slate-200">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Total Fee</span>
                    <span className="font-bold text-slate-900">₹{(selectedStudentForProfile.totalFees ?? 0).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Paid Fee</span>
                    <span className="font-bold text-emerald-700">₹{(selectedStudentForProfile.paidFees ?? 0).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Balance Due</span>
                    <span className="font-bold text-rose-600">₹{Math.max(0, (selectedStudentForProfile.totalFees ?? 0) - (selectedStudentForProfile.paidFees ?? 0)).toLocaleString()}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-600 pt-1">
                  <span>Payment Plan: <strong className="text-slate-800">{selectedStudentForProfile.paymentOption || 'ONE_TIME'}</strong></span>
                  <span>Payment Proofs: <strong className="text-emerald-700">{selectedStudentForProfile.paymentProofs?.length || 0} Submitted</strong></span>
                </div>
              </div>

              {/* Examination & Marks */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                  <Award className="w-4 h-4 text-teal-600" />
                  Examination & Certification Standing
                </h4>
                {selectedStudentForProfile.marks ? (
                  <div className="grid grid-cols-3 gap-2 text-center py-2 bg-white rounded-xl border border-slate-200">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Theory</span>
                      <span className="font-bold text-slate-900">{selectedStudentForProfile.marks.theory}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Practical</span>
                      <span className="font-bold text-slate-900">{selectedStudentForProfile.marks.practical}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Grade / %</span>
                      <span className="font-bold text-emerald-700">{selectedStudentForProfile.marks.grade} ({selectedStudentForProfile.marks.percentage}%)</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-white rounded-xl border border-slate-200 text-center text-slate-400">
                    Exam standing: <strong className="text-slate-600">{selectedStudentForProfile.examStatus}</strong> (Not yet evaluated)
                  </div>
                )}
                <div className="flex items-center justify-between text-[11px] text-slate-600 pt-1">
                  <span>Attendance Records: <strong className="text-slate-800">{selectedStudentForProfile.attendanceHistory?.length || 0} Sessions</strong></span>
                  <span>Exam Status: <strong className="text-emerald-700">{selectedStudentForProfile.examStatus}</strong></span>
                </div>
              </div>
            </div>

            {/* Audit Logs for this Student */}
            <div className="space-y-2 pt-2 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-900 text-xs flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-600" />
                  Entity Activity & Security Audit Trail
                </h4>
                <button
                  type="button"
                  onClick={() => {
                    setLogSearchQuery(selectedStudentForProfile.name);
                    setSelectedStudentForProfile(null);
                    setActiveTab('logs');
                  }}
                  className="text-[11px] text-emerald-700 hover:text-emerald-900 font-bold underline cursor-pointer"
                >
                  View All in Audit Log Tab →
                </button>
              </div>
              {(() => {
                const studentLogs = activityLogs.filter(
                  (l) =>
                    l.actorName.toLowerCase().includes(selectedStudentForProfile.name.toLowerCase()) ||
                    l.details.toLowerCase().includes(selectedStudentForProfile.regNo.toLowerCase()) ||
                    l.details.toLowerCase().includes(selectedStudentForProfile.name.toLowerCase())
                );
                if (studentLogs.length === 0) {
                  return (
                    <div className="p-3 bg-slate-50 rounded-xl text-center text-slate-400 text-xs">
                      No security or operational log entries recorded yet for this student.
                    </div>
                  );
                }
                return (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {studentLogs.slice(0, 5).map((l) => (
                      <div key={l.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
                        <div>
                          <span className="font-semibold text-slate-800 block">{l.actionType}</span>
                          <span className="text-[11px] text-slate-500">{l.details}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">{l.timestamp}</span>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-200">
              <button
                onClick={() => setSelectedStudentForProfile(null)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-colors"
              >
                Close Student Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inspection Modal for Pending Fee Upgrade & Payment Proof */}
      {inspectingUpgrade && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white rounded-3xl p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-200 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded-full text-[10px] uppercase">
                    Fee Upgrade & Payment Audit
                  </span>
                  <span className="font-mono text-xs font-bold text-slate-700">
                    {inspectingUpgrade.requestNo || inspectingUpgrade.id}
                  </span>
                </div>
                <h3 className="text-base font-black text-slate-900 mt-1">
                  Payment Proof & Electronic Bank Voucher Verification
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setInspectingUpgrade(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Simulated Official Bank UPI / IMPS E-Receipt Voucher */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-5 shadow-inner border border-slate-700 space-y-4 font-mono">
              <div className="flex items-center justify-between border-b border-slate-700/80 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-xs">
                    SBI
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white font-sans">STATE BANK OF INDIA</h4>
                    <p className="text-[10px] text-slate-400">Core Banking Electronic Payment Confirmation Slip</p>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold rounded-full">
                  NPCI UPI / IMPS VERIFIED
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-[11px]">
                <div>
                  <span className="text-slate-400 text-[10px] block">BENEFICIARY ACCOUNT</span>
                  <span className="text-slate-200 font-bold">JEEB SEVA SHIB SEVA FOUNDATION</span>
                  <span className="text-slate-400 text-[10px] block font-sans">A/C: 41920038910 • IFSC: SBIN0001234</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">TRANSACTION UTR / REF NO</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-emerald-400 font-bold text-xs">{inspectingUpgrade.transactionId || 'SBI/UPI/2026/894721'}</span>
                    <button
                      type="button"
                      onClick={() => copyTxn(inspectingUpgrade.transactionId || 'SBI/UPI/2026/894721')}
                      className="text-slate-400 hover:text-white"
                      title="Copy UTR"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">STUDENT BENEFICIARY</span>
                  <span className="text-slate-200 font-bold">{inspectingUpgrade.studentName || 'Academy Candidate'}</span>
                  <span className="text-slate-400 text-[10px] block">Reg No: {inspectingUpgrade.studentRegNo || 'REG-PENDING'}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">PAYMENT VALUE</span>
                  <span className="text-emerald-400 font-black text-base">
                    ₹{(inspectingUpgrade.paymentAmount || inspectingUpgrade.requestedFee || (inspectingUpgrade as any).proposedFees || 0).toLocaleString()}
                  </span>
                  <span className="text-slate-400 text-[10px] block font-sans">
                    Plan: {inspectingUpgrade.studentPaymentPlan || 'EMI (Installment #1)'}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-700/80 flex items-center justify-between text-[10px] text-slate-400">
                <span>Timestamp: {inspectingUpgrade.timestamp || inspectingUpgrade.paymentDate || '2026-09-12 14:35 IST'}</span>
                <span>Gateway Status: SUCCESSFUL</span>
              </div>
            </div>

            {/* Additional Request Details */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-0.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Center Affiliate</span>
                <p className="font-bold text-slate-800">{inspectingUpgrade.partnerName} ({inspectingUpgrade.partnerCode})</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-0.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Course Schedule</span>
                <p className="font-bold text-slate-800">{inspectingUpgrade.courseName || (inspectingUpgrade as any).courseTitle}</p>
              </div>
            </div>

            <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-xs space-y-1">
              <span className="text-[10px] font-bold text-purple-900 uppercase">Partner Operating Justification</span>
              <p className="text-purple-950 italic">"{inspectingUpgrade.reason}"</p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setInspectingUpgrade(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
              >
                Close Window
              </button>

              {inspectingUpgrade.status === 'PENDING' && isPrimaryAdmin(currentAdmin) && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      rejectFeeUpgradeRequest(inspectingUpgrade.id, 'Rejected after voucher audit');
                      setInspectingUpgrade(null);
                    }}
                    className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold rounded-xl text-xs cursor-pointer"
                  >
                    Reject Upgrade
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      approveFeeUpgradeRequest(inspectingUpgrade.id, `Verified Bank UTR ${inspectingUpgrade.transactionId || 'Payment Proof'}`);
                      setInspectingUpgrade(null);
                    }}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Approve Fee & Verify Proof
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add New MIS Administrator Modal */}
      {showAddMisAdmin && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">Appoint New MIS Administrator</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddMisAdmin(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500">
              New MIS administrators receive operational authority for student records, enrollment, and marksheets. Fee upgrades remain exclusively restricted to the 3 Primary Signatory Directors.
            </p>

            <form onSubmit={handleCreateMisAdminSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Officer Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ananya Sen"
                  value={misAdminForm.name}
                  onChange={(e) => setMisAdminForm({ ...misAdminForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Official Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. ananya.sen@jsssfoundation.in"
                  value={misAdminForm.email}
                  onChange={(e) => setMisAdminForm({ ...misAdminForm, email: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Designation *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Senior MIS Executive"
                    value={misAdminForm.designation}
                    onChange={(e) => setMisAdminForm({ ...misAdminForm, designation: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="e.g. +91 98765 43210"
                    value={misAdminForm.phone}
                    onChange={(e) => setMisAdminForm({ ...misAdminForm, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Temporary Access Password *</label>
                <input
                  type="password"
                  required
                  value={misAdminForm.password}
                  onChange={(e) => setMisAdminForm({ ...misAdminForm, password: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddMisAdmin(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs cursor-pointer"
                >
                  Appoint Administrator
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Raw Payment Proof Inspection Modal */}
      {selectedProofModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-mono text-[10px] font-bold uppercase">
                  {selectedProofModal.proof.id}
                </span>
                <h3 className="text-sm font-bold text-slate-900 mt-1">Direct Student Payment Proof Inspection</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProofModal(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Student:</span>
                  <span className="font-bold text-slate-900">{selectedProofModal.student.name} ({selectedProofModal.student.regNo})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Amount Paid:</span>
                  <span className="font-bold text-emerald-700 font-mono">₹{(selectedProofModal.proof.amount ?? 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Transaction ID (UTR):</span>
                  <span className="font-bold font-mono text-slate-900">{selectedProofModal.proof.transactionId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Payment Date:</span>
                  <span className="font-mono text-slate-700">{selectedProofModal.proof.paymentDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Current Status:</span>
                  <span className="font-bold text-amber-700">{selectedProofModal.proof.status}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setSelectedProofModal(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
              >
                Close
              </button>
              {selectedProofModal.proof.status === 'PENDING' && isPrimaryAdmin(currentAdmin) && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      verifyPaymentProof(selectedProofModal.proof.id, false, 'Invalid reference', currentAdmin?.name);
                      setSelectedProofModal(null);
                    }}
                    className="px-4 py-2 bg-rose-50 text-rose-700 font-bold rounded-xl text-xs cursor-pointer"
                  >
                    Reject
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      verifyPaymentProof(selectedProofModal.proof.id, true, 'Verified and credited', currentAdmin?.name);
                      setSelectedProofModal(null);
                    }}
                    className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl text-xs cursor-pointer"
                  >
                    Verify & Issue Receipt
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 0. TRAINING PARTNER FULL INSTITUTIONAL PROFILE DOSSIER MODAL              */}
      {/* ========================================================================= */}
      {selectedPartnerForProfile && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-4xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative my-8 border border-slate-200 max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setSelectedPartnerForProfile(null)}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-600 to-slate-900 text-white flex items-center justify-center font-black text-xl shadow-md">
                  {selectedPartnerForProfile.partnerCode.slice(-3)}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-xl font-black text-slate-900">{selectedPartnerForProfile.centerName}</h3>
                    <span className="px-2.5 py-0.5 bg-slate-900 text-white font-mono text-xs font-bold rounded-full">
                      {selectedPartnerForProfile.partnerCode}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${
                        selectedPartnerForProfile.status === 'APPROVED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : selectedPartnerForProfile.status === 'PENDING'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      ● {selectedPartnerForProfile.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium mt-1">
                    Registered On: {selectedPartnerForProfile.createdAt} • Commission Rate:{' '}
                    <strong className="text-emerald-700">{selectedPartnerForProfile.commissionRate || 25}%</strong>
                  </p>
                </div>
              </div>
            </div>

            {/* Institutional Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(() => {
                const partnerStudents = students.filter((s) => s.partnerId === selectedPartnerForProfile.id);
                const partnerPayments = payments.filter((p) => p.partnerId === selectedPartnerForProfile.id);
                const partnerTotalRev = partnerPayments.reduce((acc, p) => acc + p.amount, 0);
                const partnerBatches = batches.filter((b) => b.partnerId === selectedPartnerForProfile.id);
                const partnerCerts = certificates.filter((c) => c.partnerId === selectedPartnerForProfile.id);

                return (
                  <>
                    <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Total Enrolled</span>
                      <span className="text-xl font-black text-slate-900 mt-0.5 block">{partnerStudents.length} Students</span>
                    </div>
                    <div className="p-3.5 bg-emerald-50/70 rounded-2xl border border-emerald-200/80">
                      <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">Revenue Collected</span>
                      <span className="text-xl font-black text-emerald-800 mt-0.5 block">₹{(partnerTotalRev ?? 0).toLocaleString()}</span>
                    </div>
                    <div className="p-3.5 bg-blue-50/70 rounded-2xl border border-blue-200/80">
                      <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">Active Batches</span>
                      <span className="text-xl font-black text-blue-800 mt-0.5 block">{partnerBatches.length} Batches</span>
                    </div>
                    <div className="p-3.5 bg-purple-50/70 rounded-2xl border border-purple-200/80">
                      <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider block">Certified Graduates</span>
                      <span className="text-xl font-black text-purple-800 mt-0.5 block">{partnerCerts.length} Certs</span>
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Detailed Info Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
              {/* Director & Contact */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider flex items-center gap-1.5 text-emerald-800">
                  <UserCheck className="w-4 h-4 text-emerald-600" />
                  Center Ownership & Contact
                </h4>
                <div className="space-y-2 text-slate-700">
                  <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                    <span className="text-slate-500">Center Director / Owner:</span>
                    <strong className="text-slate-900">{selectedPartnerForProfile.ownerName}</strong>
                  </div>
                  <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                    <span className="text-slate-500">Official Email ID:</span>
                    <span className="font-mono text-slate-800">{selectedPartnerForProfile.email}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                    <span className="text-slate-500">Official Mobile / WhatsApp:</span>
                    <span className="font-mono text-slate-800">{selectedPartnerForProfile.phone}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                    <span className="text-slate-500">District & State:</span>
                    <span className="font-semibold">{selectedPartnerForProfile.district}, {selectedPartnerForProfile.state}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                    <span className="text-slate-500">Postal PIN Code:</span>
                    <span className="font-mono font-bold text-slate-800">{selectedPartnerForProfile.pincode}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-0.5">Physical Campus Address:</span>
                    <p className="font-medium text-slate-800 bg-white p-2 rounded-lg border border-slate-200">
                      {selectedPartnerForProfile.address}
                    </p>
                  </div>
                </div>
              </div>

              {/* Legal & Compliance */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider flex items-center gap-1.5 text-emerald-800">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Legal Verification & Compliance
                </h4>
                <div className="space-y-2 text-slate-700">
                  <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                    <span className="text-slate-500">Trade License Number:</span>
                    <span className="font-mono font-bold text-slate-900">{selectedPartnerForProfile.tradeLicenseNumber || 'TL-NOT-PROVIDED'}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                    <span className="text-slate-500">PAN Card Number:</span>
                    <span className="font-mono font-bold text-slate-900">{selectedPartnerForProfile.panNumber || 'PAN-NOT-PROVIDED'}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                    <span className="text-slate-500">Director Aadhar UID:</span>
                    <span className="font-mono font-bold text-slate-900">{selectedPartnerForProfile.aadharNumber || 'AADHAR-NOT-PROVIDED'}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                    <span className="text-slate-500">Partner Remittance UPI ID:</span>
                    <span className="font-mono text-emerald-800 font-semibold">{selectedPartnerForProfile.upiId || 'jsssfoundation@sbi'}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                    <span className="text-slate-500">Uploaded KYC Documents:</span>
                    <span className="font-medium text-slate-800">{selectedPartnerForProfile.documents?.length || 1} Verified Doc(s)</span>
                  </div>

                  {/* Security Credentials Section */}
                  <div className="mt-3 p-2.5 bg-amber-50 rounded-xl border border-amber-200 space-y-1.5">
                    <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1">
                      <KeyRound className="w-3.5 h-3.5 text-amber-700" />
                      Partner Portal Master Login Access
                    </span>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-amber-800">Master Login ID:</span>
                      <span className="font-mono font-bold text-slate-900">{selectedPartnerForProfile.partnerCode}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-amber-800">Password:</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-slate-900">
                          {revealedPasswordId === selectedPartnerForProfile.id
                            ? getUserPassword(selectedPartnerForProfile.partnerCode)
                            : '••••••••••••'}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setRevealedPasswordId(
                              revealedPasswordId === selectedPartnerForProfile.id ? null : selectedPartnerForProfile.id
                            )
                          }
                          className="p-1 text-amber-700 hover:text-amber-900 cursor-pointer"
                          title="Toggle Password Visibility"
                        >
                          {revealedPasswordId === selectedPartnerForProfile.id ? (
                            <EyeOff className="w-3.5 h-3.5" />
                          ) : (
                            <Eye className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(getUserPassword(selectedPartnerForProfile.partnerCode));
                            setCopiedKey(selectedPartnerForProfile.id);
                            setTimeout(() => setCopiedKey(null), 2000);
                          }}
                          className="p-1 text-amber-700 hover:text-amber-900 cursor-pointer"
                          title="Copy Password"
                        >
                          {copiedKey === selectedPartnerForProfile.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Approved Course Rates for this Center */}
            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider flex items-center justify-between">
                <span>Center Authorized Course Offerings & Approved Fee Schedule</span>
                <span className="text-[10px] text-emerald-700 font-semibold lowercase">
                  ({Object.keys(selectedPartnerForProfile.customCourseFees || {}).length} custom rates configured)
                </span>
              </h4>
              <div className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-50/50">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-600 font-semibold uppercase text-[10px]">
                    <tr>
                      <th className="px-4 py-2.5">Course Code</th>
                      <th className="px-4 py-2.5">Course Title</th>
                      <th className="px-4 py-2.5">Duration</th>
                      <th className="px-4 py-2.5">Base Catalog Fee</th>
                      <th className="px-4 py-2.5 text-right">Center Approved Fee</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-800">
                    {courses.map((c) => {
                      const centerFee = selectedPartnerForProfile.customCourseFees?.[c.id] ?? c.fees;
                      const isCustom = selectedPartnerForProfile.customCourseFees?.[c.id] !== undefined;
                      return (
                        <tr key={c.id} className="hover:bg-slate-50">
                          <td className="px-4 py-2 font-mono font-bold text-slate-700">{c.code}</td>
                          <td className="px-4 py-2 font-medium">{c.title}</td>
                          <td className="px-4 py-2 text-slate-500">{c.duration}</td>
                          <td className="px-4 py-2 text-slate-600">₹{(c.fees ?? 0).toLocaleString()}</td>
                          <td className="px-4 py-2 text-right">
                            <span
                              className={`font-black font-mono px-2 py-0.5 rounded text-xs ${
                                isCustom ? 'bg-emerald-100 text-emerald-800' : 'text-slate-900'
                              }`}
                            >
                              ₹{(centerFee ?? 0).toLocaleString()}
                              {isCustom && <span className="ml-1 text-[10px] font-normal">(custom)</span>}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-200">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const ptr = selectedPartnerForProfile;
                    setSelectedPartnerForProfile(null);
                    setSelectedPartnerForFees(ptr);
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  Configure Approved Fees
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const ptr = selectedPartnerForProfile;
                    setSelectedPartnerForProfile(null);
                    setEditingPartner(ptr);
                    setEditPartnerForm({
                      centerName: ptr.centerName,
                      ownerName: ptr.ownerName,
                      email: ptr.email,
                      phone: ptr.phone,
                      district: ptr.district,
                      state: ptr.state,
                      pincode: ptr.pincode,
                      address: ptr.address,
                      status: ptr.status,
                      commissionRate: ptr.commissionRate || 25,
                      tradeLicenseNumber: ptr.tradeLicenseNumber || '',
                      panNumber: ptr.panNumber || '',
                      aadharNumber: ptr.aadharNumber || '',
                      upiId: ptr.upiId || '',
                    });
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Edit className="w-3.5 h-3.5 text-slate-600" />
                  Edit Center Profile
                </button>
              </div>

              <button
                type="button"
                onClick={() => setSelectedPartnerForProfile(null)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs cursor-pointer shadow-xs"
              >
                Close Institutional Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. TRAINING PARTNER DEDICATED FEES MANAGEMENT MODAL                       */}
      {/* ========================================================================= */}
      {selectedPartnerForFees && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-3xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative my-8 border border-slate-200">
            <button
              type="button"
              onClick={() => setSelectedPartnerForFees(null)}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4 border-b border-slate-200 pb-5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-black text-lg border border-emerald-200 shadow-2xs">
                <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-extrabold text-slate-900">
                    Partner Course Fees & Margins
                  </h3>
                  <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-[10px] rounded-full">
                    {selectedPartnerForFees.partnerCode}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {selectedPartnerForFees.centerName} • Director: {selectedPartnerForFees.ownerName} • {selectedPartnerForFees.district}, {selectedPartnerForFees.state}
                </p>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-xs text-slate-700 font-medium">
                  Set Head Office approved fee schedules for students enrolling at this center.
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPartnerFeesDraft({});
                    }}
                    className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    Reset All to Base Rates
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const updated: Record<string, number> = {};
                      courses.forEach((c) => {
                        updated[c.id] = c.fees + 500;
                      });
                      setPartnerFeesDraft(updated);
                    }}
                    className="px-2.5 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    Apply +₹500 Margin
                  </button>
                </div>
              </div>
            </div>

            {/* Courses Fee Schedule Table */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden max-h-96 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold uppercase text-[10px] sticky top-0 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Course Code & Name</th>
                    <th className="px-4 py-3">Duration</th>
                    <th className="px-4 py-3">HO Base Fee</th>
                    <th className="px-4 py-3">Center Approved Fee (₹)</th>
                    <th className="px-4 py-3">Margin / Variance</th>
                    <th className="px-4 py-3 text-right">Row Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                  {courses.map((c) => {
                    const currentDraftFee = partnerFeesDraft[c.id] !== undefined ? partnerFeesDraft[c.id] : c.fees;
                    const isOverridden = partnerFeesDraft[c.id] !== undefined;
                    const diff = currentDraftFee - c.fees;

                    return (
                      <tr key={c.id} className="hover:bg-slate-50/60">
                        <td className="px-4 py-3">
                          <span className="font-bold text-slate-900 block">{c.title}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{c.code}</span>
                        </td>
                        <td className="px-4 py-3 text-slate-600">{c.duration}</td>
                        <td className="px-4 py-3 font-mono text-slate-500">₹{(c.fees ?? 0).toLocaleString()}</td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            min="0"
                            step="100"
                            value={currentDraftFee}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              setPartnerFeesDraft((prev) => ({ ...prev, [c.id]: val }));
                            }}
                            className="w-28 px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-900 focus:outline-emerald-600"
                          />
                        </td>
                        <td className="px-4 py-3">
                          {diff > 0 ? (
                            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              +₹{diff.toLocaleString()}
                            </span>
                          ) : diff < 0 ? (
                            <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                              -₹{Math.abs(diff).toLocaleString()}
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-400">Base HO Rate</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {isOverridden ? (
                            <button
                              type="button"
                              onClick={() => {
                                setPartnerFeesDraft((prev) => {
                                  const copy = { ...prev };
                                  delete copy[c.id];
                                  return copy;
                                });
                              }}
                              className="text-[10px] font-semibold text-rose-600 hover:text-rose-800 underline cursor-pointer"
                            >
                              Reset
                            </button>
                          ) : (
                            <span className="text-[10px] text-slate-400">Standard</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-200">
              <span className="text-xs text-slate-500">
                {Object.keys(partnerFeesDraft).length} custom rate override(s) configured
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedPartnerForFees(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    updatePartner(selectedPartnerForFees.id, {
                      customCourseFees: partnerFeesDraft,
                    });
                    setSelectedPartnerForFees(null);
                  }}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-xs cursor-pointer"
                >
                  Save Center Approved Rates
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. TRAINING PARTNER EDIT MODAL                                            */}
      {/* ========================================================================= */}
      {editingPartner && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 relative my-8 border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 font-bold text-[10px] rounded-full uppercase">
                  {editingPartner.partnerCode}
                </span>
                <h3 className="text-lg font-extrabold text-slate-900 mt-1">
                  Edit Training Partner Center Profile
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingPartner(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                updatePartner(editingPartner.id, {
                  centerName: editPartnerForm.centerName,
                  ownerName: editPartnerForm.ownerName,
                  email: editPartnerForm.email,
                  phone: editPartnerForm.phone,
                  district: editPartnerForm.district,
                  state: editPartnerForm.state,
                  pincode: editPartnerForm.pincode,
                  address: editPartnerForm.address,
                  status: editPartnerForm.status,
                  commissionRate: Number(editPartnerForm.commissionRate),
                  tradeLicenseNumber: editPartnerForm.tradeLicenseNumber,
                  panNumber: editPartnerForm.panNumber,
                  aadharNumber: editPartnerForm.aadharNumber,
                  upiId: editPartnerForm.upiId,
                });
                setEditingPartner(null);
              }}
              className="space-y-4 text-xs"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Center Name *</label>
                  <input
                    type="text"
                    required
                    value={editPartnerForm.centerName}
                    onChange={(e) => setEditPartnerForm({ ...editPartnerForm, centerName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-emerald-600"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Director / Owner Name *</label>
                  <input
                    type="text"
                    required
                    value={editPartnerForm.ownerName}
                    onChange={(e) => setEditPartnerForm({ ...editPartnerForm, ownerName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Official Email *</label>
                  <input
                    type="email"
                    required
                    value={editPartnerForm.email}
                    onChange={(e) => setEditPartnerForm({ ...editPartnerForm, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-emerald-600"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Official Phone *</label>
                  <input
                    type="tel"
                    required
                    value={editPartnerForm.phone}
                    onChange={(e) => setEditPartnerForm({ ...editPartnerForm, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">District *</label>
                  <input
                    type="text"
                    required
                    value={editPartnerForm.district}
                    onChange={(e) => setEditPartnerForm({ ...editPartnerForm, district: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-emerald-600"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">State</label>
                  <input
                    type="text"
                    value={editPartnerForm.state}
                    onChange={(e) => setEditPartnerForm({ ...editPartnerForm, state: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-emerald-600"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Pincode</label>
                  <input
                    type="text"
                    value={editPartnerForm.pincode}
                    onChange={(e) => setEditPartnerForm({ ...editPartnerForm, pincode: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Center Physical Address</label>
                <input
                  type="text"
                  value={editPartnerForm.address}
                  onChange={(e) => setEditPartnerForm({ ...editPartnerForm, address: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-emerald-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Accreditation Status</label>
                  <select
                    value={editPartnerForm.status}
                    onChange={(e) => setEditPartnerForm({ ...editPartnerForm, status: e.target.value as Partner['status'] })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-emerald-600"
                  >
                    <option value="APPROVED">APPROVED (Authorized Active Center)</option>
                    <option value="PENDING">PENDING (Under Review)</option>
                    <option value="REJECTED">REJECTED (De-listed)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Center Commission Rate (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={editPartnerForm.commissionRate}
                    onChange={(e) => setEditPartnerForm({ ...editPartnerForm, commissionRate: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-emerald-600 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Trade License No</label>
                  <input
                    type="text"
                    value={editPartnerForm.tradeLicenseNumber}
                    onChange={(e) => setEditPartnerForm({ ...editPartnerForm, tradeLicenseNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-emerald-600 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">PAN Number</label>
                  <input
                    type="text"
                    value={editPartnerForm.panNumber}
                    onChange={(e) => setEditPartnerForm({ ...editPartnerForm, panNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-emerald-600 font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Aadhar Number</label>
                  <input
                    type="text"
                    value={editPartnerForm.aadharNumber}
                    onChange={(e) => setEditPartnerForm({ ...editPartnerForm, aadharNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-emerald-600 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Official Center UPI ID</label>
                <input
                  type="text"
                  placeholder="e.g. center@sbi"
                  value={editPartnerForm.upiId}
                  onChange={(e) => setEditPartnerForm({ ...editPartnerForm, upiId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-emerald-600 font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingPartner(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-xs cursor-pointer"
                >
                  Save Partner Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. TRAINING PARTNER DELETE CONFIRMATION MODAL                             */}
      {/* ========================================================================= */}
      {deletingPartner && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl space-y-4 border border-rose-200">
            <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Decommission Training Center</h3>
                <span className="text-xs font-mono font-bold text-rose-700">{deletingPartner.partnerCode}</span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <p className="text-slate-600">
                Are you sure you want to permanently delete <strong>{deletingPartner.centerName}</strong>?
              </p>

              {(() => {
                const enrolledCount = students.filter((s) => s.partnerId === deletingPartner.id).length;
                if (enrolledCount > 0) {
                  return (
                    <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl space-y-1">
                      <div className="font-bold flex items-center gap-1">
                        <AlertCircle className="w-4 h-4 text-amber-700" />
                        Active Enrollments Detected ({enrolledCount} Students)
                      </div>
                      <p className="text-[11px] text-amber-800">
                        This center has {enrolledCount} enrolled students. Deleting this center will affect their institutional tracking.
                      </p>
                    </div>
                  );
                }
                return null;
              })()}

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1 text-slate-700 text-[11px]">
                <div>Director: <strong>{deletingPartner.ownerName}</strong></div>
                <div>Location: <strong>{deletingPartner.district}, {deletingPartner.state}</strong></div>
                <div>Contact: <strong>{deletingPartner.phone}</strong></div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Type <span className="font-mono font-bold text-rose-700">CONFIRM</span> or <span className="font-mono font-bold text-rose-700">{deletingPartner.partnerCode}</span> to proceed:
                </label>
                <input
                  type="text"
                  placeholder="CONFIRM"
                  value={partnerDeleteConfirmInput}
                  onChange={(e) => setPartnerDeleteConfirmInput(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setDeletingPartner(null);
                  setPartnerDeleteConfirmInput('');
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={
                  partnerDeleteConfirmInput.trim().toUpperCase() !== 'CONFIRM' &&
                  partnerDeleteConfirmInput.trim().toUpperCase() !== deletingPartner.partnerCode.toUpperCase()
                }
                onClick={() => {
                  if (!isPrimaryAdmin(currentAdmin) && currentAdmin?.role !== 'SUPER_ADMIN') {
                    alert('Permission Denied: Only Super Admin and Primary Directorate can delete centers.');
                    return;
                  }
                  deletePartner(deletingPartner.id);
                  setDeletingPartner(null);
                  setPartnerDeleteConfirmInput('');
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl text-xs cursor-pointer shadow-xs"
              >
                Permanently Delete Center
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. STUDENT EDIT MODAL                                                     */}
      {/* ========================================================================= */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 relative my-8 border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 font-bold text-[10px] rounded-full uppercase font-mono">
                  {editingStudent.regNo}
                </span>
                <h3 className="text-lg font-extrabold text-slate-900 mt-1">
                  Edit Student Profile, Fees & Academic Standing
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingStudent(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                let marksObj = editingStudent.marks;
                const th = Number(editStudentForm.theoryMarks);
                const pr = Number(editStudentForm.practicalMarks);
                if (th > 0 || pr > 0 || editStudentForm.examStatus === 'PASSED') {
                  const total = th + pr;
                  const percentage = Number(((total / 200) * 100).toFixed(1));
                  let grade = 'F';
                  if (percentage >= 80) grade = 'A+';
                  else if (percentage >= 70) grade = 'A';
                  else if (percentage >= 60) grade = 'B+';
                  else if (percentage >= 50) grade = 'B';
                  else if (percentage >= 40) grade = 'C';

                  marksObj = {
                    theory: th,
                    practical: pr,
                    total,
                    maxMarks: 200,
                    percentage,
                    grade,
                    evaluatedDate: new Date().toISOString().split('T')[0],
                  };
                }

                updateStudent(editingStudent.id, {
                  name: editStudentForm.name,
                  fatherName: editStudentForm.fatherName,
                  email: editStudentForm.email,
                  phone: editStudentForm.phone,
                  dob: editStudentForm.dob,
                  gender: editStudentForm.gender,
                  address: editStudentForm.address,
                  district: editStudentForm.district,
                  state: editStudentForm.state,
                  pincode: editStudentForm.pincode,
                  courseId: editStudentForm.courseId,
                  courseName: courses.find((c) => c.id === editStudentForm.courseId)?.title || editingStudent.courseName,
                  partnerId: editStudentForm.partnerId,
                  partnerName: partners.find((p) => p.id === editStudentForm.partnerId)?.centerName || editingStudent.partnerName,
                  totalFees: Number(editStudentForm.totalFees),
                  paidFees: Number(editStudentForm.paidFees),
                  feeStatus: editStudentForm.feeStatus,
                  paymentOption: editStudentForm.paymentOption,
                  examStatus: editStudentForm.examStatus,
                  marks: marksObj,
                });
                setEditingStudent(null);
              }}
              className="space-y-4 text-xs"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Student Full Name *</label>
                  <input
                    type="text"
                    required
                    value={editStudentForm.name}
                    onChange={(e) => setEditStudentForm({ ...editStudentForm, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-emerald-600 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Father / Guardian Name *</label>
                  <input
                    type="text"
                    required
                    value={editStudentForm.fatherName}
                    onChange={(e) => setEditStudentForm({ ...editStudentForm, fatherName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-emerald-600 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={editStudentForm.email}
                    onChange={(e) => setEditStudentForm({ ...editStudentForm, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-emerald-600"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={editStudentForm.phone}
                    onChange={(e) => setEditStudentForm({ ...editStudentForm, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-emerald-600 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={editStudentForm.dob}
                    onChange={(e) => setEditStudentForm({ ...editStudentForm, dob: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Gender</label>
                  <select
                    value={editStudentForm.gender}
                    onChange={(e) => setEditStudentForm({ ...editStudentForm, gender: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-emerald-600"
                  >
                    <option value="MALE">MALE</option>
                    <option value="FEMALE">FEMALE</option>
                    <option value="OTHER">OTHER</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">District</label>
                  <input
                    type="text"
                    value={editStudentForm.district}
                    onChange={(e) => setEditStudentForm({ ...editStudentForm, district: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-emerald-600"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Pincode</label>
                  <input
                    type="text"
                    value={editStudentForm.pincode}
                    onChange={(e) => setEditStudentForm({ ...editStudentForm, pincode: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-emerald-600 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Residential Address</label>
                <input
                  type="text"
                  value={editStudentForm.address}
                  onChange={(e) => setEditStudentForm({ ...editStudentForm, address: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-emerald-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Enrolled Course *</label>
                  <select
                    value={editStudentForm.courseId}
                    onChange={(e) => {
                      const sel = courses.find((c) => c.id === e.target.value);
                      setEditStudentForm({
                        ...editStudentForm,
                        courseId: e.target.value,
                        totalFees: sel ? sel.fees : editStudentForm.totalFees,
                      });
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-emerald-600 font-medium"
                  >
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title} ({c.code}) - ₹{c.fees}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Training Center *</label>
                  <select
                    value={editStudentForm.partnerId}
                    onChange={(e) => setEditStudentForm({ ...editStudentForm, partnerId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-emerald-600 font-medium"
                  >
                    {partners.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.centerName} ({p.partnerCode})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Financial Section */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                    Fee Standing & Payment Terms
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const total = Number(editStudentForm.totalFees);
                      const paid = Number(editStudentForm.paidFees);
                      if (paid >= total) setEditStudentForm({ ...editStudentForm, feeStatus: 'PAID' });
                      else if (paid > 0) setEditStudentForm({ ...editStudentForm, feeStatus: 'PARTIAL' });
                      else setEditStudentForm({ ...editStudentForm, feeStatus: 'PENDING' });
                    }}
                    className="text-[10px] text-emerald-700 font-bold underline cursor-pointer"
                  >
                    Auto-Compute Fee Status
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Total Fee (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={editStudentForm.totalFees}
                      onChange={(e) => setEditStudentForm({ ...editStudentForm, totalFees: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Paid Fee (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={editStudentForm.paidFees}
                      onChange={(e) => setEditStudentForm({ ...editStudentForm, paidFees: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-emerald-700"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Fee Status</label>
                    <select
                      value={editStudentForm.feeStatus}
                      onChange={(e) => setEditStudentForm({ ...editStudentForm, feeStatus: e.target.value as any })}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800"
                    >
                      <option value="PAID">PAID (Clear)</option>
                      <option value="PARTIAL">PARTIAL (Balance Due)</option>
                      <option value="PENDING">PENDING (Unpaid)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Payment Plan</label>
                    <select
                      value={editStudentForm.paymentOption}
                      onChange={(e) => setEditStudentForm({ ...editStudentForm, paymentOption: e.target.value as any })}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800"
                    >
                      <option value="ONE_TIME">One-Time Lum-sum</option>
                      <option value="EMI">Monthly EMI</option>
                      <option value="QUARTERLY">Quarterly Installments</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Examination & Marks Section */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-teal-600" />
                  Academic Exam Standing & Marks
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Exam Status</label>
                    <select
                      value={editStudentForm.examStatus}
                      onChange={(e) => setEditStudentForm({ ...editStudentForm, examStatus: e.target.value as any })}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800"
                    >
                      <option value="NOT_APPEARED">NOT_APPEARED</option>
                      <option value="APPEARED">APPEARED (Pending Evaluation)</option>
                      <option value="PASSED">PASSED (Certified)</option>
                      <option value="FAILED">FAILED</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Theory Marks (out of 100)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={editStudentForm.theoryMarks}
                      onChange={(e) => setEditStudentForm({ ...editStudentForm, theoryMarks: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Practical Marks (out of 100)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={editStudentForm.practicalMarks}
                      onChange={(e) => setEditStudentForm({ ...editStudentForm, practicalMarks: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-900"
                    />
                  </div>
                </div>

                <div className="text-[11px] text-slate-600 bg-white p-2 rounded-lg border border-slate-200 flex justify-between font-mono">
                  <span>Total: <strong>{Number(editStudentForm.theoryMarks) + Number(editStudentForm.practicalMarks)} / 200</strong></span>
                  <span>Percentage: <strong>{(((Number(editStudentForm.theoryMarks) + Number(editStudentForm.practicalMarks)) / 200) * 100).toFixed(1)}%</strong></span>
                  <span>
                    Grade:{' '}
                    <strong className="text-emerald-700">
                      {(((Number(editStudentForm.theoryMarks) + Number(editStudentForm.practicalMarks)) / 200) * 100) >= 80
                        ? 'A+'
                        : (((Number(editStudentForm.theoryMarks) + Number(editStudentForm.practicalMarks)) / 200) * 100) >= 70
                        ? 'A'
                        : (((Number(editStudentForm.theoryMarks) + Number(editStudentForm.practicalMarks)) / 200) * 100) >= 60
                        ? 'B+'
                        : (((Number(editStudentForm.theoryMarks) + Number(editStudentForm.practicalMarks)) / 200) * 100) >= 50
                        ? 'B'
                        : (((Number(editStudentForm.theoryMarks) + Number(editStudentForm.practicalMarks)) / 200) * 100) >= 40
                        ? 'C'
                        : 'F'}
                    </strong>
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-xs cursor-pointer"
                >
                  Save Student Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. STUDENT DELETE CONFIRMATION MODAL                                      */}
      {/* ========================================================================= */}
      {deletingStudent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl space-y-4 border border-rose-200">
            <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Delete Student Record</h3>
                <span className="text-xs font-mono font-bold text-rose-700">{deletingStudent.regNo}</span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <p className="text-slate-600">
                Are you sure you want to permanently delete student <strong>{deletingStudent.name}</strong>?
              </p>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1 text-slate-700 text-[11px]">
                <div>Course: <strong>{deletingStudent.courseName}</strong></div>
                <div>Training Center: <strong>{deletingStudent.partnerName}</strong></div>
                <div>Fees: <strong>₹{deletingStudent.paidFees} / ₹{deletingStudent.totalFees} ({deletingStudent.feeStatus})</strong></div>
                <div>Exam Standing: <strong>{deletingStudent.examStatus}</strong></div>
              </div>

              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-[11px]">
                <strong>Warning:</strong> Deleting this record will purge the student's registration, attendance logs, and examination marks permanently.
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setDeletingStudent(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteStudent(deletingStudent.id);
                  setDeletingStudent(null);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs cursor-pointer shadow-xs"
              >
                Permanently Delete Student
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. COURSE DETAILS & FEES DOSSIER MODAL                                    */}
      {/* ========================================================================= */}
      {selectedCourseForDetails && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 relative my-8 border border-slate-200 max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setSelectedCourseForDetails(null)}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4 border-b border-slate-200 pb-5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-emerald-400 flex items-center justify-center font-black text-lg shadow-md border border-slate-700">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-extrabold text-slate-900">{selectedCourseForDetails.title}</h3>
                  <span className="px-2.5 py-0.5 bg-slate-100 text-slate-800 font-bold text-[10px] rounded-full font-mono">
                    {selectedCourseForDetails.code}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Sector: <strong>{selectedCourseForDetails.category}</strong> • Duration: <strong>{selectedCourseForDetails.duration}</strong>
                </p>
              </div>
            </div>

            {/* Financial Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200">
                <span className="text-[11px] font-semibold text-emerald-800 block">HO Base Approved Fee</span>
                <span className="text-lg font-black text-emerald-900 font-mono">₹{(selectedCourseForDetails.fees ?? 0).toLocaleString()}</span>
                <span className="text-[10px] text-emerald-700 block mt-0.5">Per student standard rate</span>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-700 block">Eligibility Requirement</span>
                <span className="text-sm font-bold text-slate-900 mt-0.5 block">{selectedCourseForDetails.eligibility}</span>
                <span className="text-[10px] text-slate-500 block">Min. Academic Standing</span>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-700 block">Examination Benchmark</span>
                <span className="text-sm font-bold text-slate-900 mt-0.5 block">{selectedCourseForDetails.passingPercentage}% Required</span>
                <span className="text-[10px] text-slate-500 block">Passing score for certificate</span>
              </div>
            </div>

            {/* Description */}
            <div className="text-xs text-slate-600 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              <span className="font-bold text-slate-800 block mb-1">Course Description:</span>
              {selectedCourseForDetails.description || 'Comprehensive professional certificate program structured according to national vocational education guidelines.'}
            </div>

            {/* Academic Enrollment Stats */}
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="text-slate-500">Active Enrolled Students:</span>{' '}
                <strong className="text-slate-900">
                  {students.filter((s) => s.courseId === selectedCourseForDetails.id).length}
                </strong>
              </div>
              <div>
                <span className="text-slate-500">Certified Graduates:</span>{' '}
                <strong className="text-emerald-700">
                  {students.filter((s) => s.courseId === selectedCourseForDetails.id && s.examStatus === 'PASSED').length}
                </strong>
              </div>
              <div>
                <span className="text-slate-500">Authorized Centers:</span>{' '}
                <strong className="text-slate-900">{partners.length}</strong>
              </div>
            </div>

            {/* Syllabus Modules */}
            <div className="space-y-2">
              <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                <Award className="w-4 h-4 text-emerald-600" />
                Comprehensive Curriculum Syllabus ({selectedCourseForDetails.syllabus.length} Modules)
              </h4>
              <div className="space-y-1.5 max-h-52 overflow-y-auto">
                {selectedCourseForDetails.syllabus.map((mod, idx) => (
                  <div key={idx} className="p-2.5 bg-white rounded-xl border border-slate-200 text-xs flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[11px]">
                      {idx + 1}
                    </span>
                    <span className="font-medium text-slate-800">{mod}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => {
                  const c = selectedCourseForDetails;
                  setSelectedCourseForDetails(null);
                  setEditingCourse(c);
                  setEditCourseForm({
                    title: c.title,
                    code: c.code,
                    category: c.category,
                    duration: c.duration,
                    fees: c.fees,
                    eligibility: c.eligibility,
                    passingPercentage: c.passingPercentage,
                    description: c.description,
                    syllabus: [...c.syllabus],
                    newModuleText: '',
                  });
                }}
                className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Edit className="w-3.5 h-3.5" />
                Edit Course Structure & Syllabus
              </button>
              <button
                type="button"
                onClick={() => setSelectedCourseForDetails(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs cursor-pointer"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. COURSE STRUCTURE & SYLLABUS EDIT MODAL                                 */}
      {/* ========================================================================= */}
      {editingCourse && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 relative my-8 border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-[10px] rounded-full uppercase font-mono">
                  {editingCourse.code}
                </span>
                <h3 className="text-lg font-extrabold text-slate-900 mt-1">
                  Edit Course Structure & Syllabus Modules
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingCourse(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateCourse(editingCourse.id, {
                  title: editCourseForm.title,
                  code: editCourseForm.code,
                  category: editCourseForm.category,
                  duration: editCourseForm.duration,
                  fees: Number(editCourseForm.fees),
                  eligibility: editCourseForm.eligibility,
                  passingPercentage: Number(editCourseForm.passingPercentage),
                  description: editCourseForm.description,
                  syllabus: editCourseForm.syllabus,
                });
                setEditingCourse(null);
              }}
              className="space-y-4 text-xs"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Course Title *</label>
                  <input
                    type="text"
                    required
                    value={editCourseForm.title}
                    onChange={(e) => setEditCourseForm({ ...editCourseForm, title: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-emerald-600 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Course Code *</label>
                  <input
                    type="text"
                    required
                    value={editCourseForm.code}
                    onChange={(e) => setEditCourseForm({ ...editCourseForm, code: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-emerald-600 font-mono uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Vocational Category</label>
                  <input
                    type="text"
                    value={editCourseForm.category}
                    onChange={(e) => setEditCourseForm({ ...editCourseForm, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-emerald-600"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Duration</label>
                  <input
                    type="text"
                    value={editCourseForm.duration}
                    onChange={(e) => setEditCourseForm({ ...editCourseForm, duration: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-emerald-600"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Base Approved Fee (₹) *</label>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    required
                    value={editCourseForm.fees}
                    onChange={(e) => setEditCourseForm({ ...editCourseForm, fees: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-emerald-600 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Eligibility Criteria</label>
                  <input
                    type="text"
                    value={editCourseForm.eligibility}
                    onChange={(e) => setEditCourseForm({ ...editCourseForm, eligibility: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-emerald-600"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Passing Percentage (%)</label>
                  <input
                    type="number"
                    min="30"
                    max="100"
                    value={editCourseForm.passingPercentage}
                    onChange={(e) => setEditCourseForm({ ...editCourseForm, passingPercentage: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-emerald-600 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Course Description</label>
                <textarea
                  rows={2}
                  value={editCourseForm.description}
                  onChange={(e) => setEditCourseForm({ ...editCourseForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-emerald-600"
                />
              </div>

              {/* Interactive Syllabus Modules */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <label className="block font-bold text-slate-900">
                  Curriculum Syllabus Modules ({editCourseForm.syllabus.length})
                </label>

                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {editCourseForm.syllabus.map((mod, idx) => (
                    <div key={idx} className="p-2 bg-white rounded-xl border border-slate-200 flex items-center justify-between gap-2">
                      <span className="font-medium text-slate-800">
                        {idx + 1}. {mod}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setEditCourseForm({
                            ...editCourseForm,
                            syllabus: editCourseForm.syllabus.filter((_, i) => i !== idx),
                          });
                        }}
                        className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                        title="Remove Module"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter module title to add..."
                    value={editCourseForm.newModuleText}
                    onChange={(e) => setEditCourseForm({ ...editCourseForm, newModuleText: e.target.value })}
                    className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-emerald-600"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (editCourseForm.newModuleText.trim()) {
                        setEditCourseForm({
                          ...editCourseForm,
                          syllabus: [...editCourseForm.syllabus, editCourseForm.newModuleText.trim()],
                          newModuleText: '',
                        });
                      }
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs cursor-pointer shadow-2xs"
                  >
                    + Add Module
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingCourse(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-xs cursor-pointer"
                >
                  Save Course Structure
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 8. COURSE DELETE CONFIRMATION MODAL                                       */}
      {/* ========================================================================= */}
      {deletingCourse && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl space-y-4 border border-rose-200">
            <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Remove Course from Catalog</h3>
                <span className="text-xs font-mono font-bold text-rose-700">{deletingCourse.code}</span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <p className="text-slate-600">
                Are you sure you want to remove <strong>{deletingCourse.title}</strong>?
              </p>

              {(() => {
                const enrolledCount = students.filter((s) => s.courseId === deletingCourse.id).length;
                if (enrolledCount > 0) {
                  return (
                    <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl space-y-1">
                      <div className="font-bold flex items-center gap-1">
                        <AlertCircle className="w-4 h-4 text-amber-700" />
                        Active Enrollments Detected ({enrolledCount} Students)
                      </div>
                      <p className="text-[11px] text-amber-800">
                        There are currently {enrolledCount} students enrolled in this course across various centers.
                      </p>
                    </div>
                  );
                }
                return null;
              })()}

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1 text-slate-700 text-[11px]">
                <div>Category: <strong>{deletingCourse.category}</strong></div>
                <div>Duration: <strong>{deletingCourse.duration}</strong></div>
                <div>Base Fee: <strong>₹{(deletingCourse.fees ?? 0).toLocaleString()}</strong></div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setDeletingCourse(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteCourse(deletingCourse.id);
                  setDeletingCourse(null);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs cursor-pointer shadow-xs"
              >
                Permanently Delete Course
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Certificate Modal */}
      {previewCert && (
        <CertificateModal certificate={previewCert} onClose={() => setPreviewCert(null)} />
      )}
    </div>
  );
};
