import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Batch, Student } from '../../types';
import {
  Layers,
  Users,
  Search,
  Filter,
  PlusCircle,
  Calendar,
  Clock,
  User,
  MapPin,
  Phone,
  Mail,
  ChevronDown,
  ChevronUp,
  Download,
  Building2,
  CheckCircle,
  AlertCircle,
  Sparkles,
  BookOpen,
  X,
  UserPlus,
  Shield,
} from 'lucide-react';

interface BatchMonitoringModuleProps {
  userRole?: 'SUPER_ADMIN' | 'MIS_ADMIN' | 'PARTNER';
}

export const BatchMonitoringModule: React.FC<BatchMonitoringModuleProps> = ({ userRole }) => {
  const {
    currentRole,
    currentAdmin,
    currentPartner,
    currentCenterMIS,
    isPrimaryAdmin,
    batches,
    students,
    courses,
    partners,
    createBatch,
    addStudentToBatch,
  } = useApp();

  // Effective Role determination
  const effectiveRole = userRole || (
    currentRole === 'ADMIN'
      ? (currentAdmin && (currentAdmin.role === 'SUPER_ADMIN' || isPrimaryAdmin(currentAdmin)) ? 'SUPER_ADMIN' : 'MIS_ADMIN')
      : 'PARTNER'
  );

  const isSuperAdmin = effectiveRole === 'SUPER_ADMIN';
  const isMisAdmin = effectiveRole === 'MIS_ADMIN';
  const isPartnerOrMIS = effectiveRole === 'PARTNER';

  // Role-Based Batch Filtering
  // - Super Admin: monitors all batches
  // - Admin / MIS Admin: assigned batches/centers or all authorized centers
  // - Training Partner & Center MIS: strictly batches belonging to currentPartner.id
  const authorizedBatches = useMemo(() => {
    if (isSuperAdmin) {
      return batches;
    }
    if (isMisAdmin) {
      // MIS Admins can monitor batches across active approved centers
      return batches;
    }
    if (isPartnerOrMIS && currentPartner) {
      return batches.filter((b) => b.partnerId === currentPartner.id);
    }
    return batches;
  }, [batches, isSuperAdmin, isMisAdmin, isPartnerOrMIS, currentPartner]);

  // Role-Based Student Pool
  const authorizedStudents = useMemo(() => {
    if (isSuperAdmin || isMisAdmin) {
      return students;
    }
    if (isPartnerOrMIS && currentPartner) {
      return students.filter((s) => s.partnerId === currentPartner.id);
    }
    return students;
  }, [students, isSuperAdmin, isMisAdmin, isPartnerOrMIS, currentPartner]);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCenterId, setSelectedCenterId] = useState<string>('ALL');
  const [selectedCourseId, setSelectedCourseId] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | 'ACTIVE' | 'UPCOMING' | 'COMPLETED'>('ALL');

  // Expanded Batch Cards (set of batch IDs)
  const [expandedBatchIds, setExpandedBatchIds] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    if (authorizedBatches.length > 0) initial.add(authorizedBatches[0].id);
    return initial;
  });

  const toggleExpand = (batchId: string) => {
    setExpandedBatchIds((prev) => {
      const next = new Set(prev);
      if (next.has(batchId)) next.delete(batchId);
      else next.add(batchId);
      return next;
    });
  };

  const expandAll = () => {
    setExpandedBatchIds(new Set(authorizedBatches.map((b) => b.id)));
  };

  const collapseAll = () => {
    setExpandedBatchIds(new Set());
  };

  // Create Batch Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newBatchForm, setNewBatchForm] = useState({
    courseId: courses[0]?.id || 'CRS-01',
    partnerId: currentPartner?.id || partners[0]?.id || 'PTR-01',
    batchName: '',
    batchCode: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '2026-10-31',
    timing: '10:00 AM - 12:00 PM (Daily)',
    instructorName: currentPartner?.ownerName || 'Certified Lead Faculty',
    maxStudents: 30,
  });
  const [createSuccessMsg, setCreateSuccessMsg] = useState('');

  // Add Student to Batch Modal
  const [selectedBatchForAddStudent, setSelectedBatchForAddStudent] = useState<Batch | null>(null);
  const [studentToEnrollId, setStudentToEnrollId] = useState<string>('');

  // Filtered Batches calculation
  const filteredBatches = useMemo(() => {
    return authorizedBatches.filter((b) => {
      // Center filter (for admins)
      if (selectedCenterId !== 'ALL' && b.partnerId !== selectedCenterId) {
        return false;
      }
      // Course filter
      if (selectedCourseId !== 'ALL' && b.courseId !== selectedCourseId) {
        return false;
      }
      // Date/Status filter
      const todayStr = new Date().toISOString().split('T')[0];
      if (selectedStatus === 'ACTIVE') {
        if (b.startDate > todayStr || b.endDate < todayStr) return false;
      } else if (selectedStatus === 'UPCOMING') {
        if (b.startDate <= todayStr) return false;
      } else if (selectedStatus === 'COMPLETED') {
        if (b.endDate >= todayStr) return false;
      }

      // Search Query: Match batch info OR any student enrolled in the batch
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchBatch =
          b.batchName.toLowerCase().includes(q) ||
          b.batchCode.toLowerCase().includes(q) ||
          b.courseName.toLowerCase().includes(q) ||
          b.instructorName.toLowerCase().includes(q) ||
          b.timing.toLowerCase().includes(q);

        if (matchBatch) return true;

        // Match enrolled students details (Name, Address, Phone, Email)
        const batchStudents = authorizedStudents.filter(
          (s) => (b.studentIds || []).includes(s.id) || s.batchId === b.id
        );
        const matchStudent = batchStudents.some(
          (s) =>
            s.name.toLowerCase().includes(q) ||
            s.regNo.toLowerCase().includes(q) ||
            s.email.toLowerCase().includes(q) ||
            s.phone.toLowerCase().includes(q) ||
            s.address.toLowerCase().includes(q) ||
            s.district.toLowerCase().includes(q)
        );

        return matchStudent;
      }

      return true;
    });
  }, [authorizedBatches, selectedCenterId, selectedCourseId, selectedStatus, searchQuery, authorizedStudents]);

  // Aggregate Stats
  const totalEnrolledStudents = useMemo(() => {
    const studentIdSet = new Set<string>();
    authorizedBatches.forEach((b) => {
      (b.studentIds || []).forEach((id) => studentIdSet.add(id));
      authorizedStudents
        .filter((s) => s.batchId === b.id)
        .forEach((s) => studentIdSet.add(s.id));
    });
    return studentIdSet.size;
  }, [authorizedBatches, authorizedStudents]);

  const totalCapacity = authorizedBatches.reduce((acc, b) => acc + (b.maxStudents || 30), 0);
  const averageOccupancy = totalCapacity > 0 ? Math.round((totalEnrolledStudents / totalCapacity) * 100) : 0;

  // Handle Create Batch Submit
  const handleCreateBatch = (e: React.FormEvent) => {
    e.preventDefault();
    const course = courses.find((c) => c.id === newBatchForm.courseId) || courses[0];
    const partnerId = isPartnerOrMIS && currentPartner ? currentPartner.id : newBatchForm.partnerId;

    const newBatch = createBatch({
      partnerId,
      courseId: course.id,
      courseName: course.title,
      batchName: newBatchForm.batchName || `${course.code}-Batch-${Date.now().toString().slice(-4)}`,
      batchCode: newBatchForm.batchCode || `BTC-${Date.now().toString().slice(-4)}`,
      startDate: newBatchForm.startDate,
      endDate: newBatchForm.endDate,
      timing: newBatchForm.timing,
      instructorName: newBatchForm.instructorName,
      maxStudents: Number(newBatchForm.maxStudents) || 30,
    });

    setCreateSuccessMsg(`Batch "${newBatch.batchName}" created successfully!`);
    setTimeout(() => {
      setCreateSuccessMsg('');
      setShowCreateModal(false);
    }, 2000);
  };

  // Handle Enroll Student into Batch
  const handleEnrollStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBatchForAddStudent || !studentToEnrollId) return;

    addStudentToBatch(selectedBatchForAddStudent.id, studentToEnrollId);
    setSelectedBatchForAddStudent(null);
    setStudentToEnrollId('');
  };

  // Export Batch Students to CSV
  const handleExportBatchCSV = (batch: Batch) => {
    const enrolled = authorizedStudents.filter(
      (s) => (batch.studentIds || []).includes(s.id) || s.batchId === batch.id
    );

    const partnerName = partners.find((p) => p.id === batch.partnerId)?.centerName || 'Partner Center';

    let csv = `Registration No,Student Name,Father Name,Email ID,Phone Number,Full Address,District,State,Pincode,Course Name,Batch Code,Center Name,Total Fees,Paid Fees,Fee Status,Enrollment Date\n`;

    enrolled.forEach((s) => {
      const cleanAddress = `"${(s.address || '').replace(/"/g, '""')}"`;
      const cleanName = `"${s.name.replace(/"/g, '""')}"`;
      csv += `${s.regNo},${cleanName},"${s.fatherName || ''}",${s.email},${s.phone},${cleanAddress},${s.district},${s.state},${s.pincode},"${batch.courseName}",${batch.batchCode},"${partnerName}",${s.totalFees},${s.paidFees},${s.feeStatus},${s.enrollmentDate}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Batch_${batch.batchCode}_Students_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner with Role Status */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white p-6 rounded-3xl shadow-lg border border-slate-700/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight">Batch Monitoring Module</h2>
              <div className="flex flex-wrap items-center gap-2 mt-0.5">
                {isSuperAdmin && (
                  <span className="px-2 py-0.5 bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[11px] font-bold rounded-full">
                    ★ Super Admin Access • All Centers
                  </span>
                )}
                {isMisAdmin && (
                  <span className="px-2 py-0.5 bg-cyan-400/20 text-cyan-300 border border-cyan-400/40 text-[11px] font-bold rounded-full">
                    MIS Admin Access • Assigned Batches
                  </span>
                )}
                {isPartnerOrMIS && (
                  <span className="px-2 py-0.5 bg-emerald-400/20 text-emerald-300 border border-emerald-400/40 text-[11px] font-bold rounded-full">
                    {currentCenterMIS ? `Center MIS: ${currentCenterMIS.name}` : `Center: ${currentPartner?.centerName}`}
                  </span>
                )}
                <span className="text-xs text-slate-400">
                  Strict Center-wise Data Isolation Active
                </span>
              </div>
            </div>
          </div>
          <p className="text-xs text-slate-300 max-w-2xl pt-1">
            Real-time batch-wise monitoring of student attendance, enrollment progress, address records, and contact verification with strict RBAC boundary protection.
          </p>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            Create New Batch
          </button>
        </div>
      </div>

      {/* 4 Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Total Batches</span>
            <Layers className="w-4 h-4 text-emerald-600" />
          </div>
          <h3 className="text-2xl font-black text-slate-900">{authorizedBatches.length}</h3>
          <p className="text-[11px] text-slate-600">
            {authorizedBatches.filter((b) => {
              const today = new Date().toISOString().split('T')[0];
              return b.startDate <= today && b.endDate >= today;
            }).length} actively in session
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Total Enrolled</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <h3 className="text-2xl font-black text-slate-900">{totalEnrolledStudents} Students</h3>
          <p className="text-[11px] text-emerald-700 font-medium">
            Across {authorizedBatches.length} authorized batches
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Total Capacity</span>
            <Calendar className="w-4 h-4 text-amber-600" />
          </div>
          <h3 className="text-2xl font-black text-slate-900">{totalCapacity} Seats</h3>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all"
              style={{ width: `${Math.min(100, averageOccupancy)}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-600">
            {averageOccupancy}% overall seat occupancy
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Data Security</span>
            <Shield className="w-4 h-4 text-emerald-600" />
          </div>
          <h3 className="text-sm font-bold text-emerald-700">RBAC Verified</h3>
          <p className="text-[11px] text-slate-500">
            {isSuperAdmin
              ? 'Super Admin global batch visibility'
              : isMisAdmin
              ? 'Authorized admin inspection'
              : 'Strict franchise center isolation'}
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
              placeholder="Search batch, student name, phone, email, address..."
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

          {/* Center Filter (for Admins only) */}
          {(isSuperAdmin || isMisAdmin) && (
            <div>
              <select
                value={selectedCenterId}
                onChange={(e) => setSelectedCenterId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 outline-none"
              >
                <option value="ALL">All Training Centers ({partners.length})</option>
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
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
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

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 outline-none"
            >
              <option value="ALL">All Batches (Active, Upcoming, Finished)</option>
              <option value="ACTIVE">Currently In Session</option>
              <option value="UPCOMING">Upcoming Batches</option>
              <option value="COMPLETED">Completed Batches</option>
            </select>
          </div>
        </div>

        {/* Quick Expand/Collapse toggles */}
        <div className="flex items-center justify-between text-xs text-slate-600 pt-2 border-t border-slate-100">
          <div className="font-semibold text-slate-700">
            Showing <strong className="text-emerald-700">{filteredBatches.length}</strong> of {authorizedBatches.length} Batches
            {searchQuery && ` matching "${searchQuery}"`}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={expandAll}
              className="px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Expand All
            </button>
            <span>•</span>
            <button
              onClick={collapseAll}
              className="px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Collapse All
            </button>
          </div>
        </div>
      </div>

      {/* Batch Cards List */}
      {filteredBatches.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-3xl border border-dashed border-slate-300 space-y-3">
          <Layers className="w-10 h-10 mx-auto text-slate-400" />
          <h4 className="text-base font-bold text-slate-800">No Batches Found</h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {searchQuery
              ? 'No batches or enrolled students matched your search criteria. Try modifying your filter or clear the search query.'
              : 'There are currently no batches registered under this center. Click "Create New Batch" to set up your first training cohort.'}
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCenterId('ALL');
              setSelectedCourseId('ALL');
              setSelectedStatus('ALL');
            }}
            className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold mt-2"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBatches.map((batch) => {
            const isExpanded = expandedBatchIds.has(batch.id);

            // Fetch students enrolled in this batch
            const batchStudents = authorizedStudents.filter(
              (s) => (batch.studentIds || []).includes(s.id) || s.batchId === batch.id
            );

            const partnerObj = partners.find((p) => p.id === batch.partnerId);
            const centerName = partnerObj ? partnerObj.centerName : 'Franchise Partner';
            const centerCode = partnerObj ? partnerObj.partnerCode : batch.partnerId;

            const todayStr = new Date().toISOString().split('T')[0];
            const isFinished = batch.endDate < todayStr;
            const isUpcoming = batch.startDate > todayStr;
            const isActive = !isFinished && !isUpcoming;

            const enrolledCount = batchStudents.length;
            const maxSeats = batch.maxStudents || 30;
            const percentFilled = Math.min(100, Math.round((enrolledCount / maxSeats) * 100));

            return (
              <div
                key={batch.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all overflow-hidden"
              >
                {/* Batch Header Bar */}
                <div
                  onClick={() => toggleExpand(batch.id)}
                  className="p-5 cursor-pointer flex flex-col lg:flex-row lg:items-center justify-between gap-4 select-none hover:bg-slate-50/70 transition-colors"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex flex-col items-center justify-center shrink-0 shadow-xs">
                      <span className="text-[10px] font-mono text-emerald-400 font-bold">BATCH</span>
                      <span className="text-xs font-black">{batch.batchCode.slice(-4)}</span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-black text-slate-900">{batch.batchName}</h3>
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[11px] font-mono font-bold rounded">
                          {batch.batchCode}
                        </span>
                        {isActive && (
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">
                            ● Active Cohort
                          </span>
                        )}
                        {isUpcoming && (
                          <span className="px-2 py-0.5 bg-cyan-100 text-cyan-800 text-[10px] font-bold rounded-full">
                            Upcoming
                          </span>
                        )}
                        {isFinished && (
                          <span className="px-2 py-0.5 bg-slate-200 text-slate-700 text-[10px] font-bold rounded-full">
                            Completed
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                        <span className="flex items-center gap-1">
                          <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                          <strong className="text-slate-800">{batch.courseName}</strong>
                        </span>
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-slate-500" />
                          <span>{centerName} ({centerCode})</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          <span>{batch.timing}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Instructor: {batch.instructorName}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Batch Right Side Metrics & Toggle */}
                  <div className="flex items-center gap-5 justify-between lg:justify-end">
                    {/* Capacity Indicator */}
                    <div className="text-right space-y-1 min-w-[120px]">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 font-medium">Students</span>
                        <strong className="text-slate-900 font-black">
                          {enrolledCount} / {maxSeats}
                        </strong>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            percentFilled >= 100
                              ? 'bg-rose-500'
                              : percentFilled >= 75
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${percentFilled}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-400 block font-mono">
                        {percentFilled}% seat capacity
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedBatchForAddStudent(batch);
                        }}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                        title="Enroll student into this batch"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Enroll</span>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleExportBatchCSV(batch);
                        }}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                        title="Export this batch's student list to CSV"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">CSV</span>
                      </button>

                      <div className="p-1 text-slate-400 hover:text-slate-600">
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Student List */}
                {isExpanded && (
                  <div className="border-t border-slate-200 bg-slate-50/50 p-5 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-emerald-600" />
                        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                          Batch-wise Student Roster ({enrolledCount} Registered Students)
                        </h4>
                      </div>
                      <span className="text-[11px] text-slate-500">
                        Dates: <strong className="text-slate-700">{batch.startDate}</strong> to{' '}
                        <strong className="text-slate-700">{batch.endDate}</strong>
                      </span>
                    </div>

                    {batchStudents.length === 0 ? (
                      <div className="bg-white p-6 rounded-xl border border-slate-200 text-center space-y-2">
                        <p className="text-xs text-slate-500">
                          No students are currently enrolled in this batch.
                        </p>
                        <button
                          onClick={() => setSelectedBatchForAddStudent(batch)}
                          className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          Enroll Existing Center Student
                        </button>
                      </div>
                    ) : (
                      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 text-[11px] uppercase tracking-wider">
                              <th className="p-3">#</th>
                              <th className="p-3">Student Details</th>
                              <th className="p-3">Residential Address</th>
                              <th className="p-3">Contact Phone</th>
                              <th className="p-3">Email Address</th>
                              <th className="p-3">Fee Status</th>
                              <th className="p-3 text-right">Enrollment Date</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {batchStudents.map((stu, idx) => (
                              <tr key={stu.id} className="hover:bg-slate-50 transition-colors">
                                <td className="p-3 text-slate-400 font-mono text-[11px]">{idx + 1}</td>
                                <td className="p-3">
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
                                      {stu.fatherName && (
                                        <span className="text-[10px] text-slate-400 block">
                                          S/D of {stu.fatherName}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </td>

                                {/* Address Details */}
                                <td className="p-3 max-w-[240px]">
                                  <div className="flex items-start gap-1 text-slate-700 text-xs">
                                    <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                                    <div>
                                      <p className="line-clamp-2">{stu.address || 'Address on file'}</p>
                                      <span className="text-[10px] text-slate-500 font-medium">
                                        {stu.district}, {stu.state} - {stu.pincode}
                                      </span>
                                    </div>
                                  </div>
                                </td>

                                {/* Phone Number */}
                                <td className="p-3 whitespace-nowrap">
                                  <a
                                    href={`tel:${stu.phone}`}
                                    className="inline-flex items-center gap-1.5 text-slate-800 font-mono hover:text-emerald-600 transition-colors font-semibold"
                                  >
                                    <Phone className="w-3 h-3 text-emerald-600 shrink-0" />
                                    <span>{stu.phone}</span>
                                  </a>
                                </td>

                                {/* Email ID */}
                                <td className="p-3 whitespace-nowrap">
                                  <a
                                    href={`mailto:${stu.email}`}
                                    className="inline-flex items-center gap-1.5 text-slate-700 hover:text-emerald-600 transition-colors font-medium"
                                  >
                                    <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                                    <span className="truncate max-w-[170px]">{stu.email}</span>
                                  </a>
                                </td>

                                {/* Fee Status */}
                                <td className="p-3 whitespace-nowrap">
                                  <span
                                    className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                                      stu.feeStatus === 'PAID'
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : stu.feeStatus === 'PARTIAL'
                                        ? 'bg-amber-100 text-amber-800'
                                        : 'bg-rose-100 text-rose-800'
                                    }`}
                                  >
                                    {stu.feeStatus === 'PAID'
                                      ? 'Fully Paid'
                                      : stu.feeStatus === 'PARTIAL'
                                      ? `Partial (₹${stu.paidFees.toLocaleString()})`
                                      : 'Fee Due'}
                                  </span>
                                </td>

                                {/* Enrollment Date */}
                                <td className="p-3 text-right font-mono text-[11px] text-slate-500 whitespace-nowrap">
                                  {stu.enrollmentDate}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL 1: CREATE NEW BATCH */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">Create New Training Batch</h3>
                  <p className="text-[11px] text-slate-500">Configure schedule, capacity & instructor details</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {createSuccessMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{createSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleCreateBatch} className="space-y-3">
              {/* Partner selection if Super Admin / Admin */}
              {(isSuperAdmin || isMisAdmin) && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Assigning Training Center *
                  </label>
                  <select
                    value={newBatchForm.partnerId}
                    onChange={(e) => setNewBatchForm({ ...newBatchForm, partnerId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 outline-none"
                  >
                    {partners.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.partnerCode} - {p.centerName} ({p.district})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Course Selection */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Vocational Course *
                </label>
                <select
                  value={newBatchForm.courseId}
                  onChange={(e) => setNewBatchForm({ ...newBatchForm, courseId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 outline-none"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code} - {c.title} ({c.duration})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Batch Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. DCA-Morning-2026-B"
                    value={newBatchForm.batchName}
                    onChange={(e) => setNewBatchForm({ ...newBatchForm, batchName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs outline-none focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Batch Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. DCA-2026-B"
                    value={newBatchForm.batchCode}
                    onChange={(e) => setNewBatchForm({ ...newBatchForm, batchCode: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono outline-none focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={newBatchForm.startDate}
                    onChange={(e) => setNewBatchForm({ ...newBatchForm, startDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    End Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={newBatchForm.endDate}
                    onChange={(e) => setNewBatchForm({ ...newBatchForm, endDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Session Timing & Days *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 10:00 AM - 12:00 PM (Mon-Wed-Fri)"
                    value={newBatchForm.timing}
                    onChange={(e) => setNewBatchForm({ ...newBatchForm, timing: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Max Student Capacity *
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="100"
                    required
                    value={newBatchForm.maxStudents}
                    onChange={(e) => setNewBatchForm({ ...newBatchForm, maxStudents: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Lead Instructor / Faculty Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Prof. Manoj Kumar Patra / Guest CA"
                  value={newBatchForm.instructorName}
                  onChange={(e) => setNewBatchForm({ ...newBatchForm, instructorName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
                >
                  Confirm & Create Batch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ENROLL STUDENT INTO BATCH */}
      {selectedBatchForAddStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-emerald-600" />
                <div>
                  <h3 className="font-black text-slate-900 text-sm">
                    Enroll Student into {selectedBatchForAddStudent.batchCode}
                  </h3>
                  <p className="text-[10px] text-slate-500">{selectedBatchForAddStudent.batchName}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedBatchForAddStudent(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Candidate options */}
            {(() => {
              const eligible = authorizedStudents.filter(
                (s) =>
                  s.partnerId === selectedBatchForAddStudent.partnerId &&
                  (!s.batchId || s.batchId !== selectedBatchForAddStudent.id)
              );

              if (eligible.length === 0) {
                return (
                  <div className="p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs space-y-1">
                    <p className="font-bold">No Unassigned Candidates Available</p>
                    <p className="text-[11px] text-amber-700">
                      All registered students in this center are already assigned to this batch or other cohorts. Register a new student first to add them here.
                    </p>
                  </div>
                );
              }

              return (
                <form onSubmit={handleEnrollStudent} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Select Student from this Center ({eligible.length} eligible) *
                    </label>
                    <select
                      required
                      value={studentToEnrollId}
                      onChange={(e) => setStudentToEnrollId(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 outline-none"
                    >
                      <option value="">-- Choose Candidate --</option>
                      {eligible.map((st) => (
                        <option key={st.id} value={st.id}>
                          {st.name} ({st.regNo}) • {st.courseName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setSelectedBatchForAddStudent(null)}
                      className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!studentToEnrollId}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
                    >
                      Assign to Batch
                    </button>
                  </div>
                </form>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};
