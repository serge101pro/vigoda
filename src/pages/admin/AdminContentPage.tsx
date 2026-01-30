import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { 
  FileText, Image, Utensils, Package, 
  Plus, Search, Edit, Trash2, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { BackButton } from '@/components/common/BackButton';
import { useSuperadmin } from '@/hooks/useSuperadmin';

export default function AdminContentPage() {
  const { isSuperadmin, loading: superadminLoading } = useSuperadmin();
  const [searchQuery, setSearchQuery] = useState('');

  if (superadminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isSuperadmin) {
    return <Navigate to="/" replace />;
  }

  const contentTypes = [
    { id: 'products', label: 'Продукты', icon: Package, count: 156 },
    { id: 'recipes', label: 'Рецепты', icon: Utensils, count: 48 },
    { id: 'meals', label: 'Готовые блюда', icon: Utensils, count: 24 },
    { id: 'banners', label: 'Баннеры', icon: Image, count: 12 },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border">
        <div className="px-4 py-3">
          <div className="flex items-center gap-3">
            <BackButton fallbackPath="/admin" />
            <div>
              <h1 className="text-xl font-bold">Контент</h1>
              <p className="text-sm text-muted-foreground">Продукты, рецепты, баннеры</p>
            </div>
          </div>
        </div>
      </header>

      <main className="p-4 space-y-4 pb-24">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Поиск контента..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Content Types */}
        <Tabs defaultValue="products">
          <TabsList className="w-full grid grid-cols-4">
            <TabsTrigger value="products" className="text-xs">Продукты</TabsTrigger>
            <TabsTrigger value="recipes" className="text-xs">Рецепты</TabsTrigger>
            <TabsTrigger value="meals" className="text-xs">Блюда</TabsTrigger>
            <TabsTrigger value="banners" className="text-xs">Баннеры</TabsTrigger>
          </TabsList>

          {contentTypes.map(type => (
            <TabsContent key={type.id} value={type.id} className="mt-4 space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-muted-foreground">{type.count} элементов</p>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Добавить
                </Button>
              </div>

              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map(i => (
                  <Card key={i}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center">
                          <type.icon className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold">Пример {type.label.toLowerCase()} #{i}</h3>
                          <p className="text-sm text-muted-foreground">Категория • Активен</p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </main>
    </div>
  );
}
