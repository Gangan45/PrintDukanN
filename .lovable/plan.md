

## Plan: Add "Name Pencils" to Admin Add Product

The issue is that "Name Pencils" is missing from the category dropdown in the Admin Products page. Two changes needed:

### Changes to `src/pages/admin/AdminProducts.tsx`

1. **Add "Name Pencils" to the `categories` array** (line 55-64) so it appears in the category dropdown when adding/editing products.

2. **Add Name Pencils case in `getCategoryDefaults`** (around line 260-342) with bulk pricing tiers matching the customize page logic:
   - 1 Pack: base price (₹299)
   - 2+ Packs: ₹149/pack
   - 5+ Packs: ₹129/pack  
   - 10+ Packs: ₹99/pack
   - 20+ Packs: ₹89/pack
   - 50+ Packs: ₹79/pack
   
   Fixed pricing (not editable), no variants needed.

