import React, { useState, useEffect, useMemo } from 'react';
import { Student, AttendanceRecord, FoundationDetails } from '../../types';
import {
  MapPin,
  Clock,
  Calendar,
  CalendarDays,
  CheckCircle2,
  AlertCircle,
  Printer,
  Download,
  Search,
  Filter,
  Sparkles,
  ShieldCheck,
  Award,
  Flame,
  QrCode,
  Copy,
  Check,
  Info,
  X,
  Grid,
  List,
  FileText,
  Layers,
  ChevronRight,
  ChevronLeft,
  Navigation,
} from 'lucide-react';

interface StudentAttendanceSectionProps {
  currentStudent: Student;
  foundationInfo: FoundationDetails;
}

export const StudentAttendanceSection: React.FC<StudentAttendanceSectionProps> = ({
  currentStudent,
  foundationInfo,
}) => {
  // Live IST Clock
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDateStr, setCurrentDateStr] = useState<string>('');
  const [copiedRoll, setCopiedRoll] = useState(false);

  // View Mode: 'table' | 'calendar'
  const [viewMode, setViewMode] = useState<'table' | 'calendar'>('table');

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PRESENT' | 'LATE'>('ALL');

  // Selected Attendance Slip Modal
  const [selectedSlip, setSelectedSlip] = useState<AttendanceRecord | null>(null);
  const [showFullRegisterModal, setShowFullRegisterModal] = useState(false);

  // Real-time clock interval
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
      setCurrentDateStr(
        now.toLocaleDateString('en-IN', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const copyRollNo = () => {
    navigator.clipboard.writeText(currentStudent.regNo);
    setCopiedRoll(true);
    setTimeout(() => setCopiedRoll(false), 2500);
  };

  // Today's date string YYYY-MM-DD
  const todayStr = new Date().toISOString().split('T')[0];
  const todayRecord = currentStudent.attendanceHistory.find((a) => a.date === todayStr);

  // Statistics calculation
  const totalRecords = currentStudent.attendanceHistory.length;
  const presentCount = currentStudent.attendanceHistory.filter((a) => a.status === 'PRESENT').length;
  const lateCount = currentStudent.attendanceHistory.filter((a) => a.status === 'LATE').length;
  const attendanceRate = totalRecords > 0 ? Math.round((presentCount / totalRecords) * 100) : 100;
  const isEligibleForExam = attendanceRate >= 75;

  // Streak calculation (consecutive present sessions)
  const sortedByDateDesc = useMemo(() => {
    return [...currentStudent.attendanceHistory].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [currentStudent.attendanceHistory]);

  let streak = 0;
  for (const rec of sortedByDateDesc) {
    if (rec.status === 'PRESENT' || rec.status === 'LATE') {
      streak++;
    } else {
      break;
    }
  }

  // Filtered attendance records
  const filteredRecords = useMemo(() => {
    return sortedByDateDesc.filter((record) => {
      // Search term
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchNo = (record.attendanceNo || record.id).toLowerCase().includes(term);
        const matchDate = record.date.toLowerCase().includes(term);
        const matchSession = (record.sessionName || '').toLowerCase().includes(term);
        const matchAddress = (record.locationAddress || '').toLowerCase().includes(term);
        if (!matchNo && !matchDate && !matchSession && !matchAddress) {
          return false;
        }
      }

      // Month filter
      if (selectedMonth !== 'ALL') {
        const recordMonth = record.date.slice(0, 7); // YYYY-MM
        if (recordMonth !== selectedMonth) {
          return false;
        }
      }

      // Status filter
      if (statusFilter !== 'ALL' && record.status !== statusFilter) {
        return false;
      }

      return true;
    });
  }, [sortedByDateDesc, searchTerm, selectedMonth, statusFilter]);

  // Extract available months for dropdown filter
  const availableMonths = useMemo(() => {
    const monthsSet = new Set<string>();
    currentStudent.attendanceHistory.forEach((a) => {
      monthsSet.add(a.date.slice(0, 7));
    });
    return Array.from(monthsSet).sort().reverse();
  }, [currentStudent.attendanceHistory]);

  return (
    <div className="space-y-6">
      {/* 1. ACADEMIC IDENTIFICATION & ATTENDANCE SECTION PROFILE HEADER */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Official Biometric & GPS Attendance Register
              </span>
              <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-semibold">
                Academic Year 2025–2026
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>{currentStudent.name}</span>
              <span className="text-sm font-semibold text-slate-400">|</span>
              <span className="text-sm font-bold text-emerald-700">{currentStudent.courseName}</span>
            </h2>

            <p className="text-xs text-slate-500 flex flex-wrap items-center gap-x-4 gap-y-1">
              <span>Center: <strong>{currentStudent.partnerName}</strong></span>
              <span>•</span>
              <span>Batch: <strong>{currentStudent.batchName || 'Batch-A (Morning Regular)'}</strong></span>
              <span>•</span>
              <span>Total Class Hours: <strong>120 Hours</strong></span>
            </p>
          </div>

          {/* Roll No / Reg No Badge with 1-Click Copy */}
          <div className="w-full sm:w-auto p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between sm:justify-start gap-4 shrink-0">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                Student Roll No / Reg No
              </span>
              <span className="font-mono text-base font-black text-emerald-800 tracking-wide">
                {currentStudent.regNo}
              </span>
            </div>
            <button
              onClick={copyRollNo}
              title="Copy Registration Number"
              className="p-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-1.5 text-xs font-bold"
            >
              {copiedRoll ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700 text-[11px]">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-500" />
                  <span className="text-[11px]">Copy No</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 2. ATTENDANCE METRICS & ELIGIBILITY COUNTERS (4 CARDS) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-6">
          {/* Total Sessions */}
          <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
              <CalendarDays className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Total Sessions
              </span>
              <span className="text-2xl font-black text-slate-900 leading-tight">
                {totalRecords}
              </span>
              <span className="text-[10px] text-slate-500 block">Academic logs</span>
            </div>
          </div>

          {/* Present Sessions */}
          <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200/80 flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
                Total Present
              </span>
              <span className="text-2xl font-black text-emerald-950 leading-tight">
                {presentCount} <span className="text-xs font-semibold text-emerald-700">({attendanceRate}%)</span>
              </span>
              <span className="text-[10px] text-emerald-700 block">
                {lateCount > 0 ? `${lateCount} Late Markings` : 'All On-Time'}
              </span>
            </div>
          </div>

          {/* Streak */}
          <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200/80 flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">
                Active Streak
              </span>
              <span className="text-2xl font-black text-amber-950 leading-tight">
                {streak} Days
              </span>
              <span className="text-[10px] text-amber-700 block">Consecutive punches</span>
            </div>
          </div>

          {/* Exam & Certificate Eligibility */}
          <div
            className={`p-4 rounded-2xl border flex items-center gap-3.5 ${
              isEligibleForExam
                ? 'bg-emerald-50/80 border-emerald-300'
                : 'bg-rose-50/80 border-rose-300'
            }`}
          >
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                isEligibleForExam
                  ? 'bg-emerald-600 text-white'
                  : 'bg-rose-600 text-white'
              }`}
            >
              <Award className="w-5 h-5" />
            </div>
            <div>
              <span
                className={`text-[10px] font-extrabold uppercase tracking-wider block ${
                  isEligibleForExam ? 'text-emerald-900' : 'text-rose-900'
                }`}
              >
                Certification Rule
              </span>
              <span
                className={`text-xs font-black uppercase tracking-tight block ${
                  isEligibleForExam ? 'text-emerald-800' : 'text-rose-800'
                }`}
              >
                {isEligibleForExam ? '✓ Exam Eligible' : '⚠ Deficit (<75%)'}
              </span>
              <span className="text-[10px] text-slate-500 block">
                Min 75% for certificate
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. OFFICIAL INSTITUTIONAL ATTENDANCE REGISTER STATUS */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl relative overflow-hidden">
        {/* Ambient background decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 border border-emerald-500/40 rounded-full text-[11px] font-bold text-emerald-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Center-Managed Academic Attendance Roster</span>
            </div>

            <div>
              <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Official Attendance Register
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed max-w-xl">
                Attendance is maintained and certified directly by authorized faculty at <strong>{currentStudent.partnerName}</strong>. All practical laboratory sessions and lecture hours are officially recorded in the JSSS Foundation academic registry.
              </p>
            </div>

            {/* Real-time Clock & Academic Date */}
            <div className="flex flex-wrap items-center gap-4 pt-1">
              <div className="p-3.5 bg-slate-900/90 rounded-2xl border border-slate-800 flex items-center gap-3">
                <Clock className="w-5 h-5 text-emerald-400" />
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Indian Standard Time</span>
                  <span className="font-mono text-lg font-bold text-white tracking-wide">
                    {currentTime || '10:00:00 AM'}
                  </span>
                </div>
              </div>

              <div className="p-3.5 bg-slate-900/90 rounded-2xl border border-slate-800 flex items-center gap-3">
                <Calendar className="w-5 h-5 text-emerald-400" />
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Today's Academic Session</span>
                  <span className="text-xs font-bold text-slate-200">
                    {currentDateStr || 'Academic Session 2025-2026'}
                  </span>
                </div>
              </div>
            </div>

            {/* Attendance Compliance Status */}
            <div className="pt-1">
              {todayRecord ? (
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-emerald-500/20 border border-emerald-400/40 rounded-xl text-xs font-bold text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>
                    Today's Session Recorded at {todayRecord.time} by Center Faculty ({todayRecord.status})
                  </span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs font-bold text-slate-300">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>Today's session roster managed directly by center instructor</span>
                </div>
              )}
            </div>
          </div>

          {/* Academic Verification Summary Box */}
          <div className="lg:col-span-5 flex flex-col justify-between p-6 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Attendance Standing</span>
                <h4 className="font-bold text-white text-base mt-0.5">Faculty Certified Roster</h4>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                isEligibleForExam ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}>
                {attendanceRate}% Attended
              </span>
            </div>

            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Total Course Duration:</span>
                <span className="font-medium text-white">120 Class Hours</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Attended Sessions:</span>
                <span className="font-bold text-emerald-400">{currentStudent.attendanceHistory.length} Days / 96 Hours</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Exam Eligibility Rule:</span>
                <span className="font-medium text-white">Min 75% Required</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Registry Sync:</span>
                <span className="font-mono text-emerald-300 text-[11px]">Central Server Synced ✓</span>
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                onClick={() => setShowFullRegisterModal(true)}
                className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Official Register</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. FILTER, SEARCH & VIEW MODE TOOLBAR */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Attendance No (e.g. ATT-0527), Date, or Session..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
            >
              Clear
            </button>
          )}
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Month Filter */}
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-700"
          >
            <option value="ALL">All Months</option>
            {availableMonths.map((m) => (
              <option key={m} value={m}>
                {new Date(`${m}-01`).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-700"
          >
            <option value="ALL">All Status</option>
            <option value="PRESENT">Present Only</option>
            <option value="LATE">Late Only</option>
          </select>

          {/* View Toggle: Table vs Calendar */}
          <div className="p-1 bg-slate-100 rounded-xl flex items-center border border-slate-200">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Log Table</span>
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'calendar'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Calendar</span>
            </button>
          </div>

          {/* Print / Download Register Button */}
          <button
            onClick={() => setShowFullRegisterModal(true)}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Register</span>
          </button>
        </div>
      </div>

      {/* 5. VIEW MODE A: ATTENDANCE RECORDS LOG TABLE */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600" />
                <span>Attendance Log Records</span>
                <span className="px-2 py-0.5 bg-slate-200 text-slate-800 rounded-full text-[10px] font-extrabold">
                  {filteredRecords.length} Sessions Listed
                </span>
              </h3>
            </div>
            <div className="text-xs font-semibold text-slate-500">
              Student Reg: <span className="font-mono text-emerald-800 font-bold">{currentStudent.regNo}</span>
            </div>
          </div>

          {filteredRecords.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-xs space-y-3">
              <CalendarDays className="w-10 h-10 mx-auto text-slate-300" />
              <p className="font-medium text-slate-600">No attendance records found matching your filters.</p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedMonth('ALL');
                  setStatusFilter('ALL');
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 text-slate-600 font-bold uppercase text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-3.5">Sl No</th>
                    <th className="px-5 py-3.5">Attendance No</th>
                    <th className="px-5 py-3.5">Date & Day</th>
                    <th className="px-5 py-3.5">Punch Time</th>
                    <th className="px-5 py-3.5">Academic Session / Curriculum</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5">Geo-Location & Map Pin</th>
                    <th className="px-5 py-3.5">Verification</th>
                    <th className="px-5 py-3.5 text-right">Official Slip</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
                  {filteredRecords.map((att, idx) => {
                    const sessionNum = filteredRecords.length - idx;
                    const sessionNumStr = sessionNum < 10 ? `0${sessionNum}` : `${sessionNum}`;
                    const formattedDate = new Date(att.date).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      weekday: 'short',
                    });

                    return (
                      <tr key={att.id} className="hover:bg-slate-50/80 transition-colors">
                        {/* Sl No */}
                        <td className="px-5 py-4 font-mono font-bold text-slate-400 text-xs">
                          #{sessionNumStr}
                        </td>

                        {/* Attendance Log No */}
                        <td className="px-5 py-4">
                          <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50/80 px-2 py-0.5 rounded-md border border-emerald-100">
                            {att.attendanceNo || `ATT-2026-${att.id.slice(-4)}`}
                          </span>
                        </td>

                        {/* Date & Day */}
                        <td className="px-5 py-4 font-bold text-slate-900 whitespace-nowrap">
                          {formattedDate}
                        </td>

                        {/* Punch Time */}
                        <td className="px-5 py-4 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                          {att.time}
                        </td>

                        {/* Academic Session */}
                        <td className="px-5 py-4 text-slate-700 max-w-xs">
                          <span className="font-medium text-xs block truncate">
                            {att.sessionName || 'Regular Course Session & Practicum'}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            Batch: {currentStudent.batchName || 'Regular'}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide inline-flex items-center gap-1 ${
                              att.status === 'PRESENT'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                att.status === 'PRESENT' ? 'bg-emerald-600' : 'bg-amber-600'
                              }`}
                            />
                            {att.status}
                          </span>
                        </td>

                        {/* Geo-Location */}
                        <td className="px-5 py-4 text-xs max-w-xs">
                          <div className="flex items-start gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <div>
                              <span className="text-[11px] text-slate-700 block truncate font-medium">
                                {att.locationAddress || 'Academy Training Center'}
                              </span>
                              <span className="text-[10px] font-mono text-slate-400 block">
                                Lat: {att.latitude?.toFixed(4)}°, Long: {att.longitude?.toFixed(4)}°
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Verification */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-semibold block">
                            {att.markedBy === 'STUDENT_SELF' ? 'GPS Mobile Auth' : 'Partner Biometric'}
                          </span>
                          <span className="text-[9px] text-emerald-700 font-bold block mt-0.5">
                            ✓ Verified (±{att.accuracy || 10}m)
                          </span>
                        </td>

                        {/* Action: View Slip */}
                        <td className="px-5 py-4 text-right whitespace-nowrap">
                          <button
                            onClick={() => setSelectedSlip(att)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-lg text-xs font-bold transition-all cursor-pointer"
                          >
                            <Printer className="w-3 h-3 text-slate-600" />
                            <span>View Slip</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 5. VIEW MODE B: MONTHLY CALENDAR GRID VIEW */}
      {viewMode === 'calendar' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-600" />
                September 2026 Academic Calendar View
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Color-coded calendar displaying daily student attendance presence and punch timestamps
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-slate-600 font-medium">Present</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="text-slate-600 font-medium">Late</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-slate-200" />
                <span className="text-slate-600 font-medium">Weekend / Off</span>
              </div>
            </div>
          </div>

          {/* 7-column Calendar Grid for September 2026 */}
          <div className="grid grid-cols-7 gap-2 sm:gap-3 text-center">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                {day}
              </div>
            ))}

            {/* Empty offset days for Sep 2026 (Sep 1, 2026 was a Tuesday, so 2 blank days) */}
            <div className="h-20 sm:h-24 bg-slate-50/40 rounded-2xl border border-dashed border-slate-200" />
            <div className="h-20 sm:h-24 bg-slate-50/40 rounded-2xl border border-dashed border-slate-200" />

            {/* Days 1 to 30 */}
            {Array.from({ length: 30 }, (_, i) => i + 1).map((dayNum) => {
              const dayStr = dayNum < 10 ? `0${dayNum}` : `${dayNum}`;
              const fullDateStr = `2026-09-${dayStr}`;
              const matchRecord = currentStudent.attendanceHistory.find((a) => a.date === fullDateStr);

              // Check if Sunday (dayNum % 7 === 6 for September 2026 with Tuesday start)
              const isSunday = (dayNum + 1) % 7 === 0;

              return (
                <div
                  key={dayNum}
                  onClick={() => matchRecord && setSelectedSlip(matchRecord)}
                  className={`h-20 sm:h-24 p-2 rounded-2xl border flex flex-col justify-between text-left transition-all ${
                    matchRecord
                      ? 'bg-emerald-50/60 border-emerald-300 hover:border-emerald-500 hover:shadow-md cursor-pointer'
                      : isSunday
                      ? 'bg-slate-50/60 border-slate-200/80 text-slate-400'
                      : 'bg-white border-slate-200 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold">{dayNum}</span>
                    {matchRecord && (
                      <span
                        className={`text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase ${
                          matchRecord.status === 'PRESENT'
                            ? 'bg-emerald-200 text-emerald-900'
                            : 'bg-amber-200 text-amber-900'
                        }`}
                      >
                        {matchRecord.status === 'PRESENT' ? 'P' : 'L'}
                      </span>
                    )}
                  </div>

                  {matchRecord ? (
                    <div className="mt-1">
                      <span className="text-[10px] font-mono text-emerald-800 font-bold block truncate">
                        {matchRecord.time}
                      </span>
                      <span className="text-[9px] text-slate-500 block truncate">
                        {matchRecord.attendanceNo || 'ATT-LOG'}
                      </span>
                    </div>
                  ) : isSunday ? (
                    <span className="text-[10px] text-slate-400 italic">Sunday Off</span>
                  ) : (
                    <span className="text-[10px] text-slate-300">No session</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 6. INDIVIDUAL OFFICIAL ATTENDANCE SLIP MODAL */}
      {selectedSlip && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden relative my-8">
            {/* Action buttons header */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold">
                <FileText className="w-4 h-4 text-emerald-400" />
                <span>Official Attendance Verification Voucher</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Slip</span>
                </button>
                <button
                  onClick={() => setSelectedSlip(null)}
                  className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Voucher Body */}
            <div className="p-6 sm:p-8 space-y-6 text-slate-800 bg-slate-50/40">
              {/* Foundation Header */}
              <div className="text-center space-y-1 pb-4 border-b-2 border-emerald-600">
                <h3 className="text-base font-black text-slate-900 tracking-tight">
                  {foundationInfo.legalName}
                </h3>
                <p className="text-[10px] text-slate-600 font-semibold">
                  (Registered under Section 8, Ministry of Corporate Affairs, Govt. of India | CIN: {foundationInfo.cin})
                </p>
                <p className="text-[10px] text-slate-500">
                  Head Office: {foundationInfo.kolkataOffice} | Contact: {foundationInfo.contactNumbers[0]}
                </p>
                <div className="inline-block mt-1 px-3 py-0.5 bg-emerald-100 text-emerald-900 font-extrabold text-[10px] rounded-full uppercase tracking-wider">
                  Verified Biometric & GPS Attendance Slip
                </div>
              </div>

              {/* Voucher Meta Grid */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-white rounded-2xl border border-slate-200 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Slip No. / Log ID</span>
                  <span className="font-mono font-bold text-emerald-800">
                    {selectedSlip.attendanceNo || `ATT-2026-${selectedSlip.id.slice(-4)}`}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Punch Timestamp</span>
                  <span className="font-bold text-slate-900">
                    {selectedSlip.date} at {selectedSlip.time}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Student Name</span>
                  <span className="font-bold text-slate-900">{currentStudent.name}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Roll No / Reg No</span>
                  <span className="font-mono font-bold text-slate-900">{currentStudent.regNo}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Course & Curriculum</span>
                  <span className="font-medium text-slate-800">{currentStudent.courseName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Batch & Section</span>
                  <span className="font-medium text-slate-800">
                    {currentStudent.batchName || 'Section-A (Regular)'}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Training Center / Partner</span>
                  <span className="font-medium text-slate-800">{currentStudent.partnerName}</span>
                </div>
              </div>

              {/* Geolocation & Verification Section */}
              <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-900 text-xs flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                    GPS Satellite Geofence Authentication
                  </span>
                  <span className="px-2 py-0.5 bg-emerald-200 text-emerald-900 font-black text-[10px] rounded-md uppercase">
                    Status: {selectedSlip.status}
                  </span>
                </div>
                <p className="text-[11px] text-slate-700 leading-relaxed">
                  <strong>Location:</strong> {selectedSlip.locationAddress}
                </p>
                <div className="text-[10px] font-mono text-slate-500 flex flex-wrap items-center gap-4">
                  <span>Lat: {selectedSlip.latitude?.toFixed(4)}° N</span>
                  <span>Long: {selectedSlip.longitude?.toFixed(4)}° E</span>
                  <span>Accuracy: ±{selectedSlip.accuracy || 10} meters</span>
                  <span>Mode: {selectedSlip.markedBy}</span>
                </div>
              </div>

              {/* Signatures & Official Stamp */}
              <div className="flex items-end justify-between pt-6 border-t border-slate-200 text-xs">
                <div className="text-center">
                  <div className="font-serif italic font-bold text-slate-800 text-sm">Soumen Ghosh</div>
                  <div className="h-0.5 w-24 bg-slate-400 mx-auto my-1" />
                  <span className="text-[10px] text-slate-500 font-semibold block">Director</span>
                  <span className="text-[9px] text-slate-400 font-mono">JSSS Foundation</span>
                </div>

                {/* QR Code */}
                <div className="p-2 bg-white rounded-xl border border-slate-200 text-center shadow-xs">
                  <div className="w-16 h-16 bg-slate-900 text-white flex items-center justify-center rounded-lg mx-auto p-1">
                    <QrCode className="w-12 h-12 text-emerald-400" />
                  </div>
                  <span className="text-[8px] font-mono text-slate-400 block mt-1">
                    SCAN TO VERIFY
                  </span>
                </div>

                <div className="text-center">
                  <div className="font-serif italic font-bold text-slate-800 text-sm">Subrata Roy</div>
                  <div className="h-0.5 w-24 bg-slate-400 mx-auto my-1" />
                  <span className="text-[10px] text-slate-500 font-semibold block">Project Director</span>
                  <span className="text-[9px] text-slate-400 font-mono">JSSS Foundation</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. FULL OFFICIAL ATTENDANCE REGISTER PRINT MODAL */}
      {showFullRegisterModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden relative my-8">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold">
                <Printer className="w-4 h-4 text-emerald-400" />
                <span>Complete Official Student Attendance Register Sheet</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Complete Sheet</span>
                </button>
                <button
                  onClick={() => setShowFullRegisterModal(false)}
                  className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-8 space-y-6 text-slate-800 bg-white">
              {/* Foundation Banner */}
              <div className="text-center pb-4 border-b-2 border-emerald-600 space-y-1">
                <h3 className="text-xl font-black text-slate-900">{foundationInfo.legalName}</h3>
                <p className="text-xs text-slate-600">
                  Govt. of India Section 8 Non-Profit Organization | CIN: {foundationInfo.cin}
                </p>
                <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                  Official Academic Attendance Register (Form JSSS-ATT-01)
                </p>
              </div>

              {/* Student Summary Table */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-400 font-bold block">Candidate:</span>
                  <strong className="text-slate-900">{currentStudent.name}</strong>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block">Roll / Reg No:</span>
                  <strong className="font-mono text-emerald-800">{currentStudent.regNo}</strong>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block">Course:</span>
                  <strong className="text-slate-900">{currentStudent.courseName}</strong>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block">Attendance Rate:</span>
                  <strong className="text-emerald-700">{attendanceRate}% ({presentCount}/{totalRecords} Days)</strong>
                </div>
              </div>

              {/* All Records Table */}
              <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 font-bold uppercase text-[10px] text-slate-700">
                    <tr>
                      <th className="p-3">Sl</th>
                      <th className="p-3">Attendance No</th>
                      <th className="p-3">Date</th>
                      <th className="p-3">Time</th>
                      <th className="p-3">Curriculum Topic</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">GPS Location</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-medium">
                    {sortedByDateDesc.map((rec, i) => (
                      <tr key={rec.id}>
                        <td className="p-3 font-mono font-bold text-slate-400">#{i + 1}</td>
                        <td className="p-3 font-mono text-emerald-800 font-bold">{rec.attendanceNo || rec.id}</td>
                        <td className="p-3 font-bold">{rec.date}</td>
                        <td className="p-3 font-mono">{rec.time}</td>
                        <td className="p-3">{rec.sessionName || 'Academic Lecture'}</td>
                        <td className="p-3 font-bold text-emerald-800">{rec.status}</td>
                        <td className="p-3 font-mono text-[10px]">{rec.latitude?.toFixed(4)}, {rec.longitude?.toFixed(4)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Signature Footer */}
              <div className="flex justify-between items-end pt-8 border-t border-slate-200 text-xs">
                <div className="text-center">
                  <p className="font-bold font-serif italic text-sm">{foundationInfo.directorName}</p>
                  <p className="text-[10px] text-slate-500">Director, JSSS Foundation</p>
                </div>
                <div className="text-center text-[10px] text-slate-400 font-mono">
                  Official Verification Seal & Cryptographic Stamp
                </div>
                <div className="text-center">
                  <p className="font-bold font-serif italic text-sm">{foundationInfo.projectDirectorName}</p>
                  <p className="text-[10px] text-slate-500">Project Director, JSSS Foundation</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
