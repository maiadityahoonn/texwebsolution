"use client";

/**
 * Bulletproof Multi-Page PDF Exporter with Official Corporate Letterhead
 * 1. Safely inlines images as base64 Data URLs so html2canvas never taints the canvas.
 * 2. Directly uses jsPDF (A4 595.28 x 841.89 pt) to generate and download the actual .pdf file.
 * 3. Never triggers browser window.print() fallback.
 */

async function convertImageToDataUrl(imgElement) {
  try {
    if (!imgElement || !imgElement.src) return null;
    if (imgElement.src.startsWith("data:") || imgElement.src.startsWith("blob:")) {
      return imgElement.src;
    }

    const response = await fetch(imgElement.src, { mode: "cors" });
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch (err) {
    console.warn("Could not convert image to data URL:", imgElement?.src, err);
    return null;
  }
}

export async function downloadDocumentAsPdf({
  draftDoc = {},
  onStart = () => {},
  onSuccess = () => {},
  onError = () => {},
}) {
  if (typeof window === "undefined") return;

  // Track modified images to restore their original src afterwards
  const inlinedImages = [];

  try {
    onStart();

    // 1. Locate all A4 canvas sheet elements
    const pageSheets = Array.from(document.querySelectorAll(".a4-sheet-canvas"));
    if (!pageSheets.length) {
      throw new Error("No document pages found on the screen to export.");
    }

    // 2. Pre-inline all sheet images (especially the official letterhead) as base64 DataURLs
    // This completely prevents canvas tainting and SecurityErrors during toDataURL()
    const allImages = Array.from(document.querySelectorAll(".a4-sheet-canvas img"));
    for (const img of allImages) {
      try {
        if (!img.complete) {
          await new Promise((res) => {
            img.onload = res;
            img.onerror = res;
          });
        }
        const dataUrl = await convertImageToDataUrl(img);
        if (dataUrl && dataUrl !== img.src) {
          inlinedImages.push({ element: img, originalSrc: img.src });
          img.src = dataUrl;
        }
      } catch (e) {
        // Continue even if an individual image fails to inline
      }
    }

    // 3. Dynamically import jspdf and html2canvas-pro (with native lab, oklch, and oklab support)
    const jsPdfModule = await import("jspdf");
    const JsPdfClass =
      jsPdfModule.jsPDF || jsPdfModule.default?.jsPDF || jsPdfModule.default;
    if (typeof JsPdfClass !== "function") {
      throw new Error("jsPDF library failed to load properly.");
    }

    const proModule = await import("html2canvas-pro");
    const html2canvas = proModule.default || proModule;
    if (typeof html2canvas !== "function") {
      throw new Error("html2canvas-pro library failed to load properly.");
    }

    // 4. Clean document filename
    const docNumber =
      draftDoc.quotation_number ||
      draftDoc.agreement_number ||
      draftDoc.invoice_number ||
      "DOC";
    const cleanTitle = (draftDoc.title || "Quotation")
      .replace(/[^a-zA-Z0-9_\-\s]/g, "")
      .trim()
      .replace(/\s+/g, "_")
      .slice(0, 40);
    const fileName = `TexWeb_${docNumber}_${cleanTitle}.pdf`;

    // 5. Activate PDF export mode on body (cleans handles, guides, buttons)
    document.body.classList.add("pdf-exporting");
    await new Promise((resolve) => setTimeout(resolve, 100));

    // 6. Initialize standard A4 PDF document
    const pdf = new JsPdfClass({
      orientation: "portrait",
      unit: "pt",
      format: "a4",
      compress: true,
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    // 7. Render each A4 page sheet onto high-res canvas
    for (let i = 0; i < pageSheets.length; i++) {
      const sheet = pageSheets[i];

      const canvas = await html2canvas(sheet, {
        scale: 2,
        useCORS: true,
        allowTaint: false, // Must be false so toDataURL never throws SecurityError
        logging: false,
        backgroundColor: "#ffffff",
        windowWidth: 794,
        scrollX: 0,
        scrollY: 0,
        onclone: (clonedDoc, clonedElement) => {
          clonedElement.style.transform = "none";
          clonedElement.style.margin = "0";
          clonedElement.style.boxShadow = "none";
          clonedElement.style.border = "none";
        },
      });

      let imgData = null;
      try {
        imgData = canvas.toDataURL("image/jpeg", 0.96);
      } catch {
        imgData = canvas.toDataURL("image/png");
      }

      if (!imgData) {
        throw new Error(`Failed to extract image data for page ${i + 1}`);
      }

      if (i > 0) {
        pdf.addPage("a4", "portrait");
      }

      pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight, undefined, "FAST");
    }

    // 8. Remove PDF export mode
    document.body.classList.remove("pdf-exporting");

    // 9. Directly trigger actual .pdf file download
    pdf.save(fileName);

    onSuccess(fileName);
  } catch (err) {
    console.error("PDF generation error:", err);
    document.body.classList.remove("pdf-exporting");
    onError(err);
  } finally {
    // Restore any images that were temporarily inlined
    inlinedImages.forEach(({ element, originalSrc }) => {
      try {
        element.src = originalSrc;
      } catch {}
    });
  }
}
