"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserDashboardLayout } from "@/components/layout/user-dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Truck, FileText, TrendingUp } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface Delivery {
  id: string;
  trackingId: string;
  status: string;
  origin: string;
  destination: string;
  createdAt: string;
}

export default function UserDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    inTransit: 0,
    delivered: 0,
    complaints: 0
  });
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('user_data');
    const token = localStorage.getItem('user_token');
    
    if (!userData || !token) {
      router.push('/user/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);

    // Fetch user's deliveries from API
    const fetchDeliveries = async () => {
      try {
        const response = await fetch('/api/parcels', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setDeliveries(data.parcels || []);
          
          // Calculate stats
          const total = data.parcels?.length || 0;
          const inTransit = data.parcels?.filter((d: Delivery) => d.status === 'IN_TRANSIT').length || 0;
          const delivered = data.parcels?.filter((d: Delivery) => d.status === 'DELIVERED').length || 0;
          
          setStats({
            total,
            inTransit,
            delivered,
            complaints: complaints.length
          });
        }
      } catch (error) {
        console.error('Error fetching deliveries:', error);
      } finally {
        setLoading(false);
      }
    };

    // Fetch user's complaints from API
    const fetchComplaints = async () => {
      try {
        const response = await fetch('/api/complaints', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setComplaints(data.complaints || []);
          
          setStats(prev => ({
            ...prev,
            complaints: data.complaints?.length || 0
          }));
        }
      } catch (error) {
        console.error('Error fetching complaints:', error);
      }
    };

    fetchDeliveries();
    fetchComplaints();
  }, [router]);

  if (!user) {
    return <div>Loading...</div>;
  }

  if (loading) {
    return (
      <UserDashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nipost-blue mx-auto mb-4"></div>
            <p>Loading your dashboard...</p>
          </div>
        </div>
      </UserDashboardLayout>
    );
  }

  return (
    <UserDashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Welcome back, {user.name}</h1>
          <p className="text-muted-foreground">
            Here's your delivery overview
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Deliveries</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                {stats.total > 0 ? '+2 from last month' : 'No deliveries yet'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Transit</CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.inTransit}</div>
              <p className="text-xs text-muted-foreground">
                Currently in transit
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Delivered</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.delivered}</div>
              <p className="text-xs text-muted-foreground">
                Successfully delivered
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Complaints</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.complaints}</div>
              <p className="text-xs text-muted-foreground">
                Pending resolution
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Recent Deliveries</CardTitle>
              <CardDescription>
                Your latest package deliveries
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {deliveries.slice(0, 3).map((delivery) => (
                <div key={delivery.id} className="flex items-center space-x-4 rounded-md border p-4">
                  <Package className={`h-8 w-8 ${
                    delivery.status === 'DELIVERED' ? 'text-green-600' : 
                    delivery.status === 'IN_TRANSIT' ? 'text-nipost-blue' : 'text-gray-400'
                  }`} />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      Package #{delivery.trackingId}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {delivery.origin} → {delivery.destination} • {delivery.status.replace('_', ' ')}
                    </p>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(delivery.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
              {deliveries.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No deliveries found sha
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common tasks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/track">
                <button className="w-full text-left p-3 rounded-lg border hover:bg-accent transition-colors">
                  <div className="font-medium">Track New Package</div>
                  <div className="text-sm text-muted-foreground">
                    Enter tracking number
                  </div>
                </button>
              </Link>
              <Link href="/user/complaint/add">
                <button className="w-full text-left p-3 rounded-lg border hover:bg-accent transition-colors">
                  <div className="font-medium">File Complaint</div>
                  <div className="text-sm text-muted-foreground">
                    Report an issue
                  </div>
                </button>
              </Link>
              <Link href="/user/delivery">
                <button className="w-full text-left p-3 rounded-lg border hover:bg-accent transition-colors">
                  <div className="font-medium">View All Deliveries</div>
                  <div className="text-sm text-muted-foreground">
                    See complete history
                  </div>
                </button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </UserDashboardLayout>
  );
}