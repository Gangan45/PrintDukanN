import { cn } from "@/lib/utils";
import {
  LayoutGrid,
  RectangleVertical,
  RectangleHorizontal,
  Square,
  Images,
  Heart,
  Baby,
  Frame,
  Sparkles,
} from "lucide-react";

export interface AcrylicTag {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

// OMGS-style filter tags for Acrylic Wall Photo
export const ACRYLIC_TAGS: AcrylicTag[] = [
  { id: "all", label: "All", icon: LayoutGrid },
  { id: "portrait", label: "Portrait", icon: RectangleVertical },
  { id: "landscape", label: "Landscape", icon: RectangleHorizontal },
  { id: "square", label: "Square", icon: Square },
  { id: "collage", label: "Collage", icon: Images },
  { id: "couple", label: "Couple", icon: Heart },
  { id: "baby-birth", label: "Baby Birth", icon: Baby },
  { id: "dual-border", label: "Dual Border", icon: Frame },
  { id: "creative-wall", label: "Creative Wall", icon: Sparkles },
];

interface AcrylicFilterBarProps {
  activeTag: string;
  onTagChange: (tag: string) => void;
  title?: string;
  className?: string;
}

export const AcrylicFilterBar = ({
  activeTag,
  onTagChange,
  title = "Acrylic Wall Photo Filters:",
  className,
}: AcrylicFilterBarProps) => {
  return (
    <div className={cn("w-full", className)}>
      {title && (
        <h3 className="text-center text-sm md:text-base font-semibold text-foreground mb-4">
          {title}
        </h3>
      )}

      <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
        <div className="flex items-center gap-2 md:gap-3 min-w-max md:justify-center pb-2">
          {ACRYLIC_TAGS.map((tag) => {
            const Icon = tag.icon;
            const isActive = activeTag === tag.id;
            return (
              <button
                key={tag.id}
                onClick={() => onTagChange(tag.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-md border transition-all duration-200 whitespace-nowrap text-sm font-medium",
                  isActive
                    ? "bg-primary text-primary-foreground border-primary shadow-md"
                    : "bg-background text-foreground border-border hover:border-primary hover:text-primary"
                )}
              >
                <Icon className="w-4 h-4" />
                <span>{tag.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
