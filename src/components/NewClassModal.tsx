import React, { useState } from 'react';
import { Classroom, GradeLevel, Student, Teacher } from '../types';
import { generateDefaultSeats, generateFlexibleSeats } from '../services/storageService';
import { X, Plus, AlertCircle, Sparkles, School, Users, FileSpreadsheet } from 'lucide-react';

interface NewClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTeacher: Teacher;
  isGoogleConnected: boolean;
  onCreateClass: (newClass: Classroom, createDriveSheet: boolean) => Promise<void>;
}

export const NewClassModal: React.FC<NewClassModalProps> = ({
  isOpen,
  onClose,
  activeTeacher,
  isGoogleConnected,
  onCreateClass,
}) => {
  if (!isOpen) return null;

  const [className, setClassName] = useState('');
  const [grade, setGrade] = useState<GradeLevel>('9. Sınıf');
  const [branchName, setBranchName] = useState('');
  const [layoutType, setLayoutType] = useState<'3-block-standard' | '4-block' | '5-block'>('3-block-standard');
  const [studentRosterMode, setStudentRosterMode] = useState<'sample' | 'empty' | 'custom'>('sample');
  const [customListText, setCustomListText] = useState('');
  const [createDriveSheet, setCreateDriveSheet] = useState(isGoogleConnected);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!className.trim()) {
      setError('Lütfen bir sınıf adı giriniz (örn: 9-B veya Hazırlık-C).');
      return;
    }

    // Generate seats based on layout
    const blockCount = layoutType === '3-block-standard' ? 3 : layoutType === '4-block' ? 4 : 5;
    const seats = layoutType === '3-block-standard' ? generateDefaultSeats() : generateFlexibleSeats(blockCount as any, 4);

    // Prepare student roster
    let students: Student[] = [];

    if (studentRosterMode === 'sample') {
      // Generate 20 sample high school students (<= 23 cap)
      const sampleNames = [
        { name: 'Arda Kaan Şengül', gender: 'E' },
        { name: 'Ayşe Nazlı Yıldız', gender: 'K' },
        { name: 'Baran Çetin', gender: 'E' },
        { name: 'Beyza Nur Doğan', gender: 'K' },
        { name: 'Canberk Akın', gender: 'E' },
        { name: 'Ceyda Su Polat', gender: 'K' },
        { name: 'Doruk Demirtaş', gender: 'E' },
        { name: 'Ece Melis Yılmaz', gender: 'K' },
        { name: 'Furkan Emre Koç', gender: 'E' },
        { name: 'Gamze Kara', gender: 'K' },
        { name: 'Hakan Mert Eren', gender: 'E' },
        { name: 'Hazal Çelik', gender: 'K' },
        { name: 'İlker Can Yavuz', gender: 'E' },
        { name: 'Melike Şahin', gender: 'K' },
        { name: 'Oğuzhan Tekin', gender: 'E' },
        { name: 'Pelin Arslan', gender: 'K' },
        { name: 'Rüzgar Güneş', gender: 'E' },
        { name: 'Selin Aydın', gender: 'K' },
        { name: 'Tuna Berk Kurt', gender: 'E' },
        { name: 'Zeynep Defne Koçak', gender: 'K' },
      ];

      students = sampleNames.map((s, idx) => ({
        id: `st_${Date.now()}_${idx}`,
        studentNumber: String(300 + idx * 4 + 1),
        fullName: s.name,
        gender: s.gender as 'K' | 'E',
      }));
    } else if (studentRosterMode === 'custom' && customListText.trim()) {
      // Parse custom student lines
      const lines = customListText.split('\n').filter((l) => l.trim().length > 0);
      if (lines.length > seats.length) {
        setError(`Sınıf kapasitesi sıra sayısı ile sınırlıdır (En fazla ${seats.length} öğrenci)!`);
        return;
      }

      students = lines.map((line, idx) => {
        const parts = line.split(/[,\t;-]/).map((p) => p.trim());
        const num = parts.length > 1 ? parts[0] : String(400 + idx);
        const name = parts.length > 1 ? parts[1] : parts[0];
        const genRaw = parts.length > 2 ? parts[2].toUpperCase() : 'E';
        const gender = genRaw.startsWith('K') ? 'K' : 'E';

        return {
          id: `st_${Date.now()}_${idx}`,
          studentNumber: num,
          fullName: name || `Öğrenci ${idx + 1}`,
          gender,
        };
      });
    }

    // Capacity validation: Match physical seats (24 seats for 3-block)
    const maxClassCapacity = seats.length || 24;
    if (students.length > maxClassCapacity) {
      setError(`Sistem kuralı: Sınıf kapasitesi sıra sayısı (${maxClassCapacity} sıra) ile sınırlıdır.`);
      return;
    }

    // Assign students to initial seats
    students.forEach((st, idx) => {
      if (idx < seats.length) {
        seats[idx].studentId = st.id;
        st.seatCode = seats[idx].code;
      }
    });

    const newClassroom: Classroom = {
      id: `class_${Date.now()}`,
      teacherId: activeTeacher.id, // Strictly isolated to this teacher
      name: className.trim(),
      grade,
      branchName: branchName.trim() || undefined,
      academicYear: '2026-2027',
      maxCapacity: maxClassCapacity,
      layoutType: layoutType as any,
      students,
      seats,
      observations: [],
      classNotes: [],
      createdAt: new Date().toISOString(),
      syncStatus: 'pending',
    };

    setIsSubmitting(true);
    try {
      await onCreateClass(newClassroom, createDriveSheet);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Sınıf oluşturulurken bir hata oluştu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 no-print animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <School className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                Yeni Sınıf Oluştur
              </h2>
              <p className="text-xs text-slate-500">
                Yetkili Öğretmen: <span className="font-semibold text-slate-700">{activeTeacher.name}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Sınıf Adı & Kademe */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Sınıf / Şube Adı *
              </label>
              <input
                type="text"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                placeholder="Örn: 9-B veya Hazırlık-C"
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-semibold"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Sınıf Kademesi
              </label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value as GradeLevel)}
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="Hazırlık">Hazırlık Sınıfı</option>
                <option value="9. Sınıf">9. Sınıf</option>
                <option value="10. Sınıf">10. Sınıf</option>
                <option value="11. Sınıf">11. Sınıf</option>
                <option value="12. Sınıf">12. Sınıf</option>
              </select>
            </div>
          </div>

          {/* Alan / Şube Açıklaması */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Alan / Program Açıklaması (İsteğe bağlı)
            </label>
            <input
              type="text"
              value={branchName}
              onChange={(e) => setBranchName(e.target.value)}
              placeholder="Örn: Fen & Matematik Ağırlıklı veya Yabancı Dil"
              className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Sınıf Oturma Düzeni */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Oturma Düzeni Şablonu
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setLayoutType('3-block-standard')}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  layoutType === '3-block-standard'
                    ? 'border-blue-600 bg-blue-50/70 text-blue-900 ring-2 ring-blue-500/20'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="text-xs font-bold">3 Bloklu (Standart)</div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  Duvar + Orta + Cam (4x2'şerli)
                </div>
              </button>

              <button
                type="button"
                onClick={() => setLayoutType('4-block')}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  layoutType === '4-block'
                    ? 'border-blue-600 bg-blue-50/70 text-blue-900 ring-2 ring-blue-500/20'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="text-xs font-bold">4 Bloklu Düzen</div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  Geniş derslikler için
                </div>
              </button>

              <button
                type="button"
                onClick={() => setLayoutType('5-block')}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  layoutType === '5-block'
                    ? 'border-blue-600 bg-blue-50/70 text-blue-900 ring-2 ring-blue-500/20'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="text-xs font-bold">5 Bloklu Düzen</div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  Esnek laboratuvar düzeni
                </div>
              </button>
            </div>
            <div className="mt-1 text-[11px] text-slate-500 flex items-center gap-1">
              <span>* Kapasite kuralı: Sistem maksimum <strong>23 öğrenci</strong> kapasitesi ile sınırlandırılmıştır.</span>
            </div>
          </div>

          {/* Öğrenci Kadrosu Seçimi */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Öğrenci Listesi Kaynağı
            </label>
            <div className="flex gap-2 mb-2">
              <button
                type="button"
                onClick={() => setStudentRosterMode('sample')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  studentRosterMode === 'sample'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Örnek Kadro (20 Öğrenci)
              </button>
              <button
                type="button"
                onClick={() => setStudentRosterMode('empty')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  studentRosterMode === 'empty'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Boş Liste
              </button>
              <button
                type="button"
                onClick={() => setStudentRosterMode('custom')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  studentRosterMode === 'custom'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Özel Liste Yapıştır
              </button>
            </div>

            {studentRosterMode === 'custom' && (
              <div className="space-y-1">
                <textarea
                  rows={4}
                  value={customListText}
                  onChange={(e) => setCustomListText(e.target.value)}
                  placeholder="Her satıra bir öğrenci yazın: No, Ad Soyad, Cinsiyet (K/E)&#10;Örn:&#10;101, Ahmet Kaya, E&#10;102, Zeynep Gül, K"
                  className="w-full text-xs p-3 rounded-xl border border-slate-300 font-mono focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-[10px] text-slate-400">
                  En fazla 23 satır girebilirsiniz.
                </span>
              </div>
            )}
          </div>

          {/* Google Drive Checkbox */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <FileSpreadsheet className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <span className="text-xs font-bold text-slate-800">
                  Google Drive'da Otomatik E-Tablo Oluştur
                </span>
                <p className="text-[10px] text-slate-500">
                  Dosya Adı: <code>Sinif_Oturma_Plani_[SinifAdi]</code>
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={createDriveSheet}
              onChange={(e) => setCreateDriveSheet(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
            />
          </div>

          {/* Footer Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>{isSubmitting ? 'Oluşturuluyor...' : 'Sınıfı Oluştur'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
