import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Helmet } from "react-helmet-async";

const RefundPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Refund Policy | PrintDukan</title>
        <meta name="description" content="Refund Policy for PrintDukan - Learn about our cancellation, return, and refund policies." />
      </Helmet>
      <AnnouncementBar />
      <Header />
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-8">Refund Policy</h1>
        
        <div className="prose prose-lg max-w-none text-muted-foreground space-y-6">
          
          <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">How Do I Cancel An Order on PrintDukan?</h2>
          <p>
            If unfortunately, you have to cancel an order, please do so <strong>within 12 hours</strong> of placing the order. Simply email us at help@printdukan.in with your order number mentioned in the subject line.
          </p>
          <p>
            In case you would like to cancel the order after it is dispatched, it can't be cancelled.
          </p>
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-4 rounded-lg">
            <p className="text-amber-800 dark:text-amber-200 font-medium">
              Note: Personalized product orders cannot be cancelled / refunded once the order is placed.
            </p>
          </div>

          <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">Return Policy</h2>
          <p>
            Products are eligible for return if they are received in a damaged or defective condition. The same needs to be conveyed to our team <strong>within 12 Hours</strong> of receiving the package.
          </p>
          <p>
            We ensure that a brand new replacement is shipped to you by charging shipping cost extra. Please make sure that the original product tag and packing is intact when reverse pick up is made.
          </p>
          <p>
            If you think, you have received the product in a bad condition or if the packaging is tampered with or damaged before you open the packet, please refuse to accept the package and return the package to the delivery person & let us know as soon as possible.
          </p>
          
          <div className="bg-muted p-4 rounded-lg">
            <p className="font-medium text-foreground">Important Notes:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Return is not applicable for bulk or corporate orders.</li>
              <li>For damaged items during transit, reach out to us <strong>within 24 Hours</strong> from the date of delivery.</li>
            </ul>
          </div>

          <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">Refund Policy</h2>
          <p>
            The refund policy is applicable in case the replacement of a damaged product is not available.
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>For online paid orders, the <strong>refund will be made back to the same bank account within 5-7 working days</strong> used to pay for the order.</li>
            <li>Alternatively, refunds can also be done via <strong>UPI</strong>.</li>
            <li>Store credit may be offered as an alternative to refund in certain cases.</li>
          </ul>

          <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">Non-Refundable Items</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Customized/personalized products (unless defective)</li>
            <li>Products with customer-provided design or text errors</li>
            <li>Bulk orders and corporate orders</li>
            <li>Products damaged due to customer mishandling after delivery</li>
          </ul>

          <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">How to Request a Return/Refund</h2>
          <ol className="list-decimal pl-6 space-y-2">
            <li>Contact us within the specified time frame (12-24 hours)</li>
            <li>Provide your order number and clear photos of the damaged product</li>
            <li>Our team will review and respond within 24-48 hours</li>
            <li>If approved, follow the instructions for return pickup</li>
            <li>Refund will be processed within 5-7 working days after receiving the returned item</li>
          </ol>

          <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">Contact Us</h2>
          <p>
            In case of any queries regarding the product you wish to order, feel free to reach to us and we would be happy to share real-time product photos and videos via WhatsApp/email/other channels.
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

export default RefundPolicy;
