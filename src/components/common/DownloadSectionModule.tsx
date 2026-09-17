import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { DownloadFile } from '../../types';
import {
  Download,
  Upload,
  FileText,
  Trash2,
  RefreshCw,
  Search,
  Filter,
  AlertCircle,
  CheckCircle2,
  File,
  FileSpreadsheet,
  FileArchive,
  Image as ImageIcon,
  ShieldAlert,
  Clock,
  User,
  HardDrive,
  ExternalLink,
  Plus,
  X,
  Layers,
} from 'lucide-react';

export const DownloadSectionModule: React.FC = () => {
  const {
    downloadFiles,
    uploadDownloadFile,
    replaceDownloadFile,
    deleteDownloadFile,
    currentRole,
    currentAdmin,
    currentPartner,
    canUploadDownloadFiles,
  } = useApp();

  const isAuthorizedUploader = canUploadDownloadFiles();

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [replacingFile, setReplacingFile] = useState<DownloadFile | null>(null);
  const [deletingFile, setDeletingFile] = useState<DownloadFile | null>(null);
  const [feedbackNotice, setFeedbackNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Upload Form state
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploadCategory, setUploadCategory] = useState<DownloadFile['category']>('GENERAL');
  const [selectedFileObj, setSelectedFileObj] = useState<{
    fileName: string;
    fileSize: string;
    fileSizeBytes: number;
    fileType: DownloadFile['fileType'];
    fileUrl: string;
  } | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Replacement Form state
  const [replacementFileObj, setReplacementFileObj] = useState<{
    fileName: string;
    fileSize: string;
    fileSizeBytes: number;
    fileType: DownloadFile['fileType'];
    fileUrl: string;
  } | null>(null);
  const [replaceError, setReplaceError] = useState<string | null>(null);
  const replaceFileInputRef = useRef<HTMLInputElement>(null);

  const MAX_FILE_SIZE_BYTES = 100 * 1024 * 1024; // 100 MB limit

  const categories: { id: string; label: string }[] = [
    { id: 'ALL', label: 'All Documents' },
    { id: 'PROSPECTUS', label: 'Prospectus' },
    { id: 'SYLLABUS', label: 'Curriculum & Syllabus' },
    { id: 'AFFILIATION_FORM', label: 'Affiliation & Franchise' },
    { id: 'EXAM_CIRCULAR', label: 'Examination Circulars' },
    { id: 'STUDY_KIT', label: 'Study Kits & Labs' },
    { id: 'GENERAL', label: 'General Notices' },
  ];

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getFileCategoryIcon = (type: DownloadFile['fileType']) => {
    switch (type) {
      case 'PDF':
        return <FileText className="w-5 h-5 text-red-600" />;
      case 'EXCEL':
        return <FileSpreadsheet className="w-5 h-5 text-emerald-600" />;
      case 'ZIP':
        return <FileArchive className="w-5 h-5 text-amber-600" />;
      case 'IMAGE':
        return <ImageIcon className="w-5 h-5 text-purple-600" />;
      default:
        return <File className="w-5 h-5 text-indigo-600" />;
    }
  };

  const determineFileType = (fileName: string): DownloadFile['fileType'] => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return 'PDF';
    if (ext === 'doc' || ext === 'docx') return 'DOC';
    if (ext === 'xls' || ext === 'xlsx' || ext === 'csv') return 'EXCEL';
    if (ext === 'zip' || ext === 'rar' || ext === '7z') return 'ZIP';
    if (ext === 'jpg' || ext === 'jpeg' || ext === 'png' || ext === 'webp') return 'IMAGE';
    return 'OTHER';
  };

  const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>, isReplacement = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE_BYTES) {
      const errMsg = `File "${file.name}" (${formatFileSize(file.size)}) exceeds the maximum allowed limit of 100 MB.`;
      if (isReplacement) {
        setReplaceError(errMsg);
        setReplacementFileObj(null);
      } else {
        setUploadError(errMsg);
        setSelectedFileObj(null);
      }
      return;
    }

    if (isReplacement) setReplaceError(null);
    else setUploadError(null);

    const reader = new FileReader();
    reader.onload = () => {
      const fileData = {
        fileName: file.name,
        fileSize: formatFileSize(file.size),
        fileSizeBytes: file.size,
        fileType: determineFileType(file.name),
        fileUrl: (reader.result as string) || URL.createObjectURL(file),
      };

      if (isReplacement) {
        setReplacementFileObj(fileData);
      } else {
        setSelectedFileObj(fileData);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle.trim()) {
      setUploadError('Please provide a document title.');
      return;
    }
    if (!selectedFileObj) {
      setUploadError('Please select a file to upload.');
      return;
    }

    const uploaderRole = (currentAdmin?.role as any) || 'ADMIN';
    const uploaderName = currentAdmin?.name || 'Directorate MIS Admin';

    const res = uploadDownloadFile({
      title: uploadTitle.trim(),
      description: uploadDescription.trim(),
      category: uploadCategory,
      fileName: selectedFileObj.fileName,
      fileSize: selectedFileObj.fileSize,
      fileSizeBytes: selectedFileObj.fileSizeBytes,
      fileType: selectedFileObj.fileType,
      fileUrl: selectedFileObj.fileUrl,
      uploadedByRole: uploaderRole,
      uploadedByName: uploaderName,
      uploadedByEmail: currentAdmin?.email,
    });

    if (res.success) {
      setFeedbackNotice({ type: 'success', message: res.message });
      setShowUploadModal(false);
      setUploadTitle('');
      setUploadDescription('');
      setSelectedFileObj(null);
      setUploadError(null);
      setTimeout(() => setFeedbackNotice(null), 5000);
    } else {
      setUploadError(res.message);
    }
  };

  const handleReplaceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replacingFile || !replacementFileObj) {
      setReplaceError('Please select a valid replacement file.');
      return;
    }

    const res = replaceDownloadFile(replacingFile.id, {
      fileName: replacementFileObj.fileName,
      fileSize: replacementFileObj.fileSize,
      fileSizeBytes: replacementFileObj.fileSizeBytes,
      fileType: replacementFileObj.fileType,
      fileUrl: replacementFileObj.fileUrl,
    });

    if (res.success) {
      setFeedbackNotice({ type: 'success', message: res.message });
      setReplacingFile(null);
      setReplacementFileObj(null);
      setReplaceError(null);
      setTimeout(() => setFeedbackNotice(null), 5000);
    } else {
      setReplaceError(res.message);
    }
  };

  const handleDeleteConfirm = () => {
    if (!deletingFile) return;
    const res = deleteDownloadFile(deletingFile.id);
    if (res.success) {
      setFeedbackNotice({ type: 'success', message: res.message });
      setDeletingFile(null);
      setTimeout(() => setFeedbackNotice(null), 5000);
    } else {
      setFeedbackNotice({ type: 'error', message: res.message });
    }
  };

  // Filtered files
  const filteredFiles = downloadFiles.filter((f) => {
    const matchesSearch =
      f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (f.description && f.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      f.uploadedByName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'ALL' || f.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6" id="download-section-module">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-400/30">
              <Download className="w-3.5 h-3.5" />
              Directorate Document Repository & Downloads
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Official Download Section
            </h2>
            <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
              Centralized statutory file distribution hub. Authorized Training Partners can view and download all official circulars, syllabi, inspection kits, and curriculum modules. Directorate MIS Admins can upload, replace, and manage documents up to 100 MB.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {isAuthorizedUploader ? (
              <button
                id="upload-file-btn"
                onClick={() => {
                  setShowUploadModal(true);
                  setUploadError(null);
                  setSelectedFileObj(null);
                }}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition-all cursor-pointer transform active:scale-95"
              >
                <Upload className="w-4 h-4" />
                Upload New Document (Max 100 MB)
              </button>
            ) : (
              <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-300 text-xs">
                <ShieldAlert className="w-4 h-4 text-emerald-400" />
                <span>Partner Read-Only Access (Download Enabled)</span>
              </div>
            )}
          </div>
        </div>

        {/* Informational badge for Partner */}
        {!isAuthorizedUploader && (
          <div className="mt-4 pt-4 border-t border-slate-800 flex items-center gap-2 text-xs text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>
              Signed in as <strong>{currentPartner?.centerName || 'Training Partner'}</strong>. You have instant access to download all verified files. File modifications are securely managed by Directorate MIS Admins.
            </span>
          </div>
        )}
      </div>

      {/* Global Feedback Banner */}
      {feedbackNotice && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between gap-3 text-sm font-medium border ${
            feedbackNotice.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800'
              : 'bg-rose-50 text-rose-900 border-rose-200 dark:bg-rose-950/30 dark:text-rose-300 dark:border-rose-800'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {feedbackNotice.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600" />
            )}
            <span>{feedbackNotice.message}</span>
          </div>
          <button
            onClick={() => setFeedbackNotice(null)}
            className="p-1 hover:bg-black/5 rounded-lg text-slate-500"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search & Category Filter Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            id="search-downloads-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, file name, uploader..."
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Files Grid / List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredFiles.length === 0 ? (
          <div className="col-span-full bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="w-14 h-14 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
              <File className="w-7 h-7" />
            </div>
            <h4 className="text-base font-semibold text-slate-800 dark:text-slate-200">
              No documents match your query
            </h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Try adjusting your search terms or selecting a different category filter.
            </p>
          </div>
        ) : (
          filteredFiles.map((file) => (
            <div
              key={file.id}
              id={`file-card-${file.id}`}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4 relative group"
            >
              <div className="space-y-3">
                {/* Header: File Type Badge + Version + Category */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      {getFileCategoryIcon(file.fileType)}
                    </div>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {file.category.replace('_', ' ')}
                    </span>
                  </div>

                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800">
                    v{file.version}.0
                  </span>
                </div>

                {/* File Title & Description */}
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug">
                    {file.title}
                  </h3>
                  {file.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                      {file.description}
                    </p>
                  )}
                </div>

                {/* File Specs & Meta */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <File className="w-3.5 h-3.5" />
                      File Name:
                    </span>
                    <span className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[170px]" title={file.fileName}>
                      {file.fileName}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <HardDrive className="w-3.5 h-3.5" />
                      File Size:
                    </span>
                    <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                      {file.fileSize}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <Clock className="w-3.5 h-3.5" />
                      Uploaded:
                    </span>
                    <span>{file.uploadDate}</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-300 pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <User className="w-3.5 h-3.5" />
                      Uploader:
                    </span>
                    <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[170px]" title={`${file.uploadedByName} (${file.uploadedByRole})`}>
                      {file.uploadedByName}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                {/* Primary Download Button */}
                <a
                  href={file.fileUrl}
                  download={file.fileName}
                  target="_blank"
                  rel="noopener noreferrer"
                  id={`download-file-btn-${file.id}`}
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs shadow-sm transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download File ({file.fileSize})
                </a>

                {/* Admin Management Controls (Upload/Replace/Delete) */}
                {isAuthorizedUploader && (
                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => {
                        setReplacingFile(file);
                        setReplacementFileObj(null);
                        setReplaceError(null);
                      }}
                      className="inline-flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-indigo-500" />
                      Replace Version
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeletingFile(file)}
                      className="inline-flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 text-xs font-medium transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                      Delete File
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* UPLOAD NEW FILE MODAL (Admin / MIS Admin Only) */}
      {showUploadModal && isAuthorizedUploader && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Upload Official Document
                  </h3>
                  <p className="text-xs text-slate-500">
                    Max file size 100 MB • Stored with version tracking & uploader audit
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {uploadError && (
              <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Document Title *
                </label>
                <input
                  type="text"
                  required
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="e.g. Master Syllabus 2026-2027 or Center Inspection Handbook"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Document Category *
                </label>
                <select
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="PROSPECTUS">Prospectus & Bylaws</option>
                  <option value="SYLLABUS">Curriculum & Course Syllabus</option>
                  <option value="AFFILIATION_FORM">Affiliation & Franchise Application</option>
                  <option value="EXAM_CIRCULAR">Examination Notification & Guidelines</option>
                  <option value="STUDY_KIT">Study Material & Lab Exercises</option>
                  <option value="GENERAL">General Directorate Notice</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description / Remarks
                </label>
                <textarea
                  rows={2}
                  value={uploadDescription}
                  onChange={(e) => setUploadDescription(e.target.value)}
                  placeholder="Brief synopsis of the document contents and intended training partners..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Drag & Drop File Picker */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Select File (Up to 100 MB) *
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => handleFileSelection(e, false)}
                  className="hidden"
                />

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 rounded-xl p-6 text-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-slate-800/50"
                >
                  {selectedFileObj ? (
                    <div className="space-y-2">
                      <div className="w-10 h-10 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        {selectedFileObj.fileName}
                      </p>
                      <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                        Size: {selectedFileObj.fileSize} • Type: {selectedFileObj.fileType}
                      </p>
                      <span className="text-[11px] text-slate-400">
                        Click to change file
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <Upload className="w-8 h-8 mx-auto text-slate-400" />
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Click or drag file here to upload
                      </p>
                      <p className="text-[11px] text-slate-400">
                        PDF, Word, Excel, ZIP, Images • Maximum file size: <strong>100 MB</strong>
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Uploader metadata notice */}
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-[11px] text-slate-500 space-y-1">
                <div className="flex justify-between">
                  <span>Author / Uploader:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {currentAdmin?.name || 'Directorate MIS Admin'} ({currentAdmin?.role || 'ADMIN'})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Version assigned:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">v1.0 (Initial Release)</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedFileObj}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
                >
                  Publish to Repository
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REPLACE FILE MODAL (Admin / MIS Admin Only) */}
      {replacingFile && isAuthorizedUploader && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600">
                  <RefreshCw className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Replace Document Version
                  </h3>
                  <p className="text-xs text-slate-500">
                    Upgrades version to <strong>v{(replacingFile.version || 1) + 1}.0</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setReplacingFile(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs space-y-1.5">
              <p className="text-slate-500">Current active file:</p>
              <p className="font-bold text-slate-900 dark:text-white text-sm">
                {replacingFile.title}
              </p>
              <div className="flex items-center gap-3 text-slate-500">
                <span>File: {replacingFile.fileName}</span>
                <span>Size: {replacingFile.fileSize}</span>
                <span>Version: v{replacingFile.version}.0</span>
              </div>
            </div>

            {replaceError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                <span>{replaceError}</span>
              </div>
            )}

            <form onSubmit={handleReplaceSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Select New Version File (Up to 100 MB) *
                </label>
                <input
                  type="file"
                  ref={replaceFileInputRef}
                  onChange={(e) => handleFileSelection(e, true)}
                  className="hidden"
                />

                <div
                  onClick={() => replaceFileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 rounded-xl p-6 text-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-slate-800/50"
                >
                  {replacementFileObj ? (
                    <div className="space-y-2">
                      <div className="w-10 h-10 mx-auto rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        {replacementFileObj.fileName}
                      </p>
                      <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
                        New Size: {replacementFileObj.fileSize} • Type: {replacementFileObj.fileType}
                      </p>
                      <span className="text-[11px] text-slate-400">
                        Click to choose a different replacement file
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <Upload className="w-8 h-8 mx-auto text-slate-400" />
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Click to select new file version
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Maximum file size: 100 MB
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setReplacingFile(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!replacementFileObj}
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
                >
                  Replace & Publish v{(replacingFile.version || 1) + 1}.0
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingFile && isAuthorizedUploader && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Delete File from Repository?
              </h3>
              <p className="text-xs text-slate-500">
                Are you sure you want to permanently remove <strong>"{deletingFile.title}"</strong> ({deletingFile.fileName})? Partners will no longer be able to download this document.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setDeletingFile(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
              >
                Delete File
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default DownloadSectionModule;
