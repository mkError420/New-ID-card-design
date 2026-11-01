import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export async function exportA4PagesToPdf(
  pageElementIds: string[],
  onProgress?: (progress: { current: number; total: number; stage: string }) => void,
  fileName: string = 'invitation_cards.pdf'
): Promise<void> {
  if (pageElementIds.length === 0) return;

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  const total = pageElementIds.length;

  for (let i = 0; i < total; i++) {
    const elementId = pageElementIds[i];
    const element = document.getElementById(elementId);

    if (!element) {
      console.warn(`Element with ID ${elementId} not found.`);
      continue;
    }

    if (onProgress) {
      onProgress({
        current: i + 1,
        total,
        stage: `পেজ ${i + 1}/${total} রেন্ডার হচ্ছে...`,
      });
    }

    // Capture element using html2canvas with high scale for crisp print quality
    const canvas = await html2canvas(element, {
      scale: 2, // 2x scale gives ~200 DPI which looks sharp and prints cleanly
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);

    if (i > 0) {
      pdf.addPage('a4', 'portrait');
    }

    // A4 dimensions: 210mm x 297mm
    pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
  }

  if (onProgress) {
    onProgress({
      current: total,
      total,
      stage: 'পিডিএফ ফাইল তৈরি ও ডাউনলোড হচ্ছে...',
    });
  }

  pdf.save(fileName);
}

export async function exportSingleCardImage(
  elementId: string,
  fileName: string = 'invitation_card.png'
): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) return;

  const canvas = await html2canvas(element, {
    scale: 3, // Ultra sharp single card export
    useCORS: true,
    allowTaint: true,
    logging: false,
    backgroundColor: null,
  });

  const link = document.createElement('a');
  link.download = fileName;
  link.href = canvas.toDataURL('image/png');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
