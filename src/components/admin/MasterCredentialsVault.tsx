import React, { useState, useMemo } from 'react';
import {
  KeyRound,
  Eye,
  EyeOff,
  Copy,
  Check,
  Lock,
  Unlock,
  Shield,
  ShieldCheck,
  ShieldAlert,
  User,
  Users,
  Building2,
  Search,
  Filter,
  RefreshCw,
  Download,
  ExternalLink,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Award,
  DollarSign,
  Clock,
  FileText,
  CheckCircle2,
  XCircle,
  AlertCircle,
  X,
  ChevronRight,
  Hash,
  ArrowRight,
  UserCheck,
  Smartphone,
  Edit3,
  Sparkles,
  Layers,
} from 'lucide-react';
import {
  Student,
  Partner,
  CenterMISUser,
  AdminUser,
  ActivityLog,
} from '../../types';

interface MasterCredentialsVaultProps {
  students: Student[];
  partners: Partner[];
  centerMISUsers: CenterMISUser[];
  admins: AdminUser[];
  getUserPassword: (identifier: string, defaultFallback?: string) => string;
  adminUpdateUserPassword: (
    entityType: 'STUDENT' | 'PARTNER' | 'CENTER_MIS' | 'MIS_ADMIN',
    identifier: string,
    newPass: string
  ) => boolean;
  activityLogs: ActivityLog[];
  onViewLogsForActor?: (actorName: string) => void;
}

export type EntityCategory = 'ALL' | 'STUDENT' | 'PARTNER' | 'CENTER_MIS' | 'MIS_ADMIN';

interface UnifiedIdentityRecord {
  id: string;
  uniqueCode: string; // RegNo / PartnerCode / MISCode / AdminID
  name: string;
  email: string;
  phone: string;
  role: 'STUDENT' | 'PARTNER' | 'CENTER_MIS' | 'MIS_ADMIN';
  roleLabel: string;
  parentEntity?: string; // Center name for Student or Center MIS
  status: string;
  secondaryInfo: string; // Course name, Designation, District, etc.
  rawEntity: Student | Partner | CenterMISUser | AdminUser;
}

