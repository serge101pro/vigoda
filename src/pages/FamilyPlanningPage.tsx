import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Users, ShoppingCart, Check, Edit2, Trash2, Crown, User, Baby, Dog, X, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface FamilyMember {
  id: string;
  name: string;
  avatar: string;
  role: 'admin' | 'member' | 'child' | 'pet';
  color: string;
  dietaryRestrictions: string[];
  allergies: string[];
}

interface SharedList {
  id: string;
  name: string;
  emoji: string;
  items: ListItem[];
  members: string[];
  createdBy: string;
  lastUpdated: string;
}

interface ListItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  addedBy: string;
  completed: boolean;
  assignedTo?: string;
}

const initialMembers: FamilyMember[] = [
  {
    id: '1',
    name: 'Алексей',
    avatar: '👨',
    role: 'admin',
    color: 'bg-blue-500',
    dietaryRestrictions: [],
    allergies: [],
  },
  {
    id: '2',
    name: 'Мария',
    avatar: '👩',
    role: 'member',
    color: 'bg-pink-500',
    dietaryRestrictions: ['Вегетарианец'],
    allergies: ['Орехи'],
  },
  {
    id: '3',
    name: 'Максим',
    avatar: '👦',
    role: 'child',
    color: 'bg-green-500',
    dietaryRestrictions: [],
    allergies: ['Молоко'],
  },
  {
    id: '4',
    name: 'Барсик',
    avatar: '🐱',
    role: 'pet',
    color: 'bg-orange-500',
    dietaryRestrictions: [],
    allergies: [],
  },
];

const initialLists: SharedList[] = [
  {
    id: '1',
    name: 'Еженедельные покупки',
    emoji: '🛒',
    items: [
      { id: '1', name: 'Молоко', quantity: 2, unit: 'л', addedBy: '1', completed: false },
      { id: '2', name: 'Хлеб', quantity: 1, unit: 'шт', addedBy: '2', completed: true },
      { id: '3', name: 'Яблоки', quantity: 1, unit: 'кг', addedBy: '1', completed: false },
      { id: '4', name: 'Сыр', quantity: 300, unit: 'г', addedBy: '2', completed: false },
    ],
    members: ['1', '2'],
    createdBy: '1',
    lastUpdated: '10 мин назад',
  },
  {
    id: '2',
    name: 'Для пикника',
    emoji: '🧺',
    items: [
      { id: '5', name: 'Сосиски', quantity: 1, unit: 'уп', addedBy: '1', completed: false },
      { id: '6', name: 'Булочки', quantity: 6, unit: 'шт', addedBy: '2', completed: false },
    ],
    members: ['1', '2', '3'],
    createdBy: '2',
    lastUpdated: '2 часа назад',
  },
  {
    id: '3',
    name: 'Для питомца',
    emoji: '🐱',
    items: [
      { id: '7', name: 'Корм сухой', quantity: 1, unit: 'кг', addedBy: '1', completed: false },
      { id: '8', name: 'Лакомства', quantity: 1, unit: 'уп', addedBy: '2', completed: true },
    ],
    members: ['1'],
    createdBy: '1',
    lastUpdated: '1 день назад',
  },
];

const roleIcons = {
  admin: Crown,
  member: User,
  child: Baby,
  pet: Dog,
};

const roleLabels = {
  admin: 'Администратор',
  member: 'Участник',
  child: 'Ребёнок',
  pet: 'Питомец',
};

