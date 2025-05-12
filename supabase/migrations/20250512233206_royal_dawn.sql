/*
  # Create orders and notifications tables

  1. New Tables
    - `orders`
      - `id` (uuid, primary key)
      - `customer_info` (jsonb)
      - `order_items` (jsonb)
      - `pickup_info` (jsonb)
      - `total_amount` (numeric)
      - `status` (text)
      - `created_at` (timestamp)
    - `order_notifications`
      - `id` (uuid, primary key)
      - `order_id` (uuid, foreign key)
      - `type` (text)
      - `status` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated staff access
*/

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_info jsonb NOT NULL,
    order_items jsonb NOT NULL,
    pickup_info jsonb NOT NULL,
    total_amount numeric NOT NULL,
    status text NOT NULL DEFAULT 'pending',
    created_at timestamptz DEFAULT now()
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS order_notifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id uuid REFERENCES orders(id),
    type text NOT NULL,
    status text NOT NULL DEFAULT 'pending',
    created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_notifications ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Staff can read orders"
    ON orders
    FOR SELECT
    TO authenticated
    USING (auth.role() = 'staff');

CREATE POLICY "Staff can update orders"
    ON orders
    FOR UPDATE
    TO authenticated
    USING (auth.role() = 'staff');

CREATE POLICY "Staff can read notifications"
    ON order_notifications
    FOR SELECT
    TO authenticated
    USING (auth.role() = 'staff');