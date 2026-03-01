import { cn } from "@/lib/utils";

interface TypeSelectorProps {
  types: { value: string; label: string }[];
  selectedType: string;
  onSelect: (type: string) => void;
}

const TypeSelector = ({ types, selectedType, onSelect }: TypeSelectorProps) => {
  return (
    <div className="space-y-3">
      <h4 className="font-semibold text-foreground">
        Type: <span className="text-primary uppercase">{selectedType}</span>
      </h4>
      <div className="flex flex-wrap gap-2">
        {types.map((type) => (
          <button
            key={type.value}
            onClick={() => onSelect(type.value)}
            className={cn(
              "px-4 py-2 rounded-md border text-sm font-medium transition-all",
              selectedType === type.value
                ? "bg-foreground text-background border-foreground"
                : "bg-background text-foreground border-border hover:border-foreground"
            )}
          >
            {type.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TypeSelector;
