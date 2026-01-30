import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { 
  ArrowLeft, Database, Table, Search, RefreshCw, 
  Download, Loader2, ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useSuperadmin } from '@/hooks/useSuperadmin';

export default function AdminDatabasePage() {
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

  const tables = [
    { name: 'profiles', rows: 1234, description: 'Профили пользователей' },
    { name: 'products', rows: 567, description: 'Каталог продуктов' },
    { name: 'orders', rows: 3456, description: 'Заказы' },
    { name: 'recipes', rows: 89, description: 'Рецепты' },
    { name: 'user_subscriptions', rows: 456, description: 'Подписки' },
    { name: 'favorites', rows: 2345, description: 'Избранное' },
    { name: 'shopping_lists', rows: 789, description: 'Списки покупок' },
    { name: 'carts', rows: 234, description: 'Корзины' },
    { name: 'referrals', rows: 123, description: 'Рефералы' },
  ];

  const filteredTables = tables.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border">
        <div className="px-4 py-3">
          <div className="flex items-center gap-3">
            <Link to="/admin">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold">База данных</h1>
              <p className="text-sm text-muted-foreground">Просмотр таблиц Supabase</p>
            </div>
          </div>
        </div>
      </header>

      <main className="p-4 space-y-4 pb-24">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Поиск таблиц..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1">
            <RefreshCw className="h-4 w-4 mr-2" />
            Обновить
          </Button>
          <Button variant="outline" className="flex-1">
            <Download className="h-4 w-4 mr-2" />
            Экспорт
          </Button>
        </div>

        {/* Tables List */}
        <section className="space-y-3">
          <h2 className="font-semibold text-lg">Таблицы ({filteredTables.length})</h2>
          {filteredTables.map(table => (
            <Card key={table.name} className="cursor-pointer hover:border-primary/50 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-500/10 flex items-center justify-center">
                    <Table className="h-5 w-5 text-slate-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-mono font-semibold">{table.name}</h3>
                    <p className="text-sm text-muted-foreground">{table.description}</p>
                  </div>
                  <Badge variant="secondary">{table.rows} записей</Badge>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          ))}
        </section>

        {/* Info */}
        <Card className="bg-blue-500/5 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Database className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <p className="font-semibold text-blue-600">Supabase Dashboard</p>
                <p className="text-sm text-muted-foreground">
                  Для полного управления базой данных используйте{' '}
                  <a 
                    href="https://supabase.com/dashboard/project/ryhwcwnlcuqzbnnfhskq" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-500 underline"
                  >
                    Supabase Dashboard
                  </a>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
