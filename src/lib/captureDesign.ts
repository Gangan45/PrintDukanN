import { toJpeg } from "html-to-image";

/**
 * Captures the customizer preview DOM exactly as the user sees it,
 * producing a high-resolution JPEG. This guarantees zero mismatch
 * between preview and saved design.
 */
export async function captureDesignFromDOM(
  node: HTMLElement,
  onProgress?: (pct: number) => void
): Promise<string> {
  const report = (p: number) => onProgress?.(Math.max(0, Math.min(1, p)));
  report(0.1);

  // Wait one paint frame so any pending image loads / transforms settle
  await new Promise((r) => requestAnimationFrame(() => r(null)));
  report(0.25);

  // Wait for all <img> inside the node to be fully decoded
  const imgs = Array.from(node.querySelectorAll("img"));
  await Promise.all(
    imgs.map((img) =>
      img.complete && img.naturalWidth
        ? Promise.resolve()
        : new Promise<void>((res) => {
            img.onload = () => res();
            img.onerror = () => res();
          })
    )
  );
  report(0.5);

  // Render at 3× pixel density for print-quality
  const dataUrl = await toJpeg(node, {
    pixelRatio: 3,
    quality: 0.95,
    cacheBust: true,
    backgroundColor: "#ffffff",
    skipFonts: true,
  });
  report(1);
  return dataUrl;
}
