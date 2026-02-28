import { useState } from "react";
import { ShoppingCart, Menu, X, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Link } from "react-router-dom";
import { useCart } from "@/hooks/useCart";
import { useFavorites } from "@/hooks/useFavorites";
import printDukanLogo from "@/assets/printdukan-logo.png";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

// Acrylic subcategories for dropdown
const acrylicSubcategories = [
  { name: "All Acrylic Products", href: "/category/acrylic" },
  { name: "Premium Acrylic Wall Photo", href: "/category/acrylic/wall-photo" },
  { name: "Framed Acrylic Photo", href: "/category/acrylic/framed-photo" },
  { name: "Wall Clocks", href: "/category/wall-clocks" },
  { name: "Baby Frames", href: "/category/baby-frames" },
];

const navLinks = [
  { name: "Name Plates", href: "/category/name-plates" },
  { name: "QR Standee", href: "/category/qr-standee" },
  { name: "Trophies", href: "/category/trophies" },
  { name: "Wedding Card", href: "/category/wedding-card" },
  { name: "Corporate Gifts", href: "/category/corporate-gifts" },
  { name: "T-Shirts", href: "/category/t-shirts" },
  { name: "Name Pencils", href: "/category/name-pencils" },
];

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { cartCount } = useCart();
  const { favorites } = useFavorites();
  const wishlistCount = favorites.length;
  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md shadow-sm">
      <div className="container mx-auto px-3 sm:px-4">
        <div className="flex h-14 sm:h-16 items-center justify-between gap-2 sm:gap-4 lg:h-20">
          {/* Mobile Menu Button */}
          <button className="lg:hidden p-1.5 sm:p-2 -ml-1" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="h-5 w-5 sm:h-6 sm:w-6" /> : <Menu className="h-5 w-5 sm:h-6 sm:w-6" />}
          </button>

          {/* Logo */}
          <Link to="/" className="flex items-center flex-shrink-1">
            <img 
              src={printDukanLogo} 
              alt="PrintDukan - We Print Your Business" 
              className="h-10 sm:h-12 lg:h-16 w-auto object-contain transition-all duration-300 hover:scale-105"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {/* Acrylic Dropdown */}
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="px-4 py-2 text-sm font-medium text-foreground/80 hover:text-primary transition-colors rounded-lg hover:bg-primary/5 bg-transparent">
                    Acrylic
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[220px] gap-1 p-2">
                      {acrylicSubcategories.map((item) => (
                        <li key={item.name}>
                          <NavigationMenuLink asChild>
                            <Link
                              to={item.href}
                              className="block select-none rounded-md p-3 text-sm leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                            >
                              {item.name}
                            </Link>
                          </NavigationMenuLink>
                        </li>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>

            {navLinks.map(link => (
              <Link key={link.name} to={link.href} className="px-4 py-2 text-sm font-medium text-foreground/80 hover:text-primary transition-colors rounded-lg hover:bg-primary/5">
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Right Actions - WhatsApp Support & Cart */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* WhatsApp Support Button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <a 
                  href="https://wa.me/918518851767?text=Hi!%20I%20need%20help%20with%20my%20order." 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-1.5 sm:p-2 hover:bg-[#25D366]/10 rounded-full transition-colors relative group"
                  aria-label="Chat on WhatsApp"
                >
                  <svg 
                    viewBox="0 0 24 24" 
                    className="h-5 w-5 text-[#25D366] group-hover:scale-110 transition-transform fill-current"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </a>
              </TooltipTrigger>
              <TooltipContent>
                <p>Chat Support</p>
              </TooltipContent>
            </Tooltip>

            {/* Wishlist */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Link to="/wishlist" className="p-1.5 sm:p-2 hover:bg-muted rounded-full transition-colors relative group">
                  <Heart className="h-5 w-5 group-hover:text-red-500 transition-colors" />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 h-4 w-4 sm:h-5 sm:w-5 rounded-full bg-red-500 text-[9px] sm:text-[10px] font-bold text-white flex items-center justify-center">
                      {wishlistCount > 99 ? '99+' : wishlistCount}
                    </span>
                  )}
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <p>Wishlist</p>
              </TooltipContent>
            </Tooltip>

            {/* Cart */}
            <Link to="/cart" className="p-1.5 sm:p-2 hover:bg-muted rounded-full transition-colors relative">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-4 w-4 sm:h-5 sm:w-5 rounded-full bg-primary text-[9px] sm:text-[10px] font-bold text-primary-foreground flex items-center justify-center">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={cn("lg:hidden absolute left-0 right-0 top-full bg-card border-t border-border shadow-lg transition-all duration-300 max-h-[80vh] overflow-y-auto", isMenuOpen ? "opacity-100 visible" : "opacity-0 invisible")}>
        <nav className="container mx-auto px-4 py-4">
          {/* Acrylic with subcategories */}
          <div className="border-b border-border/50">
            <Link 
              to="/category/acrylic" 
              className="block py-3 text-sm font-semibold text-primary"
              onClick={() => setIsMenuOpen(false)}
            >
              Acrylic
            </Link>
            <div className="pl-4 pb-2">
              {acrylicSubcategories.slice(1).map(item => (
                <Link 
                  key={item.name} 
                  to={item.href} 
                  className="block py-2 text-sm text-foreground/70 hover:text-primary"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {navLinks.map(link => (
            <Link key={link.name} to={link.href} className="block py-3 text-sm font-medium text-foreground/80 hover:text-primary border-b border-border/50 last:border-0" onClick={() => setIsMenuOpen(false)}>
              {link.name}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
};
