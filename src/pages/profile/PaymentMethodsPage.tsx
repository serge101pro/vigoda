import { useState } from 'react';
import { ArrowLeft, Plus, CreditCard, Trash2, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';

interface PaymentMethod {
  id: string;
  type: 'card' | 'sbp' | 'apple_pay' | 'google_pay';
  title: string;
  subtitle: string;
  isDefault: boolean;
  icon: string;
}

const mockMethods: PaymentMethod[] = [
  {
    id: '1',
    type: 'card',
    title: 'Visa •••• 4242',
    subtitle: 'Действует до 12/26',
    isDefault: true,
    icon: '💳',
  },
  {
    id: '2',
    type: 'card',
    title: 'Mastercard •••• 8888',
    subtitle: 'Действует до 08/25',
    isDefault: false,
    icon: '💳',
  },
  {
    id: '3',
    type: 'sbp',
    title: 'СБП',
    subtitle: 'Система быстрых платежей',
    isDefault: false,
    icon: '🏦',
  },
];

export default function PaymentMethodsPage() {
  const [methods, setMethods] = useState(mockMethods);

  const setAsDefault = (id: string) => {
    setMethods(prev => prev.map(m => ({
      ...m,
      isDefault: m.id === id,
    })));
  };

  const deleteMethod = (id: string) => {
    setMethods(prev => prev.filter(m => m.id !== id));
  };

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
            <h1 className="text-xl font-bold text-foreground">Способы оплаты</h1>
          </div>
        </div>
      </header>

      <div className="px-4 py-2">
        <Breadcrumbs />
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Payment Methods List */}
        {methods.map((method) => (
          <div 
            key={method.id}
            className={`relative p-4 rounded-2xl border transition-all ${
              method.isDefault 
                ? 'bg-primary/5 border-primary' 
                : 'bg-card border-border'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-2xl">
                {method.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-foreground">{method.title}</p>
                  {method.isDefault && (
                    <span className="px-2 py-0.5 bg-primary/20 text-primary text-xs font-medium rounded-full">
                      Основной
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{method.subtitle}</p>
              </div>
            </div>

            <div className="flex gap-2 mt-3">
              {!method.isDefault && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setAsDefault(method.id)}
                  className="flex-1"
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Сделать основным
                </Button>
              )}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => deleteMethod(method.id)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}

        {/* Add New Method */}
        <Button variant="outline" className="w-full h-16 border-dashed">
          <Plus className="h-5 w-5 mr-2" />
          Добавить способ оплаты
        </Button>

        {/* Info */}
        <div className="bg-muted rounded-2xl p-4 mt-6">
          <p className="text-sm text-muted-foreground">
            Данные карт хранятся в зашифрованном виде и соответствуют стандартам PCI DSS.
            Мы не храним CVV коды ваших карт.
          </p>
        </div>
      </div>
    </div>
  );
}
