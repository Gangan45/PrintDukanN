import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Helmet } from "react-helmet-async";
import { Users, Award, Heart, Target, Truck, Shield, Clock, Star } from "lucide-react";

export default function AboutUs() {
  const teamMembers = [
    {
      name: "Rahul Sharma",
      role: "Founder & CEO",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face",
      description: "10+ years in printing industry"
    },
    {
      name: "Priya Patel",
      role: "Creative Director",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop&crop=face",
      description: "Expert in custom designs"
    },
    {
      name: "Amit Kumar",
      role: "Operations Head",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face",
      description: "Ensuring quality delivery"
    },
    {
      name: "Sneha Gupta",
      role: "Customer Success",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop&crop=face",
      description: "Your satisfaction, our priority"
    }
  ];

  const stats = [
    { number: "50,000+", label: "Happy Customers" },
    { number: "1,00,000+", label: "Products Delivered" },
    { number: "500+", label: "Corporate Clients" },
    { number: "4.8★", label: "Average Rating" }
  ];

  const values = [
    {
      icon: Award,
      title: "Quality First",
      description: "Premium materials and finest printing techniques for every product"
    },
    {
      icon: Heart,
      title: "Customer Love",
      description: "Your satisfaction is our top priority, always"
    },
    {
      icon: Target,
      title: "Innovation",
      description: "Constantly evolving with latest design trends and technology"
    },
    {
      icon: Truck,
      title: "Fast Delivery",
      description: "Quick turnaround with pan-India shipping"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>About Us - PrintDukan | Your Trusted Printing Partner</title>
        <meta name="description" content="Learn about PrintDukan - India's leading custom printing company. Quality products, fast delivery, and exceptional customer service since 2018." />
      </Helmet>
      
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-primary/10 via-primary/5 to-background py-16 sm:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-3xl sm:text-5xl font-display font-bold text-foreground mb-6">
                About <span className="text-primary">PrintDukan</span>
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
                India's most trusted destination for customized printing solutions. We bring your ideas to life with premium quality products and exceptional service.
              </p>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold mb-2">{stat.number}</div>
                  <div className="text-sm sm:text-base opacity-90">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Our Story */}
        <section className="py-16 sm:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground mb-4">Our Story</h2>
                <div className="w-20 h-1 bg-primary mx-auto"></div>
              </div>
              
              <div className="prose prose-lg max-w-none text-muted-foreground space-y-6">
                <p>
                  Founded in 2018, <strong className="text-foreground">PrintDukan</strong> started with a simple mission: to make high-quality custom printing accessible to everyone in India. What began as a small operation has now grown into one of the country's most trusted printing platforms.
                </p>
                <p>
                  We specialize in a wide range of products including acrylic photo frames, name plates, QR standees, corporate gifts, custom t-shirts, trophies, and much more. Every product is crafted with attention to detail and a commitment to excellence.
                </p>
                <p>
                  Our state-of-the-art printing facility, combined with skilled artisans and modern technology, ensures that every order meets the highest standards of quality. We take pride in transforming your memories and ideas into beautiful, tangible products.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Our Values */}
        <section className="py-16 sm:py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground mb-4">Our Values</h2>
              <div className="w-20 h-1 bg-primary mx-auto"></div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, index) => (
                <div key={index} className="bg-background rounded-xl p-6 text-center shadow-sm border border-border hover:shadow-md transition-shadow">
                  <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <value.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{value.title}</h3>
                  <p className="text-sm text-muted-foreground">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="py-16 sm:py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground mb-4">Why Choose PrintDukan?</h2>
              <div className="w-20 h-1 bg-primary mx-auto"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">100% Quality Guarantee</h3>
                  <p className="text-sm text-muted-foreground">Every product is quality checked before shipping. Not satisfied? Get a full refund.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Quick Turnaround</h3>
                  <p className="text-sm text-muted-foreground">Most orders are dispatched within 3-5 business days with express shipping options.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Star className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">5-Star Support</h3>
                  <p className="text-sm text-muted-foreground">Our friendly support team is available to help you with any queries or customizations.</p>
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
