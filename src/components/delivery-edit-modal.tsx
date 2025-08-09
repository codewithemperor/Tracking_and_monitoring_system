"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Save, Loader2, MapPin, Truck } from "lucide-react";

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
  userId: string;
  staffId?: string;
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

interface DeliveryEditModalProps {
  delivery: Delivery | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedDelivery: Partial<Delivery>) => void;
  userRole: "STAFF" | "ADMIN";
}

const statusOptions = [
  { value: "PENDING", label: "Pending" },
  { value: "DISPATCHED", label: "Dispatched" },
  { value: "IN_TRANSIT", label: "In Transit" },
  { value: "OUT_FOR_DELIVERY", label: "Out for Delivery" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "FAILED", label: "Failed" },
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
      return "bg-orange-100 text-orange-800";
    case "DELIVERED":
      return "bg-green-100 text-green-800";
    case "FAILED":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export function DeliveryEditModal({
  delivery,
  isOpen,
  onClose,
  onSave,
  userRole,
}: DeliveryEditModalProps) {
  const [formData, setFormData] = useState<Partial<Delivery>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (delivery) {
      setFormData({
        status: delivery.status,
        currentLocation: delivery.currentLocation,
        ...(userRole === "ADMIN" && {
          origin: delivery.origin,
          destination: delivery.destination,
          weight: delivery.weight,
          value: delivery.value,
          description: delivery.description,
          estimatedDelivery: delivery.estimatedDelivery,
          actualDelivery: delivery.actualDelivery,
          userId: delivery.userId,
          staffId: delivery.staffId,
        }),
      });
    }
  }, [delivery, userRole]);

  const handleSave = async () => {
    if (!delivery || !formData) return;

    setLoading(true);
    try {
      const token = localStorage.getItem(`${userRole.toLowerCase()}_token`);
      
      const updateData: any = {};
      
      // Staff can only edit status and current location
      if (userRole === "STAFF") {
        if (formData.status) updateData.status = formData.status;
        if (formData.currentLocation !== undefined) updateData.currentLocation = formData.currentLocation;
      } 
      // Admin can edit all fields
      else if (userRole === "ADMIN") {
        if (formData.origin) updateData.origin = formData.origin;
        if (formData.destination) updateData.destination = formData.destination;
        if (formData.status) updateData.status = formData.status;
        if (formData.currentLocation !== undefined) updateData.currentLocation = formData.currentLocation;
        if (formData.weight !== undefined) updateData.weight = formData.weight;
        if (formData.value !== undefined) updateData.value = formData.value;
        if (formData.description !== undefined) updateData.description = formData.description;
        if (formData.estimatedDelivery) updateData.estimatedDelivery = formData.estimatedDelivery;
        if (formData.actualDelivery) updateData.actualDelivery = formData.actualDelivery;
        if (formData.userId) updateData.userId = formData.userId;
        if (formData.staffId !== undefined) updateData.staffId = formData.staffId;
      }

      const response = await fetch(`/api/parcels/${delivery.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        const data = await response.json();
        onSave(data.parcel);
        onClose();
      } else {
        const errorData = await response.json();
        console.error("Failed to update delivery:", errorData);
        alert("Failed to update delivery. Please try again.");
      }
    } catch (error) {
      console.error("Error updating delivery:", error);
      alert("An error occurred while updating the delivery.");
    } finally {
      setLoading(false);
    }
  };

  if (!delivery) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <DialogTitle>Edit Delivery</DialogTitle>
            <Badge className={getStatusColor(delivery.status)}>
              {delivery.status.replace("_", " ")}
            </Badge>
          </div>
          <DialogDescription>
            Tracking ID: {delivery.trackingId}
            <br />
            <span className="text-xs text-muted-foreground">
              {userRole === "STAFF" 
                ? "You can edit status and current location" 
                : "You can edit all delivery fields"
              }
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Basic Info - Read-only for all users */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Origin</Label>
              <p className="text-sm">{delivery.origin}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Destination</Label>
              <p className="text-sm">{delivery.destination}</p>
            </div>
          </div>

          {/* Editable Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Status - Editable by both Staff and Admin */}
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status || ""}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Current Location - Editable by both Staff and Admin */}
            <div className="space-y-2">
              <Label htmlFor="currentLocation">Current Location</Label>
              <Input
                id="currentLocation"
                value={formData.currentLocation || ""}
                onChange={(e) => setFormData({ ...formData, currentLocation: e.target.value })}
                placeholder="Enter current location"
              />
            </div>

            {/* Admin-only fields */}
            {userRole === "ADMIN" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    value={formData.weight || ""}
                    onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) || undefined })}
                    placeholder="Enter weight"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="value">Value (₦)</Label>
                  <Input
                    id="value"
                    type="number"
                    step="0.01"
                    value={formData.value || ""}
                    onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) || undefined })}
                    placeholder="Enter value"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estimatedDelivery">Estimated Delivery</Label>
                  <Input
                    id="estimatedDelivery"
                    type="datetime-local"
                    value={formData.estimatedDelivery ? new Date(formData.estimatedDelivery).toISOString().slice(0, 16) : ""}
                    onChange={(e) => setFormData({ ...formData, estimatedDelivery: e.target.value || undefined })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="actualDelivery">Actual Delivery</Label>
                  <Input
                    id="actualDelivery"
                    type="datetime-local"
                    value={formData.actualDelivery ? new Date(formData.actualDelivery).toISOString().slice(0, 16) : ""}
                    onChange={(e) => setFormData({ ...formData, actualDelivery: e.target.value || undefined })}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={formData.description || ""}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter delivery description"
                  />
                </div>
              </>
            )}
          </div>

          {/* Customer Info - Read-only */}
          <div className="border-t pt-4">
            <Label className="text-sm font-medium text-muted-foreground">Customer</Label>
            <p className="text-sm">{delivery.user.name} ({delivery.user.email})</p>
          </div>

          {/* Staff Assignment - Admin only */}
          {userRole === "ADMIN" && (
            <div className="border-t pt-4">
              <Label className="text-sm font-medium text-muted-foreground">Assigned Staff</Label>
              <p className="text-sm">
                {delivery.staff ? `${delivery.staff.name} (${delivery.staff.email})` : "Unassigned"}
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={loading || !formData.status}
            className="bg-nipost-blue hover:bg-nipost-dark-blue"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}