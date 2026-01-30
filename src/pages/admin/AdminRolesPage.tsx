import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { 
  ArrowLeft, Shield, Users, Search, Crown, 
  UserPlus, UserMinus, Loader2, AlertTriangle, Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useSuperadmin } from '@/hooks/useSuperadmin';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UserWithRole {
  id: string;
  user_id: string;
  display_name: string | null;
  email: string | null;
  avatar_url: string | null;
  isAdmin: boolean;
  isSuperadmin: boolean;
}

export default function AdminRolesPage() {
  const { isSuperadmin, loading: superadminLoading } = useSuperadmin();
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserWithRole | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [actionType, setActionType] = useState<'grant' | 'revoke'>('grant');
  const [processing, setProcessing] = useState(false);

  const fetchUsers = async () => {
    if (!isSuperadmin) return;

    try {
      setLoading(true);
      
      // Fetch all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('display_name');
      
      if (profilesError) throw profilesError;

      // Fetch admin users
      const { data: admins, error: adminsError } = await supabase
        .from('admin_users')
        .select('user_id');
      
      if (adminsError) throw adminsError;

      // Fetch superadmins
      const { data: superadmins, error: superadminsError } = await supabase
        .from('superadmin_users')
        .select('user_id');
      
      if (superadminsError) throw superadminsError;

      const adminUserIds = new Set(admins?.map(a => a.user_id) || []);
      const superadminUserIds = new Set(superadmins?.map(s => s.user_id) || []);

      const usersWithRoles: UserWithRole[] = (profiles || []).map(profile => ({
        id: profile.id,
        user_id: profile.user_id,
        display_name: profile.display_name,
        email: profile.email,
        avatar_url: profile.avatar_url,
        isAdmin: adminUserIds.has(profile.user_id),
        isSuperadmin: superadminUserIds.has(profile.user_id),
      }));

      setUsers(usersWithRoles);
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

  const handleRoleAction = (user: UserWithRole, action: 'grant' | 'revoke') => {
    if (user.isSuperadmin) {
      toast.error('Невозможно изменить роль СуперАдмина');
      return;
    }
    setSelectedUser(user);
    setActionType(action);
    setShowConfirmDialog(true);
  };

  const confirmAction = async () => {
    if (!selectedUser) return;
    
    setProcessing(true);
    try {
      if (actionType === 'grant') {
        const { error } = await supabase
          .from('admin_users')
          .insert({ user_id: selectedUser.user_id });
        
        if (error) throw error;
        toast.success(`${selectedUser.display_name || selectedUser.email} теперь Админ`);
      } else {
        const { error } = await supabase
          .from('admin_users')
          .delete()
          .eq('user_id', selectedUser.user_id);
        
        if (error) throw error;
        toast.success(`Роль Админа снята с ${selectedUser.display_name || selectedUser.email}`);
      }
      
      await fetchUsers();
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Ошибка изменения роли');
    } finally {
      setProcessing(false);
      setShowConfirmDialog(false);
      setSelectedUser(null);
    }
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

  const adminsCount = users.filter(u => u.isAdmin).length;
  const superadminsCount = users.filter(u => u.isSuperadmin).length;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border">
        <div className="px-4 py-3">
          <div className="flex items-center gap-3">
            <Link to="/admin/users">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold">Управление ролями</h1>
              <p className="text-sm text-muted-foreground">
                {adminsCount} админов • {superadminsCount} суперадминов
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="p-4 space-y-4 pb-24">
        {/* Info Card */}
        <Card className="bg-amber-500/5 border-amber-500/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-600">Важно</p>
                <p className="text-sm text-muted-foreground">
                  Роль СуперАдмина нельзя изменить через интерфейс. 
                  Админы имеют доступ к панели администратора.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Поиск пользователей..."
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
            {filteredUsers.map(user => (
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
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold truncate">
                          {user.display_name || 'Без имени'}
                        </h3>
                        {user.isSuperadmin && (
                          <Badge className="bg-red-500/10 text-red-600">
                            <Crown className="h-3 w-3 mr-1" />
                            СуперАдмин
                          </Badge>
                        )}
                        {user.isAdmin && !user.isSuperadmin && (
                          <Badge className="bg-blue-500/10 text-blue-600">
                            <Shield className="h-3 w-3 mr-1" />
                            Админ
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                    </div>

                    {!user.isSuperadmin && (
                      <div>
                        {user.isAdmin ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive border-destructive/30"
                            onClick={() => handleRoleAction(user, 'revoke')}
                          >
                            <UserMinus className="h-4 w-4 mr-1" />
                            Снять
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRoleAction(user, 'grant')}
                          >
                            <UserPlus className="h-4 w-4 mr-1" />
                            Назначить
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Confirm Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionType === 'grant' ? 'Назначить Админа' : 'Снять роль Админа'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionType === 'grant' 
                ? `Вы уверены, что хотите назначить ${selectedUser?.display_name || selectedUser?.email} администратором? Он получит доступ к панели администратора.`
                : `Вы уверены, что хотите снять роль администратора с ${selectedUser?.display_name || selectedUser?.email}? Он потеряет доступ к панели администратора.`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={processing}>Отмена</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmAction}
              disabled={processing}
              className={actionType === 'revoke' ? 'bg-destructive hover:bg-destructive/90' : ''}
            >
              {processing ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Check className="h-4 w-4 mr-2" />
              )}
              Подтвердить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
