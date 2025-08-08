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
import { Package, MapPin, Weight, AlertCircle, Users } from "lucide-react";

const users = [
  { id: "USR001", name: "John Doe", email: "john@example.com" },
  { id: "USR002", name: "Jane Smith", email: "jane@example.com" },
  { id: "USR003", name: "Mike Johnson", email: "mike@example.com" },
  { id: "USR004", name: "Sarah Williams", email: "sarah@example.com" },
  { id: "USR005", name: "David Brown", email: "david@example.com" },
  { id: "USR006", name: "Emma Davis", email: "emma@example.com" },
  { id: "USR007", name: "James Wilson", email: "james@example.com" },
  { id: "USR008", name: "Lisa Anderson", email: "lisa@example.com" },
];

const deliveryStatuses = [
  { value: "PENDING", label: "Pending" },
  { value: "DISPATCHED", label: "Dispatched" },
  { value: "IN_TRANSIT", label: "In Transit" },
  { value: "OUT_FOR_DELIVERY", label: "Out for Delivery" },
  { value: "DELIVERED", label: "Delivered" },
];

export default function StaffAddDelivery() {
  const [formData, setFormData] = useState({
    userId: "",
    origin: "",
    destination: "",
    weight: "",
    dimensions: "",
    description: "",
    status: "PENDING",
    estimatedDelivery: "",
  });
  const [userSearch, setUserSearch] = useState("");
  const [filteredUsers, setFilteredUsers] = useState(users);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{id: string, name: string, email: string} | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

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
  }, [userSearch]);

  const handleUserSelect = (user: {id: string, name: string, email: string}) => {
    setSelectedUser(user);
    setFormData(prev => ({ ...prev, userId: user.id }));
    setUserSearch(user.name);
    setShowUserDropdown(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/parcels", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("Delivery created successfully!");
        setFormData({
          userId: "",
          origin: "",
          destination: "",
          weight: "",
          dimensions: "",
          description: "",
          status: "PENDING",
          estimatedDelivery: "",
        });
        setSelectedUser(null);
        setUserSearch("");
      } else {
        setError(data.message || "Failed to create delivery");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <StaffDashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Add New Delivery</h1>
          <p className="text-muted-foreground">
            Register a new package delivery in the system
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Delivery Information
                </CardTitle>
                <CardDescription>
                  Enter the details for the new delivery
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  
                  {success && (
                    <Alert className="border-green-200 bg-green-50">
                      <AlertCircle className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-800">{success}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="user">Customer</Label>
                    <div className="relative">
                      <div className="flex items-center border rounded-md">
                        <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                          id="user"
                          placeholder="Search customer by name, email, or ID..."
                          value={userSearch}
                          onChange={(e) => {
                            setUserSearch(e.target.value);
                            setShowUserDropdown(true);
                          }}
                          onFocus={() => setShowUserDropdown(true)}
                          className="pl-10"
                        />
                      </div>
                      
                      {showUserDropdown && (
                        <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-md max-h-60 overflow-y-auto">
                          {filteredUsers.map((user) => (
                            <div
                              key={user.id}
                              className="p-3 hover:bg-accent cursor-pointer border-b last:border-b-0"
                              onClick={() => handleUserSelect(user)}
                            >
                              <div className="font-medium">{user.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {user.email} • ID: {user.id}
                              </div>
                            </div>
                          ))}
                          {filteredUsers.length === 0 && (
                            <div className="p-3 text-muted-foreground text-center">
                              No users found
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="origin">Origin</Label>
                      <div className="flex items-center border rounded-md">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                          id="origin"
                          placeholder="Origin location"
                          value={formData.origin}
                          onChange={(e) => handleChange("origin", e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="destination">Destination</Label>
                      <div className="flex items-center border rounded-md">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                          id="destination"
                          placeholder="Destination location"
                          value={formData.destination}
                          onChange={(e) => handleChange("destination", e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="weight">Weight (kg)</Label>
                      <div className="flex items-center border rounded-md">
                        <Weight className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                          id="weight"
                          type="number"
                          step="0.1"
                          placeholder="Package weight"
                          value={formData.weight}
                          onChange={(e) => handleChange("weight", e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dimensions">Dimensions</Label>
                      <Input
                        id="dimensions"
                        placeholder="e.g., 10x5x3 cm"
                        value={formData.dimensions}
                        onChange={(e) => handleChange("dimensions", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Package description and contents"
                      value={formData.description}
                      onChange={(e) => handleChange("description", e.target.value)}
                      className="min-h-[100px]"
                      required
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="status">Initial Status</Label>
                      <Select value={formData.status} onValueChange={(value) => handleChange("status", value)}>
                        <SelectTrigger>
                          <SelectValue />
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
                      <Label htmlFor="estimatedDelivery">Estimated Delivery</Label>
                      <Input
                        id="estimatedDelivery"
                        type="date"
                        value={formData.estimatedDelivery}
                        onChange={(e) => handleChange("estimatedDelivery", e.target.value)}
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-nipost-blue hover:bg-nipost-dark-blue"
                    disabled={loading || !selectedUser}
                  >
                    {loading ? "Creating..." : "Create Delivery"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Customer Information
                </CardTitle>
                <CardDescription>
                  Selected customer details
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedUser ? (
                  <div className="space-y-3">
                    <div className="p-3 border rounded-lg">
                      <div className="font-medium">{selectedUser.name}</div>
                      <div className="text-sm text-muted-foreground">{selectedUser.email}</div>
                      <div className="text-xs text-muted-foreground">ID: {selectedUser.id}</div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No customer selected</p>
                    <p className="text-xs">Search and select a customer above</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-sm">Delivery Guidelines</CardTitle>
              </CardHeader>
              <CardContent className="text-xs space-y-2">
                <p>• Verify customer information before creating delivery</p>
                <p>• Enter accurate weight and dimensions</p>
                <p>• Provide detailed package description</p>
                <p>• Set appropriate initial status</p>
                <p>• Include estimated delivery date when possible</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </StaffDashboardLayout>
  );
}