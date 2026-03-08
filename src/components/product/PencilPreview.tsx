import React from "react";

interface PencilPreviewProps {
  name: string;
  color?: "green" | "yellow" | "red" | "blue";
  size?: "sm" | "md" | "lg";
}

const colorMap = {
  green: {
    body: "from-emerald-600 via-emerald-500 to-emerald-400",
    dark: "bg-emerald-800",
    stripe: "bg-emerald-700/40",
    tip: "from-amber-200 to-amber-100",
    lead: "bg-gray-700",
    eraser: "bg-pink-400",
    eraserBand: "bg-gray-400",
    shadow: "shadow-emerald-500/20",
  },
  yellow: {
    body: "from-yellow-500 via-yellow-400 to-yellow-300",
    dark: "bg-yellow-700",
    stripe: "bg-yellow-600/40",
    tip: "from-amber-200 to-amber-100",
    lead: "bg-gray-700",
    eraser: "bg-pink-400",
    eraserBand: "bg-gray-400",
    shadow: "shadow-yellow-500/20",
  },
  red: {
    body: "from-red-600 via-red-500 to-red-400",
    dark: "bg-red-800",
    stripe: "bg-red-700/40",
    tip: "from-amber-200 to-amber-100",
    lead: "bg-gray-700",
    eraser: "bg-pink-400",
    eraserBand: "bg-gray-400",
    shadow: "shadow-red-500/20",
  },
  blue: {
    body: "from-blue-600 via-blue-500 to-blue-400",
    dark: "bg-blue-800",
    stripe: "bg-blue-700/40",
    tip: "from-amber-200 to-amber-100",
    lead: "bg-gray-700",
    eraser: "bg-pink-400",
    eraserBand: "bg-gray-400",
    shadow: "shadow-blue-500/20",
  },
};

const sizeMap = {
  sm: { height: "h-8", text: "text-xs", width: "w-full max-w-[280px]" },
  md: { height: "h-10", text: "text-sm", width: "w-full max-w-[340px]" },
  lg: { height: "h-12", text: "text-base", width: "w-full max-w-[400px]" },
};

export const PencilPreview: React.FC<PencilPreviewProps> = ({ 
  name, 
  color = "green",
  size = "md"
}) => {
  const c = colorMap[color];
  const s = sizeMap[size];
  const displayName = name || "Your Name Here";

  return (
    <div className={`${s.width} mx-auto group`}>
      {/* Pencil container */}
      <div className={`relative flex items-center ${s.height} shadow-lg ${c.shadow} rounded-sm transition-transform duration-300 hover:scale-[1.02]`}>
        
        {/* Eraser */}
        <div className={`${c.eraser} ${s.height} w-4 rounded-l-md flex-shrink-0 relative`}>
          <div className={`absolute right-0 top-0 bottom-0 w-1 ${c.eraserBand}`} />
        </div>

        {/* Metal band */}
        <div className="bg-gradient-to-b from-gray-300 via-gray-400 to-gray-300 w-3 flex-shrink-0 h-full relative">
          <div className="absolute inset-0 flex flex-col justify-around py-0.5">
            <div className="h-px bg-gray-500/50" />
            <div className="h-px bg-gray-500/50" />
            <div className="h-px bg-gray-500/50" />
          </div>
        </div>

        {/* Pencil body */}
        <div className={`flex-1 bg-gradient-to-b ${c.body} h-full relative overflow-hidden flex items-center justify-center`}>
          {/* Wood texture lines */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-[20%] left-0 right-0 h-px bg-black/20" />
            <div className="absolute top-[50%] left-0 right-0 h-px bg-black/15" />
            <div className="absolute top-[80%] left-0 right-0 h-px bg-black/20" />
          </div>

          {/* Shine effect */}
          <div className="absolute top-0 left-0 right-0 h-[30%] bg-white/15 rounded-b-full" />

          {/* Name text */}
          <span 
            className={`relative z-10 text-white font-bold ${s.text} tracking-[0.15em] uppercase drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)] select-none truncate px-4`}
            style={{ 
              textShadow: "0 1px 3px rgba(0,0,0,0.3), 0 0 8px rgba(255,255,255,0.1)",
              fontFamily: "'Segoe UI', Arial, sans-serif",
            }}
          >
            {displayName}
          </span>

          {/* Bottom shadow on body */}
          <div className="absolute bottom-0 left-0 right-0 h-[25%] bg-black/10" />
        </div>

        {/* Pencil tip (wood part) */}
        <div className="relative flex-shrink-0 h-full w-8">
          <svg viewBox="0 0 32 40" className="h-full w-full" preserveAspectRatio="none">
            {/* Wood cone */}
            <polygon 
              points="0,0 24,16 24,24 0,40" 
              fill="url(#woodGrad)" 
            />
            {/* Lead tip */}
            <polygon 
              points="24,14 32,20 24,26" 
              fill="#374151" 
            />
            <defs>
              <linearGradient id="woodGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#d4a574" />
                <stop offset="60%" stopColor="#f0d4a8" />
                <stop offset="100%" stopColor="#e8c898" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* Shadow below pencil */}
      <div className="mx-6 h-2 bg-black/5 dark:bg-white/5 rounded-full blur-sm mt-1" />
    </div>
  );
};

/** Multiple pencil stack preview */
interface PencilStackPreviewProps {
  names: { name: string; packs: number }[];
}

export const PencilStackPreview: React.FC<PencilStackPreviewProps> = ({ names }) => {
  const colors: Array<"green" | "yellow" | "red" | "blue"> = ["green", "yellow", "red", "blue"];
  const displayNames = names.filter(n => n.name.trim()).slice(0, 4);
  
  if (displayNames.length === 0) {
    return (
      <div className="space-y-3 py-2">
        <PencilPreview name="" color="green" size="md" />
      </div>
    );
  }

  return (
    <div className="space-y-3 py-2">
      {displayNames.map((entry, i) => (
        <div 
          key={i} 
          className="animate-fade-in"
          style={{ animationDelay: `${i * 100}ms` }}
        >
          <PencilPreview 
            name={entry.name} 
            color={colors[i % colors.length]} 
            size="md" 
          />
        </div>
      ))}
      {names.filter(n => n.name.trim()).length > 4 && (
        <p className="text-xs text-center text-muted-foreground">
          +{names.filter(n => n.name.trim()).length - 4} more names
        </p>
      )}
    </div>
  );
};
