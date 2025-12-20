import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Users, 
  Plus, 
  Search, 
  MoreVertical,
  Mail,
  Shield,
  ShieldCheck,
  User,
  Trash2,
  Edit,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { useOrganization, OrgRole } from '@/hooks/useOrganization';

interface Employee {
  id: string;
  name: string;
  email: string;
  role: OrgRole;
  department: string;
  monthlyLimit: number;
  currentSpent: number;
  isActive: boolean;
  avatar: string;
}

// Demo data
const demoEmployees: Employee[] = [
  { id: '1', name: 'Александр Иванов', email: 'a.ivanov@company.ru', role: 'admin', department: 'Руководство', monthlyLimit: 50000, currentSpent: 12500, isActive: true, avatar: '👨‍💼' },
  { id: '2', name: 'Мария Петрова', email: 'm.petrova@company.ru', role: 'manager', department: 'HR', monthlyLimit: 25000, currentSpent: 18900, isActive: true, avatar: '👩‍💼' },
  { id: '3', name: 'Дмитрий Сидоров', email: 'd.sidorov@company.ru', role: 'employee', department: 'Разработка', monthlyLimit: 15000, currentSpent: 14200, isActive: true, avatar: '👨‍💻' },
  { id: '4', name: 'Елена Козлова', email: 'e.kozlova@company.ru', role: 'employee', department: 'Маркетинг', monthlyLimit: 15000, currentSpent: 6700, isActive: true, avatar: '👩‍🎨' },
  { id: '5', name: 'Николай Федоров', email: 'n.fedorov@company.ru', role: 'employee', department: 'Продажи', monthlyLimit: 20000, currentSpent: 11300, isActive: true, avatar: '👨‍💼' },
  { id: '6', name: 'Анна Новикова', email: 'a.novikova@company.ru', role: 'employee', department: 'Бухгалтерия', monthlyLimit: 15000, currentSpent: 9800, isActive: true, avatar: '👩‍💼' },
  { id: '7', name: 'Сергей Волков', email: 's.volkov@company.ru', role: 'employee', department: 'Разработка', monthlyLimit: 15000, currentSpent: 0, isActive: false, avatar: '👨' },
];

const roleConfig = {
  admin: { label: 'Администратор', icon: ShieldCheck, color: 'text-amber-500' },
  manager: { label: 'Менеджер', icon: Shield, color: 'text-blue-500' },
  employee: { label: 'Сотрудник', icon: User, color: 'text-muted-foreground' },
};

const departments = ['Руководство', 'HR', 'Разработка', 'Маркетинг', 'Продажи', 'Бухгалтерия', 'Другое'];

