import { Upload, Eye, Truck, PartyPopper } from "lucide-react";

const steps = [
  {
    icon: Upload,
    step: "01",
    title: "Choose & Customize",
    description: "Select your product and upload your photo, logo or text for personalization.",
  },
  {
    icon: Eye,
    step: "02",
    title: "Preview & Approve",
    description: "We share a digital preview before production. Approve it or request changes — free!",
  },
  {
    icon: Truck,
    step: "03",
    title: "We Craft & Ship",
    description: "Our experts carefully craft your product and ship it with secure packaging.",
  },
  {
    icon: PartyPopper,
    step: "04",
    title: "Unbox & Enjoy!",
    description: "Receive your premium customized product at your doorstep. 100% satisfaction guaranteed!",
  },
];

export const HowItWorks = () => {
  return (
    <section className="py-16 sm:py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">
            Simple Process
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground font-display italic">
            How It Works
          </h2>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
            Getting your custom product is easy — just 4 simple steps!
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {/* Connecting line (desktop) */}
          <div className="hidden lg:block absolute top-16 left-[12%] right-[12%] h-0.5 bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20" />

          {steps.map((step, index) => (
            <div key={index} className="relative flex flex-col items-center text-center group">
              <div className="relative z-10 w-20 h-20 rounded-full bg-card border-2 border-primary/30 flex items-center justify-center mb-5 group-hover:border-primary group-hover:shadow-glow transition-all duration-300">
                <step.icon className="w-8 h-8 text-primary" />
                <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                  {step.step}
                </span>
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
