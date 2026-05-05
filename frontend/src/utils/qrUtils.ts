const PAYLIBO_QR_IMAGE_URL = "https://api.paylibo.com/paylibo/generator/czech/image";

const CROP_SETTINGS = {
  SQUARE_SIZE_FACTOR: 0.7,
  VERTICAL_OFFSET_FACTOR: 0.01,
  WHITE_THRESHOLD: 240,
};

export type QrImageResult = {
  url: string;
  objectUrl: string;
  blob: Blob;
};

export type PaymentParams = {
  accountPrefix?: string;
  accountNumber: string;
  bankCode: string;
  amount: number;
  currency?: string;
  message?: string;
};

function formatAmount(amount: number): string {
  if (!Number.isFinite(amount)) {
    throw new Error("Amount must be a finite number");
  }
  return amount.toFixed(2);
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = url;
  });
}

async function cropPayliboLabel(blob: Blob): Promise<Blob> {
  if (typeof document === "undefined") return blob;

  const objectUrl = URL.createObjectURL(blob);

  try {
    const img = await loadImage(objectUrl);
    const w = img.naturalWidth || img.width;
    const h = img.naturalHeight || img.height;

    if (!w || !h) return blob;

    const side = Math.min(w, h) * CROP_SETTINGS.SQUARE_SIZE_FACTOR;

    const sx = (w - side) / 2;
    const sy = (h - side) / 2 + h * CROP_SETTINGS.VERTICAL_OFFSET_FACTOR;

    const safeSize = Math.floor(side);
    const safeSx = Math.max(0, Math.min(Math.floor(sx), w - safeSize));
    const safeSy = Math.max(0, Math.min(Math.floor(sy), h - safeSize));

    const canvas = document.createElement("canvas");
    canvas.width = safeSize;
    canvas.height = safeSize;

    const ctx = canvas.getContext("2d");
    if (!ctx) return blob;

    ctx.drawImage(img, safeSx, safeSy, safeSize, safeSize, 0, 0, safeSize, safeSize);

    const imageData = ctx.getImageData(0, 0, safeSize, safeSize);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      if (
        r > CROP_SETTINGS.WHITE_THRESHOLD &&
        g > CROP_SETTINGS.WHITE_THRESHOLD &&
        b > CROP_SETTINGS.WHITE_THRESHOLD
      ) {
        data[i + 3] = 0;
      }
    }

    ctx.putImageData(imageData, 0, 0);

    const croppedBlob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/png")
    );

    return croppedBlob ?? blob;
  } catch {
    return blob;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function buildPayliboQrUrl(params: PaymentParams): string {
  const search = new URLSearchParams();

  if (params.accountPrefix) {
    search.set("accountPrefix", params.accountPrefix);
  }

  search.set("accountNumber", params.accountNumber);
  search.set("bankCode", params.bankCode);
  search.set("amount", formatAmount(params.amount));
  search.set("currency", params.currency ?? "CZK");
  search.set("message", params.message ?? "Payment");

  return `${PAYLIBO_QR_IMAGE_URL}?${search.toString()}`;
}

export async function getQr(params: PaymentParams): Promise<QrImageResult> {
  const url = buildPayliboQrUrl(params);
  const response = await fetch(url);

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(`QR Fetch Error (${response.status}): ${errorText}`);
  }

  const originalBlob = await response.blob();
  const croppedBlob = await cropPayliboLabel(originalBlob);
  const objectUrl = URL.createObjectURL(croppedBlob);

  return {
    url,
    objectUrl,
    blob: croppedBlob,
  };
}

export async function addBackgroundToQr(
  transparentBlob: Blob,
  backgroundColor: string = "#FFFFFF"
): Promise<Blob> {
  const objectUrl = URL.createObjectURL(transparentBlob);

  try {
    const img = await loadImage(objectUrl);
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;

    const ctx = canvas.getContext("2d");
    if (!ctx) return transparentBlob;

    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.drawImage(img, 0, 0);

    const resultBlob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/png")
    );

    return resultBlob ?? transparentBlob;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
