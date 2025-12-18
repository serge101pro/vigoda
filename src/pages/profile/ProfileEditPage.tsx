import { useState, useEffect } from 'react';
import { ArrowLeft, Save, Loader2, User, Phone, Mail } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { AvatarUpload } from '@/components/profile/AvatarUpload';
import { toast } from '@/hooks/use-toast';

export default function ProfileEditPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading, updateProfile } = useProfile();
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    display_name: '',
    phone: '',
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        display_name: profile.display_name || '',
        phone: profile.phone || '',
      });
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    const success = await updateProfile({
      display_name: formData.display_name || null,
      phone: formData.phone || null,
    });
    
    setSaving(false);
    
    if (success) {
      toast({ title: 'Профиль успешно обновлён' });
      navigate('/profile');
    } else {
      toast({ title: 'Ошибка при сохранении', variant: 'destructive' });
    }
  };

  if (authLoading || profileLoading) {
    return (
      <div className="page-container flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    navigate('/auth/login');
    return null;
  }

  return (
    <div className="page-container">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border/50">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/profile">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold text-foreground">Редактировать профиль</h1>
          </div>
        </div>
      </header>

      <div className="px-4 py-6 space-y-6">
        {/* Avatar */}
        <div className="flex flex-col items-center">
          <AvatarUpload size="lg" />
          <p className="text-sm text-muted-foreground mt-2">Нажмите чтобы изменить фото</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="display_name" className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                Имя
              </Label>
              <Input
                id="display_name"
                value={formData.display_name}
                onChange={(e) => setFormData(prev => ({ ...prev, display_name: e.target.value }))}
                placeholder="Введите ваше имя"
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                Телефон
              </Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+7 (999) 123-45-67"
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                Email
              </Label>
              <Input
                value={profile?.email || user.email || ''}
                disabled
                className="h-12 bg-muted"
              />
              <p className="text-xs text-muted-foreground">Email нельзя изменить</p>
            </div>
          </div>

          <Button type="submit" variant="hero" size="lg" className="w-full" disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Сохранение...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Сохранить изменения
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
