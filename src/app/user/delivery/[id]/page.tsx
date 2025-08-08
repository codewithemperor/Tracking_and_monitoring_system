"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { UserDashboardLayout } from "@/components/layout/user-dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 
  Package, 
  MapPin, 
  Weight, 
  DollarSign, 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  ArrowLeft,
  User,
  Truck,
  Home,
  FileText
} from "lucide-react";
import Link from "next/link";

interface Delivery {
  id: string;
  trackingId: string;
  origin: string;
  destination: string;
  weight?: number;
  value?: number;
  description?: string;
  status: string;
  estimatedDelivery?: string;
  createdAt: string;
  updatedAt: string;
  staff?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  statusHistory: Array<{
    id: string;
    status: string;
    location: string;
    description: string;
    timestamp: string;
    user?: {
      name: string;
    };
  }>;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "PENDING":
      return "bg-yellow-100 text-yellow-800";
    case "DISPATCHED":
      return "bg-blue-100 text-blue-800";
    case "IN_TRANSIT":
      return "bg-purple-100 text-purple-800";
    case "OUT_FOR_DELIVERY":
      return "bg-orange-100 text-orange-800";
    case "DELIVERED":
      return "bg-green-100 text-green-800";
    case "FAILED":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "PENDING":
      return <Clock className="h-4 w-4" />;
    case "DISPATCHED":
    case "IN_TRANSIT":
      return <Truck className="h-4 w-4" />;
    case "OUT_FOR_DELIVERY":
      return <Home className="h-4 w-4" />;
    case "DELIVERED":
      return <CheckCircle className="h-4 w-4" />;
    case "FAILED":
      return <AlertTriangle className="h-4 w-4" />;
    default:
      return <Package className="h-4 w-4" />;
  }
};

export default function UserDeliveryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const deliveryId = params.id as string;
  
  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (deliveryId) {
      loadDelivery();
    }
  }, [deliveryId]);

  const loadDelivery = async () => {
    try {
      setLoading(true);
      setError("");
      
      const token = localStorage.getItem('user_token');
      const response = await fetch(`/api/parcels/${deliveryId}`, {
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
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <UserDashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nipost-blue mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading delivery details...</p>
          </div>
        </div>
      </UserDashboardLayout>
    );
  }

  if (error && !delivery) {
    return (
      <UserDashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={loadDelivery} className="bg-nipost-blue hover:bg-nipost-dark-blue">
              Retry
            </Button>
          </div>
        </div>
      </UserDashboardLayout>
    );
  }

  if (!delivery) {
    return (
      <UserDashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-muted-foreground">Delivery not found</p>
          </div>
        </div>
      </UserDashboardLayout>
    );
  }

  return (
    <UserDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/user/delivery">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Deliveries
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold tracking-tight">Delivery Details</h1>
            <p className="text-muted-foreground">
              Track your delivery status and information
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Overview */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      Delivery Information
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(delivery.status)}>
                        {getStatusIcon(delivery.status)}
                        <span className="ml-1">{delivery.status.replace('_', ' ')}</span>
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Tracking ID</p>
                    <p className="font-mono text-sm">{delivery.trackingId}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Created</p>
                    <p className="text-sm">{formatDateTime(delivery.createdAt)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Origin</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{delivery.origin}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Home className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Destination</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{delivery.destination}</p>
                  </div>
                </div>

                {delivery.description && (
                  <div>
                    <p className="text-sm font-medium mb-2">Description</p>
                    <p className="text-sm text-muted-foreground">{delivery.description}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  {delivery.weight && (
                    <div className="flex items-center gap-2">
                      <Weight className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Weight: {delivery.weight}kg</span>
                    </div>
                  )}
                  {delivery.value && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Value: ₦{delivery.value}</span>
                    </div>
                  )}
                </div>

                {delivery.estimatedDelivery && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      Estimated Delivery: {formatDate(delivery.estimatedDelivery)}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Status History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
              Status History
                </CardTitle>
                <CardDescription>
                  Track the progress of your delivery
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {delivery.statusHistory.map((history, index) => (
                    <div key={history.id} className="flex gap-3">
                      <div className="flex-shrink-0">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          index === 0 ? 'bg-nipost-blue text-white' : 'bg-muted text-muted-foreground'
                        }`}>
                          {getStatusIcon(history.status)}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{history.status.replace('_', ' ')}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatDateTime(history.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{history.description}</p>
                        <p className="text-xs text-muted-foreground">Location: {history.location}</p>
                        {history.user && (
                          <p className="text-xs text-muted-foreground">
                            Updated by: {history.user.name}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Assigned Staff */}
            {delivery.staff && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Assigned Staff
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>
                        {delivery.staff.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{delivery.staff.name}</p>
                      <p className="text-sm text-muted-foreground">{delivery.staff.email}</p>
                      {delivery.staff.phone && (
                        <p className="text-sm text-muted-foreground">{delivery.staff.phone}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Delivery Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Delivery Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium">Delivery ID</p>
                  <p className="text-sm text-muted-foreground font-mono">
                    {delivery.id}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Last Updated</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDateTime(delivery.updatedAt)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Current Status</p>
                  <Badge className={getStatusColor(delivery.status)}>
                    {delivery.status.replace('_', ' ')}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  asChild
                >
                  <Link href={`/user/complaint?trackingId=${delivery.trackingId}`}>
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    File Complaint
                  </Link>
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigator.clipboard.writeText(delivery.trackingId)}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Copy Tracking ID
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </UserDashboardLayout>
  );
}