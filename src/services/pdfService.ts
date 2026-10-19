import { Classroom, Teacher } from '../types';

export interface PDFExportOptions {
  classroom: Classroom;
  teacher: Teacher;
}

/**
 * Exports ONLY the visual seating plan to PDF using html2pdf.js with crystal-clear rendering.
 * Strictly excludes any navigation, sidebar, report panels or buttons.
 */
export async function exportSeatingPlanToPDF(
  elementId: string,
  classroom: Classroom,
  teacher: Teacher
): Promise<void> {
  const sourceElement = document.getElementById(elementId);
  if (!sourceElement) {
    throw new Error('Yazdırılacak oturma planı görseli bulunamadı.');
  }

  const consultantName = classroom.teacherName || teacher.name;
  const filename = `${consultantName}_Danismanliginda_${classroom.name}_Oturma_Plani_${new Date().toISOString().split('T')[0]}.pdf`.replace(/\s+/g, '_');

  // Staging container: Cloned and mounted cleanly to prevent any viewport/offscreen canvas blur
  const stagingContainer = document.createElement('div');
  stagingContainer.style.position = 'fixed';
  stagingContainer.style.top = '0';
  stagingContainer.style.left = '0';
  stagingContainer.style.width = '1120px';
  stagingContainer.style.backgroundColor = '#ffffff';
  stagingContainer.style.zIndex = '999999';
  stagingContainer.style.opacity = '1';
  stagingContainer.style.pointerEvents = 'none';

  const clonedNode = sourceElement.cloneNode(true) as HTMLElement;
  clonedNode.style.width = '1120px';
  clonedNode.style.margin = '0 auto';
  clonedNode.style.boxSizing = 'border-box';
  clonedNode.style.backgroundColor = '#ffffff';

  stagingContainer.appendChild(clonedNode);
  document.body.appendChild(stagingContainer);

  const opt = {
    margin: [6, 6, 6, 6], // compact 6mm margins for max A4 coverage without downscaling
    filename: filename,
    image: { type: 'jpeg', quality: 0.99 },
    html2canvas: {
      scale: 3, // Ultra-sharp 300 DPI clarity
      useCORS: true,
      letterRendering: true,
      logging: false,
      scrollX: 0,
      scrollY: 0,
      windowWidth: 1120,
    },
    jsPDF: {
      unit: 'mm',
      format: 'a4',
      orientation: 'landscape',
      compress: true,
    },
    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
  };

  try {
    // Check if html2pdf is available globally or dynamically import
    const html2pdf = (window as any).html2pdf;
    if (html2pdf) {
      await html2pdf().set(opt).from(clonedNode).save();
      return;
    }

    // Try dynamic import
    const module = await import('html2pdf.js');
    const generator = (module.default || module) as any;
    if (typeof generator === 'function') {
      await generator().set(opt).from(clonedNode).save();
      return;
    }

    // Fallback: window.print
    window.print();
  } catch (error) {
    console.error('html2pdf error, falling back to print mode:', error);
    window.print();
  } finally {
    if (document.body.contains(stagingContainer)) {
      document.body.removeChild(stagingContainer);
    }
  }
}
