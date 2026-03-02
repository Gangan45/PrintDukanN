import { Facebook, Instagram, Twitter, Youtube, MapPin, Phone, Mail } from "lucide-react";
import printdukanLogo from "@/assets/printdukan-logo.png";
const footerLinks = {
  categories: [{
    name: "Acrylic Products",
    href: "/category/acrylic"
  }, {
    name: "Name Plates",
    href: "/category/name-plates"
  }, {
    name: "QR Standees",
    href: "/category/qr-standee"
  }, {
    name: "Trophies & Momentos",
    href: "/category/trophies"
  }, {
    name: "Corporate Gifts",
    href: "/category/corporate-gifts"
  }, {
    name: "T-Shirts",
    href: "/category/t-shirts"
  }],
  quickLinks: [{
    name: "About Us",
    href: "/about-us"
  }, {
    name: "Contact Us",
    href: "/contact-us"
  },{
    name: "Bulk Orders",
    href: "https://wa.me/918518851767?text=Hi%2C%20I%20am%20interested%20in%20bulk%20orders",
    external: true
  }],
  policies: [{
    name: "Privacy Policy",
    href: "/privacy-policy"
  }, {
    name: "Terms & Conditions",
    href: "/terms-conditions"
  }, {
    name: "Refund Policy",
    href: "/refund-policy"
  }, {
    name: "Shipping Policy",
    href: "/shipping-policy"
  }]
};
const socialLinks = [{
  icon: Facebook,
  href: "#",
  label: "Facebook"
}, {
  icon: Instagram,
  href: "https://www.instagram.com/printdukan_official?igsh=YXpvdjBzcXA4Ymdk",
  label: "Instagram"
}, {
  icon: Twitter,
  href: "#",
  label: "Twitter"
}, {
  icon: Youtube,
  href: "#",
  label: "YouTube"
}];
export const Footer = () => {
  return <footer className="bg-navy text-primary-foreground">
    {/* Main Footer */}
    <div className="container mx-auto px-3 sm:px-4 py-10 sm:py-16">
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-5 gap-6 sm:gap-10">
        {/* Brand Column */}
        <div className="col-span-2 lg:col-span-2">
          <div className="mb-4 sm:mb-6">
            <img
              src={printdukanLogo}
              alt="PrintDukan - We Print Your Business"
              className="h-12 sm:h-16 w-auto brightness-0 invert"
            />
          </div>
          <p className="text-primary-foreground/70 mb-4 sm:mb-6 max-w-sm text-sm sm:text-base">
            Your one-stop destination for premium custom printing and personalization.
            Transform your ideas into beautiful products.
          </p>

          {/* Contact Info */}
          <div className="space-y-2 sm:space-y-3">
            <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
              <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
              <span className="text-primary-foreground/80">Second floor building number 207, near police station, Amla Betul, Madhya Pradesh 460551</span>
            </div>
            
            <a href="tel:+918518851767" className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm hover:text-primary transition-colors">
              <Phone className="h-3 w-3 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
              <span className="text-primary-foreground/80 hover:text-primary">+91 8518851767</span>
            </a>
            <a href="mailto:help@printdukan.in" className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm hover:text-primary transition-colors">
              <Mail className="h-3 w-3 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
              <span className="text-primary-foreground/80 hover:text-primary">help@printdukan.in</span>
            </a>

          </div>

          {/* Social Links */}
          <div className="flex gap-2 sm:gap-3 mt-4 sm:mt-6">
            {socialLinks.map(social => <a key={social.label} href={social.href} aria-label={social.label} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-primary transition-colors duration-300">
              <social.icon className="h-4 w-4 sm:h-5 sm:w-5" />
            </a>)}
          </div>
        </div>

        {/* Categories */}
        <div>
          <h4 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4">Categories</h4>
          <ul className="space-y-1.5 sm:space-y-2.5">
            {footerLinks.categories.map(link => <li key={link.name}>
              <a href={link.href} className="text-xs sm:text-sm text-primary-foreground/70 hover:text-primary transition-colors">
                {link.name}
              </a>
            </li>)}
          </ul>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4">Quick Links</h4>
          <ul className="space-y-1.5 sm:space-y-2.5">
            {footerLinks.quickLinks.map(link => <li key={link.name}>
              <a 
                href={link.href} 
                target={(link as any).external ? "_blank" : undefined}
                rel={(link as any).external ? "noopener noreferrer" : undefined}
                className="text-xs sm:text-sm text-primary-foreground/70 hover:text-primary transition-colors"
              >
                {link.name}
              </a>
            </li>)}
          </ul>
        </div>

        {/* Policies */}
        <div>
          <h4 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4">Policies</h4>
          <ul className="space-y-1.5 sm:space-y-2.5">
            {footerLinks.policies.map(link => <li key={link.name}>
              <a href={link.href} className="text-xs sm:text-sm text-primary-foreground/70 hover:text-primary transition-colors">
                {link.name}
              </a>
            </li>)}
          </ul>
        </div>
      </div>
    </div>

    {/* Bottom Bar */}
    <div className="border-t border-primary-foreground/10">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 text-xs sm:text-sm text-primary-foreground/60">
          <p>© 2025 PrintDukan. All rights reserved.</p>
          <div className="flex items-center gap-3 sm:gap-4">
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/200px-Visa_Inc._logo.svg.png" alt="Visa" className="h-4 sm:h-6 brightness-0 invert opacity-60" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Mastercard_2019_logo.svg/200px-Mastercard_2019_logo.svg.png" alt="Mastercard" className="h-4 sm:h-6 opacity-60" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/UPI-Logo-vector.svg/200px-UPI-Logo-vector.svg.png" alt="UPI" className="h-4 sm:h-6 brightness-0 invert opacity-60" />
          </div>
        </div>
      </div>
    </div>
  </footer>;
};