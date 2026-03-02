import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ADMIN_EMAIL = "deshmukhgagan45@gmail.com";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    // Ensure admin user exists
    const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
    let adminUser = users?.find(u => u.email === ADMIN_EMAIL);

    if (!adminUser) {
      // Create admin user with a random password
      const randomPass = crypto.randomUUID() + "Aa1!";
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: ADMIN_EMAIL,
        password: randomPass,
        email_confirm: true,
      });
      if (createError) throw createError;
      adminUser = newUser.user;

      // Assign admin role
      await supabaseAdmin.from("user_roles").insert({
        user_id: adminUser!.id,
        role: "admin",
      });
    }

    // Get the site URL for redirect
    const siteUrl = Deno.env.get("SITE_URL") || supabaseUrl.replace(".supabase.co", ".lovable.app");

    // Send password reset email via Supabase Auth
    const { error: resetError } = await supabaseAdmin.auth.admin.generateLink({
      type: "recovery",
      email: ADMIN_EMAIL,
      options: {
        redirectTo: `${siteUrl}/admin/reset-password`,
      },
    });

    if (resetError) {
      // Fallback: use resetPasswordForEmail
      const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
      const supabaseClient = createClient(supabaseUrl, anonKey);
      
      const { error: resetError2 } = await supabaseClient.auth.resetPasswordForEmail(ADMIN_EMAIL, {
        redirectTo: `${siteUrl}/admin/reset-password`,
      });

      if (resetError2) throw resetError2;
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("Admin forgot password error:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
