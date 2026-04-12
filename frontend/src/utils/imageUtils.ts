export type CompressToWebpOptions = {
    /** Max width of the longer edge (px). */
    maxSize?: number;
    /** WebP quality 0..1 */
    quality?: number;
};

const loadImage = (file: File): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = (e) => reject(e);
        img.src = URL.createObjectURL(file);
    });
};

const canvasToBlob = (canvas: HTMLCanvasElement, type: string, quality?: number): Promise<Blob> => {
    return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (!blob) return reject(new Error("Failed to convert canvas to blob"));
            resolve(blob);
        }, type, quality);
    });
};

/**
 * Compresses an image file and converts it to WebP on the client.
 * Keeps aspect ratio, resizes so the longer edge is <= maxSize.
 */
export const compressToWebp = async (file: File, options: CompressToWebpOptions = {}): Promise<File> => {
    const maxSize = options.maxSize ?? 640;
    const quality = options.quality ?? 0.8;

    const img = await loadImage(file);

    const srcWidth = img.naturalWidth || img.width;
    const srcHeight = img.naturalHeight || img.height;

    const scale = Math.min(1, maxSize / Math.max(srcWidth, srcHeight));
    const width = Math.max(1, Math.round(srcWidth * scale));
    const height = Math.max(1, Math.round(srcHeight * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D context not available");

    ctx.drawImage(img, 0, 0, width, height);

    // Clean up the temporary object URL.
    try {
        URL.revokeObjectURL(img.src);
    } catch {
        // ignore
    }

    const blob = await canvasToBlob(canvas, "image/webp", quality);

    const name = file.name.replace(/\.[^.]+$/, "") + ".webp";
    return new File([blob], name, {type: "image/webp", lastModified: Date.now()});
};

