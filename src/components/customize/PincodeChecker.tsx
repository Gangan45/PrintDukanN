import { useState } from "react";
import { Truck, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const PincodeChecker = () => {
  const [pincode, setPincode] = useState("");
  const [result, setResult] = useState<{ days: number; city?: string } | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const check = async () => {
    setError("");
    setResult(null);
    if (!/^\d{6}$/.test(pincode)) {
      setError("Enter a valid 6-digit pincode");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
      const data = await res.json();
      if (data?.[0]?.Status === "Success" && data[0].PostOffice?.length) {
        const po = data[0].PostOffice[0];
        // Estimate: metro 3-5 days, others 5-7 days
        const metros = ["Mumbai", "Delhi", "Bangalore", "Bengaluru", "Chennai", "Kolkata", "Hyderabad", "Pune"];
        const isMetro = metros.some((m) => po.District?.includes(m) || po.Region?.includes(m));
        setResult({ days: isMetro ? 4 : 6, city: `${po.District}, ${po.State}` });
      } else {
        setError("Pincode not serviceable");
      }
    } catch {
      setError("Could not check pincode. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <Truck className="w-4 h-4 text-coral" />
        Check Delivery
      </div>
      <div className="flex gap-2">
        <Input
          value={pincode}
          onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          placeholder="Enter pincode"
          maxLength={6}
          className="flex-1"
        />
        <Button onClick={check} disabled={loading} variant="navy" size="default">
          {loading ? "..." : "Check"}
        </Button>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
      {result && (
        <div className="flex items-start gap-2 p-2 rounded-md bg-coral/10 border border-coral/20 text-xs">
          <Check className="w-4 h-4 text-coral shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-foreground">Delivery in {result.days}-{result.days + 2} days</p>
            {result.city && <p className="text-muted-foreground">{result.city}</p>}
          </div>
        </div>
      )}
    </div>
  );
};
