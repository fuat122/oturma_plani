import React, { useState, useMemo } from 'react';
import { Classroom, Student, StudentObservation, ClassNote, Teacher, ObservationCategory } from '../types';
import {
  X,
  Search,
  User,
  Calendar,
  MessageSquare,
  Clock,
  Sparkles,
  Send,
  BookOpen,
  Filter,
  CheckCircle2,
  Trash2,
  Tag,
  ShieldCheck,
} from 'lucide-react';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  classroom: Classroom;
  activeTeacher: Teacher;
  initialSelectedStudentId?: string | null;
  onAddObservation: (
    studentId: string,
    category: ObservationCategory,
    content: string,
    date: string
  ) => void;
  onDeleteObservation: (obsId: string) => void;
  onAddClassNote: (content: string, date: string) => void;
  onDeleteClassNote: (noteId: string) => void;
}

const CATEGORY_MAP: Record<ObservationCategory, { label: string; bg: string; text: string; icon: string }> = {
  katilim: { label: 'Derse Katılım', bg: 'bg-emerald-50', text: 'text-emerald-700', icon: '🎯' },
  davranis: { label: 'Davranış & Uyum', bg: 'bg-blue-50', text: 'text-blue-700', icon: '⚖️' },
  arkadas: { label: 'Sıra Arkadaşı İlişkisi', bg: 'bg-purple-50', text: 'text-purple-700', icon: '🤝' },
  odev: { label: 'Ödev & Hazırlık', bg: 'bg-amber-50', text: 'text-amber-700', icon: '📝' },
  genel: { label: 'Genel Gözlem', bg: 'bg-slate-100', text: 'text-slate-700', icon: '💡' },
};

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  classroom,
  activeTeacher,
  initialSelectedStudentId,
  onAddObservation,
  onDeleteObservation,
  onAddClassNote,
  onDeleteClassNote,
}) => {
  if (!isOpen) return null;

  // Active view: 'student' or 'class_notes'
  const [activeTab, setActiveTab] = useState<'student' | 'class_notes'>('student');

  // Search filter for students listbox
  const [searchQuery, setSearchQuery] = useState('');

  // Selected student
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    initialSelectedStudentId || classroom.students[0]?.id || ''
  );

  // New observation form states
  const [obsDate, setObsDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [obsCategory, setObsCategory] = useState<ObservationCategory>('katilim');
  const [obsContent, setObsContent] = useState('');

  // New class note states
  const [classNoteDate, setClassNoteDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [classNoteContent, setClassNoteContent] = useState('');

  // STRICT ISOLATION FILTER:
  // Students strictly belong to this active classroom and teacher
  const filteredStudents = useMemo(() => {
    return classroom.students.filter((st) => {
      const matchQuery =
        st.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        st.studentNumber.includes(searchQuery);
      return matchQuery;
    });
  }, [classroom.students, searchQuery]);

  const currentStudent = classroom.students.find((s) => s.id === selectedStudentId);

  // Student observations sorted descending by date
  const studentObservations = useMemo(() => {
    if (!currentStudent) return [];
    return classroom.observations
      .filter((o) => o.studentId === currentStudent.id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [classroom.observations, currentStudent]);

  // General class notes sorted descending by date
  const sortedClassNotes = useMemo(() => {
    return [...classroom.classNotes].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [classroom.classNotes]);

  const handleSaveObservation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!obsContent.trim() || !currentStudent) return;
    onAddObservation(currentStudent.id, obsCategory, obsContent.trim(), obsDate);
    setObsContent('');
  };

  const handleSaveClassNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!classNoteContent.trim()) return;
    onAddClassNote(classNoteContent.trim(), classNoteDate);
    setClassNoteContent('');
  };

  // Find seat info for student
  const currentSeat = currentStudent
    ? classroom.seats.find((s) => s.studentId === currentStudent.id)
    : null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 no-print animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl h-[92vh] max-h-[85vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Modal Header */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5">
                <h2 className="text-sm sm:text-base md:text-lg font-bold text-slate-900 tracking-tight truncate">
                  Öğrenci Takip & Gözlem Paneli
                </h2>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <ShieldCheck className="w-3 h-3" />
                  {classroom.name}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 truncate hidden sm:block">
                Danışman: <span className="font-semibold text-slate-700">{activeTeacher.name}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* View Switcher Tabs */}
            <div className="flex bg-slate-200/80 p-1 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab('student')}
                className={`px-2.5 sm:px-3 py-1 rounded-lg transition-all ${
                  activeTab === 'student'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Öğrenciler
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('class_notes')}
                className={`px-2.5 sm:px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
                  activeTab === 'class_notes'
                    ? 'bg-white text-amber-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>Sınıf Notları</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 sm:p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-200/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Two-Panel Layout */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
          {activeTab === 'student' ? (
            <>
              {/* LEFT PANEL: Isolated Student Listbox with Search */}
              <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-slate-200 flex flex-col bg-slate-50/50 max-h-[35vh] md:max-h-none shrink-0">
                {/* Search Box */}
                <div className="p-2.5 sm:p-3 border-b border-slate-200 bg-white shrink-0">
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Öğrenci ara (İsim veya No)..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-all min-h-[40px]"
                    />
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-slate-500 mt-1.5 px-1">
                    <span>{classroom.name} Öğrencileri</span>
                    <span className="font-semibold">{filteredStudents.length} Kayıt</span>
                  </div>
                </div>

                {/* Listbox */}
                <div className="flex-1 overflow-y-auto p-2 space-y-1.5 pb-20 md:pb-6 touch-pan-y">
                  {filteredStudents.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400">
                      Öğrenci bulunamadı.
                    </div>
                  ) : (
                    filteredStudents.map((st) => {
                      const isSelected = st.id === selectedStudentId;
                      const obsCount = classroom.observations.filter((o) => o.studentId === st.id).length;
                      const seat = classroom.seats.find((s) => s.studentId === st.id);

                      return (
                        <button
                          key={st.id}
                          type="button"
                          onClick={() => setSelectedStudentId(st.id)}
                          className={`w-full text-left p-2.5 rounded-xl transition-all flex items-center justify-between gap-2 ${
                            isSelected
                              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                              : 'bg-white hover:bg-slate-100 border border-slate-200/70 text-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                                isSelected
                                  ? 'bg-white/20 text-white'
                                  : st.gender === 'K'
                                  ? 'bg-rose-100 text-rose-700'
                                  : 'bg-blue-100 text-blue-700'
                              }`}
                            >
                              {st.fullName.charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <div
                                className={`text-xs font-semibold truncate ${
                                  isSelected ? 'text-white' : 'text-slate-900'
                                }`}
                              >
                                {st.fullName}
                              </div>
                              <div
                                className={`text-[10px] font-mono flex items-center gap-1.5 ${
                                  isSelected ? 'text-blue-100' : 'text-slate-500'
                                }`}
                              >
                                <span>No: {st.studentNumber}</span>
                                <span>•</span>
                                <span>{seat ? seat.code : 'Sırasız'}</span>
                              </div>
                            </div>
                          </div>

                          {obsCount > 0 && (
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                                isSelected
                                  ? 'bg-white text-blue-800'
                                  : 'bg-slate-100 text-slate-600 border border-slate-200'
                              }`}
                            >
                              {obsCount}
                            </span>
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              {/* RIGHT PANEL: Timeline & Observation Entry */}
              <div className="flex-1 flex flex-col overflow-y-auto p-4 sm:p-6 bg-white pb-24 sm:pb-6">
                {currentStudent ? (
                  <div className="space-y-6 max-w-3xl">
                    {/* Active Student Hero Card */}
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-50 to-blue-50/40 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3.5">
                        <div
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg shadow-xs ${
                            currentStudent.gender === 'K'
                              ? 'bg-rose-500 text-white'
                              : 'bg-blue-600 text-white'
                          }`}
                        >
                          {currentStudent.fullName.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-bold text-slate-900">
                              {currentStudent.fullName}
                            </h3>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                currentStudent.gender === 'K'
                                  ? 'bg-rose-100 text-rose-700'
                                  : 'bg-blue-100 text-blue-700'
                              }`}
                            >
                              {currentStudent.gender === 'K' ? 'Kız Öğrenci' : 'Erkek Öğrenci'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5 font-mono">
                            Okul No: <strong className="text-slate-800">{currentStudent.studentNumber}</strong> • 
                            Sınıf: <strong className="text-slate-800">{classroom.name}</strong> • 
                            Mevcut Sıra:{' '}
                            <strong className="text-blue-700">
                              {currentSeat ? `${currentSeat.blockName} (${currentSeat.code})` : 'Atanmadı'}
                            </strong>
                          </p>
                        </div>
                      </div>

                      <div className="text-right sm:text-right text-xs text-slate-500">
                        <span className="block text-[10px] text-slate-400">Toplam Gözlem</span>
                        <strong className="text-lg font-bold text-slate-800">
                          {studentObservations.length}
                        </strong>
                      </div>
                    </div>

                    {/* New Observation Form */}
                    <form
                      onSubmit={handleSaveObservation}
                      className="p-4 rounded-2xl border border-blue-200/80 bg-blue-50/20 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
                          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                          Yeni Öğretmen Gözlemi Ekle
                        </span>
                        <div className="flex items-center gap-2">
                          <label className="text-[11px] text-slate-500 font-medium">Tarih:</label>
                          <input
                            type="date"
                            value={obsDate}
                            onChange={(e) => setObsDate(e.target.value)}
                            className="text-xs px-2.5 py-1 rounded-lg border border-slate-200 bg-white font-mono focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                            required
                          />
                        </div>
                      </div>

                      {/* Category Chips */}
                      <div className="flex flex-wrap gap-1.5">
                        {(Object.keys(CATEGORY_MAP) as ObservationCategory[]).map((catKey) => {
                          const cat = CATEGORY_MAP[catKey];
                          const isActive = obsCategory === catKey;
                          return (
                            <button
                              key={catKey}
                              type="button"
                              onClick={() => setObsCategory(catKey)}
                              className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
                                isActive
                                  ? 'bg-blue-600 text-white shadow-xs'
                                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                              }`}
                            >
                              <span>{cat.icon}</span>
                              <span>{cat.label}</span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Content Textarea */}
                      <div className="relative">
                        <textarea
                          rows={2}
                          value={obsContent}
                          onChange={(e) => setObsContent(e.target.value)}
                          placeholder={`${currentStudent.fullName} hakkında gözlem, sıra arkadaşı uyumu, derse odak veya gelişim notu giriniz...`}
                          className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 resize-none transition-all placeholder:text-slate-400"
                          required
                        />
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[10px] text-slate-500 italic">
                          Google E-Tabloda otomatik olarak <strong>[{currentStudent.fullName}]: ...</strong> etiketiyle kaydedilir.
                        </span>
                        <button
                          type="submit"
                          disabled={!obsContent.trim()}
                          className="px-4 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 disabled:opacity-40 transition-all flex items-center gap-1.5 shadow-xs"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Gözlemi Kaydet</span>
                        </button>
                      </div>
                    </form>

                    {/* Timeline of Observations */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          Gelişim & Değerlendirme Zaman Tüneli
                        </h4>
                        <span className="text-[11px] text-slate-500">
                          {studentObservations.length} Kayıtlı Gözlem
                        </span>
                      </div>

                      {studentObservations.length === 0 ? (
                        <div className="py-10 text-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50">
                          <p className="text-xs text-slate-500 font-medium">
                            Henüz {currentStudent.fullName} için kayıtlı bir gözlem notu bulunmuyor.
                          </p>
                          <p className="text-[11px] text-slate-400 mt-1">
                            Yukarıdaki formdan ilk gözlem notunuzu ekleyebilirsiniz.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3 relative before:absolute before:inset-y-0 before:left-4 before:w-0.5 before:bg-slate-200">
                          {studentObservations.map((obs) => {
                            const cat = CATEGORY_MAP[obs.category] || CATEGORY_MAP.genel;

                            return (
                              <div
                                key={obs.id}
                                className="relative pl-9 group transition-all"
                              >
                                {/* Timeline Dot */}
                                <div className="absolute left-2.5 top-3 w-3 h-3 rounded-full bg-blue-600 ring-4 ring-white border border-blue-400" />

                                <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-xs transition-shadow">
                                  <div className="flex items-center justify-between text-xs mb-1.5">
                                    <div className="flex items-center gap-2">
                                      <span
                                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${cat.bg} ${cat.text}`}
                                      >
                                        <span>{cat.icon}</span>
                                        <span>{cat.label}</span>
                                      </span>
                                      <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {obs.date}
                                      </span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                      <span className="text-[11px] text-slate-400">
                                        {obs.teacherName}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => onDeleteObservation(obs.id)}
                                        className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-600 p-1 rounded transition-opacity"
                                        title="Gözlemi sil"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>

                                  <p className="text-xs text-slate-800 leading-relaxed font-sans">
                                    <strong className="text-slate-900 font-semibold font-mono">
                                      [{obs.studentName}]:
                                    </strong>{' '}
                                    {obs.content}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-12 text-center text-slate-400 text-xs">
                    Soldaki listeden bir öğrenci seçiniz.
                  </div>
                )}
              </div>
            </>
          ) : (
            /* CLASS GENERAL NOTES TAB (Row 24) */
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto bg-slate-50/40 pb-24 sm:pb-6">
              <div className="max-w-2xl mx-auto space-y-6">
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">📢</span>
                    <h3 className="text-sm font-bold">
                      {classroom.name} Sınıf Genel Notları (Google E-Tablo Satır 24)
                    </h3>
                  </div>
                  <p className="text-xs text-amber-800 mt-1">
                    Buraya girdiğiniz notlar, belirli bir öğrenciye değil sınıfın genel durumuna (ders işlenişi, yazılı hazırlıkları, oturma düzeni kararları) aittir. E-Tabloda Satır 24'e ve ilgili günün tarih sütununa işlenir.
                  </p>
                </div>

                {/* Class Note Form */}
                <form
                  onSubmit={handleSaveClassNote}
                  className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Genel Not Düş
                    </span>
                    <div className="flex items-center gap-2">
                      <label className="text-[11px] text-slate-500 font-medium">Tarih:</label>
                      <input
                        type="date"
                        value={classNoteDate}
                        onChange={(e) => setClassNoteDate(e.target.value)}
                        className="text-xs px-2.5 py-1 rounded-lg border border-slate-200 bg-white font-mono focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>

                  <textarea
                    rows={3}
                    value={classNoteContent}
                    onChange={(e) => setClassNoteContent(e.target.value)}
                    placeholder="Örn: Sınıf genelinde trigonometri sınav tekrarı yapıldı, oturma düzeni revize edildi..."
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500 resize-none transition-all"
                    required
                  />

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={!classNoteContent.trim()}
                      className="px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold disabled:opacity-40 transition-all flex items-center gap-1.5 shadow-xs"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Sınıf Notunu Kaydet</span>
                    </button>
                  </div>
                </form>

                {/* Class Notes Timeline */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Geçmiş Sınıf Notları ({sortedClassNotes.length})
                  </h4>

                  {sortedClassNotes.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
                      Henüz kaydedilmiş genel sınıf notu bulunmuyor.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {sortedClassNotes.map((note) => (
                        <div
                          key={note.id}
                          className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between gap-2 group"
                        >
                          <div className="flex items-center justify-between text-xs text-slate-500">
                            <span className="font-mono font-semibold text-slate-700 flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-amber-600" />
                              {note.date}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] text-slate-400">{note.teacherName}</span>
                              <button
                                type="button"
                                onClick={() => onDeleteClassNote(note.id)}
                                className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-600 p-1 rounded transition-opacity"
                                title="Notu sil"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                          <p className="text-xs text-slate-800 leading-relaxed font-sans">
                            {note.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
