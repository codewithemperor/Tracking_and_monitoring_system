"use client";

import { StaffDashboardLayout } from "@/components/layout/staff-dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Package, Truck, MapPin, Clock, Search, Edit } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const allDeliveries = [
  {
    id: "NP001234",
    trackingId: "NP001234",
    userId: "USR001",
    userName: "John Doe",
    origin: "Lagos",
    destination: "Abuja",
    status: "IN_TRANSIT",
    currentLocation: "Lokoja",
    estimatedDelivery: "2024-01-15",
    weight: "2.5 kg",
    description: "Electronics package",
    createdAt: "2024-01-12",
  },
  {
    id: "NP001235",
    trackingId: "NP001235",
    userId: "USR002",
    userName: "Jane Smith",
    origin: "Port Harcourt",
    destination: "Kano",
    status: "DISPATCHED",
    currentLocation: "Port Harcourt",
    estimatedDelivery: "2024-01-18",
    weight: "1.8 kg",
    description: "Documents",
    createdAt: "2024-01-13",
  },
  {
    id: "NP001236",
    trackingId: "NP001236",
    userId: "USR003",
    userName: "Mike Johnson",
    origin: "Abuja",
    destination: "Enugu",
    status: "OUT_FOR_DELIVERY",
    currentLocation: "Enugu",
    estimatedDelivery: "2024-01-14",
    weight: "3.2 kg",
    description: "Clothing items",
    createdAt: "2024-01-11",
  },
  {
    id: "NP001233",
    trackingId: "NP001233",
    userId: "USR004",
    userName: "Sarah Williams",
    origin: "Port Harcourt",
    destination: "Kano",
    status: "DELIVERED",
    currentLocation: "Kano",
    estimatedDelivery: "2024-01-10",
    actualDelivery: "2024-01-10",
    weight: "1.8 kg",
    description: "Documents",
    createdAt: "2024-01-08",
  },
  {
    id: "NP001232",
    trackingId: "NP001232",
    userId: "USR005",
    userName: "David Brown",
    origin: "Lagos",
    destination: "Ibadan",
    status: "DELIVERED",
    currentLocation: "Ibadan",
    estimatedDelivery: "2024-01-05",
    actualDelivery: "2024-01-05",
    weight: "5.0 kg",
    description: "Books",
    createdAt: "2024-01-03",
  },
];

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
  const [filteredDeliveries, setFilteredDeliveries] = useState(allDeliveries);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    const filtered = allDeliveries.filter(
      (delivery) =>
        delivery.trackingId.toLowerCase().includes(term.toLowerCase()) ||
        delivery.userName.toLowerCase().includes(term.toLowerCase()) ||
        delivery.description.toLowerCase().includes(term.toLowerCase()) ||
        delivery.origin.toLowerCase().includes(term.toLowerCase()) ||
        delivery.destination.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredDeliveries(filtered);
  };

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
                          <div className="font-medium">{delivery.userName}</div>
                          <div className="text-sm text-muted-foreground">
                            {delivery.userId}
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
                      <TableCell>{delivery.currentLocation}</TableCell>
                      <TableCell>{delivery.estimatedDelivery}</TableCell>
                      <TableCell>{delivery.weight}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Link href={`/staff/delivery/${delivery.trackingId}`}>
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