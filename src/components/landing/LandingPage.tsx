import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Logo } from '../common/Logo';
import { OfficialUpiQrCard } from '../common/OfficialUpiQrCard';
import { OfficialPaymentQrModal } from '../common/OfficialPaymentQrModal';
import {
  GraduationCap,
  Briefcase,
  ShieldCheck,
  Award,
  BookOpen,
  CheckCircle,
  FileText,
  MapPin,
  Clock,
  ArrowRight,
  Search,
  Sparkles,
  Users,
  Building,
  ChevronLeft,
  ChevronRight,
  Star,
  Quote,
  Scale,
  Landmark,
  QrCode,
  CreditCard,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { setCurrentView, foundationInfo, courses, partners, certificates, students } = useApp();
  const [quickCertQuery, setQuickCertQuery] = useState('');
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [isFeeQrOpen, setIsFeeQrOpen] = useState(false);

  const testimonials = [
    {
      id: 1,
      name: 'Ananya Sharma',
      role: 'Student Alumni, DCA Batch 2026',
      center: 'Apex Computer Academy, Behala',
      text: 'The automated certificate verification feature made my job interview at a leading IT firm seamless. The HR scanned the QR code directly and verified my score and course completion immediately!',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    },
    {
      id: 2,
      name: 'Dr. Amitav Banerjee',
      role: 'Center Director / Partner',
      center: 'Apex Computer Academy, Kolkata',
      text: 'Partnering with JSSS Foundation transformed our training center. The bulk CSV upload saves hours of data entry, and instant certificate generation upon entering exam marks is a massive hit with students.',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    },
    {
      id: 3,
      name: 'Rahul Roy',
      role: 'Student, Tally Prime & GST',
      center: 'Sunderban Skill Development Center, Sagar',
      text: 'Having a Govt. registered non-profit certificate under MCA (Govt of India) gave immense credibility to my resume. The online fee payment receipt download was super convenient.',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    },
  ];

  const handleQuickVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickCertQuery.trim()) {
      window.history.pushState({}, '', `?verify=${encodeURIComponent(quickCertQuery.trim())}`);
      setCurrentView('verify-certificate');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 space-y-16 pb-16">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-[#071728] text-white pt-14 pb-24 px-4 sm:px-6">
        {/* Subtle grid background pattern */}
        <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px]" />

        <div className="max-w-7xl mx-auto relative z-10 space-y-10">
          <div className="text-center space-y-4 max-w-4xl mx-auto">
            {/* Govt badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-500/10 text-emerald-300 rounded-full border border-emerald-500/30 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Registered under Ministry of Corporate Affairs, Govt. of India • CIN: {foundationInfo.cin}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15]">
              Empowering India’s Future Through{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-amber-300 to-emerald-200">
                Certified Vocational Skills
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Official 3-Tier Academic Portal for <strong className="text-white">Students</strong>,{' '}
              <strong className="text-white">Franchise Partners</strong>, and{' '}
              <strong className="text-white">Central Administration</strong> featuring real-time Geo-Attendance, Online Fees Clearance, and Automated Verified Digital Certification.
            </p>
          </div>

          {/* Quick Certificate Verification Search Box in Hero */}
          <div className="max-w-xl mx-auto bg-white/10 backdrop-blur-md p-3 sm:p-4 rounded-2xl border border-white/20 shadow-2xl">
            <form onSubmit={handleQuickVerify} className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-300 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Verify Certificate ID (e.g. JSSS/2026/0527)"
                  value={quickCertQuery}
                  onChange={(e) => setQuickCertQuery(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 font-mono"
                />
              </div>
              <button
                type="submit"
                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
              >
                <span>Verify Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* 3 Main Portal Access Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            {/* Student Card */}
            <div
              onClick={() => setCurrentView('student-portal')}
              className="group bg-slate-900/90 hover:bg-slate-800/90 p-6 rounded-3xl border border-slate-700/80 hover:border-emerald-500/60 shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-5 transform hover:-translate-y-1"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">
                    1. Student Portal
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded">
                    Direct Access
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  New student registration, download ID card, online course fee payments, syllabus notes, timed mock exams & instant digital certificate download.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 pt-3 border-t border-slate-800">
                <span>Enter Student Portal</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Partner Franchise Card */}
            <div
              onClick={() => setCurrentView('partner-portal')}
              className="group bg-slate-900/90 hover:bg-slate-800/90 p-6 rounded-3xl border border-slate-700/80 hover:border-amber-500/60 shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-5 transform hover:-translate-y-1"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Briefcase className="w-6 h-6" />
                </div>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white group-hover:text-amber-300 transition-colors">
                    2. Partner Franchise
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded">
                    Training Centers
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Center franchise registration, batch creation, bulk student CSV upload, fee reconciliation, and automated instant certificate generator.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs font-bold text-amber-400 pt-3 border-t border-slate-800">
                <span>Access Partner Desk</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Super Admin Console */}
            <div
              onClick={() => setCurrentView('admin-portal')}
              className="group bg-slate-900/90 hover:bg-slate-800/90 p-6 rounded-3xl border border-slate-700/80 hover:border-cyan-500/60 shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-5 transform hover:-translate-y-1"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                    3. Super Admin Console
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-cyan-500/20 text-cyan-300 rounded">
                    Central Authority
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Approve partner KYC requests, manage master student records, configure courses/fees, monitor live Geo-attendance logs, and manage accounts.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 pt-3 border-t border-slate-800">
                <span>Open Admin Console</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. STATS & RECOGNITION HIGHLIGHTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="space-y-1">
            <span className="text-3xl sm:text-4xl font-black text-slate-900">{students.length * 125}+</span>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Students Enrolled</p>
          </div>
          <div className="space-y-1">
            <span className="text-3xl sm:text-4xl font-black text-emerald-700">{partners.length}+</span>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Authorized Centers</p>
          </div>
          <div className="space-y-1">
            <span className="text-3xl sm:text-4xl font-black text-slate-900">{courses.length}</span>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Vocational Disciplines</p>
          </div>
          <div className="space-y-1">
            <span className="text-3xl sm:text-4xl font-black text-amber-600">100%</span>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">QR Code Verified</p>
          </div>
        </div>
      </section>

      {/* 3. POPULAR COURSES SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest block">
              Skill Development Curriculum
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Featured Career Courses</h2>
          </div>
          <button
            onClick={() => setCurrentView('courses-catalog')}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
          >
            <span>View All Courses</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {courses.slice(0, 3).map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 font-mono text-xs font-bold rounded-lg border border-emerald-200">
                    {course.code}
                  </span>
                  <span className="text-xs font-bold text-slate-500">{course.duration}</span>
                </div>
                <h3 className="text-base font-extrabold text-slate-900">{course.title}</h3>
                <p className="text-xs text-slate-600 line-clamp-2">{course.description}</p>
                <div className="text-xs text-slate-500 font-medium">
                  Eligibility: <strong className="text-slate-700">{course.eligibility}</strong>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <span className="text-lg font-black text-slate-900">₹{(course.fees ?? 0).toLocaleString()}</span>
                <button
                  onClick={() => setCurrentView('student-portal')}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold"
                >
                  Enroll Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. AUTHENTIC CERTIFICATE SHOWCASE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white rounded-3xl p-8 sm:p-12 shadow-xl flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-xl">
            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-bold rounded-full border border-emerald-500/30">
              National Recognition & Trust
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Govt.-Recognized Digital Certificates with Instant QR Verification
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Every certificate issued by <strong className="text-white">{foundationInfo.legalName}</strong> is protected with unique cryptographic hashing, verifiable by employers, corporate HRs, and universities across India.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                onClick={() => setCurrentView('verify-certificate')}
                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-xs shadow-md flex items-center gap-2 transition-all cursor-pointer"
              >
                <Search className="w-4 h-4" />
                <span>Verify a Certificate</span>
              </button>
              <button
                onClick={() => setCurrentView('legal-documents')}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs border border-slate-700 transition-all flex items-center gap-2 cursor-pointer"
              >
                <FileText className="w-4 h-4 text-emerald-400" />
                <span>Statutory Registrations</span>
              </button>
            </div>
          </div>

          {/* Certificate Badge Visual */}
          <div className="p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-center space-y-3 shrink-0 max-w-xs">
            <Award className="w-16 h-16 text-amber-400 mx-auto" />
            <h4 className="font-extrabold text-sm text-white">Central Certification Registry</h4>
            <p className="text-[11px] text-slate-300">
              Authorized Signatories: <br />
              <strong>{foundationInfo.directorName}</strong> (Director) & <br />
              <strong>{foundationInfo.projectDirectorName}</strong> (Project Director)
            </p>
          </div>
        </div>
      </section>

      {/* 5. TESTIMONIAL CAROUSEL */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest">
            Success Stories & Community
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Trusted by Thousands of Students & Partners
          </h2>
        </div>

        <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-sm border border-slate-200 max-w-3xl mx-auto relative">
          <Quote className="w-12 h-12 text-emerald-100 absolute top-6 right-6 pointer-events-none" />

          <div className="space-y-4">
            <div className="flex items-center gap-1 text-amber-400">
              {[...Array(testimonials[activeTestimonial].rating)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>

            <p className="text-sm sm:text-base text-slate-700 italic leading-relaxed">
              "{testimonials[activeTestimonial].text}"
            </p>

            <div className="flex items-center gap-3 pt-2">
              <img
                src={testimonials[activeTestimonial].avatar}
                alt={testimonials[activeTestimonial].name}
                className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500"
              />
              <div>
                <h4 className="font-bold text-slate-900 text-sm">{testimonials[activeTestimonial].name}</h4>
                <p className="text-xs text-emerald-700 font-medium">{testimonials[activeTestimonial].role}</p>
                <p className="text-[11px] text-slate-400">{testimonials[activeTestimonial].center}</p>
              </div>
            </div>
          </div>

          {/* Carousel controls */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-100 mt-6">
            <div className="flex gap-1">
              {testimonials.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveTestimonial(idx)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    activeTestimonial === idx ? 'w-6 bg-emerald-600' : 'bg-slate-300'
                  }`}
                />
              ))}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() =>
                  setActiveTestimonial((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1))
                }
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() =>
                  setActiveTestimonial((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1))
                }
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 6. OFFICIAL COURSE FEE UPI QR CODE SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-md">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-full border border-emerald-200">
                <QrCode className="w-3.5 h-3.5" />
                Direct Digital Fee Payment
              </div>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-950 tracking-tight">
                Pay Your Course Fees Instantly via Google Pay / BHIM UPI
              </h2>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Students and franchise training centers can pay course fees, examination registration fees, and admission charges directly into the official bank account of <strong>{foundationInfo.legalName}</strong> without any third-party transaction charges.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Beneficiary</span>
                  <span className="text-xs font-bold text-slate-900">{foundationInfo.legalName}</span>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Official UPI ID</span>
                  <span className="text-xs font-mono font-bold text-emerald-700">{foundationInfo.upiId || '9907323533-1@okbizaxis'}</span>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap gap-3">
                <button
                  onClick={() => setIsFeeQrOpen(true)}
                  className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold rounded-2xl text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Open Interactive Payment Portal</span>
                </button>
                <button
                  onClick={() => setCurrentView('student-portal')}
                  className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-2xl text-xs transition-all flex items-center gap-2 cursor-pointer"
                >
                  <GraduationCap className="w-4 h-4 text-emerald-700" />
                  <span>Student Fee Clearance</span>
                </button>
              </div>
            </div>

            <div className="lg:col-span-5 flex justify-center">
              <OfficialUpiQrCard
                note="Course Fee - JSSS Foundation"
                compact={false}
                showActions={true}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Official Payment Modal */}
      {isFeeQrOpen && (
        <OfficialPaymentQrModal isOpen={isFeeQrOpen} onClose={() => setIsFeeQrOpen(false)} />
      )}
    </div>
  );
};
