import { useState, useEffect } from 'react';
import { ArrowLeft, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { signIn, user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      // Generic error message to prevent user enumeration
      toast({
        title: 'Ошибка',
        description: 'Не удалось войти. Проверьте данные и попробуйте снова.',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Добро пожаловать!',
        description: 'Вы успешно вошли в аккаунт',
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

        <h1 className="text-3xl font-bold text-foreground mb-2">Вход</h1>
        <p className="text-muted-foreground mb-8">
          Войдите, чтобы сохранять списки и отслеживать экономию
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
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
                placeholder="••••••••"
                required
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

          <div className="text-right">
            <Link
              to="/auth/forgot-password"
              className="text-sm font-medium text-primary hover:text-primary-dark"
            >
              Забыли пароль?
            </Link>
          </div>

          <Button
            type="submit"
            variant="hero"
            size="xl"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Вход...' : 'Войти'}
          </Button>
        </form>

        <p className="text-center mt-8 text-muted-foreground">
          Нет аккаунта?{' '}
          <Link
            to="/auth/register"
            className="font-semibold text-primary hover:text-primary-dark"
          >
            Зарегистрироваться
          </Link>
        </p>
      </div>
    </div>
  );
}
