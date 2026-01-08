import { ArrowLeft, FileText, Shield, HelpCircle, Scale, BookOpen, Settings2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';

const legalLinks = [
  { 
    icon: FileText, 
    label: 'Условия использования', 
    to: '/terms',
    color: 'text-blue-500',
    bg: 'bg-blue-500/10'
  },
  { 
    icon: Scale, 
    label: 'Публичная оферта', 
    to: '/public-offer',
    color: 'text-amber-500',
    bg: 'bg-amber-500/10'
  },
  { 
    icon: Shield, 
    label: 'Политика конфиденциальности', 
    to: '/privacy',
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10'
  },
  { 
    icon: BookOpen, 
    label: 'Обработка персональных данных', 
    to: '/personal-data-policy',
    color: 'text-violet-500',
    bg: 'bg-violet-500/10'
  },
  { 
    icon: HelpCircle, 
    label: 'Помощь и поддержка', 
    to: '/support',
    color: 'text-pink-500',
    bg: 'bg-pink-500/10'
  },
  { 
    icon: Settings2, 
    label: 'Правила рекомендательных технологий', 
    to: '/recommendation-rules',
    color: 'text-cyan-500',
    bg: 'bg-cyan-500/10'
  },
  { 
    icon: Shield, 
    label: 'Управление разрешениями', 
    to: '/profile/permissions',
    color: 'text-orange-500',
    bg: 'bg-orange-500/10'
  },
];

export default function AboutPage() {
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
            <h1 className="text-xl font-bold text-foreground">О приложении</h1>
          </div>
        </div>
      </header>

      <div className="px-4 py-2">
        <Breadcrumbs />
      </div>

      <div className="px-4 py-4 space-y-6">
        {/* App Info */}
        <section className="text-center py-6">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center mb-4 shadow-lg">
            <span className="text-3xl font-bold text-primary-foreground">В</span>
          </div>
          <h2 className="text-2xl font-bold text-foreground">ВыгодноТут</h2>
          <p className="text-muted-foreground mt-1">Версия 2.0.1</p>
          <p className="text-sm text-muted-foreground mt-4 max-w-xs mx-auto">
            Сравнивайте цены, экономьте на покупках и получайте персональные рекомендации
          </p>
        </section>

        {/* Legal Links */}
        <section>
          <h3 className="text-lg font-bold text-foreground mb-4">Юридическая информация</h3>
          <div className="space-y-2">
            {legalLinks.map((item) => (
              <Link 
                key={item.to} 
                to={item.to}
                className="flex items-center gap-3 p-4 bg-card rounded-2xl border border-border hover:bg-muted/50 transition-colors"
              >
                <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center`}>
                  <item.icon className={`h-5 w-5 ${item.color}`} />
                </div>
                <span className="flex-1 font-medium text-foreground">{item.label}</span>
                <span className="text-muted-foreground">→</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Contact */}
        <section>
          <h3 className="text-lg font-bold text-foreground mb-4">Связаться с нами</h3>
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl p-4 border border-primary/20">
            <p className="font-semibold text-foreground">Email поддержки</p>
            <a href="mailto:support@vigodnotut.ru" className="text-primary hover:underline">
              support@vigodnotut.ru
            </a>
            <p className="text-sm text-muted-foreground mt-2">
              Ответим в течение 24 часов
            </p>
          </div>
        </section>

        {/* Copyright */}
        <p className="text-center text-xs text-muted-foreground pb-4">
          © 2024 ВыгодноТут. Все права защищены.
        </p>
      </div>
    </div>
  );
}
