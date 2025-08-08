import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { notificationService } from '@/lib/notifications';
import { withAuth, AuthenticatedRequest } from '@/lib/middleware';

async function handler(req: AuthenticatedRequest) {
  try {
    if (req.method === 'POST') {
      // This endpoint would typically be called by a background job
      // For now, we'll allow authenticated users to trigger it manually
      const { limit = 10 } = new URL(req.url).searchParams;

      // Get pending notifications
      const notifications = await db.notification.findMany({
        where: {
          status: 'PENDING',
        },
        include: {
          user: {
            select: {
              email: true,
              phone: true,
              name: true,
            },
          },
          parcel: {
            select: {
              trackingId: true,
              origin: true,
              destination: true,
              status: true,
              currentLocation: true,
            },
          },
        },
        take: Number(limit),
      });

      const results = [];

      for (const notification of notifications) {
        try {
          let emailSent = false;
          let smsSent = false;

          if (notification.type === 'EMAIL') {
            if (notification.parcel) {
              // Parcel status update notification
              const result = await notificationService.sendParcelStatusUpdate(
                notification.user.email,
                notification.user.phone,
                notification.parcel.trackingId,
                notification.parcel.status,
                notification.parcel.currentLocation || notification.parcel.origin,
                notification.message
              );
              emailSent = result.emailSent;
              smsSent = result.smsSent;
            } else {
              // Generic email notification
              emailSent = await notificationService.sendEmail({
                to: notification.user.email,
                subject: 'NIPOST Track Notification',
                text: notification.message,
                html: `<p>${notification.message}</p>`,
              });
            }
          } else if (notification.type === 'SMS' && notification.user.phone) {
            smsSent = await notificationService.sendSMS({
              to: notification.user.phone,
              message: notification.message,
            });
          }

          // Update notification status
          await db.notification.update({
            where: { id: notification.id },
            data: {
              status: emailSent || smsSent ? 'SENT' : 'FAILED',
              sentAt: new Date(),
              error: emailSent || smsSent ? null : 'Failed to send notification',
            },
          });

          results.push({
            id: notification.id,
            emailSent,
            smsSent,
            status: emailSent || smsSent ? 'SENT' : 'FAILED',
          });
        } catch (error) {
          console.error(`Error processing notification ${notification.id}:`, error);
          
          // Mark as failed
          await db.notification.update({
            where: { id: notification.id },
            data: {
              status: 'FAILED',
              sentAt: new Date(),
              error: error instanceof Error ? error.message : 'Unknown error',
            },
          });

          results.push({
            id: notification.id,
            emailSent: false,
            smsSent: false,
            status: 'FAILED',
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }

      return NextResponse.json({
        message: `Processed ${notifications.length} notifications`,
        results,
      });
    }

    return NextResponse.json(
      { error: 'Method not allowed' },
      { status: 405 }
    );
  } catch (error) {
    console.error('Notification processing error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const POST = withAuth(handler);