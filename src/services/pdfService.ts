import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';
import { Classroom, Teacher } from '../types';

export interface PDFExportOptions {
  classroom: Classroom;
  teacher: Teacher;
}

/**
 * Exports strictly ONLY the visual seating plan to a SINGLE-PAGE A4 Landscape PDF.
 * Uses html2canvas-pro with onclone color normalization + jsPDF direct placement.
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
  const sanitizedConsultant = consultantName.replace(/\s+/g, '_');
  const sanitizedClassName = classroom.name.replace(/\s+/g, '_');
  const dateStr = new Date().toISOString().split('T')[0];
  const filename = `${sanitizedConsultant}_Danismanliginda_${sanitizedClassName}_Oturma_Plani_${dateStr}.pdf`;

  // Staging container: Cloned and mounted cleanly off-screen to avoid any viewport/scroll interference
  const stagingContainer = document.createElement('div');
  stagingContainer.style.position = 'fixed';
  stagingContainer.style.top = '0';
  stagingContainer.style.left = '0';
  stagingContainer.style.width = '1080px';
  stagingContainer.style.backgroundColor = '#ffffff';
  stagingContainer.style.zIndex = '999999';
  stagingContainer.style.opacity = '1';
  stagingContainer.style.pointerEvents = 'none';

  const clonedNode = sourceElement.cloneNode(true) as HTMLElement;
  clonedNode.style.width = '1080px';
  clonedNode.style.margin = '0 auto';
  clonedNode.style.boxSizing = 'border-box';
  clonedNode.style.backgroundColor = '#ffffff';

  stagingContainer.appendChild(clonedNode);
  document.body.appendChild(stagingContainer);

  // Safety timeout promise (15 seconds max)
  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('PDF oluşturma zaman aşımına uğradı.')), 15000)
  );

  const exportPromise = (async () => {
    // 1. Render to high-DPI canvas with OKLCH-to-RGB normalization
    const canvas = await html2canvas(clonedNode, {
      scale: 2.2, // Ultra-sharp print quality (~300 DPI)
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: 1080,
      scrollX: 0,
      scrollY: 0,
      onclone: (clonedDoc, element) => {
        // Native canvas context converts ANY CSS color format (oklch, lab, color-mix) to standard rgb/#hex
        const canvas2d = clonedDoc.createElement('canvas');
        const ctx = canvas2d.getContext('2d');
        if (!ctx) return;

        const allNodes = [element, ...Array.from(element.querySelectorAll('*'))];
        const colorProperties = [
          'color',
          'background-color',
          'border-top-color',
          'border-right-color',
          'border-bottom-color',
          'border-left-color',
          'outline-color',
          'text-decoration-color',
        ];

        for (const node of allNodes) {
          const el = node as HTMLElement;
          if (!el || !el.style) continue;

          try {
            const computed = window.getComputedStyle(el);
            for (const prop of colorProperties) {
              const val = computed.getPropertyValue(prop);
              if (val && (val.includes('oklch') || val.includes('color(') || val.includes('lab('))) {
                ctx.fillStyle = '#000000';
                ctx.fillStyle = val;
                el.style.setProperty(prop, ctx.fillStyle, 'important');
              }
            }
          } catch (_) {
            // Safe fallback: continue iterating
          }
        }
      },
    });

    // 2. Create Single-Page A4 Landscape PDF
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const pdfWidth = 297; // A4 landscape width in mm
    const pdfHeight = 210; // A4 landscape height in mm
    const margin = 5; // 5mm margin on all sides

    const maxContentWidth = pdfWidth - margin * 2; // 287mm
    const maxContentHeight = pdfHeight - margin * 2; // 200mm

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const canvasRatio = canvasWidth / canvasHeight;

    let renderWidth = maxContentWidth;
    let renderHeight = maxContentWidth / canvasRatio;

    // Constrain to single page if height exceeds printable height
    if (renderHeight > maxContentHeight) {
      renderHeight = maxContentHeight;
      renderWidth = maxContentHeight * canvasRatio;
    }

    // Center horizontally and vertically within the single A4 sheet
    const posX = (pdfWidth - renderWidth) / 2;
    const posY = (pdfHeight - renderHeight) / 2;

    const imgData = canvas.toDataURL('image/jpeg', 0.98);
    pdf.addImage(imgData, 'JPEG', posX, posY, renderWidth, renderHeight, undefined, 'FAST');

    // 3. Trigger download of single-page PDF
    pdf.save(filename);
  })();

  try {
    await Promise.race([exportPromise, timeoutPromise]);
  } catch (error: any) {
    console.error('PDF generation error, attempting native print fallback:', error);
    // If browser blocks canvas generation, fall back to native print
    window.print();
    throw error;
  } finally {
    if (document.body.contains(stagingContainer)) {
      document.body.removeChild(stagingContainer);
    }
  }
}
