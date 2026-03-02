import { useState, useEffect } from "react";
import { Star, ThumbsUp, Quote, BadgeCheck } from "lucide-react";

const reviews = [
  // English reviews
  {
    id: 1,
    name: "Rajesh Kumar",
    location: "Mumbai, Maharashtra",
    image: "https://rqnknqgpqttjqqhaejmt.supabase.co/storage/v1/object/public/review-photos/1.avif",
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
    image: "https://rqnknqgpqttjqqhaejmt.supabase.co/storage/v1/object/public/review-photos/2.avif",
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
    image: "https://rqnknqgpqttjqqhaejmt.supabase.co/storage/v1/object/public/review-photos/4.avif",
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
    image: "https://rqnknqgpqttjqqhaejmt.supabase.co/storage/v1/object/public/review-photos/6.avif",
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
    image: "https://rqnknqgpqttjqqhaejmt.supabase.co/storage/v1/object/public/review-photos/7.avif",
    rating: 5,
    timeAgo: "5 days ago",
    text: "Superb quality products! Got magnetic badges for our hospital staff. The finishing is excellent and they look very professional. Customer support was also very helpful.",
    helpful: 8,
    verified: true,
  },
  {
    id: 6,
    name: "Arjun Nair",
    location: "Kochi, Kerala",
    image: "https://rqnknqgpqttjqqhaejmt.supabase.co/storage/v1/object/public/review-photos/11.avif",
    rating: 5,
    timeAgo: "3 days ago",
    text: "Ordered customized wall clocks for our new office. The print quality is amazing and they look very premium. Great value for money and fast shipping!",
    helpful: 15,
    verified: true,
  },
  // Hindi reviews
  {
    id: 7,
    name: "Vikram Singh",
    location: "Jaipur, Rajasthan",
    image: "https://rqnknqgpqttjqqhaejmt.supabase.co/storage/v1/object/public/review-photos/5.avif",
    rating: 5,
    timeAgo: "2 months ago",
    text: "Bahut accha kaam kiya! Corporate trophies order kiye the apni company ke annual function ke liye. Quality outstanding thi aur time pe delivery mili. Thank you team! 🙏",
    helpful: 45,
    verified: true,
  },
  {
    id: 8,
    name: "Sunita Devi",
    location: "Lucknow, Uttar Pradesh",
    image: "https://rqnknqgpqttjqqhaejmt.supabase.co/storage/v1/object/public/review-photos/8.avif",
    rating: 5,
    timeAgo: "3 weeks ago",
    text: "Mujhe apne ghar ke liye acrylic photo frame chahiye tha. Jo mila woh bahut sundar tha! Photo ki quality bilkul clear thi aur frame bhi bahut solid hai. Zarur order karo!",
    helpful: 22,
    verified: true,
  },
  {
    id: 9,
    name: "Ravi Verma",
    location: "Patna, Bihar",
    image: "https://rqnknqgpqttjqqhaejmt.supabase.co/storage/v1/object/public/review-photos/3.avif",
    rating: 5,
    timeAgo: "1 month ago",
    text: "QR standy order kiya tha apni dukaan ke liye. Bahut professional dikhta hai aur customers ko bhi pasand aaya. Price bhi reasonable hai. Highly recommend karta hoon! 👍",
    helpful: 33,
    verified: true,
  },
  {
    id: 10,
    name: "Kavita Sharma",
    location: "Indore, Madhya Pradesh",
    image: "https://rqnknqgpqttjqqhaejmt.supabase.co/storage/v1/object/public/review-photos/9.avif",
    rating: 4,
    timeAgo: "2 weeks ago",
    text: "Name plate order ki thi apne naye ghar ke liye. Design bahut khoobsurat hai aur quality bhi achi hai. Delivery thodi late hui lekin overall bahut satisfied hoon. ❤️",
    helpful: 16,
    verified: true,
  },
  {
    id: 11,
    name: "Deepak Yadav",
    location: "Bhopal, Madhya Pradesh",
    image: "https://rqnknqgpqttjqqhaejmt.supabase.co/storage/v1/object/public/review-photos/12.avif",
    rating: 5,
    timeAgo: "4 days ago",
    text: "T-shirt printing ka kaam karaya tha college fest ke liye. 100 t-shirts order kiye the aur sabki quality ek jaisi thi. Print bilkul sharp aur colors vibrant the. Best service! 🎉",
    helpful: 28,
    verified: true,
  },
  {
    id: 12,
    name: "Pooja Gupta",
    location: "Varanasi, Uttar Pradesh",
    image: "https://rqnknqgpqttjqqhaejmt.supabase.co/storage/v1/object/public/review-photos/10.avif",
    rating: 5,
    timeAgo: "1 week ago",
    text: "Baby photo frame order kiya tha apne bete ke liye. Bahut pyaara design tha aur quality bhi kamaal ki thi. Sabne tareef ki! Bahut khushi hui dekhke. 🥰",
    helpful: 19,
    verified: true,
  },
];

export const GoogleReviews = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerView = 6;
  const totalSlides = Math.ceil(reviews.length / itemsPerView);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % totalSlides);
    }, 5000);
    return () => clearInterval(interval);
  }, [totalSlides]);

  return (
    <section className="py-16 md:py-20 bg-background overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-4">
            <span className="text-5xl font-bold text-foreground">4.8</span>
            <div className="text-left">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-6 h-6 ${
                      star <= 4
                        ? "fill-yellow-400 text-yellow-400"
                        : "fill-yellow-400/50 text-yellow-400"
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Based on 2,847 reviews
              </p>
            </div>
          </div>
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
                      className="relative bg-card rounded-2xl p-6 shadow-card border border-border/50 hover:shadow-xl transition-all duration-300"
                    >
                      <div className="absolute top-6 right-6 text-muted/40">
                        <Quote className="h-8 w-8" />
                      </div>

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

                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-muted/30"}`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground">{review.timeAgo}</span>
                      </div>

                      <p className="text-sm text-foreground/80 leading-relaxed mb-4">
                        {review.text}
                      </p>

                      <div className="flex items-center gap-1.5 text-muted-foreground pt-3 border-t border-border/50">
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
