import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

// Initialize Resend only if API key is available
const getResend = () => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new Resend(apiKey);
};

interface BookingEmailData {
  userEmail: string;
  userName: string;
  bookingId: string;
  eventName: string;
  eventDate: string;
  eventTime: string;
  venueName: string;
  venueAddress: string;
  numberOfPeople: number;
  totalPrice: number;
  qrCodeUrl: string;
}

export async function POST(request: NextRequest) {
  try {
    const data: BookingEmailData = await request.json();

    if (!process.env.RESEND_API_KEY) {
      console.warn("RESEND_API_KEY not configured, skipping email send");
      return NextResponse.json(
        { success: false, message: "Email service not configured" },
        { status: 200 } // Don't fail the booking if email fails
      );
    }

    if (!data.userEmail) {
      console.warn("No user email provided, skipping email send");
      return NextResponse.json(
        { success: false, message: "No email address provided" },
        { status: 200 }
      );
    }

    // Format date for email
    const formattedDate = new Date(data.eventDate).toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    // Create HTML email template
    const htmlEmail = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking Confirmation - ClubRadar</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f5f5f5;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #9333ea 0%, #ec4899 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">Booking Confirmed! 🎉</h1>
              <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 16px; opacity: 0.9;">Your event booking is confirmed</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                Hi ${data.userName || "there"},
              </p>
              <p style="margin: 0 0 30px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                Great news! Your booking for <strong>${data.eventName}</strong> has been confirmed. We're excited to have you join us!
              </p>
              
              <!-- Booking Details Card -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f9fafb; border-radius: 8px; margin: 30px 0; padding: 20px;">
                <tr>
                  <td style="padding: 15px 0; border-bottom: 1px solid #e5e7eb;">
                    <p style="margin: 0; color: #6b7280; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Booking ID</p>
                    <p style="margin: 5px 0 0 0; color: #111827; font-size: 18px; font-weight: bold; font-family: monospace;">${data.bookingId}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 15px 0; border-bottom: 1px solid #e5e7eb;">
                    <p style="margin: 0; color: #6b7280; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Event</p>
                    <p style="margin: 5px 0 0 0; color: #111827; font-size: 16px; font-weight: 600;">${data.eventName}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 15px 0; border-bottom: 1px solid #e5e7eb;">
                    <p style="margin: 0; color: #6b7280; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Date & Time</p>
                    <p style="margin: 5px 0 0 0; color: #111827; font-size: 16px;">${formattedDate}</p>
                    <p style="margin: 5px 0 0 0; color: #111827; font-size: 16px;">${data.eventTime}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 15px 0; border-bottom: 1px solid #e5e7eb;">
                    <p style="margin: 0; color: #6b7280; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Venue</p>
                    <p style="margin: 5px 0 0 0; color: #111827; font-size: 16px; font-weight: 600;">${data.venueName}</p>
                    <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 14px;">${data.venueAddress}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 15px 0; border-bottom: 1px solid #e5e7eb;">
                    <p style="margin: 0; color: #6b7280; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Number of People</p>
                    <p style="margin: 5px 0 0 0; color: #111827; font-size: 16px;">${data.numberOfPeople} ${data.numberOfPeople === 1 ? "person" : "people"}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 15px 0;">
                    <p style="margin: 0; color: #6b7280; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Total Amount</p>
                    <p style="margin: 5px 0 0 0; color: #9333ea; font-size: 24px; font-weight: bold;">₹${data.totalPrice.toLocaleString()}</p>
                  </td>
                </tr>
              </table>
              
              <!-- QR Code Section -->
              <div style="text-align: center; margin: 30px 0; padding: 30px; background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%); border-radius: 8px;">
                <p style="margin: 0 0 20px 0; color: #374151; font-size: 16px; font-weight: 600;">Your Entry Pass QR Code</p>
                <p style="margin: 0 0 20px 0; color: #6b7280; font-size: 14px;">Show this QR code at the venue for entry</p>
                <img src="${data.qrCodeUrl}" alt="QR Code" style="max-width: 250px; width: 100%; height: auto; border: 4px solid #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);" />
                <p style="margin: 20px 0 0 0; color: #6b7280; font-size: 12px; font-family: monospace;">${data.bookingId}</p>
              </div>
              
              <!-- Important Notes -->
              <div style="margin: 30px 0; padding: 20px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px;">
                <p style="margin: 0 0 10px 0; color: #92400e; font-size: 14px; font-weight: 600;">📌 Important Information</p>
                <ul style="margin: 0; padding-left: 20px; color: #92400e; font-size: 14px; line-height: 1.8;">
                  <li>Please arrive on time for the event</li>
                  <li>Bring a valid ID for verification</li>
                  <li>Show your QR code at the venue entrance</li>
                  <li>Keep this email for your records</li>
                </ul>
              </div>
              
              <p style="margin: 30px 0 0 0; color: #374151; font-size: 16px; line-height: 1.6;">
                We look forward to seeing you at the event! If you have any questions, feel free to contact us.
              </p>
              
              <p style="margin: 30px 0 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                Best regards,<br>
                <strong>The ClubRadar Team</strong>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 12px;">
                This is an automated confirmation email. Please do not reply to this email.
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 11px;">
                © ${new Date().getFullYear()} ClubRadar. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    // Send email using Resend
    const resend = getResend();
    if (!resend) {
      console.warn("Resend not configured, skipping email send");
      return NextResponse.json(
        { success: false, message: "Email service not configured" },
        { status: 200 }
      );
    }

    const emailResult = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "ClubRadar <onboarding@resend.dev>",
      to: data.userEmail,
      subject: `Booking Confirmed: ${data.eventName} - ClubRadar`,
      html: htmlEmail,
    });

    if (emailResult.error) {
      console.error("Error sending email:", emailResult.error);
      return NextResponse.json(
        { success: false, error: emailResult.error },
        { status: 200 } // Don't fail the booking if email fails
      );
    }

    return NextResponse.json(
      { success: true, messageId: emailResult.data?.id },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error in send-confirmation-email:", error);
    // Don't fail the booking if email fails
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 200 }
    );
  }
}

