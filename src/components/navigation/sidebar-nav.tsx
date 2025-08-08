'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { 
  Home, 
  Package, 
  Truck, 
  MapPin, 
  Users, 
  Settings, 
  BarChart3, 
  LogOut,
  Menu,
  X,
  MessageSquare,
  FileText,
  Bell,
  User,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarNavProps {
  user: {
    id: string;
    email: string;
    name: string;
    role: 'CUSTOMER' | 'STAFF' | 'ADMIN';
  };
}

interface NavItem {
  title: string;
  href: string;
  icon: any;
  description?: string;
  badge?: string;
  children?: NavItem[];
}

export default function SidebarNav({ user }: SidebarNavProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const router = useRouter();
  const pathname = usePathname();

  const toggleExpanded = (title: string) => {
    setExpandedItems(prev => 
      prev.includes(title) 
        ? prev.filter(item => item !== title)
        : [...prev, title]
    );
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const getNavItems = (): NavItem[] => {
    const baseItems: NavItem[] = [
      {
        title: 'Dashboard',
        href: user.role === 'ADMIN' ? '/admin-dashboard' : 
               user.role === 'STAFF' ? '/staff-dashboard' : '/dashboard',
        icon: Home,
        description: 'Overview and statistics'
      }
    ];

    if (user.role === 'CUSTOMER') {
      baseItems.push(
        {
          title: 'My Parcels',
          href: '/dashboard/parcels',
          icon: Package,
          description: 'View and manage your parcels'
        },
        {
          title: 'Ongoing Deliveries',
          href: '/dashboard/ongoing',
          icon: Truck,
          description: 'Track ongoing deliveries'
        },
        {
          title: 'Delivery History',
          href: '/dashboard/history',
          icon: FileText,
          description: 'View complete delivery history'
        },
        {
          title: 'Complaints',
          href: '/dashboard/complaints',
          icon: MessageSquare,
          description: 'File and track complaints'
        }
      );
    }

    if (user.role === 'STAFF') {
      baseItems.push(
        {
          title: 'Parcel Management',
          href: '/staff-dashboard/parcels',
          icon: Package,
          description: 'Manage all parcels'
        },
        {
          title: 'Add New Parcel',
          href: '/staff-dashboard/add-parcel',
          icon: Package,
          description: 'Register new parcel'
        },
        {
          title: 'Customer Management',
          href: '/staff-dashboard/customers',
          icon: Users,
          description: 'View customer details'
        },
        {
          title: 'Delivery States',
          href: '/staff-dashboard/deliveries',
          icon: Truck,
          description: 'Manage delivery states'
        },
        {
          title: 'Customer Complaints',
          href: '/staff-dashboard/complaints',
          icon: MessageSquare,
          description: 'Handle customer complaints'
        }
      );
    }

    if (user.role === 'ADMIN') {
      baseItems.push(
        {
          title: 'Staff Management',
          href: '/admin-dashboard/staff',
          icon: Users,
          description: 'Manage staff members'
        },
        {
          title: 'Add New Staff',
          href: '/admin-dashboard/add-staff',
          icon: User,
          description: 'Add new staff member'
        },
        {
          title: 'All Parcels',
          href: '/admin-dashboard/parcels',
          icon: Package,
          description: 'View all system parcels'
        },
        {
          title: 'System Analytics',
          href: '/admin-dashboard/analytics',
          icon: BarChart3,
          description: 'View system analytics'
        },
        {
          title: 'Delivery Management',
          href: '/admin-dashboard/deliveries',
          icon: Truck,
          description: 'Manage all deliveries'
        }
      );
    }

    baseItems.push(
      {
        title: 'Settings',
        href: '/settings',
        icon: Settings,
        description: 'Account settings'
      }
    );

    return baseItems;
  };

  const NavItems = ({ items, mobile = false }: { items: NavItem[], mobile?: boolean }) => {
    return (
      <div className="space-y-2">
        {items.map((item) => {
          const isActive = pathname === item.href;
          const hasChildren = item.children && item.children.length > 0;
          const isExpanded = expandedItems.includes(item.title);

          if (hasChildren) {
            return (
              <div key={item.title} className="space-y-1">
                <button
                  onClick={() => toggleExpanded(item.title)}
                  className={cn(
                    "w-full flex items-center justify-between p-3 rounded-lg transition-colors",
                    isActive 
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300" 
                      : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                  )}
                >
                  <div className="flex items-center space-x-3">
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.title}</span>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>
                
                {isExpanded && (
                  <div className="ml-4 space-y-1">
                    {item.children?.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        onClick={() => mobile && setIsMobileOpen(false)}
                        className={cn(
                          "flex items-center space-x-3 p-2 rounded-lg transition-colors",
                          pathname === child.href
                            ? "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                            : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                        )}
                      >
                        <child.icon className="w-4 h-4" />
                        <span className="text-sm">{child.title}</span>
                        {child.badge && (
                          <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                            {child.badge}
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => mobile && setIsMobileOpen(false)}
              className={cn(
                "flex items-center justify-between p-3 rounded-lg transition-colors",
                isActive 
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300" 
                  : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              )}
            >
              <div className="flex items-center space-x-3">
                <item.icon className="w-5 h-5" />
                <div>
                  <div className="font-medium">{item.title}</div>
                  {item.description && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {item.description}
                    </div>
                  )}
                </div>
              </div>
              {item.badge && (
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    );
  };

  const navItems = getNavItems();

  // Sidebar content
  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-lg flex items-center justify-center">
            <span className="text-blue-900 font-bold text-lg">N</span>
          </div>
          <div>
            <h2 className="font-bold text-lg">NIPOST</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {user.role} Portal
            </p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-lg">
              {user.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {user.name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {user.email}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 p-4 overflow-y-auto">
        <NavItems items={navItems} />
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full justify-start text-gray-700 border-gray-300 hover:bg-gray-50 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-800"
        >
          <LogOut className="w-4 h-4 mr-3" />
          Logout
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 lg:bg-white lg:border-r lg:border-gray-200 lg:dark:bg-gray-900 lg:dark:border-gray-700">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden fixed top-4 left-4 z-50"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80 p-0 bg-white dark:bg-gray-900">
          <SidebarContent />
        </SheetContent>
      </Sheet>
    </>
  );
}