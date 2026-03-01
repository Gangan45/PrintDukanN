import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  MessageCircle, 
  Send,
  Loader2,
  Instagram,
  Facebook,
  Youtube
} from "lucide-react";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100, "Name must be less than 100 characters"),
  email: z.string().trim().email("Please enter a valid email address").max(255, "Email must be less than 255 characters"),
  phone: z.string().trim().regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit mobile number"),
  subject: z.string().trim().min(5, "Subject must be at least 5 characters").max(200, "Subject must be less than 200 characters"),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(1000, "Message must be less than 1000 characters")
});

export default function ContactUs() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate form data
    const result = contactSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach(err => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast.success("Message sent successfully! We'll get back to you soon.");
    setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
    setIsSubmitting(false);
  };

  const handleWhatsApp = () => {
    const message = encodeURIComponent("Hi! I have a query about PrintDukan products.");
    window.open(`https://wa.me/918518851767?text=${message}`, "_blank");
  };

  const contactInfo = [
    {
      icon: MapPin,
      title: "Visit Us",
      details: ["Second floor building number 207 near police station", "Amla Betul, Madhya Pradesh 460551"]
    },
    {
      icon: Phone,
      title: "Call Us",
      details: ["+91 85188 51767", "Mon-Sat: 10AM - 7PM"]
    },
    {
      icon: Mail,
      title: "Email Us",
      details: ["help@printdukan.in"]
    },
    {
      icon: Clock,
      title: "Business Hours",
      details: ["Monday - Saturday", "10:00 AM - 7:00 PM", "Sunday: Closed"]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Contact Us - PrintDukan | Get in Touch</title>
        <meta name="description" content="Contact PrintDukan for queries about custom printing, orders, or bulk inquiries. Call us, email us, or fill out the contact form. We're here to help!" />
      </Helmet>
      
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-primary/10 via-primary/5 to-background py-16 sm:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-3xl sm:text-5xl font-display font-bold text-foreground mb-6">
                Get in <span className="text-primary">Touch</span>
              </h1>
              <p className="text-lg text-muted-foreground">
                Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
              </p>
            </div>
          </div>
        </section>

        {/* Contact Info Cards */}
        <section className="py-12 -mt-8">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
              {contactInfo.map((info, index) => (
                <div key={index} className="bg-background rounded-xl p-4 sm:p-6 text-center shadow-md border border-border">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <info.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2 text-sm sm:text-base">{info.title}</h3>
                  {info.details.map((detail, i) => (
                    <p key={i} className="text-xs sm:text-sm text-muted-foreground">{detail}</p>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Form & Map */}
        <section className="py-12 sm:py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
              {/* Contact Form */}
              <div className="bg-background rounded-2xl p-6 sm:p-8 shadow-lg border border-border">
                <h2 className="text-xl sm:text-2xl font-display font-bold text-foreground mb-6">Send us a Message</h2>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Your name"
                        className={errors.name ? "border-destructive" : ""}
                      />
                      {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="your@email.com"
                        className={errors.email ? "border-destructive" : ""}
                      />
                      {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="10-digit mobile number"
                        maxLength={10}
                        className={errors.phone ? "border-destructive" : ""}
                      />
                      {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject *</Label>
                      <Input
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        placeholder="How can we help?"
                        className={errors.subject ? "border-destructive" : ""}
                      />
                      {errors.subject && <p className="text-xs text-destructive">{errors.subject}</p>}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Tell us more about your inquiry..."
                      rows={5}
                      className={errors.message ? "border-destructive" : ""}
                    />
                    {errors.message && <p className="text-xs text-destructive">{errors.message}</p>}
                  </div>
                  
                  <Button type="submit" className="w-full h-12" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>

                {/* WhatsApp CTA */}
                <div className="mt-6 pt-6 border-t border-border">
                  <p className="text-sm text-muted-foreground text-center mb-3">Or get instant support via WhatsApp</p>
                  <Button 
                    variant="outline" 
                    className="w-full h-11 bg-green-500 hover:bg-green-600 text-white border-green-500 hover:border-green-600"
                    onClick={handleWhatsApp}
                  >
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Chat on WhatsApp
                  </Button>
                </div>
              </div>

              {/* Map & Social */}
              <div className="space-y-6">
                {/* Map */}
                <div className="bg-muted rounded-2xl overflow-hidden h-[300px] sm:h-[350px] border border-border">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14721.899461726086!2d78.11879095!3d21.9271!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bd7b8c0b5555555%3A0x1234567890abcdef!2sAmla%2C%20Madhya%20Pradesh%20460551!5e0!3m2!1sen!2sin!4v1703000000000!5m2!1sen!2sin"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="PrintDukan Location - Amla, Betul, Madhya Pradesh"
                  />
                </div>

                {/* Social Media */}
                <div className="bg-background rounded-2xl p-6 shadow-lg border border-border">
                  <h3 className="font-semibold text-foreground mb-4">Follow Us</h3>
                  <p className="text-sm text-muted-foreground mb-4">Stay connected for latest designs, offers, and updates</p>
                  <div className="flex gap-3">
                    <a 
                      href="https://www.instagram.com/printdukan_official" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-12 h-12 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 rounded-xl flex items-center justify-center text-white hover:scale-105 transition-transform"
                    >
                      <Instagram className="w-6 h-6" />
                    </a>
                    <a 
                      href="https://facebook.com/printdukan" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white hover:scale-105 transition-transform"
                    >
                      <Facebook className="w-6 h-6" />
                    </a>
                    <a 
                      href="https://youtube.com/@printdukan" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center text-white hover:scale-105 transition-transform"
                    >
                      <Youtube className="w-6 h-6" />
                    </a>
                  </div>
                </div>

                {/* FAQ Teaser */}
                <div className="bg-primary/5 rounded-2xl p-6 border border-primary/20">
                  <h3 className="font-semibold text-foreground mb-2">Have Questions?</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Check our frequently asked questions for quick answers about ordering, shipping, and customization.
                  </p>
                  <Button variant="outline" className="w-full">
                    View FAQs (Coming Soon)
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