export const MasterCredentialsVault: React.FC<MasterCredentialsVaultProps> = ({
  students,
  partners,
  centerMISUsers,
  admins,
  getUserPassword,
  adminUpdateUserPassword,
  activityLogs,
  onViewLogsForActor,
}) => {
  // Category tab
  const [selectedCategory, setSelectedCategory] = useState<EntityCategory>('ALL');

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  // Global reveal state
  const [revealAllPasswords, setRevealAllPasswords] = useState(false);

  // Individual visible passwords set
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set());

  // Copy feedback tracking (id -> boolean)
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modal: Reset Password
  const [resettingEntity, setResettingEntity] = useState<UnifiedIdentityRecord | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [resetSuccessMessage, setResetSuccessMessage] = useState<string | null>(null);

  // Modal: Full Profile Inspector
  const [inspectingEntity, setInspectingEntity] = useState<UnifiedIdentityRecord | null>(null);

  // Modal: Actor Audit Logs Inspector
  const [viewingLogsActor, setViewingLogsActor] = useState<string | null>(null);

  // Build unified identities list
  const unifiedRecords: UnifiedIdentityRecord[] = useMemo(() => {
    const list: UnifiedIdentityRecord[] = [];

    // Students
    students.forEach((s) => {
      list.push({
        id: s.id,
        uniqueCode: s.regNo,
        name: s.name,
        email: s.email || 'N/A',
        phone: s.phone || 'N/A',
        role: 'STUDENT',
        roleLabel: 'Student',
        parentEntity: s.partnerName,
        status: s.feeStatus === 'PAID' ? 'FEES PAID' : s.feeStatus === 'PENDING' ? 'FEES PENDING' : s.feeStatus,
        secondaryInfo: `${s.courseName} (${s.courseId})`,
        rawEntity: s,
      });
    });

    // Centers (Partners)
    partners.forEach((p) => {
      list.push({
        id: p.id,
        uniqueCode: p.partnerCode,
        name: p.centerName,
        email: p.email,
        phone: p.phone,
        role: 'PARTNER',
        roleLabel: 'Training Center',
        parentEntity: `${p.district}, ${p.state}`,
        status: p.status,
        secondaryInfo: `Director: ${p.ownerName} • Enrolled: ${p.totalStudentsEnrolled}`,
        rawEntity: p,
      });
    });

    // Center MIS Users
    centerMISUsers.forEach((m) => {
      list.push({
        id: m.id,
        uniqueCode: m.misCode,
        name: m.name,
        email: m.email,
        phone: m.phone || 'N/A',
        role: 'CENTER_MIS',
        roleLabel: 'Center MIS Personnel',
        parentEntity: m.centerName,
        status: m.status,
        secondaryInfo: `${m.designation || 'Center MIS Officer'} • Bound to ${m.partnerCode}`,
        rawEntity: m,
      });
    });

    // MIS Admins & Directorate
    admins.forEach((a) => {
      list.push({
        id: a.id,
        uniqueCode: a.id,
        name: a.name,
        email: a.email,
        phone: a.phone || '+91 9831000000',
        role: 'MIS_ADMIN',
        roleLabel: a.role === 'SUPER_ADMIN' ? 'Super Admin Directorate' : 'Executive MIS Admin',
        parentEntity: 'JSSS Central Directorate',
        status: a.status,
        secondaryInfo: `${a.designation || (a.role === 'SUPER_ADMIN' ? 'Central Directorate' : 'MIS Admin')} • ${a.role}`,
        rawEntity: a,
      });
    });

    return list;
  }, [students, partners, centerMISUsers, admins]);

  // Filtered records
  const filteredRecords = useMemo(() => {
    return unifiedRecords.filter((record) => {
      // Category filter
      if (selectedCategory !== 'ALL' && record.role !== selectedCategory) {
        return false;
      }

      // Search filter
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        record.name.toLowerCase().includes(q) ||
        record.uniqueCode.toLowerCase().includes(q) ||
        record.id.toLowerCase().includes(q) ||
        record.email.toLowerCase().includes(q) ||
        record.phone.toLowerCase().includes(q) ||
        (record.parentEntity && record.parentEntity.toLowerCase().includes(q)) ||
        record.secondaryInfo.toLowerCase().includes(q)
      );
    });
  }, [unifiedRecords, selectedCategory, searchQuery]);

  // Toggle individual password reveal
  const togglePasswordReveal = (id: string) => {
    setRevealedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Copy credentials helper
  const handleCopyCredentials = (record: UnifiedIdentityRecord) => {
    const pass = getUserPassword(record.uniqueCode) || getUserPassword(record.email) || getUserPassword(record.id);
    const text = `=== JSSS FOUNDATION SECURE CREDENTIALS ===\nRole: ${record.roleLabel}\nUnique ID / Reg: ${record.uniqueCode}\nSystem ID: ${record.id}\nFull Name: ${record.name}\nEmail / Login: ${record.email}\nPhone: ${record.phone}\nPassword: ${pass}\nParent Center / Organization: ${record.parentEntity || 'JSSS Central'}\n===========================================`;
    navigator.clipboard.writeText(text);
    setCopiedId(record.id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  // Generate strong random password
  const generateStrongPassword = () => {
    const prefixes = ['Jsss', 'Admin', 'Kolkata', 'Super', 'Secure', 'Edu'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const symbols = ['#', '@', '!', '$'];
    const symbol = symbols[Math.floor(Math.random() * symbols.length)];
    const num = Math.floor(1000 + Math.random() * 9000);
    setNewPasswordInput(`${prefix}${symbol}${num}`);
  };

  // Submit Password Reset
  const handleResetPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resettingEntity || !newPasswordInput.trim()) return;

    const success = adminUpdateUserPassword(
      resettingEntity.role,
      resettingEntity.uniqueCode,
      newPasswordInput.trim()
    );

    if (success) {
      setResetSuccessMessage(`Password updated successfully for ${resettingEntity.name} (${resettingEntity.uniqueCode})!`);
      setTimeout(() => {
        setResettingEntity(null);
        setNewPasswordInput('');
        setResetSuccessMessage(null);
      }, 1500);
    }
  };

  // Export CSV of visible accounts
  const handleExportCSV = () => {
    const headers = 'Role,UniqueCode,SystemID,Name,Email,Phone,ParentCenter,Password,Status,Details\n';
    const rows = filteredRecords
      .map((r) => {
        const pass = getUserPassword(r.uniqueCode) || getUserPassword(r.email) || getUserPassword(r.id);
        return `"${r.roleLabel}","${r.uniqueCode}","${r.id}","${r.name}","${r.email}","${r.phone}","${
          r.parentEntity || ''
        }","${pass}","${r.status}","${r.secondaryInfo.replace(/"/g, '""')}"`;
      })
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `JSSS_Master_Credentials_Vault_${selectedCategory}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Role Badge Color
  const getRoleBadge = (role: UnifiedIdentityRecord['role']) => {
    switch (role) {
      case 'STUDENT':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'PARTNER':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'CENTER_MIS':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      case 'MIS_ADMIN':
        return 'bg-amber-50 text-amber-800 border-amber-200';
    }
  };

  return (
    <div className="space-y-6" id="super-admin-master-credentials-vault">
      {/* Top Banner & Security Status */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-700 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full text-xs font-black tracking-wide uppercase">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              Super Admin Directorate Security Vault
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              Master Credentials & Identity Vault
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Complete administrative authority over IDs, passwords, full profile dossiers, and security audit logs across
              all <strong className="text-white">Students</strong>, <strong className="text-white">Franchise Centers</strong>,{' '}
              <strong className="text-white">Center MIS Personnel</strong>, and <strong className="text-white">MIS Admins</strong>.
            </p>
          </div>

          {/* Quick Action Controls */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              id="btn-toggle-all-passwords"
              onClick={() => setRevealAllPasswords(!revealAllPasswords)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-md cursor-pointer ${
                revealAllPasswords
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                  : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
              }`}
            >
              {revealAllPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span>{revealAllPasswords ? 'Mask All Passwords' : 'Reveal All Passwords'}</span>
            </button>

            <button
              type="button"
              id="btn-export-vault-csv"
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Export Master CSV</span>
            </button>
          </div>
        </div>

        {/* Counter Metric Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6 pt-6 border-t border-slate-700/80">
          <div
            onClick={() => setSelectedCategory('ALL')}
            className={`p-3 rounded-2xl border transition-all cursor-pointer ${
              selectedCategory === 'ALL'
                ? 'bg-white/20 border-white/40 shadow-inner'
                : 'bg-white/5 border-white/10 hover:bg-white/10'
            }`}
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Accounts</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl font-black text-white">{unifiedRecords.length}</span>
              <span className="text-[10px] text-slate-400">All Roles</span>
            </div>
          </div>

          <div
            onClick={() => setSelectedCategory('STUDENT')}
            className={`p-3 rounded-2xl border transition-all cursor-pointer ${
              selectedCategory === 'STUDENT'
                ? 'bg-blue-500/20 border-blue-400/60 shadow-inner'
                : 'bg-white/5 border-white/10 hover:bg-white/10'
            }`}
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300 block">Students</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl font-black text-white">{students.length}</span>
              <span className="text-[10px] text-blue-300">Enrolled</span>
            </div>
          </div>

          <div
            onClick={() => setSelectedCategory('PARTNER')}
            className={`p-3 rounded-2xl border transition-all cursor-pointer ${
              selectedCategory === 'PARTNER'
                ? 'bg-emerald-500/20 border-emerald-400/60 shadow-inner'
                : 'bg-white/5 border-white/10 hover:bg-white/10'
            }`}
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 block">Training Centers</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl font-black text-white">{partners.length}</span>
              <span className="text-[10px] text-emerald-300">Franchises</span>
            </div>
          </div>

          <div
            onClick={() => setSelectedCategory('CENTER_MIS')}
            className={`p-3 rounded-2xl border transition-all cursor-pointer ${
              selectedCategory === 'CENTER_MIS'
                ? 'bg-purple-500/20 border-purple-400/60 shadow-inner'
                : 'bg-white/5 border-white/10 hover:bg-white/10'
            }`}
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300 block">Center MIS</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl font-black text-white">{centerMISUsers.length}</span>
              <span className="text-[10px] text-purple-300">Personnel</span>
            </div>
          </div>

          <div
            onClick={() => setSelectedCategory('MIS_ADMIN')}
            className={`p-3 rounded-2xl border transition-all cursor-pointer ${
              selectedCategory === 'MIS_ADMIN'
                ? 'bg-amber-500/20 border-amber-400/60 shadow-inner'
                : 'bg-white/5 border-white/10 hover:bg-white/10'
            }`}
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 block">MIS Directorate</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl font-black text-white">{admins.length}</span>
              <span className="text-[10px] text-amber-300">Controllers</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Category Tab Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {(
            [
              { id: 'ALL', label: `All Accounts (${unifiedRecords.length})` },
              { id: 'STUDENT', label: `Students (${students.length})` },
              { id: 'PARTNER', label: `Centers (${partners.length})` },
              { id: 'CENTER_MIS', label: `Center MIS (${centerMISUsers.length})` },
              { id: 'MIS_ADMIN', label: `MIS Admins (${admins.length})` },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedCategory(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === tab.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Field */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            id="vault-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Name, ID, RegNo, Phone, Email..."
            className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-none transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Records Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-indigo-600" />
            <h3 className="font-black text-slate-900 text-sm sm:text-base">
              Authorized Identity & Credential Registry ({filteredRecords.length})
            </h3>
          </div>
          <span className="text-[11px] text-slate-500 hidden sm:inline">
            Zero-Cache Active Memory • Real-time Vault
          </span>
        </div>

        {filteredRecords.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <KeyRound className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="font-bold text-slate-700 text-sm">No accounts found matching your query.</p>
            <p className="text-slate-500 text-xs">Try adjusting your category filter or search keywords.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase font-black tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Role & ID Code</th>
                  <th className="py-3.5 px-4">User Details</th>
                  <th className="py-3.5 px-4">Parent Center / Org</th>
                  <th className="py-3.5 px-4">In-Memory Password</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Administrative Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredRecords.map((record) => {
                  const isRevealed = revealAllPasswords || revealedIds.has(record.id);
                  const password =
                    getUserPassword(record.uniqueCode) ||
                    getUserPassword(record.email) ||
                    getUserPassword(record.id);
                  const isCopied = copiedId === record.id;

                  return (
                    <tr
                      key={record.id}
                      className="hover:bg-indigo-50/40 transition-colors group"
                      id={`vault-row-${record.uniqueCode.replace(/[^a-zA-Z0-9]/g, '-')}`}
                    >
                      {/* Role & ID Code */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-black border ${getRoleBadge(
                              record.role
                            )}`}
                          >
                            {record.roleLabel}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-black text-slate-900 text-xs">{record.uniqueCode}</span>
                            <span className="text-[10px] text-slate-400 font-mono">({record.id})</span>
                          </div>
                        </div>
                      </td>

                      {/* User Details */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <span className="font-bold text-slate-900 text-xs block">{record.name}</span>
                          <div className="flex items-center gap-3 text-[11px] text-slate-500">
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3 text-slate-400" />
                              {record.email}
                            </span>
                            {record.phone !== 'N/A' && (
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3 text-slate-400" />
                                {record.phone}
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-500 italic line-clamp-1">{record.secondaryInfo}</p>
                        </div>
                      </td>

                      {/* Parent Center */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="text-slate-800 font-bold text-xs">{record.parentEntity || 'Central HQ'}</span>
                      </td>

                      {/* Password Field with Reveal & Copy */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200/80 px-2.5 py-1.5 rounded-xl border border-slate-200 transition-all">
                          <Lock className="w-3 h-3 text-slate-400" />
                          <span
                            className={`font-mono text-xs font-black min-w-[85px] select-all ${
                              isRevealed ? 'text-indigo-900' : 'text-slate-400 tracking-wider'
                            }`}
                          >
                            {isRevealed ? password : '••••••••'}
                          </span>

                          {/* Eye Toggle */}
                          <button
                            type="button"
                            onClick={() => togglePasswordReveal(record.id)}
                            className="text-slate-400 hover:text-slate-700 p-1 rounded-md cursor-pointer transition-colors"
                            title={isRevealed ? 'Mask Password' : 'Show Password'}
                          >
                            {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>

                          {/* Copy Button */}
                          <button
                            type="button"
                            onClick={() => handleCopyCredentials(record)}
                            className="text-slate-400 hover:text-indigo-600 p-1 rounded-md cursor-pointer transition-colors"
                            title="Copy Full Credentials"
                          >
                            {isCopied ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600 font-black" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                        {isCopied && (
                          <span className="block text-[9px] font-black text-emerald-600 mt-0.5">Copied to clipboard!</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-black ${
                            record.status === 'ACTIVE' || record.status === 'APPROVED' || record.status === 'FEES PAID'
                              ? 'bg-emerald-100 text-emerald-800'
                              : record.status === 'PENDING' || record.status === 'FEES PENDING'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {record.status}
                        </span>
                      </td>

                      {/* Administrative Actions */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-right">
                        <div className="inline-flex items-center gap-1.5">
                          {/* Reset Password */}
                          <button
                            type="button"
                            onClick={() => {
                              setResettingEntity(record);
                              setNewPasswordInput('');
                              setResetSuccessMessage(null);
                            }}
                            className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1"
                            title="Reset User Password"
                          >
                            <Edit3 className="w-3 h-3 text-amber-700" />
                            <span>Reset Pass</span>
                          </button>

                          {/* Full Profile Dossier */}
                          <button
                            type="button"
                            onClick={() => setInspectingEntity(record)}
                            className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1"
                            title="Inspect Complete Profile Dossier"
                          >
                            <UserCheck className="w-3 h-3 text-indigo-700" />
                            <span>Profile</span>
                          </button>

                          {/* Logs for this entity */}
                          <button
                            type="button"
                            onClick={() => setViewingLogsActor(record.name)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1"
                            title="View Activity Logs"
                          >
                            <Clock className="w-3 h-3 text-slate-600" />
                            <span>Logs</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* MODAL 1: RESET PASSWORD MODAL                             */}
      {/* ========================================================= */}
      {resettingEntity && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-black">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-sm">Super Admin Password Reset</h3>
                  <p className="text-[11px] text-slate-500">Live in-memory credential update</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setResettingEntity(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Target Account Summary */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-500 uppercase text-[10px]">Target Account</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-black border ${getRoleBadge(resettingEntity.role)}`}>
                  {resettingEntity.roleLabel}
                </span>
              </div>
              <p className="font-black text-slate-900 text-sm">{resettingEntity.name}</p>
              <div className="flex items-center gap-2 text-[11px] text-slate-600 font-mono">
                <span>Code: {resettingEntity.uniqueCode}</span>
                <span>•</span>
                <span>Login: {resettingEntity.email}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Current Vault Password:</span>
                <span className="font-mono font-black text-indigo-900">
                  {getUserPassword(resettingEntity.uniqueCode) || getUserPassword(resettingEntity.email)}
                </span>
              </div>
            </div>

            {resetSuccessMessage ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-900 text-xs font-bold">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{resetSuccessMessage}</span>
              </div>
            ) : (
              <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-700">Enter New Password</label>
                    <button
                      type="button"
                      onClick={generateStrongPassword}
                      className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Generate Random</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    value={newPasswordInput}
                    onChange={(e) => setNewPasswordInput(e.target.value)}
                    placeholder="e.g. Jsss#2026@Pass"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-none"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    This will immediately update active runtime authentication across all user login points.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setResettingEntity(null)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>Apply & Save Password</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: FULL PROFILE DOSSIER INSPECTOR                   */}
      {/* ========================================================= */}
      {inspectingEntity && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-3xl max-h-[90vh] rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 overflow-y-auto space-y-6 animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black">
                  {inspectingEntity.role === 'STUDENT' ? (
                    <User className="w-5 h-5" />
                  ) : inspectingEntity.role === 'PARTNER' ? (
                    <Building2 className="w-5 h-5" />
                  ) : inspectingEntity.role === 'CENTER_MIS' ? (
                    <Users className="w-5 h-5" />
                  ) : (
                    <ShieldCheck className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-slate-900 text-lg sm:text-xl">{inspectingEntity.name}</h3>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black border ${getRoleBadge(inspectingEntity.role)}`}>
                      {inspectingEntity.roleLabel}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-mono">
                    ID: {inspectingEntity.uniqueCode} • System ID: {inspectingEntity.id}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInspectingEntity(null)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Credentials Banner */}
            <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-mono text-xs">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                  Active Runtime Credentials
                </span>
                <div className="flex items-center gap-3">
                  <span>
                    Login ID:{' '}
                    <strong className="text-white font-black">{inspectingEntity.uniqueCode}</strong> or{' '}
                    <strong className="text-white font-black">{inspectingEntity.email}</strong>
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white/10 px-3 py-1.5 rounded-xl border border-white/20">
                <span className="text-slate-300">Password:</span>
                <span className="text-amber-300 font-black text-sm">
                  {getUserPassword(inspectingEntity.uniqueCode) || getUserPassword(inspectingEntity.email)}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyCredentials(inspectingEntity)}
                  className="text-slate-300 hover:text-white"
                  title="Copy credentials"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Content Specific to Entity Type */}
            {inspectingEntity.role === 'STUDENT' && (
              <StudentProfileDossier student={inspectingEntity.rawEntity as Student} />
            )}

            {inspectingEntity.role === 'PARTNER' && (
              <PartnerProfileDossier
                partner={inspectingEntity.rawEntity as Partner}
                linkedCenterMIS={centerMISUsers.filter((m) => m.partnerId === inspectingEntity.rawEntity.id)}
                getUserPassword={getUserPassword}
              />
            )}

            {inspectingEntity.role === 'CENTER_MIS' && (
              <CenterMISProfileDossier misUser={inspectingEntity.rawEntity as CenterMISUser} />
            )}

            {inspectingEntity.role === 'MIS_ADMIN' && (
              <AdminProfileDossier adminUser={inspectingEntity.rawEntity as AdminUser} />
            )}

            {/* Footer */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setViewingLogsActor(inspectingEntity.name);
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer flex items-center gap-2"
              >
                <Clock className="w-4 h-4 text-slate-600" />
                <span>View Complete Activity Logs</span>
              </button>

              <button
                type="button"
                onClick={() => setInspectingEntity(null)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: ACTOR ACTIVITY LOGS MODAL                       */}
      {/* ========================================================= */}
      {viewingLogsActor && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl max-h-[85vh] rounded-3xl p-6 shadow-2xl border border-slate-200 flex flex-col space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-600" />
                <div>
                  <h3 className="font-black text-slate-900 text-base">Security Audit Logs</h3>
                  <p className="text-xs text-slate-500">Filtered for actor: {viewingLogsActor}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewingLogsActor(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 space-y-2 pr-1">
              {activityLogs
                .filter(
                  (log) =>
                    (log.actorName && log.actorName.toLowerCase().includes(viewingLogsActor.toLowerCase())) ||
                    (log.details && log.details.toLowerCase().includes(viewingLogsActor.toLowerCase()))
                )
                .map((log) => (
                  <div key={log.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{log.actionType || log.action}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{log.timestamp}</span>
                    </div>
                    <p className="text-slate-600 text-[11px] leading-relaxed">{log.details}</p>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1">
                      <span>IP: {log.ipAddress || '103.220.89.14'}</span>
                      <span>Role: {log.actorRole || log.userRole}</span>
                    </div>
                  </div>
                ))}

              {activityLogs.filter(
                (log) =>
                  (log.actorName && log.actorName.toLowerCase().includes(viewingLogsActor.toLowerCase())) ||
                  (log.details && log.details.toLowerCase().includes(viewingLogsActor.toLowerCase()))
              ).length === 0 && (
                <div className="p-8 text-center text-slate-500 text-xs">
                  No recorded log events found for this specific account name.
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setViewingLogsActor(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Close Logs
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// =========================================================================
// SUB-COMPONENT: Student Profile Dossier
// =========================================================================
const StudentProfileDossier: React.FC<{ student: Student }> = ({ student }) => {
  return (
    <div className="space-y-5 text-xs text-slate-700">
      {/* Bio / General Info */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Personal Details</span>
          <p className="font-bold text-slate-900">{student.name}</p>
          <p className="text-slate-500 text-[11px]">Father: {student.fatherName || 'Not specified'}</p>
          <p className="text-slate-500 text-[11px]">DOB: {student.dob || '2004-01-01'} • Gender: {student.gender || 'MALE'}</p>
        </div>

        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Contact & Location</span>
          <p className="font-bold text-slate-900">{student.email || 'No email'}</p>
          <p className="text-slate-500 text-[11px]">Phone: {student.phone || 'N/A'}</p>
          <p className="text-slate-500 text-[11px] line-clamp-2">
            {student.address ? `${student.address}, ${student.district}, ${student.state} - ${student.pincode}` : 'Kolkata, WB'}
          </p>
        </div>

        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Franchise & Course</span>
          <p className="font-bold text-slate-900">{student.courseName}</p>
          <p className="text-slate-500 text-[11px]">Code: {student.courseId}</p>
          <p className="text-indigo-700 font-bold text-[11px]">{student.partnerName}</p>
        </div>
      </div>

      {/* Financial & Fee Tracking */}
      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <h4 className="font-black text-slate-900 text-xs uppercase tracking-wide flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
            Financial & Fee Tracking
          </h4>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
              student.feeStatus === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
            }`}
          >
            {student.feeStatus}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-2.5 bg-white rounded-xl border border-slate-200">
            <span className="text-[10px] text-slate-400 block font-bold">COURSE FEE</span>
            <span className="text-sm font-black text-slate-900">₹{(student.totalFees ?? 4500).toLocaleString()}</span>
          </div>
          <div className="p-2.5 bg-white rounded-xl border border-slate-200">
            <span className="text-[10px] text-slate-400 block font-bold">FEES PAID</span>
            <span className="text-sm font-black text-emerald-600">₹{(student.paidFees ?? 4500).toLocaleString()}</span>
          </div>
          <div className="p-2.5 bg-white rounded-xl border border-slate-200">
            <span className="text-[10px] text-slate-400 block font-bold">BALANCE DUE</span>
            <span className="text-sm font-black text-rose-600">
              ₹{Math.max(0, (student.totalFees ?? 4500) - (student.paidFees ?? 4500)).toLocaleString()}
            </span>
          </div>
          <div className="p-2.5 bg-white rounded-xl border border-slate-200">
            <span className="text-[10px] text-slate-400 block font-bold">PAYMENT PLAN</span>
            <span className="text-xs font-bold text-slate-800">{student.paymentOption || 'ONE_TIME'}</span>
          </div>
        </div>
      </div>

      {/* Academic Evaluation & Certificate */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
          <h4 className="font-black text-slate-900 text-xs uppercase tracking-wide flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-indigo-600" />
            Evaluation & Marks
          </h4>
          <div className="space-y-1.5 text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-500">Exam Status:</span>
              <span className="font-bold text-slate-800">{student.examStatus || 'COMPLETED'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Theory Marks:</span>
              <span className="font-bold text-slate-800">{student.marks?.theory || 88} / 100</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Practical Marks:</span>
              <span className="font-bold text-slate-800">{student.marks?.practical || 92} / 100</span>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-1">
              <span className="font-bold text-slate-700">Total Grade / Score:</span>
              <span className="font-black text-indigo-700">
                Grade {student.marks?.grade || 'A+'} ({student.marks?.total || 90}%)
              </span>
            </div>
          </div>
        </div>

        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
          <h4 className="font-black text-slate-900 text-xs uppercase tracking-wide flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Attendance & Certificate
          </h4>
          <div className="space-y-1.5 text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-500">Attendance Sessions:</span>
              <span className="font-bold text-emerald-600">
                {student.attendanceHistory?.length || 24} Recorded Sessions
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Certificate Status:</span>
              <span className="font-bold text-slate-800">{student.certificateId ? 'ISSUED & VERIFIED' : 'PENDING'}</span>
            </div>
            {student.certificateId && (
              <div className="flex justify-between">
                <span className="text-slate-500">Certificate No:</span>
                <span className="font-mono font-bold text-indigo-900">{student.certificateId}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-500">Enrollment Date:</span>
              <span className="font-bold text-slate-800">{student.enrollmentDate || '2026-01-15'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// =========================================================================
// SUB-COMPONENT: Partner Center Profile Dossier
// =========================================================================
const PartnerProfileDossier: React.FC<{
  partner: Partner;
  linkedCenterMIS: CenterMISUser[];
  getUserPassword: (id: string) => string;
}> = ({ partner, linkedCenterMIS, getUserPassword }) => {
  return (
    <div className="space-y-5 text-xs text-slate-700">
      {/* General Information */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Center Identity</span>
          <p className="font-bold text-slate-900 text-sm">{partner.centerName}</p>
          <p className="text-slate-500 text-[11px]">Director: {partner.ownerName}</p>
          <p className="text-slate-500 text-[11px]">Center Code: {partner.partnerCode}</p>
        </div>

        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Contact & Address</span>
          <p className="font-bold text-slate-900">{partner.email}</p>
          <p className="text-slate-500 text-[11px]">Phone: {partner.phone}</p>
          <p className="text-slate-500 text-[11px]">
            {partner.address}, {partner.district}, {partner.state} - {partner.pincode}
          </p>
        </div>

        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Commercial Performance</span>
          <p className="font-black text-slate-900 text-sm">₹{(partner.totalRevenueGenerated || 0).toLocaleString()}</p>
          <p className="text-slate-500 text-[11px]">Enrolled Students: {partner.totalStudentsEnrolled || 0}</p>
          <p className="text-slate-500 text-[11px]">Commission Rate: {partner.commissionRate || 25}%</p>
        </div>
      </div>

      {/* Legal & Regulatory Verification */}
      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
        <h4 className="font-black text-slate-900 text-xs uppercase tracking-wide flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-indigo-600" />
          Franchise Legal Compliance & Banking
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px]">
          <div>
            <span className="text-slate-400 text-[10px] block">TRADE LICENSE NO</span>
            <span className="font-mono font-bold text-slate-900">{partner.tradeLicenseNumber || 'TL/CTR/2026/88'}</span>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] block">PAN CARD NO</span>
            <span className="font-mono font-bold text-slate-900">{partner.panNumber || 'AAACJ9999F'}</span>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] block">AADHAR NO</span>
            <span className="font-mono font-bold text-slate-900">{partner.aadharNumber || '1234-5678-9999'}</span>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] block">AGREEMENT VALIDITY</span>
            <span className="font-bold text-emerald-600">{partner.agreementValidUntil || '2027-12-31'}</span>
          </div>
        </div>
      </div>

      {/* Linked Center MIS Personnel with ID & Password */}
      <div className="p-4 bg-purple-50/60 rounded-2xl border border-purple-200 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-black text-purple-950 text-xs uppercase tracking-wide flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-purple-700" />
            Linked Center MIS Personnel ({linkedCenterMIS.length})
          </h4>
          <span className="text-[10px] text-purple-700 font-bold">Authorized for this center</span>
        </div>

        {linkedCenterMIS.length === 0 ? (
          <p className="text-xs text-purple-900/70 italic">No Center MIS users currently bound to this center.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {linkedCenterMIS.map((m) => {
              const pass = getUserPassword(m.misCode) || getUserPassword(m.email);
              return (
                <div key={m.id} className="p-3 bg-white rounded-xl border border-purple-200 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-purple-950">{m.name}</span>
                    <span className="px-1.5 py-0.5 bg-purple-100 text-purple-800 text-[10px] font-black rounded">
                      {m.misCode}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600">Email: {m.email}</p>
                  <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 font-mono">Password:</span>
                    <span className="font-mono font-black text-indigo-900 bg-slate-100 px-2 py-0.5 rounded">
                      {pass}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

// =========================================================================
// SUB-COMPONENT: Center MIS Profile Dossier
// =========================================================================
const CenterMISProfileDossier: React.FC<{ misUser: CenterMISUser }> = ({ misUser }) => {
  return (
    <div className="space-y-4 text-xs text-slate-700">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Personnel Identity</span>
          <p className="font-bold text-slate-900 text-sm">{misUser.name}</p>
          <p className="text-slate-500 text-[11px]">Designation: {misUser.designation || 'Center MIS Officer'}</p>
          <p className="text-slate-500 text-[11px]">Official Email: {misUser.email}</p>
          <p className="text-slate-500 text-[11px]">Phone: {misUser.phone || '+91 9800000000'}</p>
        </div>

        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Assigned Center Affiliation</span>
          <p className="font-bold text-slate-900">{misUser.centerName}</p>
          <p className="text-slate-500 text-[11px]">Center Code: {misUser.partnerCode}</p>
          <p className="text-slate-500 text-[11px]">Partner ID: {misUser.partnerId}</p>
          <p className="text-emerald-600 font-bold text-[11px]">Status: {misUser.status}</p>
        </div>
      </div>

      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
        <h4 className="font-black text-slate-900 text-xs uppercase tracking-wide">
          Authorized Operational Rights
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
          <div className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Student Registration for Parent Center</span>
          </div>
          <div className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Daily Geo-attendance & Classes</span>
          </div>
          <div className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Mock Exam Results Entry</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// =========================================================================
// SUB-COMPONENT: Admin Profile Dossier
// =========================================================================
const AdminProfileDossier: React.FC<{ adminUser: AdminUser }> = ({ adminUser }) => {
  return (
    <div className="space-y-4 text-xs text-slate-700">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Directorate Profile</span>
          <p className="font-bold text-slate-900 text-sm">{adminUser.name}</p>
          <p className="text-slate-500 text-[11px]">Role: {adminUser.role}</p>
          <p className="text-slate-500 text-[11px]">Designation: {adminUser.designation || 'Central Admin'}</p>
          <p className="text-slate-500 text-[11px]">Official Email: {adminUser.email}</p>
        </div>

        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Authority & Governance</span>
          <p className="font-bold text-slate-900">
            {adminUser.isPrimaryAdmin ? 'Primary Admin Committee' : 'Executive MIS Governance'}
          </p>
          <p className="text-slate-500 text-[11px]">Account ID: {adminUser.id}</p>
          <p className="text-slate-500 text-[11px]">Joined Date: {adminUser.createdAt}</p>
          <p className="text-emerald-600 font-bold text-[11px]">Status: {adminUser.status}</p>
        </div>
      </div>

      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
        <h4 className="font-black text-slate-900 text-xs uppercase tracking-wide">
          Governance & Permissions Scope
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
          <div className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              {adminUser.role === 'SUPER_ADMIN'
                ? 'Master Authority (Super Admin, MIS Admin, Center ID, Center MIS ID, Student ID)'
                : 'Limited Authority (Center ID & Student ID Provisioning Only)'}
            </span>
          </div>
          <div className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              {adminUser.role === 'SUPER_ADMIN'
                ? 'Full Credential Vault & Password Reset Privileges'
                : 'Restricted from Viewing Master Credential Vault'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
