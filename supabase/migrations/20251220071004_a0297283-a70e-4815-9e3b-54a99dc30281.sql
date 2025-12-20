-- Add telegram_chat_id to profiles for personal notifications
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS telegram_chat_id TEXT;

-- Add telegram_chat_id to organizations for group notifications
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS telegram_chat_id TEXT;

-- Create order approval system table
CREATE TABLE public.order_approvals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL,
  requested_by UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  approved_by UUID,
  approved_at TIMESTAMP WITH TIME ZONE,
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.order_approvals ENABLE ROW LEVEL SECURITY;

-- RLS policies for order_approvals
CREATE POLICY "Members can view org approvals"
ON public.order_approvals
FOR SELECT
USING (is_org_member(auth.uid(), organization_id));

CREATE POLICY "Users can request approval"
ON public.order_approvals
FOR INSERT
WITH CHECK (auth.uid() = requested_by AND is_org_member(auth.uid(), organization_id));

CREATE POLICY "Managers can update approvals"
ON public.order_approvals
FOR UPDATE
USING (
  has_org_role(auth.uid(), organization_id, 'admin') OR 
  has_org_role(auth.uid(), organization_id, 'manager')
);

-- Create trigger for updated_at
CREATE TRIGGER update_order_approvals_updated_at
BEFORE UPDATE ON public.order_approvals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add approval_required column to coop_carts
ALTER TABLE public.coop_carts ADD COLUMN IF NOT EXISTS approval_required BOOLEAN DEFAULT false;

-- Add approval_threshold to organizations (orders above this amount require approval)
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS approval_threshold NUMERIC DEFAULT 5000;