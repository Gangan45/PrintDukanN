import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Helmet } from "react-helmet-async";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Privacy Policy | PrintDukan</title>
        <meta name="description" content="Privacy Policy for PrintDukan - Learn how we collect, use, and protect your personal information." />
      </Helmet>
      <AnnouncementBar />
      <Header />
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-8">Privacy Policy</h1>
        
        <div className="prose prose-lg max-w-none text-muted-foreground space-y-6">
          <p>
            This privacy policy sets out how PrintDukan uses and protects any information that you give PrintDukan when you use this website.
          </p>
          
          <p>
            PrintDukan is committed to ensuring that your privacy is protected. Should we ask you to provide certain information by which you can be identified when using this website, then you can be assured that it will only be used in accordance with this privacy statement.
          </p>
          
          <p>
            Online transactions are electronically encrypted to ensure that your financial data is safe and secure; you may use your credit card online with confidence. In addition, your address, phone number, and financial data will be used only by PrintDukan and will never be sold or revealed to anyone else.
          </p>
          
          <p>
            PrintDukan is committed to maintaining your confidence and trust, and accordingly maintains the following privacy policy to protect personal information you provide online:
          </p>
          
          <p>
            It is our policy that personal information, such as your name, address, email address, telephone number, and financial information is private and confidential.
          </p>
          
          <p>
            Your personal information will be used only by PrintDukan and will never be sold or revealed to outside sources.
          </p>

          <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">What We Collect</h2>
          <p><strong>We may collect the following information:</strong></p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Name and date of birth</li>
            <li>Contact information including email address</li>
            <li>Demographic information such as postcode, preferences and interests</li>
            <li>Other information relevant to customer surveys and/or offers</li>
          </ul>

          <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">What We Do With The Information We Gather</h2>
          <p>
            We require this information to understand your needs and provide you with a better service, and in particular for the following reasons:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Internal record keeping.</li>
            <li>We may use the information to improve our products and services.</li>
            <li>We may periodically send promotional emails about new products, special offers or other information which we think you may find interesting using the email address which you have provided.</li>
            <li>From time to time, we may also use your information to contact you for market research purposes. We may contact you by email, phone, fax or mail. We may use the information to customize the website according to your interests.</li>
          </ul>
          
          <p>
            If you believe that any information we are holding on you is incorrect or incomplete, please write to or email us as soon as possible. We will promptly correct any information found to be incorrect.
          </p>

          <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">Contact Us</h2>
          <p>
            If there are any questions regarding this privacy policy you may contact us using the information below:
          </p>
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

export default PrivacyPolicy;
