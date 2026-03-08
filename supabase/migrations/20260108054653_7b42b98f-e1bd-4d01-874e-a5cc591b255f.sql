-- Add RLS policy to allow inserting order items for guest orders
CREATE POLICY "Allow insert order items for guest orders"
ON public.order_items
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = order_items.order_id
    AND orders.user_id IS NULL
  )
);