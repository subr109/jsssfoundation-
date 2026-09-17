import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Student, PaymentReceipt, FeePaymentOption, FeePaymentProof } from '../../types';
import { CertificateModal } from '../common/CertificateModal';
import { CertificateCard } from '../common/CertificateCard';
import { PaymentModal } from '../common/PaymentModal';
import { OfficialUpiQrCard } from '../common/OfficialUpiQrCard';
import { StudentAttendanceSection } from './StudentAttendanceSection';
import {
  GraduationCap,
  User,
  CreditCard,
  BookOpen,
  FileCheck2,
  Award,
  MapPin,
  Clock,
  Download,
  Printer,
  CheckCircle,
  KeyRound,
  FileText,
  PlayCircle,
  Sparkles,
  AlertCircle,
  QrCode,
  ShieldCheck,
  ChevronRight,
  LogOut,
  RefreshCw,
  Upload,
  Calendar,
  Check,
  Eye,
  Tag,
  ArrowRight,
  ExternalLink,
  X,
} from 'lucide-react';

export const StudentPortal: React.FC = () => {
  const {
    currentStudent,
    loginStudent,
    registerStudent,
    logout,
    courses,
    partners,
    materials,
    mockExams,
    submitMockExam,
    markLiveAttendance,
    certificates,
    payments,
    changePassword,
    resetPasswordDirectly,
    foundationInfo,
    isPublishedMode,
    choosePaymentOption,
    submitPaymentProof,
  } = useApp();

  // Mode: 'LOGIN' | 'REGISTER' | 'DASHBOARD' | 'FORGOT_PASS'
  const [authMode, setAuthMode] = useState<'LOGIN' | 'REGISTER' | 'FORGOT_PASS'>(
    currentStudent ? 'LOGIN' : 'LOGIN'
  );

  // Active Dashboard Tab: 'profile' | 'fees' | 'materials' | 'attendance' | 'mock-exam' | 'certificate'
  const [activeTab, setActiveTab] = useState<
    'profile' | 'fees' | 'materials' | 'attendance' | 'mock-exam' | 'certificate'
  >('profile');

  // Form states for login (strictly empty in published mode)
  const [loginIdentifier, setLoginIdentifier] = useState(isPublishedMode ? '' : 'ananya.sharma@example.com');
  const [loginPassword, setLoginPassword] = useState(isPublishedMode ? '' : 'student@123');
  const [loginError, setLoginError] = useState('');

  // Form states for student self-registration
  const [regFormData, setRegFormData] = useState({
    name: '',
    email: '',
    phone: '',
    dob: '2004-06-15',
    gender: 'FEMALE' as 'MALE' | 'FEMALE' | 'OTHER',
    fatherName: '',
    address: '',
    district: 'Kolkata',
    state: 'West Bengal',
    pincode: '700034',
    courseId: courses[0]?.id || 'CRS-01',
    partnerId: partners[0]?.id || 'PTR-01',
    password: isPublishedMode ? '' : 'student@123',
  });

  const [registrationSuccessStudent, setRegistrationSuccessStudent] = useState<Student | null>(null);

  // Forgot password state
  const [forgotId, setForgotId] = useState('');
  const [newPassInput, setNewPassInput] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);

  // Modals
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [viewCertificateModal, setViewCertificateModal] = useState(false);

  // Mock Exam Interactive State
  const [activeExamId, setActiveExamId] = useState<string | null>(null);
  const [examAnswers, setExamAnswers] = useState<{ [qId: string]: number }>({});
  const [examResult, setExamResult] = useState<{ score: number; total: number; percentage: number; passed: boolean } | null>(null);

  // Password change state
  const [pwState, setPwState] = useState({ old: '', new: '', confirm: '', success: false, error: '' });

  // Payment Plan Selection & Payment Proof Submission States
  const [selectedPaymentPlan, setSelectedPaymentPlan] = useState<FeePaymentOption>(
    currentStudent?.paymentOption || 'ONE_TIME'
  );
  const [planSavedToast, setPlanSavedToast] = useState<string | null>(null);

  // Sync payment plan with student changes
  React.useEffect(() => {
    if (currentStudent?.paymentOption) {
      setSelectedPaymentPlan(currentStudent.paymentOption);
    }
  }, [currentStudent?.paymentOption]);

  // Payment Proof Form State
  const [proofAmount, setProofAmount] = useState<string>('');
  const [proofDate, setProofDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [proofTxnId, setProofTxnId] = useState<string>('');
  const [proofMethod, setProofMethod] = useState<string>('UPI (Google Pay / PhonePe / Paytm)');
  const [proofNotes, setProofNotes] = useState<string>('');
  const [proofFileName, setProofFileName] = useState<string>('gpay_receipt_screenshot.jpg');
  const [proofScreenshotUrl, setProofScreenshotUrl] = useState<string>(
    'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=800'
  );
  const [proofSuccessMsg, setProofSuccessMsg] = useState<string | null>(null);
  const [proofErrorMsg, setProofErrorMsg] = useState<string | null>(null);
  const [selectedProofModal, setSelectedProofModal] = useState<FeePaymentProof | null>(null);

  // Handle Save Payment Plan
  const handleSavePaymentPlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentStudent) return;
    const ok = choosePaymentOption(currentStudent.id, selectedPaymentPlan);
    if (ok) {
      setPlanSavedToast('Payment plan preference updated and recorded successfully!');
      setTimeout(() => setPlanSavedToast(null), 4000);
    }
  };

  // Handle Payment Proof Submission
  const handleProofSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setProofSuccessMsg(null);
    setProofErrorMsg(null);

    const amt = parseFloat(proofAmount);
    if (isNaN(amt) || amt <= 0) {
      setProofErrorMsg('Please enter a valid payment amount greater than ₹0.');
      return;
    }
    if (!proofTxnId.trim()) {
      setProofErrorMsg('Please enter the Bank UTR / Transaction Reference ID.');
      return;
    }

    const created = submitPaymentProof({
      studentId: currentStudent!.id,
      amount: amt,
      paymentDate: proofDate,
      transactionId: proofTxnId.trim(),
      paymentMethod: proofMethod,
      screenshotUrl: proofScreenshotUrl,
      screenshotFileName: proofFileName,
      notes: proofNotes.trim(),
    });

    setProofSuccessMsg(`Payment proof submitted successfully! Verification Reference: ${created.id}. Center and Admin accounts will audit this record.`);
    setProofAmount('');
    setProofTxnId('');
    setProofNotes('');
    setTimeout(() => setProofSuccessMsg(null), 6000);
  };

  // Handle Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    const success = loginStudent(loginIdentifier, loginPassword);
    if (!success) {
      setLoginError(
        isPublishedMode
          ? 'Invalid Registration Number, Email, or Password. Please verify your credentials or contact your center.'
          : 'Invalid Registration Number, Email, or Password. (Demo: ananya.sharma@example.com / student@123)'
      );
    }
  };

  // Handle Registration
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const createdStudent = registerStudent(regFormData);
    setRegistrationSuccessStudent(createdStudent);
    // Auto-login newly registered student
    loginStudent(createdStudent.regNo, regFormData.password);
  };

  // Handle Mock Exam Submission
  const handleMockExamSubmit = (exam: typeof mockExams[0]) => {
    let score = 0;
    exam.questions.forEach((q) => {
      if (examAnswers[q.id] === q.correctIndex) {
        score += 10;
      }
    });

    const maxTotal = exam.questions.length * 10;
    const percentage = Math.round((score / maxTotal) * 100);
    const passed = score >= exam.passingMarks;

    submitMockExam({
      studentId: currentStudent!.id,
      mockExamId: exam.id,
      courseId: exam.courseId,
      score,
      totalQuestions: exam.questions.length,
      percentage,
      passed,
      answers: examAnswers,
    });

    setExamResult({ score, total: maxTotal, percentage, passed });
  };

  // Handle Password Change
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (pwState.new !== pwState.confirm) {
      setPwState({ ...pwState, error: 'New passwords do not match.', success: false });
      return;
    }
    if (pwState.new.length < 6) {
      setPwState({ ...pwState, error: 'Password must be at least 6 characters.', success: false });
      return;
    }
    changePassword('STUDENT', currentStudent!.id, pwState.new);
    setPwState({ old: '', new: '', confirm: '', success: true, error: '' });
  };

  // Student's certificate
  const studentCertificate = currentStudent?.certificateId
    ? certificates.find((c) => c.id === currentStudent.certificateId || c.studentId === currentStudent.id)
    : certificates.find((c) => c.studentId === currentStudent?.id || c.studentRegNo === currentStudent?.regNo);

  // Student's payments
  const studentPayments = currentStudent
    ? payments.filter((p) => p.studentId === currentStudent.id || p.studentRegNo === currentStudent.regNo)
    : [];

  // If not logged in, render Auth screen (Login / New Registration / Forgot Pass)
  if (!currentStudent) {
    return (
      <div className="min-h-[80vh] bg-slate-50 py-10 px-4 sm:px-6 flex items-center justify-center">
        <div className="w-full max-w-xl bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
          {/* Header tabs */}
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
              1. Student Login
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
              2. New Student Registration
            </button>
          </div>

          <div className="p-6 sm:p-8">
            {/* LOGIN FORM */}
            {authMode === 'LOGIN' && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="text-center space-y-1 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">Student Portal Login</h2>
                  <p className="text-xs text-slate-500">
                    Access your course materials, exam marks, fees receipt, and verified certificate
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
                    Registration No / Email / Mobile Number
                  </label>
                  <input
                    type="text"
                    required
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder="e.g. JSSS/2026/0527 or ananya.sharma@example.com"
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
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <GraduationCap className="w-4 h-4" />
                  Sign In to Student Dashboard
                </button>

                {/* Quick Demo Credentials or Production Badge */}
                {!isPublishedMode ? (
                  <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
                    <span className="font-bold text-slate-800 block text-[11px] uppercase">
                      Demo Student Credentials:
                    </span>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setLoginIdentifier('ananya.sharma@example.com');
                          setLoginPassword('student@123');
                        }}
                        className="px-2 py-1 bg-white border border-slate-300 rounded-lg hover:bg-emerald-50 text-[11px] font-mono text-emerald-800"
                      >
                        Ananya Sharma (Reg: JSSS/2026/0527)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setLoginIdentifier('rahul.roy@example.com');
                          setLoginPassword('student@123');
                        }}
                        className="px-2 py-1 bg-white border border-slate-300 rounded-lg hover:bg-emerald-50 text-[11px] font-mono text-emerald-800"
                      >
                        Rahul Roy (Reg: JSSS/2026/0528)
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 p-3 bg-slate-50/80 rounded-xl border border-slate-200/80 text-[11px] text-slate-600 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Published Application Mode: Production security active. Enter your authorized Student ID & Password.</span>
                  </div>
                )}
              </form>
            )}

            {/* NEW STUDENT REGISTRATION FORM */}
            {authMode === 'REGISTER' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div className="text-center space-y-1 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">New Student Registration</h2>
                  <p className="text-xs text-slate-500">
                    Fill the form to generate your official Student ID & Registration Number
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Full Name of Student *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Suman Mondal"
                      value={regFormData.name}
                      onChange={(e) => setRegFormData({ ...regFormData, name: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Father / Guardian Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Bimal Mondal"
                      value={regFormData.fatherName}
                      onChange={(e) => setRegFormData({ ...regFormData, fatherName: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="student@example.com"
                      value={regFormData.email}
                      onChange={(e) => setRegFormData({ ...regFormData, email: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Mobile Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98XXXXXXXX"
                      value={regFormData.phone}
                      onChange={(e) => setRegFormData({ ...regFormData, phone: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Date of Birth *
                    </label>
                    <input
                      type="date"
                      required
                      value={regFormData.dob}
                      onChange={(e) => setRegFormData({ ...regFormData, dob: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Gender *</label>
                    <select
                      value={regFormData.gender}
                      onChange={(e) =>
                        setRegFormData({ ...regFormData, gender: e.target.value as 'MALE' | 'FEMALE' | 'OTHER' })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                    >
                      <option value="FEMALE">Female</option>
                      <option value="MALE">Male</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                </div>

                {/* Course & Center selection */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Select Course *
                    </label>
                    <select
                      value={regFormData.courseId}
                      onChange={(e) => setRegFormData({ ...regFormData, courseId: e.target.value })}
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
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Training Center / Partner *
                    </label>
                    <select
                      value={regFormData.partnerId}
                      onChange={(e) => setRegFormData({ ...regFormData, partnerId: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                    >
                      {partners.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.centerName} ({p.district})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Permanent Residential Address *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Village / Street, Post Office, Police Station"
                    value={regFormData.address}
                    onChange={(e) => setRegFormData({ ...regFormData, address: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-700 mb-1">District</label>
                    <input
                      type="text"
                      value={regFormData.district}
                      onChange={(e) => setRegFormData({ ...regFormData, district: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-700 mb-1">State</label>
                    <input
                      type="text"
                      value={regFormData.state}
                      onChange={(e) => setRegFormData({ ...regFormData, state: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-700 mb-1">Pincode</label>
                    <input
                      type="text"
                      value={regFormData.pincode}
                      onChange={(e) => setRegFormData({ ...regFormData, pincode: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Create Login Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={regFormData.password}
                    onChange={(e) => setRegFormData({ ...regFormData, password: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Submit Registration & Generate Student ID
                </button>
              </form>
            )}

            {/* FORGOT PASSWORD FORM */}
            {authMode === 'FORGOT_PASS' && (
              <div className="space-y-4">
                <div className="text-center space-y-1 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 mx-auto flex items-center justify-center">
                    <KeyRound className="w-6 h-6" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">Reset Student Password</h2>
                  <p className="text-xs text-slate-500">
                    Enter your Registration Number or Registered Email to set a new password
                  </p>
                </div>

                {forgotSuccess ? (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-center space-y-2">
                    <CheckCircle className="w-8 h-8 mx-auto text-emerald-600" />
                    <p className="text-xs font-bold">Password reset successful!</p>
                    <p className="text-[11px] text-slate-600">You can now sign in with your new password.</p>
                    <button
                      onClick={() => setAuthMode('LOGIN')}
                      className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-lg mt-2"
                    >
                      Back to Sign In
                    </button>
                  </div>
                ) : (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const success = resetPasswordDirectly('STUDENT', forgotId, newPassInput);
                      if (success) {
                        setForgotSuccess(true);
                      } else {
                        alert('No student account found with this Registration No or Email.');
                      }
                    }}
                    className="space-y-3"
                  >
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Registration No or Email
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. JSSS/2026/0527"
                        value={forgotId}
                        onChange={(e) => setForgotId(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Enter New Password
                      </label>
                      <input
                        type="password"
                        required
                        placeholder="Minimum 6 characters"
                        value={newPassInput}
                        onChange={(e) => setNewPassInput(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                      />
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        type="submit"
                        className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs"
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

  // LOGGED IN DASHBOARD
  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Student Header Card */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src={currentStudent.photoUrl}
              alt={currentStudent.name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-emerald-500 shadow-xs bg-slate-100"
            />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900">{currentStudent.name}</h1>
                <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-xs font-mono font-bold rounded-full border border-emerald-200">
                  {currentStudent.regNo}
                </span>
                <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 text-[11px] font-bold rounded-full border border-amber-200">
                  {currentStudent.feeStatus === 'PAID' ? 'Fees Cleared' : `Fee: ${currentStudent.feeStatus}`}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
                Course: <strong className="text-slate-900">{currentStudent.courseName}</strong>
              </p>
              <p className="text-xs text-slate-500">
                Center: {currentStudent.partnerName} • Enrolled: {currentStudent.enrollmentDate}
              </p>
            </div>
          </div>

          {/* Quick Actions on Top Right */}
          <div className="flex flex-wrap items-center gap-2.5">
            {(currentStudent.totalFees ?? 4500) - (currentStudent.paidFees ?? 0) > 0 && (
              <button
                onClick={() => setIsPayModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                <CreditCard className="w-4 h-4" />
                Pay Dues (₹{Math.max(0, (currentStudent.totalFees ?? 4500) - (currentStudent.paidFees ?? 0)).toLocaleString()})
              </button>
            )}

            <button
              onClick={logout}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar border-b border-slate-200 pb-2">
          {[
            { id: 'profile', label: '1. My Profile & ID Card', icon: <User className="w-4 h-4" /> },
            { id: 'fees', label: '2. Fees & Payment Receipts', icon: <CreditCard className="w-4 h-4" /> },
            { id: 'materials', label: '3. Course Materials', icon: <BookOpen className="w-4 h-4" /> },
            { id: 'attendance', label: '4. Attendance Register', icon: <Clock className="w-4 h-4" /> },
            { id: 'mock-exam', label: '5. Mock Exam Assessment', icon: <FileCheck2 className="w-4 h-4" /> },
            { id: 'certificate', label: '6. Exam Mark & Certificate', icon: <Award className="w-4 h-4" />, highlight: true },
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
                } ${tab.highlight && !isActive ? 'border-amber-300 text-amber-900 bg-amber-50/50' : ''}`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB CONTENT: 1. PROFILE & STUDENT ID BADGE */}
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Student ID Card Badge Display */}
            <div className="lg:col-span-1">
              <div className="bg-gradient-to-b from-slate-900 to-[#0c1e36] text-white rounded-3xl p-6 shadow-xl border border-slate-800 relative overflow-hidden">
                {/* ID Card Header */}
                <div className="flex items-center justify-between border-b border-slate-700/80 pb-3">
                  <div>
                    <span className="text-[10px] font-black tracking-widest text-emerald-400 uppercase">
                      STUDENT IDENTITY CARD
                    </span>
                    <h3 className="text-xs font-bold text-white">JSSS FOUNDATION ACADEMY</h3>
                  </div>
                  <span className="text-[9px] font-mono px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/30">
                    2026-27
                  </span>
                </div>

                {/* Photo & Details */}
                <div className="flex flex-col items-center text-center my-4 space-y-2">
                  <img
                    src={currentStudent.photoUrl}
                    alt={currentStudent.name}
                    className="w-24 h-24 rounded-2xl object-cover border-2 border-[#d4af37] shadow-md bg-white"
                  />
                  <div>
                    <h4 className="font-extrabold text-base text-white">{currentStudent.name}</h4>
                    <p className="text-xs font-mono text-emerald-400 font-bold">{currentStudent.regNo}</p>
                    <p className="text-[11px] text-slate-300 mt-0.5">{currentStudent.courseName}</p>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-300 border-t border-slate-700/80 pt-3">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Father's Name:</span>
                    <span className="font-medium text-white">{currentStudent.fatherName || 'Guardian'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Phone:</span>
                    <span className="font-medium text-white">{currentStudent.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Training Center:</span>
                    <span className="font-medium text-white">{currentStudent.partnerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Authorized:</span>
                    <span className="font-medium text-emerald-300">Soumen Ghosh (Director)</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-700/80 flex items-center justify-between text-[10px] text-slate-400">
                  <span>CIN: {foundationInfo.cin}</span>
                  <button
                    onClick={() => window.print()}
                    className="text-emerald-400 hover:underline flex items-center gap-1 font-bold"
                  >
                    <Printer className="w-3 h-3" /> Print ID
                  </button>
                </div>
              </div>
            </div>

            {/* Profile Data & Password Setting */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <User className="w-4 h-4 text-emerald-600" />
                  Detailed Student Admission Profile
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Registration Number</span>
                    <span className="text-sm font-mono font-bold text-slate-900">{currentStudent.regNo}</span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Email Address</span>
                    <span className="text-sm font-semibold text-slate-900">{currentStudent.email}</span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Contact Number</span>
                    <span className="text-sm font-semibold text-slate-900">{currentStudent.phone}</span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Date of Birth</span>
                    <span className="text-sm font-semibold text-slate-900">{currentStudent.dob}</span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 sm:col-span-2">
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Permanent Address</span>
                    <span className="text-xs font-semibold text-slate-900">
                      {currentStudent.address}, {currentStudent.district}, {currentStudent.state} - {currentStudent.pincode}
                    </span>
                  </div>
                </div>

                {/* Official Course & Fee Schedule on Student Profile */}
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                      Approved Course Enrollment & Fee Schedule
                    </span>
                    <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-[10px] font-bold">
                      Head Office Approved
                    </span>
                  </div>

                  {currentStudent.feeUpgradeNote && (
                    <div className="mb-3 p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-900 flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold">Official Fee Revision Applied:</span> {currentStudent.feeUpgradeNote}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-slate-500 block text-[10px] uppercase font-bold">Course</span>
                      <span className="text-xs font-bold text-slate-900">{currentStudent.courseName}</span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-emerald-300/60 bg-emerald-50/30">
                      <span className="text-emerald-700 block text-[10px] uppercase font-bold">Approved Course Fee</span>
                      <span className="text-sm font-black text-emerald-900">₹{(currentStudent.totalFees ?? 4500).toLocaleString()}</span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-slate-500 block text-[10px] uppercase font-bold">Paid to Date</span>
                      <span className="text-sm font-bold text-slate-800">₹{(currentStudent.paidFees ?? 0).toLocaleString()}</span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-slate-500 block text-[10px] uppercase font-bold">Dues Balance</span>
                      <span className="text-sm font-bold text-amber-700">
                        ₹{Math.max(0, (currentStudent.totalFees ?? 4500) - (currentStudent.paidFees ?? 0)).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Password Change Form */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-emerald-600" />
                  Change Account Password
                </h3>

                {pwState.success && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl">
                    Password updated successfully!
                  </div>
                )}
                {pwState.error && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl">
                    {pwState.error}
                  </div>
                )}

                <form onSubmit={handleChangePassword} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 mb-1">New Password</label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={pwState.new}
                      onChange={(e) => setPwState({ ...pwState, new: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 mb-1">Confirm Password</label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={pwState.confirm}
                      onChange={(e) => setPwState({ ...pwState, confirm: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="submit"
                      className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold"
                    >
                      Update Password
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* TAB CONTENT: 2. FEES & PAYMENT RECEIPTS */}
        {activeTab === 'fees' && (
          <div className="space-y-6">
            {currentStudent.feeUpgradeNote && (
              <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-xs text-emerald-900 flex items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-2.5">
                  <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-bold">Official Approved Fee Structure: </span>
                    <span>{currentStudent.feeUpgradeNote}</span>
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-[10px] font-bold shrink-0">
                  Head Office Approved ✓
                </span>
              </div>
            )}

            {/* Fee Overview Card */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-xs font-bold text-slate-500 uppercase">Total Course Fees</span>
                <h3 className="text-2xl font-black text-slate-900 mt-1">₹{(currentStudent.totalFees ?? 4500).toLocaleString()}</h3>
                <span className="text-[11px] text-slate-500">{currentStudent.courseName}</span>
              </div>

              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
                <span className="text-xs font-bold text-emerald-700 uppercase">Total Fees Paid</span>
                <h3 className="text-2xl font-black text-emerald-800 mt-1">₹{(currentStudent.paidFees ?? 0).toLocaleString()}</h3>
                <span className="text-[11px] text-emerald-700 font-semibold">
                  Status: {currentStudent.feeStatus === 'PAID' ? 'Fully Paid' : 'Partial Paid'}
                </span>
              </div>

              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold text-amber-800 uppercase">Remaining Balance</span>
                  <h3 className="text-2xl font-black text-slate-900 mt-1">
                    ₹{Math.max(0, (currentStudent.totalFees ?? 4500) - (currentStudent.paidFees ?? 0)).toLocaleString()}
                  </h3>
                </div>
                {(currentStudent.totalFees ?? 4500) - (currentStudent.paidFees ?? 0) > 0 ? (
                  <button
                    onClick={() => setIsPayModalOpen(true)}
                    className="mt-3 w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    Pay Fees Online / UPI
                  </button>
                ) : (
                  <span className="mt-3 py-1.5 px-3 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl text-center">
                    ✓ All Dues Cleared
                  </span>
                )}
              </div>
            </div>

            {/* 1. PAYMENT PLAN SELECTION DROPDOWN SECTION */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                    <Tag className="w-4 h-4 text-emerald-600" />
                    Course Fee Payment Plan Selection
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Select your preferred schedule for fee settlement. The selected option will be logged in your profile.
                  </p>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-xs font-bold text-emerald-800 self-start sm:self-auto">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Current: {currentStudent.paymentOption === 'EMI' ? 'Monthly EMI' : currentStudent.paymentOption === 'QUARTERLY' ? 'Quarterly Tranches' : 'One-Time Payment'}</span>
                </div>
              </div>

              {planSavedToast && (
                <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{planSavedToast}</span>
                </div>
              )}

              <form onSubmit={handleSavePaymentPlan} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Select Preferred Payment Plan
                    </label>
                    <select
                      value={selectedPaymentPlan}
                      onChange={(e) => setSelectedPaymentPlan(e.target.value as FeePaymentOption)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="ONE_TIME">
                        One-Time Full Settlement — ₹{(currentStudent.totalFees ?? 4500).toLocaleString()} Upfront
                      </option>
                      <option value="EMI">
                        Monthly EMI (3 Monthly Installments of ~₹{Math.round((currentStudent.totalFees ?? 4500) / 3).toLocaleString()} / month)
                      </option>
                      <option value="QUARTERLY">
                        Quarterly Tranches (2 Installments of ~₹{Math.round((currentStudent.totalFees ?? 4500) / 2).toLocaleString()} each)
                      </option>
                    </select>
                  </div>

                  <div className="flex items-end">
                    <button
                      type="submit"
                      className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Check className="w-4 h-4 text-emerald-400" />
                      Confirm & Save Payment Plan
                    </button>
                  </div>
                </div>

                {/* Plan Highlights Box */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className={`p-3 rounded-xl border transition-all ${selectedPaymentPlan === 'ONE_TIME' ? 'bg-emerald-50/80 border-emerald-300 text-emerald-900 font-semibold' : 'bg-white border-slate-200'}`}>
                    <span className="font-bold block text-slate-800">Plan A: One-Time</span>
                    <span className="text-[11px] block mt-0.5">Pay full ₹{(currentStudent.totalFees ?? 4500).toLocaleString()} with instant zero-dues certificate clearance upon completion.</span>
                  </div>
                  <div className={`p-3 rounded-xl border transition-all ${selectedPaymentPlan === 'EMI' ? 'bg-emerald-50/80 border-emerald-300 text-emerald-900 font-semibold' : 'bg-white border-slate-200'}`}>
                    <span className="font-bold block text-slate-800">Plan B: 3-Month EMI</span>
                    <span className="text-[11px] block mt-0.5">₹{Math.round((currentStudent.totalFees ?? 4500) / 3).toLocaleString()} payable per month over 3 consecutive months.</span>
                  </div>
                  <div className={`p-3 rounded-xl border transition-all ${selectedPaymentPlan === 'QUARTERLY' ? 'bg-emerald-50/80 border-emerald-300 text-emerald-900 font-semibold' : 'bg-white border-slate-200'}`}>
                    <span className="font-bold block text-slate-800">Plan C: Quarterly</span>
                    <span className="text-[11px] block mt-0.5">2 equal payments of ₹{Math.round((currentStudent.totalFees ?? 4500) / 2).toLocaleString()} at enrollment and mid-term.</span>
                  </div>
                </div>
              </form>
            </div>

            {/* Official Google Pay UPI QR Scan & Pay Block */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                <div className="lg:col-span-7 space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-[11px] font-bold text-emerald-400">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Official Direct Payment Gateway
                  </div>

                  <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    Instant Course Fee Payment via UPI
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    Scan the official <strong>Jeeb Seva Shib Seva Foundation</strong> Google Pay / BHIM UPI QR Code using Google Pay, PhonePe, Paytm, BHIM, or any UPI app.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                    <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                      <span className="text-slate-400 text-[10px] uppercase font-bold block">Beneficiary Name</span>
                      <span className="font-bold text-emerald-400 text-xs">Jeeb Seva Shib Seva Foundation</span>
                    </div>
                    <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                      <span className="text-slate-400 text-[10px] uppercase font-bold block">Official UPI ID</span>
                      <span className="font-mono font-bold text-white text-xs">9907323533-1@okbizaxis</span>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-wrap gap-2.5">
                    <button
                      onClick={() => setIsPayModalOpen(true)}
                      className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Open Full Payment Portal
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-5 flex justify-center">
                  <OfficialUpiQrCard
                    amount={currentStudent.totalFees - currentStudent.paidFees > 0 ? currentStudent.totalFees - currentStudent.paidFees : undefined}
                    note={`Course Fee: ${currentStudent.courseName} (${currentStudent.regNo})`}
                    studentName={currentStudent.name}
                    courseName={currentStudent.courseName}
                    compact={true}
                    showActions={true}
                  />
                </div>
              </div>
            </div>

            {/* 2. PAYMENT PROOF SUBMISSION FORM */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
              <div className="mb-4">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                  <Upload className="w-4 h-4 text-emerald-600" />
                  Submit Offline / UPI Payment Proof & UTR
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Paid fees via Google Pay, PhonePe, UPI QR, or Bank Transfer? Submit your UTR Transaction ID and receipt screenshot for center audit and ledger credit.
                </p>
              </div>

              {proofSuccessMsg && (
                <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{proofSuccessMsg}</span>
                </div>
              )}

              {proofErrorMsg && (
                <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{proofErrorMsg}</span>
                </div>
              )}

              <form onSubmit={handleProofSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Amount Paid (₹) *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder={`e.g. ${currentStudent.totalFees - currentStudent.paidFees > 0 ? currentStudent.totalFees - currentStudent.paidFees : 2000}`}
                      value={proofAmount}
                      onChange={(e) => setProofAmount(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Payment Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={proofDate}
                      onChange={(e) => setProofDate(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Payment Mode / App *
                    </label>
                    <select
                      value={proofMethod}
                      onChange={(e) => setProofMethod(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="UPI (Google Pay / PhonePe / Paytm)">UPI (Google Pay / PhonePe / Paytm)</option>
                      <option value="IMPS / NEFT Bank Transfer">IMPS / NEFT Bank Transfer</option>
                      <option value="Bank Cash Deposit / Challan">Bank Cash Deposit / Challan</option>
                      <option value="Cash Handover at Center">Cash Handover at Center</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Bank UTR / Transaction Reference ID *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 412356789012 or IMPS-987654"
                      value={proofTxnId}
                      onChange={(e) => setProofTxnId(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Payment Slip / Screenshot Attachment
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={proofFileName}
                        onChange={(e) => setProofFileName(e.target.value)}
                        placeholder="e.g. gpay_receipt.jpg"
                        className="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-700"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setProofFileName(`receipt_${Date.now().toString().slice(-4)}.jpg`);
                          alert('Payment screenshot attachment attached successfully.');
                        }}
                        className="px-3 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg text-xs font-bold text-slate-700 shrink-0 cursor-pointer"
                      >
                        Attach File
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Notes / Remarks (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Paid via Google Pay for April Installment"
                    value={proofNotes}
                    onChange={(e) => setProofNotes(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    Submit Payment Proof for Verification
                  </button>
                </div>
              </form>
            </div>

            {/* 3. SUBMITTED PAYMENT PROOFS AUDIT LIST */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  Your Submitted Payment Proofs & Verification Status
                </h3>
                <span className="text-xs text-slate-500">
                  {currentStudent.paymentProofs?.length || 0} Proofs Submitted
                </span>
              </div>

              {(!currentStudent.paymentProofs || currentStudent.paymentProofs.length === 0) ? (
                <div className="p-8 text-center text-slate-500 text-xs">
                  No payment proof submissions on file yet. Once you make an offline or UPI payment, submit the UTR above for rapid center verification.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50/70 text-slate-600 font-semibold uppercase text-[10px]">
                      <tr>
                        <th className="px-6 py-3">Proof ID</th>
                        <th className="px-6 py-3">Payment Date</th>
                        <th className="px-6 py-3">Amount</th>
                        <th className="px-6 py-3">Mode</th>
                        <th className="px-6 py-3">Transaction / UTR</th>
                        <th className="px-6 py-3">Verification Status</th>
                        <th className="px-6 py-3 text-right">Audit & View</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                      {currentStudent.paymentProofs.map((prf) => (
                        <tr key={prf.id} className="hover:bg-slate-50/60">
                          <td className="px-6 py-4 font-mono font-bold text-slate-900">{prf.id}</td>
                          <td className="px-6 py-4 text-slate-600">{prf.paymentDate}</td>
                          <td className="px-6 py-4 font-bold text-slate-900">₹{(prf.amount ?? 0).toLocaleString()}</td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-bold text-slate-700">
                              {prf.paymentMethod}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-mono text-[11px] text-slate-600">{prf.transactionId}</td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                                prf.status === 'VERIFIED'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : prf.status === 'REJECTED'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {prf.status === 'VERIFIED' && '✓ Verified & Credited'}
                              {prf.status === 'REJECTED' && '✕ Rejected / Incomplete'}
                              {prf.status === 'PENDING' && '⧗ Under Center Audit'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => setSelectedProofModal(prf)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-[11px] font-bold cursor-pointer"
                            >
                              <Eye className="w-3 h-3 text-emerald-600" />
                              View Slip
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* 4. Payment Receipts Table */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-600" />
                  Official Payment Transaction Invoices & Receipts
                </h3>
                <span className="text-xs text-slate-500">
                  {studentPayments.length} Transactions Recorded
                </span>
              </div>

              {studentPayments.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs">
                  No online payment records found yet. Click 'Pay Remaining Fees' to complete fee clearance.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50/70 text-slate-600 font-semibold uppercase text-[10px]">
                      <tr>
                        <th className="px-6 py-3">Receipt No</th>
                        <th className="px-6 py-3">Date</th>
                        <th className="px-6 py-3">Amount</th>
                        <th className="px-6 py-3">Method</th>
                        <th className="px-6 py-3">Transaction ID</th>
                        <th className="px-6 py-3">Status</th>
                        <th className="px-6 py-3 text-right">Receipt</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                      {studentPayments.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50/60">
                          <td className="px-6 py-4 font-mono font-bold text-emerald-800">{p.receiptNo}</td>
                          <td className="px-6 py-4 text-slate-600">{p.date}</td>
                          <td className="px-6 py-4 font-bold text-slate-900">₹{(p.amount ?? 0).toLocaleString()}</td>
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
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => window.print()}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-[11px] font-bold cursor-pointer"
                            >
                              <Printer className="w-3 h-3" />
                              Download
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

        {/* TAB CONTENT: 3. COURSE MATERIALS */}
        {activeTab === 'materials' && (
          <div className="space-y-4">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 mb-4">
                <BookOpen className="w-4 h-4 text-emerald-600" />
                Syllabus, Video Lectures & Study Notes for {currentStudent.courseName}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {materials
                  .filter((m) => m.courseId === currentStudent.courseId || m.courseId === 'CRS-01')
                  .map((mat) => (
                    <div
                      key={mat.id}
                      className="p-5 rounded-2xl border border-slate-200 hover:border-emerald-400 bg-slate-50/50 hover:bg-emerald-50/20 transition-all flex flex-col justify-between space-y-3"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                          {mat.fileType === 'PDF' ? <FileText className="w-5 h-5" /> : <PlayCircle className="w-5 h-5" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 bg-slate-200 text-slate-800 text-[10px] font-bold rounded">
                              {mat.fileType}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">{mat.fileSize}</span>
                          </div>
                          <h4 className="font-bold text-slate-900 text-sm mt-1">{mat.title}</h4>
                          <p className="text-xs text-slate-600 mt-1 leading-relaxed">{mat.description}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs">
                        <span className="text-[10px] text-slate-500">By: {mat.uploadedByName}</span>
                        <a
                          href={mat.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Download Material
                        </a>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB CONTENT: 4. OFFICIAL ATTENDANCE REGISTER */}
        {activeTab === 'attendance' && (
          <StudentAttendanceSection
            currentStudent={currentStudent}
            foundationInfo={foundationInfo}
          />
        )}

        {/* TAB CONTENT: 5. MOCK EXAM */}
        {activeTab === 'mock-exam' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4 mb-6">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <FileCheck2 className="w-4 h-4 text-emerald-600" />
                    Interactive Online Mock Examination & Self-Assessment
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Prepare for official certification with timed evaluation tests and instant score feedback
                  </p>
                </div>

                {mockExams.length > 0 && (
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-600">Select Exam:</span>
                    <select
                      value={activeExamId || mockExams[0]?.id}
                      onChange={(e) => {
                        setActiveExamId(e.target.value);
                        setExamAnswers({});
                        setExamResult(null);
                      }}
                      className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800"
                    >
                      {mockExams.map((ex) => (
                        <option key={ex.id} value={ex.id}>
                          {ex.title}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Render Exam Questions */}
              {(() => {
                const currentExam = mockExams.find((e) => e.id === (activeExamId || mockExams[0]?.id)) || mockExams[0];
                if (!currentExam) return <div>No mock exam found.</div>;

                return (
                  <div className="space-y-6">
                    <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-sm">{currentExam.title}</h4>
                        <p className="text-slate-600">Course: {currentExam.courseName}</p>
                      </div>
                      <div className="flex gap-4 font-semibold text-slate-700">
                        <span>Total Questions: {currentExam.questions.length}</span>
                        <span>Passing Marks: {currentExam.passingMarks}</span>
                        <span>Duration: {currentExam.durationMinutes} mins</span>
                      </div>
                    </div>

                    {/* Result Banner if submitted */}
                    {examResult && (
                      <div
                        className={`p-6 rounded-2xl border text-center space-y-2 ${
                          examResult.passed
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                            : 'bg-amber-50 border-amber-300 text-amber-950'
                        }`}
                      >
                        <div className="text-2xl font-black">
                          {examResult.passed ? '🎉 Congratulations! You Passed!' : '⚠️ Needs Practice'}
                        </div>
                        <p className="text-sm font-bold">
                          Score: {examResult.score} / {examResult.total} ({examResult.percentage}%)
                        </p>
                        <p className="text-xs text-slate-600">
                          {examResult.passed
                            ? 'You have satisfied the academic standard. Your partner center will enter your official final exam marks for Certificate Generation.'
                            : 'Review the question explanations below and re-attempt to improve your score.'}
                        </p>
                      </div>
                    )}

                    {/* Question List */}
                    <div className="space-y-6">
                      {currentExam.questions.map((q, qIndex) => {
                        const selectedAnswer = examAnswers[q.id];
                        const isSubmitted = !!examResult;

                        return (
                          <div
                            key={q.id}
                            className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3"
                          >
                            <div className="flex items-start gap-2">
                              <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
                                {qIndex + 1}
                              </span>
                              <h5 className="font-bold text-slate-900 text-sm leading-snug">{q.question}</h5>
                            </div>

                            {/* Options */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 pl-8">
                              {q.options.map((option, optIdx) => {
                                const isChecked = selectedAnswer === optIdx;
                                const isCorrect = q.correctIndex === optIdx;

                                let btnStyle = 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100';
                                if (isSubmitted) {
                                  if (isCorrect) {
                                    btnStyle = 'bg-emerald-100 border-emerald-500 text-emerald-900 font-bold';
                                  } else if (isChecked && !isCorrect) {
                                    btnStyle = 'bg-rose-100 border-rose-400 text-rose-900';
                                  }
                                } else if (isChecked) {
                                  btnStyle = 'bg-emerald-600 text-white font-bold border-emerald-600';
                                }

                                return (
                                  <button
                                    key={optIdx}
                                    type="button"
                                    onClick={() => {
                                      if (!isSubmitted) {
                                        setExamAnswers({ ...examAnswers, [q.id]: optIdx });
                                      }
                                    }}
                                    className={`p-3 rounded-xl border text-left text-xs transition-all flex items-center gap-2 ${btnStyle}`}
                                  >
                                    <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px] font-mono shrink-0">
                                      {String.fromCharCode(65 + optIdx)}
                                    </span>
                                    <span>{option}</span>
                                  </button>
                                );
                              })}
                            </div>

                            {/* Explanation if submitted */}
                            {isSubmitted && (
                              <div className="mt-2 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 pl-8">
                                <strong className="text-emerald-800 block text-[11px] uppercase font-bold">
                                  Explanation:
                                </strong>
                                <p className="mt-0.5">{q.explanation}</p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Submit / Retry Actions */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                      {examResult ? (
                        <button
                          onClick={() => {
                            setExamAnswers({});
                            setExamResult(null);
                          }}
                          className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold"
                        >
                          Re-attempt Assessment
                        </button>
                      ) : (
                        <button
                          onClick={() => handleMockExamSubmit(currentExam)}
                          disabled={Object.keys(examAnswers).length === 0}
                          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition-all cursor-pointer"
                        >
                          Submit & Calculate Instant Score
                        </button>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* TAB CONTENT: 6. EXAM MARKS & VERIFIED CERTIFICATE */}
        {activeTab === 'certificate' && (
          <div className="space-y-6">
            {/* Marksheet Card */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <Award className="w-5 h-5 text-emerald-600" />
                    Official Academic Evaluation & Marksheet
                  </h3>
                  <p className="text-xs text-slate-500">
                    Evaluation certified by JSSS Examination Board & Training Center Partner
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-600">Status:</span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      currentStudent.examStatus === 'PASSED'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : currentStudent.examStatus === 'FAILED'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {currentStudent.examStatus === 'PASSED'
                      ? '✓ Exam Cleared & Certificate Issued'
                      : currentStudent.examStatus === 'APPEARED'
                      ? 'Under Evaluation'
                      : 'Not Appeared Yet'}
                  </span>
                </div>
              </div>

              {/* Marks Table Breakdown */}
              {currentStudent.marks ? (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Theory Marks</span>
                    <span className="text-lg font-black text-slate-900">{currentStudent.marks.theory} / 50</span>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Practical / Project</span>
                    <span className="text-lg font-black text-slate-900">{currentStudent.marks.practical} / 50</span>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Total Obtained</span>
                    <span className="text-lg font-black text-emerald-800">{currentStudent.marks.total} / {currentStudent.marks.maxMarks}</span>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Percentage</span>
                    <span className="text-lg font-black text-slate-900">{currentStudent.marks.percentage}%</span>
                  </div>

                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 col-span-2 sm:col-span-1">
                    <span className="text-[10px] text-amber-800 uppercase font-bold block">Final Grade</span>
                    <span className="text-lg font-black text-amber-900">{currentStudent.marks.grade}</span>
                  </div>
                </div>
              ) : (
                <div className="p-6 bg-slate-50 rounded-2xl text-center text-xs text-slate-600">
                  Marks will appear here once entered by your center partner or admin. Once marks are entered and you pass, your unique digital certificate will automatically generate!
                </div>
              )}
            </div>

            {/* Certificate Display if Issued */}
            {studentCertificate ? (
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      Your Official Digital Certificate of Completion
                    </h4>
                    <p className="text-xs text-slate-500 font-mono">
                      Certificate ID: {studentCertificate.certificateNo} • Issued: {studentCertificate.issueDate}
                    </p>
                  </div>

                  <button
                    onClick={() => setViewCertificateModal(true)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Open Certificate Fullscreen & Download
                  </button>
                </div>

                {/* Render Embedded Certificate Canvas */}
                <div className="pt-2">
                  <CertificateCard certificate={studentCertificate} isPreviewMode={false} />
                </div>
              </div>
            ) : (
              <div className="p-8 bg-amber-50/60 border border-amber-200 rounded-3xl text-center space-y-2">
                <Award className="w-12 h-12 text-amber-600 mx-auto opacity-70" />
                <h4 className="font-bold text-slate-900 text-sm">Certificate Pending Exam Completion</h4>
                <p className="text-xs text-slate-600 max-w-md mx-auto">
                  Your certificate will be generated automatically as soon as your marks are submitted by your training partner and verified by JSSS Academic Cell.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Payment Gateway Modal */}
      {isPayModalOpen && (
        <PaymentModal
          student={currentStudent}
          isOpen={isPayModalOpen}
          onClose={() => setIsPayModalOpen(false)}
        />
      )}

      {/* Full Certificate Modal */}
      {viewCertificateModal && studentCertificate && (
        <CertificateModal
          certificate={studentCertificate}
          onClose={() => setViewCertificateModal(false)}
        />
      )}

      {/* Payment Proof Inspection Modal */}
      {selectedProofModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="font-bold text-sm">Payment Proof Slip Audit</h3>
                  <span className="text-[11px] text-slate-400 font-mono">Proof ID: {selectedProofModal.id}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedProofModal(null)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Amount Paid</span>
                  <span className="text-base font-black text-slate-900">₹{(selectedProofModal.amount ?? 0).toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Payment Date</span>
                  <span className="font-semibold text-slate-800">{selectedProofModal.paymentDate}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Payment Method</span>
                  <span className="font-medium text-slate-800">{selectedProofModal.paymentMethod}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">UTR / Transaction ID</span>
                  <span className="font-mono font-bold text-emerald-700">{selectedProofModal.transactionId}</span>
                </div>
              </div>

              {/* Screenshot Preview */}
              <div>
                <span className="text-[11px] font-bold text-slate-700 block mb-1">Attached Receipt Screenshot / Slip</span>
                <div className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-100 max-h-56 flex items-center justify-center">
                  <img
                    src={selectedProofModal.screenshotUrl}
                    alt="Payment Slip Screenshot"
                    className="w-full h-auto object-cover max-h-56"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1 px-1">
                  <span>File: {selectedProofModal.screenshotFileName || 'payment_proof.jpg'}</span>
                  <span>Submitted: {selectedProofModal.submittedAt}</span>
                </div>
              </div>

              {/* Status and remarks */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-slate-700">Verification Status:</span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      selectedProofModal.status === 'VERIFIED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : selectedProofModal.status === 'REJECTED'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {selectedProofModal.status === 'VERIFIED' && '✓ Verified & Added to Ledger'}
                    {selectedProofModal.status === 'REJECTED' && '✕ Incomplete / Unverified'}
                    {selectedProofModal.status === 'PENDING' && '⧗ Under Center Audit'}
                  </span>
                </div>
                {selectedProofModal.centerRemarks ? (
                  <p className="text-slate-600 text-[11px]">
                    <span className="font-semibold text-slate-700">Center Remarks:</span> {selectedProofModal.centerRemarks}
                  </p>
                ) : (
                  <p className="text-slate-500 text-[11px] italic">
                    Center verification in progress. Once confirmed by your center director, this transaction will be credited into your official fee receipts ledger.
                  </p>
                )}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setSelectedProofModal(null)}
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
