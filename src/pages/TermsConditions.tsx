import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Helmet } from "react-helmet-async";

const TermsConditions = () => {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Terms & Conditions | PrintDukan</title>
        <meta name="description" content="Terms and Conditions for PrintDukan - Read our terms of service before using our website." />
      </Helmet>
      <AnnouncementBar />
      <Header />
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-8">Terms & Conditions</h1>
        
        <div className="prose prose-lg max-w-none text-muted-foreground space-y-6">
          <p>
            In using the PrintDukan shopping service, you (The Customer) are deemed to have accepted the terms and conditions listed below. PrintDukan reserves the right to add, delete, alter or modify these terms and conditions at any time. The Customer is therefore advised to read carefully these terms and conditions each time he or she uses the shopping service(s) of PrintDukan.
          </p>
          
          <p>
            By placing an order the client is authorizing the company to pass on the order to the respective merchant / vendor / self and make sure the product is delivered to the given address. While rendering the service, the company is acting only as an authorized representative of the client and not as his agent or in any other capacity.
          </p>
          
          <p>
            The company shall be handling the material only as a service provider and its liability shall be restricted to that of a bailee under the contract Act. Nothing contained herein shall create or be deemed to create or construe a relationship between the parties such that PrintDukan is regarded as a seller or purchaser of the Vendor / Merchant's products.
          </p>

          <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">1. General Terms</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>PrintDukan is an online personalized gift and printing store.</li>
            <li>All sales and purchases are transactions between the customer placing an order and PrintDukan.</li>
            <li>We reserve the right to refuse service to anyone for any reason at any time.</li>
            <li>You understand that your content may be transferred unencrypted and involve transmissions over various networks.</li>
          </ul>

          <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">2. Product Information</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>We have made every effort to display as accurately as possible the colors and images of our products.</li>
            <li>We cannot guarantee that your computer monitor's display of any color will be accurate.</li>
            <li>We reserve the right to limit the quantities of any products or services that we offer.</li>
            <li>All descriptions of products or product pricing are subject to change at anytime without notice.</li>
          </ul>

          <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">3. Customized Products</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>For customized products, the customer is responsible for providing accurate information and design files.</li>
            <li>Once a customized order is placed and confirmed, it cannot be cancelled or modified.</li>
            <li>PrintDukan is not responsible for errors in customer-provided content, including spelling, grammar, or image quality.</li>
            <li>Preview images are for reference only; actual colors may vary slightly from screen displays.</li>
          </ul>

          <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">4. Payment Terms</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>All prices are in Indian Rupees (INR) and are inclusive of applicable taxes unless otherwise stated.</li>
            <li>GST will be added to your order total at checkout as per Government of India regulations.</li>
            <li>We accept various payment methods including UPI, credit/debit cards, and net banking.</li>
            <li>Orders will only be processed after successful payment confirmation.</li>
          </ul>

          <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">5. Intellectual Property</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>All content on this website, including images, logos, and text, is the property of PrintDukan.</li>
            <li>Customers must not upload copyrighted material without proper authorization.</li>
            <li>PrintDukan reserves the right to reject any order containing potentially infringing content.</li>
          </ul>

          <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">6. Limitation of Liability</h2>
          <p>
            PrintDukan shall not be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the service.
          </p>

          <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">Contact Us</h2>
          <div className="bg-muted p-6 rounded-lg mt-4">
            <p><strong>Email:</strong> help@printdukan.in</p>
            <p><strong>Phone:</strong> +91 8518851767</p>
            <p><strong>WhatsApp:</strong> +91 8518851767</p>
            <p className="text-sm mt-2">We're available on the phone from 10 AM to 7 PM, Monday to Saturday.</p>
            <p className="mt-4"><strong>Office Address:</strong></p>
            <p>Second floor building number 207, near police station, Amla Betul, Madhya Pradesh 460551</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TermsConditions;
