"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { UserDashboardLayout } from "@/components/layout/user-dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  Package, 
  Calendar, 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  User,
  MessageSquare,
  Send
} from "lucide-react";
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
    status: string;
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

export default function UserComplaintDetail() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);

  const complaintId = params.id as string;

  useEffect(() => {
    fetchComplaint();
  }, [complaintId]);

  const fetchComplaint = async () => {
    try {
      const token = localStorage.getItem('user_token');
      if (!token) {
        router.push('/user/login');
        return;
      }

      const response = await fetch(`/api/complaints/${complaintId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setComplaint(data.complaint);
      } else if (response.status === 404) {
        toast({
          title: "Error",
          description: "Complaint not found",
          variant: "destructive",
        });
        router.push('/user/complaints');
      } else {
        toast({
          title: "Error",
          description: "Failed to load complaint",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching complaint:', error);
      toast({
        title: "Error",
        description: "An error occurred while loading the complaint",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    setSendingMessage(true);
    try {
      const token = localStorage.getItem('user_token');
      if (!token) {
        router.push('/user/login');
        return;
      }

      const response = await fetch(`/api/complaints/${complaintId}/responses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: newMessage,
          isInternal: false,
        }),
      });

      if (response.ok) {
        setNewMessage("");
        await fetchComplaint(); // Refresh the complaint data
        toast({
          title: "Success",
          description: "Message sent successfully",
        });
      } else {
        const data = await response.json();
        toast({
          title: "Error",
          description: data.error || "Failed to send message",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "An error occurred while sending the message",
        variant: "destructive",
      });
    } finally {
      setSendingMessage(false);
    }
  };

  if (loading) {
    return (
      <UserDashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nipost-blue mx-auto mb-4"></div>
            <p>Loading complaint details...</p>
          </div>
        </div>
      </UserDashboardLayout>
    );
  }

  if (!complaint) {
    return (
      <UserDashboardLayout>
        <div className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Complaint not found</h3>
          <p className="text-muted-foreground mb-4">
            The complaint you're looking for doesn't exist.
          </p>
          <Link href="/user/complaints">
            <Button className="bg-nipost-blue hover:bg-nipost-dark-blue">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Complaints
            </Button>
          </Link>
        </div>
      </UserDashboardLayout>
    );
  }

  return (
    <UserDashboardLayout>
      <div className="space-y-6">
        {/* Back Button */}
        <Link href="/user/complaints">
          <Button variant="outline" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Complaints
          </Button>
        </Link>

        {/* Complaint Header */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl">{complaint.title}</CardTitle>
                <CardDescription className="mt-2">
                  {categoryLabels[complaint.category as keyof typeof categoryLabels] || complaint.category}
                </CardDescription>
              </div>
              <Badge className={statusColors[complaint.status as keyof typeof statusColors]}>
                {statusLabels[complaint.status as keyof typeof statusLabels] || complaint.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Created: {new Date(complaint.createdAt).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  Last Updated: {new Date(complaint.updatedAt).toLocaleDateString()}
                </div>
              </div>
              {complaint.parcel && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Package className="h-4 w-4" />
                    <span className="font-medium">Related Delivery:</span>
                  </div>
                  <div className="text-sm">
                    <Badge variant="outline">#{complaint.parcel.trackingId}</Badge>
                    <div className="text-muted-foreground mt-1">
                      {complaint.parcel.origin} → {complaint.parcel.destination}
                    </div>
                    <Badge 
                      className={`mt-1 ${
                        complaint.parcel.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                        complaint.parcel.status === 'IN_TRANSIT' ? 'bg-blue-100 text-blue-800' :
                        complaint.parcel.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {complaint.parcel.status}
                    </Badge>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Complaint Description */}
        <Card>
          <CardHeader>
            <CardTitle>Complaint Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{complaint.description}</p>
          </CardContent>
        </Card>

        {/* Status Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Status Timeline</CardTitle>
            <CardDescription>
              Track the progress of your complaint
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div>
                  <div className="font-medium">Complaint Filed</div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(complaint.createdAt).toLocaleDateString()} at {new Date(complaint.createdAt).toLocaleTimeString()}
                  </div>
                </div>
              </div>
              {complaint.status !== 'OPEN' && (
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <div>
                    <div className="font-medium">In Progress</div>
                    <div className="text-sm text-muted-foreground">
                      Our team is working on your complaint
                    </div>
                  </div>
                </div>
              )}
              {complaint.status === 'RESOLVED' && (
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div>
                    <div className="font-medium">Resolved</div>
                    <div className="text-sm text-muted-foreground">
                      Your complaint has been resolved
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Messages/Responses */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Communication
            </CardTitle>
            <CardDescription>
              View responses and communicate with support staff
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Original Complaint */}
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">You</span>
                    <span className="text-sm text-muted-foreground">
                      {new Date(complaint.createdAt).toLocaleDateString()} at {new Date(complaint.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm">{complaint.description}</p>
                  </div>
                </div>
              </div>

              {/* Staff Responses */}
              {complaint.responses?.map((response) => (
                <div key={response.id} className="flex gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{response.staff?.name || 'Support Staff'}</span>
                      <Badge variant="outline" className="text-xs">
                        {response.staff?.role || 'STAFF'}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {new Date(response.createdAt).toLocaleDateString()} at {new Date(response.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-3">
                      <p className="text-sm">{response.message}</p>
                    </div>
                  </div>
                </div>
              ))}

              {/* Message Input */}
              {complaint.status !== 'RESOLVED' && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium">Send a message</label>
                      <p className="text-xs text-muted-foreground">
                        You can send additional information or ask questions about your complaint
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Textarea
                        placeholder="Type your message here..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="min-h-[80px]"
                      />
                      <Button 
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim() || sendingMessage}
                        className="bg-nipost-blue hover:bg-nipost-dark-blue self-end"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Status Alert */}
        {complaint.status === 'RESOLVED' && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              This complaint has been resolved. If you have any further questions, please contact our support team.
            </AlertDescription>
          </Alert>
        )}

        {complaint.status === 'ESCALATED' && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              This complaint has been escalated to senior management. You will receive a response soon.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </UserDashboardLayout>
  );
}