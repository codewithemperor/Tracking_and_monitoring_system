"use client";

import { useEffect, useState } from "react";
import { UserDashboardLayout } from "@/components/layout/user-dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, Truck, MapPin, Clock } from "lucide-react";
import Link from "next/link";

interface Delivery {
  id: string;
  trackingId: string;
  origin: string;
  destination: string;
  status: string;
  currentLocation?: string;
  estimatedDelivery?: string;
  weight?: string;
  description?: string;
  createdAt: string;
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
      return "bg-green-100 text-green-800";
    case "DELIVERED":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case "PENDING":
      return "Pending";
    case "DISPATCHED":
      return "Dispatched";
    case "IN_TRANSIT":
      return "In Transit";
    case "OUT_FOR_DELIVERY":
      return "Out for Delivery";
    case "DELIVERED":
      return "Delivered";
    default:
      return status;
  }
};

export default function UserOngoingDeliveries() {
  const [ongoingDeliveries, setOngoingDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOngoingDeliveries = async () => {
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
          const allDeliveries = data.parcels || [];
          
          // Filter for ongoing deliveries (not delivered)
          const ongoing = allDeliveries.filter(
            (delivery: Delivery) => delivery.status !== 'DELIVERED' && delivery.status !== 'CANCELLED'
          );
          
          setOngoingDeliveries(ongoing);
        }
      } catch (error) {
        console.error('Error fetching ongoing deliveries:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOngoingDeliveries();
  }, []);

  if (loading) {
    return (
      <UserDashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nipost-blue mx-auto mb-4"></div>
            <p>Loading your ongoing deliveries...</p>
          </div>
        </div>
      </UserDashboardLayout>
    );
  }

  return (
    <UserDashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Ongoing Deliveries</h1>
          <p className="text-muted-foreground">
            Track your packages that are currently in transit
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {ongoingDeliveries.map((delivery) => (
            <Card key={delivery.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Package #{delivery.trackingId}</CardTitle>
                  <Badge className={getStatusColor(delivery.status)}>
                    {getStatusText(delivery.status)}
                  </Badge>
                </div>
                <CardDescription>
                  {delivery.origin} → {delivery.destination}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Package className="h-4 w-4" />
                    <span>{delivery.description || 'Package'}</span>
                  </div>
                  {delivery.currentLocation && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4" />
                      <span>Current: {delivery.currentLocation}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4" />
                    <span>
                      {delivery.estimatedDelivery
                        ? `Est. Delivery: ${new Date(delivery.estimatedDelivery).toLocaleDateString()}`
                        : 'No delivery date set'
                      }
                    </span>
                  </div>
                  {delivery.weight && (
                    <div className="flex items-center gap-2 text-sm">
                      <Truck className="h-4 w-4" />
                      <span>Weight: {delivery.weight}</span>
                    </div>
                  )}
                </div>
                
                <div className="pt-2">
                  <Link href={`/user/delivery/${delivery.trackingId}`}>
                    <Button className="w-full bg-nipost-blue hover:bg-nipost-dark-blue">
                      View Details
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {ongoingDeliveries.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Ongoing Deliveries sha</h3>
              <p className="text-muted-foreground text-center mb-4">
                You don't have any packages currently in transit.
              </p>
              <Link href="/user/delivery">
                <Button className="bg-nipost-blue hover:bg-nipost-dark-blue">
                  View All Deliveries
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </UserDashboardLayout>
  );
}