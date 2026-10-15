import React, { useState, useEffect, useMemo } from 'react';
import { Classroom, Student } from '../types';
import {
  X,
  UserPlus,
  Users,
  Trash2,
  Check,
  Cloud,
  FileText,
  AlertTriangle,
  ClipboardList,
  Sparkles,
  Save,
  RotateCcw,
  CheckCircle2,
  Info,
} from 'lucide-react';

interface StudentManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  classroom: Classroom;
  onAddStudent: (student: Omit<Student, 'id'>) => void;
  onDeleteStudent: (studentId: string) => void;
  onClearAllStudents: () => void;
  onUpdateStudents: (updatedStudents: Student[]) => void;
  onBulkAddStudents: (
    students: Array<{ studentNumber: string; fullName: string; gender: 'K' | 'E' }>,
    replaceExisting: boolean
  ) => void;
}

type TabType = 'edit' | 'bulk' | 'single';

export const StudentManagementModal: React.FC<StudentManagementModalProps> = ({
  isOpen,
  onClose,
  classroom,
  onAddStudent,
  onDeleteStudent,
  onClearAllStudents,
  onUpdateStudents,
  onBulkAddStudents,
}) => {
  if (!isOpen) return null;

  const totalSeats = classroom.seats.length || classroom.maxCapacity || 24;

  // Tabs: 'edit' (Düzenle), 'bulk' (Toplu Ekle), 'single' (Tekil Ekle)
  const [activeTab, setActiveTab] = useState<TabType>(() =>
    classroom.students.length === 0 ? 'bulk' : 'edit'
  );

  // Editable local copy of students
  const [editableStudents, setEditableStudents] = useState<Student[]>(() => [
    ...classroom.students,
  ]);
  const [hasUnsavedEdits, setHasUnsavedEdits] = useState(false);

  // Sync if classroom.students change externally and no unsaved edits
  useEffect(() => {
    setEditableStudents([...classroom.students]);
    setHasUnsavedEdits(false);
    if (classroom.students.length === 0) {
      setActiveTab('bulk');
    }
  }, [classroom.students]);

  // Confirmation dialog for Bulk Delete
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Single Add form state
  const [singleNo, setSingleNo] = useState('');
  const [singleName, setSingleName] = useState('');
  const [singleGender, setSingleGender] = useState<'K' | 'E'>('E');
  const [singleError, setSingleError] = useState<string | null>(null);

  // Bulk Add state
  const [bulkText, setBulkText] = useState('');
  const [bulkReplace, setBulkReplace] = useState(true);
  const [bulkSuccessMsg, setBulkSuccessMsg] = useState<string | null>(null);

  // Handle in-place field edit for a student
  const handleStudentFieldChange = (
    studentId: string,
    field: 'studentNumber' | 'fullName' | 'gender',
    value: string
  ) => {
    setEditableStudents((prev) =>
      prev.map((s) => {
        if (s.id !== studentId) return s;
        return {
          ...s,
          [field]: value,
        };
      })
    );
    setHasUnsavedEdits(true);
  };

  // Save all in-place edits to Firestore & State
  const handleSaveAllEdits = () => {
    // Validate duplicates or empty
    const numbers = new Set<string>();
    for (const st of editableStudents) {
      if (!st.studentNumber.trim() || !st.fullName.trim()) {
        alert('Lütfen tüm öğrencilerin numara ve ad-soyad bilgilerini eksiksiz doldurun.');
        return;
      }
      if (numbers.has(st.studentNumber.trim())) {
        alert(`Mükerrer numara bulundu: #${st.studentNumber}. Her öğrencinin numarası benzersiz olmalıdır.`);
        return;
      }
      numbers.add(st.studentNumber.trim());
    }

    onUpdateStudents(editableStudents);
    setHasUnsavedEdits(false);
  };

  // Single Add Submit
  const handleSingleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setSingleError(null);

    if (classroom.students.length >= totalSeats) {
      setSingleError(`Bu sınıfın tüm sıraları (${totalSeats} sıra) dolmuştur.`);
      return;
    }

    if (!singleNo.trim() || !singleName.trim()) {
      setSingleError('Lütfen numara ve ad-soyad giriniz.');
      return;
    }

    const exists = classroom.students.some((s) => s.studentNumber === singleNo.trim());
    if (exists) {
      setSingleError(`Bu numara (#${singleNo}) zaten kayıtlı.`);
      return;
    }

    onAddStudent({
      studentNumber: singleNo.trim(),
      fullName: singleName.trim(),
      gender: singleGender,
    });

    setSingleNo('');
    setSingleName('');
    setActiveTab('edit');
  };

  // Smart Parser for Bulk Text Paste
  const parsedBulkStudents = useMemo(() => {
    if (!bulkText.trim()) return [];

    const lines = bulkText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const result: Array<{ studentNumber: string; fullName: string; gender: 'K' | 'E' }> = [];

    lines.forEach((line, index) => {
      // Clean tab or comma delimiters
      const cleanLine = line.replace(/,/g, ' ').replace(/\t/g, ' ').replace(/\s+/g, ' ');
      const tokens = cleanLine.split(' ').filter(Boolean);
      if (tokens.length === 0) return;

      let studentNumber = '';
      let gender: 'K' | 'E' = 'E';
      let nameParts: string[] = [];

      // Check first token: is it a number?
      const firstNumMatch = tokens[0].match(/#?(\d+)/);
      if (firstNumMatch) {
        studentNumber = firstNumMatch[1];
        tokens.shift();
      } else {
        studentNumber = String(100 + index + 1);
      }

      // Check last token: is it gender?
      if (tokens.length > 0) {
        const last = tokens[tokens.length - 1].toLowerCase();
        if (last === 'k' || last === 'kız' || last === 'kadin' || last === 'kız' || last === '(k)' || last === 'bayan') {
          gender = 'K';
          tokens.pop();
        } else if (last === 'e' || last === 'erkek' || last === '(e)' || last === 'bay') {
          gender = 'E';
          tokens.pop();
        }
      }

      // Check remaining tokens for name
      nameParts = tokens;
      let fullName = nameParts.join(' ').trim();

      // If name is still empty or looks like dummy placeholder, provide a clean label
      if (!fullName) {
        fullName = `Öğrenci ${studentNumber}`;
      }

      result.push({
        studentNumber,
        fullName,
        gender,
      });
    });

    return result;
  }, [bulkText]);

  // Execute Bulk Add
  const handleExecuteBulkAdd = () => {
    if (parsedBulkStudents.length === 0) return;

    onBulkAddStudents(parsedBulkStudents, bulkReplace);
    setBulkText('');
    setBulkSuccessMsg(`${parsedBulkStudents.length} öğrenci başarıyla sınıfa aktarıldı!`);
    setTimeout(() => {
      setBulkSuccessMsg(null);
      setActiveTab('edit');
    }, 1200);
  };

  // Sample quick paste data
  const handleLoadSampleRoster = () => {
    const sample = `101 Ahmet Eren Yılmaz E
104 Zeynep Su Kara K
108 Kerem Batuhan Demir E
112 Elif Naz Şahin K
115 Emir Kaan Çelik E
119 Defne Aydın K
122 Ege Baran Arslan E
127 Nehir Koç K
131 Yağız Alp Kurt E
135 İrem Doğan K
140 Umut Tuna Yıldız E
144 Ceren Öztürk K
149 Mert Ali Güneş E
153 Duru Aktaş K
158 Burak Can Yavuz E
162 Ada Yüksel K
167 Alperen Polat E
171 Buse Tekin K
176 Çağan Deniz Er E
180 Melis Kılıç K
185 Yiğit Akın E
189 Sude Nur Çetin K
194 Caner Özdemir E
198 Selin Yıldırım K`;
    setBulkText(sample);
    setBulkReplace(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 no-print animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                  {classroom.name} Sınıfı & Öğrenci Yönetimi
                </h2>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                  {classroom.grade}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Kapasite: <strong className="text-slate-800">{classroom.students.length} / {totalSeats}</strong> Öğrenci ({totalSeats} Sıra)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation & Top Bar Actions */}
        <div className="px-6 py-3 border-b border-slate-200 bg-white flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl">
            <button
              type="button"
              onClick={() => setActiveTab('edit')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'edit'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ClipboardList className="w-3.5 h-3.5" />
              <span>Öğrenci Listesi ({classroom.students.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('bulk')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'bulk'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Toplu Ekle (Kopyala-Yapıştır)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('single')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'single'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Hızlı Tekil Ekle</span>
            </button>
          </div>

          {/* Action: Clear All Students */}
          {classroom.students.length > 0 && (
            <button
              type="button"
              onClick={() => setShowClearConfirm(true)}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-rose-700 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 border border-rose-200 flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
              title="Sınıftaki tüm öğrencileri sil ve oturma planını sıfırla"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Tüm Öğrencileri Sil</span>
            </button>
          )}
        </div>

        {/* Modal Main Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* TAB 1: EDIT ALL STUDENTS IN-PLACE */}
          {activeTab === 'edit' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="text-xs text-slate-500 font-medium">
                  Öğrencilerin <strong>Okul No</strong>, <strong>Ad Soyad</strong> ve <strong>Cinsiyet</strong> bilgilerini aşağıdan doğrudan düzenleyebilirsiniz.
                </div>

                {hasUnsavedEdits && (
                  <button
                    type="button"
                    onClick={handleSaveAllEdits}
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Değişiklikleri Kaydet</span>
                  </button>
                )}
              </div>

              {editableStudents.length === 0 ? (
                <div className="py-14 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/60 p-6">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
                    <Users className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-800">Sınıfta Henüz Öğrenci Yok</h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
                    Tüm öğrenciler silinmiş veya henüz eklenmemiş. Toplu ekleme alanından kopyala-yapıştır ile listenizi hemen oluşturabilirsiniz.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('bulk')}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs inline-flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Toplu Öğrenci Listesi Yapıştır</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="hidden sm:grid grid-cols-12 gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 pb-1">
                    <div className="col-span-1">#</div>
                    <div className="col-span-3">Okul No</div>
                    <div className="col-span-5">Öğrenci Adı Soyadı</div>
                    <div className="col-span-2 text-center">Cinsiyet</div>
                    <div className="col-span-1 text-right">İşlem</div>
                  </div>

                  {editableStudents.map((st, index) => {
                    const isGirl = st.gender === 'K';
                    const seat = classroom.seats.find((s) => s.studentId === st.id);

                    return (
                      <div
                        key={st.id}
                        className={`p-2.5 sm:p-3 rounded-2xl border transition-all ${
                          isGirl
                            ? 'bg-rose-50/70 border-rose-200 hover:border-rose-300'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        } flex flex-col sm:grid sm:grid-cols-12 gap-2 sm:items-center`}
                      >
                        {/* Index */}
                        <div className="sm:col-span-1 flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-slate-400">
                            {index + 1}.
                          </span>
                        </div>

                        {/* Student Number Input */}
                        <div className="sm:col-span-3">
                          <div className="relative">
                            <input
                              type="text"
                              value={st.studentNumber}
                              onChange={(e) =>
                                handleStudentFieldChange(st.id, 'studentNumber', e.target.value)
                              }
                              placeholder="No"
                              className={`w-full text-xs font-mono font-bold px-3 py-1.5 rounded-xl border focus:outline-hidden focus:ring-2 ${
                                isGirl
                                  ? 'border-rose-300 bg-white text-rose-900 focus:ring-rose-400'
                                  : 'border-slate-300 bg-slate-50/50 text-slate-800 focus:ring-blue-500'
                              }`}
                            />
                          </div>
                        </div>

                        {/* Student Full Name Input */}
                        <div className="sm:col-span-5">
                          <input
                            type="text"
                            value={st.fullName}
                            onChange={(e) =>
                              handleStudentFieldChange(st.id, 'fullName', e.target.value)
                            }
                            placeholder="Adı Soyadı"
                            className={`w-full text-xs font-semibold px-3 py-1.5 rounded-xl border focus:outline-hidden focus:ring-2 ${
                              isGirl
                                ? 'border-rose-300 bg-white text-rose-950 focus:ring-rose-400'
                                : 'border-slate-300 bg-white text-slate-900 focus:ring-blue-500'
                            }`}
                          />
                        </div>

                        {/* Gender Toggle: Kız (Pembe) / Erkek (Mavi) */}
                        <div className="sm:col-span-2 flex items-center justify-center">
                          <div className="inline-flex rounded-xl p-0.5 bg-slate-100 border border-slate-200">
                            <button
                              type="button"
                              onClick={() => handleStudentFieldChange(st.id, 'gender', 'K')}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                                isGirl
                                  ? 'bg-rose-500 text-white shadow-xs'
                                  : 'text-slate-500 hover:text-slate-800'
                              }`}
                            >
                              Kız
                            </button>
                            <button
                              type="button"
                              onClick={() => handleStudentFieldChange(st.id, 'gender', 'E')}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                                !isGirl
                                  ? 'bg-blue-600 text-white shadow-xs'
                                  : 'text-slate-500 hover:text-slate-800'
                              }`}
                            >
                              Erkek
                            </button>
                          </div>
                        </div>

                        {/* Delete single student */}
                        <div className="sm:col-span-1 flex items-center justify-end">
                          <button
                            type="button"
                            onClick={() => onDeleteStudent(st.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Öğrenciyi sil"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: BULK ADD (COPY - PASTE) */}
          {activeTab === 'bulk' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 text-xs text-sky-900 flex items-start gap-3">
                <Info className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-bold">Toplu Öğrenci Listesi Nasıl Eklenir?</div>
                  <p className="text-[11px] text-sky-800 leading-relaxed">
                    e-Okul, Excel veya Word'den kopyaladığınız listeyi aşağıdaki kutuya yapıştırın. Sistem satır satır Okul No, Ad Soyad ve Cinsiyeti (Kız/Erkek) otomatik tespit eder.
                  </p>
                  <div className="text-[10px] font-mono text-sky-700 bg-white/70 p-1.5 rounded-lg border border-sky-200 mt-1">
                    Örnek format: <strong>101 Ahmet Yılmaz E</strong> veya <strong>102 Ayşe Demir Kız</strong>
                  </div>
                </div>
              </div>

              {/* Textarea */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Öğrenci Listesini Yapıştır
                  </label>
                  <button
                    type="button"
                    onClick={handleLoadSampleRoster}
                    className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Örnek 24 Kişilik Liste Doldur</span>
                  </button>
                </div>

                <textarea
                  rows={8}
                  value={bulkText}
                  onChange={(e) => setBulkText(e.target.value)}
                  placeholder={`101 Ahmet Eren Yılmaz E\n102 Zeynep Su Kara K\n103 Mustafa Can Erkek\n104 Elif Şahin Kız...`}
                  className="w-full text-xs font-mono p-3 rounded-2xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 leading-relaxed bg-slate-50/50"
                />
              </div>

              {/* Parser Detection Status */}
              {parsedBulkStudents.length > 0 && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Tespit Edilen: <strong>{parsedBulkStudents.length} Öğrenci</strong>
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">
                      ({parsedBulkStudents.filter((s) => s.gender === 'K').length} Kız,{' '}
                      {parsedBulkStudents.filter((s) => s.gender === 'E').length} Erkek)
                    </span>
                  </div>

                  {/* Mode Selector */}
                  <div className="flex items-center gap-4 pt-2 border-t border-slate-200 text-xs">
                    <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                      <input
                        type="radio"
                        name="bulkMode"
                        checked={bulkReplace}
                        onChange={() => setBulkReplace(true)}
                        className="text-blue-600"
                      />
                      <span>Mevcut listeyi temizleyip sıfırdan oluştur</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                      <input
                        type="radio"
                        name="bulkMode"
                        checked={!bulkReplace}
                        onChange={() => setBulkReplace(false)}
                        className="text-blue-600"
                      />
                      <span>Mevcut öğrencilerin arkasına ekle</span>
                    </label>
                  </div>
                </div>
              )}

              {bulkSuccessMsg && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{bulkSuccessMsg}</span>
                </div>
              )}

              {/* Action Button */}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setBulkText('')}
                  disabled={!bulkText.trim()}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 text-xs font-semibold hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                >
                  Temizle
                </button>
                <button
                  type="button"
                  onClick={handleExecuteBulkAdd}
                  disabled={parsedBulkStudents.length === 0}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold disabled:opacity-40 transition-all shadow-sm flex items-center gap-2 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Listeyi Sınıfa Yükle ({parsedBulkStudents.length} Öğrenci)</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: SINGLE ADD */}
          {activeTab === 'single' && (
            <div className="space-y-4 max-w-lg mx-auto py-2">
              <form onSubmit={handleSingleAdd} className="space-y-3 p-5 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <UserPlus className="w-4 h-4 text-blue-600" />
                  Tekil Öğrenci Bilgileri
                </div>

                {singleError && (
                  <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{singleError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                    Okul Numarası
                  </label>
                  <input
                    type="text"
                    value={singleNo}
                    onChange={(e) => setSingleNo(e.target.value)}
                    placeholder="Örn: 101"
                    className="w-full text-xs font-mono px-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                    Öğrenci Adı Soyadı
                  </label>
                  <input
                    type="text"
                    value={singleName}
                    onChange={(e) => setSingleName(e.target.value)}
                    placeholder="Örn: Ahmet Eren Yılmaz"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                    Cinsiyet
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSingleGender('E')}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        singleGender === 'E'
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      Erkek
                    </button>
                    <button
                      type="button"
                      onClick={() => setSingleGender('K')}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        singleGender === 'K'
                          ? 'bg-rose-500 text-white border-rose-500 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      Kız
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Öğrenciyi Sınıfa Ekle</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Firebase Cloud Firestore Banner */}
        <div className="px-6 py-2.5 bg-sky-50/80 border-t border-sky-200 flex items-center justify-between text-xs text-sky-900">
          <div className="flex items-center gap-2 min-w-0">
            <Cloud className="w-4 h-4 text-sky-600 shrink-0" />
            <span className="truncate">
              Tüm öğrenci ve oturma düzeni değişiklikleri <strong>Firebase Cloud Firestore</strong> veritabanına anında kaydedilir.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div>
            {hasUnsavedEdits && (
              <span className="text-xs font-semibold text-amber-700 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                Kaydedilmemiş değişiklikler var.
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {hasUnsavedEdits && (
              <button
                type="button"
                onClick={handleSaveAllEdits}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Değişiklikleri Kaydet</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
            >
              Kapat
            </button>
          </div>
        </div>
      </div>

      {/* CONFIRMATION DIALOG: TÜM ÖĞRENCİLERİ SİL */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-60 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-rose-200 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900">
                Tüm Öğrencileri Silmek İstediğinize Emin Misiniz?
              </h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                <strong>{classroom.name}</strong> sınıfındaki tüm kayıtlı öğrenciler ({classroom.students.length} öğrenci) ve oturma planındaki yerleşimleri silinecektir.
                Silme işleminden sonra istediğiniz zaman kopyala-yapıştır ile yeni bir liste yükleyebilirsiniz.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
              >
                İptal
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowClearConfirm(false);
                  onClearAllStudents();
                  setActiveTab('bulk');
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                Evet, Tüm Sınıfı Temizle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
