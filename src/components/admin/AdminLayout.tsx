import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "./AdminSidebar";
import { Outlet } from "react-router-dom";
import { AdminPasswordGate } from "./AdminPasswordGate";

const AdminLayout = () => {
  return (
    <AdminPasswordGate>
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          <AdminSidebar />
          <main className="flex-1 flex flex-col min-w-0">
            <header className="h-12 sm:h-14 border-b border-border/50 flex items-center px-3 sm:px-4 bg-background/95 backdrop-blur-sm sticky top-0 z-10">
              <SidebarTrigger className="mr-2 sm:mr-4" />
              <div className="flex-1" />
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-xs sm:text-sm font-medium text-primary">A</span>
                </div>
                <span className="text-xs sm:text-sm font-medium text-foreground hidden sm:inline">Admin</span>
              </div>
            </header>
            <div className="flex-1 p-3 sm:p-4 md:p-6 overflow-auto">
              <Outlet />
            </div>
          </main>
        </div>
      </SidebarProvider>
    </AdminPasswordGate>
  );
};

export default AdminLayout;