export default function OrganizationEmployeesPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAdmin, isManager } = useOrganization();
  
  const [employees, setEmployees] = useState(demoEmployees);
  const [searchQuery, setSearchQuery] = useState('');
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  
  // Invite form state
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState<OrgRole>('employee');
  const [inviteDepartment, setInviteDepartment] = useState('');
  const [inviteLimit, setInviteLimit] = useState('15000');
  const [isInviting, setIsInviting] = useState(false);

  const canManageEmployees = isAdmin || isManager || true; // true for demo

  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleInvite = async () => {
    if (!inviteEmail || !inviteName) {
      toast({ title: 'Заполните все поля', variant: 'destructive' });
      return;
    }

    setIsInviting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    const newEmployee: Employee = {
      id: Date.now().toString(),
      name: inviteName,
      email: inviteEmail,
      role: inviteRole,
      department: inviteDepartment || 'Другое',
      monthlyLimit: Number(inviteLimit),
      currentSpent: 0,
      isActive: true,
      avatar: '👤',
    };

    setEmployees([...employees, newEmployee]);
    
    toast({
      title: 'Приглашение отправлено',
      description: `Письмо отправлено на ${inviteEmail}`,
    });

    setShowInviteDialog(false);
    resetInviteForm();
    setIsInviting(false);
  };

  const resetInviteForm = () => {
    setInviteEmail('');
    setInviteName('');
    setInviteRole('employee');
    setInviteDepartment('');
    setInviteLimit('15000');
  };

  const handleEditEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setShowEditDialog(true);
  };

  const handleSaveEmployee = async () => {
    if (!selectedEmployee) return;

    setEmployees(employees.map(emp => 
      emp.id === selectedEmployee.id ? selectedEmployee : emp
    ));

    toast({ title: 'Изменения сохранены' });
    setShowEditDialog(false);
    setSelectedEmployee(null);
  };

  const handleToggleActive = (employeeId: string) => {
    setEmployees(employees.map(emp => 
      emp.id === employeeId ? { ...emp, isActive: !emp.isActive } : emp
    ));
  };

  const handleRemoveEmployee = (employeeId: string) => {
    setEmployees(employees.filter(emp => emp.id !== employeeId));
    toast({ title: 'Сотрудник удалён' });
  };

  const totalBudget = employees.reduce((sum, emp) => sum + emp.monthlyLimit, 0);
  const totalSpent = employees.reduce((sum, emp) => sum + emp.currentSpent, 0);
  const activeCount = employees.filter(emp => emp.isActive).length;

  return (
    <div className="page-container">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border/50">
        <div className="px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate(-1)}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-foreground">Сотрудники</h1>
            <p className="text-xs text-muted-foreground">{activeCount} активных из {employees.length}</p>
          </div>
          {canManageEmployees && (
            <Button variant="hero" size="sm" onClick={() => setShowInviteDialog(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Пригласить
            </Button>
          )}
        </div>
      </header>

      <div className="px-4 py-4 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-card rounded-xl border border-border p-4">
            <p className="text-sm text-muted-foreground mb-1">Общий лимит</p>
            <p className="text-xl font-bold">{totalBudget.toLocaleString()} ₽</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <p className="text-sm text-muted-foreground mb-1">Потрачено</p>
            <p className="text-xl font-bold text-primary">{totalSpent.toLocaleString()} ₽</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Поиск по имени, email или отделу..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Employee List */}
        <div className="space-y-3">
          {filteredEmployees.map((employee) => {
            const role = roleConfig[employee.role];
            const RoleIcon = role.icon;
            const spentPercent = (employee.currentSpent / employee.monthlyLimit) * 100;
            const isNearLimit = spentPercent > 80;

            return (
              <div 
                key={employee.id} 
                className={`bg-card rounded-xl border border-border p-4 ${!employee.isActive ? 'opacity-50' : ''}`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-2xl">
                    {employee.avatar}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold truncate">{employee.name}</p>
                      {!employee.isActive && (
                        <Badge variant="secondary" className="text-xs">Неактивен</Badge>
                      )}
                    </div>
                    
                    <p className="text-sm text-muted-foreground truncate">{employee.email}</p>
                    
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center gap-1">
                        <RoleIcon className={`h-4 w-4 ${role.color}`} />
                        <span className="text-xs text-muted-foreground">{role.label}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">{employee.department}</Badge>
                    </div>
                  </div>

                  {canManageEmployees && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditEmployee(employee)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Редактировать
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleActive(employee.id)}>
                          {employee.isActive ? 'Деактивировать' : 'Активировать'}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => handleRemoveEmployee(employee.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Удалить
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>

                {/* Spending Progress */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Расходы за месяц</span>
                    <div className="flex items-center gap-1">
                      {isNearLimit && <AlertTriangle className="h-3 w-3 text-amber-500" />}
                      <span className={isNearLimit ? 'text-amber-500 font-medium' : ''}>
                        {employee.currentSpent.toLocaleString()} / {employee.monthlyLimit.toLocaleString()} ₽
                      </span>
                    </div>
                  </div>
                  <Progress 
                    value={spentPercent} 
                    className={`h-2 ${isNearLimit ? '[&>div]:bg-amber-500' : ''}`} 
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Invite Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Пригласить сотрудника
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Email *</Label>
              <Input
                type="email"
                placeholder="employee@company.ru"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>

            <div>
              <Label>Имя *</Label>
              <Input
                placeholder="Иван Иванов"
                value={inviteName}
                onChange={(e) => setInviteName(e.target.value)}
              />
            </div>

            <div>
              <Label>Роль</Label>
              <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as OrgRole)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Администратор</SelectItem>
                  <SelectItem value="manager">Менеджер</SelectItem>
                  <SelectItem value="employee">Сотрудник</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Администратор — полный доступ, Менеджер — управление заказами, Сотрудник — только заказы
              </p>
            </div>

            <div>
              <Label>Отдел</Label>
              <Select value={inviteDepartment} onValueChange={setInviteDepartment}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите отдел" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map(dept => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Месячный лимит (₽)</Label>
              <Input
                type="number"
                placeholder="15000"
                value={inviteLimit}
                onChange={(e) => setInviteLimit(e.target.value)}
              />
            </div>

            <div className="bg-muted/50 rounded-xl p-4">
              <h4 className="font-medium mb-2">Что произойдёт:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Сотрудник получит email с приглашением</li>
                <li>• После регистрации он будет добавлен в организацию</li>
                <li>• Лимит можно изменить в любой момент</li>
              </ul>
            </div>

            <Button 
              variant="hero" 
              className="w-full"
              onClick={handleInvite}
              disabled={isInviting}
            >
              {isInviting ? 'Отправка...' : 'Отправить приглашение'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Редактировать сотрудника</DialogTitle>
          </DialogHeader>
          
          {selectedEmployee && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-2xl">
                  {selectedEmployee.avatar}
                </div>
                <div>
                  <p className="font-semibold">{selectedEmployee.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedEmployee.email}</p>
                </div>
              </div>

              <div>
                <Label>Роль</Label>
                <Select 
                  value={selectedEmployee.role} 
                  onValueChange={(v) => setSelectedEmployee({...selectedEmployee, role: v as OrgRole})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Администратор</SelectItem>
                    <SelectItem value="manager">Менеджер</SelectItem>
                    <SelectItem value="employee">Сотрудник</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Отдел</Label>
                <Select 
                  value={selectedEmployee.department} 
                  onValueChange={(v) => setSelectedEmployee({...selectedEmployee, department: v})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map(dept => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Месячный лимит (₽)</Label>
                <Input
                  type="number"
                  value={selectedEmployee.monthlyLimit}
                  onChange={(e) => setSelectedEmployee({
                    ...selectedEmployee, 
                    monthlyLimit: Number(e.target.value)
                  })}
                />
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setShowEditDialog(false)}>
                  Отмена
                </Button>
                <Button variant="hero" className="flex-1" onClick={handleSaveEmployee}>
                  Сохранить
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
