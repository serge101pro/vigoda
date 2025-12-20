-- Insert test organization
INSERT INTO public.organizations (id, name, inn, kpp, legal_address, contact_email, contact_phone)
VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'ООО «ТестКомпания»',
  '7707123456',
  '770701001',
  'г. Москва, ул. Тестовая, д. 1',
  'hr@testcompany.ru',
  '+7 (495) 123-45-67'
)
ON CONFLICT (id) DO NOTHING;

-- Insert organization balance
INSERT INTO public.org_balances (organization_id, balance)
VALUES ('550e8400-e29b-41d4-a716-446655440000', 150000)
ON CONFLICT (organization_id) DO NOTHING;

-- Insert test members (using placeholder UUIDs - these should be replaced with real user_ids after signup)
-- Admin member
INSERT INTO public.org_members (id, organization_id, user_id, role, monthly_limit, current_month_spent, is_active)
VALUES (
  '660e8400-e29b-41d4-a716-446655440001',
  '550e8400-e29b-41d4-a716-446655440000',
  '00000000-0000-0000-0000-000000000001',
  'admin',
  50000,
  12500,
  true
)
ON CONFLICT (organization_id, user_id) DO NOTHING;

-- Manager member
INSERT INTO public.org_members (id, organization_id, user_id, role, monthly_limit, current_month_spent, is_active)
VALUES (
  '660e8400-e29b-41d4-a716-446655440002',
  '550e8400-e29b-41d4-a716-446655440000',
  '00000000-0000-0000-0000-000000000002',
  'manager',
  25000,
  8700,
  true
)
ON CONFLICT (organization_id, user_id) DO NOTHING;

-- Employee members
INSERT INTO public.org_members (id, organization_id, user_id, role, monthly_limit, current_month_spent, is_active)
VALUES 
  ('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', '00000000-0000-0000-0000-000000000003', 'employee', 15000, 9800, true),
  ('660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440000', '00000000-0000-0000-0000-000000000004', 'employee', 15000, 14200, true),
  ('660e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440000', '00000000-0000-0000-0000-000000000005', 'employee', 15000, 6500, true)
ON CONFLICT (organization_id, user_id) DO NOTHING;

-- Insert balance transactions history
INSERT INTO public.org_balance_transactions (organization_id, amount, type, description, created_at)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440000', 200000, 'deposit', 'Пополнение баланса по счёту INV-001', now() - interval '30 days'),
  ('550e8400-e29b-41d4-a716-446655440000', -15600, 'order_payment', 'Заказ обедов 01.12', now() - interval '20 days'),
  ('550e8400-e29b-41d4-a716-446655440000', -12800, 'order_payment', 'Заказ обедов 08.12', now() - interval '13 days'),
  ('550e8400-e29b-41d4-a716-446655440000', -18500, 'order_payment', 'Заказ обедов 15.12', now() - interval '6 days'),
  ('550e8400-e29b-41d4-a716-446655440000', 2680, 'cashback', 'Кэшбэк 2% за декабрь', now() - interval '1 day'),
  ('550e8400-e29b-41d4-a716-446655440000', -5780, 'order_payment', 'Офисная кухня', now() - interval '3 days');

-- Insert coop cart
INSERT INTO public.coop_carts (id, organization_id, name, deadline_time, auto_order_time, is_active, delivery_address)
VALUES (
  '770e8400-e29b-41d4-a716-446655440000',
  '550e8400-e29b-41d4-a716-446655440000',
  'Обеды на завтра',
  '11:00:00',
  '11:15:00',
  true,
  'г. Москва, ул. Тестовая, д. 1, офис 305'
)
ON CONFLICT (id) DO NOTHING;

-- Insert some items in coop cart
INSERT INTO public.coop_cart_items (cart_id, product_name, product_image, quantity, unit_price, added_by, spending_category)
VALUES 
  ('770e8400-e29b-41d4-a716-446655440000', 'Бизнес-ланч "Домашний"', NULL, 2, 450, '00000000-0000-0000-0000-000000000003', 'lunch'),
  ('770e8400-e29b-41d4-a716-446655440000', 'Салат Цезарь', NULL, 1, 320, '00000000-0000-0000-0000-000000000004', 'lunch'),
  ('770e8400-e29b-41d4-a716-446655440000', 'Суп дня', NULL, 3, 180, '00000000-0000-0000-0000-000000000005', 'lunch');

-- Insert test invoices
INSERT INTO public.org_invoices (organization_id, invoice_number, amount, status, due_date, created_at)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440000', 'INV-M4X7K9', 50000, 'paid', '2024-12-01', now() - interval '35 days'),
  ('550e8400-e29b-41d4-a716-446655440000', 'INV-N5Y8L0', 100000, 'paid', '2024-12-15', now() - interval '20 days'),
  ('550e8400-e29b-41d4-a716-446655440000', 'INV-O6Z9M1', 50000, 'pending', '2025-01-05', now() - interval '3 days');

-- Insert test UPD documents
INSERT INTO public.org_upd_documents (organization_id, document_number, period_start, period_end, total_amount, created_at)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440000', 'UPD-A1B2C3', '2024-11-01', '2024-11-30', 47800, now() - interval '25 days'),
  ('550e8400-e29b-41d4-a716-446655440000', 'UPD-D4E5F6', '2024-12-01', '2024-12-15', 31900, now() - interval '5 days');

-- Enable pg_cron and pg_net extensions for cron jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;