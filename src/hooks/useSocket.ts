'use client';

import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface UseSocketOptions {
  autoConnect?: boolean;
  enableTracking?: boolean;
}

export const useSocket = (options: UseSocketOptions = {}) => {
  const { autoConnect = true, enableTracking = false } = options;
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const token = localStorage.getItem('token');
    if (!token) return;

    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000', {
      transports: ['websocket', 'polling'],
      autoConnect: autoConnect,
      auth: {
        token,
      },
    });

    socket.on('connect', () => {
      console.log('Socket connected');
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    socket.on('connected', (data) => {
      console.log('Socket authenticated:', data);
      setUser(data.user);
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, [autoConnect]);

  const trackParcel = (trackingId: string) => {
    if (socketRef.current) {
      socketRef.current.emit('track-parcel', trackingId);
      if (enableTracking) {
        socketRef.current.emit('request-tracking-updates', trackingId);
      }
    }
  };

  const untrackParcel = (trackingId: string) => {
    if (socketRef.current) {
      socketRef.current.emit('untrack-parcel', trackingId);
      if (enableTracking) {
        socketRef.current.emit('stop-tracking-updates', trackingId);
      }
    }
  };

  const updateParcelStatus = (data: {
    parcelId: string;
    status: string;
    location: string;
    description?: string;
    currentLocation?: string;
  }) => {
    if (socketRef.current) {
      socketRef.current.emit('update-parcel-status', data);
    }
  };

  const updateLocation = (data: {
    parcelId: string;
    location: string;
    coordinates?: { lat: number; lng: number };
  }) => {
    if (socketRef.current) {
      socketRef.current.emit('update-location', data);
    }
  };

  const assignParcel = (data: {
    parcelId: string;
    staffId: string;
  }) => {
    if (socketRef.current) {
      socketRef.current.emit('assign-parcel', data);
    }
  };

  const onParcelUpdated = (callback: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.on('parcel-updated', callback);
    }
  };

  const onLocationUpdated = (callback: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.on('location-updated', callback);
    }
  };

  const onParcelAssigned = (callback: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.on('parcel-assigned', callback);
    }
  };

  const removeListener = (event: string, callback: (...args: any[]) => void) => {
    if (socketRef.current) {
      socketRef.current.off(event, callback);
    }
  };

  return {
    socket: socketRef.current,
    isConnected,
    user,
    trackParcel,
    untrackParcel,
    updateParcelStatus,
    updateLocation,
    assignParcel,
    onParcelUpdated,
    onLocationUpdated,
    onParcelAssigned,
    removeListener,
  };
};