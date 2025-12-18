-- Create subscription plans enum
CREATE TYPE public.subscription_plan AS ENUM ('free', 'solo', 'family', 'corp');

-- Create user subscriptions table
CREATE TABLE public.user_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan subscription_plan NOT NULL DEFAULT 'free',
  is_active BOOLEAN NOT NULL DEFAULT true,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can view their own subscription
CREATE POLICY "Users can view their own subscription"
ON public.user_subscriptions
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own subscription (for free tier signup)
CREATE POLICY "Users can create their own subscription"
ON public.user_subscriptions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_user_subscriptions_updated_at
BEFORE UPDATE ON public.user_subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create recipe subscriptions table (following authors)
CREATE TABLE public.recipe_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  author_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, author_id)
);

-- Enable RLS
ALTER TABLE public.recipe_subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can view their own subscriptions
CREATE POLICY "Users can view their own recipe subscriptions"
ON public.recipe_subscriptions
FOR SELECT
USING (auth.uid() = user_id);

-- Users can subscribe to authors
CREATE POLICY "Users can subscribe to authors"
ON public.recipe_subscriptions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can unsubscribe
CREATE POLICY "Users can unsubscribe from authors"
ON public.recipe_subscriptions
FOR DELETE
USING (auth.uid() = user_id);