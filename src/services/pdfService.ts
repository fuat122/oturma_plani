import { jsPDF } from 'jspdf';
import { Classroom, Teacher } from '../types';

export interface PDFExportOptions {
  classroom: Classroom;
  teacher: Teacher;
}

// Concurrency guard to prevent memory exhaustion on rapid multiple clicks
let isCurrentlyGeneratingPDF = false;

/**
 * High-Resolution HTML5 Canvas 2D Drawing Engine for Official A4 Landscape Seating Plan.
 * 
 * 100% immune to CSS parser errors ("oklch", Tailwind v4 variables, etc.).
 * Operates purely with standard HEX / RGB 2D Canvas primitives.
 * Fixed 2400 x 1700 px resolution (300 DPI clarity) guaranteeing exact 1-page fit on all devices.
 */
function renderSeatingPlanToCanvas(classroom: Classroom, teacher: Teacher): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  // 300 DPI A4 Landscape: 2480 x 1754
  const W = 2480;
  const H = 1754;
  canvas.width = W;
  canvas.height = H;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D context oluşturulamadı.');
  }

  // 1. Background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, W, H);

  // Outer border & margins
  const margin = 40;
  const contentW = W - margin * 2;
  const contentH = H - margin * 2;

  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 4;
  ctx.strokeRect(margin, margin, contentW, contentH);

  let curY = margin + 30;

  // 2. Official Header (MEB & Dynamic Title)
  const consultantName = classroom.teacherName || teacher.name;
  const fullTitle = `${consultantName} Danışmanlığında ${classroom.name} Sınıfı`;
  const dateStr = new Date().toLocaleDateString('tr-TR');

  // Subtitle MEB
  ctx.fillStyle = '#475569';
  ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('T.C. MİLLÎ EĞİTİM BAKANLIĞI', W / 2, curY);

  curY += 46;

  // Main Dynamic Title
  ctx.fillStyle = '#020617';
  ctx.font = 'bold 44px system-ui, -apple-system, sans-serif';
  ctx.fillText(fullTitle, W / 2, curY);

  curY += 32;

  // Document Badge
  ctx.fillStyle = '#0284c7';
  ctx.font = 'bold 20px system-ui, -apple-system, sans-serif';
  ctx.fillText('RESMÎ SINIF OTURMA PLANI', W / 2, curY);

  curY += 24;

  // Divider Line
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(margin + 20, curY);
  ctx.lineTo(W - margin - 20, curY);
  ctx.stroke();

  curY += 16;

  // 3. Information Strip (3 Columns: Danışman Öğretmen, Öğretim Yılı / Kademe, Mevcut / Kapasite)
  const stripH = 75;
  const stripW = contentW - 40;
  const stripX = margin + 20;

  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(stripX, curY, stripW, stripH);
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 2;
  ctx.strokeRect(stripX, curY, stripW, stripH);

  const colW = stripW / 3;

  // Column 1: Danışman Öğretmen
  ctx.textAlign = 'center';
  ctx.fillStyle = '#64748b';
  ctx.font = 'bold 16px system-ui, -apple-system, sans-serif';
  ctx.fillText('DANIŞMAN ÖĞRETMEN', stripX + colW * 0.5, curY + 24);
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 24px system-ui, -apple-system, sans-serif';
  ctx.fillText(consultantName, stripX + colW * 0.5, curY + 52);

  // Divider 1
  ctx.strokeStyle = '#cbd5e1';
  ctx.beginPath();
  ctx.moveTo(stripX + colW, curY + 8);
  ctx.lineTo(stripX + colW, curY + stripH - 8);
  ctx.stroke();

  // Column 2: Öğretim Yılı / Kademe
  ctx.fillStyle = '#64748b';
  ctx.font = 'bold 16px system-ui, -apple-system, sans-serif';
  ctx.fillText('ÖĞRETİM YILI / KADEME', stripX + colW * 1.5, curY + 24);
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 24px system-ui, -apple-system, sans-serif';
  ctx.fillText(`${classroom.academicYear} • ${classroom.grade}`, stripX + colW * 1.5, curY + 52);

  // Divider 2
  ctx.beginPath();
  ctx.moveTo(stripX + colW * 2, curY + 8);
  ctx.lineTo(stripX + colW * 2, curY + stripH - 8);
  ctx.stroke();

  // Column 3: Mevcut / Kapasite
  ctx.fillStyle = '#64748b';
  ctx.font = 'bold 16px system-ui, -apple-system, sans-serif';
  ctx.fillText('MEVCUT / KAPASİTE', stripX + colW * 2.5, curY + 24);
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 24px system-ui, -apple-system, sans-serif';
  ctx.fillText(`${classroom.students.length} / ${classroom.seats.length} Öğrenci (${dateStr})`, stripX + colW * 2.5, curY + 52);

  curY += stripH + 16;

  // 4. Front Strip: Kapı / Akıllı Tahta / Camlar
  const frontH = 50;
  const doorW = 340;
  const camW = 340;
  const boardW = stripW - doorW - camW - 24;

  // Giriş Kapısı
  const doorX = stripX;
  ctx.fillStyle = '#fef3c7';
  ctx.fillRect(doorX, curY, doorW, frontH);
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 2;
  ctx.strokeRect(doorX, curY, doorW, frontH);
  ctx.fillStyle = '#92400e';
  ctx.font = 'bold 20px system-ui, -apple-system, sans-serif';
  ctx.fillText('🚪 GİRİŞ KAPISI', doorX + doorW / 2, curY + 32);

  // Akıllı Tahta (Ön Cephe)
  const boardX = doorX + doorW + 12;
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(boardX, curY, boardW, frontH);
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 2;
  ctx.strokeRect(boardX, curY, boardW, frontH);
  ctx.fillStyle = '#34d399';
  ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
  ctx.fillText('ÖĞRETMEN KÜRSÜSÜ / AKILLI TAHTA (ÖN CEPHE)', boardX + boardW / 2, curY + 32);

  // Camlar
  const camX = boardX + boardW + 12;
  ctx.fillStyle = '#e0f2fe';
  ctx.fillRect(camX, curY, camW, frontH);
  ctx.strokeStyle = '#0284c7';
  ctx.lineWidth = 2;
  ctx.strokeRect(camX, curY, camW, frontH);
  ctx.fillStyle = '#0369a1';
  ctx.font = 'bold 20px system-ui, -apple-system, sans-serif';
  ctx.fillText('🪟 CAMLAR (DIŞ CEPHE)', camX + camW / 2, curY + 32);

  curY += frontH + 20;

  // 5. 3 Seating Blocks (Duvar Kenarı, Orta Blok, Cam Kenarı)
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

  const blockSpacing = 18;
  const blockW = (stripW - blockSpacing * 2) / 3;
  
  // Available height for blocks
  const footerAreaH = 140;
  const blockH = H - margin - footerAreaH - curY;

  blocksMeta.forEach((block, bIdx) => {
    const bX = stripX + bIdx * (blockW + blockSpacing);
    const bY = curY;

    // Block Container Background & Border
    ctx.fillStyle = '#fafafa';
    ctx.fillRect(bX, bY, blockW, blockH);
    ctx.strokeStyle = block.borderColor;
    ctx.lineWidth = 3;
    ctx.strokeRect(bX, bY, blockW, blockH);

    // Block Header
    const bHeaderH = 46;
    ctx.fillStyle = block.headerBg;
    ctx.fillRect(bX, bY, blockW, bHeaderH);
    ctx.strokeStyle = block.borderColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(bX, bY, blockW, bHeaderH);

    ctx.fillStyle = block.headerColor;
    ctx.font = 'bold 20px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${block.icon} ${block.name}`, bX + blockW / 2, bY + 30);

    // Rows calculation
    const blockSeats = classroom.seats.filter((s) => s.block === block.key);
    const rowsPaddingTop = 15;
    const availableRowH = blockH - bHeaderH - rowsPaddingTop - 15;
    const singleRowTotalH = availableRowH / maxRows;
    const deskCardH = Math.min(singleRowTotalH - 22, 110);

    for (let r = 1; r <= maxRows; r++) {
      const rowSeats = blockSeats.filter((s) => s.row === r);
      const rowY = bY + bHeaderH + rowsPaddingTop + (r - 1) * singleRowTotalH;

      // Row indicator label
      ctx.textAlign = 'left';
      ctx.fillStyle = '#64748b';
      ctx.font = 'bold 15px system-ui, -apple-system, sans-serif';
      ctx.fillText(`${r}. Sıra`, bX + 16, rowY + 14);

      // Two desks per row
      const deskGap = 12;
      const deskW = (blockW - 32 - deskGap) / 2;

      for (let col = 1; col <= 2; col++) {
        const deskX = bX + 16 + (col - 1) * (deskW + deskGap);
        const deskY = rowY + 20;

        const seat = rowSeats.find((s) => s.col === col);
        const student = seat?.studentId
          ? classroom.students.find((st) => st.id === seat.studentId)
          : null;

        if (student) {
          const isGirl = student.gender === 'K';
          const cardBg = isGirl ? '#fff1f2' : '#ffffff';
          const cardBorder = isGirl ? '#fb7185' : '#1e293b';

          // Desk card background
          ctx.fillStyle = cardBg;
          ctx.fillRect(deskX, deskY, deskW, deskCardH);
          ctx.strokeStyle = cardBorder;
          ctx.lineWidth = 2.5;
          ctx.strokeRect(deskX, deskY, deskW, deskCardH);

          // Top Badges (Number & Gender)
          // Badge 1: No
          ctx.fillStyle = '#e2e8f0';
          ctx.fillRect(deskX + 8, deskY + 8, 70, 24);
          ctx.fillStyle = '#0f172a';
          ctx.font = 'bold 14px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(`#${student.studentNumber}`, deskX + 8 + 35, deskY + 25);

          // Badge 2: Gender
          const genderBg = isGirl ? '#fecdd3' : '#dbeafe';
          const genderColor = isGirl ? '#9f1239' : '#1e40af';
          ctx.fillStyle = genderBg;
          ctx.fillRect(deskX + deskW - 8 - 45, deskY + 8, 45, 24);
          ctx.fillStyle = genderColor;
          ctx.font = 'bold 14px system-ui, -apple-system, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(isGirl ? 'Kız' : 'Erk', deskX + deskW - 8 - 22.5, deskY + 25);

          // Full Name
          ctx.fillStyle = isGirl ? '#881337' : '#020617';
          ctx.font = 'bold 19px system-ui, -apple-system, sans-serif';
          ctx.textAlign = 'center';

          // Truncate name if too long for desk card
          let displayName = student.fullName.toUpperCase();
          while (ctx.measureText(displayName).width > deskW - 20 && displayName.length > 5) {
            displayName = displayName.slice(0, -1);
          }
          if (displayName !== student.fullName.toUpperCase()) {
            displayName += '..';
          }
          ctx.fillText(displayName, deskX + deskW / 2, deskY + deskCardH - 18);
        } else {
          // Empty Desk
          ctx.fillStyle = '#f8fafc';
          ctx.fillRect(deskX, deskY, deskW, deskCardH);
          ctx.strokeStyle = '#cbd5e1';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([6, 4]);
          ctx.strokeRect(deskX, deskY, deskW, deskCardH);
          ctx.setLineDash([]); // Reset line dash

          ctx.fillStyle = '#94a3b8';
          ctx.font = 'bold 14px system-ui, -apple-system, sans-serif';
          ctx.textAlign = 'left';
          ctx.fillText(`#${col}`, deskX + 10, deskY + 24);

          ctx.textAlign = 'center';
          ctx.font = 'italic bold 16px system-ui, -apple-system, sans-serif';
          ctx.fillText('Boş Sıra', deskX + deskW / 2, deskY + deskCardH / 2 + 6);
        }
      }
    }
  });

  // 6. Bottom Official Signatures & Seal Section
  const footerY = H - margin - footerAreaH + 15;
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(stripX, footerY);
  ctx.lineTo(stripX + stripW, footerY);
  ctx.stroke();

  const signW = stripW / 2;

  // Danışman Öğretmen Signature Box
  ctx.textAlign = 'center';
  ctx.fillStyle = '#020617';
  ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
  ctx.fillText(consultantName, stripX + signW * 0.5, footerY + 36);

  ctx.fillStyle = '#475569';
  ctx.font = 'bold 17px system-ui, -apple-system, sans-serif';
  ctx.fillText(`${teacher.branch} / Danışman Öğretmen`, stripX + signW * 0.5, footerY + 62);

  ctx.fillStyle = '#64748b';
  ctx.font = '16px system-ui, -apple-system, sans-serif';
  ctx.fillText('İmza: .....................................................', stripX + signW * 0.5, footerY + 98);

  // Okul Müdürü Box
  ctx.fillStyle = '#020617';
  ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
  ctx.fillText('Okul Müdürü', stripX + signW * 1.5, footerY + 36);

  ctx.fillStyle = '#475569';
  ctx.font = 'bold 17px system-ui, -apple-system, sans-serif';
  ctx.fillText('Okul Müdürlüğü', stripX + signW * 1.5, footerY + 62);

  ctx.fillStyle = '#64748b';
  ctx.font = '16px system-ui, -apple-system, sans-serif';
  ctx.fillText('Mühür / İmza: .....................................................', stripX + signW * 1.5, footerY + 98);

  return canvas;
}

