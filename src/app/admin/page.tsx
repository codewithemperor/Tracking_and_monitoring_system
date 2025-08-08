"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminDashboardLayout } from "@/components/layout/admin-dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Truck, FileText, Users, UserCheck, TrendingUp, AlertTriangle, Loader2 } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface DashboardStats {
  totalParcels: number;
  totalStaff: number;
  totalCustomers: number;
  inTransitParcels: number;
  totalComplaints: number;
  pendingComplaints: number;
  deliveredParcels: number;
  pendingParcels: number;
}

export default function AdminDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalParcels: 0,
    totalStaff: 0,
    totalCustomers: 0,
    inTransitParcels: 0,
    totalComplaints: 0,
    pendingComplaints: 0,
    deliveredParcels: 0,
    pendingParcels: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    // Check if admin is logged in
    const adminToken = localStorage.getItem('admin_token');
    const adminData = localStorage.getItem('admin_data');
    
    if (!adminToken || !adminData) {
      router.push('/admin/login');
      return;
    }

    const parsedUser = JSON.parse(adminData);
    if (parsedUser.role !== 'ADMIN') {
      router.push('/admin/login');
      return;
    }

    setUser(parsedUser);
    loadDashboardStats();
  }, [router]);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      setError("");
      
      const token = localStorage.getItem('admin_token');
      
      // Load users stats
      const usersResponse = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Load parcels stats
      const parcelsResponse = await fetch('/api/parcels', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Load complaints stats
      const complaintsResponse = await fetch('/api/complaints', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (usersResponse.ok && parcelsResponse.ok && complaintsResponse.ok) {
        const usersData = await usersResponse.json();
        const parcelsData = await parcelsResponse.json();
        const complaintsData = await complaintsResponse.json();
        
        const users = usersData.users || [];
        const parcels = parcelsData.parcels || [];
        const complaints = complaintsData.complaints || [];
        
        setStats({
          totalParcels: parcels.length,
          totalStaff: users.filter(u => u.role === 'STAFF').length,
          totalCustomers: users.filter(u => u.role === 'CUSTOMER').length,
          inTransitParcels: parcels.filter(p => p.status === 'IN_TRANSIT').length,
          totalComplaints: complaints.length,
          pendingComplaints: complaints.filter(c => c.status === 'OPEN').length,
          deliveredParcels: parcels.filter(p => p.status === 'DELIVERED').length,
          pendingParcels: parcels.filter(p => p.status === 'PENDING').length,
        });
      } else {
        setError('Failed to load dashboard data');
      }
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminDashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-12 w-12 mx-auto mb-4 text-nipost-blue animate-spin" />
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </AdminDashboardLayout>
    );
  }

  if (error) {
    return (
      <AdminDashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <button 
              onClick={loadDashboardStats}
              className="bg-nipost-blue hover:bg-nipost-dark-blue text-white px-4 py-2 rounded-md"
            >
              Retry
            </button>
          </div>
        </div>
      </AdminDashboardLayout>
    );
  }

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Welcome back, {user.name}</h1>
          <p className="text-muted-foreground">
            Here's your administration overview
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Parcels</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalParcels}</div>
              <p className="text-xs text-muted-foreground">
                All time parcels
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Staff</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalStaff}</div>
              <p className="text-xs text-muted-foreground">
                Active staff members
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Customers</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCustomers}</div>
              <p className="text-xs text-muted-foreground">
                Registered customers
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Transit</CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.inTransitParcels}</div>
              <p className="text-xs text-muted-foreground">
                Currently in transit
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Complaints</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalComplaints}</div>
              <p className="text-xs text-muted-foreground">
                {stats.pendingComplaints} pending resolution
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Alerts</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.pendingParcels}</div>
              <p className="text-xs text-muted-foreground">
                Require attention
              </p>
            </CardContent>
          </Card>
        </div>

        {/* System Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                System Overview
              </CardTitle>
              <CardDescription>
                Key performance indicators and system health
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Delivery Success Rate</span>
                      <span className="font-medium text-green-600">96.8%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Average Delivery Time</span>
                      <span className="font-medium">2.3 days</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Customer Satisfaction</span>
                      <span className="font-medium text-green-600">4.7/5</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">System Uptime</span>
                      <span className="font-medium text-green-600">99.9%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Active Users</span>
                      <span className="font-medium">1,247</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Response Time</span>
                      <span className="font-medium">0.8s</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
              <CardDescription>
                Latest system activities
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm">
                <div className="font-medium">New staff registered</div>
                <div className="text-muted-foreground">2 hours ago</div>
              </div>
              <div className="text-sm">
                <div className="font-medium">System backup completed</div>
                <div className="text-muted-foreground">5 hours ago</div>
              </div>
              <div className="text-sm">
                <div className="font-medium">Complaint escalated</div>
                <div className="text-muted-foreground">1 day ago</div>
              </div>
              <div className="text-sm">
                <div className="font-medium">Performance report generated</div>
                <div className="text-muted-foreground">2 days ago</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity & Quick Actions */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Recent Parcels</CardTitle>
              <CardDescription>
                Latest parcel registrations and updates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4 rounded-md border p-4">
                <Package className="h-8 w-8 text-nipost-blue" />
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    Package #NP001234
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Lagos → Abuja • Status: In Transit
                  </p>
                </div>
                <div className="text-sm text-muted-foreground">
                  2 hours ago
                </div>
              </div>
              <div className="flex items-center space-x-4 rounded-md border p-4">
                <Package className="h-8 w-8 text-green-600" />
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    Package #NP001235
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Port Harcourt → Kano • Status: Delivered
                  </p>
                </div>
                <div className="text-sm text-muted-foreground">
                  5 hours ago
                </div>
              </div>
              <div className="flex items-center space-x-4 rounded-md border p-4">
                <Package className="h-8 w-8 text-purple-600" />
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    Package #NP001236
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Abuja → Enugu • Status: Out for Delivery
                  </p>
                </div>
                <div className="text-sm text-muted-foreground">
                  1 day ago
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Admin Actions</CardTitle>
              <CardDescription>
                Quick administrative tasks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <button className="w-full text-left p-3 rounded-lg border hover:bg-accent transition-colors">
                <div className="font-medium">Manage Staff</div>
                <div className="text-sm text-muted-foreground">
                  Add, edit, or remove staff accounts
                </div>
              </button>
              <button className="w-full text-left p-3 rounded-lg border hover:bg-accent transition-colors">
                <div className="font-medium">Manage Users</div>
                <div className="text-sm text-muted-foreground">
                  View and manage customer accounts
                </div>
              </button>
              <button className="w-full text-left p-3 rounded-lg border hover:bg-accent transition-colors">
                <div className="font-medium">System Reports</div>
                <div className="text-sm text-muted-foreground">
                  Generate performance reports
                </div>
              </button>
              <button className="w-full text-left p-3 rounded-lg border hover:bg-accent transition-colors">
                <div className="font-medium">System Settings</div>
                <div className="text-sm text-muted-foreground">
                  Configure system parameters
                </div>
              </button>
            </CardContent>
          </Card>
        </div>

        {/* Critical Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Critical Alerts
            </CardTitle>
            <CardDescription>
              Issues requiring immediate attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
                <div className="font-medium text-red-800">System Overload</div>
                <div className="text-sm text-red-600">
                  High parcel volume detected in Lagos hub
                </div>
                <div className="text-xs text-red-500 mt-1">2 hours ago</div>
              </div>
              <div className="p-4 border border-orange-200 bg-orange-50 rounded-lg">
                <div className="font-medium text-orange-800">Delayed Deliveries</div>
                <div className="text-sm text-orange-600">
                  12 parcels delayed beyond SLA
                </div>
                <div className="text-xs text-orange-500 mt-1">4 hours ago</div>
              </div>
              <div className="p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
                <div className="font-medium text-yellow-800">Complaint Spike</div>
                <div className="text-sm text-yellow-600">
                  40% increase in complaints this week
                </div>
                <div className="text-xs text-yellow-500 mt-1">1 day ago</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminDashboardLayout>
  );
}