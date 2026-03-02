import { useState, useEffect } from "react";
import { Save, Store, Bell, Key, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const AdminSettings = () => {
  const [storeSettings, setStoreSettings] = useState({
    storeName: "PrintCraft India",
    email: "contact@printcraft.in",
    phone: "+91 98765 43210",
    address: "123, MG Road, Bangalore, Karnataka 560001",
    description: "Premium printing and gifting solutions",
  });

  const [notifications, setNotifications] = useState({
    orderConfirmation: true,
    orderShipped: true,
    orderDelivered: true,
    lowStock: true,
    newCustomer: false,
  });

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  const handleSaveStore = () => {
    toast({ title: "Saved", description: "Store settings updated successfully" });
  };

  const handleSaveNotifications = () => {
    toast({ title: "Saved", description: "Notification preferences updated" });
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      toast({ title: "Error", description: "Please fill all fields", variant: "destructive" });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "Error", description: "New passwords do not match", variant: "destructive" });
      return;
    }
    if (newPassword.length < 6) {
      toast({ title: "Error", description: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }

    setChangingPassword(true);
    try {
      // Verify current password
      const { data } = await supabase
        .from("admin_settings")
        .select("value")
        .eq("key", "admin_password")
        .single();

      if (!data || currentPassword !== data.value) {
        toast({ title: "Error", description: "Current password is incorrect", variant: "destructive" });
        return;
      }

      // Update password directly
      const { error } = await supabase
        .from("admin_settings")
        .update({ value: newPassword })
        .eq("key", "admin_password");

      if (error) throw error;

      toast({ title: "Success", description: "Admin password changed successfully" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setChangingPassword(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("admin_authenticated");
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">Manage your store configuration</p>
        </div>
        <Button variant="outline" onClick={handleLogout} className="gap-2">
          <LogOut className="h-4 w-4" />Logout
        </Button>
      </div>

      <Tabs defaultValue="store" className="space-y-6">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="store" className="gap-2"><Store className="h-4 w-4" />Store</TabsTrigger>
          <TabsTrigger value="password" className="gap-2"><Key className="h-4 w-4" />Password</TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2"><Bell className="h-4 w-4" />Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="store">
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Store Information</CardTitle>
              <CardDescription>Basic information about your store</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="storeName">Store Name</Label>
                  <Input id="storeName" value={storeSettings.storeName} onChange={(e) => setStoreSettings({ ...storeSettings, storeName: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Contact Email</Label>
                  <Input id="email" type="email" value={storeSettings.email} onChange={(e) => setStoreSettings({ ...storeSettings, email: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" value={storeSettings.phone} onChange={(e) => setStoreSettings({ ...storeSettings, phone: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Store Address</Label>
                <Textarea id="address" value={storeSettings.address} onChange={(e) => setStoreSettings({ ...storeSettings, address: e.target.value })} rows={2} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Store Description</Label>
                <Textarea id="description" value={storeSettings.description} onChange={(e) => setStoreSettings({ ...storeSettings, description: e.target.value })} rows={3} />
              </div>
              <Button onClick={handleSaveStore} className="gap-2"><Save className="h-4 w-4" />Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="password">
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Change Admin Password</CardTitle>
              <CardDescription>Update the password used to access the admin panel</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 max-w-md">
              <div className="space-y-2">
                <Label>Current Password</Label>
                <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Enter current password" />
              </div>
              <div className="space-y-2">
                <Label>New Password</Label>
                <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Enter new password" />
              </div>
              <div className="space-y-2">
                <Label>Confirm New Password</Label>
                <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm new password" />
              </div>
              <Button onClick={handleChangePassword} disabled={changingPassword} className="gap-2">
                <Key className="h-4 w-4" />Change Password
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Email Notifications</CardTitle>
              <CardDescription>Configure when you receive email alerts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {[
                { key: "orderConfirmation", label: "Order Confirmation", desc: "Get notified when a new order is placed" },
                { key: "orderShipped", label: "Order Shipped", desc: "Get notified when an order is shipped" },
                { key: "orderDelivered", label: "Order Delivered", desc: "Get notified when an order is delivered" },
                { key: "lowStock", label: "Low Stock Alert", desc: "Get notified when product stock is low" },
                { key: "newCustomer", label: "New Customer", desc: "Get notified when a new customer registers" },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{item.label}</Label>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                  <Switch
                    checked={notifications[item.key as keyof typeof notifications]}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, [item.key]: checked })}
                  />
                </div>
              ))}
              <Button onClick={handleSaveNotifications} className="gap-2"><Save className="h-4 w-4" />Save Preferences</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSettings;
