import { jsPDF } from 'jspdf';
import type { GeneratedData, PromptCard } from '../types';

/**
 * Creates an aged parchment background canvas and returns its Data URL (JPEG).
 */
export function createParchmentCanvas(width = 1200, height = 1697): string {
  if (typeof document === 'undefined') return '';
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // 1. Base aged parchment wash
  ctx.fillStyle = '#f5eedb';
  ctx.fillRect(0, 0, width, height);

  // 2. Heavy radial vignette for burnt / darkened antique edges
  const vignette = ctx.createRadialGradient(
    width / 2,
    height / 2,
    width * 0.28,
    width / 2,
    height / 2,
    width * 0.78
  );
  vignette.addColorStop(0, 'rgba(255, 250, 235, 0.2)');
  vignette.addColorStop(0.55, 'rgba(228, 204, 162, 0.45)');
  vignette.addColorStop(0.82, 'rgba(180, 135, 80, 0.75)');
  vignette.addColorStop(0.95, 'rgba(120, 75, 40, 0.90)');
  vignette.addColorStop(1, 'rgba(65, 38, 18, 0.98)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, width, height);

  // 3. Organic antique parchment blotches
  const blotches = 16;
  for (let i = 0; i < blotches; i++) {
    const bx = (Math.sin(i * 997) * 0.5 + 0.5) * width;
    const by = (Math.cos(i * 613) * 0.5 + 0.5) * height;
    const br = 45 + ((i * 37) % 130);
    const bg = ctx.createRadialGradient(bx, by, 0, bx, by, br);
    bg.addColorStop(0, 'rgba(150, 110, 65, 0.09)');
    bg.addColorStop(0.6, 'rgba(130, 90, 50, 0.04)');
    bg.addColorStop(1, 'rgba(130, 90, 50, 0)');
    ctx.fillStyle = bg;
    ctx.beginPath();
    ctx.arc(bx, by, br, 0, Math.PI * 2);
    ctx.fill();
  }

  // 4. Double gothic border
  const margin = 32;
  ctx.strokeStyle = '#5a3821';
  ctx.lineWidth = 3.5;
  ctx.strokeRect(margin, margin, width - margin * 2, height - margin * 2);

  ctx.strokeStyle = '#8d1a1a';
  ctx.lineWidth = 1.2;
  ctx.strokeRect(margin + 7, margin + 7, width - (margin + 7) * 2, height - (margin + 7) * 2);

  // 5. Corner rivets
  const rivets = [
    [margin + 7, margin + 7],
    [width - margin - 7, margin + 7],
    [margin + 7, height - margin - 7],
    [width - margin - 7, height - margin - 7],
  ];
  ctx.fillStyle = '#5a3821';
  rivets.forEach(([rx, ry]) => {
    ctx.beginPath();
    ctx.arc(rx, ry, 5, 0, Math.PI * 2);
    ctx.fill();
  });

  return canvas.toDataURL('image/jpeg', 0.88);
}

/**
 * Creates an ornate crimson blood-wax seal canvas and returns its Data URL (PNG).
 */
export function createWaxSealCanvas(size = 200): string {
  if (typeof document === 'undefined') return '';
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const center = size / 2;

  // Outer wax seal body with rich radial blood-red gradient
  const grad = ctx.createRadialGradient(center - 12, center - 12, 10, center, center, size * 0.45);
  grad.addColorStop(0, '#c42828');
  grad.addColorStop(0.45, '#961515');
  grad.addColorStop(0.8, '#6e0c0c');
  grad.addColorStop(1, '#420606');

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(center, center, size * 0.44, 0, Math.PI * 2);
  ctx.fill();

  // Highlight ring
  ctx.strokeStyle = 'rgba(255, 190, 190, 0.4)';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(center, center, size * 0.36, 0, Math.PI * 2);
  ctx.stroke();

  // Inner shadow groove
  ctx.strokeStyle = 'rgba(25, 2, 2, 0.65)';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.arc(center, center, size * 0.33, 0, Math.PI * 2);
  ctx.stroke();

  // Central Maltese cross insignia
  ctx.fillStyle = '#fce2a6';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
  ctx.shadowBlur = 5;
  ctx.shadowOffsetX = 1;
  ctx.shadowOffsetY = 1;
  ctx.font = `bold ${Math.round(size * 0.22)}px serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('+', center, center - 4);

  // Bottom inscription
  ctx.shadowBlur = 2;
  ctx.font = `bold ${Math.round(size * 0.055)}px sans-serif`;
  ctx.fillStyle = '#ffcfb3';
  ctx.fillText('DEMON CODEX', center, center + Math.round(size * 0.22));

  return canvas.toDataURL('image/png');
}

/**
 * Loads an image from a URL and converts it into a high-res base64 JPEG data URL.
 */
export async function preloadImageAsBase64(url: string, maxDim = 900): Promise<string | null> {
  if (!url || url.includes('svg+xml')) return null;
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        canvas.width = Math.max(1, Math.round(img.width * scale));
        canvas.height = Math.max(1, Math.round(img.height * scale));
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(null);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

/**
 * Draws a clean centered ornamental divider line in the PDF (avoiding Unicode WinAnsi corruption).
 */
function drawOrnamentalHeader(
  doc: jsPDF,
  pageWidth: number,
  y: number,
  title: string
) {
  doc.setFont('times', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(115, 40, 25);

  // Measure text width to center lines symmetrically around it
  const textWidth = doc.getTextWidth(title);
  const totalCenterSpan = textWidth + 16;
  const lineMargin = 30; // outer margin from page edge
  const leftLineEnd = (pageWidth - totalCenterSpan) / 2;
  const rightLineStart = (pageWidth + totalCenterSpan) / 2;

  // Left ornamental line
  doc.setDrawColor(115, 40, 25);
  doc.setLineWidth(0.4);
  if (leftLineEnd > lineMargin) {
    doc.line(lineMargin, y - 0.8, leftLineEnd, y - 0.8);
    doc.circle(leftLineEnd + 2.5, y - 0.8, 0.6, 'FD');
  }

  // Centered Title Text
  doc.text(title, pageWidth / 2, y, { align: 'center' });

  // Right ornamental line
  if (pageWidth - lineMargin > rightLineStart) {
    doc.circle(rightLineStart - 2.5, y - 0.8, 0.6, 'FD');
    doc.line(rightLineStart, y - 0.8, pageWidth - lineMargin, y - 0.8);
  }
}

/**
 * Draws decorative gothic crosses in all 4 corners of the page.
 */
function drawCornerOrnaments(doc: jsPDF, pageWidth: number, pageHeight: number) {
  doc.setFont('times', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(90, 56, 33);
  const offset = 14;
  doc.text('+', offset, offset + 2, { align: 'center' });
  doc.text('+', pageWidth - offset, offset + 2, { align: 'center' });
  doc.text('+', offset, pageHeight - offset + 2, { align: 'center' });
  doc.text('+', pageWidth - offset, pageHeight - offset + 2, { align: 'center' });
}

export interface AncientScrollPdfOptions {
  onProgress?: (status: string) => void;
}

/**
 * Generates and downloads the illuminated Ancient Scroll PDF with strict visual centering,
 * authentic parchment backgrounds, and zero Unicode encoding bugs.
 */
export async function generateAncientScrollPdf(
  data: GeneratedData,
  options?: AncientScrollPdfOptions
): Promise<void> {
  const onProgress = options?.onProgress;
  onProgress?.('Preparing ancient parchment and gothic seal...');

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210; // A4 standard width in mm
  const pageHeight = 297; // A4 standard height in mm
  const margin = 20;
  const contentWidth = pageWidth - margin * 2; // 170 mm

  // Generate background parchment and wax seal assets
  const parchmentData = createParchmentCanvas(1200, 1697);
  const waxSealData = createWaxSealCanvas(200);

  const applyParchmentBackground = () => {
    if (parchmentData) {
      doc.addImage(parchmentData, 'JPEG', 0, 0, pageWidth, pageHeight, undefined, 'FAST');
    }
    drawCornerOrnaments(doc, pageWidth, pageHeight);
  };

  // ══════════════════════════════════════════════════════════════
  // PAGE 1: TITLE, BANNER & PROLOGUE
  // ══════════════════════════════════════════════════════════════
  applyParchmentBackground();
  onProgress?.('Inscribing master invocation and seals...');

  let currentY = 25;

  // 1. Top Decorative Header Line (Clean, centered, vector-ruled)
  drawOrnamentalHeader(doc, pageWidth, currentY, 'THE DEMON CODEX : ANCIENT SCRIPTURE');
  currentY += 13;

  // 2. Main Title (Strict line-by-line centering to eliminate multi-line offset drift)
  doc.setFont('times', 'bold');
  doc.setFontSize(24);
  doc.setTextColor(45, 20, 10);
  const titleLines = doc.splitTextToSize(data.mainTitle.toUpperCase(), contentWidth - 10);
  const titleLineHeight = 9.5;
  titleLines.forEach((line: string, idx: number) => {
    doc.text(line.trim(), pageWidth / 2, currentY + idx * titleLineHeight, { align: 'center' });
  });
  currentY += titleLines.length * titleLineHeight + 2;

  // 3. Subtitle (Archetype & Tone)
  doc.setFont('times', 'italic');
  doc.setFontSize(12);
  doc.setTextColor(130, 45, 25);
  doc.text(`${data.archetype}   *   ${data.tone}`, pageWidth / 2, currentY, { align: 'center' });
  currentY += 6.5;

  // 4. Inscription Source Line
  doc.setFont('times', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(95, 60, 40);
  doc.text('Transcribed from the Neural Crucible   *   Folio MMXXVI', pageWidth / 2, currentY, { align: 'center' });
  currentY += 7;

  // 5. Centered Double Ornamental Divider Bar
  const divWidth = 130;
  const divX = (pageWidth - divWidth) / 2;
  doc.setDrawColor(90, 45, 25);
  doc.setLineWidth(0.6);
  doc.line(divX, currentY, divX + divWidth, currentY);

  doc.setDrawColor(180, 50, 40);
  doc.setLineWidth(0.25);
  doc.line(divX + 8, currentY + 1.2, divX + divWidth - 8, currentY + 1.2);
  currentY += 7.5;

  // 6. Centered Banner Image Mat & Image
  if (data.bannerImageUrl) {
    try {
      const bannerBase64 = await preloadImageAsBase64(data.bannerImageUrl, 800);
      if (bannerBase64) {
        const imgWidth = contentWidth - 10; // 160 mm
        const imgHeight = 52;
        const imgX = (pageWidth - imgWidth) / 2;

        // Framing border
        doc.setFillColor(235, 218, 185);
        doc.setDrawColor(75, 40, 20);
        doc.setLineWidth(0.9);
        doc.rect(imgX - 1, currentY - 1, imgWidth + 2, imgHeight + 2, 'FD');

        // High-res Image
        doc.addImage(bannerBase64, 'JPEG', imgX, currentY, imgWidth, imgHeight, undefined, 'FAST');
        currentY += imgHeight + 9;
      }
    } catch {
      // Continue gracefully if image fetch is blocked
    }
  }

  // 7. Centered Illuminated Prologue Reliquary Container (Matches in-app preview!)
  const boxWidth = contentWidth - 10;
  const boxX = (pageWidth - boxWidth) / 2;
  const prologueHeader = 'I. PROLOGUE OF THE DARK ARCANUM';
  const prologueBody = `Know, seeker of forbidden arts, that these scriptures chronicle the manifestation of ${data.mainTitle}. Within this sacred scroll lie preserved relics, arcane rites, and cosmic lore forged through the fires of the Demon Codex. Let none alter this canon without the blood seal of the High Priest.`;

  doc.setFont('times', 'normal');
  doc.setFontSize(10);
  const wrappedPrologue = doc.splitTextToSize(prologueBody, boxWidth - 16);
  const boxHeight = 11 + wrappedPrologue.length * 5.0 + 8;

  // Shaded parchment box
  doc.setFillColor(240, 227, 197);
  doc.setDrawColor(120, 75, 40);
  doc.setLineWidth(0.5);
  doc.roundedRect(boxX, currentY, boxWidth, boxHeight, 3, 3, 'FD');

  // Box Header
  doc.setFont('times', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(115, 30, 20);
  doc.text(prologueHeader, pageWidth / 2, currentY + 7, { align: 'center' });

  // Box Divider
  doc.setDrawColor(141, 91, 45);
  doc.setLineWidth(0.3);
  doc.line(boxX + 20, currentY + 9.5, boxX + boxWidth - 20, currentY + 9.5);

  // Box Body Text
  doc.setFont('times', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(45, 25, 15);
  doc.text(wrappedPrologue, boxX + 8, currentY + 16);
  currentY += boxHeight + 8;

  // 8. Centered Wax Seal & High Priest Seal of Confirmation
  if (waxSealData && currentY < 240) {
    const sealSize = 34; // 34 mm
    const sealX = (pageWidth - sealSize) / 2;
    doc.addImage(waxSealData, 'PNG', sealX, currentY, sealSize, sealSize);

    doc.setFont('times', 'italic');
    doc.setFontSize(8.5);
    doc.setTextColor(110, 40, 25);
    doc.text('Confirmed & Bound by', pageWidth / 2, currentY + sealSize + 4.5, { align: 'center' });
    doc.setFont('times', 'bold');
    doc.text('The High Priest of the Codex', pageWidth / 2, currentY + sealSize + 8.5, { align: 'center' });
  }

  // Footer Tag
  doc.setFont('times', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(110, 70, 45);
  doc.text('Demon Codex Canon Scroll   *   Folio I', pageWidth / 2, pageHeight - 12, { align: 'center' });

  // ══════════════════════════════════════════════════════════════
  // PAGES 2..N: RELIC CARDS
  // ══════════════════════════════════════════════════════════════
  const cards = data.cards || [];
  for (let cIdx = 0; cIdx < cards.length; cIdx++) {
    const card = cards[cIdx];
    onProgress?.(`Inscribing Relic ${cIdx + 1} of ${cards.length}: ${card.title}...`);

    doc.addPage();
    applyParchmentBackground();

    let pageY = 25;

    // Relic Page Header
    drawOrnamentalHeader(
      doc,
      pageWidth,
      pageY,
      `RELIC SCRIPTURE ${cIdx + 1} OF ${cards.length}`
    );
    pageY += 11;

    // Relic Title (Centered)
    doc.setFont('times', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(45, 18, 10);
    const rTitleLines = doc.splitTextToSize(card.title.toUpperCase(), contentWidth - 10);
    rTitleLines.forEach((tl: string, idx: number) => {
      doc.text(tl.trim(), pageWidth / 2, pageY + idx * 7.5, { align: 'center' });
    });
    pageY += rTitleLines.length * 7.5 + 2;

    // Rarity Badge (Centered)
    doc.setFont('times', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(180, 25, 25);
    doc.text(`[ SACRED RELIC ARTIFACT   *   SOVEREIGN CONTINUITY CANON ]`, pageWidth / 2, pageY, {
      align: 'center',
    });
    pageY += 6;

    // Relic Image (Centered)
    if (card.imageUrl) {
      try {
        const relicImgBase64 = await preloadImageAsBase64(card.imageUrl, 750);
        if (relicImgBase64) {
          const rWidth = contentWidth - 10; // 160 mm
          const rHeight = 72;
          const rX = (pageWidth - rWidth) / 2;

          doc.setFillColor(235, 218, 185);
          doc.setDrawColor(65, 35, 15);
          doc.setLineWidth(0.8);
          doc.rect(rX - 1, pageY - 1, rWidth + 2, rHeight + 2, 'FD');

          doc.addImage(relicImgBase64, 'JPEG', rX, pageY, rWidth, rHeight, undefined, 'FAST');
          pageY += rHeight + 8;
        }
      } catch {
        // Continue gracefully
      }
    }

    // Sacred Lore & Scripture
    doc.setFont('times', 'bold');
    doc.setFontSize(11.5);
    doc.setTextColor(110, 30, 20);
    doc.text('SACRED LORE & SCRIPTURE', pageWidth / 2, pageY, { align: 'center' });
    pageY += 5.5;

    const loreText = `"${card.caption || card.description || 'Ancient scripture shrouded in abyssal darkness.'}"`;
    doc.setFont('times', 'italic');
    doc.setFontSize(9.5);
    doc.setTextColor(45, 25, 15);
    const wrappedLore = doc.splitTextToSize(loreText, contentWidth - 16);
    wrappedLore.forEach((ll: string, lIdx: number) => {
      doc.text(ll.trim(), pageWidth / 2, pageY + lIdx * 4.8, { align: 'center' });
    });
    pageY += wrappedLore.length * 4.8 + 6;

    // Manifestation Formula & Prompt Box
    doc.setFont('times', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(95, 30, 20);
    doc.text('INCANTATION & MANIFESTATION FORMULA', pageWidth / 2, pageY, { align: 'center' });
    pageY += 5;

    doc.setFont('courier', 'normal');
    doc.setFontSize(8);
    const wrappedPrompt = doc.splitTextToSize(card.prompt, contentWidth - 22);
    const promptBoxHeight = wrappedPrompt.length * 4.2 + 6;
    const promptBoxX = (pageWidth - (contentWidth - 10)) / 2;

    doc.setFillColor(238, 224, 196);
    doc.setDrawColor(120, 80, 50);
    doc.setLineWidth(0.3);
    doc.roundedRect(promptBoxX, pageY - 2, contentWidth - 10, promptBoxHeight, 2, 2, 'FD');

    doc.setTextColor(50, 30, 15);
    doc.text(wrappedPrompt, promptBoxX + 6, pageY + 2.5);
    pageY += promptBoxHeight + 5;

    // Sigil Resonance Tags (Centered)
    if (card.tags && card.tags.length > 0) {
      doc.setFont('times', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(115, 65, 35);
      const tagStr = card.tags.map((t) => `#${t.replace(/^#/, '')}`).join('   *   ');
      doc.text(`SIGIL RESONANCES:  ${tagStr}`, pageWidth / 2, pageY, { align: 'center' });
      pageY += 6;
    }

    // Folio Footer
    doc.setFont('times', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(110, 70, 45);
    doc.text(
      `The Demon Codex Archive   *   Folio ${cIdx + 2}`,
      pageWidth / 2,
      pageHeight - 12,
      { align: 'center' }
    );
  }

  // ══════════════════════════════════════════════════════════════
  // FINAL PAGE: ETERNAL CANON COLOPHON
  // ══════════════════════════════════════════════════════════════
  onProgress?.('Sealing ancient scroll with eternal colophon...');
  doc.addPage();
  applyParchmentBackground();

  let finalY = 32;

  drawOrnamentalHeader(doc, pageWidth, finalY, 'THE FINAL OATH & COLOPHON');
  finalY += 15;

  doc.setFont('times', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(45, 18, 10);
  doc.text('ETERNAL CANON SOLEMN COVENANT', pageWidth / 2, finalY, { align: 'center' });
  finalY += 12;

  const oathParagraphs = [
    `This Ancient Scroll was transcribed and rendered from the Abyssal Continuity Engine of The Demon Codex on ${new Date().toUTCString()}.`,
    'The relics inscribed herein are bound to the personal codex archive of the summoner. By unrolling this document, you acknowledge that all sacred lore, prompts, and visual manifests originate from the unified canon grimoire.',
    'May this ancient scroll serve as an immutable chronicle across all mortal realms. None shall break the continuity seal.',
  ];

  doc.setFont('times', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(50, 30, 18);

  for (const para of oathParagraphs) {
    const wrappedPara = doc.splitTextToSize(para, contentWidth - 20);
    wrappedPara.forEach((line: string, idx: number) => {
      doc.text(line.trim(), pageWidth / 2, finalY + idx * 5.2, { align: 'center' });
    });
    finalY += wrappedPara.length * 5.2 + 6;
  }

  finalY += 6;

  // Centered Colophon Wax Seal
  if (waxSealData) {
    const sealSize = 44;
    const sealX = (pageWidth - sealSize) / 2;
    doc.addImage(waxSealData, 'PNG', sealX, finalY, sealSize, sealSize);
    finalY += sealSize + 8;
  }

  doc.setFont('times', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(90, 30, 20);
  doc.text('THE DEMON CODEX * IMPRIMATUR', pageWidth / 2, finalY, { align: 'center' });
  finalY += 5;

  doc.setFont('times', 'italic');
  doc.setFontSize(8.5);
  doc.setTextColor(110, 65, 40);
  doc.text('https://thedemoncodex.com   *   Summoned via Gemini 3 Pro Neural Grimoire', pageWidth / 2, finalY, {
    align: 'center',
  });

  // Save the PDF with a clean filename
  const cleanTitle = (data.mainTitle || 'demon_codex_relics')
    .toLowerCase()
    .replace(/[^a-z0-9_-]/gi, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '') || 'ancient_scroll';

  onProgress?.('Manifesting Ancient Scroll PDF...');
  doc.save(`${cleanTitle}_Ancient_Scroll.pdf`);
}

/**
 * Convenience helper to export a single relic card as an Ancient Scroll PDF.
 */
export async function generateSingleRelicScrollPdf(
  card: PromptCard,
  archetype = 'Dark Fantasy Relic',
  options?: AncientScrollPdfOptions
): Promise<void> {
  const data: GeneratedData = {
    mainTitle: card.title,
    archetype,
    tone: 'Atmospheric Ancient Grimoire',
    use: 'Sacred Scroll Inscription',
    bannerImageUrl: card.imageUrl || '',
    cards: [
      {
        glyph: card.glyph || '✠',
        title: card.title,
        prompt: card.prompt || card.description || '',
        caption: card.caption || card.description || 'Ancient scripture inscribed into the sacred codex scroll.',
        imageUrl: card.imageUrl || '',
        tags: card.tags || ['relic', 'ancient-scroll'],
      },
    ],
    negativePrompts: [],
    remixSuggestions: [],
  };

  await generateAncientScrollPdf(data, options);
}
