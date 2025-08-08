"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { AdminDashboardLayout } from "@/components/layout/admin-dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Package, MapPin, Truck, Clock, User, Edit, Loader2 } from "lucide-react";
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
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    address?: string;
  };
  staff?: {
    id: string;
    name: string;
    email: string;
  };
  statusHistory?: Array<{
    id: string;
    status: string;
    location: string;
    description?: string;
    timestamp: string;
    updatedBy: string;
  }>;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800';
    case 'IN_TRANSIT':
      return 'bg-blue-100 text-blue-800';
    case 'OUT_FOR_DELIVERY':
      return 'bg-purple-100 text-purple-800';
    case 'DELIVERED':
      return 'bg-green-100 text-green-800';
    case 'FAILED':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'PENDING':
      return 'Pending';
    case 'IN_TRANSIT':
      return 'In Transit';
    case 'OUT_FOR_DELIVERY':
      return 'Out for Delivery';
    case 'DELIVERED':
      return 'Delivered';
    case 'FAILED':
      return 'Failed';
    default:
      return status;
  }
};

export default function AdminDeliveryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDelivery();
  }, [params.id]);

  const loadDelivery = async () => {
    try {
      setLoading(true);
      setError("");
      
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`/api/parcels/${params.id}`, {
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
      console.error('Error fetching delivery:', error);
      setError('Failed to load delivery details');
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
            <p>Loading delivery details...</p>
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
            <Button onClick={() => router.back()} className="bg-nipost-blue hover:bg-nipost-dark-blue">
              Go Back
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
            <Button variant="ghost" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Delivery Details</h1>
              <p className="text-muted-foreground">
                Tracking ID: {delivery.trackingId}
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Link href={`/admin/delivery/${delivery.id}/edit`}>
              <Button>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </Link>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Delivery Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Delivery Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Tracking ID</label>
                  <p className="font-mono text-sm">{delivery.trackingId}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <Badge className={getStatusColor(delivery.status)}>
                    {getStatusText(delivery.status)}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Weight</label>
                  <p>{delivery.weight ? `${delivery.weight} kg` : 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Value</label>
                  <p>₦{delivery.value ? delivery.value.toLocaleString() : '0'}</p>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Description</label>
                <p className="text-sm">{delivery.description || 'No description provided'}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Route</label>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4" />
                  <span>{delivery.origin}</span>
                  <span>→</span>
                  <span>{delivery.destination}</span>
                </div>
              </div>

              {delivery.currentLocation && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Current Location</label>
                  <div className="flex items-center gap-2 text-sm">
                    <Truck className="h-4 w-4" />
                    <span>{delivery.currentLocation}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Name</label>
                  <p>{delivery.user.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p className="text-sm">{delivery.user.email}</p>
                </div>
              </div>
              
              {delivery.user.phone && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Phone</label>
                  <p className="text-sm">{delivery.user.phone}</p>
                </div>
              )}
              
              {delivery.user.address && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Address</label>
                  <p className="text-sm">{delivery.user.address}</p>
                </div>
              )}

              {delivery.staff && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Assigned Staff</label>
                  <p className="text-sm">{delivery.staff.name} ({delivery.staff.email})</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Delivery Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {delivery.statusHistory && delivery.statusHistory.length > 0 ? (
                  delivery.statusHistory.map((history, index) => (
                    <div key={history.id} className="flex items-start space-x-4">
                      <div className={`w-3 h-3 rounded-full mt-1 ${
                        index === delivery.statusHistory!.length - 1 ? 'bg-nipost-blue' : 'bg-gray-300'
                      }`}></div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <Badge className={getStatusColor(history.status)}>
                            {getStatusText(history.status)}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(history.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {history.location}
                        </p>
                        {history.description && (
                          <p className="text-sm mt-1">{history.description}</p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">No status history available</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminDashboardLayout>
  );
}