-- Schedule cron job for processing coop cart at 11:15 Moscow time (08:15 UTC)
SELECT cron.schedule(
  'process-coop-cart-daily',
  '15 8 * * *',
  $$
  SELECT net.http_post(
    url:='https://ryhwcwnlcuqzbnnfhskq.supabase.co/functions/v1/process-coop-cart',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5aHdjd25sY3VxemJubmZoc2txIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU0OTI5MTksImV4cCI6MjA4MTA2ODkxOX0.f1DzXQuhgrPcL34rG78QsPq89y1OGFxR1j3yeN9NpDw"}'::jsonb,
    body:='{}'::jsonb
  ) as request_id;
  $$
);