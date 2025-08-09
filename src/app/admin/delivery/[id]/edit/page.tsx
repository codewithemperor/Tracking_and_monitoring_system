"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { AdminDashboardLayout } from "@/components/layout/admin-dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";

interface Delivery {
  id: string;
  trackingId: string;
  origin: string;
  destination: string;
  status: string;
  currentLocation?: string;
  weight?: number;
  value?: number;
  description?: string;
  estimatedDelivery?: string;
  actualDelivery?: string;
  userId: string;
  staffId?: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function AdminDeliveryEditPage() {
  const params = useParams();
  const router = useRouter();
  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [staff, setStaff] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDelivery();
    loadUsers();
    loadStaff();
  }, [params.id]);

  const loadDelivery = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`/api/track/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setDelivery(data.parcel);
      } else {
        setError('Failed to load delivery details');
      }
    } catch (error) {
      console.error('Error loading delivery:', error);
      setError('Failed to load delivery details');
    }
  };

  const loadUsers = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch('/api/admin/customers', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadStaff = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch('/api/admin/staff', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStaff(data.users || []);
      }
    } catch (error) {
      console.error('Error loading staff:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!delivery) return;

    try {
      setSaving(true);
      setError("");
      
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`/api/parcels/${delivery.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          origin: delivery.origin,
          destination: delivery.destination,
          status: delivery.status,
          currentLocation: delivery.currentLocation,
          weight: delivery.weight,
          value: delivery.value,
          description: delivery.description,
          estimatedDelivery: delivery.estimatedDelivery,
          actualDelivery: delivery.actualDelivery,
          userId: delivery.userId,
          staffId: delivery.staffId
        })
      });

      if (response.ok) {
        router.push(`/admin/delivery/${delivery.trackingId}`);
      } else {
        setError('Failed to update delivery');
      }
    } catch (error) {
      console.error('Error updating delivery:', error);
      setError('Failed to update delivery');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminDashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-12 w-12 mx-auto mb-4 text-nipost-blue animate-spin" />
            <p className="text-muted-foreground">Loading delivery details...</p>
          </div>
        </div>
      </AdminDashboardLayout>
    );
  }

  if (error || !delivery) {
    return (
      <AdminDashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error || 'Delivery not found'}</p>
            <Button onClick={() => router.push('/admin/delivery')} className="bg-nipost-blue hover:bg-nipost-dark-blue">
              Back to Deliveries
            </Button>
          </div>
        </div>
      </AdminDashboardLayout>
    );
  }

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href={`/admin/delivery/${delivery.trackingId}`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Details
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Edit Delivery</h1>
              <p className="text-muted-foreground">
                Tracking ID: {delivery.trackingId}
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Delivery Information</CardTitle>
            <CardDescription>
              Update the delivery details below
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="origin">Origin</Label>
                <Input
                  id="origin"
                  value={delivery.origin}
                  onChange={(e) => setDelivery({...delivery, origin: e.target.value})}
                  placeholder="Enter origin address"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="destination">Destination</Label>
                <Input
                  id="destination"
                  value={delivery.destination}
                  onChange={(e) => setDelivery({...delivery, destination: e.target.value})}
                  placeholder="Enter destination address"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={delivery.status}
                  onValueChange={(value) => setDelivery({...delivery, status: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
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
                <Label htmlFor="currentLocation">Current Location</Label>
                <Input
                  id="currentLocation"
                  value={delivery.currentLocation || ''}
                  onChange={(e) => setDelivery({...delivery, currentLocation: e.target.value})}
                  placeholder="Enter current location"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  value={delivery.weight || ''}
                  onChange={(e) => setDelivery({...delivery, weight: parseFloat(e.target.value) || undefined})}
                  placeholder="Enter weight"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="value">Value (₦)</Label>
                <Input
                  id="value"
                  type="number"
                  step="0.01"
                  value={delivery.value || ''}
                  onChange={(e) => setDelivery({...delivery, value: parseFloat(e.target.value) || undefined})}
                  placeholder="Enter value"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="estimatedDelivery">Estimated Delivery</Label>
                <Input
                  id="estimatedDelivery"
                  type="datetime-local"
                  value={delivery.estimatedDelivery ? new Date(delivery.estimatedDelivery).toISOString().slice(0, 16) : ''}
                  onChange={(e) => setDelivery({...delivery, estimatedDelivery: e.target.value || undefined})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="actualDelivery">Actual Delivery</Label>
                <Input
                  id="actualDelivery"
                  type="datetime-local"
                  value={delivery.actualDelivery ? new Date(delivery.actualDelivery).toISOString().slice(0, 16) : ''}
                  onChange={(e) => setDelivery({...delivery, actualDelivery: e.target.value || undefined})}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={delivery.description || ''}
                  onChange={(e) => setDelivery({...delivery, description: e.target.value})}
                  placeholder="Enter delivery description"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="userId">Customer</Label>
                <Select
                  value={delivery.userId}
                  onValueChange={(value) => setDelivery({...delivery, userId: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name} ({user.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="staffId">Assigned Staff</Label>
                <Select
                  value={delivery.staffId || ''}
                  onValueChange={(value) => setDelivery({...delivery, staffId: value || undefined})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select staff (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Unassigned</SelectItem>
                    {staff.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name} ({user.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Link href={`/admin/delivery/${delivery.trackingId}`}>
                <Button variant="outline">Cancel</Button>
              </Link>
              <Button 
                onClick={handleSave} 
                disabled={saving}
                className="bg-nipost-blue hover:bg-nipost-dark-blue"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminDashboardLayout>
  );
}