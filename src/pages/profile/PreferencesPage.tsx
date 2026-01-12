import { useState, useEffect } from 'react';
import { ArrowLeft, Loader2, Check, Store, Utensils, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const DIETARY_OPTIONS = [
  { id: 'vegetarian', label: 'Вегетарианство', emoji: '🥬' },
  { id: 'vegan', label: 'Веганство', emoji: '🌱' },
  { id: 'gluten-free', label: 'Без глютена', emoji: '🌾' },
  { id: 'lactose-free', label: 'Без лактозы', emoji: '🥛' },
  { id: 'keto', label: 'Кето-диета', emoji: '🥑' },
  { id: 'halal', label: 'Халяль', emoji: '☪️' },
  { id: 'kosher', label: 'Кошерное', emoji: '✡️' },
  { id: 'low-sugar', label: 'Без сахара', emoji: '🍬' },
];

const STORES = [
  { id: 'pyaterochka', name: 'Пятёрочка', logo: '🟢' },
  { id: 'magnit', name: 'Магнит', logo: '🔴' },
  { id: 'perekrestok', name: 'Перекрёсток', logo: '🟡' },
  { id: 'vkusvill', name: 'ВкусВилл', logo: '🟢' },
  { id: 'lenta', name: 'Лента', logo: '🔵' },
  { id: 'auchan', name: 'Ашан', logo: '🟠' },
  { id: 'metro', name: 'METRO', logo: '🔵' },
  { id: 'dixy', name: 'Дикси', logo: '🟠' },
];

interface Preferences {
  dietary_restrictions: string[];
  favorite_stores: string[];
  monthly_budget: number;
}

export default function PreferencesPage() {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState<Preferences>({
    dietary_restrictions: [],
    favorite_stores: ['pyaterochka', 'magnit', 'vkusvill'],
    monthly_budget: 45000,
  });

  useEffect(() => {
    if (user) {
      fetchPreferences();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchPreferences = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setPreferences({
          dietary_restrictions: data.dietary_restrictions || [],
          favorite_stores: data.favorite_stores || [],
          monthly_budget: Number(data.monthly_budget) || 45000,
        });
      }
    } catch (err) {
      console.error('Error fetching preferences:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleDietary = (id: string) => {
    setPreferences(prev => ({
      ...prev,
      dietary_restrictions: prev.dietary_restrictions.includes(id)
        ? prev.dietary_restrictions.filter(d => d !== id)
        : [...prev.dietary_restrictions, id]
    }));
  };

  const toggleStore = (id: string) => {
    setPreferences(prev => ({
      ...prev,
      favorite_stores: prev.favorite_stores.includes(id)
        ? prev.favorite_stores.filter(s => s !== id)
        : [...prev.favorite_stores, id]
    }));
  };

  const handleSave = async () => {
    if (!user) {
      toast({ title: 'Войдите в аккаунт', variant: 'destructive' });
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          dietary_restrictions: preferences.dietary_restrictions,
          favorite_stores: preferences.favorite_stores,
          monthly_budget: preferences.monthly_budget,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });

      if (error) throw error;

      toast({ title: 'Предпочтения сохранены' });
    } catch (err) {
      console.error('Error saving preferences:', err);
      toast({ title: 'Ошибка сохранения', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="page-container flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border/50">
        <div className="px-4 py-3">
          <div className="flex items-center gap-3">
            <Link to="/profile/settings">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold text-foreground">Предпочтения и Ограничения</h1>
          </div>
        </div>
      </header>

      <div className="px-4 py-2">
        <Breadcrumbs />
      </div>

      <div className="px-4 py-4 space-y-6">
        {/* Dietary Restrictions */}
        <section className="bg-card rounded-2xl border border-border p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
              <Utensils className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <h3 className="font-bold text-foreground">Диетические ограничения</h3>
              <p className="text-sm text-muted-foreground">Выберите ваши диеты и ограничения</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {DIETARY_OPTIONS.map(option => (
              <button
                key={option.id}
                onClick={() => toggleDietary(option.id)}
                className={`
                  flex items-center gap-2 p-3 rounded-xl border-2 transition-all text-left
                  ${preferences.dietary_restrictions.includes(option.id)
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50'
                  }
                `}
              >
                <span className="text-lg">{option.emoji}</span>
                <span className="text-sm font-medium">{option.label}</span>
                {preferences.dietary_restrictions.includes(option.id) && (
                  <Check className="h-4 w-4 text-primary ml-auto" />
                )}
              </button>
            ))}
          </div>
        </section>

        {/* Favorite Stores */}
        <section className="bg-card rounded-2xl border border-border p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
              <Store className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <h3 className="font-bold text-foreground">Любимые магазины</h3>
              <p className="text-sm text-muted-foreground">Приоритет при сравнении цен</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {STORES.map(store => (
              <button
                key={store.id}
                onClick={() => toggleStore(store.id)}
                className={`
                  flex items-center gap-2 p-3 rounded-xl border-2 transition-all text-left
                  ${preferences.favorite_stores.includes(store.id)
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50'
                  }
                `}
              >
                <span className="text-lg">{store.logo}</span>
                <span className="text-sm font-medium">{store.name}</span>
                {preferences.favorite_stores.includes(store.id) && (
                  <Check className="h-4 w-4 text-primary ml-auto" />
                )}
              </button>
            ))}
          </div>
        </section>

        {/* Monthly Budget */}
        <section className="bg-card rounded-2xl border border-border p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <h3 className="font-bold text-foreground">Месячный бюджет</h3>
              <p className="text-sm text-muted-foreground">Для аналитики и рекомендаций</p>
            </div>
          </div>

          <div className="relative">
            <Input
              type="number"
              value={preferences.monthly_budget}
              onChange={(e) => setPreferences(prev => ({ ...prev, monthly_budget: Number(e.target.value) }))}
              className="pr-8"
              placeholder="45000"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">₽</span>
          </div>
        </section>

        {/* Save Button */}
        {user && (
          <Button onClick={handleSave} disabled={saving} className="w-full" size="lg">
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Check className="h-4 w-4 mr-2" />}
            Сохранить предпочтения
          </Button>
        )}

        {/* Info for non-authenticated users */}
        {!user && (
          <div className="bg-primary/10 rounded-2xl p-4 text-center">
            <p className="text-sm text-foreground mb-3">
              Войдите в аккаунт, чтобы сохранить ваши предпочтения
            </p>
            <Link to="/auth/login">
              <Button variant="hero">Войти</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
