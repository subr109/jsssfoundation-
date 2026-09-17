export type UserRole = 'STUDENT' | 'PARTNER' | 'ADMIN' | 'GUEST';

export interface CenterMISLoginHistory {
  id: string;
  timestamp: string;
  ipAddress?: string;
  device?: string;
  status: 'SUCCESS' | 'FAILED';
}

export interface CenterMISUser {
  id: string; // e.g. CMIS-101-01
  misCode: string; // username/ID e.g. CMIS-101-01
  username?: string; // username/ID alias
  partnerId: string; // Bound strictly to Center ID
  partnerCode: string; // e.g. JSSS-CTR-101
  centerName: string;
  name: string;
  email: string;
  phone: string;
  password?: string; // In-memory runtime credential only - NEVER saved to storage
  role: 'CENTER_MIS';
  status: 'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED';
  createdAt: string;
  createdByRole?: 'SUPER_ADMIN' | 'MIS_ADMIN' | 'PARTNER';
  createdByName?: string;
  designation: string; // e.g. "Center MIS Coordinator"
  lastLogin?: string;
  loginHistory?: CenterMISLoginHistory[];
}

export interface Student {
  id: string;
  regNo: string; // e.g. JSSS/2026/STU/1001
  name: string;
  email: string;
  phone: string;
  dob: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  fatherName: string;
  address: string;
  district: string;
  state: string;
  pincode: string;
  courseId: string;
  courseName: string;
  batchId?: string;
  batchName?: string;
  partnerId: string; // Center partner id
  partnerName: string;
  photoUrl: string;
  enrollmentDate: string;
  totalFees: number;
  paidFees: number;
  feeStatus: 'PAID' | 'PARTIAL' | 'PENDING';
  examStatus: 'NOT_APPEARED' | 'APPEARED' | 'PASSED' | 'FAILED';
  marks?: {
    theory: number;
    practical: number;
    total: number;
    maxMarks: number;
    percentage: number;
    grade: string;
    evaluatedDate: string;
  };
  certificateId?: string;
  password?: string; // In-memory runtime credential only - NEVER saved to storage
  attendanceHistory: AttendanceRecord[];
  feeUpgradeNote?: string;
  paymentOption?: FeePaymentOption; // 'ONE_TIME' | 'EMI' | 'QUARTERLY'
  paymentOptionSelectedDate?: string;
  paymentProofs?: FeePaymentProof[];
}

export type FeePaymentOption = 'ONE_TIME' | 'EMI' | 'QUARTERLY';

export interface FeePaymentProof {
  id: string;
  studentId: string;
  studentName: string;
  studentRegNo: string;
  partnerId: string;
  partnerName?: string;
  courseId: string;
  courseName: string;
  amount: number;
  paymentDate: string;
  transactionId: string;
  paymentMethod: string;
  screenshotUrl: string;
  screenshotFileName?: string;
  notes?: string;
  submittedAt: string;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  verifiedBy?: string;
  verifiedDate?: string;
  centerRemarks?: string;
}

export interface AttendanceRecord {
  id: string;
  attendanceNo?: string; // e.g. ATT-2026-0527-01
  sessionName?: string; // e.g. Theory & Lab Session - Section A
  date: string;
  time: string;
  timestamp: number;
  status: 'PRESENT' | 'LATE' | 'ABSENT';
  latitude?: number;
  longitude?: number;
  locationAddress?: string;
  accuracy?: number;
  markedBy: 'STUDENT_SELF' | 'PARTNER';
  notes?: string;
}

export interface Partner {
  id: string;
  partnerCode: string; // e.g. JSSS-CTR-101
  centerName: string;
  ownerName: string;
  email: string;
  phone: string;
  password?: string; // In-memory runtime credential only - NEVER saved to storage
  address: string;
  district: string;
  state: string;
  pincode: string;
  tradeLicenseNumber: string;
  panNumber: string;
  aadharNumber: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  documents?: {
    name: string;
    type: string;
    fileUrl: string;
    uploadDate: string;
  }[];
  createdAt?: string;
  joinedDate?: string;
  agreementValidUntil?: string;
  commissionRate?: number;
  totalStudentsEnrolled: number;
  totalRevenueGenerated?: number;
  bankAccountDetails?: string;
  upiId?: string;
  customCourseFees?: { [courseId: string]: number };
}

