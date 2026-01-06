import { useState, useEffect } from 'react';
import { ArrowLeft, Mail, Lock, Eye, EyeOff, User } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { useTranslation } from '@/lib/i18n';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signUp, user, loading } = useAuth();
  const { t } = useTranslation();
  
  // Get referral code from URL
  const referralCode = searchParams.get('ref') || '';

  useEffect(() => {
    if (!loading && user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await signUp(email, password, name, referralCode);

    if (error) {
      const message = error.message.includes('Password should be at least')
        ? t('auth.passwordMin')
        : t('auth.accountError');
      toast({
        title: t('auth.error'),
        description: message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: t('auth.registerSuccess'),
        description: t('auth.checkEmail'),
      });
      navigate('/');
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="px-4 py-3">
        <Link to="/">
          <Button variant="ghost" size="icon-sm">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
      </header>

      <div className="px-6 pt-8">
        <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mb-6">
          <span className="text-3xl font-bold text-primary-foreground">В</span>
        </div>

        <h1 className="text-3xl font-bold text-foreground mb-2">{t('auth.register')}</h1>
        <p className="text-muted-foreground mb-8">
          {referralCode ? '🎁 Вы регистрируетесь по реферальной ссылке!' : 'Создайте аккаунт и начните экономить'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              {t('auth.name')}
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ваше имя"
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-muted border-0 focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              {t('auth.email')}
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@mail.ru"
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-muted border-0 focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              {t('auth.password')}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Минимум 6 символов"
                required
                minLength={6}
                className="w-full pl-10 pr-12 py-3 rounded-xl bg-muted border-0 focus:ring-2 focus:ring-primary/20 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <Eye className="h-5 w-5 text-muted-foreground" />
                )}
              </button>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            {t('auth.termsAgree')}{' '}
            <Link to="/terms" className="text-primary">
              {t('auth.terms')}
            </Link>{' '}
            {t('auth.and')}{' '}
            <Link to="/privacy" className="text-primary">
              {t('auth.privacy')}
            </Link>
          </p>

          <Button
            type="submit"
            variant="hero"
            size="xl"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? t('auth.creating') : t('auth.createAccount')}
          </Button>
        </form>

        <p className="text-center mt-8 text-muted-foreground">
          {t('auth.hasAccount')}{' '}
          <Link
            to="/auth/login"
            className="font-semibold text-primary hover:text-primary-dark"
          >
            {t('auth.login')}
          </Link>
        </p>
      </div>
    </div>
  );
}
