import { useEffect, useState } from "react";
import { Loader2, Phone, MessageCircle, Search, Trash2, RefreshCw, User, MapPin, Package, Download } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { format, startOfDay, endOfDay, subDays, startOfMonth } from "date-fns";

interface CartItem {
  product_name?: string | null;
  quantity?: number;
  unit_price?: number;
  selected_size?: string | null;
  selected_frame?: string | null;
  custom_image_url?: string | null;
  product_image?: string | null;
}

interface AbandonedCheckout {
  id: string;
  full_name: string;
  phone: string;
  address: string;
  landmark: string | null;
  city: string;
  state: string;
  pincode: string;
  cart_items: CartItem[];
  total_amount: number;
  status: string;
  admin_notes: string | null;
  created_at: string;
}

const STATUS_OPTIONS = [
  { value: "new", label: "New", color: "bg-blue-100 text-blue-700" },
  { value: "contacted", label: "Contacted", color: "bg-amber-100 text-amber-700" },
  { value: "converted", label: "Converted", color: "bg-emerald-100 text-emerald-700" },
  { value: "ignored", label: "Ignored", color: "bg-gray-100 text-gray-700" },
];

const AdminAbandonedCheckouts = () => {
  const [rows, setRows] = useState<AbandonedCheckout[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [selected, setSelected] = useState<AbandonedCheckout | null>(null);
  const [notes, setNotes] = useState("");
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("abandoned_checkouts")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setRows((data || []) as any as AbandonedCheckout[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const getDateRange = (key: string): { from: Date | null; to: Date | null } => {
    const now = new Date();
    switch (key) {
      case "today":
        return { from: startOfDay(now), to: endOfDay(now) };
      case "yesterday": {
        const y = subDays(now, 1);
        return { from: startOfDay(y), to: endOfDay(y) };
      }
      case "7days":
        return { from: startOfDay(subDays(now, 6)), to: endOfDay(now) };
      case "30days":
        return { from: startOfDay(subDays(now, 29)), to: endOfDay(now) };
      case "month":
        return { from: startOfMonth(now), to: endOfDay(now) };
      default:
        return { from: null, to: null };
    }
  };

  const filtered = rows.filter((r) => {
    const matchesSearch =
      !search ||
      r.full_name.toLowerCase().includes(search.toLowerCase()) ||
      r.phone.includes(search) ||
      r.city.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || r.status === statusFilter;
    const { from, to } = getDateRange(dateFilter);
    const created = new Date(r.created_at);
    const matchesDate = !from || !to || (created >= from && created <= to);
    return matchesSearch && matchesStatus && matchesDate;
  });

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from("abandoned_checkouts")
      .update({ status })
      .eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
      toast({ title: "Updated", description: `Marked as ${status}` });
    }
  };

  const saveNotes = async () => {
    if (!selected) return;
    const { error } = await supabase
      .from("abandoned_checkouts")
      .update({ admin_notes: notes })
      .eq("id", selected.id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setRows((prev) => prev.map((r) => (r.id === selected.id ? { ...r, admin_notes: notes } : r)));
      toast({ title: "Notes saved" });
      setSelected(null);
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("abandoned_checkouts").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setRows((prev) => prev.filter((r) => r.id !== id));
      toast({ title: "Deleted" });
    }
  };

  const handleBulkDelete = async () => {
    const ids = filtered.map((r) => r.id);
    if (ids.length === 0) return;
    const { error } = await supabase.from("abandoned_checkouts").delete().in("id", ids);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setRows((prev) => prev.filter((r) => !ids.includes(r.id)));
      toast({ title: "Deleted", description: `${ids.length} entries removed` });
    }
    setBulkDeleteOpen(false);
  };

  const escapeCsv = (val: unknown): string => {
    if (val === null || val === undefined) return "";
    const str = String(val);
    if (/[",\n\r]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
    return str;
  };

  const handleExportCsv = () => {
    if (filtered.length === 0) {
      toast({ title: "Nothing to export", description: "No rows match the current filters." });
      return;
    }
    const headers = [
      "Created At",
      "Status",
      "Full Name",
      "Phone",
      "Address",
      "Landmark",
      "City",
      "State",
      "Pincode",
      "Items Count",
      "Items",
      "Total Amount",
      "Admin Notes",
    ];
    const lines = filtered.map((r) => {
      const itemsStr = (r.cart_items || [])
        .map((i) => `${i.product_name || "Product"} x${i.quantity || 1}${i.selected_size ? ` (${i.selected_size})` : ""}`)
        .join(" | ");
      return [
        format(new Date(r.created_at), "yyyy-MM-dd HH:mm"),
        r.status,
        r.full_name,
        r.phone,
        r.address,
        r.landmark || "",
        r.city,
        r.state,
        r.pincode,
        (r.cart_items || []).length,
        itemsStr,
        Number(r.total_amount),
        r.admin_notes || "",
      ].map(escapeCsv).join(",");
    });
    const csv = [headers.join(","), ...lines].join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `abandoned-checkouts-${format(new Date(), "yyyy-MM-dd-HHmm")}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: "Exported", description: `${filtered.length} rows downloaded` });
  };

  const callCustomer = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const whatsappCustomer = (row: AbandonedCheckout) => {
    const itemsList = (row.cart_items || [])
      .map((i) => `• ${i.product_name || "Product"} (Qty: ${i.quantity || 1})`)
      .join("\n");
    const message = encodeURIComponent(
      `Hi ${row.full_name}, this is PrintDukan. We noticed you were trying to place an order with us:\n\n${itemsList}\n\nTotal: ₹${row.total_amount.toLocaleString()}\n\nIs there anything we can help you with to complete your order?`
    );
    const cleanPhone = row.phone.replace(/\D/g, "");
    const fullPhone = cleanPhone.startsWith("91") ? cleanPhone : `91${cleanPhone}`;
    window.open(`https://wa.me/${fullPhone}?text=${message}`, "_blank");
  };

  const getStatusBadge = (status: string) => {
    const opt = STATUS_OPTIONS.find((s) => s.value === status) || STATUS_OPTIONS[0];
    return <Badge variant="secondary" className={opt.color}>{opt.label}</Badge>;
  };

  const newCount = rows.filter((r) => r.status === "new").length;
  const totalValue = rows
    .filter((r) => r.status === "new" || r.status === "contacted")
    .reduce((sum, r) => sum + Number(r.total_amount), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Abandoned Checkouts</h1>
          <p className="text-muted-foreground">
            Customers who filled the address but didn't complete payment. Call them to convert.
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleExportCsv} variant="outline" disabled={filtered.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button onClick={load} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Abandoned</p>
            <p className="text-3xl font-bold mt-1">{rows.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">New (Need Call)</p>
            <p className="text-3xl font-bold mt-1 text-blue-600">{newCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Recoverable Value</p>
            <p className="text-3xl font-bold mt-1 text-emerald-600">₹{totalValue.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search name, phone, city..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="yesterday">Yesterday</SelectItem>
                <SelectItem value="7days">Last 7 days</SelectItem>
                <SelectItem value="30days">Last 30 days</SelectItem>
                <SelectItem value="month">This month</SelectItem>
              </SelectContent>
            </Select>
            {filtered.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setBulkDeleteOpen(true)}
                className="text-destructive border-destructive/40 hover:bg-destructive/10 hover:text-destructive ml-auto"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete {filtered.length} {filtered.length === 1 ? "entry" : "entries"}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No abandoned checkouts found.
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((row) => (
                <div
                  key={row.id}
                  className="border border-border rounded-lg p-4 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex flex-wrap gap-4 justify-between items-start">
                    <div className="flex-1 min-w-[250px]">
                      <div className="flex items-center gap-2 flex-wrap">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-semibold text-foreground">{row.full_name}</span>
                        {getStatusBadge(row.status)}
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(row.created_at), "dd MMM yyyy, hh:mm a")}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center gap-2 text-sm text-foreground">
                        <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                        <a href={`tel:${row.phone}`} className="font-medium hover:text-primary">
                          {row.phone}
                        </a>
                      </div>
                      <div className="mt-1 flex items-start gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                        <span>
                          {row.address}
                          {row.landmark ? `, ${row.landmark}` : ""}, {row.city}, {row.state} - {row.pincode}
                        </span>
                      </div>
                      <div className="mt-2 flex items-start gap-2 text-sm">
                        <Package className="h-3.5 w-3.5 mt-0.5 text-muted-foreground" />
                        <div className="flex-1">
                          <span className="font-medium text-foreground">
                            {(row.cart_items || []).length} item{(row.cart_items || []).length !== 1 ? "s" : ""}
                          </span>
                          <span className="text-emerald-600 font-bold ml-2">
                            ₹{Number(row.total_amount).toLocaleString()}
                          </span>
                          <div className="text-xs text-muted-foreground mt-1">
                            {(row.cart_items || []).map((i, idx) => (
                              <div key={idx}>
                                • {i.product_name || "Product"} × {i.quantity || 1}
                                {i.selected_size && ` (${i.selected_size})`}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      {row.admin_notes && (
                        <div className="mt-2 p-2 bg-amber-50 dark:bg-amber-500/10 rounded text-xs text-amber-800 dark:text-amber-400">
                          <strong>Note:</strong> {row.admin_notes}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 min-w-[140px]">
                      <Button
                        size="sm"
                        onClick={() => callCustomer(row.phone)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        <Phone className="h-3.5 w-3.5 mr-1" />
                        Call
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => whatsappCustomer(row)}
                        className="border-emerald-600 text-emerald-600 hover:bg-emerald-50"
                      >
                        <MessageCircle className="h-3.5 w-3.5 mr-1" />
                        WhatsApp
                      </Button>
                      <Select value={row.status} onValueChange={(v) => updateStatus(row.id, v)}>
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUS_OPTIONS.map((s) => (
                            <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setSelected(row);
                          setNotes(row.admin_notes || "");
                        }}
                        className="text-xs"
                      >
                        Add Note
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive">
                            <Trash2 className="h-3.5 w-3.5 mr-1" />
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete this entry?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently remove this customer's abandoned checkout record.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(row.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notes Dialog */}
      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Note for {selected?.full_name}</DialogTitle>
            <DialogDescription>
              Record what happened on the call so you remember next time.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={5}
            placeholder="e.g. Customer asked to call back tomorrow at 5 PM, wants discount..."
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setSelected(null)}>Cancel</Button>
            <Button onClick={saveNotes}>Save Note</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Delete Confirm */}
      <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {filtered.length} entries?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove all currently filtered abandoned checkouts. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminAbandonedCheckouts;
