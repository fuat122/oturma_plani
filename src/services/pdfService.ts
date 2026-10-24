import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { Classroom, Teacher } from '../types';

export interface PDFExportOptions {
  classroom: Classroom;
  teacher: Teacher;
}

// Concurrency guard to prevent rapid repeated clicks from running multiple exports
let isCurrentlyGeneratingPDF = false;

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Builds an off-screen, fixed 1200px wide A4 Landscape print container.
 * Uses ONLY inline CSS and standard HEX colors (#ffffff, #1e293b, etc.)
 * Completely immune to Tailwind CSS v4 oklch() color issues or mobile viewport squishing.
 */
function createOffscreenPrintTemplate(classroom: Classroom, teacher: Teacher): HTMLElement {
  const container = document.createElement('div');
  container.id = 'offscreen-a4-pdf-container';
  container.setAttribute(
    'style',
    'position: fixed; left: -9999px; top: 0; width: 1200px; background: #ffffff; color: #1e293b; z-index: -9999; box-sizing: border-box; padding: 24px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;'
  );

  const consultantName = classroom.teacherName || teacher.name;
  const fullTitle = `${consultantName} Danışmanlığında ${classroom.name} Sınıfı`;
  const dateStr = new Date().toLocaleDateString('tr-TR');

  // Blocks definitions
  const blocksMeta = [
    {
      key: 'duvar',
      name: 'DUVAR KENARI SIRALARI',
      icon: '🧱',
      borderColor: '#f59e0b',
      headerBg: '#fef3c7',
      headerColor: '#92400e',
    },
    {
      key: 'orta',
      name: 'ORTA BLOK SIRALARI',
      icon: '🏛️',
      borderColor: '#10b981',
      headerBg: '#d1fae5',
      headerColor: '#065f46',
    },
    {
      key: 'cam',
      name: 'CAM KENARI SIRALARI',
      icon: '🪟',
      borderColor: '#0284c7',
      headerBg: '#e0f2fe',
      headerColor: '#075985',
    },
  ];

  const maxRows = Math.max(
    ...classroom.seats.map((s) => s.row || 1),
    4
  );

  let blocksHtml = '';

  blocksMeta.forEach((block) => {
    const blockSeats = classroom.seats.filter((s) => s.block === block.key);
    let rowsHtml = '';

    for (let r = 1; r <= maxRows; r++) {
      const rowSeats = blockSeats.filter((s) => s.row === r);
      let desksHtml = '';

      for (let col = 1; col <= 2; col++) {
        const seat = rowSeats.find((s) => s.col === col);
        const student = seat?.studentId
          ? classroom.students.find((st) => st.id === seat.studentId)
          : null;

        if (student) {
          const isGirl = student.gender === 'K';
          const cardBg = isGirl ? '#fff1f2' : '#ffffff';
          const cardBorder = isGirl ? '#fb7185' : '#1e293b';
          const genderBg = isGirl ? '#fecdd3' : '#dbeafe';
          const genderColor = isGirl ? '#9f1239' : '#1e40af';
          const nameColor = isGirl ? '#881337' : '#0f172a';

          desksHtml += `
            <div style="flex: 1; background: ${cardBg}; border: 1.5px solid ${cardBorder}; border-radius: 6px; padding: 6px 8px; box-sizing: border-box; min-height: 52px; display: flex; flex-direction: column; justify-content: space-between;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px;">
                <span style="font-family: monospace; font-size: 10px; font-weight: 700; background: #e2e8f0; color: #0f172a; padding: 1px 5px; border-radius: 4px;">#${escapeHtml(student.studentNumber)}</span>
                <span style="font-size: 9px; font-weight: 700; background: ${genderBg}; color: ${genderColor}; padding: 1px 5px; border-radius: 4px;">${isGirl ? 'Kız' : 'Erk'}</span>
              </div>
              <div style="font-size: 11px; font-weight: 800; color: ${nameColor}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; text-align: center;">
                ${escapeHtml(student.fullName.toUpperCase())}
              </div>
            </div>
          `;
        } else {
          desksHtml += `
            <div style="flex: 1; background: #f8fafc; border: 1.5px dashed #cbd5e1; border-radius: 6px; padding: 6px 8px; box-sizing: border-box; min-height: 52px; display: flex; flex-direction: column; justify-content: center; align-items: center;">
              <span style="font-size: 9px; color: #94a3b8; font-weight: 700;">#${col}</span>
              <span style="font-size: 10px; color: #94a3b8; font-style: italic; font-weight: 600;">Boş Sıra</span>
            </div>
          `;
        }
      }

      rowsHtml += `
        <div style="margin-bottom: 7px;">
          <div style="font-size: 10px; font-weight: 700; color: #64748b; margin-bottom: 2px;">${r}. Sıra</div>
          <div style="display: flex; gap: 8px;">
            ${desksHtml}
          </div>
        </div>
      `;
    }

    blocksHtml += `
      <div style="flex: 1; background: #fafafa; border: 2px solid ${block.borderColor}; border-radius: 8px; padding: 10px; box-sizing: border-box;">
        <div style="background: ${block.headerBg}; border: 1px solid ${block.borderColor}; border-radius: 6px; padding: 6px; text-align: center; font-weight: 800; font-size: 12px; color: ${block.headerColor}; margin-bottom: 8px;">
          ${block.icon} ${block.name}
        </div>
        <div>
          ${rowsHtml}
        </div>
      </div>
    `;
  });

  container.innerHTML = `
    <div style="border: 2px solid #0f172a; border-radius: 12px; padding: 20px; background: #ffffff;">
      <!-- MEB Official Header -->
      <div style="text-align: center; font-size: 13px; font-weight: 700; color: #64748b; letter-spacing: 1px; margin-bottom: 4px;">
        T.C. MİLLÎ EĞİTİM BAKANLIĞI
      </div>
      <h1 style="text-align: center; font-size: 24px; font-weight: 900; color: #0f172a; margin: 0 0 6px 0; letter-spacing: -0.5px;">
        ${escapeHtml(fullTitle)}
      </h1>
      <div style="text-align: center; margin-bottom: 12px;">
        <span style="display: inline-block; background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; font-size: 11px; font-weight: 800; padding: 3px 12px; border-radius: 9999px; letter-spacing: 0.5px;">
          RESMÎ SINIF OTURMA PLANI
        </span>
      </div>

      <!-- Information Strip (3 Columns) -->
      <div style="display: flex; justify-content: space-between; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 10px 16px; margin-bottom: 14px;">
        <div style="text-align: center; flex: 1; border-right: 1px solid #cbd5e1;">
          <div style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase;">Danışman Öğretmen</div>
          <div style="font-size: 14px; font-weight: 800; color: #0f172a; margin-top: 2px;">${escapeHtml(consultantName)}</div>
        </div>
        <div style="text-align: center; flex: 1; border-right: 1px solid #cbd5e1;">
          <div style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase;">Öğretim Yılı / Kademe</div>
          <div style="font-size: 14px; font-weight: 800; color: #0f172a; margin-top: 2px;">${escapeHtml(classroom.academicYear)} • ${escapeHtml(classroom.grade)}</div>
        </div>
        <div style="text-align: center; flex: 1;">
          <div style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase;">Mevcut / Kapasite</div>
          <div style="font-size: 14px; font-weight: 800; color: #0f172a; margin-top: 2px;">${classroom.students.length} / ${classroom.seats.length} Öğrenci (${dateStr})</div>
        </div>
      </div>

      <!-- Front Stage (Kürsü / Tahta / Kapı / Camlar) -->
      <div style="display: flex; gap: 12px; margin-bottom: 14px;">
        <div style="flex: 1; background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 8px; text-align: center; font-weight: 700; font-size: 12px; color: #92400e;">
          🚪 GİRİŞ KAPISI
        </div>
        <div style="flex: 2; background: #0f172a; border: 1px solid #334155; border-radius: 8px; padding: 8px; text-align: center; font-weight: 800; font-size: 13px; color: #34d399; letter-spacing: 0.5px;">
          🖥️ ÖĞRETMEN KÜRSÜSÜ / AKILLI TAHTA (ÖN CEPHE)
        </div>
        <div style="flex: 1; background: #e0f2fe; border: 1px solid #0284c7; border-radius: 8px; padding: 8px; text-align: center; font-weight: 700; font-size: 12px; color: #0369a1;">
          🪟 CAMLAR (DIŞ CEPHE)
        </div>
      </div>

      <!-- 3 Seating Blocks -->
      <div style="display: flex; gap: 14px; margin-bottom: 14px;">
        ${blocksHtml}
      </div>

      <!-- Official Signatures & Seal Section -->
      <div style="display: flex; justify-content: space-between; border-top: 1.5px solid #0f172a; padding-top: 12px; margin-top: 6px;">
        <div style="text-align: center; width: 45%;">
          <div style="font-size: 13px; font-weight: 800; color: #0f172a;">${escapeHtml(consultantName)}</div>
          <div style="font-size: 11px; font-weight: 700; color: #475569; margin-top: 2px;">${escapeHtml(teacher.branch)} / Danışman Öğretmen</div>
          <div style="font-size: 10px; color: #64748b; margin-top: 16px;">İmza: .....................................................</div>
        </div>
        <div style="text-align: center; width: 45%;">
          <div style="font-size: 13px; font-weight: 800; color: #0f172a;">Okul Müdürü</div>
          <div style="font-size: 11px; font-weight: 700; color: #475569; margin-top: 2px;">Okul Müdürlüğü</div>
          <div style="font-size: 10px; color: #64748b; margin-top: 16px;">Mühür / İmza: .....................................................</div>
        </div>
      </div>
    </div>
  `;

  return container;
}

/**
 * Exports strictly ONLY the visual seating plan to a SINGLE-PAGE A4 Landscape PDF.
 * Uses an off-screen fixed 1200px container rendered with standard HEX colors,
 * captured via html2canvas and converted to high-definition A4 PDF with jsPDF.
 */
export async function exportSeatingPlanToPDF(
  _elementId: string,
  classroom: Classroom,
  teacher: Teacher
): Promise<void> {
  if (isCurrentlyGeneratingPDF) {
    console.warn('PDF generation already in progress, skipping duplicate call.');
    return;
  }

  isCurrentlyGeneratingPDF = true;

  let container: HTMLElement | null = null;

  try {
    const consultantName = classroom.teacherName || teacher.name;
    const sanitizedConsultant = consultantName.replace(/\s+/g, '_');
    const sanitizedClassName = classroom.name.replace(/\s+/g, '_');
    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `${sanitizedConsultant}_Danismanliginda_${sanitizedClassName}_Oturma_Plani_${dateStr}.pdf`;

    // 1. Create and attach off-screen container
    container = createOffscreenPrintTemplate(classroom, teacher);
    document.body.appendChild(container);

    // 2. Capture off-screen DOM element with html2canvas using scale: 2 and standard HEX colors
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    // 3. Convert to Single-Page A4 Landscape PDF (297mm x 210mm)
    const pdf = new jsPDF('landscape', 'mm', 'a4');
    const pdfWidth = 297;
    const pdfHeight = 210;
    const margin = 8;

    const maxContentWidth = pdfWidth - margin * 2;
    const maxContentHeight = pdfHeight - margin * 2;

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const canvasRatio = canvasWidth / canvasHeight;

    let renderWidth = maxContentWidth;
    let renderHeight = maxContentWidth / canvasRatio;

    if (renderHeight > maxContentHeight) {
      renderHeight = maxContentHeight;
      renderWidth = maxContentHeight * canvasRatio;
    }

    const posX = (pdfWidth - renderWidth) / 2;
    const posY = (pdfHeight - renderHeight) / 2;

    const imgData = canvas.toDataURL('image/jpeg', 0.96);
    pdf.addImage(imgData, 'JPEG', posX, posY, renderWidth, renderHeight, undefined, 'FAST');

    pdf.save(filename);
  } catch (error: any) {
    console.error('PDF export error:', error);
    throw error;
  } finally {
    // 4. Guaranteed DOM cleanup
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
    isCurrentlyGeneratingPDF = false;
  }
}
