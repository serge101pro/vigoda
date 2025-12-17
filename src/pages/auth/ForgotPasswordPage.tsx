import { useState } from 'react';
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await resetPassword(email);

    if (error) {
      toast({
        title: 'Ошибка',
        description: error.message === 'User not found' 
          ? 'Пользователь с таким email не найден'
          : 'Не удалось отправить письмо',
        variant: 'destructive',
      });
    } else {
      setIsSuccess(true);
      toast({
        title: 'Письмо отправлено',
        description: 'Проверьте вашу почту для восстановления пароля',
      });
    }
    setIsLoading(false);
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background">
        <header className="px-4 py-3">
          <Link to="/auth/login">
            <Button variant="ghost" size="icon-sm">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
        </header>

        <div className="px-6 pt-8 flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <CheckCircle className="h-10 w-10 text-primary" />
          </div>

          <h1 className="text-2xl font-bold text-foreground mb-2">Проверьте почту</h1>
          <p className="text-muted-foreground mb-8 max-w-xs">
            Мы отправили инструкции по восстановлению пароля на <strong>{email}</strong>
          </p>

          <Link to="/auth/login" className="w-full">
            <Button variant="hero" size="xl" className="w-full">
              Вернуться к входу
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="px-4 py-3">
        <Link to="/auth/login">
          <Button variant="ghost" size="icon-sm">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
      </header>

      <div className="px-6 pt-8">
        <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mb-6">
          <span className="text-3xl font-bold text-primary-foreground">В</span>
        </div>

        <h1 className="text-3xl font-bold text-foreground mb-2">Восстановление</h1>
        <p className="text-muted-foreground mb-8">
          Введите email, и мы отправим инструкции по восстановлению пароля
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

          <Button
            type="submit"
            variant="hero"
            size="xl"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Отправка...' : 'Отправить письмо'}
          </Button>
        </form>

        <p className="text-center mt-8 text-muted-foreground">
          Вспомнили пароль?{' '}
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
