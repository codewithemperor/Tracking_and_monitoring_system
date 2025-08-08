"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { StaffDashboardLayout } from "@/components/layout/staff-dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 
  FileText, 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  XCircle, 
  ArrowLeft, 
  Send,
  User,
  Calendar,
  MapPin,
  Package
} from "lucide-react";
import Link from "next/link";

interface Complaint {
  id: string;
  trackingId?: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    address?: string;
  };
  parcel?: {
    id: string;
    trackingId: string;
    origin: string;
    destination: string;
    status: string;
    weight?: number;
    value?: number;
  };
  responses: Array<{
    id: string;
    message: string;
    createdAt: string;
    staff: {
      id: string;
      name: string;
      email: string;
      role: string;
    };
  }>;
}

interface NewResponse {
  message: string;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "OPEN":
      return "bg-yellow-100 text-yellow-800";
    case "IN_PROGRESS":
      return "bg-blue-100 text-blue-800";
    case "RESOLVED":
      return "bg-green-100 text-green-800";
    case "REJECTED":
      return "bg-red-100 text-red-800";
    case "ESCALATED":
      return "bg-purple-100 text-purple-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "LOW":
      return "bg-gray-100 text-gray-800";
    case "MEDIUM":
      return "bg-yellow-100 text-yellow-800";
    case "HIGH":
      return "bg-orange-100 text-orange-800";
    case "URGENT":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getCategoryIcon = (category: string) => {
  switch (category) {
    case "DELIVERY_DELAY":
      return <Clock className="h-5 w-5" />;
    case "DAMAGED_PARCEL":
      return <AlertTriangle className="h-5 w-5" />;
    case "LOST_PARCEL":
      return <XCircle className="h-5 w-5" />;
    default:
      return <FileText className="h-5 w-5" />;
  }
};

export default function StaffComplaintDetailPage() {
  const params = useParams();
  const router = useRouter();
  const complaintId = params.id as string;
  
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [newResponse, setNewResponse] = useState<NewResponse>({ message: "" });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    if (complaintId) {
      loadComplaint();
    }
  }, [complaintId]);

  const loadComplaint = async () => {
    try {
      setLoading(true);
      setError("");
      
      const token = localStorage.getItem('staff_token');
      const response = await fetch(`/api/complaints/${complaintId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setComplaint(data.complaint);
      } else {
        setError('Failed to load complaint details');
      }
    } catch (error) {
      console.error('Error loading complaint:', error);
      setError('Failed to load complaint details');
    } finally {
      setLoading(false);
    }
  };

  const handleResponseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResponse.message.trim()) return;

    try {
      setSubmitting(true);
      
      const token = localStorage.getItem('staff_token');
      const response = await fetch(`/api/complaints/${complaintId}/responses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: newResponse.message
        })
      });
      
      if (response.ok) {
        setNewResponse({ message: "" });
        loadComplaint(); // Reload to show the new response
      } else {
        setError('Failed to submit response');
      }
    } catch (error) {
      console.error('Error submitting response:', error);
      setError('Failed to submit response');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    try {
      setUpdatingStatus(true);
      
      const token = localStorage.getItem('staff_token');
      const response = await fetch(`/api/complaints/${complaintId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: newStatus
        })
      });
      
      if (response.ok) {
        loadComplaint(); // Reload to show updated status
      } else {
        setError('Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      setError('Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <StaffDashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nipost-blue mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading complaint details...</p>
          </div>
        </div>
      </StaffDashboardLayout>
    );
  }

  if (error && !complaint) {
    return (
      <StaffDashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={loadComplaint} className="bg-nipost-blue hover:bg-nipost-dark-blue">
              Retry
            </Button>
          </div>
        </div>
      </StaffDashboardLayout>
    );
  }

  if (!complaint) {
    return (
      <StaffDashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-muted-foreground">Complaint not found</p>
          </div>
        </div>
      </StaffDashboardLayout>
    );
  }

  return (
    <StaffDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/staff/complaint">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Complaints
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold tracking-tight">Complaint Details</h1>
            <p className="text-muted-foreground">
              Review and respond to customer complaint
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Complaint Details */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <CardTitle className="flex items-center gap-2">
                      {getCategoryIcon(complaint.category)}
                      {complaint.title}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge className={getPriorityColor(complaint.priority)}>
                        {complaint.priority}
                      </Badge>
                      <Badge className={getStatusColor(complaint.status)}>
                        {complaint.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select 
                      value={complaint.status} 
                      onValueChange={handleStatusUpdate}
                      disabled={updatingStatus}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="OPEN">Open</SelectItem>
                        <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                        <SelectItem value="RESOLVED">Resolved</SelectItem>
                        <SelectItem value="REJECTED">Rejected</SelectItem>
                        <SelectItem value="ESCALATED">Escalated</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-muted-foreground">{complaint.description}</p>
                </div>
                
                {complaint.parcel && (
                  <div>
                    <h4 className="font-medium mb-2">Related Parcel</h4>
                    <div className="bg-muted p-3 rounded-lg space-y-2">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        <span className="font-medium">Tracking: {complaint.parcel.trackingId}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4" />
                        <span>{complaint.parcel.origin} → {complaint.parcel.destination}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Badge className={getStatusColor(complaint.parcel.status)}>
                          {complaint.parcel.status.replace('_', ' ')}
                        </Badge>
                        {complaint.parcel.weight && (
                          <span>Weight: {complaint.parcel.weight}kg</span>
                        )}
                        {complaint.parcel.value && (
                          <span>Value: ₦{complaint.parcel.value}</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Conversation Thread */}
            <Card>
              <CardHeader>
                <CardTitle>Conversation</CardTitle>
                <CardDescription>
                  Communication thread with the customer
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Original Complaint */}
                <div className="flex gap-3">
                  <Avatar>
                    <AvatarFallback>
                      {complaint.user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{complaint.user.name}</span>
                      <span className="text-sm text-muted-foreground">
                        Customer
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDateTime(complaint.createdAt)}
                      </span>
                    </div>
                    <div className="bg-muted p-3 rounded-lg">
                      <p>{complaint.description}</p>
                    </div>
                  </div>
                </div>

                {/* Staff Responses */}
                {complaint.responses.map((response) => (
                  <div key={response.id} className="flex gap-3">
                    <Avatar>
                      <AvatarFallback>
                        {response.staff.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{response.staff.name}</span>
                        <span className="text-sm text-muted-foreground">
                          {response.staff.role}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDateTime(response.createdAt)}
                        </span>
                      </div>
                      <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-500">
                        <p>{response.message}</p>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Response Form */}
                <form onSubmit={handleResponseSubmit} className="space-y-3">
                  <div>
                    <label htmlFor="response" className="text-sm font-medium">
                      Your Response
                    </label>
                    <Textarea
                      id="response"
                      value={newResponse.message}
                      onChange={(e) => setNewResponse({ message: e.target.value })}
                      placeholder="Type your response to the customer..."
                      rows={3}
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    disabled={submitting || !newResponse.message.trim()}
                    className="bg-nipost-blue hover:bg-nipost-dark-blue"
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Send Response
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Customer Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="font-medium">{complaint.user.name}</p>
                  <p className="text-sm text-muted-foreground">{complaint.user.email}</p>
                </div>
                {complaint.user.phone && (
                  <div>
                    <p className="text-sm font-medium">Phone</p>
                    <p className="text-sm text-muted-foreground">{complaint.user.phone}</p>
                  </div>
                )}
                {complaint.user.address && (
                  <div>
                    <p className="text-sm font-medium">Address</p>
                    <p className="text-sm text-muted-foreground">{complaint.user.address}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Complaint Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Complaint Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium">Complaint ID</p>
                  <p className="text-sm text-muted-foreground font-mono">
                    {complaint.id}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Category</p>
                  <p className="text-sm text-muted-foreground">
                    {complaint.category.replace('_', ' ')}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Created</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDateTime(complaint.createdAt)}
                  </p>
                </div>
                {complaint.trackingId && (
                  <div>
                    <p className="text-sm font-medium">Tracking ID</p>
                    <p className="text-sm text-muted-foreground font-mono">
                      {complaint.trackingId}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </StaffDashboardLayout>
  );
}