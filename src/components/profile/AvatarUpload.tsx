import { useState, useRef } from 'react';
import { Camera, Loader2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { toast } from '@/hooks/use-toast';

interface AvatarUploadProps {
  size?: 'sm' | 'md' | 'lg';
  onUploadComplete?: (url: string) => void;
}

const sizeClasses = {
  sm: 'w-16 h-16',
  md: 'w-20 h-20',
  lg: 'w-24 h-24',
};

export function AvatarUpload({ size = 'md', onUploadComplete }: AvatarUploadProps) {
  const { user } = useAuth();
  const { profile, updateProfile } = useProfile();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({ title: 'Ошибка', description: 'Выберите изображение', variant: 'destructive' });
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: 'Ошибка', description: 'Размер файла не должен превышать 2 МБ', variant: 'destructive' });
      return;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;

      // Delete old avatar if exists
      if (profile?.avatar_url) {
        const oldPath = profile.avatar_url.split('/').slice(-2).join('/');
        await supabase.storage.from('avatars').remove([oldPath]);
      }

      // Upload new avatar
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Update profile with new avatar URL
      const success = await updateProfile({ avatar_url: publicUrl });
      
      if (success) {
        toast({ title: 'Аватар обновлён' });
        onUploadComplete?.(publicUrl);
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({ title: 'Ошибка', description: 'Не удалось загрузить аватар', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const displayName = profile?.display_name || user?.user_metadata?.display_name || 'П';

  return (
    <div className="relative">
      <div className={`${sizeClasses[size]} rounded-full bg-primary flex items-center justify-center overflow-hidden`}>
        {profile?.avatar_url ? (
          <img 
            src={profile.avatar_url} 
            alt="Avatar" 
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-3xl font-bold text-primary-foreground">
            {displayName.charAt(0).toUpperCase()}
          </span>
        )}
        {uploading && (
          <div className="absolute inset-0 bg-background/50 flex items-center justify-center rounded-full">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
        disabled={uploading}
      />
      
      <Button
        variant="ghost"
        size="icon"
        className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-card shadow-md border border-border hover:bg-muted"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
      >
        <Camera className="h-4 w-4" />
      </Button>
    </div>
  );
}
