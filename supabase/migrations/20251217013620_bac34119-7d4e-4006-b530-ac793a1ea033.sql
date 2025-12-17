-- Create products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL,
  old_price NUMERIC(10, 2),
  unit TEXT NOT NULL DEFAULT 'шт',
  image TEXT,
  category TEXT NOT NULL,
  badge TEXT CHECK (badge IN ('new', 'sale', 'hot')),
  rating NUMERIC(2, 1) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  in_stock BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create recipes table
CREATE TABLE public.recipes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  image TEXT,
  time_minutes INTEGER NOT NULL,
  servings INTEGER NOT NULL DEFAULT 2,
  calories INTEGER,
  protein INTEGER,
  fat INTEGER,
  carbs INTEGER,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')) DEFAULT 'medium',
  category TEXT,
  is_user_created BOOLEAN DEFAULT false,
  author_id UUID,
  rating NUMERIC(2, 1) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create recipe_ingredients table
CREATE TABLE public.recipe_ingredients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  amount TEXT NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL
);

-- Create recipe_steps table
CREATE TABLE public.recipe_steps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,
  description TEXT NOT NULL
);

-- Create meal_plans table
CREATE TABLE public.meal_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  image TEXT,
  days INTEGER NOT NULL DEFAULT 7,
  meals_per_day INTEGER NOT NULL DEFAULT 3,
  calories_per_day INTEGER,
  price NUMERIC(10, 2) NOT NULL,
  price_per_day NUMERIC(10, 2),
  discount INTEGER,
  tags TEXT[],
  rating NUMERIC(2, 1) DEFAULT 0,
  reviews INTEGER DEFAULT 0,
  is_popular BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  email TEXT,
  bonus_points INTEGER DEFAULT 0,
  total_savings NUMERIC(10, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create favorites table
CREATE TABLE public.favorites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  recipe_id UUID REFERENCES public.recipes(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT unique_user_product UNIQUE (user_id, product_id),
  CONSTRAINT unique_user_recipe UNIQUE (user_id, recipe_id),
  CONSTRAINT check_one_item CHECK (
    (product_id IS NOT NULL AND recipe_id IS NULL) OR 
    (product_id IS NULL AND recipe_id IS NOT NULL)
  )
);

-- Create shopping_lists table
CREATE TABLE public.shopping_lists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_shared BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create shopping_list_items table
CREATE TABLE public.shopping_list_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  list_id UUID NOT NULL REFERENCES public.shopping_lists(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  is_checked BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopping_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopping_list_items ENABLE ROW LEVEL SECURITY;

-- Products: public read, admin write
CREATE POLICY "Products are viewable by everyone" ON public.products FOR SELECT USING (true);

-- Recipes: public read, authenticated users can create their own
CREATE POLICY "Recipes are viewable by everyone" ON public.recipes FOR SELECT USING (true);
CREATE POLICY "Users can create their own recipes" ON public.recipes FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Users can update their own recipes" ON public.recipes FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Users can delete their own recipes" ON public.recipes FOR DELETE USING (auth.uid() = author_id);

-- Recipe ingredients: public read
CREATE POLICY "Recipe ingredients are viewable by everyone" ON public.recipe_ingredients FOR SELECT USING (true);
CREATE POLICY "Users can manage ingredients for their recipes" ON public.recipe_ingredients FOR ALL USING (
  EXISTS (SELECT 1 FROM public.recipes WHERE id = recipe_id AND author_id = auth.uid())
);

-- Recipe steps: public read
CREATE POLICY "Recipe steps are viewable by everyone" ON public.recipe_steps FOR SELECT USING (true);
CREATE POLICY "Users can manage steps for their recipes" ON public.recipe_steps FOR ALL USING (
  EXISTS (SELECT 1 FROM public.recipes WHERE id = recipe_id AND author_id = auth.uid())
);

-- Meal plans: public read
CREATE POLICY "Meal plans are viewable by everyone" ON public.meal_plans FOR SELECT USING (true);

-- Profiles: public read, users can update their own
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Favorites: users can manage their own
CREATE POLICY "Users can view their own favorites" ON public.favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can add favorites" ON public.favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove favorites" ON public.favorites FOR DELETE USING (auth.uid() = user_id);

-- Shopping lists: users can manage their own
CREATE POLICY "Users can view their own shopping lists" ON public.shopping_lists FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create shopping lists" ON public.shopping_lists FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own shopping lists" ON public.shopping_lists FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own shopping lists" ON public.shopping_lists FOR DELETE USING (auth.uid() = user_id);

-- Shopping list items: based on list ownership
CREATE POLICY "Users can view items in their lists" ON public.shopping_list_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.shopping_lists WHERE id = list_id AND user_id = auth.uid())
);
CREATE POLICY "Users can add items to their lists" ON public.shopping_list_items FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.shopping_lists WHERE id = list_id AND user_id = auth.uid())
);
CREATE POLICY "Users can update items in their lists" ON public.shopping_list_items FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.shopping_lists WHERE id = list_id AND user_id = auth.uid())
);
CREATE POLICY "Users can delete items from their lists" ON public.shopping_list_items FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.shopping_lists WHERE id = list_id AND user_id = auth.uid())
);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_recipes_updated_at BEFORE UPDATE ON public.recipes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_meal_plans_updated_at BEFORE UPDATE ON public.meal_plans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_shopping_lists_updated_at BEFORE UPDATE ON public.shopping_lists FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, user_id, display_name, email)
  VALUES (gen_random_uuid(), NEW.id, NEW.raw_user_meta_data ->> 'display_name', NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create indexes for better performance
CREATE INDEX idx_products_category ON public.products(category);
CREATE INDEX idx_recipes_category ON public.recipes(category);
CREATE INDEX idx_recipes_author ON public.recipes(author_id);
CREATE INDEX idx_favorites_user ON public.favorites(user_id);
CREATE INDEX idx_shopping_lists_user ON public.shopping_lists(user_id);
CREATE INDEX idx_shopping_list_items_list ON public.shopping_list_items(list_id);