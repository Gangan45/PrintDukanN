// Detects "Upload Your Photo" placeholder slots in a product design template image.
// Sends the image to Lovable AI Gateway (Gemini) and gets back normalized slot rectangles.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface Slot {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  shape: "rect" | "circle" | "rounded";
  rotation: number;
}

const SYSTEM_PROMPT = `You are an expert at analyzing product mockup images for a photo-customization e-commerce site.

The image is a decorated product template (acrylic photo frame, collage, baby frame, etc.) that has one or more PLACEHOLDER regions where the customer's uploaded photo should appear. Placeholders typically look like:
- A gray, white, or light-colored box/circle/oval saying "Upload Your Photo" or "Your Photo Here"
- A clearly empty rectangular/circular area distinct from the surrounding decoration
- A solid muted-color region clearly intended to be replaced by a user photo

Your task: identify EVERY placeholder slot and return its bounding box.

Return values as NORMALIZED coordinates (0.0 to 1.0) where (0,0) is top-left of the image and (1,1) is bottom-right.
- x, y = top-left corner of the slot (normalized)
- width, height = size of the slot (normalized)
- shape = "rect" for rectangles, "circle" for round, "rounded" for rounded-rectangles
- rotation = rotation angle in degrees if visibly tilted, else 0

Order slots top-to-bottom then left-to-right. Be precise — if you see 5 placeholders, return exactly 5.
If the image has NO clear placeholders (it's just a decoration with no upload area), return an empty array.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { productId, imageUrl } = await req.json();
    if (!productId || !imageUrl) {
      return new Response(JSON.stringify({ error: "productId and imageUrl required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

    // Call Lovable AI Gateway with vision + tool calling for structured slot output
    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: [
              { type: "text", text: "Detect all photo placeholder slots in this product template image. Return precise normalized coordinates." },
              { type: "image_url", image_url: { url: imageUrl } },
            ],
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "report_slots",
              description: "Report detected photo placeholder slots with normalized 0-1 coordinates.",
              parameters: {
                type: "object",
                properties: {
                  slots: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        x: { type: "number", description: "Top-left x, normalized 0-1" },
                        y: { type: "number", description: "Top-left y, normalized 0-1" },
                        width: { type: "number", description: "Width, normalized 0-1" },
                        height: { type: "number", description: "Height, normalized 0-1" },
                        shape: { type: "string", enum: ["rect", "circle", "rounded"] },
                        rotation: { type: "number", description: "Degrees, 0 if not rotated" },
                      },
                      required: ["x", "y", "width", "height", "shape", "rotation"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["slots"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "report_slots" } },
      }),
    });

    if (!aiResp.ok) {
      const txt = await aiResp.text();
      console.error("AI gateway error:", aiResp.status, txt);
      if (aiResp.status === 429)
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Try again in a minute." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      if (aiResp.status === 402)
        return new Response(JSON.stringify({ error: "AI credits exhausted. Add credits in Settings → Workspace → Usage." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      return new Response(JSON.stringify({ error: "AI detection failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await aiResp.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("AI returned no tool call");
    const args = JSON.parse(toolCall.function.arguments);
    const rawSlots = args.slots || [];

    const slots: Slot[] = rawSlots.map((s: any, i: number) => ({
      id: `slot-${i + 1}`,
      x: Math.max(0, Math.min(1, Number(s.x) || 0)),
      y: Math.max(0, Math.min(1, Number(s.y) || 0)),
      width: Math.max(0.01, Math.min(1, Number(s.width) || 0.1)),
      height: Math.max(0.01, Math.min(1, Number(s.height) || 0.1)),
      shape: ["rect", "circle", "rounded"].includes(s.shape) ? s.shape : "rect",
      rotation: Number(s.rotation) || 0,
    }));

    // Persist to DB
    const supaUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supa = createClient(supaUrl, serviceKey);
    const { error: updErr } = await supa
      .from("products")
      .update({ photo_slots: slots, photo_count: Math.max(1, slots.length) })
      .eq("id", productId);
    if (updErr) throw updErr;

    return new Response(
      JSON.stringify({ success: true, slots, count: slots.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("detect-photo-slots error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
