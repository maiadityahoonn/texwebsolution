/**
 * Automatic Image Resizer and WebP Converter for Profile Photos and Attachments
 * Converts any image format (JPG, PNG, HEIC/HEIF via canvas, BMP, etc.) to optimized .webp
 */

export async function processImageToWebp(file, options = {}) {
  const {
    maxSize = 400,
    quality = 0.85,
    squareCrop = true,
  } = options;

  if (!file) {
    throw new Error("No file provided.");
  }

  if (typeof window === "undefined") {
    throw new Error("Image processing is only supported in browser environments.");
  }

  // Verify it's an image
  if (!file.type || !file.type.startsWith("image/")) {
    throw new Error("Invalid file format. Please choose an image (PNG, JPG, JPEG, WEBP).");
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => {
      reject(new Error("Unable to read the chosen image file."));
    };

    reader.onload = () => {
      const img = new Image();

      img.onerror = () => {
        reject(new Error("Failed to load image for WebP processing."));
      };

      img.onload = () => {
        try {
          let sx = 0;
          let sy = 0;
          let sWidth = img.naturalWidth || img.width;
          let sHeight = img.naturalHeight || img.height;

          let targetWidth = maxSize;
          let targetHeight = maxSize;

          if (squareCrop) {
            // Center crop to 1:1 aspect ratio for avatars
            const edge = Math.min(sWidth, sHeight);
            sx = (sWidth - edge) / 2;
            sy = (sHeight - edge) / 2;
            sWidth = edge;
            sHeight = edge;
            targetWidth = Math.min(edge, maxSize);
            targetHeight = Math.min(edge, maxSize);
          } else {
            // Preserve aspect ratio within maxSize
            const ratio = Math.min(maxSize / sWidth, maxSize / sHeight, 1);
            targetWidth = Math.max(1, Math.round(sWidth * ratio));
            targetHeight = Math.max(1, Math.round(sHeight * ratio));
          }

          const canvas = document.createElement("canvas");
          canvas.width = targetWidth;
          canvas.height = targetHeight;

          const ctx = canvas.getContext("2d", { alpha: true });
          if (!ctx) {
            throw new Error("HTML Canvas 2D context not available.");
          }

          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";

          // Draw the cropped/scaled image onto canvas
          ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, targetWidth, targetHeight);

          // Convert to WebP format
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const baseName = (file.name || "avatar").replace(/\.[^/.]+$/, "");
                const webpFile = new File([blob], `${baseName}.webp`, {
                  type: "image/webp",
                  lastModified: Date.now(),
                });

                const previewUrl = URL.createObjectURL(blob);
                const originalKb = Math.round(file.size / 1024);
                const newKb = Math.max(1, Math.round(blob.size / 1024));
                const savings = originalKb > 0 ? Math.round(((originalKb - newKb) / originalKb) * 100) : 0;

                resolve({
                  file: webpFile,
                  blob,
                  previewUrl,
                  dataUrl: canvas.toDataURL("image/webp", quality),
                  originalSize: file.size,
                  newSize: blob.size,
                  originalKb,
                  newKb,
                  savingsPercent: savings > 0 ? savings : 0,
                  width: targetWidth,
                  height: targetHeight,
                });
              } else {
                // Fallback to dataURL if toBlob isn't supported
                const dataUrl = canvas.toDataURL("image/webp", quality);
                resolve({
                  file: null,
                  blob: null,
                  previewUrl: dataUrl,
                  dataUrl,
                  originalSize: file.size,
                  newSize: Math.round(dataUrl.length * 0.75),
                  originalKb: Math.round(file.size / 1024),
                  newKb: Math.max(1, Math.round((dataUrl.length * 0.75) / 1024)),
                  savingsPercent: 0,
                  width: targetWidth,
                  height: targetHeight,
                });
              }
            },
            "image/webp",
            quality
          );
        } catch (err) {
          reject(err);
        }
      };

      img.src = reader.result;
    };

    reader.readAsDataURL(file);
  });
}
