-- Create enum for organization roles
CREATE TYPE public.org_role AS ENUM ('admin', 'manager', 'employee');

-- Create enum for spending categories
CREATE TYPE public.spending_category AS ENUM ('lunch', 'corporate_event', 'office_kitchen', 'other');

-- Organizations table
CREATE TABLE public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  inn TEXT,
  kpp TEXT,
  legal_address TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Organization members (links profiles to organizations with roles)
CREATE TABLE public.org_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role org_role NOT NULL DEFAULT 'employee',
  monthly_limit NUMERIC DEFAULT 15000,
  current_month_spent NUMERIC DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, user_id)
);

-- Organization balance
CREATE TABLE public.org_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE UNIQUE,
  balance NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Balance transactions history
CREATE TABLE public.org_balance_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('deposit', 'order_payment', 'refund', 'cashback')),
  description TEXT,
  order_id UUID REFERENCES public.orders(id),
  user_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Co-op carts (shared carts for organizations)
CREATE TABLE public.coop_carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Общая корзина',
  deadline_time TIME NOT NULL DEFAULT '11:00:00',
  auto_order_time TIME NOT NULL DEFAULT '11:15:00',
  is_active BOOLEAN DEFAULT true,
  delivery_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Co-op cart items
CREATE TABLE public.coop_cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id UUID NOT NULL REFERENCES public.coop_carts(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  product_name TEXT NOT NULL,
  product_image TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC NOT NULL,
  added_by UUID NOT NULL,
  spending_category spending_category DEFAULT 'lunch',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Organization invoices
CREATE TABLE public.org_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  invoice_number TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
  due_date DATE,
  paid_at TIMESTAMPTZ,
  pdf_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- UPD documents (Универсальный передаточный документ)
CREATE TABLE public.org_upd_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  document_number TEXT NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_amount NUMERIC NOT NULL,
  pdf_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_balance_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coop_carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coop_cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_upd_documents ENABLE ROW LEVEL SECURITY;

-- Security definer function to check org role
CREATE OR REPLACE FUNCTION public.has_org_role(_user_id UUID, _org_id UUID, _role org_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.org_members
    WHERE user_id = _user_id
      AND organization_id = _org_id
      AND role = _role
      AND is_active = true
  )
$$;

-- Function to check if user is org member
CREATE OR REPLACE FUNCTION public.is_org_member(_user_id UUID, _org_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.org_members
    WHERE user_id = _user_id
      AND organization_id = _org_id
      AND is_active = true
  )
$$;

-- Function to get user's organization ID
CREATE OR REPLACE FUNCTION public.get_user_org_id(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT organization_id
  FROM public.org_members
  WHERE user_id = _user_id
    AND is_active = true
  LIMIT 1
$$;

-- RLS Policies for organizations
CREATE POLICY "Org members can view their organization"
  ON public.organizations FOR SELECT
  USING (public.is_org_member(auth.uid(), id));

CREATE POLICY "Admins can update their organization"
  ON public.organizations FOR UPDATE
  USING (public.has_org_role(auth.uid(), id, 'admin'));

-- RLS Policies for org_members
CREATE POLICY "Members can view org members"
  ON public.org_members FOR SELECT
  USING (public.is_org_member(auth.uid(), organization_id));

CREATE POLICY "Admins can manage org members"
  ON public.org_members FOR ALL
  USING (public.has_org_role(auth.uid(), organization_id, 'admin'));

-- RLS Policies for org_balances
CREATE POLICY "Members can view org balance"
  ON public.org_balances FOR SELECT
  USING (public.is_org_member(auth.uid(), organization_id));

CREATE POLICY "Admins can manage org balance"
  ON public.org_balances FOR ALL
  USING (public.has_org_role(auth.uid(), organization_id, 'admin'));

-- RLS Policies for org_balance_transactions
CREATE POLICY "Members can view balance transactions"
  ON public.org_balance_transactions FOR SELECT
  USING (public.is_org_member(auth.uid(), organization_id));

CREATE POLICY "System can insert balance transactions"
  ON public.org_balance_transactions FOR INSERT
  WITH CHECK (public.is_org_member(auth.uid(), organization_id));

-- RLS Policies for coop_carts
CREATE POLICY "Members can view coop carts"
  ON public.coop_carts FOR SELECT
  USING (public.is_org_member(auth.uid(), organization_id));

CREATE POLICY "Admins and managers can manage coop carts"
  ON public.coop_carts FOR ALL
  USING (
    public.has_org_role(auth.uid(), organization_id, 'admin') OR
    public.has_org_role(auth.uid(), organization_id, 'manager')
  );

-- RLS Policies for coop_cart_items
CREATE POLICY "Members can view coop cart items"
  ON public.coop_cart_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.coop_carts cc
      WHERE cc.id = cart_id
        AND public.is_org_member(auth.uid(), cc.organization_id)
    )
  );

CREATE POLICY "Members can add items to coop cart"
  ON public.coop_cart_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.coop_carts cc
      WHERE cc.id = cart_id
        AND public.is_org_member(auth.uid(), cc.organization_id)
    ) AND added_by = auth.uid()
  );

CREATE POLICY "Users can delete their own items"
  ON public.coop_cart_items FOR DELETE
  USING (added_by = auth.uid());

CREATE POLICY "Managers can delete any items"
  ON public.coop_cart_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.coop_carts cc
      WHERE cc.id = cart_id
        AND (
          public.has_org_role(auth.uid(), cc.organization_id, 'admin') OR
          public.has_org_role(auth.uid(), cc.organization_id, 'manager')
        )
    )
  );

-- RLS Policies for org_invoices
CREATE POLICY "Members can view org invoices"
  ON public.org_invoices FOR SELECT
  USING (public.is_org_member(auth.uid(), organization_id));

CREATE POLICY "Admins can manage org invoices"
  ON public.org_invoices FOR ALL
  USING (public.has_org_role(auth.uid(), organization_id, 'admin'));

-- RLS Policies for org_upd_documents
CREATE POLICY "Members can view UPD documents"
  ON public.org_upd_documents FOR SELECT
  USING (public.is_org_member(auth.uid(), organization_id));

-- Triggers for updated_at
CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_org_members_updated_at
  BEFORE UPDATE ON public.org_members
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_org_balances_updated_at
  BEFORE UPDATE ON public.org_balances
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_coop_carts_updated_at
  BEFORE UPDATE ON public.coop_carts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();