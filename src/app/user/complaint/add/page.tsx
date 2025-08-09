"use client";

import { useState, useEffect } from "react";
import { UserDashboardLayout } from "@/components/layout/user-dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileText, Package, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Delivery {
  id: string;
  trackingId: string;
  origin: string;
  destination: string;
  status: string;
  description?: string;
  createdAt: string;
}

const complaintCategories = [
  { value: "DELIVERY_DELAY", label: "Delivery Delay" },
  { value: "DAMAGED_PARCEL", label: "Damaged Parcel" },
  { value: "LOST_PARCEL", label: "Lost Parcel" },
  { value: "WRONG_DELIVERY", label: "Wrong Delivery" },
  { value: "CUSTOMER_SERVICE", label: "Customer Service" },
  { value: "BILLING", label: "Billing" },
  { value: "TRACKING_ISSUE", label: "Tracking Issue" },
  { value: "OTHER", label: "Other" },
];

const deliveryComplaintCategories = [
  "DELIVERY_DELAY",
  "DAMAGED_PARCEL", 
  "LOST_PARCEL",
  "WRONG_DELIVERY",
  "TRACKING_ISSUE"
];

export default function UserComplaint() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    category: "",
    trackingId: "",
    title: "",
    description: "",
  });
  const [showDeliverySelect, setShowDeliverySelect] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userDeliveries, setUserDeliveries] = useState<Delivery[]>([]);
  const [loadingDeliveries, setLoadingDeliveries] = useState(true);

  useEffect(() => {
    const fetchUserDeliveries = async () => {
      try {
        const token = localStorage.getItem('user_token');
        if (!token) {
          window.location.href = '/user/login';
          return;
        }

        const response = await fetch('/api/parcels', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setUserDeliveries(data.parcels || []);
        }
      } catch (error) {
        console.error('Error fetching user deliveries:', error);
        toast({
          title: "Error",
          description: "Failed to load your deliveries",
          variant: "destructive",
        });
      } finally {
        setLoadingDeliveries(false);
      }
    };

    fetchUserDeliveries();
  }, []);

  useEffect(() => {
    if (formData.category && deliveryComplaintCategories.includes(formData.category)) {
      setShowDeliverySelect(true);
    } else {
      setShowDeliverySelect(false);
      setFormData(prev => ({ ...prev, trackingId: "" }));
    }
  }, [formData.category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('user_token');
      if (!token) {
        window.location.href = '/user/login';
        return;
      }

      const response = await fetch("/api/complaints", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Success",
          description: "Complaint submitted successfully!",
        });
        setFormData({
          category: "",
          trackingId: "",
          title: "",
          description: "",
        });
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to submit complaint",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "An error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (loadingDeliveries) {
    return (
      <UserDashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nipost-blue mx-auto mb-4"></div>
            <p>Loading your deliveries...</p>
          </div>
        </div>
      </UserDashboardLayout>
    );
  }

  return (
    <UserDashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">File a Complaint</h1>
          <p className="text-muted-foreground">
            Submit a complaint about your delivery experience
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Complaint Details
                </CardTitle>
                <CardDescription>
                  Please provide as much detail as possible about your complaint
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Complaint Category</Label>
                    <Select value={formData.category} onValueChange={(value) => handleChange("category", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select complaint category" />
                      </SelectTrigger>
                      <SelectContent>
                        {complaintCategories.map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {showDeliverySelect && (
                    <div className="space-y-2">
                      <Label htmlFor="trackingId">Select Delivery</Label>
                      <Select value={formData.trackingId} onValueChange={(value) => handleChange("trackingId", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select the delivery this complaint is about" />
                        </SelectTrigger>
                        <SelectContent>
                          {userDeliveries.length === 0 ? (
                            <SelectItem value="" disabled>
                              No deliveries found sha
                            </SelectItem>
                          ) : (
                            userDeliveries
                              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                              .map((delivery) => (
                                <SelectItem key={delivery.trackingId} value={delivery.trackingId}>
                                  #{delivery.trackingId} - {delivery.description || 'Package'} ({delivery.origin} → {delivery.destination})
                                </SelectItem>
                              ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="title">Complaint Title</Label>
                    <Input
                      id="title"
                      placeholder="Brief description of the issue"
                      value={formData.title}
                      onChange={(e) => handleChange("title", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Detailed Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Please provide detailed information about your complaint..."
                      value={formData.description}
                      onChange={(e) => handleChange("description", e.target.value)}
                      className="min-h-[120px]"
                      required
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-nipost-blue hover:bg-nipost-dark-blue"
                    disabled={loading}
                  >
                    {loading ? "Submitting..." : "Submit Complaint"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Your Recent Deliveries
                </CardTitle>
                <CardDescription>
                  Select from your recent deliveries if applicable
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {userDeliveries.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    No deliveries found sha
                  </div>
                ) : (
                  userDeliveries
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .slice(0, 5)
                    .map((delivery) => (
                      <div key={delivery.trackingId} className="p-3 border rounded-lg">
                        <div className="font-medium text-sm">#{delivery.trackingId}</div>
                        <div className="text-xs text-muted-foreground">{delivery.description || 'Package'}</div>
                        <div className="text-xs text-muted-foreground">
                          {delivery.origin} → {delivery.destination}
                        </div>
                      </div>
                    ))
                )}
              </CardContent>
            </Card>

            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-sm">Complaint Guidelines</CardTitle>
              </CardHeader>
              <CardContent className="text-xs space-y-2">
                <p>• Be specific and provide accurate information</p>
                <p>• Include tracking numbers when applicable</p>
                <p>• Describe the issue in detail</p>
                <p>• We will respond within 24-48 hours</p>
                <p>• You can track your complaint status in your dashboard</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </UserDashboardLayout>
  );
}