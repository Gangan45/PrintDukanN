import { useState, useEffect } from "react";
import { Star, Quote, ThumbsUp, BadgeCheck } from "lucide-react";

const reviews = [
  // English reviews first
  {
    id: 1,
    name: "Rajesh Kumar",
    location: "Mumbai, Maharashtra",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop",
    rating: 5,
    timeAgo: "2 weeks ago",
    text: "Excellent quality acrylic photo frames! Ordered for my office and everyone loved them. The customization options are amazing and delivery was super fast. Highly recommended for corporate gifts!",
    helpful: 24,
    verified: true,
  },
  {
    id: 2,
    name: "Priya Sharma",
    location: "Delhi NCR",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop",
    rating: 5,
    timeAgo: "1 month ago",
    text: "Best place for customized gifts! I ordered personalized key-chains for my team of 50 people. Quality was top-notch and the printing was crystal clear. Will definitely order again.",
    helpful: 18,
    verified: true,
  },
  {
    id: 3,
    name: "Amit Patel",
    location: "Ahmedabad, Gujarat",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
    rating: 5,
    timeAgo: "3 weeks ago",
    text: "Outstanding service and quality! Got polo t-shirts printed with our company logo. The fabric quality is premium and the print hasn't faded even after multiple washes. Very impressed!",
    helpful: 31,
    verified: true,
  },
  {
    id: 4,
    name: "Sneha Reddy",
    location: "Hyderabad, Telangana",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop",
    rating: 4,
    timeAgo: "1 week ago",
    text: "Great experience! Ordered acrylic night lamps for Diwali gifting. They look beautiful and the LED quality is excellent. Packaging was also very secure. Minor delay in delivery but worth the wait.",
    helpful: 12,
    verified: true,
  },
  {
    id: 5,
    name: "Meera Iyer",
    location: "Chennai, Tamil Nadu",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop",
    rating: 5,
    timeAgo: "5 days ago",
    text: "Superb quality products! Got magnetic badges for our hospital staff. The finishing is excellent and they look very professional. Customer support was also very helpful.",
    helpful: 8,
    verified: true,
  },
  // Hindi reviews
  {
    id: 6,
    name: "Vikram Singh",
    location: "Jaipur, Rajasthan",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop",
    rating: 5,
    timeAgo: "2 months ago",
    text: "Bahut accha kaam kiya! Corporate trophies order kiye the apni company ke annual function ke liye. Quality outstanding thi aur time pe delivery mili. Thank you team! 🙏",
    helpful: 45,
    verified: true,
  },
  {
    id: 7,
    name: "Sunita Devi",
    location: "Lucknow, Uttar Pradesh",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop",
    rating: 5,
    timeAgo: "3 weeks ago",
    text: "Mujhe apne ghar ke liye acrylic photo frame chahiye tha. Jo mila woh bahut sundar tha! Photo ki quality bilkul clear thi aur frame bhi bahut solid hai. Zarur order karo!",
    helpful: 22,
    verified: true,
  },
  {
    id: 8,
    name: "Ravi Verma",
    location: "Patna, Bihar",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop",
    rating: 5,
    timeAgo: "1 month ago",
    text: "QR standy order kiya tha apni dukaan ke liye. Bahut professional dikhta hai aur customers ko bhi pasand aaya. Price bhi reasonable hai. Highly recommend karta hoon! 👍",
    helpful: 33,
    verified: true,
  },
  {
    id: 9,
    name: "Kavita Sharma",
    location: "Indore, Madhya Pradesh",
    image: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=200&h=200&fit=crop",
    rating: 4,
    timeAgo: "2 weeks ago",
    text: "Name plate order ki thi apne naye ghar ke liye. Design bahut khoobsurat hai aur quality bhi achi hai. Delivery thodi late hui lekin overall bahut satisfied hoon. ❤️",
    helpful: 16,
    verified: true,
  },
  {
    id: 10,
    name: "Deepak Yadav",
    location: "Bhopal, Madhya Pradesh",
    image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&h=200&fit=crop",
    rating: 5,
    timeAgo: "4 days ago",
    text: "T-shirt printing ka kaam karaya tha college fest ke liye. 100 t-shirts order kiye the aur sabki quality ek jaisi thi. Print bilkul sharp aur colors vibrant the. Best service! 🎉",
    helpful: 28,
    verified: true,
  },
];

export const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerView = 3;
  const totalSlides = Math.ceil(reviews.length / itemsPerView);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % totalSlides);
    }, 5000);
    return () => clearInterval(interval);
  }, [totalSlides]);

  return (
    <section className="py-16 md:py-20 bg-muted/30 overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground font-display italic">
            What Our Customers Say
          </h2>
        </div>

        {/* Sliding Reviews */}
        <div className="relative">
          <div
            className="flex transition-transform duration-700 ease-in-out"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {Array.from({ length: totalSlides }).map((_, slideIdx) => (
              <div
                key={slideIdx}
                className="min-w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-1"
              >
                {reviews
                  .slice(slideIdx * itemsPerView, slideIdx * itemsPerView + itemsPerView)
                  .map((review) => (
                    <div
                      key={review.id}
                      className="relative bg-card rounded-2xl p-6 shadow-card hover:shadow-xl transition-all duration-300"
                    >
                      {/* Quote Icon */}
                      <div className="absolute top-6 right-6 text-muted/40">
                        <Quote className="h-8 w-8" />
                      </div>

                      {/* Author Info */}
                      <div className="flex items-center gap-3 mb-3">
                        <img
                          src={review.image}
                          alt={review.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-semibold text-foreground">{review.name}</h4>
                            {review.verified && (
                              <BadgeCheck className="h-4 w-4 text-primary fill-primary" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">{review.location}</p>
                        </div>
                      </div>

                      {/* Rating & Time */}
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${i < review.rating ? "fill-gold text-gold" : "text-muted/30"}`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground">{review.timeAgo}</span>
                      </div>

                      {/* Review Text */}
                      <p className="text-sm text-foreground/80 leading-relaxed mb-4">
                        {review.text}
                      </p>

                      {/* Helpful */}
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <ThumbsUp className="h-4 w-4" />
                        <span className="text-xs">Helpful ({review.helpful})</span>
                      </div>
                    </div>
                  ))}
              </div>
            ))}
          </div>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: totalSlides }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === currentIndex ? "w-6 bg-primary" : "w-2 bg-primary/40"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Stats Bar */}
        <div className="mt-12 flex flex-wrap justify-center gap-8 md:gap-16">
          {[
            { icon: "⭐", value: "4.8+ Rating", label: "Google Verified" },
            { icon: "✅", value: "2,800+ Reviews", label: "Verified Customers" },
            { icon: "👍", value: "98% Recommend", label: "Customer Satisfaction" },
          ].map((stat) => (
            <div key={stat.value} className="flex items-center gap-3 text-center">
              <span className="text-2xl">{stat.icon}</span>
              <div>
                <p className="font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
