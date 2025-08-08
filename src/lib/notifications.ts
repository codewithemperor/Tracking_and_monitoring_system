import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

interface SMSOptions {
  to: string;
  message: string;
}

class NotificationService {
  private emailTransporter: nodemailer.Transporter | null = null;

  constructor() {
    // Initialize email transporter if SMTP credentials are available
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      this.emailTransporter = nodemailer.createTransporter({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    }
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    if (!this.emailTransporter) {
      console.log('Email service not configured. Skipping email send.');
      return false;
    }

    try {
      const mailOptions = {
        from: process.env.SMTP_FROM || 'noreply@niposttrack.com',
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      };

      const result = await this.emailTransporter.sendMail(mailOptions);
      console.log('Email sent successfully:', result.messageId);
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  }

  async sendSMS(options: SMSOptions): Promise<boolean> {
    // This is a placeholder for SMS integration
    // In a real implementation, you would integrate with services like:
    // - Twilio
    // - AWS SNS
    // - Vonage
    // - Africa's Talking (for Nigerian services)
    
    console.log('SMS service not implemented. Would send SMS to:', options.to, 'Message:', options.message);
    return false;
  }

  async sendParcelStatusUpdate(
    userEmail: string,
    userPhone: string | undefined,
    trackingId: string,
    status: string,
    location: string,
    description?: string
  ): Promise<{ emailSent: boolean; smsSent: boolean }> {
    const subject = `Parcel Status Update - ${trackingId}`;
    const statusText = status.replace('_', ' ');
    
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #0066cc; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">NIPOST Track</h1>
          <p style="margin: 5px 0 0 0;">Real-time Parcel Tracking</p>
        </div>
        
        <div style="padding: 20px; background-color: #f9f9f9;">
          <h2 style="color: #333; margin-top: 0;">Parcel Status Update</h2>
          <p style="color: #666; line-height: 1.6;">
            Your parcel with tracking ID <strong>${trackingId}</strong> has been updated.
          </p>
          
          <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>New Status:</strong> ${statusText}</p>
            <p><strong>Location:</strong> ${location}</p>
            ${description ? `<p><strong>Details:</strong> ${description}</p>` : ''}
            <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/track/${trackingId}" 
               style="background-color: #0066cc; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Track Your Parcel
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px; text-align: center; margin-top: 30px;">
            This is an automated notification from NIPOST Track. Please do not reply to this email.
          </p>
        </div>
      </div>
    `;

    const emailText = `
      NIPOST Track - Parcel Status Update
      
      Your parcel with tracking ID ${trackingId} has been updated.
      
      New Status: ${statusText}
      Location: ${location}
      ${description ? `Details: ${description}` : ''}
      Time: ${new Date().toLocaleString()}
      
      Track your parcel: ${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/track/${trackingId}
      
      This is an automated notification. Please do not reply.
    `;

    const smsText = `NIPOST: Your parcel ${trackingId} status is now ${statusText} at ${location}. Track: ${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/track/${trackingId}`;

    const [emailSent, smsSent] = await Promise.all([
      this.sendEmail({
        to: userEmail,
        subject,
        text: emailText,
        html: emailHtml,
      }),
      userPhone ? this.sendSMS({
        to: userPhone,
        message: smsText,
      }) : Promise.resolve(false),
    ]);

    return { emailSent, smsSent };
  }

  async sendParcelAssigned(
    staffEmail: string,
    staffPhone: string | undefined,
    trackingId: string,
    origin: string,
    destination: string
  ): Promise<{ emailSent: boolean; smsSent: boolean }> {
    const subject = `New Parcel Assigned - ${trackingId}`;
    
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #0066cc; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">NIPOST Track</h1>
          <p style="margin: 5px 0 0 0;">Staff Portal</p>
        </div>
        
        <div style="padding: 20px; background-color: #f9f9f9;">
          <h2 style="color: #333; margin-top: 0;">New Parcel Assigned</h2>
          <p style="color: #666; line-height: 1.6;">
            A new parcel has been assigned to you for delivery.
          </p>
          
          <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Tracking ID:</strong> ${trackingId}</p>
            <p><strong>Origin:</strong> ${origin}</p>
            <p><strong>Destination:</strong> ${destination}</p>
            <p><strong>Assigned Time:</strong> ${new Date().toLocaleString()}</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/staff-dashboard" 
               style="background-color: #0066cc; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              View in Staff Dashboard
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px; text-align: center; margin-top: 30px;">
            This is an automated notification from NIPOST Track.
          </p>
        </div>
      </div>
    `;

    const emailText = `
      NIPOST Track - New Parcel Assigned
      
      A new parcel has been assigned to you for delivery.
      
      Tracking ID: ${trackingId}
      Origin: ${origin}
      Destination: ${destination}
      Assigned Time: ${new Date().toLocaleString()}
      
      View in staff dashboard: ${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/staff-dashboard
    `;

    const smsText = `NIPOST: New parcel assigned. Tracking ID: ${trackingId} from ${origin} to ${destination}. View: ${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/staff-dashboard`;

    const [emailSent, smsSent] = await Promise.all([
      this.sendEmail({
        to: staffEmail,
        subject,
        text: emailText,
        html: emailHtml,
      }),
      staffPhone ? this.sendSMS({
        to: staffPhone,
        message: smsText,
      }) : Promise.resolve(false),
    ]);

    return { emailSent, smsSent };
  }

  async sendWelcomeEmail(
    userEmail: string,
    userName: string,
    role: string
  ): Promise<boolean> {
    const subject = 'Welcome to NIPOST Track';
    
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #0066cc; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">NIPOST Track</h1>
          <p style="margin: 5px 0 0 0;">Welcome aboard!</p>
        </div>
        
        <div style="padding: 20px; background-color: #f9f9f9;">
          <h2 style="color: #333; margin-top: 0;">Welcome to NIPOST Track, ${userName}!</h2>
          <p style="color: #666; line-height: 1.6;">
            Thank you for joining NIPOST Track. Your account has been successfully created with ${role} privileges.
          </p>
          
          <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Getting Started</h3>
            <ul style="color: #666; line-height: 1.8;">
              ${role === 'CUSTOMER' ? `
                <li>Register your parcels for tracking</li>
                <li>Monitor real-time delivery status</li>
                <li>Receive instant notifications</li>
              ` : ''}
              ${role === 'STAFF' ? `
                <li>View assigned parcels</li>
                <li>Update delivery status in real-time</li>
                <li>Capture proof of delivery</li>
              ` : ''}
              ${role === 'ADMIN' ? `
                <li>Manage users and permissions</li>
                <li>Monitor system analytics</li>
                <li>Oversee all parcel operations</li>
              ` : ''}
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/dashboard" 
               style="background-color: #0066cc; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Go to Dashboard
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px; text-align: center; margin-top: 30px;">
            If you have any questions, please contact our support team.
          </p>
        </div>
      </div>
    `;

    return await this.sendEmail({
      to: userEmail,
      subject,
      html: emailHtml,
    });
  }
}

export const notificationService = new NotificationService();