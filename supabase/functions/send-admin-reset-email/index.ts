import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const TOKEN_EXPIRY_MS = 30 * 60 * 1000; // 30 minutes

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { action, token, newPassword } = await req.json();

    if (action === "send-reset") {
      const { data: emailSetting } = await supabase
        .from("admin_settings")
        .select("value")
        .eq("key", "admin_email")
        .single();

      const adminEmail = emailSetting?.value || "deshmukhgagan45@gmail.com";

      // Generate token with timestamp
      const resetToken = crypto.randomUUID();
      const tokenData = JSON.stringify({ token: resetToken, created_at: Date.now() });
      
      const { error: upsertError } = await supabase
        .from("admin_settings")
        .upsert({ key: "admin_reset_token", value: tokenData, updated_at: new Date().toISOString() }, { onConflict: "key" });
      
      if (upsertError) {
        console.error("Upsert error:", upsertError);
      }

      const resetLink = `https://printdukan.in/admin-reset-password?token=${resetToken}`;

      if (resendApiKey) {
        const emailRes = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${resendApiKey}`,
          },
          body: JSON.stringify({
            from: "PrintDukan <onboarding@resend.dev>",
            to: [adminEmail],
            subject: "Admin Password Reset - PrintDukan",
            html: `
              <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;">
                <h2 style="color:#1a1a1a;">Password Reset Request</h2>
                <p>You requested a password reset for your PrintDukan Admin Panel.</p>
                <a href="${resetLink}" style="display:inline-block;background:#E53E3E;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin:16px 0;">Reset Password</a>
                <p style="color:#666;font-size:13px;">If you didn't request this, you can ignore this email.</p>
                <p style="color:#E53E3E;font-size:13px;font-weight:bold;">⏰ This link will expire in 30 minutes.</p>
              </div>
            `,
          }),
        });
        
        if (!emailRes.ok) {
          const errText = await emailRes.text();
          console.error("Resend error:", errText);
          return new Response(JSON.stringify({ error: "Failed to send email" }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Helper to validate token
    const validateToken = async (inputToken: string) => {
      const { data: tokenSetting } = await supabase
        .from("admin_settings")
        .select("value")
        .eq("key", "admin_reset_token")
        .single();

      if (!tokenSetting?.value || tokenSetting.value === "") return false;

      try {
        const parsed = JSON.parse(tokenSetting.value);
        if (parsed.token !== inputToken) return false;
        
        // Check 5 minute expiry
        const elapsed = Date.now() - parsed.created_at;
        if (elapsed > TOKEN_EXPIRY_MS) return false;
        
        return true;
      } catch {
        return false;
      }
    };

    if (action === "verify-token") {
      const valid = await validateToken(token);
      return new Response(JSON.stringify({ valid }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "reset-password") {
      const valid = await validateToken(token);
      if (!valid) {
        return new Response(JSON.stringify({ error: "Invalid or expired token (30 min limit)" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      await supabase
        .from("admin_settings")
        .upsert({ key: "admin_password", value: newPassword, updated_at: new Date().toISOString() }, { onConflict: "key" });

      // Clear token
      await supabase
        .from("admin_settings")
        .upsert({ key: "admin_reset_token", value: "", updated_at: new Date().toISOString() }, { onConflict: "key" });

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    const message = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
