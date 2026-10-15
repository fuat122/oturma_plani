import React, { useState } from 'react';
import { Classroom, GradeLevel, Student, Teacher } from '../types';
import { generateDefaultSeats, generateFlexibleSeats } from '../services/storageService';
import { X, Plus, AlertCircle, Sparkles, School, Users, Cloud } from 'lucide-react';

interface NewClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTeacher: Teacher;
  isGoogleConnected: boolean;
  onCreateClass: (newClass: Classroom) => Promise<void>;
}

export const NewClassModal: React.FC<NewClassModalProps> = ({
  isOpen,
  onClose,
  activeTeacher,
  onCreateClass,
}) => {
  if (!isOpen) return null;

  const [className, setClassName] = useState('');
  const [grade, setGrade] = useState<GradeLevel>('9. Sınıf');
  const [branchName, setBranchName] = useState('');
  const [layoutType, setLayoutType] = useState<'3-block-standard' | '4-block' | '5-block'>('3-block-standard');
  const [studentRosterMode, setStudentRosterMode] = useState<'sample' | 'empty' | 'custom'>('sample');
  const [customListText, setCustomListText] = useState('');
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
      // Generate 20 sample high school students (<= 24 cap)
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
        { name: 'Gizem Deniz Aydın', gender: 'K' },
        { name: 'Hakan Yiğit Er', gender: 'E' },
        { name: 'İlayda Kaya', gender: 'K' },
        { name: 'Kerem Can Yavuz', gender: 'E' },
        { name: 'Lara Su Tekin', gender: 'K' },
        { name: 'Metehan Güneş', gender: 'E' },
        { name: 'Nilüfer Çelik', gender: 'K' },
        { name: 'Onur Tuna Kurt', gender: 'E' },
        { name: 'Pelin Duru Aktaş', gender: 'K' },
        { name: 'Rüzgar Bora Polat', gender: 'E' },
        { name: 'Selin Naz Arslan', gender: 'K' },
      ];

      students = sampleNames.map((s, idx) => ({
        id: `st_${Date.now()}_${idx}`,
        studentNumber: String(200 + idx + 1),
        fullName: s.name,
        gender: s.gender as 'K' | 'E',
      }));

      // Place students into front seats automatically
      students.forEach((st, idx) => {
        if (idx < seats.length) {
          seats[idx].studentId = st.id;
          st.seatCode = seats[idx].code;
        }
      });
    } else if (studentRosterMode === 'custom' && customListText.trim()) {
      // Parse custom student lines
      const lines = customListText.split('\n').filter((l) => l.trim().length > 0);
      if (lines.length > seats.length) {
        setError(`Sınıf düzeniniz ${seats.length} sıradan oluşuyor. Girdiğiniz liste ${lines.length} kişi, lütfen en fazla ${seats.length} öğrenci giriniz.`);
        return;
      }

      students = lines.map((line, idx) => {
        const parts = line.split(',').map((p) => p.trim());
        const studentNumber = parts[0] || String(100 + idx + 1);
        const fullName = parts[1] || `Öğrenci ${idx + 1}`;
        const gender = parts[2]?.toUpperCase() === 'K' ? 'K' : 'E';

        return {
          id: `st_custom_${Date.now()}_${idx}`,
          studentNumber,
          fullName,
          gender: gender as 'K' | 'E',
        };
      });

      // Auto place in order
      students.forEach((st, idx) => {
        if (idx < seats.length) {
          seats[idx].studentId = st.id;
          st.seatCode = seats[idx].code;
        }
      });
    }

    const newClassId = `class_${Date.now()}`;
    const today = new Date().toISOString().split('T')[0];

    const newClass: Classroom = {
      id: newClassId,
      teacherId: activeTeacher.id,
      name: className.trim(),
      grade,
      branchName: branchName.trim() || undefined,
      academicYear: '2026-2027',
      maxCapacity: seats.length,
      layoutType: layoutType as any,
      students,
      seats,
      observations: [
        {
          id: `obs_init_${Date.now()}`,
          classId: newClassId,
          studentId: students[0]?.id || 'system',
          studentName: students[0]?.fullName || 'Sınıf Başlangıcı',
          date: today,
          category: 'genel',
          content: `${className.trim()} sınıfı oturma planı ve gözlem defteri oluşturuldu.`,
          teacherId: activeTeacher.id,
          teacherName: activeTeacher.name,
          createdAt: new Date().toISOString(),
        },
      ],
      classNotes: [
        {
          id: `cn_init_${Date.now()}`,
          classId: newClassId,
          date: today,
          content: `${activeTeacher.name} tarafından ${className.trim()} sınıfı oluşturuldu ve Firestore veritabanına kaydedildi.`,
          teacherId: activeTeacher.id,
          teacherName: activeTeacher.name,
          createdAt: new Date().toISOString(),
        },
      ],
      syncStatus: 'synced',
      createdAt: new Date().toISOString(),
    };

    setIsSubmitting(true);
    try {
      await onCreateClass(newClass);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Sınıf oluşturulurken bir hata oluştu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <School className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Yeni Sınıf Oluştur</h3>
              <p className="text-xs text-slate-500">
                Yetkili Öğretmen: <span className="font-semibold text-slate-700">{activeTeacher.name}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Class Name & Grade */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Sınıf / Şube Adı *
              </label>
              <input
                type="text"
                required
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                placeholder="Örn: 9-B, 11-F, Hazırlık"
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Kademesi
              </label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value as GradeLevel)}
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="Hazırlık">Hazırlık</option>
                <option value="9. Sınıf">9. Sınıf</option>
                <option value="10. Sınıf">10. Sınıf</option>
                <option value="11. Sınıf">11. Sınıf</option>
                <option value="12. Sınıf">12. Sınıf</option>
              </select>
            </div>
          </div>

          {/* Branch / Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Ders veya Şube Açıklaması (İsteğe Bağlı)
            </label>
            <input
              type="text"
              value={branchName}
              onChange={(e) => setBranchName(e.target.value)}
              placeholder="Örn: Fen Bilimleri Ağırlıklı Şube / Danışmanlık"
              className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Physical Layout Type */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Sınıf Masa & Sıra Düzeni
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setLayoutType('3-block-standard')}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  layoutType === '3-block-standard'
                    ? 'border-blue-500 bg-blue-50/70 text-blue-900 font-bold ring-1 ring-blue-500'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <div className="text-xs font-bold">3 Blok Standart</div>
                <div className="text-[10px] text-slate-500">24 Kişilik (3x4 İkili)</div>
              </button>

              <button
                type="button"
                onClick={() => setLayoutType('4-block')}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  layoutType === '4-block'
                    ? 'border-blue-500 bg-blue-50/70 text-blue-900 font-bold ring-1 ring-blue-500'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <div className="text-xs font-bold">4 Blok Geniş</div>
                <div className="text-[10px] text-slate-500">32 Kişilik (4x4 İkili)</div>
              </button>

              <button
                type="button"
                onClick={() => setLayoutType('5-block')}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  layoutType === '5-block'
                    ? 'border-blue-500 bg-blue-50/70 text-blue-900 font-bold ring-1 ring-blue-500'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <div className="text-xs font-bold">5 Blok Büyük</div>
                <div className="text-[10px] text-slate-500">40 Kişilik (5x4 İkili)</div>
              </button>
            </div>
          </div>

          {/* Student Roster Setup */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Öğrenci Kadrosu
            </label>
            <div className="grid grid-cols-3 gap-2 mb-2">
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
                  En fazla 24 satır girebilirsiniz.
                </span>
              </div>
            )}
          </div>

          {/* Firebase Cloud Firestore Banner */}
          <div className="p-3 rounded-2xl bg-sky-50 border border-sky-200 flex items-center gap-3">
            <Cloud className="w-5 h-5 text-sky-600 shrink-0" />
            <div>
              <span className="text-xs font-bold text-sky-950">
                Firebase Cloud Firestore Veritabanı
              </span>
              <p className="text-[10px] text-sky-800 leading-tight">
                Sınıf oturma düzeni ve tüm tarihli öğrenci yorumları bulut veritabanında hesabınıza özel olarak otomatik kaydedilir.
              </p>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
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
