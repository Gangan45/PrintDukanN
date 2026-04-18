import {
  Zap,
  Printer,
  Sparkles,
  Image as ImageIcon,
  FlaskConical,
  Droplets,
  Clock,
  Brain,
  ShieldCheck,
  Palette,
  Users,
  RotateCw,
} from "lucide-react";

const POINTS = [
  { icon: Zap, title: "Fastest Processing", desc: "From our Jaipur / Bengaluru facility" },
  { icon: Printer, title: "Pixel Perfect Printing", desc: "Unidirectional direct printing on Acrylic" },
  { icon: Sparkles, title: "Ultra HD Print", desc: "Highest DPI for crystal-clear results" },
  { icon: ImageIcon, title: "600×600 PPi Processing", desc: "Premium image processing pipeline" },
  { icon: FlaskConical, title: "Acrylic Chemical Treatment", desc: "Pre-treated for ink adhesion" },
  { icon: Droplets, title: "Never Peels Off", desc: "Even in moisture-rich environments" },
  { icon: Clock, title: "Same Day Processing", desc: "Orders processed the same day" },
  { icon: Brain, title: "AI-Powered", desc: "Advanced use of Artificial Intelligence" },
  { icon: ShieldCheck, title: "Multi-Layered Verification", desc: "Quality checked at every stage" },
  { icon: Palette, title: "Customised Color Profiling", desc: "Accurate, vibrant colours every time" },
  { icon: Users, title: "Managed by Printdukan Team", desc: "Skilled in-house printing experts" },
  { icon: RotateCw, title: "Auto Orientation", desc: "Best print quality, every angle" },
];

export const WhyPrintdukan = () => {
  return (
    <section className="my-12 rounded-2xl bg-gradient-to-br from-primary/5 via-background to-accent/5 border border-border p-6 md:p-10">
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground">
          Why <span className="text-primary">Printdukan</span>?
        </h2>
        <p className="text-muted-foreground mt-2">
          The print quality you can trust — backed by tech, craft & care.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {POINTS.map(({ icon: Icon, title, desc }) => (
          <div
            key={title}
            className="group flex flex-col gap-2 p-4 rounded-xl bg-card border border-border hover:border-primary/40 hover:shadow-md transition-all"
          >
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              <Icon className="h-5 w-5 text-primary group-hover:text-primary-foreground" />
            </div>
            <h3 className="font-semibold text-sm text-foreground leading-tight">{title}</h3>
            <p className="text-xs text-muted-foreground leading-snug">{desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default WhyPrintdukan;
