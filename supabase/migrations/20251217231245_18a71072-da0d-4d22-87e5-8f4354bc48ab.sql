-- Harden the handle_new_user function with input validation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Validate required fields
  IF NEW.id IS NULL THEN
    RAISE EXCEPTION 'Invalid user data: missing user ID';
  END IF;
  
  INSERT INTO public.profiles (id, user_id, display_name, email)
  VALUES (gen_random_uuid(), NEW.id, NEW.raw_user_meta_data ->> 'display_name', NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Add input validation constraints for recipes
ALTER TABLE recipes ADD CONSTRAINT recipe_name_length 
  CHECK (length(name) <= 200 AND length(name) > 0);

ALTER TABLE recipes ADD CONSTRAINT recipe_desc_length 
  CHECK (description IS NULL OR length(description) <= 2000);

ALTER TABLE recipes ADD CONSTRAINT recipe_category_length 
  CHECK (category IS NULL OR length(category) <= 50);

-- Add constraints for recipe_ingredients
ALTER TABLE recipe_ingredients ADD CONSTRAINT ingredient_name_length 
  CHECK (length(name) <= 200 AND length(name) > 0);

ALTER TABLE recipe_ingredients ADD CONSTRAINT ingredient_amount_length 
  CHECK (length(amount) <= 100 AND length(amount) > 0);

-- Add constraints for recipe_steps
ALTER TABLE recipe_steps ADD CONSTRAINT step_desc_length 
  CHECK (length(description) <= 2000 AND length(description) > 0);