export default function FamilyPlanningPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [members, setMembers] = useState(initialMembers);
  const [lists, setLists] = useState(initialLists);
  const [selectedList, setSelectedList] = useState<string | null>(null);
  const [newItemName, setNewItemName] = useState('');
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<FamilyMember['role']>('member');

  const currentList = lists.find((l) => l.id === selectedList);

  const getMemberById = (id: string) => members.find((m) => m.id === id);

  const toggleItemComplete = (listId: string, itemId: string) => {
    setLists((prev) =>
      prev.map((list) =>
        list.id === listId
          ? {
              ...list,
              items: list.items.map((item) =>
                item.id === itemId ? { ...item, completed: !item.completed } : item
              ),
            }
          : list
      )
    );
  };

  const addItemToList = (listId: string) => {
    if (!newItemName.trim()) return;
    setLists((prev) =>
      prev.map((list) =>
        list.id === listId
          ? {
              ...list,
              items: [
                ...list.items,
                {
                  id: Date.now().toString(),
                  name: newItemName,
                  quantity: 1,
                  unit: 'шт',
                  addedBy: '1',
                  completed: false,
                },
              ],
              lastUpdated: 'Только что',
            }
          : list
      )
    );
    setNewItemName('');
    toast({ title: 'Товар добавлен в список' });
  };

  const removeItemFromList = (listId: string, itemId: string) => {
    setLists((prev) =>
      prev.map((list) =>
        list.id === listId
          ? { ...list, items: list.items.filter((item) => item.id !== itemId) }
          : list
      )
    );
  };

  const addMember = () => {
    if (!newMemberName.trim()) return;
    const avatars = ['👨', '👩', '👧', '👦', '🧑', '🐶', '🐱'];
    const colors = ['bg-blue-500', 'bg-pink-500', 'bg-green-500', 'bg-purple-500', 'bg-amber-500'];
    const newMember: FamilyMember = {
      id: Date.now().toString(),
      name: newMemberName,
      avatar: avatars[Math.floor(Math.random() * avatars.length)],
      role: newMemberRole,
      color: colors[Math.floor(Math.random() * colors.length)],
      dietaryRestrictions: [],
      allergies: [],
    };
    setMembers((prev) => [...prev, newMember]);
    setNewMemberName('');
    setShowAddMember(false);
    toast({ title: 'Участник добавлен' });
  };

  const shareList = (listId: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/family/list/${listId}`);
    toast({ title: 'Ссылка скопирована!' });
  };

  return (
    <div className="page-container">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-muted">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="font-bold text-lg">Семейное планирование</h1>
          <div className="w-10" />
        </div>
      </header>

      {/* Hero */}
      <section className="px-4 py-4">
        <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl p-4 border border-primary/20">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="font-bold">Семья Ивановых</h2>
              <p className="text-sm text-muted-foreground">{members.length} участников</p>
            </div>
          </div>
        </div>
      </section>

      <Tabs defaultValue="members" className="px-4">
        <TabsList className="w-full grid grid-cols-2 bg-muted rounded-xl mb-4">
          <TabsTrigger value="members">Участники</TabsTrigger>
          <TabsTrigger value="lists">Списки покупок</TabsTrigger>
        </TabsList>

        {/* Members Tab */}
        <TabsContent value="members" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Члены семьи</h3>
            <Button size="sm" variant="outline" onClick={() => setShowAddMember(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Добавить
            </Button>
          </div>

          <div className="space-y-3">
            {members.map((member) => {
              const RoleIcon = roleIcons[member.role];
              return (
                <div
                  key={member.id}
                  className="bg-card rounded-xl border border-border p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full ${member.color} flex items-center justify-center text-2xl`}>
                      {member.avatar}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{member.name}</h4>
                        {member.role === 'admin' && (
                          <Crown className="h-4 w-4 text-amber-500" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <RoleIcon className="h-4 w-4" />
                        <span>{roleLabels[member.role]}</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon">
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {(member.dietaryRestrictions.length > 0 || member.allergies.length > 0) && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <div className="flex flex-wrap gap-2">
                        {member.dietaryRestrictions.map((diet) => (
                          <Badge key={diet} variant="secondary" className="text-xs">
                            🥗 {diet}
                          </Badge>
                        ))}
                        {member.allergies.map((allergy) => (
                          <Badge key={allergy} variant="destructive" className="text-xs">
                            ⚠️ {allergy}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Add Member Dialog */}
          <Dialog open={showAddMember} onOpenChange={setShowAddMember}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Добавить участника</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Имя"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                />
                <div className="grid grid-cols-2 gap-2">
                  {(['member', 'child', 'pet'] as const).map((role) => {
                    const Icon = roleIcons[role];
                    return (
                      <button
                        key={role}
                        onClick={() => setNewMemberRole(role)}
                        className={`p-3 rounded-xl border text-center transition-all ${
                          newMemberRole === role
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <Icon className="h-5 w-5 mx-auto mb-1" />
                        <span className="text-sm">{roleLabels[role]}</span>
                      </button>
                    );
                  })}
                </div>
                <Button onClick={addMember} className="w-full">
                  Добавить
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* Lists Tab */}
        <TabsContent value="lists" className="space-y-4">
          {!selectedList ? (
            <>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Совместные списки</h3>
                <Button size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-1" />
                  Создать
                </Button>
              </div>

              <div className="space-y-3">
                {lists.map((list) => {
                  const completedCount = list.items.filter((i) => i.completed).length;
                  const listMembers = list.members.map((id) => getMemberById(id)).filter(Boolean);

                  return (
                    <button
                      key={list.id}
                      onClick={() => setSelectedList(list.id)}
                      className="w-full bg-card rounded-xl border border-border p-4 text-left hover:border-primary/50 transition-all"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{list.emoji}</span>
                          <h4 className="font-semibold">{list.name}</h4>
                        </div>
                        <Badge variant="secondary">
                          {completedCount}/{list.items.length}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex -space-x-2">
                          {listMembers.map((member) => (
                            <div
                              key={member!.id}
                              className={`w-7 h-7 rounded-full ${member!.color} flex items-center justify-center text-sm border-2 border-background`}
                            >
                              {member!.avatar}
                            </div>
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground">{list.lastUpdated}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setSelectedList(null)}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Назад к спискам
                </button>
                <Button size="sm" variant="ghost" onClick={() => shareList(selectedList)}>
                  <Share2 className="h-4 w-4 mr-1" />
                  Поделиться
                </Button>
              </div>

              <div className="bg-card rounded-xl border border-border p-4">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">{currentList?.emoji}</span>
                  <h3 className="font-bold text-lg">{currentList?.name}</h3>
                </div>

                {/* Add Item */}
                <div className="flex gap-2 mb-4">
                  <Input
                    placeholder="Добавить товар..."
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addItemToList(selectedList)}
                  />
                  <Button onClick={() => addItemToList(selectedList)}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {/* Items List */}
                <div className="space-y-2">
                  {currentList?.items.map((item) => {
                    const addedByMember = getMemberById(item.addedBy);
                    return (
                      <div
                        key={item.id}
                        className={`flex items-center gap-3 p-3 rounded-xl ${
                          item.completed ? 'bg-muted/50' : 'bg-muted'
                        }`}
                      >
                        <button
                          onClick={() => toggleItemComplete(selectedList, item.id)}
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                            item.completed
                              ? 'bg-primary border-primary text-primary-foreground'
                              : 'border-border hover:border-primary'
                          }`}
                        >
                          {item.completed && <Check className="h-4 w-4" />}
                        </button>
                        <div className="flex-1">
                          <p className={`font-medium ${item.completed ? 'line-through text-muted-foreground' : ''}`}>
                            {item.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {item.quantity} {item.unit} • добавил {addedByMember?.name}
                          </p>
                        </div>
                        <button
                          onClick={() => removeItemFromList(selectedList, item.id)}
                          className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* List Members */}
              <div className="bg-card rounded-xl border border-border p-4">
                <h4 className="font-semibold mb-3">Участники списка</h4>
                <div className="flex flex-wrap gap-2">
                  {currentList?.members.map((memberId) => {
                    const member = getMemberById(memberId);
                    return member ? (
                      <div
                        key={member.id}
                        className="flex items-center gap-2 bg-muted rounded-full pl-1 pr-3 py-1"
                      >
                        <div className={`w-6 h-6 rounded-full ${member.color} flex items-center justify-center text-xs`}>
                          {member.avatar}
                        </div>
                        <span className="text-sm">{member.name}</span>
                      </div>
                    ) : null;
                  })}
                  <button className="flex items-center gap-1 text-sm text-primary hover:underline">
                    <Plus className="h-4 w-4" />
                    Добавить
                  </button>
                </div>
              </div>

              {/* Add to Cart */}
              <Button className="w-full" size="lg">
                <ShoppingCart className="h-5 w-5 mr-2" />
                Добавить всё в корзину
              </Button>
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Bottom padding */}
      <div className="h-6" />
    </div>
  );
}