export interface FeeUpgradeRequest {
  id: string;
  requestNo: string; // e.g. FUR-2026-0101
  partnerId: string;
  partnerName: string;
  partnerCode: string;
  scope: 'FULL_CENTER' | 'SINGLE_STUDENT';
  courseId: string;
  courseName: string;
  courseCode: string;
  studentId?: string;
  studentName?: string;
  studentRegNo?: string;
  currentFee: number;
  requestedFee: number;
  reason: string;
  requestedDate: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  adminRemarks?: string;
  reviewedDate?: string;
  reviewedBy?: string;
  // Visual payment proof & audit tracking fields
  paymentProofId?: string;
  transactionId?: string;
  paymentDate?: string;
  paymentProofStatus?: 'PENDING' | 'VERIFIED' | 'REJECTED' | 'NOT_APPLICABLE' | 'NO_PROOF_SUBMITTED';
  paymentScreenshotUrl?: string;
  paymentAmount?: number;
  studentPaymentPlan?: 'EMI' | 'ONE_TIME' | 'QUARTERLY';
  timestamp?: string;
}

export interface Course {
  id: string;
  code: string;
  title: string;
  category: string;
  duration: string;
  fees: number;
  description: string;
  syllabus: string[];
  eligibility: string;
  passingPercentage: number;
  active: boolean;
  bannerUrl: string;
}

export interface Batch {
  id: string;
  partnerId: string;
  courseId: string;
  courseName: string;
  batchName: string;
  batchCode: string;
  startDate: string;
  endDate: string;
  timing: string;
  instructorName: string;
  maxStudents: number;
  studentIds: string[];
}

export interface PaymentReceipt {
  id: string;
  receiptNo: string; // e.g. REC-2026-8891
  studentId: string;
  studentName: string;
  studentRegNo: string;
  partnerId: string;
  partnerName: string;
  centerName?: string;
  courseId: string;
  courseName: string;
  amount: number;
  paymentMethod: 'UPI' | 'CARD' | 'NETBANKING' | 'WALLET' | 'CASH';
  transactionId: string;
  status: 'SUCCESS' | 'PENDING' | 'FAILED';
  date: string;
  paymentDate?: string;
  notes?: string;
  invoiceUrl?: string;
}

export interface CourseMaterial {
  id: string;
  courseId: string;
  batchId?: string;
  partnerId: string;
  title: string;
  description: string;
  fileType: 'PDF' | 'VIDEO' | 'DOC' | 'ZIP' | 'LINK';
  fileUrl: string;
  fileSize: string;
  uploadDate: string;
  uploadedByName: string;
}

export interface Certificate {
  id: string;
  certificateNo: string; // e.g. JSSS/2026/0527
  studentId: string;
  studentName: string;
  studentRegNo: string;
  partnerId: string;
  partnerName: string;
  courseId: string;
  courseName: string;
  courseDuration: string;
  issueDate: string;
  completionDate: string;
  grade: string;
  percentage: number;
  signatoryDirector: string; // Soumen Ghosh
  signatoryProjectDirector: string; // Subrata Roy
  qrCodeUrl?: string;
  status: 'VALID' | 'REVOKED';
  verificationHash: string;
}

export interface MockExam {
  id: string;
  courseId: string;
  courseName: string;
  title: string;
  durationMinutes: number;
  totalMarks: number;
  passingMarks: number;
  questions: {
    id: string;
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }[];
}

