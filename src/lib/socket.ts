import { Server } from 'socket.io';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

interface AuthenticatedSocket extends Socket {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

export const setupSocket = (io: Server) => {
  // Authentication middleware
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const payload = verifyToken(token);
      if (!payload) {
        return next(new Error('Authentication error'));
      }

      // Fetch user from database
      const user = await db.user.findUnique({
        where: { id: payload.userId },
        select: {
          id: true,
          email: true,
          role: true,
        },
      });

      if (!user) {
        return next(new Error('User not found'));
      }

      socket.user = {
        userId: user.id,
        email: user.email,
        role: user.role,
      };

      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log('Client connected:', socket.id, 'User:', socket.user?.email);

    // Join user-specific room
    if (socket.user) {
      socket.join(`user:${socket.user.userId}`);
      
      // Staff join staff room
      if (socket.user.role === 'STAFF') {
        socket.join('staff');
      }
      
      // Admin join admin room
      if (socket.user.role === 'ADMIN') {
        socket.join('admin');
      }
    }

    // Join parcel tracking room
    socket.on('track-parcel', (trackingId: string) => {
      socket.join(`parcel:${trackingId}`);
      console.log(`User ${socket.user?.email} tracking parcel ${trackingId}`);
    });

    // Stop tracking parcel
    socket.on('untrack-parcel', (trackingId: string) => {
      socket.leave(`parcel:${trackingId}`);
      console.log(`User ${socket.user?.email} stopped tracking parcel ${trackingId}`);
    });

    // Handle parcel status updates (from staff)
    socket.on('update-parcel-status', async (data: {
      parcelId: string;
      status: string;
      location: string;
      description?: string;
      currentLocation?: string;
    }) => {
      try {
        if (!socket.user || (socket.user.role !== 'STAFF' && socket.user.role !== 'ADMIN')) {
          socket.emit('error', { message: 'Unauthorized to update parcel status' });
          return;
        }

        // Check if parcel exists and user has permission
        const parcel = await db.parcel.findUnique({
          where: { id: data.parcelId },
          include: {
            user: true,
            staff: true,
          },
        });

        if (!parcel) {
          socket.emit('error', { message: 'Parcel not found' });
          return;
        }

        // Check if staff is assigned to this parcel or if user is admin
        if (socket.user.role === 'STAFF' && parcel.staffId !== socket.user.userId) {
          socket.emit('error', { message: 'Access denied. You are not assigned to this parcel.' });
          return;
        }

        // Update parcel status
        const updatedParcel = await db.parcel.update({
          where: { id: data.parcelId },
          data: {
            status: data.status as any,
            currentLocation: data.currentLocation || data.location,
            actualDelivery: data.status === 'DELIVERED' ? new Date() : null,
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              },
            },
            staff: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        });

        // Create status history entry
        await db.statusHistory.create({
          data: {
            parcelId: data.parcelId,
            status: data.status as any,
            location: data.location,
            description: data.description,
            updatedBy: socket.user.userId,
          },
        });

        // Create notification for user
        await db.notification.create({
          data: {
            userId: parcel.userId,
            parcelId: data.parcelId,
            message: `Your parcel status has been updated to: ${data.status.replace('_', ' ')}`,
            type: 'EMAIL',
            status: 'PENDING',
          },
        });

        // Emit real-time updates
        const updateData = {
          parcel: updatedParcel,
          update: {
            status: data.status,
            location: data.location,
            description: data.description,
            timestamp: new Date().toISOString(),
            updatedBy: {
              name: socket.user.email,
              role: socket.user.role,
            },
          },
        };

        // Notify parcel tracking room
        io.to(`parcel:${parcel.trackingId}`).emit('parcel-updated', updateData);
        
        // Notify user room
        io.to(`user:${parcel.userId}`).emit('parcel-updated', updateData);
        
        // Notify staff room
        io.to('staff').emit('parcel-updated', updateData);
        
        // Notify admin room
        io.to('admin').emit('parcel-updated', updateData);

        // Confirm to sender
        socket.emit('update-confirmed', { 
          message: 'Parcel status updated successfully',
          parcel: updatedParcel 
        });

        console.log(`Parcel ${parcel.trackingId} status updated to ${data.status} by ${socket.user.email}`);

      } catch (error) {
        console.error('Error updating parcel status:', error);
        socket.emit('error', { message: 'Failed to update parcel status' });
      }
    });

