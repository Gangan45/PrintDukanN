import { Palette, Zap, Award, Users } from "lucide-react";
const features = [{
  icon: Palette,
  title: "Premium Quality",
  description: "We use only the finest materials and cutting-edge printing technology for stunning results."
}, {
  icon: Zap,
  title: "Fast Turnaround",
  description: "Quick production and delivery. Get your custom products within 3-5 business days."
}, {
  icon: Award,
  title: "Expert Craftsmanship",
  description: "Our skilled artisans ensure every product meets the highest quality standards."
}, {
  icon: Users,
  title: "Dedicated Support",
  description: "Personal assistance from design to delivery. We're here to help every step of the way."
}];
export const WhyChooseUs = () => {
  return <section className="py-20 bg-gradient-navy relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="flex flex-col items-center text-center p-6 bg-card/50 backdrop-blur-sm rounded-2xl border border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20">
              <div className="w-16 h-16 rounded-full bg-gradient-hero flex items-center justify-center mb-4">
                <feature.icon className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>;
};