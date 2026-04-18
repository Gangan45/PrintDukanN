// Generates a high-quality product description using Lovable AI Gateway (Gemini).
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { productId, name, category } = await req.json();
    if (!productId || !name) {
      return new Response(JSON.stringify({ error: "productId and name required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

    const prompt = `Write a compelling product description for an Indian e-commerce print/gift product.

Product Name: ${name}
Category: ${category || "Personalized Gift"}

Requirements:
- 80-120 words, friendly and informative tone
- Highlight: premium materials, vibrant HD print quality, perfect for gifting
- Mention occasions: birthdays, anniversaries, weddings, corporate gifts, home decor (pick what fits)
- Mention key features: scratch-resistant, fade-proof, customizable with photos/text, ships from Jaipur/Bengaluru
- End with a soft call to action
- Plain text only — NO markdown, no bullet points, no headings
- Sound natural, not AI-generated`;

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You write concise, persuasive Indian e-commerce product descriptions in plain text." },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!aiResp.ok) {
      const txt = await aiResp.text();
      console.error("AI error:", aiResp.status, txt);
      if (aiResp.status === 429)
        return new Response(JSON.stringify({ error: "Rate limit" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      if (aiResp.status === 402)
        return new Response(JSON.stringify({ error: "Credits exhausted" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      throw new Error("AI generation failed");
    }

    const data = await aiResp.json();
    const description = (data.choices?.[0]?.message?.content || "").trim();
    if (!description) throw new Error("Empty AI response");

    const supa = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { error } = await supa
      .from("products")
      .update({ description })
      .eq("id", productId);
    if (error) throw error;

    return new Response(JSON.stringify({ success: true, description }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-product-description error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
