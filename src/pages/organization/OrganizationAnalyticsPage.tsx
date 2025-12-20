import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BarChart3, TrendingUp, Calendar, Download, Filter, FileSpreadsheet, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/hooks/useOrganization';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';

// Mock data for B2B analytics
const employeeSpending = [
  { name: 'Иванов А.', spent: 12500, limit: 15000, avatar: '👨' },
  { name: 'Петрова М.', spent: 8900, limit: 15000, avatar: '👩' },
  { name: 'Сидоров К.', spent: 14200, limit: 15000, avatar: '👨' },
  { name: 'Козлова Е.', spent: 6700, limit: 15000, avatar: '👩' },
  { name: 'Новиков Д.', spent: 11300, limit: 15000, avatar: '👨' },
  { name: 'Федорова А.', spent: 9800, limit: 15000, avatar: '👩' },
];

const categoryData = [
  { name: 'Обеды', value: 45000, color: '#22c55e' },
  { name: 'Офисная кухня', value: 18500, color: '#3b82f6' },
  { name: 'Корпоративы', value: 25000, color: '#f59e0b' },
  { name: 'Прочее', value: 7000, color: '#8b5cf6' },
];

const monthlyData = [
  { month: 'Янв', spent: 78000, budget: 100000 },
  { month: 'Фев', spent: 85000, budget: 100000 },
  { month: 'Мар', spent: 92000, budget: 100000 },
  { month: 'Апр', spent: 71000, budget: 100000 },
  { month: 'Май', spent: 88000, budget: 100000 },
  { month: 'Июн', spent: 95500, budget: 100000 },
];

const dailyData = [
  { day: 'Пн', orders: 12, amount: 8500 },
  { day: 'Вт', orders: 15, amount: 10200 },
  { day: 'Ср', orders: 18, amount: 12500 },
  { day: 'Чт', orders: 14, amount: 9800 },
  { day: 'Пт', orders: 20, amount: 14200 },
  { day: 'Сб', orders: 3, amount: 2100 },
  { day: 'Вс', orders: 1, amount: 800 },
];

