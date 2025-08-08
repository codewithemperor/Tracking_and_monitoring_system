"use client";

import { useState, useEffect } from "react";
import { StaffDashboardLayout } from "@/components/layout/staff-dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Package, MapPin, Weight, AlertCircle, Users, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: string;
  name: string;
  email: string;
}

const deliveryStatuses = [
  { value: "PENDING", label: "Pending" },
  { value: "DISPATCHED", label: "Dispatched" },
  { value: "IN_TRANSIT", label: "In Transit" },
  { value: "OUT_FOR_DELIVERY", label: "Out for Delivery" },
  { value: "DELIVERED", label: "Delivered" },
];

export default function StaffAddDelivery() {
  const router = useRouter();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    trackingNumber: '',
    userId: "",
    origin: "",
    destination: "",
    weight: "",
    value: "",
    description: "",
    status: "PENDING",
    estimatedDelivery: "",
  });
  const [users, setUsers] = useState<User[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (userSearch) {
      const filtered = users.filter(
        (user) =>
          user.name.toLowerCase().includes(userSearch.toLowerCase()) ||
          user.email.toLowerCase().includes(userSearch.toLowerCase()) ||
          user.id.toLowerCase().includes(userSearch.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [userSearch, users]);

  const loadUsers = async () => {
    try {
      setUsersLoading(true);
      const token = localStorage.getItem('staff_token');
      const response = await fetch('/api/admin/customers', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
        setFilteredUsers(data.users || []);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      });
    } finally {
      setUsersLoading(false);
    }
  };

  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
    setFormData(prev => ({ ...prev, userId: user.id }));
    setUserSearch(user.name);
    setShowUserDropdown(false);
  };

  const generateTrackingNumber = () => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `NP${timestamp}${random}`.toUpperCase();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Generate tracking number if not provided
      const trackingNumber = formData.trackingNumber || generateTrackingNumber();
      
      const token = localStorage.getItem('staff_token');
      const response = await fetch("/api/parcels", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          trackingNumber,
          weight: formData.weight ? parseFloat(formData.weight) : undefined,
          value: formData.value ? parseFloat(formData.value) : undefined,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Success",
          description: "Delivery created successfully!",
        });
        setTimeout(() => {
          router.push('/staff/delivery');
        }, 1500);
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to create delivery",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error creating delivery:", error);
      toast({
        title: "Error",
        description: "Failed to create delivery. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <StaffDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Link href="/staff/delivery">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Deliveries
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Add New Delivery</h1>
            <p className="text-muted-foreground">
              Create a new delivery record
            </p>
          </div>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Delivery Information</CardTitle>
            <CardDescription>
              Enter the delivery details below
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="trackingNumber">Tracking Number</Label>
                  <div className="flex gap-2">
                    <Input
                      id="trackingNumber"
                      value={formData.trackingNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, trackingNumber: e.target.value }))}
                      placeholder="Auto-generated or enter manually"
                      required
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setFormData(prev => ({ ...prev, trackingNumber: generateTrackingNumber() }))}
                    >
                      Generate
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="user">Customer</Label>
                  <div className="relative">
                    <div className="flex items-center border rounded-md">
                      <Users className="h-4 w-4 ml-3 text-muted-foreground" />
                      <Input
                        id="user"
                        type="text"
                        placeholder="Search for customer..."
                        value={userSearch}
                        onChange={(e) => {
                          setUserSearch(e.target.value);
                          setShowUserDropdown(true);
                        }}
                        onFocus={() => setShowUserDropdown(true)}
                        className="border-0 focus-visible:ring-0"
                      />
                    </div>
                    {showUserDropdown && filteredUsers.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                        {usersLoading ? (
                          <div className="p-3 text-center">
                            <Loader2 className="h-4 w-4 mx-auto animate-spin" />
                            <p className="text-sm text-muted-foreground mt-1">Loading users...</p>
                          </div>
                        ) : (
                          filteredUsers.map((user) => (
                            <div
                              key={user.id}
                              className="px-3 py-2 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                              onClick={() => handleUserSelect(user)}
                            >
                              <div className="font-medium">{user.name}</div>
                              <div className="text-sm text-muted-foreground">{user.email}</div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {deliveryStatuses.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="origin">Origin</Label>
                  <div className="flex items-center border rounded-md">
                    <MapPin className="h-4 w-4 ml-3 text-muted-foreground" />
                    <Input
                      id="origin"
                      type="text"
                      placeholder="Enter origin address"
                      value={formData.origin}
                      onChange={(e) => setFormData(prev => ({ ...prev, origin: e.target.value }))}
                      className="border-0 focus-visible:ring-0"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="destination">Destination</Label>
                  <div className="flex items-center border rounded-md">
                    <MapPin className="h-4 w-4 ml-3 text-muted-foreground" />
                    <Input
                      id="destination"
                      type="text"
                      placeholder="Enter destination address"
                      value={formData.destination}
                      onChange={(e) => setFormData(prev => ({ ...prev, destination: e.target.value }))}
                      className="border-0 focus-visible:ring-0"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <div className="flex items-center border rounded-md">
                    <Weight className="h-4 w-4 ml-3 text-muted-foreground" />
                    <Input
                      id="weight"
                      type="number"
                      step="0.1"
                      placeholder="Enter weight"
                      value={formData.weight}
                      onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                      className="border-0 focus-visible:ring-0"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="value">Value (₦)</Label>
                  <Input
                    id="value"
                    type="number"
                    placeholder="Enter value"
                    value={formData.value}
                    onChange={(e) => setFormData(prev => ({ ...prev, value: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estimatedDelivery">Estimated Delivery</Label>
                  <Input
                    id="estimatedDelivery"
                    type="datetime-local"
                    value={formData.estimatedDelivery}
                    onChange={(e) => setFormData(prev => ({ ...prev, estimatedDelivery: e.target.value }))}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Enter delivery description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Link href="/staff/delivery">
                  <Button variant="outline">Cancel</Button>
                </Link>
                <Button 
                  type="submit" 
                  disabled={loading || !formData.userId || !formData.origin || !formData.destination || !formData.trackingNumber}
                  className="bg-nipost-blue hover:bg-nipost-dark-blue"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Package className="h-4 w-4 mr-2" />
                      Create Delivery
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </StaffDashboardLayout>
  );
}