import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ImagePlus,
  Type,
  Square as SquareIcon,
  Loader2,
  Trash2,
  ArrowUp,
  ArrowDown,
  Save,
  Upload,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Copy,
  FlipHorizontal,
  FlipVertical,
  AlignCenter,
  Camera,
  FileImage,
  Layers as LayersIcon,
  Maximize2,
  Sparkles,
  UserCog,
  Undo2,
  Redo2,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { toPng } from "html-to-image";
import { readPsd } from "ag-psd";
import {
  ProductShape,
  shapeLabel,
} from "@/components/customize/ShapeMask";
import ColorPickerPro from "./editor/ColorPickerPro";
import ImageEditTools from "./editor/ImageEditTools";
import { Switch } from "@/components/ui/switch";

// ---------- Types ----------

export interface CustomerPermissions {
  replaceImage?: boolean; // image layers only — let buyer swap photo
  editText?: boolean;     // text layers only — let buyer change text
  changeColor?: boolean;  // text layers only — let buyer pick color
  move?: boolean;         // any — let buyer reposition
  resize?: boolean;       // any — let buyer scale
}

export type DesignLayer =
  | {
      id: string;
      name?: string;
      type: "image";
      src: string;
      x: number; // 0-1 normalized
      y: number;
      w: number; // 0-1 normalized
      h: number;
      rotation: number;
      opacity: number;
      flipH?: boolean;
      flipV?: boolean;
      visible: boolean;
      locked: boolean;
      customerCan?: CustomerPermissions;
    }
  | {
      id: string;
      name?: string;
      type: "text";
      text: string;
      font: string;
      color: string;
      fontSizePct: number;
      fontWeight: number;
      align: "left" | "center" | "right";
      x: number;
      y: number;
      w: number;
      h: number;
      rotation: number;
      visible: boolean;
      locked: boolean;
      customerCan?: CustomerPermissions;
    }
  | {
      id: string;
      name?: string;
      type: "photo-slot";
      productShape: ProductShape;
      x: number;
      y: number;
      w: number;
      h: number;
      rotation: number;
      visible: boolean;
      locked: boolean;
      customerCan?: CustomerPermissions;
    };

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  productName: string;
  initialLayers?: DesignLayer[];
  onSave: (
    layers: DesignLayer[],
    templatePngUrl: string,
    photoSlots: { id: string; x: number; y: number; width: number; height: number; shape: "rect" | "circle" | "rounded"; rotation: number; productShape?: ProductShape }[]
  ) => Promise<void>;
}

const FONTS = [
  { id: "inter", label: "Inter", family: "Inter, sans-serif" },
  { id: "playfair", label: "Playfair", family: "Playfair Display, serif" },
  { id: "dancing", label: "Dancing Script", family: "Dancing Script, cursive" },
  { id: "roboto", label: "Roboto", family: "Roboto, sans-serif" },
  { id: "georgia", label: "Georgia", family: "Georgia, serif" },
  { id: "courier", label: "Courier", family: "Courier New, monospace" },
];

const SHAPES_OPTIONS: ProductShape[] = [
  "portrait", "landscape", "square", "circle",
  "balloon", "bean", "egg", "squircle",
  "extra-rounded-portrait", "extra-rounded-landscape",
  "square-round", "hexa", "butterfly", "dome", "heart", "flower",
  "bean-portrait", "bean-landscape",
  "egg-portrait", "egg-landscape",
];

const CANVAS_PRESETS: { id: string; label: string; w: number; h: number }[] = [
  { id: "square", label: "Square 1000×1000", w: 1000, h: 1000 },
  { id: "portrait34", label: "Portrait 1500×2000 (3:4)", w: 1500, h: 2000 },
  { id: "portrait45", label: "Portrait 1600×2000 (4:5)", w: 1600, h: 2000 },
  { id: "landscape43", label: "Landscape 2000×1500 (4:3)", w: 2000, h: 1500 },
  { id: "landscape169", label: "Landscape 1920×1080 (16:9)", w: 1920, h: 1080 },
  { id: "a4p", label: "A4 Portrait 2480×3508", w: 2480, h: 3508 },
  { id: "a4l", label: "A4 Landscape 3508×2480", w: 3508, h: 2480 },
  { id: "ig-story", label: "IG Story 1080×1920", w: 1080, h: 1920 },
  { id: "8x10", label: "Print 8×10in @300dpi", w: 2400, h: 3000 },
  { id: "12x18", label: "Print 12×18in @300dpi", w: 3600, h: 5400 },
];

const uid = () => `l-${Math.random().toString(36).slice(2, 10)}`;

const toLegacyShape = (s: ProductShape): "rect" | "circle" | "rounded" => {
  if (s === "circle") return "circle";
  if (
    s === "portrait" ||
    s === "landscape" ||
    s === "square" ||
    s === "collage" ||
    s === "dual-border"
  )
    return "rect";
  return "rounded";
};

// ---------- Component ----------

