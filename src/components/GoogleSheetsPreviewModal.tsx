import React, { useMemo } from 'react';
import { Classroom, Teacher } from '../types';
import { buildClassroomSheetMatrix } from '../services/googleSheetsService';
import {
  X,
  FileSpreadsheet,
  ExternalLink,
  RefreshCw,
  CheckCircle2,
  Copy,
  Download,
  AlertCircle,
  Table,
} from 'lucide-react';

interface GoogleSheetsPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  classroom: Classroom;
  activeTeacher: Teacher;
  isGoogleConnected: boolean;
  onTriggerSync: () => void;
  isSyncing: boolean;
}

export const GoogleSheetsPreviewModal: React.FC<GoogleSheetsPreviewModalProps> = ({
  isOpen,
  onClose,
  classroom,
  activeTeacher,
  isGoogleConnected,
  onTriggerSync,
  isSyncing,
}) => {
  if (!isOpen) return null;

  const { dates, values } = useMemo(() => {
    return buildClassroomSheetMatrix(classroom);
  }, [classroom]);

  const copyAsCsv = () => {
    const headerRow = ['Sıra Kodu', 'Öğrenci Adı', ...dates.map((d) => `Tarih_${d}`)];
    const all = [headerRow, ...values];
    const csvContent = all
      .map((row) =>
        row
          .map((cell) => `"${(cell || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`)
          .join(',')
      )
      .join('\n');

    navigator.clipboard.writeText(csvContent);
    alert('E-Tablo verisi CSV formatında panoya kopyalandı.');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 no-print animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl h-[88vh] max-h-[820px] flex flex-col overflow-hidden border border-slate-200">
        {/* Modal Top Bar */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-emerald-700 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 text-white flex items-center justify-center shadow-xs">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold tracking-tight">
                  Google E-Tablo (Sheets) Senkronizasyon Matrisi
                </h2>
                <span className="text-xs bg-emerald-800/80 px-2.5 py-0.5 rounded-full font-mono border border-emerald-500/50">
                  Sinif_Oturma_Plani_{classroom.name}
                </span>
              </div>
              <p className="text-xs text-emerald-100">
                Google Sheets API v4 Standart Formatı • 23 Öğrenci Kapasitesi + Satır 24 Sınıf Notu
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action & Status Banner */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-700">
            {isGoogleConnected ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800 font-semibold border border-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Google Hesabı Bağlı: {activeTeacher.email}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-100 text-amber-800 font-semibold border border-amber-200">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                Test Modu (Yerel Önizleme)
              </span>
            )}

            <span className="text-slate-500 hidden md:inline">
              Son Senkron: <strong>{classroom.lastSyncedAt || 'Şimdi'}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={copyAsCsv}
              className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold flex items-center gap-1.5 transition-all shadow-2xs"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>CSV Kopyala</span>
            </button>

            {classroom.googleSpreadsheetUrl && (
              <a
                href={classroom.googleSpreadsheetUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold flex items-center gap-1.5 transition-all shadow-2xs"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Google Drive'da Aç</span>
              </a>
            )}

            <button
              type="button"
              onClick={onTriggerSync}
              disabled={isSyncing}
              className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-1.5 shadow-xs transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Senkronize Ediliyor...' : 'E-Tabloyu Şimdi Güncelle'}</span>
            </button>
          </div>
        </div>

        {/* Business Logic Explanation Card */}
        <div className="px-6 py-2 bg-blue-50/50 border-b border-blue-100 text-[11px] text-blue-900 flex flex-wrap gap-4 items-center">
          <span className="font-semibold flex items-center gap-1">
            <Table className="w-3.5 h-3.5 text-blue-600" />
            Otomatik E-Tablo Kuralları:
          </span>
          <span>• <strong>Sütun A:</strong> Sıra Kodu (Sürükle-bırak yapıldığında anında güncellenir)</span>
          <span>• <strong>Sütun B:</strong> Öğrenci Adı</span>
          <span>• <strong>Sütun C, D...:</strong> Yorum Tarihleri (<code>[Öğrenci Adı]: Yorum</code>)</span>
          <span>• <strong>Satır 24:</strong> Sınıf Genel Notları</span>
        </div>

        {/* Spreadsheet Grid Simulation */}
        <div className="flex-1 overflow-auto bg-slate-100 p-4">
          <div className="bg-white rounded-xl shadow-xs border border-slate-300 overflow-hidden inline-block min-w-full font-mono text-xs">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-200 text-slate-700 border-b border-slate-300 font-semibold text-[11px]">
                  <th className="w-12 px-2 py-2 border-r border-slate-300 text-center bg-slate-300/80">#</th>
                  <th className="px-3 py-2 border-r border-slate-300 text-left bg-emerald-50 text-emerald-900 min-w-[140px]">
                    Sütun A: Sıra No / Kod
                  </th>
                  <th className="px-3 py-2 border-r border-slate-300 text-left bg-emerald-50 text-emerald-900 min-w-[200px]">
                    Sütun B: Öğrenci Adı Soyadı
                  </th>
                  {dates.map((date, idx) => (
                    <th
                      key={date}
                      className="px-3 py-2 border-r border-slate-300 text-left bg-blue-50 text-blue-900 min-w-[220px]"
                    >
                      Sütun {String.fromCharCode(67 + idx)}: {date}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {values.map((row, rowIdx) => {
                  const isRow24 = rowIdx === 23; // Row 24 (index 23) is General Notes

                  return (
                    <tr
                      key={rowIdx}
                      className={`border-b border-slate-200 hover:bg-slate-50 transition-colors ${
                        isRow24 ? 'bg-amber-100/70 font-semibold border-t-2 border-amber-300' : ''
                      }`}
                    >
                      {/* Row Number */}
                      <td
                        className={`px-2 py-1.5 text-center font-bold text-[10px] border-r border-slate-300 ${
                          isRow24 ? 'bg-amber-200 text-amber-950' : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {rowIdx + 1}
                      </td>

                      {/* Col A: Seat Code */}
                      <td className="px-3 py-1.5 border-r border-slate-200 font-bold text-slate-800">
                        {isRow24 ? (
                          <span className="text-amber-900">SINIF GENEL NOTLARI</span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-blue-700">
                            {row[0]}
                          </span>
                        )}
                      </td>

                      {/* Col B: Student Name */}
                      <td className="px-3 py-1.5 border-r border-slate-200 text-slate-900 font-medium">
                        {row[1]}
                      </td>

                      {/* Date Columns: C, D, E... */}
                      {dates.map((_, colIdx) => {
                        const cellVal = row[2 + colIdx] || '';
                        return (
                          <td
                            key={colIdx}
                            className={`px-3 py-1.5 border-r border-slate-200 text-[11px] whitespace-pre-wrap leading-relaxed ${
                              isRow24
                                ? 'text-amber-950 font-normal italic'
                                : cellVal
                                ? 'text-slate-800 bg-blue-50/20'
                                : 'text-slate-400 italic'
                            }`}
                          >
                            {cellVal || '-'}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500">
          <div>
            * Oturma planında iki öğrencinin yeri değiştirildiğinde (Drag & Drop), A Sütunundaki Sıra No anında güncellenir.
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold transition-colors"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
};