    // Handle location updates (from staff)
    socket.on('update-location', async (data: {
      parcelId: string;
      location: string;
      coordinates?: { lat: number; lng: number };
    }) => {
      try {
        if (!socket.user || (socket.user.role !== 'STAFF' && socket.user.role !== 'ADMIN')) {
          socket.emit('error', { message: 'Unauthorized to update location' });
          return;
        }

        // Update parcel location
        const updatedParcel = await db.parcel.update({
          where: { id: data.parcelId },
          data: {
            currentLocation: data.location,
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        });

        // Emit location update
        const locationData = {
          parcelId: data.parcelId,
          trackingId: updatedParcel.trackingId,
          location: data.location,
          coordinates: data.coordinates,
          timestamp: new Date().toISOString(),
          updatedBy: {
            name: socket.user.email,
            role: socket.user.role,
          },
        };

        // Notify parcel tracking room
        io.to(`parcel:${updatedParcel.trackingId}`).emit('location-updated', locationData);
        
        // Notify user room
        io.to(`user:${updatedParcel.userId}`).emit('location-updated', locationData);

        console.log(`Location updated for parcel ${updatedParcel.trackingId} by ${socket.user.email}`);

      } catch (error) {
        console.error('Error updating location:', error);
        socket.emit('error', { message: 'Failed to update location' });
      }
    });

    // Handle parcel assignment (admin only)
    socket.on('assign-parcel', async (data: {
      parcelId: string;
      staffId: string;
    }) => {
      try {
        if (!socket.user || socket.user.role !== 'ADMIN') {
          socket.emit('error', { message: 'Unauthorized to assign parcels' });
          return;
        }

        // Assign parcel to staff
        const updatedParcel = await db.parcel.update({
          where: { id: data.parcelId },
          data: {
            staffId: data.staffId,
            status: 'DISPATCHED',
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            staff: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        });

        // Create status history entry
        await db.statusHistory.create({
          data: {
            parcelId: data.parcelId,
            status: 'DISPATCHED',
            location: updatedParcel.origin,
            description: 'Parcel assigned to staff member',
            updatedBy: socket.user.userId,
          },
        });

        // Create notifications
        await Promise.all([
          db.notification.create({
            data: {
              userId: updatedParcel.userId,
              parcelId: data.parcelId,
              message: 'Your parcel has been dispatched and assigned to a delivery agent',
              type: 'EMAIL',
              status: 'PENDING',
            },
          }),
          db.notification.create({
            data: {
              userId: data.staffId,
              parcelId: data.parcelId,
              message: 'New parcel assigned to you for delivery',
              type: 'EMAIL',
              status: 'PENDING',
            },
          }),
        ]);

        // Emit assignment update
        const assignmentData = {
          parcel: updatedParcel,
          assignedBy: {
            name: socket.user.email,
            role: socket.user.role,
          },
          timestamp: new Date().toISOString(),
        };

        // Notify relevant rooms
        io.to(`user:${updatedParcel.userId}`).emit('parcel-assigned', assignmentData);
        io.to(`user:${data.staffId}`).emit('parcel-assigned', assignmentData);
        io.to('staff').emit('parcel-assigned', assignmentData);
        io.to('admin').emit('parcel-assigned', assignmentData);

        socket.emit('assignment-confirmed', { 
          message: 'Parcel assigned successfully',
          parcel: updatedParcel 
        });

        console.log(`Parcel ${updatedParcel.trackingId} assigned to staff ${data.staffId} by ${socket.user.email}`);

      } catch (error) {
        console.error('Error assigning parcel:', error);
        socket.emit('error', { message: 'Failed to assign parcel' });
      }
    });

    // Handle real-time tracking requests
    socket.on('request-tracking-updates', (trackingId: string) => {
      socket.join(`tracking:${trackingId}`);
      socket.emit('tracking-activated', { trackingId });
      console.log(`Real-time tracking activated for parcel ${trackingId} by ${socket.user?.email}`);
    });

    // Stop real-time tracking
    socket.on('stop-tracking-updates', (trackingId: string) => {
      socket.leave(`tracking:${trackingId}`);
      socket.emit('tracking-deactivated', { trackingId });
      console.log(`Real-time tracking stopped for parcel ${trackingId} by ${socket.user?.email}`);
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id, 'User:', socket.user?.email);
    });

    // Send welcome message
    socket.emit('connected', {
      message: 'Connected to NIPOST Track real-time system',
      user: socket.user,
      timestamp: new Date().toISOString(),
    });
  });
};