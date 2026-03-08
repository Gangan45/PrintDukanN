import { useState, useEffect } from "react";
import { Loader2, Save, Plus, Trash2, Package, Users, Star, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface StatItem {
  icon: string;
  value: number;
  suffix: string;
  label: string;
  isDecimal: boolean;
}

const iconOptions = [
  { value: "Package", label: "Package (Orders)" },
  { value: "Users", label: "Users (Customers)" },
  { value: "Star", label: "Star (Rating)" },
  { value: "Building2", label: "Building (Corporate)" },
];

const defaultStats: StatItem[] = [
  { icon: "Package", value: 25000, suffix: "+", label: "Orders Delivered", isDecimal: false },
  { icon: "Users", value: 15000, suffix: "+", label: "Happy Customers", isDecimal: false },
  { icon: "Star", value: 4.8, suffix: "★", label: "Google Rating", isDecimal: true },
  { icon: "Building2", value: 500, suffix: "+", label: "Corporate Clients", isDecimal: false },
];

const AdminStats = () => {
  const [stats, setStats] = useState<StatItem[]>(defaultStats);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from('admin_settings')
        .select('key, value')
        .eq('key', 'stat_data')
        .single();
      if (data) {
        try {
          const parsed = JSON.parse(data.value);
          if (Array.isArray(parsed) && parsed.length > 0) setStats(parsed);
        } catch {}
      }
      setLoading(false);
    };
    fetch();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await supabase.from('admin_settings').upsert(
        { key: 'stat_data', value: JSON.stringify(stats) },
        { onConflict: 'key' }
      );
      toast({ title: "Saved", description: "Stats updated on homepage" });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
    setSaving(false);
  };

  const updateStat = (index: number, field: keyof StatItem, value: any) => {
    setStats(prev => prev.map((s, i) => i === index ? { ...s, [field]: value } : s));
  };

  const addStat = () => {
    setStats(prev => [...prev, { icon: "Package", value: 0, suffix: "+", label: "New Stat", isDecimal: false }]);
  };

  const removeStat = (index: number) => {
    setStats(prev => prev.filter((_, i) => i !== index));
  };

  if (loading) return <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Homepage Stats</h1>
          <p className="text-muted-foreground">Edit the stats counter section on homepage</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={addStat}><Plus className="h-4 w-4 mr-2" />Add Stat</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}Save All
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {stats.map((stat, index) => (
          <Card key={index} className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm">{stat.label}</CardTitle>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeStat(index)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Label</Label>
                  <Input value={stat.label} onChange={(e) => updateStat(index, 'label', e.target.value)} placeholder="Orders Delivered" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Icon</Label>
                  <Select value={stat.icon} onValueChange={(v) => updateStat(index, 'icon', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {iconOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Value</Label>
                  <Input type="number" step={stat.isDecimal ? "0.1" : "1"} value={stat.value} onChange={(e) => updateStat(index, 'value', parseFloat(e.target.value) || 0)} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Suffix</Label>
                  <Input value={stat.suffix} onChange={(e) => updateStat(index, 'suffix', e.target.value)} placeholder="+" />
                </div>
                <div className="space-y-1 flex flex-col">
                  <Label className="text-xs">Decimal?</Label>
                  <Switch checked={stat.isDecimal} onCheckedChange={(c) => updateStat(index, 'isDecimal', c)} className="mt-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminStats;
