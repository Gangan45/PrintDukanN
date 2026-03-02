import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OrderItem {
  product_name: string;
  quantity: number;
  unit_price: number;
  selected_size?: string;
  selected_frame?: string;
  custom_image_url?: string;
  custom_text?: string;
  category?: string;
}

interface OrderNotificationRequest {
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  shippingAddress: string;
  totalAmount: number;
  items: OrderItem[];
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Admin notification function called");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      orderId,
      orderNumber,
      customerName,
      customerEmail,
      shippingAddress,
      totalAmount,
      items,
    }: OrderNotificationRequest = await req.json();

    console.log(`Processing notification for order: ${orderNumber}`);

    // Build order items HTML with customization details
    const itemsHtml = items
      .map((item) => {
        let customizationDetails = "";
        
        if (item.selected_size) {
          customizationDetails += `<p style="margin: 2px 0; color: #666; font-size: 13px;">Size: ${item.selected_size}</p>`;
        }
        if (item.selected_frame) {
          customizationDetails += `<p style="margin: 2px 0; color: #666; font-size: 13px;">Variant: ${item.selected_frame}</p>`;
        }
        if (item.category) {
          customizationDetails += `<p style="margin: 2px 0; color: #666; font-size: 13px;">Category: ${item.category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>`;
        }
        if (item.custom_text) {
          customizationDetails += `
            <div style="background: #fff3cd; padding: 8px; border-radius: 4px; margin-top: 8px;">
              <p style="margin: 0; font-size: 12px; color: #856404; font-weight: bold;">Custom Text:</p>
              <p style="margin: 4px 0 0 0; color: #856404;">${item.custom_text}</p>
            </div>
          `;
        }
        
        // Add image thumbnail if custom design was uploaded
        let imageHtml = "";
        if (item.custom_image_url) {
          imageHtml = `
            <div style="margin-top: 8px;">
              <p style="margin: 0 0 4px 0; font-size: 12px; color: #28a745; font-weight: bold;">📎 Custom Design Uploaded</p>
              <img src="${item.custom_image_url}" alt="Custom Design" style="max-width: 150px; max-height: 150px; border: 2px solid #28a745; border-radius: 4px;" />
            </div>
          `;
        }

        return `
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 15px;">
              <p style="margin: 0; font-weight: bold; color: #333;">${item.product_name}</p>
              ${customizationDetails}
              ${imageHtml}
            </td>
            <td style="padding: 15px; text-align: center;">${item.quantity}</td>
            <td style="padding: 15px; text-align: right;">₹${item.unit_price.toLocaleString()}</td>
            <td style="padding: 15px; text-align: right; font-weight: bold;">₹${(item.quantity * item.unit_price).toLocaleString()}</td>
          </tr>
        `;
      })
      .join("");

    const hasCustomizations = items.some(
      (item) => item.custom_text || item.custom_image_url
    );

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #ff6b35, #f7931e); padding: 25px; text-align: center;">
            <h1 style="margin: 0; color: white; font-size: 24px;">🛒 New Order Received!</h1>
            <p style="margin: 10px 0 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">Order #${orderNumber}</p>
          </div>

          ${hasCustomizations ? `
          <!-- Customization Alert -->
          <div style="background: #d4edda; border-left: 4px solid #28a745; padding: 15px; margin: 0;">
            <p style="margin: 0; color: #155724; font-weight: bold;">
              ⚠️ This order contains customized products - Please review designs below
            </p>
          </div>
          ` : ''}

          <!-- Customer Info -->
          <div style="padding: 20px; background: #f8f9fa;">
            <h2 style="margin: 0 0 15px 0; color: #333; font-size: 18px;">Customer Details</h2>
            <table style="width: 100%; font-size: 14px;">
              <tr>
                <td style="padding: 5px 0; color: #666; width: 120px;">Name:</td>
                <td style="padding: 5px 0; color: #333; font-weight: 500;">${customerName}</td>
              </tr>
              <tr>
                <td style="padding: 5px 0; color: #666;">Email:</td>
                <td style="padding: 5px 0; color: #333;">${customerEmail}</td>
              </tr>
            </table>
          </div>

          <!-- Shipping Address -->
          <div style="padding: 20px; border-bottom: 1px solid #eee;">
            <h2 style="margin: 0 0 10px 0; color: #333; font-size: 18px;">📍 Shipping Address</h2>
            <p style="margin: 0; color: #666; white-space: pre-line; line-height: 1.6;">${shippingAddress}</p>
          </div>

          <!-- Order Items -->
          <div style="padding: 20px;">
            <h2 style="margin: 0 0 15px 0; color: #333; font-size: 18px;">Order Items</h2>
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <thead>
                <tr style="background: #f8f9fa;">
                  <th style="padding: 12px; text-align: left; color: #666; font-weight: 600;">Product</th>
                  <th style="padding: 12px; text-align: center; color: #666; font-weight: 600;">Qty</th>
                  <th style="padding: 12px; text-align: right; color: #666; font-weight: 600;">Price</th>
                  <th style="padding: 12px; text-align: right; color: #666; font-weight: 600;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
          </div>

          <!-- Total -->
          <div style="padding: 20px; background: #f8f9fa; text-align: right;">
            <p style="margin: 0; font-size: 20px; color: #333;">
              <strong>Order Total: </strong>
              <span style="color: #ff6b35; font-weight: bold;">₹${totalAmount.toLocaleString()}</span>
            </p>
          </div>

          <!-- Footer -->
          <div style="padding: 20px; text-align: center; background: #333; color: #999; font-size: 12px;">
            <p style="margin: 0;">This is an automated notification from PrintDukan</p>
            <p style="margin: 10px 0 0 0;">© ${new Date().getFullYear()} PrintDukan. All rights reserved.</p>
          </div>

        </div>
      </body>
      </html>
    `;

    // Send email to admin
    // Note: Update this email to your actual admin email
    const adminEmail = "moolapravalesh5@gmail.com"; // Change this to your admin email
    
    const emailResponse = await resend.emails.send({
      from: "PrintDukan Orders <onboarding@resend.dev>", // Use your verified domain
      to: [adminEmail],
      subject: `🛒 New Order #${orderNumber} - ${hasCustomizations ? '⚠️ Contains Customizations' : 'Standard Order'}`,
      html: emailHtml,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-admin-notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);