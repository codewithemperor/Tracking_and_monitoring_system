"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminDashboardLayout } from "@/components/layout/admin-dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Package, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
}

interface Staff {
  id: string;
  name: string;
  email: string;
}

export default function AdminAddDeliveryPage() {
  const [formData, setFormData] = useState({
    trackingNumber: '',
    userId: '',
    staffId: '',
    origin: '',
    destination: '',
    weight: '',
    value: '',
    description: '',
    status: 'PENDING',
    estimatedDelivery: ''
  });
  
  const [users, setUsers] = useState<User[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('admin_data');
    const token = localStorage.getItem('admin_token');
    
    if (!userData || !token) {
      router.push('/admin/login');
      return;
    }

    const user = JSON.parse(userData);
    if (user.role !== 'ADMIN') {
      router.push('/admin/login');
      return;
    }

    loadUsers();
    loadStaff();
  }, [router]);

  useEffect(() => {
    // Filter users based on search term
    if (userSearchTerm) {
      const filtered = users.filter(user => 
        user.name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
        user.id.toLowerCase().includes(userSearchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users.slice(0, 10)); // Show first 10 users by default
    }
  }, [users, userSearchTerm]);

  const loadUsers = async () => {
    try {
      // Get customers only
      const token = localStorage.getItem('admin_token');
      const response = await fetch('/api/admin/customers', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
        setFilteredUsers(data.users?.slice(0, 10) || []);
      } else {
        // Fallback to localStorage
        const mockUsers = [
          { id: '1', name: 'John Doe', email: 'john@example.com', phone: '08012345678' },
          { id: '2', name: 'Jane Smith', email: 'jane@example.com', phone: '08023456789' },
          { id: '3', name: 'Bob Johnson', email: 'bob@example.com', phone: '08034567890' },
        ];
        setUsers(mockUsers);
        setFilteredUsers(mockUsers);
      }
    } catch (error) {
      console.error('Error loading customers:', error);
      // Fallback to mock data
      const mockUsers = [
        { id: '1', name: 'John Doe', email: 'john@example.com', phone: '08012345678' },
        { id: '2', name: 'Jane Smith', email: 'jane@example.com', phone: '08023456789' },
        { id: '3', name: 'Bob Johnson', email: 'bob@example.com', phone: '08034567890' },
      ];
      setUsers(mockUsers);
      setFilteredUsers(mockUsers);
    }
  };

  const loadStaff = async () => {
    try {
      // Get staff and admin users, then filter to only show staff
      const token = localStorage.getItem('admin_token');
      const response = await fetch('/api/admin/staff', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        // Filter to only show STAFF users (not ADMIN)
        const staffOnly = data.users?.filter((user: any) => user.role === 'STAFF') || [];
        setStaff(staffOnly);
      } else {
        // Fallback to localStorage
        const mockStaff = [
          { id: '2', name: 'Staff User', email: 'staff@nipost.com' },
        ];
        setStaff(mockStaff);
      }
    } catch (error) {
      console.error('Error loading staff:', error);
      // Fallback to mock data
      const mockStaff = [
        { id: '2', name: 'Staff User', email: 'staff@nipost.com' },
      ];
      setStaff(mockStaff);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch('/api/parcels', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          weight: parseFloat(formData.weight),
          value: parseFloat(formData.value),
          userId: formData.userId,
          staffId: formData.staffId || null
        })
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Delivery created successfully!",
        });
        router.push('/admin/delivery');
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.error || 'Failed to create delivery',
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error creating delivery:', error);
      toast({
        title: "Error",
        description: "Failed to create delivery. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateTrackingNumber = () => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `NP${timestamp}${random}`.toUpperCase();
  };

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/admin/delivery')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Deliveries
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Add New Delivery</h1>
            <p className="text-muted-foreground">
              Create a new parcel delivery
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Delivery Information
            </CardTitle>
            <CardDescription>
              Enter the delivery details below
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="trackingNumber">Tracking Number</Label>
                  <div className="flex gap-2">
                    <Input
                      id="trackingNumber"
                      value={formData.trackingNumber}
                      onChange={(e) => setFormData({...formData, trackingNumber: e.target.value})}
                      placeholder="Auto-generated or enter manually"
                      required
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setFormData({...formData, trackingNumber: generateTrackingNumber()})}
                    >
                      Generate
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="IN_TRANSIT">In Transit</SelectItem>
                      <SelectItem value="OUT_FOR_DELIVERY">Out for Delivery</SelectItem>
                      <SelectItem value="DELIVERED">Delivered</SelectItem>
                      <SelectItem value="FAILED">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="origin">Origin</Label>
                  <Input
                    id="origin"
                    value={formData.origin}
                    onChange={(e) => setFormData({...formData, origin: e.target.value})}
                    placeholder="e.g., Lagos"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="destination">Destination</Label>
                  <Input
                    id="destination"
                    value={formData.destination}
                    onChange={(e) => setFormData({...formData, destination: e.target.value})}
                    placeholder="e.g., Abuja"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    value={formData.weight}
                    onChange={(e) => setFormData({...formData, weight: e.target.value})}
                    placeholder="e.g., 2.5"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="value">Value (₦)</Label>
                  <Input
                    id="value"
                    type="number"
                    value={formData.value}
                    onChange={(e) => setFormData({...formData, value: e.target.value})}
                    placeholder="e.g., 5000"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estimatedDelivery">Estimated Delivery</Label>
                  <Input
                    id="estimatedDelivery"
                    type="date"
                    value={formData.estimatedDelivery}
                    onChange={(e) => setFormData({...formData, estimatedDelivery: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="staff">Assigned Staff</Label>
                  <Select value={formData.staffId} onValueChange={(value) => setFormData({...formData, staffId: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select staff (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Unassigned</SelectItem>
                      {staff.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name} ({s.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="userSearch">Search Customer</Label>
                <Input
                  id="userSearch"
                  value={userSearchTerm}
                  onChange={(e) => setUserSearchTerm(e.target.value)}
                  placeholder="Search by name, email, or ID..."
                />
              </div>

              <div className="space-y-2">
                <Label>Select Customer</Label>
                <div className="max-h-48 overflow-y-auto border rounded-md p-2 space-y-1">
                  {filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      className={`p-2 rounded cursor-pointer hover:bg-accent ${
                        formData.userId === user.id ? 'bg-accent' : ''
                      }`}
                      onClick={() => setFormData({...formData, userId: user.id})}
                    >
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                      <div className="text-xs text-muted-foreground">{user.phone}</div>
                    </div>
                  ))}
                  {filteredUsers.length === 0 && (
                    <div className="text-center py-4 text-muted-foreground">
                      No customers found
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Package description..."
                  rows={3}
                />
              </div>

              <div className="flex gap-4">
                <Button 
                  type="submit" 
                  disabled={loading || !formData.userId}
                  className="bg-nipost-blue hover:bg-nipost-blue/90"
                >
                  {loading ? 'Creating...' : 'Create Delivery'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => router.push('/admin/delivery')}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AdminDashboardLayout>
  );
}