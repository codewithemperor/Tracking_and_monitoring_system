"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Package, Truck, FileText, Home, LogOut, Plus, Users, UserCheck, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

const adminNavItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: Home,
  },
  {
    title: "All Deliveries",
    href: "/admin/delivery",
    icon: Package,
  },
  {
    title: "Add Delivery",
    href: "/admin/delivery/add",
    icon: Plus,
  },
  {
    title: "Complaints",
    href: "/admin/complaint",
    icon: FileText,
  },
  {
    title: "Staff Management",
    href: "/admin/staff",
    icon: Users,
  },
  {
    title: "User Management",
    href: "/admin/user",
    icon: UserCheck,
  },
];

interface AdminDashboardLayoutProps {
  children: React.ReactNode;
}

export function AdminDashboardLayout({ children }: AdminDashboardLayoutProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const adminData = localStorage.getItem('admin_data');
    const adminToken = localStorage.getItem('admin_token');
    
    if (!adminData || !adminToken) {
      window.location.href = '/admin/login';
      return;
    }
    
    setUser(JSON.parse(adminData));
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-nipost-blue text-white">
        <div className="container flex h-16 items-center px-4">
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                className="mr-2 md:hidden text-white hover:bg-nipost-blue/80"
                size="icon"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle sidebar</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0 bg-nipost-blue text-white border-r border-nipost-yellow">
              <div className="flex h-full flex-col">
                <div className="flex h-14 items-center border-b border-nipost-yellow px-4">
                  <h2 className="text-lg font-semibold text-nipost-yellow">
                    NIPOST Admin
                  </h2>
                </div>
                <nav className="flex-1 space-y-1 p-4">
                  {adminNavItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-nipost-yellow/20 hover:text-white",
                          pathname === item.href
                            ? "bg-nipost-yellow text-nipost-blue"
                            : "text-white/80"
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        {item.title}
                      </Link>
                    );
                  })}
                </nav>
                <div className="border-t border-nipost-yellow p-4">
                  {user && (
                    <div className="flex items-center gap-3 mb-3 p-3 bg-white/10 rounded-lg">
                      <User className="h-5 w-5 text-nipost-yellow" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{user.name}</p>
                        <p className="text-xs text-white/70 truncate">{user.role}</p>
                      </div>
                    </div>
                  )}
                  <button 
                    onClick={() => {
                      localStorage.removeItem('admin_data');
                      localStorage.removeItem('admin_token');
                      localStorage.removeItem('admin_role');
                      window.location.href = '/admin/login';
                    }}
                    className="w-full justify-start"
                  >
                    <Button variant="ghost" className="w-full justify-start text-white hover:bg-white/10">
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </Button>
                  </button>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-4">
              <h1 className="text-lg font-semibold text-white">
                NIPOST Admin Portal
              </h1>
            </div>
            {user && (
              <div className="hidden md:flex items-center gap-3 bg-nipost-yellow/10 px-3 py-2 rounded-lg">
                <User className="h-4 w-4 text-nipost-yellow" />
                <div className="flex flex-col">
                  <p className="text-sm font-medium text-white">{user.name}</p>
                  <p className="text-xs text-white/70">{user.role}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Desktop */}
        <aside className="hidden md:block w-64 border-r bg-nipost-blue text-white">
          <div className="flex h-full flex-col">
            <div className="flex h-14 items-center border-b border-nipost-yellow px-4">
              <h2 className="text-lg font-semibold text-nipost-yellow">
                NIPOST Admin
              </h2>
            </div>
            <nav className="flex-1 space-y-1 p-4">
              {adminNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-nipost-yellow/20 hover:text-white",
                      pathname === item.href
                        ? "bg-nipost-yellow text-nipost-blue"
                        : "text-white/80"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.title}
                  </Link>
                );
              })}
            </nav>
            <div className="border-t border-nipost-yellow p-4">
              {user && (
                <div className="flex items-center gap-3 mb-3 p-3 bg-white/10 rounded-lg">
                  <User className="h-5 w-5 text-nipost-yellow" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{user.name}</p>
                    <p className="text-xs text-white/70 truncate">{user.role}</p>
                  </div>
                </div>
              )}
              <button 
                    onClick={() => {
                      localStorage.removeItem('admin_data');
                      localStorage.removeItem('admin_token');
                      localStorage.removeItem('admin_role');
                      window.location.href = '/admin/login';
                    }}
                    className="w-full justify-start"
                  >
                    <Button variant="ghost" className="w-full justify-start text-white hover:bg-white/10">
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </Button>
                  </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="p-4 md:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}