/**
 * Exports strictly ONLY the visual seating plan to a SINGLE-PAGE A4 Landscape PDF.
 * Uses the native Canvas 2D engine to completely eliminate:
 * 1. "oklch" color parser errors (zero CSS parsing).
 * 2. Multi-page breaks (guarantees exactly 1 page).
 * 3. Mobile responsiveness squishing (fixed 300 DPI 2480x1754 template).
 * 4. Memory leaks and concurrency locking (repeat clicks work flawlessly).
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

  let canvas: HTMLCanvasElement | null = null;

  try {
    const consultantName = classroom.teacherName || teacher.name;
    const sanitizedConsultant = consultantName.replace(/\s+/g, '_');
    const sanitizedClassName = classroom.name.replace(/\s+/g, '_');
    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `${sanitizedConsultant}_Danismanliginda_${sanitizedClassName}_Oturma_Plani_${dateStr}.pdf`;

    // Render directly to high-resolution canvas with standard 2D primitives
    canvas = renderSeatingPlanToCanvas(classroom, teacher);

    // Create Single-Page A4 Landscape PDF (297mm x 210mm)
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const pdfWidth = 297;
    const pdfHeight = 210;
    const margin = 5;

    const maxContentWidth = pdfWidth - margin * 2; // 287mm
    const maxContentHeight = pdfHeight - margin * 2; // 200mm

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
    // Immediate memory cleanup
    if (canvas) {
      canvas.width = 0;
      canvas.height = 0;
      canvas = null;
    }
    isCurrentlyGeneratingPDF = false;
  }
}
