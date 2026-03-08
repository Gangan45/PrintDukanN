const brands = [
  "Trusted by 500+ Brands",
  "★",
  "ISO Certified",
  "★",
  "Premium Quality",
  "★",
  "Fast Delivery",
  "★",
  "Expert Support",
  "★",
  "Bulk Orders Welcome",
  "★",
];

export const BrandsMarquee = () => {
  return (
    <section className="py-6 bg-primary overflow-hidden">
      <div className="animate-marquee flex whitespace-nowrap">
        {[...brands, ...brands, ...brands].map((item, index) => (
          <span
            key={index}
            className="mx-8 text-sm font-semibold text-primary-foreground uppercase tracking-wider"
          >
            {item}
          </span>
        ))}
      </div>
    </section>
  );
};
