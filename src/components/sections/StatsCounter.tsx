import { useEffect, useState, useRef } from "react";
import { Users, Package, Star, Building2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const iconMap: Record<string, any> = { Package, Users, Star, Building2 };

const defaultStats = [
  { icon: "Package", value: 25000, suffix: "+", label: "Orders Delivered", isDecimal: false },
  { icon: "Users", value: 15000, suffix: "+", label: "Happy Customers", isDecimal: false },
  { icon: "Star", value: 4.8, suffix: "★", label: "Google Rating", isDecimal: true },
  { icon: "Building2", value: 500, suffix: "+", label: "Corporate Clients", isDecimal: false },
];

const useCountUp = (end: number, duration: number, isDecimal?: boolean, startCounting?: boolean) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!startCounting) return;
    let start = 0;
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(isDecimal ? Math.round(start * 10) / 10 : Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [end, duration, isDecimal, startCounting]);
  return isDecimal ? count.toFixed(1) : count.toLocaleString("en-IN");
};

export const StatsCounter = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [stats, setStats] = useState(defaultStats);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      const { data } = await supabase
        .from('admin_settings')
        .select('key, value')
        .like('key', 'stat_%');
      if (data && data.length > 0) {
        const map = Object.fromEntries(data.map(d => [d.key, d.value]));
        if (map.stat_data) {
          try {
            const parsed = JSON.parse(map.stat_data);
            if (Array.isArray(parsed) && parsed.length > 0) setStats(parsed);
          } catch {}
        }
      }
    };
    fetchStats();
  }, []);

  return (
    <section ref={ref} className="py-12 sm:py-16 bg-navy text-primary-foreground">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {stats.map((stat, index) => (
            <StatItem key={index} stat={stat} isVisible={isVisible} />
          ))}
        </div>
      </div>
    </section>
  );
};

const StatItem = ({ stat, isVisible }: { stat: typeof defaultStats[0]; isVisible: boolean }) => {
  const count = useCountUp(stat.value, 2000, stat.isDecimal, isVisible);
  const Icon = iconMap[stat.icon] || Package;
  return (
    <div className="flex flex-col items-center text-center gap-2">
      <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center mb-1">
        <Icon className="w-7 h-7 text-coral-light" />
      </div>
      <div className="text-3xl sm:text-4xl font-bold font-display">
        {count}{stat.suffix}
      </div>
      <p className="text-sm text-primary-foreground/70">{stat.label}</p>
    </div>
  );
};
