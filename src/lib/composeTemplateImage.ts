import type { PhotoSlot, SlotPhoto } from "@/components/customize/TemplateCustomizer";

/**
 * Composes the final design:
 *  1. Draw each user photo at the slot location (clipped to slot shape).
 *  2. Draw the template ON TOP, but with the slot areas "punched out"
 *     (cut as transparent holes) so the photo shows through while the
 *     surrounding decoration (text, stickers, borders) stays intact.
 *
 * This matches OMGS-style behaviour: decoration is preserved, photo sits
 * exactly inside the placeholder, and nothing leaks outside the slot.
 */
export async function composeTemplateImage(
  templateUrl: string,
  slots: PhotoSlot[],
  photos: SlotPhoto[],
  onProgress?: (pct: number) => void
): Promise<string> {
  const report = (p: number) => onProgress?.(Math.max(0, Math.min(1, p)));
  report(0.05);

  const template = await loadImage(templateUrl);
  report(0.2);

  const maxW = 2000;
  const scale = template.naturalWidth > maxW ? maxW / template.naturalWidth : 1;
  const W = Math.round(template.naturalWidth * scale);
  const H = Math.round(template.naturalHeight * scale);

  // ---- Layer 1: photos (drawn first, will be the base) ----
  const photoCanvas = document.createElement("canvas");
  photoCanvas.width = W;
  photoCanvas.height = H;
  const pctx = photoCanvas.getContext("2d");
  if (!pctx) throw new Error("Canvas not supported");
  pctx.fillStyle = "#ffffff";
  pctx.fillRect(0, 0, W, H);

  for (let i = 0; i < slots.length; i++) {
    const slot = slots[i];
    const photo = photos[i];
    if (!photo?.imageDataUrl) continue;

    const sx = slot.x * W;
    const sy = slot.y * H;
    const sw = slot.width * W;
    const sh = slot.height * H;

    const userImg = await loadImage(photo.imageDataUrl);
    drawPhotoInSlot(pctx, userImg, slot, photo, sx, sy, sw, sh, scale);
    report(0.2 + ((i + 1) / slots.length) * 0.4);
  }

  // ---- Layer 2: template with slot areas punched out ----
  const templateCanvas = document.createElement("canvas");
  templateCanvas.width = W;
  templateCanvas.height = H;
  const tctx = templateCanvas.getContext("2d");
  if (!tctx) throw new Error("Canvas not supported");
  tctx.drawImage(template, 0, 0, W, H);
  report(0.7);

  // Punch transparent holes where the slots are so photo shows through
  tctx.globalCompositeOperation = "destination-out";
  for (const slot of slots) {
    const sx = slot.x * W;
    const sy = slot.y * H;
    const sw = slot.width * W;
    const sh = slot.height * H;
    tctx.beginPath();
    if (slot.shape === "circle") {
      tctx.ellipse(sx + sw / 2, sy + sh / 2, sw / 2, sh / 2, 0, 0, Math.PI * 2);
    } else if (slot.shape === "rounded") {
      const r = Math.min(sw, sh) * 0.12;
      roundRectPath(tctx, sx, sy, sw, sh, r);
    } else {
      tctx.rect(sx, sy, sw, sh);
    }
    tctx.fill();
  }
  tctx.globalCompositeOperation = "source-over";
  report(0.85);

  // ---- Composite: template-with-holes drawn over photos ----
  pctx.drawImage(templateCanvas, 0, 0);
  report(0.95);

  const dataUrl = photoCanvas.toDataURL("image/jpeg", 0.92);
  report(1);
  return dataUrl;
}

/**
 * Draws a single user photo inside a slot, clipped to the slot's shape,
 * applying the user's pan/zoom/rotate transform.
 */
function drawPhotoInSlot(
  ctx: CanvasRenderingContext2D,
  userImg: HTMLImageElement,
  slot: PhotoSlot,
  photo: SlotPhoto,
  sx: number,
  sy: number,
  sw: number,
  sh: number,
  scale: number
) {
  ctx.save();
  ctx.beginPath();
  if (slot.shape === "circle") {
    ctx.ellipse(sx + sw / 2, sy + sh / 2, sw / 2, sh / 2, 0, 0, Math.PI * 2);
  } else if (slot.shape === "rounded") {
    const r = Math.min(sw, sh) * 0.12;
    roundRectPath(ctx, sx, sy, sw, sh, r);
  } else {
    ctx.rect(sx, sy, sw, sh);
  }
  ctx.clip();

  const imgRatio = userImg.naturalWidth / userImg.naturalHeight;
  const slotRatio = sw / sh;
  let dw: number, dh: number;
  if (imgRatio > slotRatio) {
    dh = sh;
    dw = sh * imgRatio;
  } else {
    dw = sw;
    dh = sw / imgRatio;
  }
  const tScale = photo.transform.scale || 1;
  const tx = (photo.transform.x || 0) * scale;
  const ty = (photo.transform.y || 0) * scale;
  const cx = sx + sw / 2 + tx;
  const cy = sy + sh / 2 + ty;
  const finalW = dw * tScale;
  const finalH = dh * tScale;

  ctx.translate(cx, cy);
  if (photo.transform.rotate) {
    ctx.rotate((photo.transform.rotate * Math.PI) / 180);
  }
  ctx.drawImage(userImg, -finalW / 2, -finalH / 2, finalW, finalH);
  ctx.restore();
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}

function roundRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