export default function OrganizationAnalyticsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { organization } = useOrganization();
  const [period, setPeriod] = useState('month');
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const totalSpent = 95500;
  const totalBudget = 125000;
  const projectedDays = 12;
  const averageOrderValue = 1150;
  const totalOrders = 83;

  const handleExport = async (format: 'excel' | 'pdf') => {
    if (!organization?.id) {
      // Demo mode - use mock org ID
      toast({
        title: 'Демо-режим',
        description: 'В демо-режиме экспорт использует тестовые данные',
      });
    }

    setIsExporting(true);
    try {
      const { data, error } = await supabase.functions.invoke('export-analytics', {
        body: {
          organizationId: organization?.id || 'demo-org-id',
          format,
          period,
        },
      });

      if (error) throw error;

      if (format === 'excel') {
        // Download CSV
        const blob = new Blob([data], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `analytics_${period}_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else {
        // Open PDF in new window for printing
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(data);
          printWindow.document.close();
          printWindow.print();
        }
      }

      toast({
        title: 'Экспорт завершён',
        description: format === 'excel' ? 'Файл скачан' : 'Открыто окно печати',
      });
      setShowExportDialog(false);
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: 'Ошибка экспорта',
        description: 'Не удалось сформировать отчёт',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="page-container">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border/50">
        <div className="px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate(-1)}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-foreground">Аналитика B2B</h1>
          </div>
          <Button variant="outline" size="sm" onClick={() => setShowExportDialog(true)}>
            <Download className="h-4 w-4 mr-1" />
            Экспорт
          </Button>
        </div>
      </header>

      <div className="px-4 py-4 space-y-6">
        {/* Period Selector */}
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Неделя</SelectItem>
              <SelectItem value="month">Месяц</SelectItem>
              <SelectItem value="quarter">Квартал</SelectItem>
              <SelectItem value="year">Год</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Key Metrics */}
        <section className="grid grid-cols-2 gap-3">
          <div className="bg-card rounded-xl border border-border p-4">
            <p className="text-sm text-muted-foreground mb-1">Потрачено</p>
            <p className="text-2xl font-bold text-foreground">{totalSpent.toLocaleString()} ₽</p>
            <p className="text-xs text-muted-foreground">из {totalBudget.toLocaleString()} ₽</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <p className="text-sm text-muted-foreground mb-1">Прогноз</p>
            <p className="text-2xl font-bold text-primary">{projectedDays} дней</p>
            <p className="text-xs text-muted-foreground">при текущем темпе</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <p className="text-sm text-muted-foreground mb-1">Заказов</p>
            <p className="text-2xl font-bold text-foreground">{totalOrders}</p>
            <p className="text-xs text-green-500">+12% к прошлому мес.</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <p className="text-sm text-muted-foreground mb-1">Средний чек</p>
            <p className="text-2xl font-bold text-foreground">{averageOrderValue} ₽</p>
            <p className="text-xs text-muted-foreground">на сотрудника</p>
          </div>
        </section>

        {/* Budget Progress */}
        <section className="bg-card rounded-2xl border border-border p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Использование бюджета</h3>
            <Badge variant={totalSpent / totalBudget > 0.8 ? 'destructive' : 'secondary'}>
              {Math.round(totalSpent / totalBudget * 100)}%
            </Badge>
          </div>
          <Progress value={totalSpent / totalBudget * 100} className="h-3 mb-2" />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Потрачено: {totalSpent.toLocaleString()} ₽</span>
            <span>Осталось: {(totalBudget - totalSpent).toLocaleString()} ₽</span>
          </div>
        </section>

        <Tabs defaultValue="employees" className="w-full">
          <TabsList className="w-full grid grid-cols-3 bg-muted rounded-xl mb-4">
            <TabsTrigger value="employees">По сотрудникам</TabsTrigger>
            <TabsTrigger value="categories">Категории</TabsTrigger>
            <TabsTrigger value="trends">Динамика</TabsTrigger>
          </TabsList>

          {/* Employees Tab */}
          <TabsContent value="employees" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Кто сколько тратит</h3>
              <Button variant="ghost" size="sm">
                <Filter className="h-4 w-4 mr-1" />
                Фильтр
              </Button>
            </div>

            <div className="space-y-3">
              {employeeSpending.map((employee, index) => (
                <div key={index} className="bg-card rounded-xl border border-border p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-xl">
                      {employee.avatar}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{employee.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {employee.spent.toLocaleString()} ₽ из {employee.limit.toLocaleString()} ₽
                      </p>
                    </div>
                    <Badge variant={employee.spent / employee.limit > 0.9 ? 'destructive' : 'secondary'}>
                      {Math.round(employee.spent / employee.limit * 100)}%
                    </Badge>
                  </div>
                  <Progress value={employee.spent / employee.limit * 100} className="h-2" />
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories" className="space-y-4">
            <h3 className="font-semibold">Распределение по категориям</h3>
            
            <div className="bg-card rounded-2xl border border-border p-4">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => `${value.toLocaleString()} ₽`}
                    />
                  </RePieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-2 mt-4">
                {categoryData.map((category, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="text-sm">{category.name}</span>
                    </div>
                    <span className="font-medium">{category.value.toLocaleString()} ₽</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Category breakdown */}
            <div className="space-y-3">
              <div className="bg-green-500/10 rounded-xl border border-green-500/30 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">🍽️</span>
                  <span className="font-semibold">Обеды</span>
                </div>
                <p className="text-2xl font-bold mb-1">45 000 ₽</p>
                <p className="text-sm text-muted-foreground">47% от общих расходов</p>
              </div>

              <div className="bg-blue-500/10 rounded-xl border border-blue-500/30 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">☕</span>
                  <span className="font-semibold">Офисная кухня</span>
                </div>
                <p className="text-2xl font-bold mb-1">18 500 ₽</p>
                <p className="text-sm text-muted-foreground">19% от общих расходов</p>
              </div>

              <div className="bg-amber-500/10 rounded-xl border border-amber-500/30 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">🎉</span>
                  <span className="font-semibold">Корпоративы</span>
                </div>
                <p className="text-2xl font-bold mb-1">25 000 ₽</p>
                <p className="text-sm text-muted-foreground">26% от общих расходов</p>
              </div>
            </div>
          </TabsContent>

          {/* Trends Tab */}
          <TabsContent value="trends" className="space-y-4">
            <h3 className="font-semibold">Динамика расходов</h3>
            
            <div className="bg-card rounded-2xl border border-border p-4">
              <p className="text-sm text-muted-foreground mb-4">Расходы по месяцам</p>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData}>
                    <XAxis dataKey="month" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} tickFormatter={(v) => `${v/1000}k`} />
                    <Tooltip 
                      formatter={(value: number) => `${value.toLocaleString()} ₽`}
                    />
                    <Bar dataKey="spent" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-card rounded-2xl border border-border p-4">
              <p className="text-sm text-muted-foreground mb-4">Заказы по дням недели</p>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dailyData}>
                    <XAxis dataKey="day" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="orders" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--primary))' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Insights */}
            <div className="bg-accent/10 rounded-2xl border border-accent/30 p-4">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="h-5 w-5 text-accent-foreground" />
                <span className="font-semibold">Инсайты</span>
              </div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-green-500">↑</span>
                  <span>Расходы на обеды выросли на 15% — рассмотрите договор на доставку</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500">→</span>
                  <span>Пятница — самый активный день, 24% всех заказов</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500">!</span>
                  <span>3 сотрудника близки к лимиту — рассмотрите увеличение</span>
                </li>
              </ul>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Export Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Экспорт аналитики</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Выберите формат для экспорта отчёта за {
                period === 'week' ? 'неделю' : 
                period === 'month' ? 'месяц' : 
                period === 'quarter' ? 'квартал' : 'год'
              }:
            </p>

            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="h-24 flex-col gap-2"
                onClick={() => handleExport('excel')}
                disabled={isExporting}
              >
                <FileSpreadsheet className="h-8 w-8 text-green-500" />
                <span>Excel (CSV)</span>
              </Button>

              <Button
                variant="outline"
                className="h-24 flex-col gap-2"
                onClick={() => handleExport('pdf')}
                disabled={isExporting}
              >
                <FileText className="h-8 w-8 text-red-500" />
                <span>PDF</span>
              </Button>
            </div>

            <div className="bg-muted/50 rounded-xl p-4">
              <h4 className="font-medium mb-2">Отчёт включает:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Сводка по использованию бюджета</li>
                <li>• Детализация по сотрудникам</li>
                <li>• Разбивка по категориям расходов</li>
                <li>• Ключевые метрики и тренды</li>
              </ul>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
