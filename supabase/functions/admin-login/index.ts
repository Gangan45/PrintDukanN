import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ADMIN_EMAIL = "deshmukhgagan45@gmail.com";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { password } = await req.json();
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    // Verify admin password
    const { data: setting, error: settingError } = await supabaseAdmin
      .from("admin_settings")
      .select("value")
      .eq("key", "admin_password")
      .single();

    if (settingError || !setting || password !== setting.value) {
      return new Response(
        JSON.stringify({ error: "Invalid password" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Find the admin user
    const { data: { users }, error: usersError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (usersError) throw usersError;
    
    const adminUser = users.find(u => u.email === ADMIN_EMAIL);
    
    if (!adminUser) {
      return new Response(
        JSON.stringify({ error: "Admin user not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate a magic link for the admin user
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email: ADMIN_EMAIL,
    });

    if (linkError || !linkData) {
      throw linkError || new Error("Failed to generate link");
    }

    // Extract the token hash and use it to verify OTP
    const tokenHash = linkData.properties?.hashed_token;
    
    if (!tokenHash) {
      throw new Error("No token hash returned");
    }

    // Verify the OTP to get a session
    const { data: sessionData, error: sessionError } = await supabaseAdmin.auth.verifyOtp({
      token_hash: tokenHash,
      type: "magiclink",
    });

    if (sessionError || !sessionData.session) {
      throw sessionError || new Error("Failed to create session");
    }

    return new Response(
      JSON.stringify({ 
        session: sessionData.session 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("Admin login error:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
