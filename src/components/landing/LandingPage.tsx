import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Logo } from '../common/Logo';
import { OfficialUpiQrCard } from '../common/OfficialUpiQrCard';
import { OfficialPaymentQrModal } from '../common/OfficialPaymentQrModal';
import netajiPortrait from '../../assets/images/netaji_subhash_bose_1789616823600.jpg';
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
  Flame,
  Flag,
  Heart,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { setCurrentView, foundationInfo, courses, partners, certificates, students } = useApp();
  const [quickCertQuery, setQuickCertQuery] = useState('');
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [isFeeQrOpen, setIsFeeQrOpen] = useState(false);
  const [activeNetajiQuote, setActiveNetajiQuote] = useState(0);

  const netajiQuotes = [
    {
      quote: "Give me blood, and I will give you freedom!",
      subQuote: "তোমরা আমাকে রক্ত দাও, আমি তোমাদের স্বাধীনতা দেব! • तुम मुझे खून दो, मैं तुम्हें आज़ादी दूंगा!",
      context: "Historic Proclamation to the Indian National Army (Azad Hind Fauj), 1944",
      tag: "Supreme Dedication",
      accent: "from-amber-500 to-rose-500",
    },
    {
      quote: "One individual may die for an idea, but that idea will, after his death, incarnate itself in a thousand lives.",
      subQuote: "একটি আদর্শের জন্য একজন মানুষের মৃত্যু হতে পারে, কিন্তু সেই আদর্শ তার মৃত্যুর পর হাজারটি জীবনে রূপ পরিগ্রহ করবে।",
      context: "Address on Immortal Ideals, Youth Awakening & Nation-Building",
      tag: "Immortal Vision",
      accent: "from-emerald-500 to-teal-600",
    },
    {
      quote: "Freedom is not given, it is taken.",
      subQuote: "স্বাধীনতা কেউ সহজে দেয় না, তা আত্মবিশ্বাস ও সৎ সাহসে অর্জন করতে হয়।",
      context: "Call to Action for Fearless Character & Self-Determination",
      tag: "Courage & Resolution",
      accent: "from-blue-600 to-indigo-600",
    },
    {
      quote: "Never lose your faith in the destiny of India. There is no power on earth that can keep India in bondage.",
      subQuote: "ভারতের উজ্জ্বল ভবিষ্যতের উপর কখনো বিশ্বাস হারাবেন না। ভারতবর্ষ স্বমহিমায় বিশ্বে মাথা তুলে দাঁড়াবেই।",
      context: "Message to the Youth of India and the Soldiers of Freedom",
      tag: "Faith in Mother India",
      accent: "from-orange-500 to-amber-600",
    },
    {
      quote: "Life loses half its interest if there is no struggle — if there are no risks to be taken.",
      subQuote: "জীবন তার অর্ধেক সৌন্দর্য হারিয়ে ফেলে যদি সেখানে কোনো সংগ্রাম না থাকে — যদি আত্মত্যাগের সাহস না থাকে।",
      context: "Inspiring Students to Embrace Learning, Self-Reliance & Hard Work",
      tag: "Youth Empowerment",
      accent: "from-purple-600 to-pink-600",
    },
  ];

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

      {/* NETAJI SUBHASH CHANDRA BOSE TRIBUTE & INSPIRATION SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white rounded-3xl border border-amber-500/30 shadow-2xl">
          {/* Subtle Tricolor Top Accent Line */}
          <div className="h-1.5 w-full grid grid-cols-3">
            <div className="bg-[#FF9933]"></div>
            <div className="bg-white"></div>
            <div className="bg-[#138808]"></div>
          </div>

          <div className="p-6 sm:p-10 lg:p-12 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              
              {/* Left Column: Netaji Portrait & Commemorative Medal */}
              <div className="lg:col-span-5 flex flex-col items-center text-center space-y-4">
                <div className="relative group">
                  {/* Decorative Glow & Border */}
                  <div className="absolute -inset-1.5 bg-gradient-to-tr from-amber-500 via-yellow-400 to-emerald-500 rounded-3xl blur-md opacity-40 group-hover:opacity-75 transition duration-500"></div>
                  
                  <div className="relative p-2 bg-slate-900 rounded-3xl border-2 border-amber-400/60 shadow-2xl">
                    <img
                      src={netajiPortrait}
                      alt="Netaji Subhash Chandra Bose"
                      referrerPolicy="no-referrer"
                      className="w-64 h-64 sm:w-72 sm:h-72 object-cover object-top rounded-2xl shadow-inner transform group-hover:scale-[1.02] transition-transform duration-300"
                      onError={(e) => {
                        // Fallback if local asset is loading
                        (e.target as HTMLImageElement).src = '/images/netaji.jpg';
                      }}
                    />
                    
                    {/* Badge at Bottom of Portrait */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-950/90 backdrop-blur-md px-4 py-1.5 rounded-full border border-amber-400/60 shadow-lg flex items-center gap-2 whitespace-nowrap">
                      <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      <span className="text-xs font-black tracking-wider text-amber-300 uppercase">
                        Jai Hind • জয় হিন্দ
                      </span>
                    </div>
                  </div>
                </div>

                {/* Identity & Honors */}
                <div className="space-y-1 pt-1">
                  <div className="inline-flex items-center gap-1.5 px-3 py-0.5 bg-amber-500/10 border border-amber-500/30 rounded-full text-[11px] font-bold text-amber-300">
                    <Flag className="w-3 h-3 text-amber-400" />
                    <span>Deshnayak (Hero of the Nation)</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                    Netaji Subhash Chandra Bose
                  </h3>
                  <p className="text-xs font-semibold text-slate-300">
                    Leader of the Azad Hind Fauj (INA) • 1897 – 1945
                  </p>
                  <p className="text-[11px] text-emerald-300/80 max-w-sm pt-1">
                    Guiding beacon for Jeeb Seva Shib Seva Foundation's dedication to youth empowerment, self-reliance, and national service.
                  </p>
                </div>
              </div>

              {/* Right Column: Inspiring Quotes Showcase */}
              <div className="lg:col-span-7 space-y-6">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-xs font-bold text-emerald-300">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Inspirational Beacon for Youth & Nation</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-snug">
                    Immortal Words of Netaji Subhash Chandra Bose
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300">
                    Drawing inspiration from Netaji's fearless patriotism, relentless discipline, and vision of an educated, self-sufficient India.
                  </p>
                </div>

                {/* Active Quote Card */}
                <div className="relative bg-slate-900/90 backdrop-blur-md rounded-2xl p-6 sm:p-7 border border-slate-700/80 shadow-xl space-y-4">
                  <Quote className="w-10 h-10 text-amber-400/30 absolute top-4 right-4 pointer-events-none" />

                  <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/30">
                    {netajiQuotes[activeNetajiQuote].tag}
                  </div>

                  <blockquote className="text-lg sm:text-xl md:text-2xl font-black text-amber-100 leading-relaxed italic">
                    "{netajiQuotes[activeNetajiQuote].quote}"
                  </blockquote>

                  {netajiQuotes[activeNetajiQuote].subQuote && (
                    <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed border-l-2 border-emerald-500 pl-3">
                      {netajiQuotes[activeNetajiQuote].subQuote}
                    </p>
                  )}

                  <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-400">
                    <span className="font-semibold text-slate-300">
                      📍 {netajiQuotes[activeNetajiQuote].context}
                    </span>
                    <span className="text-[11px] font-mono text-emerald-400">
                      Quote {activeNetajiQuote + 1} of {netajiQuotes.length}
                    </span>
                  </div>
                </div>

                {/* Quote Selector Buttons */}
                <div className="space-y-2">
                  <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400 block">
                    Select a Quote to Read & Reflect:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {netajiQuotes.map((q, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActiveNetajiQuote(idx)}
                        className={`p-2 rounded-xl text-left text-xs font-bold transition-all border cursor-pointer flex flex-col justify-between ${
                          activeNetajiQuote === idx
                            ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md scale-102'
                            : 'bg-slate-900/70 hover:bg-slate-800 text-slate-300 border-slate-700/60'
                        }`}
                      >
                        <span className="text-[10px] opacity-75 font-mono">#{idx + 1}</span>
                        <span className="line-clamp-1 text-[11px] font-bold">{q.tag}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Foundation Core Philosophy Connection */}
                <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/20 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center shrink-0 text-emerald-400 mt-0.5">
                    <Heart className="w-4 h-4" />
                  </div>
                  <div className="text-xs text-slate-300 space-y-0.5">
                    <strong className="text-white font-bold block">
                      Our Motto: "Jeeb Seva is Shib Seva" (Service to Mankind is Service to God)
                    </strong>
                    <p className="leading-relaxed text-slate-300">
                      Guided by India's legendary heroes, JSSS Foundation bridges vocational education, practical digital skills, and ethical social responsibility for every student across the nation.
                    </p>
                  </div>
                </div>

              </div>

            </div>
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
