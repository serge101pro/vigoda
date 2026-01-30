-- Create scheduled_notifications table for scheduling broadcasts
CREATE TABLE public.scheduled_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('push', 'email')),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  html_content TEXT,
  url TEXT DEFAULT '/',
  audience TEXT NOT NULL DEFAULT 'all',
  activity_filter TEXT,
  has_email_filter BOOLEAN DEFAULT false,
  has_push_filter BOOLEAN DEFAULT false,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  sent_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  total_count INTEGER DEFAULT 0,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT
);

-- Enable RLS
ALTER TABLE public.scheduled_notifications ENABLE ROW LEVEL SECURITY;

-- Only superadmins can manage scheduled notifications
CREATE POLICY "Superadmins can manage scheduled notifications" 
ON public.scheduled_notifications 
FOR ALL 
USING (is_superadmin(auth.uid()));

-- Index for processing pending notifications
CREATE INDEX idx_scheduled_notifications_pending ON public.scheduled_notifications (scheduled_at) 
WHERE status = 'pending';

-- Add last_active_at to profiles for activity tracking
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMP WITH TIME ZONE DEFAULT now();