import { ReviewsAndSuggestions } from "@/components/product/ReviewsAndSuggestions";
import TrustBadges from "@/components/product/TrustBadges";
import WhyPrintdukan from "@/components/product/WhyPrintdukan";

interface ProductDetailsBlockProps {
  productId: string;
  category: string;
  description?: string | null;
}

/**
 * Shared block shown on every customize page below the editor:
 * - About this product (description)
 * - Trust badges
 * - Why Printdukan
 * - Reviews + Add review + Suggested products
 */
export const ProductDetailsBlock = ({
  productId,
  category,
  description,
}: ProductDetailsBlockProps) => {
  return (
    <div className="container py-6 space-y-10">
      {description && (
        <section className="bg-card border rounded-2xl p-5 sm:p-7">
          <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground mb-3">
            About this product
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground whitespace-pre-line leading-relaxed">
            {description}
          </p>
        </section>
      )}

      <TrustBadges />
      <WhyPrintdukan />

      <ReviewsAndSuggestions productId={productId} category={category} />
    </div>
  );
};

export default ProductDetailsBlock;
