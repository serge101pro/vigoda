import { ArrowLeft, Star, TrendingUp, TrendingDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const monthlyData = [
  { month: 'Июль', amount: 38000, savings: 2100 },
  { month: 'Август', amount: 42000, savings: 2800 },
  { month: 'Сентябрь', amount: 42500, savings: 3000 },
  { month: 'Октябрь', amount: 45287, savings: 3120 },
];

const categoryData = [
  { name: 'Молочные', value: 8500, color: 'hsl(187, 85%, 53%)' },
  { name: 'Мясо', value: 12000, color: 'hsl(35, 92%, 73%)' },
  { name: 'Овощи/Фрукты', value: 7200, color: 'hsl(0, 74%, 42%)' },
  { name: 'Хлеб/Выпечка', value: 4500, color: 'hsl(48, 83%, 76%)' },
  { name: 'Напитки', value: 6800, color: 'hsl(172, 66%, 50%)' },
  { name: 'Прочее', value: 6287, color: 'hsl(0, 72%, 51%)' },
];

export default function AnalyticsPage() {
  const currentMonth = monthlyData[monthlyData.length - 1];
  const previousMonth = monthlyData[monthlyData.length - 2];
  const percentChange = ((currentMonth.amount - previousMonth.amount) / previousMonth.amount * 100).toFixed(1);

  return (
    <div className="page-container">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border/50">
        <div className="px-4 py-3">
          <div className="flex items-center gap-3">
            <Link to="/profile">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold text-foreground">Бюджет и аналитика</h1>
          </div>
        </div>
      </header>

      <div className="px-4 py-6 space-y-6">
        {/* Spent This Month */}
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl p-5">
          <p className="text-muted-foreground text-sm">Потрачено в октябре</p>
          <p className="text-4xl font-bold text-primary mt-1">
            {currentMonth.amount.toLocaleString()} ₽
          </p>
          <p className={`text-sm mt-2 flex items-center gap-1 ${Number(percentChange) > 0 ? 'text-accent' : 'text-primary'}`}>
            {Number(percentChange) > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            {percentChange}% к сентябрю
          </p>
        </div>

        {/* Potential Savings */}
        <div className="bg-gradient-to-br from-amber-100 to-amber-200 rounded-2xl p-5">
          <p className="text-muted-foreground text-sm">Можно сэкономить</p>
          <p className="text-4xl font-bold text-primary mt-1">
            {currentMonth.savings.toLocaleString()} ₽
          </p>
          <Link to="/profile/premium">
            <Badge className="mt-3 bg-accent text-accent-foreground">
              <Star className="h-3 w-3 mr-1" /> Premium
            </Badge>
          </Link>
        </div>

        {/* Monthly Spending Chart */}
        <div className="bg-card rounded-2xl p-5 border border-border">
          <h2 className="font-bold text-foreground mb-4">Расходы по месяцам</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis 
                  tick={{ fontSize: 12 }} 
                  stroke="hsl(var(--muted-foreground))"
                  tickFormatter={(value) => `${(value / 1000)}k`}
                />
                <Tooltip 
                  formatter={(value: number) => [`${value.toLocaleString()} ₽`, 'Потрачено']}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '12px'
                  }}
                />
                <Bar 
                  dataKey="amount" 
                  fill="hsl(var(--primary))" 
                  radius={[6, 6, 0, 0]}
                />
                <Bar 
                  dataKey="savings" 
                  fill="hsl(var(--accent))" 
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Spending Chart */}
        <div className="bg-card rounded-2xl p-5 border border-border">
          <h2 className="font-bold text-foreground mb-4">Расходы по категориям</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="45%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [`${value.toLocaleString()} ₽`]}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '12px'
                  }}
                />
                <Legend 
                  layout="horizontal" 
                  verticalAlign="bottom"
                  wrapperStyle={{ paddingTop: '20px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
