-- RLS Policies for Payment Tables
-- Run this in Supabase SQL Editor after creating the tables

-- Enable RLS on all payment tables
ALTER TABLE payment_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Policy: Public can read payment plans
CREATE POLICY "Public can read payment plans" ON payment_plans
  FOR SELECT USING (true);

-- Policy: Users can read their own subscriptions
CREATE POLICY "Users can read own subscriptions" ON user_subscriptions
  FOR SELECT USING (auth.uid()::text = user_id::text);

-- Policy: Users can read their own payments
CREATE POLICY "Users can read own payments" ON payments
  FOR SELECT USING (auth.uid()::text = user_id::text);

-- Policy: Users can read their own invoices
CREATE POLICY "Users can read own invoices" ON invoices
  FOR SELECT USING (auth.uid()::text = user_id::text);

-- Note: Service role (used in backend APIs) bypasses RLS, so no policies needed for admin operations
