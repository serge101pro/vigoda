import { ArrowLeft, MessageCircle, Mail, Phone, HelpCircle, FileText, Bug } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export default function SupportPage() {
  const faqItems = [
    {
      question: 'Как добавить товар в список покупок?',
      answer: 'Найдите товар через поиск или каталог, затем нажмите на кнопку «+» на карточке товара. Товар будет добавлен в активный список покупок.',
    },
    {
      question: 'Как сравнить цены в разных магазинах?',
      answer: 'Откройте карточку товара — внизу вы увидите сравнение цен во всех магазинах, где продаётся данный товар.',
    },
    {
      question: 'Почему цены в приложении отличаются от цен в магазине?',
      answer: 'Цены в приложении обновляются периодически и носят информационный характер. Для актуальных цен рекомендуем проверять информацию на сайтах магазинов.',
    },
    {
      question: 'Как включить уведомления о скидках?',
      answer: 'Перейдите в Профиль → Настройки → Уведомления и включите «Push-уведомления» и «Уведомления о скидках».',
    },
    {
      question: 'Как удалить аккаунт?',
      answer: 'Перейдите в Профиль → Настройки → прокрутите вниз и нажмите «Удалить аккаунт». Все ваши данные будут удалены безвозвратно.',
    },
  ];

  return (
    <div className="page-container">
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border/50">
        <div className="px-4 py-3">
          <div className="flex items-center gap-3">
            <Link to="/profile/settings">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold text-foreground">Помощь и поддержка</h1>
          </div>
        </div>
      </header>

      <div className="px-4 py-6 space-y-6">
        {/* Quick summary */}
        <div className="bg-primary/5 rounded-2xl p-4 border border-primary/20">
          <h2 className="text-lg font-bold mb-2">Как мы можем помочь?</h2>
          <p className="text-sm text-muted-foreground">
            Здесь вы найдёте ответы на частые вопросы, а также способы связи с нашей командой поддержки.
          </p>
        </div>

        {/* Contact options */}
        <section>
          <h2 className="font-bold text-lg mb-3">Связаться с нами</h2>
          <div className="space-y-3">
            <a 
              href="mailto:support@vigodnotut.ru" 
              className="flex items-center gap-3 p-4 bg-card rounded-xl border border-border hover:border-primary/50 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Email</p>
                <p className="text-sm text-muted-foreground">support@vigodnotut.ru</p>
              </div>
            </a>

            <a 
              href="https://t.me/vigodnotut_support" 
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 bg-card rounded-xl border border-border hover:border-primary/50 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <MessageCircle className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Telegram</p>
                <p className="text-sm text-muted-foreground">@vigodnotut_support</p>
              </div>
            </a>

            <a 
              href="tel:+78001234567" 
              className="flex items-center gap-3 p-4 bg-card rounded-xl border border-border hover:border-primary/50 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Phone className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Телефон</p>
                <p className="text-sm text-muted-foreground">8 (800) 123-45-67 (бесплатно)</p>
              </div>
            </a>
          </div>
        </section>

        {/* FAQ */}
        <section>
          <h2 className="font-bold text-lg mb-3 flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Частые вопросы
          </h2>
          <Accordion type="single" collapsible className="bg-card rounded-xl border border-border overflow-hidden">
            {faqItems.map((item, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-b border-border last:border-0">
                <AccordionTrigger className="px-4 hover:no-underline hover:bg-muted/50">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 text-muted-foreground">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        {/* Additional links */}
        <section>
          <h2 className="font-bold text-lg mb-3">Полезные ссылки</h2>
          <div className="space-y-2">
            <Link 
              to="/personal-data-policy"
              className="flex items-center gap-3 p-4 bg-card rounded-xl border border-border hover:border-primary/50 transition-colors"
            >
              <FileText className="h-5 w-5 text-muted-foreground" />
              <span>Политика обработки персональных данных</span>
            </Link>
            <Link 
              to="/public-offer"
              className="flex items-center gap-3 p-4 bg-card rounded-xl border border-border hover:border-primary/50 transition-colors"
            >
              <FileText className="h-5 w-5 text-muted-foreground" />
              <span>Публичная оферта</span>
            </Link>
            <Link 
              to="/recommendation-rules"
              className="flex items-center gap-3 p-4 bg-card rounded-xl border border-border hover:border-primary/50 transition-colors"
            >
              <FileText className="h-5 w-5 text-muted-foreground" />
              <span>Правила применения рекомендательных технологий</span>
            </Link>
          </div>
        </section>

        {/* Report bug */}
        <div className="bg-muted rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Bug className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium">Нашли ошибку?</p>
              <p className="text-sm text-muted-foreground">
                Напишите нам на <a href="mailto:bugs@vigodnotut.ru" className="text-primary hover:underline">bugs@vigodnotut.ru</a> — 
                мы исправим как можно скорее.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
