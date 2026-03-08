import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const productInfo = [
  {
    title: "Product Details",
    content: `
      <ul class="space-y-2 text-muted-foreground">
        <li>• Premium Quality Acrylic Material</li>
        <li>• UV Printed with High Resolution</li>
        <li>• Scratch Resistant Surface</li>
        <li>• Sturdy Base for Stability</li>
        <li>• Customizable with Your QR Code & Logo</li>
        <li>• Perfect for Restaurants, Cafes, Offices</li>
      </ul>
    `,
  },
  {
    title: "Size & Dimensions",
    content: `
      <div class="space-y-2 text-muted-foreground">
        <p><strong>Standard Size:</strong> 4" x 4" (10cm x 10cm)</p>
        <p><strong>Height with Stand:</strong> 5 inches</p>
        <p><strong>Material Thickness:</strong> 5mm Acrylic</p>
        <p><strong>Weight:</strong> ~150 grams</p>
      </div>
    `,
  },
  {
    title: "Customization Options",
    content: `
      <ul class="space-y-2 text-muted-foreground">
        <li>• Add Your Business Logo</li>
        <li>• Custom QR Code (Menu, Payment, Website)</li>
        <li>• Choose Background Color</li>
        <li>• Add Contact Information</li>
        <li>• Custom Text & Messaging</li>
      </ul>
    `,
  },
  {
    title: "Shipping Information",
    content: `
      <div class="space-y-2 text-muted-foreground">
        <p><strong>Processing Time:</strong> 2-3 Business Days</p>
        <p><strong>Delivery:</strong> 5-7 Business Days</p>
        <p><strong>Free Shipping:</strong> On Orders Above ₹999</p>
        <p>Secure packaging to prevent damage during transit.</p>
      </div>
    `,
  },
];

const ProductInfo = () => {
  return (
    <div className="mt-8 border-t border-border pt-8">
      <Accordion type="single" collapsible className="w-full">
        {productInfo.map((item, index) => (
          <AccordionItem key={index} value={`item-${index}`}>
            <AccordionTrigger className="text-foreground font-medium hover:text-primary">
              {item.title}
            </AccordionTrigger>
            <AccordionContent>
              <div dangerouslySetInnerHTML={{ __html: item.content }} />
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default ProductInfo;
