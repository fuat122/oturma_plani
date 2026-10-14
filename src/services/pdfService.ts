import { Classroom, Teacher } from '../types';

export interface PDFExportOptions {
  classroom: Classroom;
  teacher: Teacher;
}

/**
 * Exports ONLY the visual seating plan to PDF using html2pdf.js
 * Strictly excludes any navigation, sidebar, report panels or buttons.
 */
export async function exportSeatingPlanToPDF(
  elementId: string,
  classroom: Classroom,
  teacher: Teacher
): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error('Yazdırılacak oturma planı görseli bulunamadı.');
  }

  const filename = `${classroom.name.replace(/\s+/g, '_')}_Oturma_Plani_${new Date().toISOString().split('T')[0]}.pdf`;

  const opt = {
    margin: [10, 10, 10, 10], // top, left, bottom, right in mm
    filename: filename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      letterRendering: true,
      logging: false,
    },
    jsPDF: {
      unit: 'mm',
      format: 'a4',
      orientation: 'landscape',
    },
  };

  try {
    // Check if html2pdf is available globally or dynamically import
    const html2pdf = (window as any).html2pdf;
    if (html2pdf) {
      await html2pdf().set(opt).from(element).save();
      return;
    }

    // Try dynamic import
    const module = await import('html2pdf.js');
    const generator = (module.default || module) as any;
    if (typeof generator === 'function') {
      await generator().set(opt).from(element).save();
      return;
    }

    // Fallback: window.print
    window.print();
  } catch (error) {
    console.error('html2pdf error, falling back to print mode:', error);
    window.print();
  }
}