export interface MockExamSubmission {
  id: string;
  studentId: string;
  mockExamId: string;
  courseId: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  passed: boolean;
  submittedAt: string;
  answers: { [questionId: string]: number };
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: 'ADMIN' | 'PARTNER' | 'STUDENT' | 'SYSTEM' | 'CENTER_MIS';
  actionType:
    | 'STUDENT_REGISTRATION'
    | 'STUDENT_UPDATED'
    | 'STUDENT_DELETED'
    | 'PARTNER_REGISTRATION'
    | 'PARTNER_APPROVAL'
    | 'PARTNER_MODIFIED'
    | 'PARTNER_DELETED'
    | 'CERTIFICATE_GENERATION'
    | 'PAYMENT_RECEIVED'
    | 'PAYMENT_PROOF_SUBMITTED'
    | 'PAYMENT_PROOF_VERIFIED'
    | 'PAYMENT_OPTION_UPDATED'
    | 'COURSE_ADDED'
    | 'COURSE_MODIFIED'
    | 'COURSE_DELETED'
    | 'ATTENDANCE_MARKED'
    | 'EXAM_MARKS_SUBMITTED'
    | 'ADMIN_CREATED'
    | 'ADMIN_DEACTIVATED'
    | 'ADMIN_REACTIVATED'
    | 'CENTER_MIS_CREATED'
    | 'CENTER_MIS_STATUS_TOGGLED'
    | 'SECURITY_VIOLATION_BLOCKED'
    | 'SESSION_EXPIRED'
    | 'SESSION_TERMINATED'
    | 'FEE_UPGRADE_REQUESTED'
    | 'FEE_UPGRADE_APPROVED'
    | 'FEE_UPGRADE_REJECTED'
    | 'PASSWORD_RESET'
    | 'CREDENTIAL_ACCESSED'
    | 'ADMIN_ACTION'
    | 'CIRCULAR_PUBLISHED'
    | 'FEE_PAYMENT_PROOF_SUBMITTED'
    | 'FEE_PAYMENT_PROOF_VERIFIED'
    | 'FEE_PAYMENT_PROOF_REJECTED'
    | 'DOWNLOAD_FILE_UPLOADED'
    | 'DOWNLOAD_FILE_DELETED'
    | 'OFFLINE_PAYMENT_RECORDED'
    | 'OFFLINE_PAYMENT_VERIFIED'
    | 'OFFLINE_PAYMENT_REJECTED'
    | 'LOGIN_SUCCESS';
  details: string;
  ipAddress?: string;
  action?: string;
  userName?: string;
  userRole?: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  password?: string; // In-memory runtime credential only - NEVER saved to storage
  role: 'SUPER_ADMIN' | 'MIS_ADMIN' | 'EXAM_CONTROLLER' | 'ACCOUNTS_ADMIN';
  isPrimaryAdmin?: boolean; // True for the 3 Primary Admins: Soumen Ghosh, Subrata Roy, Biswajit Das
  status: 'ACTIVE' | 'DEACTIVATED';
  createdAt: string;
  phone?: string;
  designation?: string;
  createdByName?: string;
  createdByRole?: 'SUPER_ADMIN' | 'MIS_ADMIN';
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  courseOrCenter: string;
  location: string;
  content: string;
  rating: number;
  avatarUrl: string;
}

export interface FoundationDetails {
  legalName: string;
  shortName: string;
  legalStatus: string;
  cin: string;
  registrationNo: string;
  incorporationDate: string;
  roc: string;
  registrationAuthority: string;
  pan: string;
  tan: string;
  registration12A: string;
  registration80G: string;
  csrRegistration: string;
  ngoDarpanId: string;
  udyamMsme: string;
  fcraStatus: string;
  registeredOffice: string;
  kolkataOffice: string;
  bankName: string;
  bankIfsc: string;
  officialWebsite: string;
  officialEmail: string;
  contactNumbers: string[];
  directorName: string;
  projectDirectorName: string;
  upiId?: string;
  upiPhone?: string;
  upiName?: string;
}

export interface DownloadFile {
  id: string;
  title: string;
  description?: string;
  fileName: string;
  fileSize: string; // e.g. "14.2 MB"
  fileSizeBytes: number; // up to 100 MB (104,857,600 bytes)
  fileType: 'PDF' | 'DOC' | 'EXCEL' | 'ZIP' | 'IMAGE' | 'OTHER';
  fileUrl: string; // file download link or data URL
  uploadedByRole: 'SUPER_ADMIN' | 'MIS_ADMIN' | 'ADMIN';
  uploadedByName: string;
  uploadedByEmail?: string;
  uploadDate: string;
  category: 'PROSPECTUS' | 'SYLLABUS' | 'AFFILIATION_FORM' | 'EXAM_CIRCULAR' | 'GENERAL' | 'STUDY_KIT';
  version: number;
  lastUpdated?: string;
}

export interface OfflinePaymentEntry {
  id: string;
  receiptNumber: string; // e.g. JSSS-OFF-2026-001
  studentId: string;
  studentName: string;
  studentRegNo: string;
  partnerId: string;
  partnerName: string;
  courseId: string;
  courseName: string;
  batchId?: string;
  batchName?: string;
  amount: number;
  paymentDate: string;
  paymentMethod: 'UPI' | 'DYNAMIC_QR' | 'CASH' | 'BANK_TRANSFER' | 'CHEQUE' | 'DEMAND_DRAFT';
  transactionId: string; // UTR / Txn ID / Cheque No
  receiptProofUrl?: string; // uploaded receipt image/pdf data URL
  receiptFileName?: string;
  qrPaymentDetails?: {
    upiId: string;
    merchantName: string;
    amount: number;
    transactionNote: string;
  };
  paymentStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
  rejectionReason?: string;
  totalCourseFees: number;
  totalPaid: number;
  totalDue: number;
  remainingBalance: number;
  notes?: string;
  submittedByRole: 'PARTNER' | 'CENTER_MIS' | 'ADMIN' | 'SUPER_ADMIN';
  submittedByName: string;
  verifiedBy?: string;
  verifiedDate?: string;
  createdAt: string;
}