const CustomizableDesignEditor = ({
  open,
  onOpenChange,
  productName,
  initialLayers,
  onSave,
}: Props) => {
  const [layers, setLayersState] = useState<DesignLayer[]>(initialLayers ?? []);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [psdLoading, setPsdLoading] = useState(false);
  const [canvasW, setCanvasW] = useState<number>(1000);
  const [canvasH, setCanvasH] = useState<number>(1000);
  const [canvasWInput, setCanvasWInput] = useState<string>("1000");
  const [canvasHInput, setCanvasHInput] = useState<string>("1000");
  const canvasRatio = `${canvasW} / ${canvasH}`;

  // Keep input strings in sync when canvas size changes via preset/Custom selection
  useEffect(() => { setCanvasWInput(String(canvasW)); }, [canvasW]);
  useEffect(() => { setCanvasHInput(String(canvasH)); }, [canvasH]);
  const [editToolsOpen, setEditToolsOpen] = useState(false);

  // ---- Undo / Redo history ----
  const historyRef = useRef<DesignLayer[][]>([]);
  const futureRef = useRef<DesignLayer[][]>([]);
  const skipHistoryRef = useRef(false);
  const lastSnapshotRef = useRef<string>("");

  const pushHistory = useCallback((snapshot: DesignLayer[]) => {
    const key = JSON.stringify(snapshot);
    if (key === lastSnapshotRef.current) return;
    lastSnapshotRef.current = key;
    historyRef.current.push(JSON.parse(JSON.stringify(snapshot)));
    if (historyRef.current.length > 50) historyRef.current.shift();
    futureRef.current = []; // new action invalidates redo
  }, []);

  const setLayers = useCallback(
    (updater: DesignLayer[] | ((prev: DesignLayer[]) => DesignLayer[])) => {
      setLayersState((prev) => {
        const next = typeof updater === "function" ? (updater as any)(prev) : updater;
        if (!skipHistoryRef.current) pushHistory(prev);
        return next;
      });
    },
    [pushHistory]
  );

  const undo = useCallback(() => {
    setLayersState((prev) => {
      const prevState = historyRef.current.pop();
      if (!prevState) return prev;
      futureRef.current.push(JSON.parse(JSON.stringify(prev)));
      lastSnapshotRef.current = JSON.stringify(prevState);
      return prevState;
    });
  }, []);

  const redo = useCallback(() => {
    setLayersState((prev) => {
      const nextState = futureRef.current.pop();
      if (!nextState) return prev;
      historyRef.current.push(JSON.parse(JSON.stringify(prev)));
      lastSnapshotRef.current = JSON.stringify(nextState);
      return nextState;
    });
  }, []);

  // ---- Snap guides (during drag) ----
  const [guides, setGuides] = useState<{ v: number[]; h: number[] }>({ v: [], h: [] });

  // ---- Zoom & Pan ----
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [spaceDown, setSpaceDown] = useState(false);
  const panRef = useRef<{ startX: number; startY: number; originX: number; originY: number } | null>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const psdInputRef = useRef<HTMLInputElement>(null);
  const dragRef = useRef<{
    mode: "move" | "resize-se" | "rotate";
    id: string;
    startNX: number;
    startNY: number;
    orig: DesignLayer;
  } | null>(null);

  useEffect(() => {
    if (open) {
      skipHistoryRef.current = true;
      setLayersState(initialLayers ?? []);
      setSelectedId(initialLayers?.[0]?.id ?? null);
      historyRef.current = [];
      futureRef.current = [];
      lastSnapshotRef.current = JSON.stringify(initialLayers ?? []);
      // Re-enable history capture next tick
      setTimeout(() => { skipHistoryRef.current = false; }, 0);
    }
  }, [open, initialLayers]);

  // Keyboard shortcuts: Ctrl+Z / Ctrl+Shift+Z (or Cmd on Mac)
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) {
        return;
      }
      const meta = e.ctrlKey || e.metaKey;
      if (meta && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      } else if (meta && e.key.toLowerCase() === "y") {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, undo, redo]);

  // Reset zoom/pan when dialog opens
  useEffect(() => {
    if (open) {
      setZoom(1);
      setPan({ x: 0, y: 0 });
    }
  }, [open]);

  // Space key tracking for pan mode
  useEffect(() => {
    if (!open) return;
    const onDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) return;
      if (e.code === "Space") {
        e.preventDefault();
        setSpaceDown(true);
      }
    };
    const onUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        setSpaceDown(false);
        panRef.current = null;
      }
    };
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
    };
  }, [open]);

  // Ctrl+wheel zoom on viewport
  useEffect(() => {
    if (!open) return;
    const el = viewportRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const delta = -e.deltaY * 0.0015;
      setZoom((prevZoom) => {
        const nextZoom = Math.max(0.2, Math.min(5, prevZoom * (1 + delta)));
        const scale = nextZoom / prevZoom;
        setPan((prevPan) => ({
          x: mx - (mx - prevPan.x) * scale,
          y: my - (my - prevPan.y) * scale,
        }));
        return nextZoom;
      });
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [open]);

  const onViewportPointerDown = (e: React.PointerEvent) => {
    if (!spaceDown && e.button !== 1) return;
    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    panRef.current = { startX: e.clientX, startY: e.clientY, originX: pan.x, originY: pan.y };
  };
  const onViewportPointerMove = (e: React.PointerEvent) => {
    const p = panRef.current;
    if (!p) return;
    setPan({ x: p.originX + (e.clientX - p.startX), y: p.originY + (e.clientY - p.startY) });
  };
  const onViewportPointerUp = (e: React.PointerEvent) => {
    if (panRef.current) {
      try { (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId); } catch {}
      panRef.current = null;
    }
  };

  const resetView = () => { setZoom(1); setPan({ x: 0, y: 0 }); };
  const zoomIn = () => setZoom((z) => Math.min(5, z * 1.2));
  const zoomOut = () => setZoom((z) => Math.max(0.2, z / 1.2));

  const selected = useMemo(
    () => layers.find((l) => l.id === selectedId) ?? null,
    [layers, selectedId]
  );

  const update = (id: string, patch: Partial<DesignLayer>) =>
    setLayers((prev) =>
      prev.map((l) => (l.id === id ? ({ ...l, ...patch } as DesignLayer) : l))
    );

  // ---------- Pointer drag (move + resize) with snap-to-guides ----------
  const SNAP_PX = 6; // snap tolerance in pixels

  const onPointerDown = (
    e: React.PointerEvent,
    id: string,
    mode: "move" | "resize-se"
  ) => {
    e.stopPropagation();
    const layer = layers.find((l) => l.id === id);
    if (!layer || layer.locked || !canvasRef.current) return;
    setSelectedId(id);
    const rect = canvasRef.current.getBoundingClientRect();
    // Snapshot history at drag start (single undo step per drag)
    pushHistory(layers);
    skipHistoryRef.current = true;
    dragRef.current = {
      mode,
      id,
      startNX: (e.clientX - rect.left) / rect.width,
      startNY: (e.clientY - rect.top) / rect.height,
      orig: { ...layer },
    };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const computeSnap = (
    targetEdges: { v: number[]; h: number[] },
    others: { v: number[]; h: number[] },
    rectW: number,
    rectH: number
  ) => {
    const tolX = SNAP_PX / rectW;
    const tolY = SNAP_PX / rectH;
    let snapDX = 0;
    let snapDY = 0;
    const activeV: number[] = [];
    const activeH: number[] = [];
    let bestX = tolX;
    let bestY = tolY;
    for (const tv of targetEdges.v) {
      for (const ov of others.v) {
        const d = ov - tv;
        if (Math.abs(d) <= bestX) {
          bestX = Math.abs(d);
          snapDX = d;
        }
      }
    }
    for (const th of targetEdges.h) {
      for (const oh of others.h) {
        const d = oh - th;
        if (Math.abs(d) <= bestY) {
          bestY = Math.abs(d);
          snapDY = d;
        }
      }
    }
    for (const tv of targetEdges.v) {
      const adj = tv + snapDX;
      for (const ov of others.v) if (Math.abs(ov - adj) < 0.001) activeV.push(ov);
    }
    for (const th of targetEdges.h) {
      const adj = th + snapDY;
      for (const oh of others.h) if (Math.abs(oh - adj) < 0.001) activeH.push(oh);
    }
    return { snapDX, snapDY, activeV: Array.from(new Set(activeV)), activeH: Array.from(new Set(activeH)) };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const drag = dragRef.current;
    if (!drag || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width;
    const ny = (e.clientY - rect.top) / rect.height;
    const dx = nx - drag.startNX;
    const dy = ny - drag.startNY;
    const o = drag.orig as any;
    const clamp = (v: number, lo = 0, hi = 1) =>
      Math.max(lo, Math.min(hi, v));

    // Snap targets: canvas edges + center, plus other layers' edges/centers
    const others = { v: [0, 0.5, 1] as number[], h: [0, 0.5, 1] as number[] };
    for (const l of layers) {
      if (l.id === drag.id || !l.visible) continue;
      others.v.push(l.x, l.x + l.w / 2, l.x + l.w);
      others.h.push(l.y, l.y + l.h / 2, l.y + l.h);
    }

    if (drag.mode === "move") {
      let nextX = clamp(o.x + dx, 0, 1 - o.w);
      let nextY = clamp(o.y + dy, 0, 1 - o.h);
      const targetEdges = {
        v: [nextX, nextX + o.w / 2, nextX + o.w],
        h: [nextY, nextY + o.h / 2, nextY + o.h],
      };
      const { snapDX, snapDY, activeV, activeH } = computeSnap(targetEdges, others, rect.width, rect.height);
      nextX = clamp(nextX + snapDX, 0, 1 - o.w);
      nextY = clamp(nextY + snapDY, 0, 1 - o.h);
      setGuides({ v: activeV, h: activeH });
      update(drag.id, { x: nextX, y: nextY } as any);
    } else if (drag.mode === "resize-se") {
      let nextW = clamp(o.w + dx, 0.03, 1 - o.x);
      let nextH = clamp(o.h + dy, 0.03, 1 - o.y);
      const targetEdges = {
        v: [o.x + nextW],
        h: [o.y + nextH],
      };
      const { snapDX, snapDY, activeV, activeH } = computeSnap(targetEdges, others, rect.width, rect.height);
      nextW = clamp(nextW + snapDX, 0.03, 1 - o.x);
      nextH = clamp(nextH + snapDY, 0.03, 1 - o.y);
      setGuides({ v: activeV, h: activeH });
      update(drag.id, { w: nextW, h: nextH } as any);
    }
  };

  const onPointerUp = () => {
    if (dragRef.current) {
      dragRef.current = null;
      skipHistoryRef.current = false;
      setGuides({ v: [], h: [] });
    }
  };

  // ---------- Add layers ----------

  const addText = () => {
    const id = uid();
    const layer: DesignLayer = {
      id,
      name: "Text",
      type: "text",
      text: "Your Text",
      font: FONTS[0].family,
      color: "#1d1d1f",
      fontSizePct: 6,
      fontWeight: 700,
      align: "center",
      x: 0.25,
      y: 0.45,
      w: 0.5,
      h: 0.1,
      rotation: 0,
      visible: true,
      locked: false,
    };
    setLayers((p) => [...p, layer]);
    setSelectedId(id);
  };

  const addPhotoSlot = () => {
    const id = uid();
    const layer: DesignLayer = {
      id,
      name: "Customer Photo",
      type: "photo-slot",
      productShape: "portrait",
      x: 0.25,
      y: 0.2,
      w: 0.5,
      h: 0.55,
      rotation: 0,
      visible: true,
      locked: false,
    };
    setLayers((p) => [...p, layer]);
    setSelectedId(id);
  };

  const handleImageUploadClick = () => fileInputRef.current?.click();
  const handlePsdUploadClick = () => psdInputRef.current?.click();

  const uploadOneImage = async (file: File): Promise<string> => {
    const ext = file.name.split(".").pop() || "png";
    const path = `design-layers/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await supabase.storage
      .from("product-images")
      .upload(path, file, { upsert: false });
    if (error) throw error;
    const { data } = supabase.storage.from("product-images").getPublicUrl(path);
    return data.publicUrl;
  };

  const uploadDataUrl = async (dataUrl: string, name: string): Promise<string> => {
    const blob = await (await fetch(dataUrl)).blob();
    const path = `design-layers/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${name}.png`;
    const { error } = await supabase.storage
      .from("product-images")
      .upload(path, blob, { contentType: "image/png", upsert: false });
    if (error) throw error;
    const { data } = supabase.storage.from("product-images").getPublicUrl(path);
    return data.publicUrl;
  };

  // Multiple image upload
  const handleImageFiles = async (files: FileList) => {
    const valid = Array.from(files).filter((f) => f.type.startsWith("image/") && f.size <= 8 * 1024 * 1024);
    if (valid.length === 0) {
      toast({ title: "Invalid files", description: "Select images under 8MB.", variant: "destructive" });
      return;
    }
    setUploading(true);
    try {
      const urls = await Promise.all(valid.map(uploadOneImage));
      const newLayers: DesignLayer[] = urls.map((url, i) => ({
        id: uid(),
        name: valid[i].name,
        type: "image",
        src: url,
        x: 0.05 + i * 0.02,
        y: 0.05 + i * 0.02,
        w: 0.9,
        h: 0.9,
        rotation: 0,
        opacity: 1,
        flipH: false,
        flipV: false,
        visible: true,
        locked: false,
      }));
      setLayers((p) => [...p, ...newLayers]);
      setSelectedId(newLayers[newLayers.length - 1].id);
      toast({ title: `${urls.length} layer(s) added`, description: "PNG layers uploaded." });
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message ?? String(err), variant: "destructive" });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // PSD import — flatten each top-level layer to its own image layer
  const handlePsdFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith(".psd")) {
      toast({ title: "Not a PSD", description: "Please select a .psd file.", variant: "destructive" });
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      toast({ title: "Too large", description: "PSD must be under 50MB.", variant: "destructive" });
      return;
    }
    setPsdLoading(true);
    setProgress(5);
    try {
      const buffer = await file.arrayBuffer();
      const psd = readPsd(buffer);
      const psdW = psd.width || 1000;
      const psdH = psd.height || 1000;

      // Update canvas size to match PSD
      setCanvasW(psdW);
      setCanvasH(psdH);

      // Collect leaf layers (only those with a canvas)
      const leafLayers: { name: string; canvas: HTMLCanvasElement; left: number; top: number; right: number; bottom: number }[] = [];
      const walk = (nodes: any[] | undefined) => {
        if (!nodes) return;
        for (const n of nodes) {
          if (n.children) {
            walk(n.children);
          } else if (n.canvas && (n.canvas.width > 0) && (n.canvas.height > 0)) {
            leafLayers.push({
              name: n.name || "Layer",
              canvas: n.canvas as HTMLCanvasElement,
              left: n.left ?? 0,
              top: n.top ?? 0,
              right: n.right ?? psdW,
              bottom: n.bottom ?? psdH,
            });
          }
        }
      };
      walk(psd.children);

      if (leafLayers.length === 0) {
        toast({ title: "No layers", description: "Couldn't extract any layers from PSD.", variant: "destructive" });
        return;
      }

      const newLayers: DesignLayer[] = [];
      let i = 0;
      for (const ll of leafLayers) {
        const dataUrl = ll.canvas.toDataURL("image/png");
        const url = await uploadDataUrl(dataUrl, ll.name.replace(/[^a-z0-9]/gi, "_").slice(0, 20));
        const x = ll.left / psdW;
        const y = ll.top / psdH;
        const w = (ll.right - ll.left) / psdW;
        const h = (ll.bottom - ll.top) / psdH;
        newLayers.push({
          id: uid(),
          name: ll.name,
          type: "image",
          src: url,
          x: Math.max(0, Math.min(0.99, x)),
          y: Math.max(0, Math.min(0.99, y)),
          w: Math.max(0.02, Math.min(1, w)),
          h: Math.max(0.02, Math.min(1, h)),
          rotation: 0,
          opacity: 1,
          flipH: false,
          flipV: false,
          visible: true,
          locked: false,
        });
        i++;
        setProgress(Math.round((i / leafLayers.length) * 90) + 5);
      }
      // PSD layers come bottom-first usually; preserve as-is
      setLayers((p) => [...p, ...newLayers]);
      setSelectedId(newLayers[newLayers.length - 1].id);
      toast({ title: "PSD imported", description: `${newLayers.length} layer(s) added. Canvas resized to PSD dimensions.` });
    } catch (err: any) {
      console.error(err);
      toast({ title: "PSD import failed", description: err.message ?? String(err), variant: "destructive" });
    } finally {
      setPsdLoading(false);
      setProgress(0);
      if (psdInputRef.current) psdInputRef.current.value = "";
    }
  };

  // ---------- Layer ops ----------

  const removeLayer = (id: string) => {
    setLayers((p) => p.filter((l) => l.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const moveUp = (id: string) =>
    setLayers((p) => {
      const i = p.findIndex((l) => l.id === id);
      if (i < 0 || i === p.length - 1) return p;
      const next = [...p];
      [next[i], next[i + 1]] = [next[i + 1], next[i]];
      return next;
    });

  const moveDown = (id: string) =>
    setLayers((p) => {
      const i = p.findIndex((l) => l.id === id);
      if (i <= 0) return p;
      const next = [...p];
      [next[i], next[i - 1]] = [next[i - 1], next[i]];
      return next;
    });

  const duplicateLayer = (id: string) => {
    const orig = layers.find((l) => l.id === id);
    if (!orig) return;
    const copy: DesignLayer = {
      ...orig,
      id: uid(),
      name: (orig.name || orig.type) + " copy",
      x: Math.min(0.95, orig.x + 0.03),
      y: Math.min(0.95, orig.y + 0.03),
    } as DesignLayer;
    setLayers((p) => [...p, copy]);
    setSelectedId(copy.id);
  };

  const centerLayer = (id: string, axis: "x" | "y" | "both") => {
    const l = layers.find((x) => x.id === id);
    if (!l) return;
    const patch: any = {};
    if (axis === "x" || axis === "both") patch.x = (1 - l.w) / 2;
    if (axis === "y" || axis === "both") patch.y = (1 - l.h) / 2;
    update(id, patch);
  };

  // Convert any layer type → photo-slot (mark as customer upload area)
  const markAsPhotoSlot = (id: string) => {
    const l = layers.find((x) => x.id === id);
    if (!l) return;
    if (l.type === "photo-slot") {
      toast({ title: "Already a photo slot", description: "This layer is already marked." });
      return;
    }
    const newLayer: DesignLayer = {
      id: l.id,
      name: l.name || "Customer Photo",
      type: "photo-slot",
      productShape: "portrait",
      x: l.x,
      y: l.y,
      w: l.w,
      h: l.h,
      rotation: l.rotation,
      visible: true,
      locked: false,
    };
    setLayers((p) => p.map((x) => (x.id === id ? newLayer : x)));
    toast({ title: "Marked as Photo Slot", description: "Customer will upload their photo here." });
  };

  // ---------- Save ----------

  const handleSave = async () => {
    if (layers.length === 0) {
      toast({ title: "Empty design", description: "Add at least one layer or photo slot.", variant: "destructive" });
      return;
    }
    const slots = layers.filter((l) => l.type === "photo-slot");
    if (slots.length === 0) {
      toast({
        title: "Add a photo slot",
        description: "Mark at least one layer as Photo Slot so customers can upload their photo.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    setProgress(5);

    try {
      const node = canvasRef.current;
      if (!node) throw new Error("Canvas not ready");
      node.classList.add("capturing-template");
      await new Promise((r) => requestAnimationFrame(() => r(null)));
      setProgress(20);

      const dataUrl = await toPng(node, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "transparent",
      });
      node.classList.remove("capturing-template");
      setProgress(60);

      const blob = await (await fetch(dataUrl)).blob();
      const path = `design-templates/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.png`;
      const { error: upErr } = await supabase.storage
        .from("product-images")
        .upload(path, blob, { contentType: "image/png", upsert: false });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from("product-images").getPublicUrl(path);
      setProgress(85);

      const photoSlotsPayload = slots.map((s, i) => {
        const slot = s as Extract<DesignLayer, { type: "photo-slot" }>;
        return {
          id: `slot-${i + 1}`,
          x: slot.x,
          y: slot.y,
          width: slot.w,
          height: slot.h,
          shape: toLegacyShape(slot.productShape),
          rotation: slot.rotation,
          productShape: slot.productShape,
        };
      });

      await onSave(layers, pub.publicUrl, photoSlotsPayload);
      setProgress(100);
      toast({ title: "Design saved", description: "Customer can now customize this product." });
      onOpenChange(false);
    } catch (err: any) {
      console.error(err);
      const node = canvasRef.current;
      if (node) node.classList.remove("capturing-template");
      toast({ title: "Save failed", description: err.message ?? String(err), variant: "destructive" });
    } finally {
      setSaving(false);
      setProgress(0);
    }
  };

  // ---------- Layer render ----------

  const renderLayer = (l: DesignLayer) => {
    if (!l.visible) return null;
    const isSel = selectedId === l.id;
    const baseStyle: React.CSSProperties = {
      position: "absolute",
      left: `${l.x * 100}%`,
      top: `${l.y * 100}%`,
      width: `${l.w * 100}%`,
      height: `${l.h * 100}%`,
      transform: l.rotation ? `rotate(${l.rotation}deg)` : undefined,
      transformOrigin: "center",
      cursor: l.locked ? "not-allowed" : "move",
      touchAction: "none",
    };

    return (
      <div
        key={l.id}
        data-layer-id={l.id}
        data-layer-type={l.type}
        onPointerDown={(e) => onPointerDown(e, l.id, "move")}
        style={baseStyle}
        className={
          isSel
            ? "outline outline-2 outline-coral outline-offset-1 editor-chrome"
            : "outline outline-1 outline-transparent hover:outline-coral/40 editor-chrome"
        }
      >
        {l.type === "image" && (
          <img
            src={l.src}
            alt=""
            draggable={false}
            className="w-full h-full object-contain pointer-events-none"
            style={{
              opacity: l.opacity,
              transform: `${l.flipH ? "scaleX(-1) " : ""}${l.flipV ? "scaleY(-1)" : ""}`.trim() || undefined,
            }}
          />
        )}
        {l.type === "text" && (
          <div
            className="w-full h-full flex items-center pointer-events-none"
            style={{
              justifyContent:
                l.align === "left" ? "flex-start" : l.align === "right" ? "flex-end" : "center",
              fontFamily: l.font,
              color: l.color,
              fontWeight: l.fontWeight,
              fontSize: `${l.fontSizePct}cqh`,
              textAlign: l.align,
              lineHeight: 1.1,
              containerType: "size",
            }}
          >
            <span>{l.text || " "}</span>
          </div>
        )}
        {l.type === "photo-slot" && (
          <div
            data-photo-slot
            className="w-full h-full bg-coral/15 border-2 border-dashed border-coral flex flex-col items-center justify-center pointer-events-none editor-only"
            style={{
              borderRadius:
                l.productShape === "circle"
                  ? "50%"
                  : l.productShape.includes("squircle") || l.productShape.includes("rounded")
                  ? "16%"
                  : "0",
            }}
          >
            <Camera className="w-5 h-5 text-coral mb-1" />
            <span className="text-[10px] font-bold uppercase text-coral">Customer Photo</span>
            <span className="text-[9px] text-coral/80">{shapeLabel[l.productShape]}</span>
          </div>
        )}

        {/* Resize handle */}
        {isSel && !l.locked && (
          <div
            onPointerDown={(e) => onPointerDown(e, l.id, "resize-se")}
            className="absolute -bottom-1.5 -right-1.5 w-3.5 h-3.5 bg-coral border-2 border-white rounded-sm cursor-nwse-resize editor-chrome"
            style={{ touchAction: "none" }}
          />
        )}
      </div>
    );
  };

  const layerIcon = (l: DesignLayer) => {
    if (l.type === "image") return "🖼️";
    if (l.type === "text") return "📝";
    return "📷";
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Design Editor — {productName}</DialogTitle>
          </DialogHeader>

          <div className="grid lg:grid-cols-[1fr_360px] gap-4">
            {/* === Canvas === */}
            <div className="space-y-3">
              {/* Toolbar */}
              <div className="flex flex-wrap gap-2 p-2 border rounded-lg bg-muted/30">
                <Button onClick={handleImageUploadClick} size="sm" variant="outline" disabled={uploading}>
                  {uploading ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <ImagePlus className="w-4 h-4 mr-1" />}
                  Upload PNG(s)
                </Button>
                <Button onClick={handlePsdUploadClick} size="sm" variant="outline" disabled={psdLoading}>
                  {psdLoading ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <FileImage className="w-4 h-4 mr-1" />}
                  Import PSD
                </Button>
                <Button onClick={addText} size="sm" variant="outline">
                  <Type className="w-4 h-4 mr-1" /> Add Text
                </Button>
                <Button onClick={addPhotoSlot} size="sm" variant="outline">
                  <Camera className="w-4 h-4 mr-1" /> Add Photo Slot
                </Button>
                <div className="w-px h-6 bg-border mx-1" />
                <Button
                  onClick={undo}
                  size="sm"
                  variant="outline"
                  disabled={historyRef.current.length === 0}
                  title="Undo (Ctrl+Z)"
                >
                  <Undo2 className="w-4 h-4" />
                </Button>
                <Button
                  onClick={redo}
                  size="sm"
                  variant="outline"
                  disabled={futureRef.current.length === 0}
                  title="Redo (Ctrl+Shift+Z)"
                >
                  <Redo2 className="w-4 h-4" />
                </Button>

                <div className="ml-auto flex items-center gap-2">
                  <Maximize2 className="w-3.5 h-3.5 text-muted-foreground" />
                  <Select
                    value={CANVAS_PRESETS.find((p) => p.w === canvasW && p.h === canvasH) ? `${canvasW}x${canvasH}` : "custom"}
                    onValueChange={(v) => {
                      if (v === "custom") return;
                      const preset = CANVAS_PRESETS.find((p) => `${p.w}x${p.h}` === v);
                      if (preset) { setCanvasW(preset.w); setCanvasH(preset.h); }
                    }}
                  >
                    <SelectTrigger className="h-8 w-[220px] text-xs">
                      <SelectValue placeholder="Choose preset" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="custom">Custom (use W × H below)</SelectItem>
                      {CANVAS_PRESETS.map((p) => (
                        <SelectItem key={p.id} value={`${p.w}x${p.h}`}>{p.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    min={200}
                    max={6000}
                    step={50}
                    value={canvasWInput}
                    onChange={(e) => setCanvasWInput(e.target.value.replace(/[^0-9]/g, ""))}
                    onBlur={() => {
                      const n = Math.max(200, Math.min(6000, Number(canvasWInput) || 1000));
                      setCanvasW(n);
                      setCanvasWInput(String(n));
                    }}
                    onKeyDown={(e) => { if (e.key === "Enter") (e.currentTarget as HTMLInputElement).blur(); }}
                    className="h-8 w-[90px] text-xs"
                    title="Width (px) — type freely or use arrows"
                  />
                  <span className="text-xs text-muted-foreground">×</span>
                  <Input
                    type="number"
                    min={200}
                    max={6000}
                    step={50}
                    value={canvasHInput}
                    onChange={(e) => setCanvasHInput(e.target.value.replace(/[^0-9]/g, ""))}
                    onBlur={() => {
                      const n = Math.max(200, Math.min(6000, Number(canvasHInput) || 1000));
                      setCanvasH(n);
                      setCanvasHInput(String(n));
                    }}
                    onKeyDown={(e) => { if (e.key === "Enter") (e.currentTarget as HTMLInputElement).blur(); }}
                    className="h-8 w-[90px] text-xs"
                    title="Height (px) — type freely or use arrows"
                  />
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => e.target.files && e.target.files.length > 0 && handleImageFiles(e.target.files)}
                />
                <input
                  ref={psdInputRef}
                  type="file"
                  accept=".psd,image/vnd.adobe.photoshop"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handlePsdFile(e.target.files[0])}
                />
              </div>

              {/* Canvas viewport (zoom + pan) */}
              <div
                ref={viewportRef}
                className="relative w-full bg-muted/30 border border-border rounded-lg overflow-hidden"
                style={{
                  height: "min(70vh, 700px)",
                  cursor: panRef.current ? "grabbing" : spaceDown ? "grab" : "default",
                  touchAction: "none",
                }}
                onPointerDown={onViewportPointerDown}
                onPointerMove={onViewportPointerMove}
                onPointerUp={onViewportPointerUp}
                onPointerLeave={onViewportPointerUp}
              >
                {/* Zoom controls overlay */}
                <div className="absolute top-2 right-2 z-20 flex items-center gap-1 bg-background/90 backdrop-blur border rounded-md shadow-sm p-1 editor-only">
                  <Button type="button" size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={zoomOut} title="Zoom out">−</Button>
                  <button
                    type="button"
                    onClick={resetView}
                    className="text-xs font-mono px-2 min-w-[52px] text-center hover:bg-muted rounded"
                    title="Reset view (100%)"
                  >
                    {Math.round(zoom * 100)}%
                  </button>
                  <Button type="button" size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={zoomIn} title="Zoom in">+</Button>
                </div>

                {/* Transformed stage */}
                <div
                  className="absolute left-1/2 top-1/2"
                  style={{
                    transform: `translate(-50%, -50%) translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                    transformOrigin: "center center",
                    width: canvasW >= canvasH ? "min(85%, 800px)" : `calc(min(85%, 600px) * ${canvasW / canvasH})`,
                    aspectRatio: canvasRatio,
                  }}
                >
                  <div
                    ref={canvasRef}
                    className="relative w-full h-full bg-white border-2 border-border rounded-lg overflow-hidden select-none design-canvas shadow-lg"
                    style={{ pointerEvents: spaceDown ? "none" : "auto" }}
                    onPointerMove={onPointerMove}
                    onPointerUp={onPointerUp}
                    onPointerLeave={onPointerUp}
                    onClick={(e) => {
                      if (e.target === e.currentTarget) setSelectedId(null);
                    }}
                  >
                    {layers.map(renderLayer)}

                    {/* Snap-to guidelines (visible during drag) */}
                    {guides.v.map((v, i) => (
                      <div
                        key={`gv-${i}-${v}`}
                        className="absolute top-0 bottom-0 pointer-events-none editor-only"
                        style={{
                          left: `${v * 100}%`,
                          width: 1,
                          backgroundColor: "hsl(var(--coral, 16 100% 66%))",
                          boxShadow: "0 0 0 0.5px hsl(var(--coral, 16 100% 66%) / 0.4)",
                        }}
                      />
                    ))}
                    {guides.h.map((h, i) => (
                      <div
                        key={`gh-${i}-${h}`}
                        className="absolute left-0 right-0 pointer-events-none editor-only"
                        style={{
                          top: `${h * 100}%`,
                          height: 1,
                          backgroundColor: "hsl(var(--coral, 16 100% 66%))",
                          boxShadow: "0 0 0 0.5px hsl(var(--coral, 16 100% 66%) / 0.4)",
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                Canvas: <b>{canvasW} × {canvasH}px</b> · <b className="text-coral">Ctrl+Scroll</b> to zoom · <b className="text-coral">Space+Drag</b> (or middle-click) to pan · Click % to reset view.
              </p>
            </div>

            {/* === Side Panel === */}
            <div className="space-y-3">
              {/* Layers list */}
              <div className="border rounded-lg">
                <div className="px-3 py-2 border-b bg-muted/40 text-sm font-semibold flex items-center gap-2">
                  <LayersIcon className="w-4 h-4" />
                  Layers ({layers.length})
                </div>
                <div className="max-h-64 overflow-y-auto divide-y">
                  {layers.length === 0 && (
                    <div className="p-3 text-xs text-muted-foreground text-center">
                      No layers. Use toolbar to add or import a PSD.
                    </div>
                  )}
                  {[...layers].reverse().map((l) => (
                    <div
                      key={l.id}
                      onClick={() => setSelectedId(l.id)}
                      className={`flex items-center gap-1.5 px-2 py-1.5 text-xs cursor-pointer ${
                        selectedId === l.id ? "bg-coral/10" : "hover:bg-muted"
                      }`}
                    >
                      {/* Thumbnail */}
                      {l.type === "image" ? (
                        <img src={(l as any).src} alt="" className="w-7 h-7 object-contain rounded border bg-white shrink-0" />
                      ) : (
                        <div className="w-7 h-7 flex items-center justify-center rounded border bg-muted shrink-0 text-sm">
                          {layerIcon(l)}
                        </div>
                      )}
                      <span className="flex-1 truncate">
                        {l.name ||
                          (l.type === "text" ? `Text: ${(l as any).text?.slice(0, 14)}` :
                           l.type === "photo-slot" ? `Slot (${shapeLabel[(l as any).productShape]})` :
                           "Image")}
                      </span>
                      <button
                        onClick={(e) => { e.stopPropagation(); update(l.id, { visible: !l.visible } as any); }}
                        className="hover:text-coral" title={l.visible ? "Hide" : "Show"}
                      >
                        {l.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); update(l.id, { locked: !l.locked } as any); }}
                        className="hover:text-coral" title={l.locked ? "Unlock" : "Lock"}
                      >
                        {l.locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); moveUp(l.id); }} className="hover:text-coral" title="Bring forward">
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); moveDown(l.id); }} className="hover:text-coral" title="Send back">
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); duplicateLayer(l.id); }} className="hover:text-coral" title="Duplicate">
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); removeLayer(l.id); }} className="text-destructive hover:opacity-80" title="Delete">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Properties */}
              {selected && (
                <div className="border rounded-lg p-3 space-y-3 bg-card">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold capitalize">
                      {selected.type === "photo-slot" ? "Photo Slot" : selected.type} Properties
                    </div>
                    {selected.type !== "photo-slot" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-[11px] border-coral text-coral hover:bg-coral hover:text-white"
                        onClick={() => markAsPhotoSlot(selected.id)}
                        title="Convert this layer to a customer photo upload area"
                      >
                        <Camera className="w-3 h-3 mr-1" /> Mark as Customer Photo
                      </Button>
                    )}
                  </div>

                  {/* Layer name */}
                  <div>
                    <Label className="text-xs">Name</Label>
                    <Input
                      value={selected.name || ""}
                      onChange={(e) => update(selected.id, { name: e.target.value } as any)}
                      placeholder="Layer name"
                    />
                  </div>

                  {/* Quick align row */}
                  <div className="flex flex-wrap gap-1">
                    <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => centerLayer(selected.id, "x")}>
                      <AlignCenter className="w-3 h-3 mr-1" /> Center X
                    </Button>
                    <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => centerLayer(selected.id, "y")}>
                      <AlignCenter className="w-3 h-3 mr-1 rotate-90" /> Center Y
                    </Button>
                    <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => centerLayer(selected.id, "both")}>
                      Center
                    </Button>
                    {selected.type === "image" && (
                      <>
                        <Button size="sm" variant="outline" className="h-7 text-[11px]"
                          onClick={() => update(selected.id, { flipH: !(selected as any).flipH } as any)}>
                          <FlipHorizontal className="w-3 h-3 mr-1" /> Flip H
                        </Button>
                        <Button size="sm" variant="outline" className="h-7 text-[11px]"
                          onClick={() => update(selected.id, { flipV: !(selected as any).flipV } as any)}>
                          <FlipVertical className="w-3 h-3 mr-1" /> Flip V
                        </Button>
                      </>
                    )}
                  </div>

                  {selected.type === "text" && (
                    <>
                      <div>
                        <Label className="text-xs">Text</Label>
                        <Input
                          value={(selected as any).text}
                          onChange={(e) => update(selected.id, { text: e.target.value } as any)}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Font</Label>
                        <Select
                          value={(selected as any).font}
                          onValueChange={(v) => update(selected.id, { font: v } as any)}
                        >
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {FONTS.map((f) => (
                              <SelectItem key={f.id} value={f.family} style={{ fontFamily: f.family }}>
                                {f.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs">Color</Label>
                        <ColorPickerPro
                          value={(selected as any).color}
                          onChange={(c) => update(selected.id, { color: c } as any)}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Weight</Label>
                        <Select
                          value={String((selected as any).fontWeight)}
                          onValueChange={(v) => update(selected.id, { fontWeight: Number(v) } as any)}
                        >
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="400">Regular</SelectItem>
                            <SelectItem value="500">Medium</SelectItem>
                            <SelectItem value="700">Bold</SelectItem>
                            <SelectItem value="900">Black</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs">Size: {(selected as any).fontSizePct}%</Label>
                        <input
                          type="range"
                          min={2}
                          max={30}
                          step={0.5}
                          value={(selected as any).fontSizePct}
                          onChange={(e) =>
                            update(selected.id, { fontSizePct: Number(e.target.value) } as any)
                          }
                          className="w-full"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Align</Label>
                        <Select
                          value={(selected as any).align}
                          onValueChange={(v) => update(selected.id, { align: v } as any)}
                        >
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="left">Left</SelectItem>
                            <SelectItem value="center">Center</SelectItem>
                            <SelectItem value="right">Right</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}

                  {selected.type === "image" && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full h-8 text-xs border-coral text-coral hover:bg-coral hover:text-white"
                        onClick={() => setEditToolsOpen(true)}
                      >
                        <Sparkles className="w-3.5 h-3.5 mr-1" />
                        Edit Photo · Eraser · Magic · BG Remove
                      </Button>
                      <div>
                        <Label className="text-xs">Opacity: {Math.round((selected as any).opacity * 100)}%</Label>
                        <input
                          type="range"
                          min={0}
                          max={1}
                          step={0.05}
                          value={(selected as any).opacity}
                          onChange={(e) => update(selected.id, { opacity: Number(e.target.value) } as any)}
                          className="w-full"
                        />
                      </div>
                    </>
                  )}

                  {selected.type === "photo-slot" && (
                    <div>
                      <Label className="text-xs">Shape</Label>
                      <Select
                        value={(selected as any).productShape}
                        onValueChange={(v) => update(selected.id, { productShape: v as ProductShape } as any)}
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent className="max-h-72">
                          {SHAPES_OPTIONS.map((s) => (
                            <SelectItem key={s} value={s}>{shapeLabel[s]}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Common: rotation */}
                  <div>
                    <Label className="text-xs">Rotation: {selected.rotation}°</Label>
                    <input
                      type="range"
                      min={-180}
                      max={180}
                      step={1}
                      value={selected.rotation}
                      onChange={(e) =>
                        update(selected.id, { rotation: Number(e.target.value) } as any)
                      }
                      className="w-full"
                    />
                  </div>

                  {/* Position grid */}
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <Label className="text-[10px] text-muted-foreground">X: {((selected as any).x * 100).toFixed(0)}%</Label>
                      <input type="range" min={0} max={1} step={0.005}
                        value={(selected as any).x}
                        onChange={(e) => update(selected.id, { x: Math.min(Number(e.target.value), 1 - (selected as any).w) } as any)}
                        className="w-full" />
                    </div>
                    <div>
                      <Label className="text-[10px] text-muted-foreground">Y: {((selected as any).y * 100).toFixed(0)}%</Label>
                      <input type="range" min={0} max={1} step={0.005}
                        value={(selected as any).y}
                        onChange={(e) => update(selected.id, { y: Math.min(Number(e.target.value), 1 - (selected as any).h) } as any)}
                        className="w-full" />
                    </div>
                    <div>
                      <Label className="text-[10px] text-muted-foreground">W: {((selected as any).w * 100).toFixed(0)}%</Label>
                      <input type="range" min={0.03} max={1} step={0.005}
                        value={(selected as any).w}
                        onChange={(e) => update(selected.id, { w: Math.min(Number(e.target.value), 1 - (selected as any).x) } as any)}
                        className="w-full" />
                    </div>
                    <div>
                      <Label className="text-[10px] text-muted-foreground">H: {((selected as any).h * 100).toFixed(0)}%</Label>
                      <input type="range" min={0.03} max={1} step={0.005}
                        value={(selected as any).h}
                        onChange={(e) => update(selected.id, { h: Math.min(Number(e.target.value), 1 - (selected as any).y) } as any)}
                        className="w-full" />
                    </div>
                  </div>

                  {/* Customer Permissions */}
                  <div className="border-t pt-3 mt-2">
                    <div className="flex items-center gap-2 mb-2">
                      <UserCog className="w-3.5 h-3.5 text-coral" />
                      <span className="text-xs font-semibold">Customer Access (at order time)</span>
                    </div>
                    <div className="space-y-1.5">
                      {selected.type === "image" && (
                        <label className="flex items-center justify-between text-[11px] gap-2">
                          <span>Replace this image</span>
                          <Switch
                            checked={!!(selected as any).customerCan?.replaceImage}
                            onCheckedChange={(v) =>
                              update(selected.id, {
                                customerCan: { ...((selected as any).customerCan ?? {}), replaceImage: v },
                              } as any)
                            }
                          />
                        </label>
                      )}
                      {selected.type === "text" && (
                        <>
                          <label className="flex items-center justify-between text-[11px] gap-2">
                            <span>Edit text content</span>
                            <Switch
                              checked={!!(selected as any).customerCan?.editText}
                              onCheckedChange={(v) =>
                                update(selected.id, {
                                  customerCan: { ...((selected as any).customerCan ?? {}), editText: v },
                                } as any)
                              }
                            />
                          </label>
                          <label className="flex items-center justify-between text-[11px] gap-2">
                            <span>Change text color</span>
                            <Switch
                              checked={!!(selected as any).customerCan?.changeColor}
                              onCheckedChange={(v) =>
                                update(selected.id, {
                                  customerCan: { ...((selected as any).customerCan ?? {}), changeColor: v },
                                } as any)
                              }
                            />
                          </label>
                        </>
                      )}
                      <label className="flex items-center justify-between text-[11px] gap-2">
                        <span>Move (reposition)</span>
                        <Switch
                          checked={!!(selected as any).customerCan?.move}
                          onCheckedChange={(v) =>
                            update(selected.id, {
                              customerCan: { ...((selected as any).customerCan ?? {}), move: v },
                            } as any)
                          }
                        />
                      </label>
                      <label className="flex items-center justify-between text-[11px] gap-2">
                        <span>Resize / scale</span>
                        <Switch
                          checked={!!(selected as any).customerCan?.resize}
                          onCheckedChange={(v) =>
                            update(selected.id, {
                              customerCan: { ...((selected as any).customerCan ?? {}), resize: v },
                            } as any)
                          }
                        />
                      </label>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-2">
                      If all toggles are off, this layer is fixed in the customer's view.
                    </p>
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 bg-coral hover:bg-coral-dark text-white"
                >
                  {saving ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}
                  Save Design
                </Button>
              </div>
            </div>
          </div>

          {/* Progress overlay */}
          {(saving || psdLoading) && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50 rounded-lg">
              <div className="bg-card rounded-lg p-6 max-w-sm w-full shadow-2xl mx-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-display text-lg font-bold">{psdLoading ? "Importing PSD" : "Saving Design"}</h3>
                  <span className="text-sm font-bold text-coral">{progress}%</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden mb-3">
                  <div className="h-full bg-coral transition-all duration-200" style={{ width: `${progress}%` }} />
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{psdLoading ? "Extracting PSD layers and uploading…" : "Exporting template at high resolution…"}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Image Edit Tools (Eraser, Magic Eraser, BG Remove) */}
      {selected?.type === "image" && (
        <ImageEditTools
          open={editToolsOpen}
          onOpenChange={setEditToolsOpen}
          src={(selected as any).src}
          onApply={async (newDataUrl) => {
            try {
              setUploading(true);
              const url = await uploadDataUrl(newDataUrl, "edited");
              update(selected.id, { src: url } as any);
              toast({ title: "Layer updated", description: "Edited image applied to layer." });
            } catch (e: any) {
              toast({ title: "Couldn't save edit", description: e.message ?? String(e), variant: "destructive" });
            } finally {
              setUploading(false);
            }
          }}
        />
      )}
    </>
  );
};

export default CustomizableDesignEditor;
