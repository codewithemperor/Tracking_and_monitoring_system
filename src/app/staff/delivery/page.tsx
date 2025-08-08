"use client";

import { useState, useEffect } from "react";
import { StaffDashboardLayout } from "@/components/layout/staff-dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Package, Truck, MapPin, Clock, Search, Edit, Loader2 } from "lucide-react";
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
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  staff?: {
    id: string;
    name: string;
    email: string;
  };
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

export default function StaffDeliveries() {
  const [searchTerm, setSearchTerm] = useState("");
  const [allDeliveries, setAllDeliveries] = useState<Delivery[]>([]);
  const [filteredDeliveries, setFilteredDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDeliveries();
  }, []);

  useEffect(() => {
    if (allDeliveries.length > 0) {
      const filtered = allDeliveries.filter(
        (delivery) =>
          delivery.trackingId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          delivery.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (delivery.description && delivery.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
          delivery.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
          delivery.destination.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredDeliveries(filtered);
    }
  }, [allDeliveries, searchTerm]);

  const loadDeliveries = async () => {
    try {
      setLoading(true);
      setError("");
      
      const token = localStorage.getItem('staff_token');
      const response = await fetch('/api/parcels', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAllDeliveries(data.parcels || []);
        setFilteredDeliveries(data.parcels || []);
      } else {
        setError('Failed to load deliveries');
      }
    } catch (error) {
      console.error('Error fetching deliveries:', error);
      setError('Failed to load deliveries');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  if (loading) {
    return (
      <StaffDashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-12 w-12 mx-auto mb-4 text-nipost-blue animate-spin" />
            <p>Loading deliveries...</p>
          </div>
        </div>
      </StaffDashboardLayout>
    );
  }

  if (error) {
    return (
      <StaffDashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={loadDeliveries} className="bg-nipost-blue hover:bg-nipost-dark-blue">
              Retry
            </Button>
          </div>
        </div>
      </StaffDashboardLayout>
    );
  }

  return (
    <StaffDashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">All Deliveries</h1>
            <p className="text-muted-foreground">
              Manage and track all package deliveries
            </p>
          </div>
          <Link href="/staff/delivery/add">
            <Button className="bg-nipost-blue hover:bg-nipost-dark-blue">
              Add New Delivery
            </Button>
          </Link>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search by tracking ID, customer name, description, origin, or destination..."
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

        {/* Deliveries Table */}
        <Card>
          <CardHeader>
            <CardTitle>Delivery List</CardTitle>
            <CardDescription>
              Complete list of all deliveries in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tracking ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Route</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Current Location</TableHead>
                    <TableHead>Est. Delivery</TableHead>
                    <TableHead>Weight</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDeliveries.map((delivery) => (
                    <TableRow key={delivery.id}>
                      <TableCell className="font-medium">
                        {delivery.trackingId}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{delivery.user.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {delivery.user.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {delivery.origin} → {delivery.destination}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(delivery.status)}>
                          {getStatusText(delivery.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>{delivery.currentLocation || 'N/A'}</TableCell>
                      <TableCell>
                        {delivery.estimatedDelivery 
                          ? new Date(delivery.estimatedDelivery).toLocaleDateString()
                          : 'N/A'
                        }
                      </TableCell>
                      <TableCell>{delivery.weight ? `${delivery.weight} kg` : 'N/A'}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Link href={`/staff/delivery/${delivery.id}`}>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredDeliveries.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12">
                <Package className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Deliveries Found</h3>
                <p className="text-muted-foreground text-center mb-4">
                  No deliveries match your search criteria.
                </p>
                <Button 
                  onClick={() => handleSearch("")}
                  className="bg-nipost-blue hover:bg-nipost-dark-blue"
                >
                  Clear Search
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </StaffDashboardLayout>
  );
}