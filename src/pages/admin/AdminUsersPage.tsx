import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { 
  ArrowLeft, Users, Search, Crown, Shield, 
  MoreVertical, Loader2, Mail, Calendar, CreditCard
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useSuperadmin } from '@/hooks/useSuperadmin';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { ChangePlanModal } from '@/components/admin/ChangePlanModal';

interface UserProfile {
  id: string;
  user_id: string;
  display_name: string | null;
  email: string | null;
  avatar_url: string | null;
  bonus_points: number | null;
  created_at: string;
  subscription?: {
    plan: string;
    is_active: boolean;
  } | null;
}

export default function AdminUsersPage() {
  const { isSuperadmin, loading: superadminLoading } = useSuperadmin();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [showPlanModal, setShowPlanModal] = useState(false);

  const fetchUsers = async () => {
    if (!isSuperadmin) return;

    try {
      setLoading(true);
      // Fetch profiles
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch subscriptions for each user
      const usersWithSubs = await Promise.all(
        (profiles || []).map(async (profile) => {
          const { data: sub } = await supabase
            .from('user_subscriptions')
            .select('plan, is_active')
            .eq('user_id', profile.user_id)
            .maybeSingle();
          
          return {
            ...profile,
            subscription: sub,
          };
        })
      );

      setUsers(usersWithSubs);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Ошибка загрузки пользователей');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isSuperadmin) {
      fetchUsers();
    }
  }, [isSuperadmin]);

  const filteredUsers = users.filter(user => 
    user.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getPlanBadge = (plan?: string) => {
    switch (plan) {
      case 'solo':
        return <Badge className="bg-green-500/10 text-green-600">Персона</Badge>;
      case 'family':
        return <Badge className="bg-purple-500/10 text-purple-600">Семья</Badge>;
      case 'corp':
        return <Badge className="bg-orange-500/10 text-orange-600">Бизнес</Badge>;
      default:
        return <Badge variant="secondary">Выгода</Badge>;
    }
  };

  const handleOpenPlanModal = (user: UserProfile) => {
    setSelectedUser(user);
    setShowPlanModal(true);
  };

  if (superadminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isSuperadmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border">
        <div className="px-4 py-3">
          <div className="flex items-center gap-3">
            <Link to="/admin">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold">Пользователи</h1>
              <p className="text-sm text-muted-foreground">{users.length} зарегистрировано</p>
            </div>
          </div>
        </div>
      </header>

      <main className="p-4 space-y-4 pb-24">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Поиск по имени или email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Users List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-3">
            {filteredUsers.map((user) => (
              <Card key={user.id}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={user.avatar_url || undefined} />
                      <AvatarFallback>
                        {user.display_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold truncate">
                          {user.display_name || 'Без имени'}
                        </h3>
                        {getPlanBadge(user.subscription?.plan)}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <Mail className="h-3 w-3" />
                        <span className="truncate">{user.email}</span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(user.created_at), 'd MMM yyyy', { locale: ru })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Crown className="h-3 w-3" />
                          {user.bonus_points || 0} баллов
                        </span>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleOpenPlanModal(user)}>
                          <CreditCard className="h-4 w-4 mr-2" />
                          Изменить тариф
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Crown className="h-4 w-4 mr-2" />
                          Начислить баллы
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to="/admin/users/roles">
                            <Shield className="h-4 w-4 mr-2" />
                            Управление ролями
                          </Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Change Plan Modal */}
      {selectedUser && (
        <ChangePlanModal
          open={showPlanModal}
          onClose={() => {
            setShowPlanModal(false);
            setSelectedUser(null);
          }}
          user={{
            id: selectedUser.id,
            user_id: selectedUser.user_id,
            display_name: selectedUser.display_name,
            email: selectedUser.email,
            currentPlan: selectedUser.subscription?.plan,
          }}
          onSuccess={fetchUsers}
        />
      )}
    </div>
  );
}
