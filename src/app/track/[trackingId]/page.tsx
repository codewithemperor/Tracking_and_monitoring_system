'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Package, 
  MapPin, 
  Clock, 
  CheckCircle, 
  Truck, 
  AlertCircle,
  Calendar,
  User,
  Phone,
  Navigation,
  RefreshCw,
  Share2
} from 'lucide-react';
import { io, Socket } from 'socket.io-client';

interface Parcel {
  id: string;
  trackingId: string;
  origin: string;
  destination: string;
  currentLocation?: string;
  status: 'PENDING' | 'DISPATCHED' | 'IN_TRANSIT' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED';
  weight?: number;
  dimensions?: string;
  description?: string;
  estimatedDelivery?: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  staff?: {
    id: string;
    name: string;
    email: string;
  };
  statusHistory: Array<{
    status: string;
    location: string;
    description?: string;
    timestamp: string;
  }>;
  proofOfDelivery?: {
    recipientName: string;
    timestamp: string;
    imageUrl?: string;
  };
}

interface LocationUpdate {
  parcelId: string;
  trackingId: string;
  location: string;
  coordinates?: { lat: number; lng: number };
  timestamp: string;
  updatedBy: {
    name: string;
    role: string;
  };
}

export default function TrackingPage() {
  const params = useParams();
  const router = useRouter();
  const trackingId = params.trackingId as string;
  
  const [parcel, setParcel] = useState<Parcel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    fetchParcelData();
    initializeSocket();
    
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [trackingId]);

  const fetchParcelData = async () => {
    try {
      const response = await fetch(`/api/track/${trackingId}`);
      
      if (response.ok) {
        const data = await response.json();
        setParcel(data.parcel);
      } else {
        setError('Parcel not found');
      }
    } catch (error) {
      console.error('Error fetching parcel:', error);
      setError('Failed to load parcel information');
    } finally {
      setLoading(false);
    }
  };

  const initializeSocket = () => {
    const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000', {
      transports: ['websocket', 'polling'],
    });

    newSocket.on('connect', () => {
      console.log('Connected to WebSocket');
      setSocket(newSocket);
      
      // Start tracking this parcel
      newSocket.emit('track-parcel', trackingId);
      newSocket.emit('request-tracking-updates', trackingId);
      setIsTracking(true);
    });

    newSocket.on('parcel-updated', (data: any) => {
      console.log('Parcel updated:', data);
      setParcel(data.parcel);
      setLastUpdate(new Date());
    });

    newSocket.on('location-updated', (data: LocationUpdate) => {
      console.log('Location updated:', data);
      if (parcel && parcel.id === data.parcelId) {
        setParcel(prev => prev ? {
          ...prev,
          currentLocation: data.location,
        } : null);
        setLastUpdate(new Date());
      }
    });

    newSocket.on('error', (error: any) => {
      console.error('Socket error:', error);
      setError(error.message || 'Connection error');
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from WebSocket');
      setIsTracking(false);
    });

    setSocket(newSocket);
  };

  const toggleTracking = () => {
    if (socket && isTracking) {
      socket.emit('stop-tracking-updates', trackingId);
      socket.emit('untrack-parcel', trackingId);
      setIsTracking(false);
    } else if (socket && !isTracking) {
      socket.emit('track-parcel', trackingId);
      socket.emit('request-tracking-updates', trackingId);
      setIsTracking(true);
    }
  };

  const shareTracking = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Track your parcel',
        text: `Track parcel ${trackingId} on NIPOST Track`,
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Tracking link copied to clipboard!');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'DISPATCHED': return 'bg-blue-100 text-blue-800';
      case 'IN_TRANSIT': return 'bg-purple-100 text-purple-800';
      case 'OUT_FOR_DELIVERY': return 'bg-orange-100 text-orange-800';
      case 'DELIVERED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <Clock className="h-4 w-4" />;
      case 'DISPATCHED': return <Package className="h-4 w-4" />;
      case 'IN_TRANSIT': return <Truck className="h-4 w-4" />;
      case 'OUT_FOR_DELIVERY': return <MapPin className="h-4 w-4" />;
      case 'DELIVERED': return <CheckCircle className="h-4 w-4" />;
      case 'CANCELLED': return <AlertCircle className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  const getProgressPercentage = (status: string) => {
    switch (status) {
      case 'PENDING': return 0;
      case 'DISPATCHED': return 25;
      case 'IN_TRANSIT': return 50;
      case 'OUT_FOR_DELIVERY': return 75;
      case 'DELIVERED': return 100;
      case 'CANCELLED': return 0;
      default: return 0;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading tracking information...</p>
        </div>
      </div>
    );
  }

  if (error || !parcel) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Tracking Error</h3>
            <p className="text-gray-600 text-center mb-4">{error || 'Parcel not found'}</p>
            <div className="flex gap-2">
              <Button onClick={() => router.push('/')}>
                Back to Home
              </Button>
              <Button variant="outline" onClick={fetchParcelData}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-blue-600 mr-2" />
              <span className="text-xl font-bold text-gray-900">NIPOST Track</span>
            </div>
            <Button variant="outline" onClick={() => router.push('/')}>
              Back to Home
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tracking Header */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Tracking: {parcel.trackingId}
                </CardTitle>
                <CardDescription>
                  Real-time tracking for your parcel
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={getStatusColor(parcel.status)}>
                  <div className="flex items-center gap-1">
                    {getStatusIcon(parcel.status)}
                    {parcel.status.replace('_', ' ')}
                  </div>
                </Badge>
                <Button 
                  size="sm" 
                  variant={isTracking ? "default" : "outline"}
                  onClick={toggleTracking}
                >
                  {isTracking ? 'Stop Tracking' : 'Live Track'}
                </Button>
                <Button size="sm" variant="outline" onClick={shareTracking}>
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Route</h4>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>{parcel.origin}</span>
                </div>
                <div className="flex items-center justify-center my-2">
                  <div className="w-8 h-0.5 bg-gray-300"></div>
                  <Navigation className="h-4 w-4 text-gray-400 mx-1" />
                  <div className="w-8 h-0.5 bg-gray-300"></div>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>{parcel.destination}</span>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Current Status</h4>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>{parcel.currentLocation || parcel.origin}</span>
                </div>
                {parcel.estimatedDelivery && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                    <Calendar className="h-4 w-4" />
                    <span>Estimated: {new Date(parcel.estimatedDelivery).toLocaleDateString()}</span>
                  </div>
                )}
                {lastUpdate && (
                  <div className="text-xs text-green-600 mt-2">
                    Last update: {lastUpdate.toLocaleTimeString()}
                  </div>
                )}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Progress</span>
                <span>{getProgressPercentage(parcel.status)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${getProgressPercentage(parcel.status)}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Details Tabs */}
        <Tabs defaultValue="timeline" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="map">Live Map</TabsTrigger>
            {parcel.proofOfDelivery && (
              <TabsTrigger value="proof">Proof of Delivery</TabsTrigger>
            )}
          </TabsList>
          
          <TabsContent value="timeline" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Delivery Timeline</CardTitle>
                <CardDescription>
                  Complete history of your parcel's journey
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {parcel.statusHistory.map((history, index) => (
                    <div key={index} className="flex items-start gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`w-3 h-3 rounded-full ${
                          index === 0 ? 'bg-blue-600' : 'bg-gray-300'
                        }`}></div>
                        {index < parcel.statusHistory.length - 1 && (
                          <div className="w-0.5 h-16 bg-gray-200 mt-2"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-sm">{history.status.replace('_', ' ')}</p>
                            <p className="text-sm text-gray-600">{history.location}</p>
                            {history.description && (
                              <p className="text-sm text-gray-500 mt-1">{history.description}</p>
                            )}
                          </div>
                          <span className="text-xs text-gray-500 whitespace-nowrap ml-4">
                            {new Date(history.timestamp).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="details" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Parcel Details</CardTitle>
                <CardDescription>
                  Complete information about your parcel
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Basic Information</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-500">Tracking ID:</span>
                        <p className="font-medium">{parcel.trackingId}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Status:</span>
                        <p className="font-medium">{parcel.status.replace('_', ' ')}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Created:</span>
                        <p className="font-medium">{new Date(parcel.createdAt).toLocaleString()}</p>
                      </div>
                      {parcel.estimatedDelivery && (
                        <div>
                          <span className="text-gray-500">Estimated Delivery:</span>
                          <p className="font-medium">{new Date(parcel.estimatedDelivery).toLocaleDateString()}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-3">Route Information</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-500">Origin:</span>
                        <p className="font-medium">{parcel.origin}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Destination:</span>
                        <p className="font-medium">{parcel.destination}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Current Location:</span>
                        <p className="font-medium">{parcel.currentLocation || parcel.origin}</p>
                      </div>
                    </div>
                  </div>
                  
                  {parcel.weight || parcel.dimensions || parcel.description ? (
                    <div>
                      <h4 className="font-semibold mb-3">Additional Details</h4>
                      <div className="space-y-2 text-sm">
                        {parcel.weight && (
                          <div>
                            <span className="text-gray-500">Weight:</span>
                            <p className="font-medium">{parcel.weight} kg</p>
                          </div>
                        )}
                        {parcel.dimensions && (
                          <div>
                            <span className="text-gray-500">Dimensions:</span>
                            <p className="font-medium">{parcel.dimensions}</p>
                          </div>
                        )}
                        {parcel.description && (
                          <div>
                            <span className="text-gray-500">Description:</span>
                            <p className="font-medium">{parcel.description}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : null}
                  
                  <div>
                    <h4 className="font-semibold mb-3">Contact Information</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-500">Sender:</span>
                        <p className="font-medium">{parcel.user.name}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Email:</span>
                        <p className="font-medium">{parcel.user.email}</p>
                      </div>
                      {parcel.user.phone && (
                        <div>
                          <span className="text-gray-500">Phone:</span>
                          <p className="font-medium">{parcel.user.phone}</p>
                        </div>
                      )}
                      {parcel.staff && (
                        <>
                          <div>
                            <span className="text-gray-500">Delivery Agent:</span>
                            <p className="font-medium">{parcel.staff.name}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Agent Email:</span>
                            <p className="font-medium">{parcel.staff.email}</p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="map" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Live Tracking Map</CardTitle>
                <CardDescription>
                  Real-time location tracking (simulated for demo)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-100 rounded-lg h-96 flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">Interactive Map View</p>
                    <p className="text-sm text-gray-500">
                      Current location: {parcel.currentLocation || parcel.origin}
                    </p>
                    {isTracking && (
                      <div className="mt-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          Live Tracking Active
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> This is a demo implementation. In a production environment, 
                    this would integrate with real GPS tracking systems and mapping services like 
                    Google Maps or Mapbox to show the actual real-time location of the delivery vehicle.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {parcel.proofOfDelivery && (
            <TabsContent value="proof" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Proof of Delivery</CardTitle>
                  <CardDescription>
                    Confirmation that your parcel was successfully delivered
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <span className="font-medium">Recipient:</span>
                      <p className="text-gray-600">{parcel.proofOfDelivery.recipientName}</p>
                    </div>
                    <div>
                      <span className="font-medium">Delivery Time:</span>
                      <p className="text-gray-600">{new Date(parcel.proofOfDelivery.timestamp).toLocaleString()}</p>
                    </div>
                    {parcel.proofOfDelivery.imageUrl && (
                      <div>
                        <span className="font-medium">Proof Image:</span>
                        <div className="mt-2">
                          <img 
                            src={parcel.proofOfDelivery.imageUrl} 
                            alt="Proof of delivery"
                            className="max-w-xs rounded-lg border shadow-sm"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}