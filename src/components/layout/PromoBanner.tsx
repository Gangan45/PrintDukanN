import saleBanner from "@/assets/sale-banner.png";

export const PromoBanner = () => {
  return (
    <div className="w-full">
      <img 
        src={saleBanner} 
        alt="12.12 Sale - Up to 15% discount on Acrylic QR Code Stand and Name Plates" 
        className="w-full h-auto object-contain"
      />
    </div>
  );
};
