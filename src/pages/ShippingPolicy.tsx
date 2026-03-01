import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Helmet } from "react-helmet-async";
import { Truck, Clock, Package, MapPin } from "lucide-react";

const ShippingPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Shipping Policy | PrintDukan</title>
        <meta name="description" content="Shipping Policy for PrintDukan - Learn about our delivery timelines, shipping charges, and delivery process." />
      </Helmet>
      <AnnouncementBar />
      <Header />
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-8">Shipping Policy</h1>
        
        <div className="prose prose-lg max-w-none text-muted-foreground space-y-6">
          <p>
            PrintDukan is committed to delivering your order within the fastest time frame, while ensuring maximum quality packaging. Online Paid orders are shipped the next working day and are mostly delivered within 3-6 working days from the date of dispatch.
          </p>
          
          <p>
            We ship throughout the week, except Sunday & Public holidays during the normal working hours. To ensure that your order reaches you in good condition, in the shortest span of time, we ship through reputed courier agencies such as Bluedart, Delhivery, and DTDC.
          </p>

          {/* Quick Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-8">
            <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg flex items-start gap-3">
              <Truck className="h-6 w-6 text-primary mt-1" />
              <div>
                <h3 className="font-semibold text-foreground">Free Shipping</h3>
                <p className="text-sm">On all prepaid orders across India</p>
              </div>
            </div>
            <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg flex items-start gap-3">
              <Clock className="h-6 w-6 text-primary mt-1" />
              <div>
                <h3 className="font-semibold text-foreground">Express Delivery</h3>
                <p className="text-sm">3-6 working days for major cities</p>
              </div>
            </div>
            <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg flex items-start gap-3">
              <Package className="h-6 w-6 text-primary mt-1" />
              <div>
                <h3 className="font-semibold text-foreground">Quality Packaging</h3>
                <p className="text-sm">Premium packaging for safe delivery</p>
              </div>
            </div>
            <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg flex items-start gap-3">
              <MapPin className="h-6 w-6 text-primary mt-1" />
              <div>
                <h3 className="font-semibold text-foreground">Pan India Delivery</h3>
                <p className="text-sm">We deliver to 20,000+ pin codes</p>
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">How Is The Delivery Charge Calculated?</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>There is <strong>free shipping charge for all online paid orders</strong> within India.</li>
            <li>The shipping charge is fixed irrespective of the number of products in your cart.</li>
            <li>Our prices are exclusive of GST (Goods and Service tax). As per the Government of India, PrintDukan is fully GST compliant.</li>
            <li>Relevant GST % will be added to your product total at the checkout. Note that GST is only applicable for orders within India.</li>
          </ul>

          <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">How Long Does It Take For An Order To Arrive?</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-border">
              <thead>
                <tr className="bg-muted">
                  <th className="border border-border p-3 text-left text-foreground">Order Type</th>
                  <th className="border border-border p-3 text-left text-foreground">Processing Time</th>
                  <th className="border border-border p-3 text-left text-foreground">Delivery Time</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-border p-3">Standard Products</td>
                  <td className="border border-border p-3">1-2 working days</td>
                  <td className="border border-border p-3">3-6 working days</td>
                </tr>
                <tr className="bg-muted/50">
                  <td className="border border-border p-3">Customized Products</td>
                  <td className="border border-border p-3">2-4 working days</td>
                  <td className="border border-border p-3">5-8 working days</td>
                </tr>
                <tr>
                  <td className="border border-border p-3">Bulk Orders (10+ items)</td>
                  <td className="border border-border p-3">4-7 working days</td>
                  <td className="border border-border p-3">7-12 working days</td>
                </tr>
                <tr className="bg-muted/50">
                  <td className="border border-border p-3">Remote Areas</td>
                  <td className="border border-border p-3">1-2 working days</td>
                  <td className="border border-border p-3">7-10 working days</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">Order Tracking</h2>
          <p>
            Once your order is dispatched, you will receive a shipping confirmation email/SMS with tracking details. You can track your order using:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>The tracking link provided in the shipping notification</li>
            <li>Your account dashboard on our website</li>
            <li>Contacting our customer support with your order number</li>
          </ul>

          <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">Delivery Partners</h2>
          <p>
            We work with India's leading courier partners to ensure safe and timely delivery:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Bluedart</li>
            <li>Delhivery</li>
            <li>DTDC</li>
            <li>India Post (for remote areas)</li>
          </ul>

          <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">Important Notes</h2>
          <div className="bg-muted p-4 rounded-lg">
            <ul className="list-disc pl-6 space-y-2">
              <li>Delivery times mentioned are estimates and may vary based on location and courier availability.</li>
              <li>Public holidays and Sundays are not counted as working days.</li>
              <li>For areas with limited courier access, delivery may take additional time.</li>
              <li>Cash on Delivery (COD) is available for select locations with additional charges.</li>
              <li>Please ensure someone is available to receive the package at the delivery address.</li>
            </ul>
          </div>

          <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">Contact Us</h2>
          <p>
            For any shipping-related queries, please feel free to contact us:
          </p>
          <div className="bg-muted p-6 rounded-lg mt-4">
            <p><strong>Email:</strong> help@printdukan.in</p>
            <p><strong>Phone:</strong> +91 8518851767 (10 AM - 7 PM)</p>
            <p><strong>WhatsApp:</strong> +91 8518851767</p>
            <p className="mt-4"><strong>Office Address:</strong></p>
            <p>Second floor building number 207, near police station, Amla Betul, Madhya Pradesh 460551</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ShippingPolicy;
