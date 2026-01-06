import { useState } from 'react';
import { ArrowLeft, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslation, Language } from '@/lib/i18n';

const stores = ['Пятёрочка', 'Магнит', 'Перекрёсток', 'ВкусВилл'];

const languages: { code: Language; name: string; flag: string }[] = [
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
];

export default function SettingsPage() {
  const { t, language, setLanguage } = useTranslation();
  
  // Account
  const [name, setName] = useState('Александр');
  const [email, setEmail] = useState('alex@example.com');
  const [phone, setPhone] = useState('+7 999 123 45 67');

  // Notifications
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [shoppingReminder, setShoppingReminder] = useState(true);
  const [reminderTime, setReminderTime] = useState('18:00');
  const [discountNotify, setDiscountNotify] = useState(true);
  const [priceRiseNotify, setPriceRiseNotify] = useState(true);
  const [familyUpdates, setFamilyUpdates] = useState(false);

  // Product recommendations
  const [recommendationType, setRecommendationType] = useState('cheapest');

  // Shopping preferences
  const [favoriteStores, setFavoriteStores] = useState(['Пятёрочка', 'Магнит', 'ВкусВилл']);
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>([]);
  const [monthlyBudget, setMonthlyBudget] = useState('45000');
  const [showCheaperAnalogs, setShowCheaperAnalogs] = useState(true);
  const [notifyPriceRise, setNotifyPriceRise] = useState(true);
  const [aiPredictions, setAiPredictions] = useState(true);

  // Privacy
  const [anonymousStats, setAnonymousStats] = useState(true);
  const [personalRecommendations, setPersonalRecommendations] = useState(true);
  const [geolocation, setGeolocation] = useState(true);

  const dietaryOptions = [
    { key: 'vegetarian', label: t('settings.vegetarian') },
    { key: 'vegan', label: t('settings.vegan') },
    { key: 'glutenFree', label: t('settings.glutenFree') },
    { key: 'lactoseFree', label: t('settings.lactoseFree') },
  ];

  const toggleStore = (store: string) => {
    setFavoriteStores(prev => 
      prev.includes(store) ? prev.filter(s => s !== store) : [...prev, store]
    );
  };

  const toggleDietary = (option: string) => {
    setDietaryRestrictions(prev => 
      prev.includes(option) ? prev.filter(o => o !== option) : [...prev, option]
    );
  };

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
            <h1 className="text-xl font-bold text-foreground">{t('settings.title')}</h1>
          </div>
        </div>
      </header>

      <div className="px-4 py-6 space-y-8">
        {/* Account Settings */}
        <section>
          <h2 className="text-lg font-bold text-foreground mb-4">{t('settings.account')}</h2>
          <div className="bg-card rounded-2xl border border-border p-4 space-y-4">
            <div>
              <Label htmlFor="name">{t('settings.name')}</Label>
              <Input id="name" value={name} onChange={e => setName(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="email">{t('settings.email')}</Label>
              <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="phone">{t('settings.phone')}</Label>
              <Input id="phone" value={phone} onChange={e => setPhone(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label>{t('settings.language')}</Label>
              <Select value={language} onValueChange={(val) => setLanguage(val as Language)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      <span className="flex items-center gap-2">
                        <span>{lang.flag}</span>
                        <span>{lang.name}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        {/* Notifications */}
        <section>
          <h2 className="text-lg font-bold text-foreground mb-4">{t('settings.notifications')}</h2>
          <div className="bg-card rounded-2xl border border-border p-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">{t('settings.push')}</span>
              <Switch checked={pushEnabled} onCheckedChange={setPushEnabled} />
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium">{t('settings.emailNotif')}</span>
              <Switch checked={emailEnabled} onCheckedChange={setEmailEnabled} />
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium">{t('settings.shoppingReminder')}</span>
              <Switch checked={shoppingReminder} onCheckedChange={setShoppingReminder} />
            </div>
            {shoppingReminder && (
              <div className="relative ml-4">
                <Input 
                  type="time" 
                  value={reminderTime} 
                  onChange={e => setReminderTime(e.target.value)}
                  className="pr-10"
                />
                <Clock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="font-medium">{t('settings.discountNotify')}</span>
              <Switch checked={discountNotify} onCheckedChange={setDiscountNotify} />
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium">{t('settings.priceRise')}</span>
              <Switch checked={priceRiseNotify} onCheckedChange={setPriceRiseNotify} />
            </div>
            <div className="flex items-center justify-between opacity-50">
              <div>
                <span className="font-medium">{t('settings.familyUpdates')}</span>
                <p className="text-xs text-muted-foreground">{t('settings.availableFamily')}</p>
              </div>
              <Switch checked={familyUpdates} onCheckedChange={setFamilyUpdates} disabled />
            </div>
          </div>
        </section>

        {/* Product Recommendations */}
        <section>
          <h2 className="text-lg font-bold text-foreground mb-4">{t('settings.recommendations')}</h2>
          <RadioGroup value={recommendationType} onValueChange={setRecommendationType} className="space-y-3">
            {[
              { value: 'cheapest', label: t('settings.cheapest'), desc: t('settings.cheapestDesc') },
              { value: 'previous', label: t('settings.previous'), desc: t('settings.previousDesc') },
              { value: 'popular', label: t('settings.popularOthers'), desc: t('settings.popularOthersDesc') },
              { value: 'premium', label: t('settings.premiumQuality'), desc: t('settings.premiumQualityDesc') },
              { value: 'eco', label: t('settings.eco'), desc: t('settings.ecoDesc') },
            ].map(opt => (
              <label 
                key={opt.value}
                className={`flex items-start gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  recommendationType === opt.value 
                    ? 'border-primary bg-primary-light' 
                    : 'border-border bg-card hover:border-primary/50'
                }`}
              >
                <RadioGroupItem value={opt.value} className="mt-1" />
                <div>
                  <p className="font-semibold">{opt.label}</p>
                  <p className="text-sm text-muted-foreground">{opt.desc}</p>
                </div>
              </label>
            ))}
          </RadioGroup>

          <div className="mt-4 bg-card rounded-2xl border border-border p-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">{t('settings.showCheaper')}</span>
              <Switch checked={showCheaperAnalogs} onCheckedChange={setShowCheaperAnalogs} />
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium">{t('settings.notifyPriceRise')}</span>
              <Switch checked={notifyPriceRise} onCheckedChange={setNotifyPriceRise} />
            </div>
          </div>
        </section>

        {/* Shopping Preferences */}
        <section>
          <h2 className="text-lg font-bold text-foreground mb-4">{t('settings.preferences')}</h2>
          <div className="bg-card rounded-2xl border border-border p-4 space-y-4">
            <div>
              <Label className="font-semibold">{t('settings.favoriteStores')}</Label>
              <div className="mt-2 space-y-2">
                {stores.map(store => (
                  <label key={store} className="flex items-center gap-2 cursor-pointer">
                    <Checkbox 
                      checked={favoriteStores.includes(store)} 
                      onCheckedChange={() => toggleStore(store)} 
                    />
                    <span>{store}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <Label className="font-semibold">{t('settings.dietary')}</Label>
              <div className="mt-2 space-y-2">
                {dietaryOptions.map(option => (
                  <label key={option.key} className="flex items-center gap-2 cursor-pointer">
                    <Checkbox 
                      checked={dietaryRestrictions.includes(option.key)} 
                      onCheckedChange={() => toggleDietary(option.key)} 
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="budget">{t('settings.monthlyBudget')}</Label>
              <div className="relative mt-1">
                <Input 
                  id="budget"
                  type="number" 
                  value={monthlyBudget} 
                  onChange={e => setMonthlyBudget(e.target.value)}
                  className="pr-8"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">{t('common.rub')}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium">{t('settings.autoPredictions')}</span>
                <p className="text-xs text-muted-foreground">{t('settings.autoPredictionsDesc')}</p>
              </div>
              <Switch checked={aiPredictions} onCheckedChange={setAiPredictions} />
            </div>
          </div>
        </section>

        {/* Privacy */}
        <section>
          <h2 className="text-lg font-bold text-foreground mb-4">{t('settings.privacy')}</h2>
          <div className="bg-card rounded-2xl border border-border p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium">{t('settings.anonymousStats')}</span>
                <p className="text-xs text-muted-foreground">{t('settings.anonymousStatsDesc')}</p>
              </div>
              <Switch checked={anonymousStats} onCheckedChange={setAnonymousStats} />
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium">{t('settings.personalRecs')}</span>
              <Switch checked={personalRecommendations} onCheckedChange={setPersonalRecommendations} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium">{t('settings.geolocation')}</span>
                <p className="text-xs text-muted-foreground">{t('settings.geolocationDesc')}</p>
              </div>
              <Switch checked={geolocation} onCheckedChange={setGeolocation} />
            </div>
          </div>

          <Button 
            variant="outline" 
            className="w-full mt-4 text-destructive border-destructive hover:bg-destructive/10"
          >
            {t('settings.deleteAccount')}
          </Button>
        </section>

        {/* Subscription */}
        <section>
          <h2 className="text-lg font-bold text-foreground mb-4">{t('settings.subscription')}</h2>
          <div className="bg-card rounded-2xl border border-border p-4">
            <p className="text-sm text-muted-foreground">{t('settings.currentPlan')}</p>
            <p className="text-xl font-bold text-primary">{t('settings.free')}</p>
            <Link to="/profile/premium">
              <Button variant="link" className="p-0 h-auto mt-2 text-primary">
                {t('settings.viewPlans')}
              </Button>
            </Link>
          </div>
        </section>

        {/* About */}
        <section>
          <h2 className="text-lg font-bold text-foreground mb-4">{t('settings.about')}</h2>
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <div className="p-4 text-center border-b border-border">
              <p className="text-muted-foreground">v2.0.1</p>
            </div>
            {[
              { label: t('settings.termsOfUse'), to: '/terms' },
              { label: t('settings.privacyPolicy'), to: '/privacy' },
              { label: t('settings.helpSupport'), to: '/support' },
              { label: t('settings.personalDataPolicy'), to: '/personal-data-policy' },
              { label: t('settings.publicOffer'), to: '/public-offer' },
              { label: t('settings.recRules'), to: '/recommendation-rules' },
            ].map(item => (
              <Link 
                key={item.to} 
                to={item.to}
                className="flex items-center justify-between p-4 border-b border-border last:border-b-0 hover:bg-muted/50 transition-colors"
              >
                <span>{item.label}</span>
                <span className="text-muted-foreground">→</span>
              </Link>
            ))}
          </div>

          <div className="mt-4 bg-muted rounded-2xl p-4">
            <p className="font-semibold">{t('settings.contactUs')}</p>
            <p className="text-muted-foreground">support@vigodnotut.ru</p>
          </div>
        </section>
      </div>
    </div>
  );
}
