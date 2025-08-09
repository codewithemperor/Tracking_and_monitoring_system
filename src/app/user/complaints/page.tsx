"use client";

import { useState, useEffect } from "react";
import { UserDashboardLayout } from "@/components/layout/user-dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, Search, Eye, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

interface Complaint {
  id: string;
  title: string;
  category: string;
  status: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  parcel?: {
    trackingId: string;
    origin: string;
    destination: string;
  };
  responses?: Array<{
    id: string;
    message: string;
    createdAt: string;
    staff?: {
      name: string;
      role: string;
    };
  }>;
}

const statusColors = {
  OPEN: "bg-yellow-100 text-yellow-800",
  IN_PROGRESS: "bg-blue-100 text-blue-800",
  RESOLVED: "bg-green-100 text-green-800",
  ESCALATED: "bg-red-100 text-red-800",
};

const statusLabels = {
  OPEN: "Open",
  IN_PROGRESS: "In Progress",
  RESOLVED: "Resolved",
  ESCALATED: "Escalated",
};

const categoryLabels = {
  DELIVERY_DELAY: "Delivery Delay",
  DAMAGED_PARCEL: "Damaged Parcel",
  LOST_PARCEL: "Lost Parcel",
  WRONG_DELIVERY: "Wrong Delivery",
  CUSTOMER_SERVICE: "Customer Service",
  BILLING: "Billing",
  TRACKING_ISSUE: "Tracking Issue",
  OTHER: "Other",
};

export default function UserComplaints() {
  const { toast } = useToast();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const token = localStorage.getItem('user_token');
      if (!token) {
        window.location.href = '/user/login';
        return;
      }

      const response = await fetch('/api/complaints', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setComplaints(data.complaints || []);
      } else {
        toast({
          title: "Error",
          description: "Failed to load complaints",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching complaints:', error);
      toast({
        title: "Error",
        description: "An error occurred while loading complaints",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredComplaints = complaints.filter(complaint => {
    const matchesSearch = complaint.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         complaint.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (complaint.parcel?.trackingId && complaint.parcel.trackingId.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === "all" || complaint.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <UserDashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nipost-blue mx-auto mb-4"></div>
            <p>Loading complaints...</p>
          </div>
        </div>
      </UserDashboardLayout>
    );
  }

  return (
    <UserDashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">My Complaints</h1>
            <p className="text-muted-foreground">
              View and track the status of your complaints
            </p>
          </div>
          <Link href="/user/complaint/add">
            <Button className="bg-nipost-blue hover:bg-nipost-dark-blue">
              <Plus className="h-4 w-4 mr-2" />
              File New Complaint
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Complaints</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{complaints.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Open</CardTitle>
              <AlertCircle className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {complaints.filter(c => c.status === 'OPEN').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <AlertCircle className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {complaints.filter(c => c.status === 'IN_PROGRESS').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resolved</CardTitle>
              <AlertCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {complaints.filter(c => c.status === 'RESOLVED').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filter Complaints</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search complaints..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="OPEN">Open</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="RESOLVED">Resolved</SelectItem>
                  <SelectItem value="ESCALATED">Escalated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Complaints Table */}
        <Card>
          <CardHeader>
            <CardTitle>Complaint History</CardTitle>
            <CardDescription>
              View all your complaints and their current status
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredComplaints.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No complaints found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || statusFilter !== "all" 
                    ? "No complaints match your filters. Try adjusting your search criteria."
                    : "You haven't filed any complaints yet."
                  }
                </p>
                <Link href="/user/complaint/add">
                  <Button className="bg-nipost-blue hover:bg-nipost-dark-blue">
                    <Plus className="h-4 w-4 mr-2" />
                    File Your First Complaint
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Tracking ID</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredComplaints
                      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                      .map((complaint) => (
                        <TableRow key={complaint.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{complaint.title}</div>
                              <div className="text-sm text-muted-foreground truncate max-w-xs">
                                {complaint.description}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {categoryLabels[complaint.category as keyof typeof categoryLabels] || complaint.category}
                          </TableCell>
                          <TableCell>
                            {complaint.parcel?.trackingId ? (
                              <Badge variant="outline">#{complaint.parcel.trackingId}</Badge>
                            ) : (
                              <span className="text-muted-foreground">N/A</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge className={statusColors[complaint.status as keyof typeof statusColors]}>
                              {statusLabels[complaint.status as keyof typeof statusLabels] || complaint.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(complaint.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Link href={`/user/complaint/${complaint.id}`}>
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </UserDashboardLayout>
  );
}