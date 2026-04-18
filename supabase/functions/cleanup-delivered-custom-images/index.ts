// Auto-cleanup custom design images for orders delivered more than 5 days ago.
// Runs on a daily cron schedule. Frees storage space while keeping the order
// record so admins can still see what was ordered (the URL becomes a 404
// after cleanup, which is intentional).

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const BUCKET = "product-images";
const DAYS_AFTER_DELIVERY = 5;

/**
 * Extract the storage object path from a Supabase public URL.
 * e.g. https://xxx.supabase.co/storage/v1/object/public/product-images/customize-images/foo/bar.png
 *      -> "customize-images/foo/bar.png"
 */
function extractStoragePath(publicUrl: string, bucket: string): string | null {
  if (!publicUrl) return null;
  const marker = `/storage/v1/object/public/${bucket}/`;
  const idx = publicUrl.indexOf(marker);
  if (idx === -1) return null;
  return decodeURIComponent(publicUrl.substring(idx + marker.length));
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Find delivered orders older than N days that still have un-cleaned
    // custom images attached.
    const cutoffIso = new Date(
      Date.now() - DAYS_AFTER_DELIVERY * 24 * 60 * 60 * 1000,
    ).toISOString();

    const { data: items, error: selectError } = await supabase
      .from("order_items")
      .select("id, custom_image_url, order_id, orders!inner(status, updated_at)")
      .not("custom_image_url", "is", null)
      .is("custom_image_deleted_at", null)
      .eq("orders.status", "delivered")
      .lt("orders.updated_at", cutoffIso)
      .limit(500);

    if (selectError) throw selectError;

    if (!items || items.length === 0) {
      return new Response(
        JSON.stringify({ success: true, processed: 0, message: "Nothing to clean" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const pathsToDelete: string[] = [];
    const itemIds: string[] = [];

    for (const item of items) {
      const path = extractStoragePath(item.custom_image_url as string, BUCKET);
      if (path) {
        pathsToDelete.push(path);
        itemIds.push(item.id as string);
      } else {
        // URL not in our bucket — just mark it cleaned so we stop checking it.
        itemIds.push(item.id as string);
      }
    }

    let deletedFiles = 0;
    if (pathsToDelete.length > 0) {
      const { data: removed, error: removeError } = await supabase.storage
        .from(BUCKET)
        .remove(pathsToDelete);
      if (removeError) {
        console.error("Storage remove error:", removeError);
      } else {
        deletedFiles = removed?.length ?? 0;
      }
    }

    // Mark all processed items as cleaned (even if file was already missing,
    // so we don't keep trying).
    const { error: updateError } = await supabase
      .from("order_items")
      .update({ custom_image_deleted_at: new Date().toISOString() })
      .in("id", itemIds);

    if (updateError) throw updateError;

    return new Response(
      JSON.stringify({
        success: true,
        processed: itemIds.length,
        deletedFiles,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("cleanup-delivered-custom-images error:", err);
    return new Response(
      JSON.stringify({ success: false, error: (err as Error).message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
