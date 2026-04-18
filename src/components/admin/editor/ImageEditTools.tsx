import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, Eraser, Wand2, Sparkles, RotateCcw, Check, Crop as CropIcon, RotateCw, FlipHorizontal, FlipVertical } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { removeBackground } from "@imgly/background-removal";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  src: string; // current image
  onApply: (newSrc: string) => Promise<void> | void; // returns blob URL or data URL
}

type Tool = "brush" | "magic" | "crop";

interface CropRect { x: number; y: number; w: number; h: number; }

const loadImage = (src: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

const ImageEditTools = ({ open, onOpenChange, src, onApply }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState<Tool>("brush");
  const [brushSize, setBrushSize] = useState(40);
  const [tolerance, setTolerance] = useState(32);
  const [busy, setBusy] = useState(false);
  const [busyMsg, setBusyMsg] = useState("");
  const [imgSize, setImgSize] = useState({ w: 800, h: 600 });
  const [history, setHistory] = useState<ImageData[]>([]);
  const drawingRef = useRef(false);
  const [crop, setCrop] = useState<CropRect | null>(null);
  const cropDragRef = useRef<{ mode: "create" | "move" | "resize"; startX: number; startY: number; orig: CropRect } | null>(null);

  // Load image into canvas when opened or src changes
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      try {
        const img = await loadImage(src);
        if (cancelled) return;
        const max = 1200;
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        setImgSize({ w, h });
        requestAnimationFrame(() => {
          const canvas = canvasRef.current;
          if (!canvas) return;
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext("2d")!;
          ctx.clearRect(0, 0, w, h);
          ctx.drawImage(img, 0, 0, w, h);
          setHistory([ctx.getImageData(0, 0, w, h)]);
          setCrop(null);
        });
      } catch (e: any) {
        toast({ title: "Couldn't load image", description: e.message ?? String(e), variant: "destructive" });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, src]);

  const pushHistory = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    setHistory((h) => [...h.slice(-19), ctx.getImageData(0, 0, canvas.width, canvas.height)]);
  };

  const undo = () => {
    setHistory((h) => {
      if (h.length <= 1) return h;
      const next = h.slice(0, -1);
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d")!;
        ctx.putImageData(next[next.length - 1], 0, 0);
      }
      return next;
    });
  };

  const reset = async () => {
    try {
      const img = await loadImage(src);
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d")!;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      setHistory([ctx.getImageData(0, 0, canvas.width, canvas.height)]);
    } catch {}
  };

  // ---- Brush eraser ----
  const getCanvasCoords = (e: React.PointerEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const sx = canvas.width / rect.width;
    const sy = canvas.height / rect.height;
    return { x: (e.clientX - rect.left) * sx, y: (e.clientY - rect.top) * sy };
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (busy) return;
    if (tool === "brush") {
      pushHistory();
      drawingRef.current = true;
      eraseAt(e);
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } else if (tool === "magic") {
      pushHistory();
      magicEraseAt(e);
    } else if (tool === "crop") {
      const { x, y } = getCanvasCoords(e);
      // If clicking inside existing crop → move; near bottom-right corner → resize; else create new
      if (crop) {
        const inside = x >= crop.x && x <= crop.x + crop.w && y >= crop.y && y <= crop.y + crop.h;
        const nearCorner =
          Math.abs(x - (crop.x + crop.w)) < 24 && Math.abs(y - (crop.y + crop.h)) < 24;
        if (nearCorner) {
          cropDragRef.current = { mode: "resize", startX: x, startY: y, orig: { ...crop } };
        } else if (inside) {
          cropDragRef.current = { mode: "move", startX: x, startY: y, orig: { ...crop } };
        } else {
          setCrop({ x, y, w: 0, h: 0 });
          cropDragRef.current = { mode: "create", startX: x, startY: y, orig: { x, y, w: 0, h: 0 } };
        }
      } else {
        setCrop({ x, y, w: 0, h: 0 });
        cropDragRef.current = { mode: "create", startX: x, startY: y, orig: { x, y, w: 0, h: 0 } };
      }
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (tool === "brush" && drawingRef.current) {
      eraseAt(e);
      return;
    }
    if (tool === "crop" && cropDragRef.current) {
      const canvas = canvasRef.current!;
      const { x, y } = getCanvasCoords(e);
      const d = cropDragRef.current;
      const clamp = (v: number, max: number) => Math.max(0, Math.min(max, v));
      if (d.mode === "create") {
        const nx = Math.min(d.startX, x);
        const ny = Math.min(d.startY, y);
        const nw = Math.abs(x - d.startX);
        const nh = Math.abs(y - d.startY);
        setCrop({ x: clamp(nx, canvas.width), y: clamp(ny, canvas.height), w: nw, h: nh });
      } else if (d.mode === "move") {
        const dx = x - d.startX;
        const dy = y - d.startY;
        setCrop({
          x: clamp(d.orig.x + dx, canvas.width - d.orig.w),
          y: clamp(d.orig.y + dy, canvas.height - d.orig.h),
          w: d.orig.w,
          h: d.orig.h,
        });
      } else if (d.mode === "resize") {
        setCrop({
          x: d.orig.x,
          y: d.orig.y,
          w: clamp(x - d.orig.x, canvas.width - d.orig.x),
          h: clamp(y - d.orig.y, canvas.height - d.orig.y),
        });
      }
    }
  };

  const onPointerUp = () => {
    drawingRef.current = false;
    cropDragRef.current = null;
  };

  const applyCrop = () => {
    if (!crop || crop.w < 5 || crop.h < 5) {
      toast({ title: "Draw a crop area first", description: "Click and drag on the image to mark the crop area.", variant: "destructive" });
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    pushHistory();
    const ctx = canvas.getContext("2d")!;
    const cropped = ctx.getImageData(crop.x, crop.y, crop.w, crop.h);
    canvas.width = Math.round(crop.w);
    canvas.height = Math.round(crop.h);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.putImageData(cropped, 0, 0);
    setImgSize({ w: canvas.width, h: canvas.height });
    setCrop(null);
    setHistory((h) => [...h.slice(-19), ctx.getImageData(0, 0, canvas.width, canvas.height)]);
    toast({ title: "Cropped", description: `New size: ${canvas.width} × ${canvas.height}px` });
  };

  const eraseAt = (e: React.PointerEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const { x, y } = getCanvasCoords(e);
    ctx.save();
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(x, y, brushSize, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  // ---- Magic eraser (flood-fill by color tolerance) ----
  const magicEraseAt = (e: React.PointerEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const { x, y } = getCanvasCoords(e);
    const sx = Math.floor(x);
    const sy = Math.floor(y);
    const w = canvas.width;
    const h = canvas.height;
    const img = ctx.getImageData(0, 0, w, h);
    const data = img.data;
    const idx = (px: number, py: number) => (py * w + px) * 4;

    const startIdx = idx(sx, sy);
    const sr = data[startIdx], sg = data[startIdx + 1], sb = data[startIdx + 2], sa = data[startIdx + 3];
    if (sa === 0) return; // already transparent

    const tol2 = tolerance * tolerance * 3;
    const visited = new Uint8Array(w * h);
    const stack: number[] = [sx, sy];

    while (stack.length) {
      const py = stack.pop()!;
      const px = stack.pop()!;
      if (px < 0 || py < 0 || px >= w || py >= h) continue;
      const flatIdx = py * w + px;
      if (visited[flatIdx]) continue;
      visited[flatIdx] = 1;
      const i = flatIdx * 4;
      const dr = data[i] - sr;
      const dg = data[i + 1] - sg;
      const db = data[i + 2] - sb;
      const dist2 = dr * dr + dg * dg + db * db;
      if (dist2 > tol2) continue;
      // Make transparent
      data[i + 3] = 0;
      stack.push(px + 1, py, px - 1, py, px, py + 1, px, py - 1);
    }
    ctx.putImageData(img, 0, 0);
  };

  // ---- Rotate / Flip transforms (bake into canvas) ----
  const applyTransform = (mode: "rotate-cw" | "rotate-ccw" | "flip-h" | "flip-v") => {
    const canvas = canvasRef.current;
    if (!canvas || busy) return;
    pushHistory();
    const ctx = canvas.getContext("2d")!;
    const w = canvas.width;
    const h = canvas.height;
    const tmp = document.createElement("canvas");
    tmp.width = w;
    tmp.height = h;
    tmp.getContext("2d")!.drawImage(canvas, 0, 0);

    if (mode === "rotate-cw" || mode === "rotate-ccw") {
      canvas.width = h;
      canvas.height = w;
      ctx.save();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(mode === "rotate-cw" ? Math.PI / 2 : -Math.PI / 2);
      ctx.drawImage(tmp, -w / 2, -h / 2);
      ctx.restore();
      setImgSize({ w: canvas.width, h: canvas.height });
    } else {
      ctx.save();
      ctx.clearRect(0, 0, w, h);
      ctx.translate(mode === "flip-h" ? w : 0, mode === "flip-v" ? h : 0);
      ctx.scale(mode === "flip-h" ? -1 : 1, mode === "flip-v" ? -1 : 1);
      ctx.drawImage(tmp, 0, 0);
      ctx.restore();
    }
    setHistory((hh) => [...hh.slice(-19), ctx.getImageData(0, 0, canvas.width, canvas.height)]);
    setCrop(null);
  };

  // ---- AI background removal ----
  const aiRemoveBg = async () => {
    if (busy) return;
    setBusy(true);
    setBusyMsg("Removing background with AI… (first run downloads model ~30MB)");
    try {
      pushHistory();
      // Use current canvas as input to preserve any prior edits
      const canvas = canvasRef.current!;
      const blob: Blob = await new Promise((res) => canvas.toBlob((b) => res(b!), "image/png"));
      const resultBlob = await removeBackground(blob);
      const url = URL.createObjectURL(resultBlob);
      const img = await loadImage(url);
      const ctx = canvas.getContext("2d")!;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      toast({ title: "Background removed", description: "AI removed the background." });
    } catch (e: any) {
      console.error(e);
      toast({ title: "BG removal failed", description: e.message ?? String(e), variant: "destructive" });
    } finally {
      setBusy(false);
      setBusyMsg("");
    }
  };

  const apply = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setBusy(true);
    setBusyMsg("Applying changes…");
    try {
      const dataUrl = canvas.toDataURL("image/png");
      await onApply(dataUrl);
      onOpenChange(false);
    } finally {
      setBusy(false);
      setBusyMsg("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-coral" />
            Photo Editor — Eraser, Magic Eraser & BG Remove
          </DialogTitle>
        </DialogHeader>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2 p-2 border rounded-lg bg-muted/30">
          <Button
            size="sm"
            variant={tool === "brush" ? "default" : "outline"}
            className={tool === "brush" ? "bg-coral hover:bg-coral-dark text-white" : ""}
            onClick={() => setTool("brush")}
            disabled={busy}
          >
            <Eraser className="w-4 h-4 mr-1" /> Brush Eraser
          </Button>
          <Button
            size="sm"
            variant={tool === "magic" ? "default" : "outline"}
            className={tool === "magic" ? "bg-coral hover:bg-coral-dark text-white" : ""}
            onClick={() => setTool("magic")}
            disabled={busy}
          >
            <Wand2 className="w-4 h-4 mr-1" /> Magic Eraser
          </Button>
          <Button
            size="sm"
            variant={tool === "crop" ? "default" : "outline"}
            className={tool === "crop" ? "bg-coral hover:bg-coral-dark text-white" : ""}
            onClick={() => setTool("crop")}
            disabled={busy}
          >
            <CropIcon className="w-4 h-4 mr-1" /> Crop
          </Button>
          <Button size="sm" variant="outline" onClick={aiRemoveBg} disabled={busy}>
            {busy ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Sparkles className="w-4 h-4 mr-1" />}
            AI Remove Background
          </Button>

          {/* Rotate / Flip — instant transforms (no tool mode) */}
          <div className="flex items-center gap-1 pl-2 ml-2 border-l">
            <Button size="sm" variant="outline" className="h-8 w-8 p-0" onClick={() => applyTransform("rotate-ccw")} disabled={busy} title="Rotate 90° counter-clockwise">
              <RotateCcw className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="outline" className="h-8 w-8 p-0" onClick={() => applyTransform("rotate-cw")} disabled={busy} title="Rotate 90° clockwise">
              <RotateCw className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="outline" className="h-8 w-8 p-0" onClick={() => applyTransform("flip-h")} disabled={busy} title="Flip horizontally">
              <FlipHorizontal className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="outline" className="h-8 w-8 p-0" onClick={() => applyTransform("flip-v")} disabled={busy} title="Flip vertically">
              <FlipVertical className="w-4 h-4" />
            </Button>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <Button size="sm" variant="ghost" onClick={undo} disabled={busy || history.length <= 1}>
              <RotateCcw className="w-4 h-4 mr-1" /> Undo
            </Button>
            <Button size="sm" variant="ghost" onClick={reset} disabled={busy}>
              Reset
            </Button>
          </div>
        </div>

        {/* Tool settings */}
        <div className="grid grid-cols-2 gap-3">
          {tool === "brush" && (
            <div>
              <Label className="text-xs">Brush Size: {brushSize}px</Label>
              <input
                type="range"
                min={5}
                max={200}
                value={brushSize}
                onChange={(e) => setBrushSize(Number(e.target.value))}
                className="w-full"
                disabled={busy}
              />
            </div>
          )}
          {tool === "magic" && (
            <div>
              <Label className="text-xs">Color Tolerance: {tolerance}</Label>
              <input
                type="range"
                min={1}
                max={120}
                value={tolerance}
                onChange={(e) => setTolerance(Number(e.target.value))}
                className="w-full"
                disabled={busy}
              />
              <p className="text-[10px] text-muted-foreground mt-1">Click any color to erase all similar pixels.</p>
            </div>
          )}
          {tool === "crop" && (
            <div className="col-span-2 flex flex-wrap items-center gap-2">
              <p className="text-xs text-muted-foreground flex-1 min-w-[200px]">
                Drag on the image to draw a crop box. Drag inside to move, drag the bottom-right corner to resize.
                {crop && crop.w > 0 && crop.h > 0 && (
                  <> Selected: <b>{Math.round(crop.w)} × {Math.round(crop.h)}px</b></>
                )}
              </p>
              <Button size="sm" variant="outline" onClick={() => setCrop(null)} disabled={busy || !crop}>
                Clear
              </Button>
              <Button
                size="sm"
                className="bg-coral hover:bg-coral-dark text-white"
                onClick={applyCrop}
                disabled={busy || !crop || crop.w < 5 || crop.h < 5}
              >
                <CropIcon className="w-4 h-4 mr-1" /> Apply Crop
              </Button>
            </div>
          )}
        </div>

        {/* Canvas */}
        <div
          className="relative border-2 border-border rounded-lg overflow-auto max-h-[60vh] bg-[length:24px_24px]"
          style={{
            backgroundImage:
              "linear-gradient(45deg, #f4f4f5 25%, transparent 25%), linear-gradient(-45deg, #f4f4f5 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f4f4f5 75%), linear-gradient(-45deg, transparent 75%, #f4f4f5 75%)",
            backgroundPosition: "0 0, 0 12px, 12px -12px, 12px 0",
          }}
        >
          <div className="relative inline-block" style={{ width: "100%", maxWidth: imgSize.w, margin: "0 auto" }}>
            <canvas
              ref={canvasRef}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerLeave={onPointerUp}
              style={{
                width: "100%",
                height: "auto",
                cursor: tool === "brush" ? "crosshair" : tool === "crop" ? "crosshair" : "cell",
                touchAction: "none",
                display: "block",
              }}
            />
            {/* Crop overlay */}
            {tool === "crop" && crop && crop.w > 0 && crop.h > 0 && (
              <div
                className="absolute pointer-events-none border-2 border-dashed border-coral"
                style={{
                  left: `${(crop.x / imgSize.w) * 100}%`,
                  top: `${(crop.y / imgSize.h) * 100}%`,
                  width: `${(crop.w / imgSize.w) * 100}%`,
                  height: `${(crop.h / imgSize.h) * 100}%`,
                  boxShadow: "0 0 0 9999px rgba(0,0,0,0.4)",
                }}
              >
                {/* Resize handle (bottom-right) */}
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-coral border border-white rounded-sm" />
              </div>
            )}
          </div>
          {busy && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <div className="bg-card rounded-lg p-4 shadow-2xl flex items-center gap-3">
                <Loader2 className="w-5 h-5 animate-spin text-coral" />
                <span className="text-sm">{busyMsg}</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-2">
          <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)} disabled={busy}>
            Cancel
          </Button>
          <Button className="flex-1 bg-coral hover:bg-coral-dark text-white" onClick={apply} disabled={busy}>
            <Check className="w-4 h-4 mr-1" /> Apply to Layer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageEditTools;
