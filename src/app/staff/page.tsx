"use client";

import { useEffect, useState } from "react";
import { StaffDashboardLayout } from "@/components/layout/staff-dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Truck, FileText, Users, TrendingUp } from "lucide-react";

interface Stats {
  totalParcels: number;
  inTransit: number;
  complaints: number;
  activeUsers: number;
}

interface Parcel {
  id: string;
  trackingId: string;
  origin: string;
  destination: string;
  status: string;
  createdAt: string;
}

interface Complaint {
  id: string;
  title: string;
  trackingId?: string;
  priority: string;
  status: string;
  createdAt: string;
}

export default function StaffDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalParcels: 0,
    inTransit: 0,
    complaints: 0,
    activeUsers: 0
  });
  const [recentParcels, setRecentParcels] = useState<Parcel[]>([]);
  const [recentComplaints, setRecentComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('staff_token');
        if (!token) {
          window.location.href = '/staff/login';
          return;
        }

        // Fetch parcels data
        const parcelsResponse = await fetch('/api/staff/parcels', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (parcelsResponse.ok) {
          const parcelsData = await parcelsResponse.json();
          const parcels = parcelsData.parcels || [];
          
          // Calculate stats
          const totalParcels = parcels.length;
          const inTransit = parcels.filter((p: Parcel) => p.status === 'IN_TRANSIT').length;
          
          setStats(prev => ({
            ...prev,
            totalParcels,
            inTransit
          }));
          
          // Get recent parcels (last 3)
          const recent = parcels
            .sort((a: Parcel, b: Parcel) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 3);
          setRecentParcels(recent);
        }

        // Fetch complaints data
        const complaintsResponse = await fetch('/api/complaints', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (complaintsResponse.ok) {
          const complaintsData = await complaintsResponse.json();
          const complaints = complaintsData.complaints || [];
          
          setStats(prev => ({
            ...prev,
            complaints: complaints.length
          }));
          
          // Get recent complaints (last 3)
          const recent = complaints
            .sort((a: Complaint, b: Complaint) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 3);
          setRecentComplaints(recent);
        }

        // For active users, we'll use a mock number for now since we don't have a specific endpoint
        setStats(prev => ({
          ...prev,
          activeUsers: 1234 // This would come from a users endpoint in a real implementation
        }));

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <StaffDashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nipost-blue mx-auto mb-4"></div>
            <p>Loading dashboard...</p>
          </div>
        </div>
      </StaffDashboardLayout>
    );
  }

  return (
    <StaffDashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Staff Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to the NIPOST staff management portal
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Parcels</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalParcels}</div>
              <p className="text-xs text-muted-foreground">
                {stats.totalParcels > 0 ? '+12 from last week' : 'No parcels yet'}
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

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeUsers}</div>
              <p className="text-xs text-muted-foreground">
                +45 new this month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Recent Parcels</CardTitle>
              <CardDescription>
                Latest parcel registrations and updates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentParcels.length > 0 ? (
                recentParcels.map((parcel) => (
                  <div key={parcel.id} className="flex items-center space-x-4 rounded-md border p-4">
                    <Package className="h-8 w-8 text-nipost-blue" />
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        Package #{parcel.trackingId}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {parcel.origin} → {parcel.destination} • Status: {parcel.status.replace('_', ' ')}
                      </p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(parcel.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No parcels found sha
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common staff tasks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <button className="w-full text-left p-3 rounded-lg border hover:bg-accent transition-colors">
                <div className="font-medium">Add New Parcel</div>
                <div className="text-sm text-muted-foreground">
                  Register a new package
                </div>
              </button>
              <button className="w-full text-left p-3 rounded-lg border hover:bg-accent transition-colors">
                <div className="font-medium">View Complaints</div>
                <div className="text-sm text-muted-foreground">
                  Manage customer complaints
                </div>
              </button>
              <button className="w-full text-left p-3 rounded-lg border hover:bg-accent transition-colors">
                <div className="font-medium">Track Parcel</div>
                <div className="text-sm text-muted-foreground">
                  Check parcel status
                </div>
              </button>
            </CardContent>
          </Card>
        </div>

        {/* Performance Overview */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Weekly Performance
              </CardTitle>
              <CardDescription>
                Parcel processing statistics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Parcels Processed</span>
                  <span className="font-medium">{stats.totalParcels}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Delivered on Time</span>
                  <span className="font-medium text-green-600">
                    {stats.totalParcels > 0 ? Math.round((stats.totalParcels - stats.inTransit) / stats.totalParcels * 100) : 0}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Delayed Deliveries</span>
                  <span className="font-medium text-yellow-600">
                    {stats.totalParcels > 0 ? Math.round(stats.inTransit / stats.totalParcels * 100) : 0}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Customer Satisfaction</span>
                  <span className="font-medium text-green-600">4.8/5</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Complaints</CardTitle>
              <CardDescription>
                Latest customer complaints requiring attention
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentComplaints.length > 0 ? (
                recentComplaints.map((complaint) => (
                  <div key={complaint.id} className="p-3 border rounded-lg">
                    <div className="font-medium text-sm">
                      {complaint.title} {complaint.trackingId ? `#${complaint.trackingId}` : ''}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Priority: {complaint.priority} • Status: {complaint.status.replace('_', ' ')}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  No complaints found sha
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </StaffDashboardLayout>
  );
}