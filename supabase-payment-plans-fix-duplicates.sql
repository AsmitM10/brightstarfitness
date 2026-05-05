-- FIX DUPLICATES: Keep only 1 plan for each price
-- Run this in Supabase SQL Editor

-- First, check how many plans exist
SELECT name, price, COUNT(*) as count 
FROM payment_plans 
GROUP BY name, price;

-- Delete all plans (to start fresh)
DELETE FROM payment_plans;

-- Insert exactly 3 plans (1 for each price)
INSERT INTO payment_plans (name, price, duration_months, features, is_active) VALUES
('Monthly', 1000, 1, ARRAY['Access to all sessions', '6 daily time slots', 'Telegram notifications', 'Attendance tracking', 'Referral program'], true),
('Quarterly', 3500, 3, ARRAY['Access to all sessions', '6 daily time slots', 'Telegram notifications', 'Attendance tracking', 'Referral program', 'Save ₹500', 'Priority support'], true),
('Yearly', 10500, 12, ARRAY['Access to all sessions', '6 daily time slots', 'Telegram notifications', 'Attendance tracking', 'Referral program', 'Save ₹1500', 'Priority support', 'Exclusive workshops', 'Personalized feedback'], true);

-- Verify exactly 3 plans exist (1 for each price)
SELECT * FROM payment_plans;
