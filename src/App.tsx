import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { FloatingWhatsApp } from "@/components/layout/FloatingWhatsApp";
import { AuthModalProvider } from "@/contexts/AuthModalContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

import Profile from "./pages/Profile";
import Wishlist from "./pages/Wishlist";
import Orders from "./pages/Orders";
import ProductDetail from "./pages/ProductDetail";
import AcrylicCategory from "./pages/AcrylicCategory";
import AcrylicSubcategory from "./pages/AcrylicSubcategory";
import TShirtCategory from "./pages/TShirtCategory";
import TrophiesCategory from "./pages/TrophiesCategory";
import CorporateGiftsCategory from "./pages/CorporateGiftsCategory";
import CorporateGiftDetail from "./pages/CorporateGiftDetail";
import ProductCustomize from "./pages/ProductCustomize";
import TShirtCustomize from "./pages/TShirtCustomize";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminCustomers from "./pages/admin/AdminCustomers";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminInventory from "./pages/admin/AdminInventory";
import AdminCoupons from "./pages/admin/AdminCoupons";
import AdminReviews from "./pages/admin/AdminReviews";
import AdminBulkOrders from "./pages/admin/AdminBulkOrders";
import AdminReels from "./pages/admin/AdminReels";
import AdminHeroBanners from "./pages/admin/AdminHeroBanners";
import AdminVideos from "./pages/admin/AdminVideos";
import AdminFeaturedProducts from "./pages/admin/AdminFeaturedProducts";
import MagneticBadgeCategory from "./pages/MagneticBadgeCategory";
import MagneticBadgeCustomize from "./pages/MagneticBadgeCustomize";
import QRStandyCategory from "./pages/QRStandyCategory";
import QRStandyCustomize from "./pages/QRStandyCustomize";
import ProductPage from "./pages/ProductPage";
import NamePlateCategory from "./pages/NamePlateCategory";
import NamePlateCustomize from "./pages/NamePlateCustomize";
import WallClockCategory from "./pages/WallClockCategory";
import WallClockCustomize from "./pages/WallClockCustomize";
import FramedAcrylicCustomize from "./pages/FramedAcrylicCustomize";
import BabyFrameCategory from "./pages/BabyFrameCategory";
import BabyFrameCustomize from "./pages/BabyFrameCustomize";
import ResetPassword from "./pages/ResetPassword";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsConditions from "./pages/TermsConditions";
import RefundPolicy from "./pages/RefundPolicy";
import ShippingPolicy from "./pages/ShippingPolicy";
import AboutUs from "./pages/AboutUs";
import ContactUs from "./pages/ContactUs";
import NamePencilCategory from "./pages/NamePencilCategory";
import NamePencilCustomize from "./pages/NamePencilCustomize";
import AdminResetPassword from "./pages/admin/AdminResetPassword";


const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthModalProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/customize/:id" element={<ProductCustomize />} />
              <Route path="/tshirt/:id" element={<TShirtCustomize />} />
              <Route path="/category/acrylic" element={<AcrylicCategory />} />
              <Route path="/category/acrylic/baby-frames" element={<BabyFrameCategory />} />
              <Route path="/category/acrylic/framed-photo" element={<Navigate to="/framed-acrylic/customize" replace />} />
              <Route path="/category/acrylic/:subcategoryId" element={<AcrylicSubcategory />} />
              <Route path="/framed-acrylic/customize" element={<FramedAcrylicCustomize />} />
              <Route path="/framed-acrylic/:id" element={<FramedAcrylicCustomize />} />
              <Route path="/category/t-shirts" element={<TShirtCategory />} />
              <Route path="/category/trophies" element={<TrophiesCategory />} />
              <Route path="/category/corporate-gifts" element={<CorporateGiftsCategory />} />
              {/* <Route path="/corporate-gift/:id" element={<CorporateGiftDetail />} /> */}
              <Route path="/category/wedding-card" element={<MagneticBadgeCategory />} />
              <Route path="/wedding-card/:id" element={<MagneticBadgeCustomize />} />
              <Route path="/wedding-card/customize" element={<MagneticBadgeCustomize />} />
              <Route path="/category/qr-standee" element={<QRStandyCategory />} />
              <Route path="/qr-standee/:id" element={<QRStandyCustomize />} />
              <Route path="/qr-standee/customize" element={<QRStandyCustomize />} />
              <Route path="/category/name-plates" element={<NamePlateCategory />} />
              <Route path="/nameplate/:id" element={<NamePlateCustomize />} />
              <Route path="/nameplate/customize" element={<NamePlateCustomize />} />
              <Route path="/category/wall-clocks" element={<WallClockCategory />} />
              <Route path="/category/acrylic/wall-clocks" element={<WallClockCategory />} />
              <Route path="/wall-clock/:id" element={<WallClockCustomize />} />
              <Route path="/wall-clock/customize" element={<WallClockCustomize />} />
              <Route path="/tshirt/customize" element={<TShirtCustomize />} />
              <Route path="/category/baby-frames" element={<BabyFrameCategory />} />
              <Route path="/baby-frame/:id" element={<BabyFrameCustomize />} />
              <Route path="/baby-frame/customize" element={<BabyFrameCustomize />} />
              <Route path="/category/name-pencils" element={<NamePencilCategory />} />
              <Route path="/name-pencil/:id" element={<NamePencilCustomize />} />
              <Route path="/name-pencil/customize" element={<NamePencilCustomize />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/admin/reset-password" element={<AdminResetPassword />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/corporate-gift/customize/:id" element={<CorporateGiftDetail />} />
              
              {/* Policy Pages */}
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-conditions" element={<TermsConditions />} />
              <Route path="/refund-policy" element={<RefundPolicy />} />
              <Route path="/shipping-policy" element={<ShippingPolicy />} />
              <Route path="/about-us" element={<AboutUs />} />
              <Route path="/contact-us" element={<ContactUs />} />

              {/* Admin Routes */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="inventory" element={<AdminInventory />} />
                <Route path="coupons" element={<AdminCoupons />} />
                <Route path="reviews" element={<AdminReviews />} />
                <Route path="reels" element={<AdminReels />} />
                <Route path="hero-banners" element={<AdminHeroBanners />} />
                <Route path="videos" element={<AdminVideos />} />
                <Route path="featured" element={<AdminFeaturedProducts />} />
                <Route path="bulk-orders" element={<AdminBulkOrders />} />
                <Route path="categories" element={<AdminCategories />} />
                <Route path="customers" element={<AdminCustomers />} />
                <Route path="settings" element={<AdminSettings />} />
                
              </Route>

              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <FloatingWhatsApp />
          </AuthModalProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
