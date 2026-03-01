import { cn } from "@/lib/utils";

interface QuantitySelectorProps {
  quantities: { value: number; label: string; price: number }[];
  selectedQuantity: number;
  onSelect: (quantity: number) => void;
}

const QuantitySelector = ({ quantities, selectedQuantity, onSelect }: QuantitySelectorProps) => {
  return (
    <div className="space-y-3">
      <h4 className="font-semibold text-foreground">
        Quantity: <span className="text-primary">{selectedQuantity} Pieces</span>
      </h4>
      <div className="flex flex-wrap gap-2">
        {quantities.map((qty) => (
          <button
            key={qty.value}
            onClick={() => onSelect(qty.value)}
            className={cn(
              "px-4 py-2 rounded-md border text-sm font-medium transition-all",
              selectedQuantity === qty.value
                ? "bg-foreground text-background border-foreground"
                : "bg-background text-foreground border-border hover:border-foreground"
            )}
          >
            {qty.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuantitySelector;
