import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Partner, Student, Certificate, Batch, CourseMaterial, CenterMISUser } from '../../types';
import { CertificateModal } from '../common/CertificateModal';
import { OfficialUpiQrCard } from '../common/OfficialUpiQrCard';
import { BatchMonitoringModule } from '../common/BatchMonitoringModule';
import { StudentFeesRecordModule } from '../common/StudentFeesRecordModule';
import { CenterMISManagementModule } from '../common/CenterMISManagementModule';
import { OfflinePaymentsModule } from '../common/OfflinePaymentsModule';
import { DownloadSectionModule } from '../common/DownloadSectionModule';
import {
  Briefcase,
  Users,
  UserPlus,
  Upload,
  BookOpen,
  Award,
  CreditCard,
  Layers,
  FileText,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Download,
  Printer,
  KeyRound,
  LogOut,
  MapPin,
  Clock,
  Send,
  DollarSign,
  TrendingUp,
  PlusCircle,
  X,
  ChevronRight,
  Check,
  Edit,
  Trash2,
  AlertTriangle,
  Search,
  Eye,
  EyeOff,
  Copy,
  ShieldCheck,
  Filter,
} from 'lucide-react';

export const PartnerPortal: React.FC = () => {
  const {
    currentPartner,
    loginPartner,
    registerPartner,
    logout,
    students,
    courses,
    batches,
    createBatch,
    registerStudent,
    updateStudent,
    deleteStudent,
    bulkUploadStudents,
    submitExamMarks,
    materials,
    uploadCourseMaterial,
    certificates,
    processPayment,
    changePassword,
    resetPasswordDirectly,
    foundationInfo,
    feeUpgradeRequests,
    sendFeeUpgradeRequest,
    isPublishedMode,
    centerMISUsers,
    createCenterMISAccount,
    toggleCenterMISStatus,
    getUserPassword,
    offlinePayments,
    downloadFiles,
  } = useApp();

  // Mode: 'LOGIN' | 'REGISTER' | 'FORGOT_PASS'
  const [authMode, setAuthMode] = useState<'LOGIN' | 'REGISTER' | 'FORGOT_PASS'>(
    currentPartner ? 'LOGIN' : 'LOGIN'
  );

  // Active Operations Tab
  const [activeTab, setActiveTab] = useState<
    | 'students'
    | 'batches-monitoring'
    | 'fees-record'
    | 'center-mis'
    | 'offline-payments'
    | 'downloads'
    | 'bulk-upload'
    | 'batches'
    | 'marks-certificate'
    | 'fees-upload'
    | 'materials'
    | 'profile'
  >('students');

  // Student Edit / Delete state for Partner Portal
  const [editingPartnerStudent, setEditingPartnerStudent] = useState<Student | null>(null);
  const [editPartnerStudentForm, setEditPartnerStudentForm] = useState({
    name: '',
    email: '',
    phone: '',
    dob: '',
    gender: 'MALE' as 'MALE' | 'FEMALE' | 'OTHER',
    fatherName: '',
    address: '',
    district: '',
    state: 'West Bengal',
    pincode: '',
  });
  const [deletingPartnerStudent, setDeletingPartnerStudent] = useState<Student | null>(null);
  const [partnerStudentSearch, setPartnerStudentSearch] = useState('');
  const [partnerStudentFeeFilter, setPartnerStudentFeeFilter] = useState<'ALL' | 'PAID' | 'PARTIAL' | 'PENDING'>('ALL');
  const [partnerStudentCourseFilter, setPartnerStudentCourseFilter] = useState<string>('ALL');

  // Center MIS Creation & Management State
  const [showCreateMISModal, setShowCreateMISModal] = useState(false);
  const [misForm, setMisForm] = useState({
    name: '',
    email: '',
    phone: '',
    designation: 'Center Academic MIS Coordinator',
    password: isPublishedMode ? '' : 'cmis@123',
  });
  const [misSuccessInfo, setMisSuccessInfo] = useState<{ misCode: string; name: string; email: string; pass: string } | null>(null);
  const [revealedMISPassId, setRevealedMISPassId] = useState<string | null>(null);
  const [copiedMISId, setCopiedMISId] = useState<string | null>(null);
  const [misSearchFilter, setMisSearchFilter] = useState('');

  // Auth form states (empty in published mode)
  const [loginCodeOrEmail, setLoginCodeOrEmail] = useState(isPublishedMode ? '' : 'apex.skills@jsss.in');
  const [loginPass, setLoginPass] = useState(isPublishedMode ? '' : 'partner@123');
  const [loginError, setLoginError] = useState('');

  // Partner Registration state
  const [partnerRegData, setPartnerRegData] = useState({
    centerName: '',
    ownerName: '',
    email: '',
    phone: '',
    password: isPublishedMode ? '' : 'partner@123',
    address: '',
    district: 'Kolkata',
    state: 'West Bengal',
    pincode: '700034',
    tradeLicenseNumber: '',
    panNumber: '',
    aadharNumber: '',
    docName: 'Trade_License_2026.pdf',
  });
  const [regSuccessPartner, setRegSuccessPartner] = useState<Partner | null>(null);

  // Single Student Registration Form by Partner
  const [singleStudentData, setSingleStudentData] = useState({
    name: '',
    fatherName: '',
    email: '',
    phone: '',
    dob: '2004-05-12',
    gender: 'MALE' as 'MALE' | 'FEMALE' | 'OTHER',
    address: '',
    courseId: courses[0]?.id || 'CRS-01',
    batchId: '',
    paidFees: 0,
  });
  const [singleRegSuccess, setSingleRegSuccess] = useState<Student | null>(null);

  // Bulk CSV Upload state
  const [csvContent, setCsvContent] = useState('');
  const [bulkResult, setBulkResult] = useState<{ success: number; errors: string[] } | null>(null);

  // Batch Creation Form state
  const [newBatchData, setNewBatchData] = useState({
    courseId: courses[0]?.id || 'CRS-01',
    batchName: '',
    batchCode: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '2026-10-30',
    timing: '10:00 AM - 12:00 PM (Daily)',
    instructorName: '',
    maxStudents: 30,
  });
  const [batchCreatedSuccess, setBatchCreatedSuccess] = useState<string | null>(null);

  // Exam Marks Entry & Automated Certificate Generator state
  const [marksForm, setMarksForm] = useState({
    studentId: '',
    theoryMarks: 45,
    practicalMarks: 45,
    maxMarks: 100,
    completionDate: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
  });
  const [marksSubmittedCert, setMarksSubmittedCert] = useState<Certificate | null>(null);

  // Course Material Upload state
  const [newMatForm, setNewMatForm] = useState({
    courseId: courses[0]?.id || 'CRS-01',
    title: '',
    description: '',
    fileType: 'PDF' as 'PDF' | 'VIDEO' | 'DOC' | 'ZIP' | 'LINK',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    fileSize: '3.5 MB',
  });
  const [matSuccess, setMatSuccess] = useState(false);

  // Selected Certificate to view in modal
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);

  // Forgot password state
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [forgotNewPass, setForgotNewPass] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);

  // Filter students belonging to this partner
  const partnerStudents = currentPartner
    ? students.filter((s) => s.partnerId === currentPartner.id || s.partnerName === currentPartner.centerName)
    : [];

  const partnerBatches = currentPartner
    ? batches.filter((b) => b.partnerId === currentPartner.id)
    : [];

  const partnerCertificates = currentPartner
    ? certificates.filter((c) => c.partnerId === currentPartner.id || c.partnerName === currentPartner.centerName)
    : [];

  // Filter fee upgrade requests for this partner
  const partnerFeeRequests = currentPartner
    ? feeUpgradeRequests.filter((r) => r.partnerId === currentPartner.id)
    : [];
  const pendingFeeRequestsCount = partnerFeeRequests.filter((r) => r.status === 'PENDING').length;

  // Fee Upgrade Request Modal state
  const [showFeeUpgradeModal, setShowFeeUpgradeModal] = useState(false);
  const [feeRequestMsg, setFeeRequestMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [feeRequestForm, setFeeRequestForm] = useState<{
    scope: 'FULL_CENTER' | 'SINGLE_STUDENT';
    courseId: string;
    studentId: string;
    proposedFees: number;
    reason: string;
  }>({
    scope: 'FULL_CENTER',
    courseId: courses[0]?.id || 'CRS-01',
    studentId: '',
    proposedFees: 4500,
    reason: '',
  });

  const handleOpenFeeUpgradeModal = (
    scope: 'FULL_CENTER' | 'SINGLE_STUDENT' = 'FULL_CENTER',
    presetCourseId?: string,
    presetStudentId?: string
  ) => {
    setFeeRequestMsg(null);
    const targetCourseId = presetCourseId || courses[0]?.id || 'CRS-01';
    const targetStudentId = presetStudentId || (partnerStudents[0]?.id || '');
    
    let defaultProposed = 4500;
    if (scope === 'SINGLE_STUDENT' && targetStudentId) {
      const st = partnerStudents.find((s) => s.id === targetStudentId);
      if (st) {
        defaultProposed = st.totalFees;
      }
    } else {
      defaultProposed = currentPartner?.customCourseFees?.[targetCourseId] ?? courses.find((c) => c.id === targetCourseId)?.fees ?? 4500;
    }

    setFeeRequestForm({
      scope,
      courseId: targetCourseId,
      studentId: targetStudentId,
      proposedFees: defaultProposed,
      reason: '',
    });
    setShowFeeUpgradeModal(true);
  };

  const handleFeeUpgradeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPartner) return;
    if (Number(feeRequestForm.proposedFees) <= 0) {
      setFeeRequestMsg({ type: 'error', text: 'Please enter a valid course fee greater than 0.' });
      return;
    }
    if (!feeRequestForm.reason.trim()) {
      setFeeRequestMsg({ type: 'error', text: 'Please state a clear justification/reason for the upgrade.' });
      return;
    }

    const targetCourse = courses.find((c) => c.id === feeRequestForm.courseId);
    const targetStudent = feeRequestForm.scope === 'SINGLE_STUDENT' ? partnerStudents.find((s) => s.id === feeRequestForm.studentId) : null;
    const currentFee = feeRequestForm.scope === 'SINGLE_STUDENT' ? (targetStudent?.totalFees || 0) : (currentPartner.customCourseFees?.[feeRequestForm.courseId] ?? targetCourse?.fees ?? 0);

    const res = sendFeeUpgradeRequest({
      partnerId: currentPartner.id,
      partnerName: currentPartner.centerName,
      partnerCode: currentPartner.partnerCode,
      scope: feeRequestForm.scope,
      courseId: feeRequestForm.courseId,
      courseName: targetCourse?.title || '',
      courseCode: targetCourse?.code || '',
      studentId: feeRequestForm.scope === 'SINGLE_STUDENT' ? feeRequestForm.studentId : undefined,
      studentName: targetStudent?.name,
      studentRegNo: targetStudent?.regNo,
      currentFee,
      requestedFee: Number(feeRequestForm.proposedFees),
      reason: feeRequestForm.reason.trim(),
    });

    if (res && res.requestNo) {
      setFeeRequestMsg({
        type: 'success',
        text: `Fee upgrade request successfully submitted to Head Office Admin (Ref: ${res.requestNo})!`,
      });
      setTimeout(() => {
        setShowFeeUpgradeModal(false);
        setFeeRequestMsg(null);
      }, 2000);
    } else {
      setFeeRequestMsg({ type: 'error', text: 'Failed to submit fee upgrade request. Please try again.' });
    }
  };

  // Handle Login
  const handlePartnerLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    const ok = loginPartner(loginCodeOrEmail, loginPass);
    if (!ok) {
      setLoginError(
        isPublishedMode
          ? 'Invalid Partner Code/Email or Password. Please check your center credentials.'
          : 'Invalid Partner Code/Email or Password. (Demo: apex.skills@jsss.in / partner@123)'
      );
    }
  };

  // Handle Partner Registration
  const handlePartnerRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const created = registerPartner({
      ...partnerRegData,
      documents: [
        {
          name: partnerRegData.docName || 'Trade_License_Document.pdf',
          type: 'Trade License & Center KYC',
          fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
          uploadDate: new Date().toISOString().split('T')[0],
        },
      ],
    });
    setRegSuccessPartner(created);
  };

  // Handle Single Student Registration
  const handleSingleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPartner) return;
    const student = registerStudent({
      ...singleStudentData,
      partnerId: currentPartner.id,
      partnerName: currentPartner.centerName,
      district: currentPartner.district,
      state: currentPartner.state,
      pincode: currentPartner.pincode,
    });
    setSingleRegSuccess(student);
    setSingleStudentData({
      name: '',
      fatherName: '',
      email: '',
      phone: '',
      dob: '2004-05-12',
      gender: 'MALE',
      address: '',
      courseId: courses[0]?.id || 'CRS-01',
      batchId: '',
      paidFees: 0,
    });
  };

  // Handle Bulk CSV
  const handleBulkUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPartner) return;
    const res = bulkUploadStudents(csvContent, currentPartner.id);
    setBulkResult(res);
  };

  const handleDownloadSampleCsv = () => {
    const sample = `Name,Email,Phone,Course,FatherName,Address\nSouvik Das,souvik.das@example.com,9830114477,Digital Marketing,Nirmal Das,Behala Kolkata\nTanmoy Ghosh,tanmoy.ghosh@example.com,9830225588,DCA,Shibdas Ghosh,Diamond Harbour\nRiya Sen,riya.sen@example.com,9830336699,Tally Prime,Subodh Sen,Kakdwip`;
    const blob = new Blob([sample], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'JSSS_Bulk_Student_Upload_Template.csv';
    a.click();
  };

  // Handle Create Batch
  const handleCreateBatchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPartner) return;
    const selectedCourse = courses.find((c) => c.id === newBatchData.courseId) || courses[0];
    const created = createBatch({
      partnerId: currentPartner.id,
      courseId: selectedCourse.id,
      courseName: selectedCourse.title,
      batchName: newBatchData.batchName || `${selectedCourse.code}-Batch-${Date.now().toString().slice(-4)}`,
      batchCode: newBatchData.batchCode || `BTC-${Date.now().toString().slice(-4)}`,
      startDate: newBatchData.startDate,
      endDate: newBatchData.endDate,
      timing: newBatchData.timing,
      instructorName: newBatchData.instructorName || currentPartner.ownerName,
      maxStudents: newBatchData.maxStudents,
    });
    setBatchCreatedSuccess(`Batch "${created.batchName}" created successfully!`);
    setTimeout(() => setBatchCreatedSuccess(null), 4000);
  };

  // Handle Marks Entry & Automated Certificate Generation
  const handleMarksSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!marksForm.studentId) return;

    const res = submitExamMarks(
      marksForm.studentId,
      Number(marksForm.theoryMarks),
      Number(marksForm.practicalMarks),
      Number(marksForm.maxMarks),
      marksForm.completionDate
    );

    if (res.certificate) {
      setMarksSubmittedCert(res.certificate);
      setSelectedCert(res.certificate);
    } else {
      alert('Marks recorded. Passing criteria not reached for certificate.');
    }
  };

  // Handle Material Upload
  const handleMaterialUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPartner) return;
    uploadCourseMaterial({
      ...newMatForm,
      partnerId: currentPartner.id,
      uploadedByName: currentPartner.centerName,
    });
    setMatSuccess(true);
    setTimeout(() => setMatSuccess(false), 3000);
    setNewMatForm({ ...newMatForm, title: '', description: '' });
  };

  // If partner not logged in, render Auth screen
  if (!currentPartner) {
    return (
      <div className="min-h-[80vh] bg-slate-50 py-10 px-4 sm:px-6 flex items-center justify-center">
        <div className="w-full max-w-xl bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
          {/* Header Tabs */}
          <div className="flex border-b border-slate-200 bg-slate-50">
            <button
              onClick={() => {
                setAuthMode('LOGIN');
                setLoginError('');
              }}
              className={`flex-1 py-4 text-xs sm:text-sm font-bold text-center transition-colors ${
                authMode === 'LOGIN'
                  ? 'bg-white text-emerald-800 border-b-2 border-emerald-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              1. Training Partner Login
            </button>
            <button
              onClick={() => {
                setAuthMode('REGISTER');
                setLoginError('');
              }}
              className={`flex-1 py-4 text-xs sm:text-sm font-bold text-center transition-colors ${
                authMode === 'REGISTER'
                  ? 'bg-white text-emerald-800 border-b-2 border-emerald-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              2. New Partner Registration
            </button>
          </div>

          <div className="p-6 sm:p-8">
            {/* LOGIN FORM */}
            {authMode === 'LOGIN' && (
              <form onSubmit={handlePartnerLogin} className="space-y-4">
                <div className="text-center space-y-1 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-slate-900 text-emerald-400 mx-auto flex items-center justify-center">
                    <Briefcase className="w-6 h-6" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">Partner Center Operations Portal</h2>
                  <p className="text-xs text-slate-500">
                    Manage students, create batches, upload study materials & issue automated certificates
                  </p>
                </div>

                {loginError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{loginError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Partner Code / Center Email / Phone
                  </label>
                  <input
                    type="text"
                    required
                    value={loginCodeOrEmail}
                    onChange={(e) => setLoginCodeOrEmail(e.target.value)}
                    placeholder="e.g. JSSS-CTR-101 or apex.skills@jsss.in"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700">Password</label>
                    <button
                      type="button"
                      onClick={() => setAuthMode('FORGOT_PASS')}
                      className="text-[11px] text-emerald-700 hover:underline font-medium"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <input
                    type="password"
                    required
                    value={loginPass}
                    onChange={(e) => setLoginPass(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Briefcase className="w-4 h-4 text-emerald-400" />
                  Sign In to Partner Center
                </button>

                {/* Demo Credentials or Production Badge */}
                {!isPublishedMode ? (
                  <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
                    <span className="font-bold text-slate-800 block text-[11px] uppercase">
                      Demo Approved Partner Centers:
                    </span>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setLoginCodeOrEmail('apex.skills@jsss.in');
                          setLoginPass('partner@123');
                        }}
                        className="px-2 py-1 bg-white border border-slate-300 rounded-lg hover:bg-emerald-50 text-[11px] font-mono text-emerald-800"
                      >
                        Apex Computer Academy (JSSS-CTR-101)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setLoginCodeOrEmail('sunderban.skills@jsss.in');
                          setLoginPass('partner@123');
                        }}
                        className="px-2 py-1 bg-white border border-slate-300 rounded-lg hover:bg-emerald-50 text-[11px] font-mono text-emerald-800"
                      >
                        Sunderban Center (JSSS-CTR-102)
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-[11px] text-slate-600 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Published Application Mode: Production security active. Enter your authorized Center Code/Email & Password.</span>
                  </div>
                )}
              </form>
            )}

            {/* PARTNER REGISTRATION FORM */}
            {authMode === 'REGISTER' && (
              <div>
                {regSuccessPartner ? (
                  <div className="text-center space-y-3 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
                    <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto" />
                    <h3 className="text-lg font-bold text-slate-900">Partner Application Submitted!</h3>
                    <p className="text-xs text-slate-600">
                      Your generated Partner Center Code is{' '}
                      <span className="font-mono font-bold text-emerald-800">{regSuccessPartner.partnerCode}</span>.
                      Your center registration and KYC documents are under review by Super Admin Soumen Ghosh. Once approved, you can log in.
                    </p>
                    <button
                      onClick={() => {
                        setAuthMode('LOGIN');
                        setRegSuccessPartner(null);
                      }}
                      className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl mt-2"
                    >
                      Go to Partner Login
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handlePartnerRegisterSubmit} className="space-y-3">
                    <div className="text-center space-y-1 mb-4">
                      <h3 className="text-lg font-bold text-slate-900">Franchise Training Partner Registration</h3>
                      <p className="text-xs text-slate-500">
                        Join JSSS Foundation network to run certified vocational courses & issue Govt.-recognized certificates
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Training Center / Institute Name *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Royal Computer Academy"
                          value={partnerRegData.centerName}
                          onChange={(e) => setPartnerRegData({ ...partnerRegData, centerName: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Director / Owner Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Suman Roy"
                          value={partnerRegData.ownerName}
                          onChange={(e) => setPartnerRegData({ ...partnerRegData, ownerName: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Official Center Email *
                        </label>
                        <input
                          type="email"
                          required
                          placeholder="center@example.com"
                          value={partnerRegData.email}
                          onChange={(e) => setPartnerRegData({ ...partnerRegData, email: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Mobile / Contact Number *
                        </label>
                        <input
                          type="tel"
                          required
                          placeholder="+91 98XXXXXXXX"
                          value={partnerRegData.phone}
                          onChange={(e) => setPartnerRegData({ ...partnerRegData, phone: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Trade License / MSME Reg No *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="TL/KMC/2026/XXXX"
                          value={partnerRegData.tradeLicenseNumber}
                          onChange={(e) => setPartnerRegData({ ...partnerRegData, tradeLicenseNumber: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Owner PAN Card Number *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="ABCDE1234F"
                          value={partnerRegData.panNumber}
                          onChange={(e) => setPartnerRegData({ ...partnerRegData, panNumber: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono uppercase"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Center Infrastructure Address *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Plot No, Street, Landmark, District, Pincode"
                        value={partnerRegData.address}
                        onChange={(e) => setPartnerRegData({ ...partnerRegData, address: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                      />
                    </div>

                    {/* Document Upload Simulator */}
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                      <label className="block text-[11px] font-bold text-slate-700">
                        Upload KYC Document (Trade License / Center Photos)
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="file"
                          accept=".pdf,.jpg,.png"
                          onChange={(e) => {
                            if (e.target.files?.[0]) {
                              setPartnerRegData({ ...partnerRegData, docName: e.target.files[0].name });
                            }
                          }}
                          className="text-xs file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-600 file:text-white hover:file:bg-emerald-700 cursor-pointer"
                        />
                        <span className="text-[11px] text-slate-500 font-mono">
                          {partnerRegData.docName || 'Trade_License_2026.pdf'}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Create Portal Password *
                      </label>
                      <input
                        type="password"
                        required
                        value={partnerRegData.password}
                        onChange={(e) => setPartnerRegData({ ...partnerRegData, password: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition-all cursor-pointer"
                    >
                      Submit Franchise Partner Application
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* FORGOT PASSWORD */}
            {authMode === 'FORGOT_PASS' && (
              <div className="space-y-4">
                <div className="text-center space-y-1 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 mx-auto flex items-center justify-center">
                    <KeyRound className="w-6 h-6" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">Reset Partner Center Password</h2>
                  <p className="text-xs text-slate-500">
                    Enter your Partner Code or Registered Center Email to update credentials
                  </p>
                </div>

                {forgotSuccess ? (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-center space-y-2">
                    <CheckCircle className="w-8 h-8 mx-auto text-emerald-600" />
                    <p className="text-xs font-bold">Partner password updated!</p>
                    <button
                      onClick={() => setAuthMode('LOGIN')}
                      className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg mt-2"
                    >
                      Sign In to Partner Portal
                    </button>
                  </div>
                ) : (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const ok = resetPasswordDirectly('PARTNER', forgotIdentifier, forgotNewPass);
                      if (ok) {
                        setForgotSuccess(true);
                      } else {
                        alert('No partner center found matching this Code or Email.');
                      }
                    }}
                    className="space-y-3"
                  >
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Partner Code or Center Email
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. JSSS-CTR-101"
                        value={forgotIdentifier}
                        onChange={(e) => setForgotIdentifier(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        New Password
                      </label>
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={forgotNewPass}
                        onChange={(e) => setForgotNewPass(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                      />
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        type="submit"
                        className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs"
                      >
                        Reset Password
                      </button>
                      <button
                        type="button"
                        onClick={() => setAuthMode('LOGIN')}
                        className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // LOGGED IN PARTNER OPERATIONS CONSOLE
  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Partner Center Header */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-600 to-slate-900 text-white flex items-center justify-center font-black text-xl shadow-md">
              {currentPartner.partnerCode.slice(-3)}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900">{currentPartner.centerName}</h1>
                <span className="px-2.5 py-0.5 bg-slate-900 text-white text-xs font-mono font-bold rounded-full">
                  {currentPartner.partnerCode}
                </span>
                <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-full">
                  ✓ Verified Center
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium mt-1">
                Owner / Director: <strong className="text-slate-900">{currentPartner.ownerName}</strong> • {currentPartner.district}, {currentPartner.state}
              </p>
              <p className="text-xs text-slate-500 font-mono">
                Trade License: {currentPartner.tradeLicenseNumber} • Total Students: {partnerStudents.length}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setActiveTab('marks-certificate')}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5"
            >
              <Award className="w-4 h-4" />
              Generate Certificate
            </button>
            <button
              onClick={logout}
              className="px-3.5 py-2 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-700 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </div>

        {/* Operation Tabs */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar border-b border-slate-200 pb-2">
          {[
            { id: 'students', label: '1. Enrolled Students', icon: <Users className="w-4 h-4" /> },
            { id: 'batches-monitoring', label: '2. Batch Monitoring', icon: <Layers className="w-4 h-4" />, highlight: true },
            { id: 'fees-record', label: '3. Student Fees Record', icon: <CreditCard className="w-4 h-4" />, highlight: true },
            { id: 'center-mis', label: '4. Center MIS ID Management', icon: <ShieldCheck className="w-4 h-4" />, highlight: true },
            { id: 'offline-payments', label: '5. Offline Payments & QR Remittance', icon: <CreditCard className="w-4 h-4 text-emerald-600" />, highlight: true },
            { id: 'downloads', label: `6. Directorate Downloads (${downloadFiles.length})`, icon: <Download className="w-4 h-4 text-cyan-600" /> },
            { id: 'bulk-upload', label: '7. Bulk CSV Upload', icon: <Upload className="w-4 h-4" /> },
            { id: 'batches', label: '8. Create Training Batch', icon: <Layers className="w-4 h-4" /> },
            { id: 'marks-certificate', label: '9. Exam Marks & Auto Certificate', icon: <Award className="w-4 h-4" /> },
            { id: 'materials', label: '10. Upload Course Material', icon: <BookOpen className="w-4 h-4" /> },
            { id: 'fees-upload', label: '11. Head Office QR & Remittance', icon: <CreditCard className="w-4 h-4" /> },
            {
              id: 'profile',
              label: '12. Center Profile & Approved Fees',
              icon: <Briefcase className="w-4 h-4" />,
              badge: pendingFeeRequestsCount > 0 ? `${pendingFeeRequestsCount} Pending` : undefined,
            },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                } ${tab.highlight && !isActive ? 'border-emerald-300 text-emerald-900 bg-emerald-50/50' : ''}`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="px-1.5 py-0.5 bg-amber-500 text-white text-[9px] font-bold rounded-full">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* TAB 1: ENROLLED STUDENTS & SINGLE REGISTER */}
        {activeTab === 'students' && (
          <div className="space-y-6">
            {/* Single Student Registration Card */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-emerald-600" />
                Register New Student under {currentPartner.centerName}
              </h3>

              {singleRegSuccess && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div>
                      <strong>Student Registered!</strong> Assigned Unique Reg No:{' '}
                      <span className="font-mono font-bold text-emerald-900">{singleRegSuccess.regNo}</span> ({singleRegSuccess.name})
                    </div>
                  </div>
                  <button onClick={() => setSingleRegSuccess(null)} className="text-slate-400 hover:text-slate-700">✕</button>
                </div>
              )}

              <form onSubmit={handleSingleStudentSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Student Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rakesh Sen"
                    value={singleStudentData.name}
                    onChange={(e) => setSingleStudentData({ ...singleStudentData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Father's Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dilip Sen"
                    value={singleStudentData.fatherName}
                    onChange={(e) => setSingleStudentData({ ...singleStudentData, fatherName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="student@example.com"
                    value={singleStudentData.email}
                    onChange={(e) => setSingleStudentData({ ...singleStudentData, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98XXXXXXXX"
                    value={singleStudentData.phone}
                    onChange={(e) => setSingleStudentData({ ...singleStudentData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Select Course *</label>
                  <select
                    value={singleStudentData.courseId}
                    onChange={(e) => setSingleStudentData({ ...singleStudentData, courseId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  >
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title} (₹{c.fees})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Residential Address *</label>
                  <input
                    type="text"
                    required
                    placeholder="Village / Street / Town"
                    value={singleStudentData.address}
                    onChange={(e) => setSingleStudentData({ ...singleStudentData, address: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                <div className="sm:col-span-3 flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                  >
                    Register Student & Generate ID
                  </button>
                </div>
              </form>
            </div>

            {/* Students List Table with Search, Filters, and Actions */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 bg-slate-50 border-b border-slate-200 space-y-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <Users className="w-4 h-4 text-emerald-600" />
                      Enrolled Students at {currentPartner.centerName} ({partnerStudents.length})
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      View, search, edit, or manage enrolled student profiles and certifications
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('bulk-upload')}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-2xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Bulk CSV Upload
                  </button>
                </div>

                {/* Filter & Search Bar */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 pt-1">
                  <div className="sm:col-span-6 relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="Search student by name, registration no, phone, or email..."
                      value={partnerStudentSearch}
                      onChange={(e) => setPartnerStudentSearch(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <select
                      value={partnerStudentCourseFilter}
                      onChange={(e) => setPartnerStudentCourseFilter(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    >
                      <option value="ALL">All Courses ({courses.length})</option>
                      {courses.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.code} - {c.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-3">
                    <select
                      value={partnerStudentFeeFilter}
                      onChange={(e) => setPartnerStudentFeeFilter(e.target.value as any)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    >
                      <option value="ALL">All Fee Statuses</option>
                      <option value="PAID">Paid in Full</option>
                      <option value="PARTIAL">Partially Paid</option>
                      <option value="PENDING">Payment Pending</option>
                    </select>
                  </div>
                </div>
              </div>

              {(() => {
                const filteredPartnerStudents = partnerStudents.filter((s) => {
                  const matchSearch =
                    !partnerStudentSearch.trim() ||
                    s.name.toLowerCase().includes(partnerStudentSearch.toLowerCase()) ||
                    s.regNo.toLowerCase().includes(partnerStudentSearch.toLowerCase()) ||
                    s.phone.includes(partnerStudentSearch) ||
                    s.email.toLowerCase().includes(partnerStudentSearch.toLowerCase());
                  const matchCourse =
                    partnerStudentCourseFilter === 'ALL' || s.courseId === partnerStudentCourseFilter;
                  const matchFee =
                    partnerStudentFeeFilter === 'ALL' || s.feeStatus === partnerStudentFeeFilter;
                  return matchSearch && matchCourse && matchFee;
                });

                if (partnerStudents.length === 0) {
                  return (
                    <div className="p-8 text-center text-slate-500 text-xs">
                      No students enrolled under this center yet. Use the form above or Bulk CSV Upload to add students.
                    </div>
                  );
                }

                if (filteredPartnerStudents.length === 0) {
                  return (
                    <div className="p-8 text-center text-slate-500 text-xs space-y-2">
                      <p className="font-semibold text-slate-700">No students match the current search or filters.</p>
                      <button
                        type="button"
                        onClick={() => {
                          setPartnerStudentSearch('');
                          setPartnerStudentCourseFilter('ALL');
                          setPartnerStudentFeeFilter('ALL');
                        }}
                        className="text-xs text-emerald-700 font-bold hover:underline"
                      >
                        Reset All Filters
                      </button>
                    </div>
                  );
                }

                return (
                  <div className="divide-y divide-slate-100 overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-600 font-semibold uppercase text-[10px]">
                        <tr>
                          <th className="px-5 py-3">Registration No</th>
                          <th className="px-5 py-3">Student Name</th>
                          <th className="px-5 py-3">Course</th>
                          <th className="px-5 py-3">Contact</th>
                          <th className="px-5 py-3">Fees</th>
                          <th className="px-5 py-3">Exam Status</th>
                          <th className="px-5 py-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                        {filteredPartnerStudents.map((s) => (
                          <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                            <td className="px-5 py-3.5 font-mono font-bold text-emerald-800">{s.regNo}</td>
                            <td className="px-5 py-3.5">
                              <span className="font-bold text-slate-900 block">{s.name}</span>
                              <span className="text-[10px] text-slate-500">
                                {s.gender || 'M'} • {s.district || 'West Bengal'}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-slate-700">{s.courseName}</td>
                            <td className="px-5 py-3.5">
                              <span className="text-slate-700 font-mono text-[11px] block">{s.phone}</span>
                              <span className="text-slate-400 text-[10px] truncate max-w-[140px] block">{s.email}</span>
                            </td>
                            <td className="px-5 py-3.5">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  s.feeStatus === 'PAID'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : s.feeStatus === 'PARTIAL'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                ₹{s.paidFees} / ₹{s.totalFees} ({s.feeStatus})
                              </span>
                            </td>
                            <td className="px-5 py-3.5">
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
                            <td className="px-5 py-3.5 text-right">
                              <div className="inline-flex items-center justify-end gap-1.5 flex-wrap">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setMarksForm({ ...marksForm, studentId: s.id });
                                    setActiveTab('marks-certificate');
                                  }}
                                  className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                                  title="Enter Examination Marks & Auto Certificate"
                                >
                                  <Award className="w-3 h-3 text-emerald-600" />
                                  Marks
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingPartnerStudent(s);
                                    setEditPartnerStudentForm({
                                      name: s.name,
                                      email: s.email,
                                      phone: s.phone,
                                      dob: s.dob || '2004-01-01',
                                      gender: s.gender || 'MALE',
                                      fatherName: s.fatherName || '',
                                      address: s.address || '',
                                      district: s.district || '',
                                      state: s.state || 'West Bengal',
                                      pincode: s.pincode || '',
                                    });
                                  }}
                                  className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-lg text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                                  title="Edit Student Information"
                                >
                                  <Edit className="w-3 h-3 text-blue-600" />
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setDeletingPartnerStudent(s)}
                                  className="p-1.5 text-rose-600 hover:bg-rose-50 hover:text-rose-800 rounded-lg border border-transparent hover:border-rose-200 cursor-pointer transition-colors inline-flex items-center"
                                  title="Delete Student Record"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* TAB 2: BATCH MONITORING MODULE */}
        {activeTab === 'batches-monitoring' && (
          <BatchMonitoringModule userRole="PARTNER" />
        )}

        {/* TAB 3: STUDENT FEES RECORD MODULE */}
        {activeTab === 'fees-record' && (
          <StudentFeesRecordModule userRole="PARTNER" />
        )}

        {/* TAB 4: CENTER MIS ID MANAGEMENT MODULE */}
        {activeTab === 'center-mis' && (
          <CenterMISManagementModule userRole="PARTNER" />
        )}

        {/* TAB 5: OFFLINE PAYMENTS & QR REMITTANCE MODULE */}
        {activeTab === 'offline-payments' && (
          <OfflinePaymentsModule userRole="PARTNER" />
        )}

        {/* TAB 6: INSTITUTIONAL DOWNLOADS SECTION */}
        {activeTab === 'downloads' && (
          <DownloadSectionModule />
        )}

        {/* TAB 7: BULK CSV UPLOAD */}
        {activeTab === 'bulk-upload' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Upload className="w-5 h-5 text-emerald-600" />
                  Bulk Student CSV Upload Tool
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Upload an Excel / CSV spreadsheet to register hundreds of students simultaneously in seconds
                </p>
              </div>

              <button
                onClick={handleDownloadSampleCsv}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download Sample CSV Template
              </button>
            </div>

            {bulkResult && (
              <div
                className={`p-4 rounded-2xl border text-xs ${
                  bulkResult.success > 0
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-sm">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                  <span>Successfully processed and registered {bulkResult.success} students!</span>
                </div>
                {bulkResult.errors.length > 0 && (
                  <div className="mt-2 text-rose-700">
                    <strong>Errors encountered:</strong>
                    <ul className="list-disc list-inside">
                      {bulkResult.errors.map((err, idx) => (
                        <li key={idx}>{err}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            <form onSubmit={handleBulkUpload} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Paste CSV Data or Choose File (Format: Name, Email, Phone, Course, FatherName, Address)
                </label>
                <div className="mb-2 flex items-center gap-2">
                  <input
                    type="file"
                    accept=".csv,.txt"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          setCsvContent(event.target?.result as string);
                        };
                        reader.readAsText(file);
                      }
                    }}
                    className="text-xs file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-900 file:text-white hover:file:bg-slate-800"
                  />
                  <span className="text-xs text-slate-400">or paste directly below:</span>
                </div>

                <textarea
                  rows={8}
                  placeholder={`Name,Email,Phone,Course,FatherName,Address\nSouvik Das,souvik.das@example.com,9830114477,Digital Marketing,Nirmal Das,Behala Kolkata\nTanmoy Ghosh,tanmoy.ghosh@example.com,9830225588,DCA,Shibdas Ghosh,Diamond Harbour`}
                  value={csvContent}
                  onChange={(e) => setCsvContent(e.target.value)}
                  className="w-full p-4 bg-slate-50 border border-slate-300 rounded-2xl text-xs font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!csvContent.trim()}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition-all cursor-pointer flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Process Bulk Upload & Generate Unique Reg Numbers
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 3: BATCH MANAGEMENT */}
        {activeTab === 'batches' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-600" />
                Create New Training Batch
              </h3>

              {batchCreatedSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>{batchCreatedSuccess}</span>
                </div>
              )}

              <form onSubmit={handleCreateBatchSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Select Course *</label>
                  <select
                    value={newBatchData.courseId}
                    onChange={(e) => setNewBatchData({ ...newBatchData, courseId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  >
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Batch Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. DM-Morning-2026-Batch"
                    value={newBatchData.batchName}
                    onChange={(e) => setNewBatchData({ ...newBatchData, batchName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Class Timings *</label>
                  <input
                    type="text"
                    required
                    placeholder="10:00 AM - 12:00 PM (Mon-Wed-Fri)"
                    value={newBatchData.timing}
                    onChange={(e) => setNewBatchData({ ...newBatchData, timing: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                <div className="sm:col-span-3 flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold"
                  >
                    Create Training Batch
                  </button>
                </div>
              </form>
            </div>

            {/* Batches List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {partnerBatches.map((b) => (
                <div key={b.id} className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 bg-slate-100 rounded text-slate-700">
                      {b.batchCode}
                    </span>
                    <span className="text-[10px] text-emerald-700 font-bold">Active Batch</span>
                  </div>

                  <h4 className="font-extrabold text-slate-900 text-base">{b.batchName}</h4>
                  <p className="text-xs text-slate-600 font-medium">{b.courseName}</p>

                  <div className="text-xs text-slate-500 space-y-1 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{b.timing}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{b.studentIds.length} Enrolled (Max {b.maxStudents})</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: EXAM MARKS ENTRY & AUTOMATED CERTIFICATE GENERATION */}
        {activeTab === 'marks-certificate' && (
          <div className="space-y-6">
            {/* Marks Submission Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <Award className="w-5 h-5 text-emerald-600" />
                    Automated Certificate Generator & Marks Entry
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Select an enrolled student, enter theory & practical marks. When passed, an official verified certificate will automatically generate and sync with the student's portal immediately!
                  </p>
                </div>
              </div>

              {marksSubmittedCert && (
                <div className="p-4 bg-emerald-50 border-2 border-emerald-400 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                  <div>
                    <span className="text-xs font-bold text-emerald-800 block">
                      🎉 Certificate Successfully Issued!
                    </span>
                    <p className="text-xs text-slate-700 mt-0.5">
                      Certificate ID: <strong className="font-mono text-emerald-900">{marksSubmittedCert.certificateNo}</strong> for {marksSubmittedCert.studentName} (Grade: {marksSubmittedCert.grade})
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedCert(marksSubmittedCert)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shrink-0 flex items-center gap-1.5"
                  >
                    <Award className="w-4 h-4" />
                    Preview / Print Certificate
                  </button>
                </div>
              )}

              <form onSubmit={handleMarksSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Select Student Candidate *
                  </label>
                  <select
                    required
                    value={marksForm.studentId}
                    onChange={(e) => setMarksForm({ ...marksForm, studentId: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900"
                  >
                    <option value="">-- Choose Candidate --</option>
                    {partnerStudents.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.regNo}) - {s.courseName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Theory Marks (out of 50) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    required
                    value={marksForm.theoryMarks}
                    onChange={(e) => setMarksForm({ ...marksForm, theoryMarks: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Practical / Project (out of 50) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    required
                    value={marksForm.practicalMarks}
                    onChange={(e) => setMarksForm({ ...marksForm, practicalMarks: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                  />
                </div>

                <div className="sm:col-span-4 flex items-center justify-between pt-2 border-t border-slate-200">
                  <div className="text-xs text-slate-600">
                    Total: <strong className="text-slate-900">{marksForm.theoryMarks + marksForm.practicalMarks} / 100</strong> (
                    {Math.round(((marksForm.theoryMarks + marksForm.practicalMarks) / 100) * 100)}%)
                    <span className="mx-2 text-slate-300">|</span>
                    Signatories: {foundationInfo.directorName} & {foundationInfo.projectDirectorName}
                  </div>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition-all cursor-pointer flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    Submit Marks & Auto Generate Certificate
                  </button>
                </div>
              </form>
            </div>

            {/* Issued Certificates History Table */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-sm">
                  Issued Certificates by {currentPartner.centerName} ({partnerCertificates.length})
                </h3>
              </div>

              {partnerCertificates.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs">
                  No certificates issued yet. Submit candidate exam marks above to generate certificates.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 font-semibold uppercase text-[10px]">
                      <tr>
                        <th className="px-6 py-3">Certificate ID</th>
                        <th className="px-6 py-3">Candidate Name</th>
                        <th className="px-6 py-3">Course</th>
                        <th className="px-6 py-3">Grade</th>
                        <th className="px-6 py-3">Issue Date</th>
                        <th className="px-6 py-3 text-right">View / Download</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                      {partnerCertificates.map((cert) => (
                        <tr key={cert.id} className="hover:bg-slate-50/60">
                          <td className="px-6 py-4 font-mono font-bold text-emerald-800">{cert.certificateNo}</td>
                          <td className="px-6 py-4 font-bold text-slate-900">{cert.studentName}</td>
                          <td className="px-6 py-4 text-slate-700">{cert.courseName}</td>
                          <td className="px-6 py-4">
                            <span className="px-2.5 py-0.5 bg-amber-100 text-amber-900 font-bold rounded">
                              {cert.grade}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-slate-500">{cert.issueDate}</td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => setSelectedCert(cert)}
                              className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold"
                            >
                              <Printer className="w-3 h-3" />
                              View Certificate
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 5: COURSE MATERIALS */}
        {activeTab === 'materials' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-600" />
                Upload Course Study Material / Notes for Students
              </h3>

              {matSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Material uploaded successfully! Students can now access and download it.</span>
                </div>
              )}

              <form onSubmit={handleMaterialUploadSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Target Course *</label>
                  <select
                    value={newMatForm.courseId}
                    onChange={(e) => setNewMatForm({ ...newMatForm, courseId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  >
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Material Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Chapter 4 - Advanced Formulas & GST Invoicing Guide"
                    value={newMatForm.title}
                    onChange={(e) => setNewMatForm({ ...newMatForm, title: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Description / Summary</label>
                  <input
                    type="text"
                    placeholder="Provide a brief summary of what is covered in this study resource"
                    value={newMatForm.description}
                    onChange={(e) => setNewMatForm({ ...newMatForm, description: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                <div className="sm:col-span-3 flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold"
                  >
                    Upload Resource for Students
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* TAB 11: HEAD OFFICE QR & REMITTANCE */}
        {activeTab === 'fees-upload' && (
          <div className="space-y-8">
            <OfflinePaymentsModule userRole="PARTNER" initialSection="QR_REMITTANCE" />

            {/* Fees Table */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-emerald-600" />
                    Student Fees Status & Offline Payment Records
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Official records of student fee collections, dues, and approved course rate structures
                  </p>
                </div>
                <button
                  onClick={() => handleOpenFeeUpgradeModal('FULL_CENTER')}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <TrendingUp className="w-4 h-4" />
                  Request Fee Upgrade / Revision
                </button>
              </div>

              <div className="divide-y divide-slate-100 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold uppercase text-[10px]">
                  <tr>
                    <th className="px-6 py-3">Student Name</th>
                    <th className="px-6 py-3">Reg No</th>
                    <th className="px-6 py-3">Course</th>
                    <th className="px-6 py-3">Total Approved Fee</th>
                    <th className="px-6 py-3">Paid Amount</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                  {partnerStudents.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/60">
                      <td className="px-6 py-4 font-bold text-slate-900">{s.name}</td>
                      <td className="px-6 py-4 font-mono font-semibold text-emerald-800">{s.regNo}</td>
                      <td className="px-6 py-4 text-slate-700">{s.courseName}</td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-slate-900 block">₹{(s.totalFees ?? 0).toLocaleString()}</span>
                        {s.feeUpgradeNote && (
                          <span className="inline-block mt-0.5 px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-[9px] font-bold">
                            ✓ {s.feeUpgradeNote}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-emerald-800 font-bold">₹{(s.paidFees ?? 0).toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                            s.feeStatus === 'PAID'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {s.feeStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        {s.totalFees - s.paidFees > 0 ? (
                          <button
                            onClick={() => {
                              const amount = prompt(
                                `Enter amount received for ${s.name} (Due: ₹${s.totalFees - s.paidFees}):`,
                                String(s.totalFees - s.paidFees)
                              );
                              if (amount && Number(amount) > 0) {
                                processPayment({
                                  studentId: s.id,
                                  amount: Number(amount),
                                  paymentMethod: 'CASH',
                                  transactionId: `CASH-REC-${Date.now().toString().slice(-6)}`,
                                  notes: `Offline cash collected at ${currentPartner.centerName}`,
                                });
                                alert('Fee payment recorded and official receipt generated!');
                              }
                            }}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold inline-block"
                          >
                            Collect
                          </button>
                        ) : (
                          <span className="text-emerald-700 font-bold text-[11px]">✓ Cleared</span>
                        )}
                        <button
                          onClick={() => handleOpenFeeUpgradeModal('SINGLE_STUDENT', s.courseId, s.id)}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-semibold inline-block border border-slate-200"
                          title="Request Fee Upgrade / Concession for this student"
                        >
                          Revise Fee
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Partner's Fee Upgrade Requests History */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  Course Fee Upgrade Requests Submitted to Head Office
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Track the approval status of full center revisions and individual student concessions
                </p>
              </div>
              <button
                onClick={() => handleOpenFeeUpgradeModal('FULL_CENTER')}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                New Request
              </button>
            </div>

            {partnerFeeRequests.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-xs text-slate-500">
                <p className="font-semibold text-slate-700 mb-1">No fee upgrade requests submitted yet.</p>
                <p>You can request custom course fees for your entire center or individual student concessions.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-semibold uppercase text-[10px]">
                    <tr>
                      <th className="px-4 py-3">Scope</th>
                      <th className="px-4 py-3">Target Details</th>
                      <th className="px-4 py-3">Current Fee</th>
                      <th className="px-4 py-3">Proposed Fee</th>
                      <th className="px-4 py-3">Justification</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Admin Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                    {partnerFeeRequests.map((req) => {
                      const curFee = req.currentFee ?? (req as any).currentFees ?? 0;
                      const reqFee = req.requestedFee ?? (req as any).proposedFees ?? 0;
                      const diff = reqFee - curFee;
                      const courseDisplay = req.courseName || (req as any).courseTitle || 'Course';
                      return (
                        <tr key={req.id} className="hover:bg-slate-50/60">
                          <td className="px-4 py-3.5">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                req.scope === 'FULL_CENTER'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-purple-100 text-purple-800'
                              }`}
                            >
                              {req.scope === 'FULL_CENTER' ? '🏢 Full Center' : '👤 Single Student'}
                            </span>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className="font-bold text-slate-900 block">{courseDisplay}</span>
                            {req.studentName && (
                              <span className="text-[10px] text-slate-500 font-mono block">
                                Student: {req.studentName} ({req.studentRegNo})
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3.5 text-slate-600 font-mono">₹{curFee.toLocaleString()}</td>
                          <td className="px-4 py-3.5">
                            <span className="font-mono font-bold text-slate-900">₹{reqFee.toLocaleString()}</span>
                            <span
                              className={`block text-[10px] font-bold ${
                                diff > 0 ? 'text-emerald-700' : 'text-amber-700'
                              }`}
                            >
                              {diff > 0
                                ? `+₹${diff.toLocaleString()}`
                                : diff < 0
                                ? `-₹${Math.abs(diff).toLocaleString()}`
                                : 'No Change'}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 max-w-xs truncate text-slate-600" title={req.reason}>
                            {req.reason}
                          </td>
                          <td className="px-4 py-3.5">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                req.status === 'APPROVED'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : req.status === 'REJECTED'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-amber-100 text-amber-800 animate-pulse'
                              }`}
                            >
                              {req.status}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-[11px] text-slate-500">
                            {req.adminRemarks || (req.status === 'PENDING' ? 'Awaiting Admin Review' : '—')}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
        )}

        {/* TAB 7: CENTER PROFILE & APPROVED FEES */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            {/* Center Profile Overview Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-6 mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-emerald-400 flex items-center justify-center font-black text-xl border border-slate-700 shadow-md">
                    {currentPartner.centerName.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl sm:text-2xl font-black text-slate-900">{currentPartner.centerName}</h2>
                      <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-[11px] rounded-full">
                        Authorized Training Partner
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-mono mt-1">
                      Center Code: <strong>{currentPartner.partnerCode}</strong> • Registration ID: {currentPartner.id}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleOpenFeeUpgradeModal('FULL_CENTER')}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-xs flex items-center gap-2"
                >
                  <TrendingUp className="w-4 h-4" />
                  Request Course Fee Upgrade
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Center Director / Owner</span>
                  <span className="text-sm font-bold text-slate-900 mt-0.5 block">{currentPartner.ownerName}</span>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Official Contact</span>
                  <span className="text-sm font-bold text-slate-900 mt-0.5 block">{currentPartner.phone}</span>
                  <span className="text-[10px] text-slate-500 font-mono">{currentPartner.email}</span>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Trade License & PAN</span>
                  <span className="text-sm font-mono font-bold text-slate-900 mt-0.5 block">
                    {currentPartner.tradeLicenseNumber || 'TL-2024-WB-9912'}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">{currentPartner.panNumber || 'PAN Registered'}</span>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Location & District</span>
                  <span className="text-sm font-bold text-slate-900 mt-0.5 block">
                    {currentPartner.district}, {currentPartner.state}
                  </span>
                  <span className="text-[10px] text-slate-500">{currentPartner.address} - {currentPartner.pincode}</span>
                </div>
              </div>
            </div>

            {/* Approved Center Course Fee Schedule */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                    Official Center Course Fee Schedule (Head Office Approved Rates)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    These approved fees apply to students enrolled at {currentPartner.centerName}. Any custom upgrades approved by Head Office are reflected here.
                  </p>
                </div>
                <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-bold">
                  {Object.keys(currentPartner.customCourseFees || {}).length} Custom Rates Approved
                </span>
              </div>

              <div className="divide-y divide-slate-100 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-semibold uppercase text-[10px]">
                    <tr>
                      <th className="px-4 py-3">Course Code & Title</th>
                      <th className="px-4 py-3">Duration</th>
                      <th className="px-4 py-3">Head Office Base Fee</th>
                      <th className="px-4 py-3">Center Approved Fee</th>
                      <th className="px-4 py-3">Rate Status</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                    {courses.map((c) => {
                      const hasCustom = currentPartner.customCourseFees && currentPartner.customCourseFees[c.id] !== undefined;
                      const approvedFee = hasCustom ? currentPartner.customCourseFees![c.id] : c.fees;

                      return (
                        <tr key={c.id} className="hover:bg-slate-50/60">
                          <td className="px-4 py-4">
                            <span className="font-bold text-slate-900 block">{c.title}</span>
                            <span className="text-[10px] text-slate-500 font-mono">{c.code} • {c.category}</span>
                          </td>
                          <td className="px-4 py-4 text-slate-600">{c.duration}</td>
                          <td className="px-4 py-4 text-slate-500 font-mono">₹{(c.fees ?? 0).toLocaleString()}</td>
                          <td className="px-4 py-4">
                            <span className="text-sm font-black text-slate-900 font-mono">₹{(approvedFee ?? 0).toLocaleString()}</span>
                            {hasCustom && (
                              <span className="block text-[10px] font-bold text-emerald-700">
                                {approvedFee > c.fees ? `+₹${approvedFee - c.fees}` : `-₹${c.fees - approvedFee}`} vs Base
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-4">
                            {hasCustom ? (
                              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-[10px] font-bold inline-flex items-center gap-1">
                                <Check className="w-3 h-3" />
                                Custom Rate Approved
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-[10px] font-medium">
                                Standard Base Rate
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-4 text-right">
                            <button
                              onClick={() => handleOpenFeeUpgradeModal('FULL_CENTER', c.id)}
                              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1 cursor-pointer"
                            >
                              <TrendingUp className="w-3.5 h-3.5" />
                              Revise Fee
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Fee Upgrade Request Modal */}
      {showFeeUpgradeModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative my-8">
            <button
              onClick={() => {
                setShowFeeUpgradeModal(false);
                setFeeRequestMsg(null);
              }}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Request Course Fee Upgrade</h3>
                <p className="text-xs text-slate-500">Official Head Office Admin Approval Process</p>
              </div>
            </div>

            {feeRequestMsg && (
              <div
                className={`p-4 rounded-xl text-xs font-medium mb-4 flex items-center gap-2 ${
                  feeRequestMsg.type === 'success'
                    ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                    : 'bg-rose-50 text-rose-900 border border-rose-200'
                }`}
              >
                {feeRequestMsg.type === 'success' ? (
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span>{feeRequestMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleFeeUpgradeSubmit} className="space-y-4 text-xs">
              {/* Scope Selection */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  1. Scope of Fee Revision *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const courseId = courses[0]?.id || 'CRS-01';
                      const current = currentPartner.customCourseFees?.[courseId] ?? courses[0]?.fees ?? 4500;
                      setFeeRequestForm({
                        ...feeRequestForm,
                        scope: 'FULL_CENTER',
                        courseId,
                        proposedFees: current,
                      });
                    }}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      feeRequestForm.scope === 'FULL_CENTER'
                        ? 'border-emerald-600 bg-emerald-50/50 text-emerald-950 font-bold ring-2 ring-emerald-500/20'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span className="block text-xs font-bold">🏢 Full Center Rate</span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      Sets course fee for all students at this center
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const firstStudent = partnerStudents[0];
                      setFeeRequestForm({
                        ...feeRequestForm,
                        scope: 'SINGLE_STUDENT',
                        studentId: firstStudent ? firstStudent.id : '',
                        courseId: firstStudent ? firstStudent.courseId : (courses[0]?.id || 'CRS-01'),
                        proposedFees: firstStudent ? firstStudent.totalFees : 4500,
                      });
                    }}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      feeRequestForm.scope === 'SINGLE_STUDENT'
                        ? 'border-emerald-600 bg-emerald-50/50 text-emerald-950 font-bold ring-2 ring-emerald-500/20'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span className="block text-xs font-bold">👤 Single Student</span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      Individual student concession or fee upgrade
                    </span>
                  </button>
                </div>
              </div>

              {/* Course or Student Selection */}
              {feeRequestForm.scope === 'FULL_CENTER' ? (
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Select Target Course *
                  </label>
                  <select
                    value={feeRequestForm.courseId}
                    onChange={(e) => {
                      const cId = e.target.value;
                      const current = currentPartner.customCourseFees?.[cId] ?? courses.find((c) => c.id === cId)?.fees ?? 4500;
                      setFeeRequestForm({
                        ...feeRequestForm,
                        courseId: cId,
                        proposedFees: current,
                      });
                    }}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-medium"
                  >
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title} ({c.code}) — Base: ₹{(c.fees ?? 0).toLocaleString()}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Select Enrolled Student *
                  </label>
                  {partnerStudents.length === 0 ? (
                    <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl">
                      No students enrolled yet under this center.
                    </div>
                  ) : (
                    <select
                      value={feeRequestForm.studentId}
                      onChange={(e) => {
                        const sId = e.target.value;
                        const st = partnerStudents.find((s) => s.id === sId);
                        setFeeRequestForm({
                          ...feeRequestForm,
                          studentId: sId,
                          courseId: st ? st.courseId : feeRequestForm.courseId,
                          proposedFees: st ? st.totalFees : feeRequestForm.proposedFees,
                        });
                      }}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-medium"
                    >
                      {partnerStudents.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.regNo}) — {s.courseName} (Current: ₹{(s.totalFees ?? 0).toLocaleString()})
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}

              {/* Current vs Proposed Fee Comparison */}
              {(() => {
                let currentFeeVal = 0;
                if (feeRequestForm.scope === 'SINGLE_STUDENT') {
                  const st = partnerStudents.find((s) => s.id === feeRequestForm.studentId);
                  currentFeeVal = st ? st.totalFees : 0;
                } else {
                  currentFeeVal = currentPartner.customCourseFees?.[feeRequestForm.courseId] ?? courses.find((c) => c.id === feeRequestForm.courseId)?.fees ?? 0;
                }
                const diff = Number(feeRequestForm.proposedFees) - currentFeeVal;

                return (
                  <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Current Approved Fee</span>
                      <span className="text-base font-black font-mono text-slate-700 mt-0.5 block">
                        ₹{(currentFeeVal ?? 0).toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Proposed Fee Delta</span>
                      <span
                        className={`text-base font-black font-mono mt-0.5 block ${
                          diff > 0 ? 'text-emerald-700' : diff < 0 ? 'text-amber-700' : 'text-slate-700'
                        }`}
                      >
                        {diff > 0 ? `+₹${diff.toLocaleString()}` : diff < 0 ? `-₹${Math.abs(diff).toLocaleString()}` : 'No Change'}
                      </span>
                    </div>
                  </div>
                );
              })()}

              {/* Proposed Fees Input */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Proposed New Course Fee (INR ₹) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-500">₹</span>
                  <input
                    type="number"
                    min="1"
                    step="100"
                    required
                    value={feeRequestForm.proposedFees || ''}
                    onChange={(e) => setFeeRequestForm({ ...feeRequestForm, proposedFees: Number(e.target.value) })}
                    placeholder="e.g. 5500"
                    className="w-full pl-8 pr-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Justification / Reason */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Official Justification / Reason for Head Office *
                </label>
                <textarea
                  required
                  rows={3}
                  value={feeRequestForm.reason}
                  onChange={(e) => setFeeRequestForm({ ...feeRequestForm, reason: e.target.value })}
                  placeholder="Explain why this fee revision is requested (e.g., Special rural vocational scholarship, specialized hardware lab infrastructure, batch concession grant)..."
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setShowFeeUpgradeModal(false);
                    setFeeRequestMsg(null);
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-xs transition-all flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  Submit Request to Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Certificate Modal */}
      {selectedCert && (
        <CertificateModal certificate={selectedCert} onClose={() => setSelectedCert(null)} />
      )}
    </div>
  );
};
