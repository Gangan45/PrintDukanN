import { LayoutDashboard, Package, ShoppingCart, FolderTree, Settings, ArrowLeft, Users, Warehouse, Ticket, Star, FileStack, Film } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const menuItems = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
  { title: "Products", url: "/admin/products", icon: Package },
  { title: "Orders", url: "/admin/orders", icon: ShoppingCart },
  { title: "Inventory", url: "/admin/inventory", icon: Warehouse },
  { title: "Coupons", url: "/admin/coupons", icon: Ticket },
  { title: "Reviews", url: "/admin/reviews", icon: Star },
  { title: "Reels", url: "/admin/reels", icon: Film },
  { title: "Categories", url: "/admin/categories", icon: FolderTree },
  { title: "Customers", url: "/admin/customers", icon: Users },
];

export function AdminSidebar() {
  return (
    <Sidebar className="border-r border-border/50">
      <SidebarHeader className="p-3 sm:p-4 border-b border-border/50">
        <Link to="/admin" className="flex items-center gap-2">
          <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-xs sm:text-sm">PC</span>
          </div>
          <span className="font-display font-bold text-base sm:text-lg text-foreground">Admin Panel</span>
        </Link>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground text-xs">Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end={item.url === "/admin"}
                      className="flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors text-sm"
                      activeClassName="bg-primary/10 text-primary font-medium"
                    >
                      <item.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3 sm:p-4 border-t border-border/50">
        <Button variant="ghost" className="w-full justify-start gap-2 h-9 text-sm" asChild>
          <Link to="/">
            <ArrowLeft className="h-4 w-4" />
            Back to Store
          </Link>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
