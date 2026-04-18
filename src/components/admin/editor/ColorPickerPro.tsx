import { useState } from "react";
import { HexColorPicker, HexColorInput } from "react-colorful";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const SWATCHES = [
  "#000000", "#1d1d1f", "#3f3f46", "#71717a", "#a1a1aa", "#d4d4d8", "#ffffff",
  "#ef4444", "#f97316", "#f59e0b", "#eab308", "#84cc16", "#22c55e", "#10b981",
  "#06b6d4", "#0ea5e9", "#3b82f6", "#6366f1", "#8b5cf6", "#a855f7", "#d946ef",
  "#ec4899", "#f43f5e", "#dc2626", "#7c2d12", "#65a30d", "#0f766e", "#1e40af",
  "#581c87", "#831843", "#fbbf24", "#fde68a", "#fef3c7", "#fff7ed", "#fef2f2",
];

interface Props {
  value: string;
  onChange: (v: string) => void;
  className?: string;
}

const ColorPickerPro = ({ value, onChange, className }: Props) => {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "h-9 w-full rounded-md border-2 border-border flex items-center gap-2 px-2 hover:border-coral transition-colors",
            className
          )}
        >
          <span
            className="w-6 h-6 rounded border border-border shrink-0"
            style={{ background: value }}
          />
          <span className="text-xs font-mono uppercase">{value}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" side="left" align="start">
        <HexColorPicker color={value} onChange={onChange} style={{ width: "100%" }} />
        <div className="mt-3">
          <HexColorInput
            color={value}
            onChange={onChange}
            prefixed
            className="w-full h-8 px-2 text-xs font-mono uppercase border rounded bg-background"
          />
        </div>
        <div className="mt-3 grid grid-cols-7 gap-1">
          {SWATCHES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => onChange(c)}
              className={cn(
                "w-7 h-7 rounded border-2 hover:scale-110 transition-transform",
                value.toLowerCase() === c.toLowerCase() ? "border-coral" : "border-border"
              )}
              style={{ background: c }}
              title={c}
            />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ColorPickerPro;
