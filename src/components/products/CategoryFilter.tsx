interface FilterOption {
  id: string;
  label: string;
  icon?: string;
}

interface CategoryFilterProps {
  title: string;
  filters: FilterOption[];
  activeFilter: string;
  onFilterChange: (filterId: string) => void;
}

export const CategoryFilter = ({
  title,
  filters,
  activeFilter,
  onFilterChange,
}: CategoryFilterProps) => {
  return (
    <section className="bg-muted/30 border-y border-border sticky top-0 z-40">
      <div className="container mx-auto px-4 py-3 sm:py-6">
        <h3 className="text-center text-sm sm:text-lg font-medium text-foreground mb-2 sm:mb-4">
          {title}
        </h3>
        <div className="flex flex-nowrap overflow-x-auto pb-2 sm:flex-wrap justify-start sm:justify-center gap-1.5 sm:gap-2 no-scrollbar -mx-2 px-2">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => onFilterChange(filter.id)}
              className={`
                whitespace-nowrap flex-shrink-0 flex items-center gap-1 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full border transition-all duration-200
                ${activeFilter === filter.id
                  ? "bg-primary text-primary-foreground border-primary shadow-md"
                  : "bg-background border-border hover:border-primary/50 hover:bg-muted"
                }
              `}
            >
              {filter.icon && <span className="text-xs sm:text-sm">{filter.icon}</span>}
              <span className="text-xs sm:text-sm font-medium">{filter.label}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
