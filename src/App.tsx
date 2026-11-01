import React, { useState, useId } from 'react';
import {
  FileSpreadsheet,
  Printer,
  Download,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  Eye,
  Grid,
  Users,
  Copy,
  Sparkles,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { Attendee, EventConfig, DEFAULT_EVENT_CONFIG, INITIAL_ATTENDEES } from './types';
import { InvitationCard } from './components/InvitationCard';
import { PrintA4Sheet } from './components/PrintA4Sheet';
import { DynamicEditor } from './components/DynamicEditor';
import { AttendeeTable } from './components/AttendeeTable';
import { CsvUploaderModal } from './components/CsvUploaderModal';
import { exportA4PagesToPdf, exportSingleCardImage } from './utils/pdfExport';

export default function App() {
  const [attendees, setAttendees] = useState<Attendee[]>(INITIAL_ATTENDEES);
  const [selectedAttendeeId, setSelectedAttendeeId] = useState<string>(INITIAL_ATTENDEES[0].id);
  const [config, setConfig] = useState<EventConfig>(DEFAULT_EVENT_CONFIG);

  // Active view tab: 'single' | 'a4print' | 'table'
  const [activeView, setActiveView] = useState<'single' | 'a4print' | 'table'>('single');
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);

  // PDF Export Progress State
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [pdfProgress, setPdfProgress] = useState<{ current: number; total: number; stage: string } | null>(null);

  // A4 Preview Scale
  const [a4Scale, setA4Scale] = useState<number>(0.75);

  // Currently selected attendee object
  const currentAttendee =
    attendees.find((a) => a.id === selectedAttendeeId) || attendees[0] || INITIAL_ATTENDEES[0];
  const currentIndex = attendees.findIndex((a) => a.id === currentAttendee.id);

  // Divide attendees into chunks of 4 for A4 pages
  const a4Pages: Attendee[][] = [];
  for (let i = 0; i < attendees.length; i += 4) {
    a4Pages.push(attendees.slice(i, i + 4));
  }
  if (a4Pages.length === 0) {
    a4Pages.push([currentAttendee]);
  }

  // Handlers
  const handleUpdateAttendee = (updated: Attendee) => {
    setAttendees((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
  };

  const handleAddAttendee = (newAtt: Omit<Attendee, 'id'>) => {
    const created: Attendee = {
      ...newAtt,
      id: `att-${Date.now()}`,
    };
    setAttendees((prev) => [...prev, created]);
    setSelectedAttendeeId(created.id);
  };

  const handleDeleteAttendee = (id: string) => {
    if (attendees.length <= 1) return;
    const filtered = attendees.filter((a) => a.id !== id);
    setAttendees(filtered);
    if (selectedAttendeeId === id) {
      setSelectedAttendeeId(filtered[0].id);
    }
  };

  const handlePhotoUpload = (attendeeId: string, photoUrl: string) => {
    setAttendees((prev) =>
      prev.map((a) => (a.id === attendeeId ? { ...a, photoUrl } : a))
    );
  };

  const handleCsvImport = (newAttendees: Attendee[], mode: 'replace' | 'append') => {
    if (mode === 'replace') {
      setAttendees(newAttendees);
      if (newAttendees.length > 0) {
        setSelectedAttendeeId(newAttendees[0].id);
      }
    } else {
      setAttendees((prev) => [...prev, ...newAttendees]);
    }
    setActiveView('table');
  };

  const handleLoadSampleData = () => {
    const sampleAttendees: Attendee[] = [
      {
        id: 'samp-1',
        regNo: '১০৩৩',
        name: 'মো: নাজমুল আহসান',
        school: 'রংপুর জেলা স্কুল',
        district: 'রংপুর সদর, রংপুর',
        guests: '২',
        phone: '০১৭XXXXXXXX',
        photoUrl: '',
      },
      {
        id: 'samp-2',
        regNo: '১০৩৪',
        name: 'কাজী গোলাম মোস্তফা',
        school: 'কারমাইকেল কলেজিয়েট স্কুল',
        district: 'ধাপ, রংপুর',
        guests: '১',
        phone: '০১৭১১১১১১১১',
        photoUrl: '',
      },
      {
        id: 'samp-3',
        regNo: '১০৩৫',
        name: 'মোস্তাফিজুর রহমান',
        school: 'রংপুর জিলা স্কুল',
        district: 'পীরগঞ্জ, রংপুর',
        guests: '৩',
        phone: '০১৭২২২২২২২২',
        photoUrl: '',
      },
      {
        id: 'samp-4',
        regNo: '১০৩৬',
        name: 'শেখ শফিউল আলম',
        school: 'ক্যান্টনমেন্ট পাবলিক স্কুল',
        district: 'রংপুর ক্যান্টনমেন্ট',
        guests: '২',
        phone: '০১৭৩৩৩৩৩৩৩৩',
        photoUrl: '',
      },
      {
        id: 'samp-5',
        regNo: '১০৩৭',
        name: 'আহমেদ জামিল রশীদ',
        school: 'রংপুর সরকারি টেকনিক্যাল স্কুল',
        district: 'মর্ডান মোড়, রংপুর',
        guests: '১',
        phone: '০১৭৪৪৪৪৪৪৪৪',
        photoUrl: '',
      },
      {
        id: 'samp-6',
        regNo: '১০৩৮',
        name: 'বদরুল হুদা মিঠু',
        school: 'রংপুর জেলা স্কুল',
        district: 'জাহাজ কোম্পানি মোড়, রংপুর',
        guests: '৪',
        phone: '০১৭৫৫৫৫৫৫৫৫',
        photoUrl: '',
      },
      {
        id: 'samp-7',
        regNo: '১০৩৯',
        name: 'ফারুক আহমেদ চৌধুরী',
        school: 'রংপুর জিলা স্কুল',
        district: 'বেগম রোকেয়া এলাকা',
        guests: '২',
        phone: '০১৭৬৬৬৬৬৬৬৬',
        photoUrl: '',
      },
      {
        id: 'samp-8',
        regNo: '১০৪০',
        name: 'তারেক মাহমুদ',
        school: 'রংপুর মডেল স্কুল',
        district: 'সাতমাথা, রংপুর',
        guests: '১',
        phone: '০১৭৭৭৭৭৭৭৭৭',
        photoUrl: '',
      },
    ];
    setAttendees(sampleAttendees);
    setSelectedAttendeeId(sampleAttendees[0].id);
  };

  const handleDuplicateSingleAttendeeForA4 = () => {
    // Fill a whole A4 sheet with 4 copies of this same person
    const duplicated: Attendee[] = [
      { ...currentAttendee, id: `dup-${Date.now()}-1` },
      { ...currentAttendee, id: `dup-${Date.now()}-2` },
      { ...currentAttendee, id: `dup-${Date.now()}-3` },
      { ...currentAttendee, id: `dup-${Date.now()}-4` },
    ];
    setAttendees(duplicated);
    setActiveView('a4print');
  };

  // Direct PDF Download handler
  const handleDownloadPdf = async () => {
    const pageIds = a4Pages.map((_, idx) => `a4-page-render-${idx}`);
    setIsExportingPdf(true);
    try {
      await exportA4PagesToPdf(pageIds, (progress) => {
        setPdfProgress(progress);
      }, `invitation_cards_${attendees.length}_items.pdf`);
    } catch (err) {
      console.error('PDF export error:', err);
    } finally {
      setIsExportingPdf(false);
      setPdfProgress(null);
    }
  };

  // Browser Direct Print Trigger
  const handleBrowserPrint = () => {
    window.print();
  };

  // Single Card PNG Download
  const handleDownloadSinglePng = async () => {
    await exportSingleCardImage('single-preview-card', `card_${currentAttendee.regNo}_${currentAttendee.name}.png`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-bangla">
      {/* Top Navigation Bar */}
      <header className="no-print sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-md shadow-emerald-900/40">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  {config.mainTitle} - ইনভাইটেশন কার্ড জেনারেটর
                </h1>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] bg-emerald-500/20 text-emerald-300 font-semibold rounded-full border border-emerald-500/30">
                  A4 ৪-ইন-১ প্রিন্ট
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                হুবহু ডিজাইন • বাল্ক CSV জেনারেশন • প্রতি A4 পেজে ৪টি কার্ড
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsCsvModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-emerald-700 hover:bg-emerald-600 text-white text-xs sm:text-sm font-semibold rounded-xl transition shadow-sm"
              title="CSV ফাইল আপলোড করে এক সাথে সকল কার্ড তৈরি করুন"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>CSV আপলোড</span>
            </button>

            <button
              onClick={handleBrowserPrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs sm:text-sm font-semibold rounded-xl transition border border-slate-700"
              title="ব্রাউজার থেকে সরাসরি প্রিন্ট বা Save as PDF করুন"
            >
              <Printer className="w-4 h-4 text-emerald-400" />
              <span className="hidden md:inline">প্রিন্ট</span>
            </button>

            <button
              onClick={handleDownloadPdf}
              disabled={isExportingPdf}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs sm:text-sm font-semibold rounded-xl transition shadow-md shadow-emerald-950/50 disabled:opacity-50"
              title="সরাসরি সকল পেজের PDF ডাউনলোড করুন"
            >
              {isExportingPdf ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span>সরাসরি PDF</span>
            </button>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex border-t border-slate-800/80 bg-slate-900/60 text-xs">
          <button
            onClick={() => setActiveView('single')}
            className={`py-2.5 px-4 font-semibold flex items-center gap-2 border-b-2 transition ${
              activeView === 'single'
                ? 'border-emerald-500 text-emerald-400 bg-slate-850/50'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>একক কার্ড প্রিভিউ ও এডিটর</span>
          </button>

          <button
            onClick={() => setActiveView('a4print')}
            className={`py-2.5 px-4 font-semibold flex items-center gap-2 border-b-2 transition ${
              activeView === 'a4print'
                ? 'border-emerald-500 text-emerald-400 bg-slate-850/50'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Grid className="w-4 h-4" />
            <span>A4 প্রিন্ট পেজ ভিউ ({a4Pages.length} পেজ, ৪টি/পেজ)</span>
          </button>

          <button
            onClick={() => setActiveView('table')}
            className={`py-2.5 px-4 font-semibold flex items-center gap-2 border-b-2 transition ${
              activeView === 'table'
                ? 'border-emerald-500 text-emerald-400 bg-slate-850/50'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>সদস্য ডাটাবেজ ({attendees.length} জন)</span>
          </button>
        </div>
      </header>

      {/* Main Workspace Area */}
      <main className="no-print flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* VIEW 1: SINGLE CARD PREVIEW & DYNAMIC EDITOR */}
        {activeView === 'single' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Card Preview Column (5 cols) */}
            <div className="lg:col-span-5 flex flex-col items-center">
              {/* Attendee Switcher / Pagination Bar */}
              <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl p-2.5 mb-3 flex items-center justify-between shadow-sm">
                <button
                  onClick={() => {
                    const prevIdx = (currentIndex - 1 + attendees.length) % attendees.length;
                    setSelectedAttendeeId(attendees[prevIdx].id);
                  }}
                  className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition"
                  title="পূর্ববর্তী সদস্য"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="text-center">
                  <span className="text-xs font-bold text-white block">
                    সদস্য {currentIndex + 1} / {attendees.length}
                  </span>
                  <span className="text-[11px] text-emerald-400 font-mono">
                    {currentAttendee.name} ({currentAttendee.regNo})
                  </span>
                </div>

                <button
                  onClick={() => {
                    const nextIdx = (currentIndex + 1) % attendees.length;
                    setSelectedAttendeeId(attendees[nextIdx].id);
                  }}
                  className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition"
                  title="পরবর্তী সদস্য"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Live Preview Card */}
              <div className="w-full max-w-md mx-auto">
                <InvitationCard
                  cardId="single-preview-card"
                  attendee={currentAttendee}
                  config={config}
                  onPhotoUpload={handlePhotoUpload}
                />
              </div>

              {/* Single Card Quick Action Buttons */}
              <div className="w-full max-w-md mt-4 flex items-center justify-between gap-2">
                <button
                  onClick={handleDownloadSinglePng}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-semibold text-slate-200 hover:text-white transition shadow-sm"
                >
                  <ImageIcon className="w-4 h-4 text-emerald-400" />
                  <span>সিঙ্গেল PNG ডাউনলোড</span>
                </button>

                <button
                  onClick={handleDuplicateSingleAttendeeForA4}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-800/60 rounded-xl text-xs font-semibold text-emerald-300 transition shadow-sm"
                  title="এই ১ জনের তথ্য দিয়ে একটি পুরো A4 পেজ (৪টি কপি) তৈরি করুন"
                >
                  <Copy className="w-4 h-4 text-emerald-400" />
                  <span>A4 পেজে ৪টি ডুপ্লিকেট</span>
                </button>
              </div>
            </div>

            {/* Right: Dynamic Editor Panel (7 cols) */}
            <div className="lg:col-span-7">
              <DynamicEditor
                selectedAttendee={currentAttendee}
                config={config}
                onUpdateAttendee={handleUpdateAttendee}
                onUpdateConfig={setConfig}
              />
            </div>
          </div>
        )}

        {/* VIEW 2: A4 PRINT SHEET PREVIEW (4 CARDS PER PAGE) */}
        {activeView === 'a4print' && (
          <div className="flex flex-col items-center space-y-6">
            {/* Top Toolbar for A4 Preview */}
            <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl">
                  <Grid className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">
                    A4 সাইজ পেজ লেআউট (প্রতি পাতায় ৪টি আইডি কার্ড)
                  </h3>
                  <p className="text-xs text-slate-400">
                    মোট {attendees.length} জন সদস্যের জন্য {a4Pages.length} টি A4 পাতা তৈরি হয়েছে
                  </p>
                </div>
              </div>

              {/* Scale Zoom Controls & Export Actions */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
                  <span className="text-slate-400">জুম:</span>
                  <button
                    onClick={() => setA4Scale(Math.max(0.4, a4Scale - 0.1))}
                    className="px-2 py-0.5 bg-slate-800 rounded text-slate-300 hover:text-white"
                  >
                    -
                  </button>
                  <span className="font-mono font-semibold text-slate-200">
                    {Math.round(a4Scale * 100)}%
                  </span>
                  <button
                    onClick={() => setA4Scale(Math.min(1.0, a4Scale + 0.1))}
                    className="px-2 py-0.5 bg-slate-800 rounded text-slate-300 hover:text-white"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={handleBrowserPrint}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition border border-slate-700"
                >
                  <Printer className="w-4 h-4 text-emerald-400" />
                  <span>প্রিন্ট করুন</span>
                </button>

                <button
                  onClick={handleDownloadPdf}
                  disabled={isExportingPdf}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition shadow-md shadow-emerald-950/60"
                >
                  <Download className="w-4 h-4" />
                  <span>সরাসরি PDF ডাউনলোড</span>
                </button>
              </div>
            </div>

            {/* A4 Sheets Render Container (scaled for screen preview) */}
            <div
              className="w-full flex flex-col items-center space-y-12 py-4 overflow-x-auto"
              style={{
                transform: `scale(${a4Scale})`,
                transformOrigin: 'top center',
                marginBottom: `${(1 - a4Scale) * -297 * a4Pages.length}mm`,
              }}
            >
              {a4Pages.map((pageAttendees, pageIndex) => (
                <PrintA4Sheet
                  key={`page-${pageIndex}`}
                  sheetId={`a4-page-render-${pageIndex}`}
                  pageIndex={pageIndex}
                  totalPages={a4Pages.length}
                  attendees={pageAttendees}
                  config={config}
                />
              ))}
            </div>
          </div>
        )}

        {/* VIEW 3: ATTENDEE DATABASE TABLE */}
        {activeView === 'table' && (
          <div className="space-y-6">
            <AttendeeTable
              attendees={attendees}
              selectedAttendeeId={selectedAttendeeId}
              onSelectAttendee={(id) => {
                setSelectedAttendeeId(id);
                setActiveView('single');
              }}
              onAddAttendee={handleAddAttendee}
              onUpdateAttendee={handleUpdateAttendee}
              onDeleteAttendee={handleDeleteAttendee}
              onLoadSampleData={handleLoadSampleData}
              onPhotoUpload={handlePhotoUpload}
            />
          </div>
        )}
      </main>

      {/* PRINT-ONLY SECTION (Rendered ONLY when window.print() is called) */}
      <div className="print-only">
        {a4Pages.map((pageAttendees, pageIndex) => (
          <PrintA4Sheet
            key={`print-real-${pageIndex}`}
            sheetId={`print-real-page-${pageIndex}`}
            pageIndex={pageIndex}
            totalPages={a4Pages.length}
            attendees={pageAttendees}
            config={config}
          />
        ))}
      </div>

      {/* CSV Uploader Modal */}
      <CsvUploaderModal
        isOpen={isCsvModalOpen}
        onClose={() => setIsCsvModalOpen(false)}
        onImport={handleCsvImport}
      />

      {/* PDF Export Progress Modal */}
      {isExportingPdf && pdfProgress && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm font-bangla">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
            <div>
              <h4 className="font-bold text-white text-base">পিডিএফ জেনারেট হচ্ছে</h4>
              <p className="text-xs text-slate-400 mt-1">{pdfProgress.stage}</p>
            </div>
            {/* Progress Bar */}
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-emerald-500 h-full transition-all duration-300"
                style={{
                  width: `${(pdfProgress.current / pdfProgress.total) * 100}%`,
                }}
              />
            </div>
            <p className="text-[11px] text-slate-500">
              অনুগ্রহ করে অপেক্ষা করুন, হাই-রেজোলিউশন PDF প্রস্তুত হচ্ছে...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
