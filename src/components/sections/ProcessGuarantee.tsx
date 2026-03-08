import { ShieldCheck, RefreshCw, Headphones, Award } from "lucide-react";

const guarantees = [
{
  icon: ShieldCheck,
  title: "100% Quality Guarantee",
  description: "Not satisfied? We'll reprint or refund — no questions asked."
},
{
  icon: RefreshCw,
  title: "Free Design Revision",
  description: "Don't like the preview? We'll redesign it until you love it."
},
{
  icon: Headphones,
  title: "WhatsApp Support",
  description: "Chat with us directly on WhatsApp for instant help & updates."
},
{
  icon: Award,
  title: "Premium Materials",
  description: "We use only imported acrylic, UV-grade inks & premium fabrics."
}];


export const ProcessGuarantee = () => {
  return (
    <section className="py-14 sm:py-20 bg-card border-y border-border">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent text-accent-foreground text-sm font-semibold mb-4">
            Our Promise
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground font-display italic">Why Customers Trust Us

          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {guarantees.map((item, index) =>
          <div
            key={index}
            className="group relative bg-background rounded-2xl p-6 text-center border border-border hover:border-primary/40 hover:shadow-lg transition-all duration-300">
            
              <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                <item.icon className="w-8 h-8 text-primary group-hover:text-primary-foreground transition-colors duration-300" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
            </div>
          )}
        </div>
      </div>
    </section>);

};