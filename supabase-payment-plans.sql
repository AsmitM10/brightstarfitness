-- Insert Payment Plans into payment_plans table
-- Run this in Supabase SQL Editor

-- Insert Monthly Plan (₹1000)
INSERT INTO payment_plans (name, price, duration_months, features, is_active) VALUES
('Monthly', 1000, 1, ARRAY['Access to all sessions', '6 daily time slots', 'Telegram notifications', 'Attendance tracking', 'Referral program'], true);

-- Insert Quarterly Plan (₹3500)
INSERT INTO payment_plans (name, price, duration_months, features, is_active) VALUES
('Quarterly', 3500, 3, ARRAY['Access to all sessions', '6 daily time slots', 'Telegram notifications', 'Attendance tracking', 'Referral program', 'Save ₹500', 'Priority support'], true);

-- Insert Yearly Plan (₹10500)
INSERT INTO payment_plans (name, price, duration_months, features, is_active) VALUES
('Yearly', 10500, 12, ARRAY['Access to all sessions', '6 daily time slots', 'Telegram notifications', 'Attendance tracking', 'Referral program', 'Save ₹1500', 'Priority support', 'Exclusive workshops', 'Personalized feedback'], true);
