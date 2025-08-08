"use client";

import { useEffect, useState } from "react";
import { UserDashboardLayout } from "@/components/layout/user-dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Package, Truck, MapPin, Clock, Search } from "lucide-react";
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
  actualDelivery?: string;
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

export default function UserAllDeliveries() {
  const [searchTerm, setSearchTerm] = useState("");
  const [allDeliveries, setAllDeliveries] = useState<Delivery[]>([]);
  const [filteredDeliveries, setFilteredDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDeliveries = async () => {
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
          const deliveries = data.parcels || [];
          setAllDeliveries(deliveries);
          setFilteredDeliveries(deliveries);
        }
      } catch (error) {
        console.error('Error fetching deliveries:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDeliveries();
  }, []);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    const filtered = allDeliveries.filter(
      (delivery) =>
        delivery.trackingId.toLowerCase().includes(term.toLowerCase()) ||
        (delivery.description && delivery.description.toLowerCase().includes(term.toLowerCase())) ||
        delivery.origin.toLowerCase().includes(term.toLowerCase()) ||
        delivery.destination.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredDeliveries(filtered);
  };

  if (loading) {
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
          <h1 className="text-2xl font-bold tracking-tight">All Deliveries</h1>
          <p className="text-muted-foreground">
            View and track all your package deliveries
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search by tracking ID, description, origin, or destination..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Stats Summary */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{allDeliveries.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">In Transit</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {allDeliveries.filter(d => d.status === "IN_TRANSIT").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Delivered</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {allDeliveries.filter(d => d.status === "DELIVERED").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {allDeliveries.filter(d => d.status === "PENDING").length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Deliveries Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredDeliveries.map((delivery) => (
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
                      {delivery.status === "DELIVERED" && delivery.actualDelivery
                        ? `Delivered: ${new Date(delivery.actualDelivery).toLocaleDateString()}`
                        : delivery.estimatedDelivery
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

        {filteredDeliveries.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Deliveries Found sha</h3>
              <p className="text-muted-foreground text-center mb-4">
                {allDeliveries.length === 0 
                  ? "You don't have any deliveries yet." 
                  : "No deliveries match your search criteria."
                }
              </p>
              {searchTerm && (
                <Button 
                  onClick={() => handleSearch("")}
                  className="bg-nipost-blue hover:bg-nipost-dark-blue"
                >
                  Clear Search
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </UserDashboardLayout>
  );
}