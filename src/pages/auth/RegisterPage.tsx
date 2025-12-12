import { useState } from 'react';
import { ArrowLeft, Mail, Lock, Eye, EyeOff, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/stores/useAppStore';
import { toast } from '@/hooks/use-toast';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const setUser = useAppStore((state) => state.setUser);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate registration
    setTimeout(() => {
      setUser({
        id: '1',
        name,
        email,
        referralCode: 'VIGODNO' + Math.random().toString(36).substring(7).toUpperCase(),
        bonusBalance: 0,
      });
      toast({
        title: 'Добро пожаловать!',
        description: 'Аккаунт успешно создан',
      });
      navigate('/');
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
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

        <h1 className="text-3xl font-bold text-foreground mb-2">Регистрация</h1>
        <p className="text-muted-foreground mb-8">
          Создайте аккаунт и начните экономить
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Имя
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
              Email
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
              Пароль
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Минимум 8 символов"
                required
                minLength={8}
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
            Регистрируясь, вы соглашаетесь с{' '}
            <Link to="/terms" className="text-primary">
              условиями использования
            </Link>{' '}
            и{' '}
            <Link to="/privacy" className="text-primary">
              политикой конфиденциальности
            </Link>
          </p>

          <Button
            type="submit"
            variant="hero"
            size="xl"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Создание...' : 'Создать аккаунт'}
          </Button>
        </form>

        <p className="text-center mt-8 text-muted-foreground">
          Уже есть аккаунт?{' '}
          <Link
            to="/auth/login"
            className="font-semibold text-primary hover:text-primary-dark"
          >
            Войти
          </Link>
        </p>
      </div>
    </div>
  );
}
