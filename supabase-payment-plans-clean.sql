-- Check for existing plans
SELECT * FROM payment_plans;

-- If duplicates exist, delete all and re-insert
DELETE FROM payment_plans;

-- Insert the 3 plans (only once)
INSERT INTO payment_plans (name, price, duration_months, features, is_active) VALUES
('Monthly', 1000, 1, ARRAY['Access to all sessions', '6 daily time slots', 'Telegram notifications', 'Attendance tracking', 'Referral program'], true),
('Quarterly', 3500, 3, ARRAY['Access to all sessions', '6 daily time slots', 'Telegram notifications', 'Attendance tracking', 'Referral program', 'Save ₹500', 'Priority support'], true),
('Yearly', 10500, 12, ARRAY['Access to all sessions', '6 daily time slots', 'Telegram notifications', 'Attendance tracking', 'Referral program', 'Save ₹1500', 'Priority support', 'Exclusive workshops', 'Personalized feedback'], true);

-- Verify only 3 plans exist
SELECT * FROM payment_plans;
