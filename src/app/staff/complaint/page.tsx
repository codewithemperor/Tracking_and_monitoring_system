"use client";

import { StaffDashboardLayout } from "@/components/layout/staff-dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, AlertTriangle, Clock, CheckCircle, XCircle, Search, Eye } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const complaints = [
  {
    id: "CMP001",
    trackingId: "NP001234",
    userId: "USR001",
    userName: "John Doe",
    title: "Delivery Delay",
    description: "Package has been in transit for 5 days without update",
    category: "DELIVERY_DELAY",
    priority: "HIGH",
    status: "OPEN",
    createdAt: "2024-01-10",
    escalatedAt: null,
    resolvedAt: null,
  },
  {
    id: "CMP002",
    trackingId: "NP001235",
    userId: "USR002",
    userName: "Jane Smith",
    title: "Damaged Package",
    description: "Package arrived with visible damage to contents",
    category: "DAMAGED_PARCEL",
    priority: "MEDIUM",
    status: "IN_PROGRESS",
    createdAt: "2024-01-09",
    escalatedAt: null,
    resolvedAt: null,
  },
  {
    id: "CMP003",
    trackingId: "NP001236",
    userId: "USR003",
    userName: "Mike Johnson",
    title: "Wrong Delivery",
    description: "Received package meant for another address",
    category: "WRONG_DELIVERY",
    priority: "HIGH",
    status: "ESCALATED",
    createdAt: "2024-01-08",
    escalatedAt: "2024-01-09",
    resolvedAt: null,
  },
  {
    id: "CMP004",
    trackingId: null,
    userId: "USR004",
    userName: "Sarah Williams",
    title: "Customer Service Issue",
    description: "Unable to reach customer service regarding package status",
    category: "CUSTOMER_SERVICE",
    priority: "MEDIUM",
    status: "RESOLVED",
    createdAt: "2024-01-07",
    escalatedAt: null,
    resolvedAt: "2024-01-08",
  },
  {
    id: "CMP005",
    trackingId: "NP001237",
    userId: "USR005",
    userName: "David Brown",
    title: "Lost Package",
    description: "Package tracking shows delivered but not received",
    category: "LOST_PARCEL",
    priority: "URGENT",
    status: "OPEN",
    createdAt: "2024-01-06",
    escalatedAt: null,
    resolvedAt: null,
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "OPEN":
      return "bg-red-100 text-red-800";
    case "IN_PROGRESS":
      return "bg-yellow-100 text-yellow-800";
    case "RESOLVED":
      return "bg-green-100 text-green-800";
    case "REJECTED":
      return "bg-gray-100 text-gray-800";
    case "ESCALATED":
      return "bg-purple-100 text-purple-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "OPEN":
      return <AlertTriangle className="h-4 w-4" />;
    case "IN_PROGRESS":
      return <Clock className="h-4 w-4" />;
    case "RESOLVED":
      return <CheckCircle className="h-4 w-4" />;
    case "REJECTED":
      return <XCircle className="h-4 w-4" />;
    case "ESCALATED":
      return <AlertTriangle className="h-4 w-4" />;
    default:
      return <FileText className="h-4 w-4" />;
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "LOW":
      return "bg-gray-100 text-gray-800";
    case "MEDIUM":
      return "bg-blue-100 text-blue-800";
    case "HIGH":
      return "bg-orange-100 text-orange-800";
    case "URGENT":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getCategoryLabel = (category: string) => {
  switch (category) {
    case "DELIVERY_DELAY":
      return "Delivery Delay";
    case "DAMAGED_PARCEL":
      return "Damaged Parcel";
    case "LOST_PARCEL":
      return "Lost Parcel";
    case "WRONG_DELIVERY":
      return "Wrong Delivery";
    case "CUSTOMER_SERVICE":
      return "Customer Service";
    case "BILLING":
      return "Billing";
    case "TRACKING_ISSUE":
      return "Tracking Issue";
    case "OTHER":
      return "Other";
    default:
      return category;
  }
};

export default function StaffComplaints() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredComplaints, setFilteredComplaints] = useState(complaints);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    const filtered = complaints.filter(
      (complaint) =>
        complaint.id.toLowerCase().includes(term.toLowerCase()) ||
        complaint.userName.toLowerCase().includes(term.toLowerCase()) ||
        complaint.title.toLowerCase().includes(term.toLowerCase()) ||
        (complaint.trackingId && complaint.trackingId.toLowerCase().includes(term.toLowerCase()))
    );
    setFilteredComplaints(filtered);
  };

  return (
    <StaffDashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Customer Complaints</h1>
          <p className="text-muted-foreground">
            Manage and respond to customer complaints
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search by complaint ID, customer name, title, or tracking ID..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Stats Summary */}
        <div className="grid gap-4 md:grid-cols-5">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{complaints.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Open</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {complaints.filter(c => c.status === "OPEN").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {complaints.filter(c => c.status === "IN_PROGRESS").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Escalated</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {complaints.filter(c => c.status === "ESCALATED").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {complaints.filter(c => c.status === "RESOLVED").length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Complaints Table */}
        <Card>
          <CardHeader>
            <CardTitle>Complaint List</CardTitle>
            <CardDescription>
              All customer complaints requiring attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tracking ID</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredComplaints.map((complaint) => (
                    <TableRow key={complaint.id}>
                      <TableCell className="font-medium">
                        {complaint.id}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{complaint.userName}</div>
                          <div className="text-sm text-muted-foreground">
                            {complaint.userId}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate">
                          {complaint.title}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {getCategoryLabel(complaint.category)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getPriorityColor(complaint.priority)}>
                          {complaint.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(complaint.status)}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(complaint.status)}
                            {complaint.status}
                          </div>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {complaint.trackingId || (
                          <span className="text-muted-foreground">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(complaint.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Link href={`/staff/complaint/${complaint.id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredComplaints.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Complaints Found</h3>
                <p className="text-muted-foreground text-center mb-4">
                  No complaints match your search criteria.
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