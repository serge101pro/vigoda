import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Check, 
  X, 
  Edit2, 
  ShoppingCart,
  Loader2,
  ClipboardList
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useShoppingLists } from '@/hooks/useShoppingLists';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function ShoppingListsPage() {
  const { user } = useAuth();
  const { lists, loading, createList, deleteList, addItemToList, updateItem, deleteItem, toggleItemChecked } = useShoppingLists();
  
  const [newListName, setNewListName] = useState('');
  const [newListDialogOpen, setNewListDialogOpen] = useState(false);
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [newItemName, setNewItemName] = useState('');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingItemName, setEditingItemName] = useState('');

  const handleCreateList = async () => {
    if (!newListName.trim()) {
      toast({ title: 'Введите название списка', variant: 'destructive' });
      return;
    }
    const result = await createList(newListName.trim());
    if (result) {
      setNewListName('');
      setNewListDialogOpen(false);
      setSelectedListId(result.id);
    }
  };

  const handleAddItem = async () => {
    if (!selectedListId || !newItemName.trim()) return;
    await addItemToList(selectedListId, newItemName.trim());
    setNewItemName('');
  };

  const handleSaveItemEdit = async (itemId: string) => {
    if (!editingItemName.trim()) return;
    await updateItem(itemId, { name: editingItemName.trim() });
    setEditingItemId(null);
    setEditingItemName('');
  };

  const selectedList = lists.find(l => l.id === selectedListId);
  const checkedCount = selectedList?.items.filter(i => i.is_checked).length || 0;
  const totalCount = selectedList?.items.length || 0;

  if (!user) {
    return (
      <div className="page-container flex flex-col items-center justify-center px-4">
        <ClipboardList className="h-16 w-16 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold text-foreground mb-2">Списки покупок</h1>
        <p className="text-muted-foreground text-center mb-6">
          Войдите в аккаунт, чтобы создавать и управлять списками покупок
        </p>
        <Link to="/auth/login">
          <Button variant="hero">Войти</Button>
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border/50">
        <div className="px-4 py-3 flex items-center gap-3">
          <Link to={selectedListId ? '#' : '/profile'} onClick={selectedListId ? () => setSelectedListId(null) : undefined}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold text-foreground flex-1">
            {selectedListId ? selectedList?.name : 'Мои списки'}
          </h1>
          {!selectedListId && (
            <Dialog open={newListDialogOpen} onOpenChange={setNewListDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="hero" size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Создать
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Новый список</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <Input
                    placeholder="Название списка..."
                    value={newListName}
                    onChange={(e) => setNewListName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCreateList()}
                  />
                  <Button variant="hero" className="w-full" onClick={handleCreateList}>
                    Создать список
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </header>

      <div className="px-4 py-4">
        {!selectedListId ? (
          // Lists view
          <div className="space-y-3">
            {lists.length === 0 ? (
              <div className="text-center py-12">
                <ClipboardList className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">У вас пока нет списков покупок</p>
                <Dialog open={newListDialogOpen} onOpenChange={setNewListDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="hero">
                      <Plus className="h-4 w-4 mr-2" />
                      Создать первый список
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Новый список</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <Input
                        placeholder="Название списка..."
                        value={newListName}
                        onChange={(e) => setNewListName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleCreateList()}
                      />
                      <Button variant="hero" className="w-full" onClick={handleCreateList}>
                        Создать список
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            ) : (
              lists.map((list) => {
                const checked = list.items.filter(i => i.is_checked).length;
                const total = list.items.length;
                
                return (
                  <div
                    key={list.id}
                    className="bg-card rounded-2xl p-4 border border-border shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <button
                        className="flex-1 text-left"
                        onClick={() => setSelectedListId(list.id)}
                      >
                        <h3 className="font-bold text-foreground">{list.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {total === 0 ? 'Пусто' : `${checked}/${total} куплено`}
                        </p>
                      </button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Удалить список?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Список "{list.name}" и все его элементы будут удалены. Это действие нельзя отменить.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Отмена</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteList(list.id)}>
                              Удалить
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                    {total > 0 && (
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${(checked / total) * 100}%` }}
                        />
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        ) : (
          // Single list view
          <div className="space-y-4">
            {/* Progress */}
            {totalCount > 0 && (
              <div className="bg-card rounded-2xl p-4 border border-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Прогресс</span>
                  <span className="font-bold text-foreground">{checkedCount}/{totalCount}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-3">
                  <div
                    className="bg-primary h-3 rounded-full transition-all"
                    style={{ width: `${(checkedCount / totalCount) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* Add item */}
            <div className="flex gap-2">
              <Input
                placeholder="Добавить товар..."
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
              />
              <Button variant="hero" size="icon" onClick={handleAddItem}>
                <Plus className="h-5 w-5" />
              </Button>
            </div>

            {/* Items */}
            <div className="space-y-2">
              {selectedList?.items.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">Список пуст</p>
                  <p className="text-sm text-muted-foreground">Добавьте товары для покупки</p>
                </div>
              ) : (
                selectedList?.items.map((item) => (
                  <div
                    key={item.id}
                    className={`bg-card rounded-xl p-3 border border-border flex items-center gap-3 transition-opacity ${
                      item.is_checked ? 'opacity-60' : ''
                    }`}
                  >
                    <Checkbox
                      checked={item.is_checked}
                      onCheckedChange={(checked) => toggleItemChecked(item.id, !!checked)}
                    />
                    
                    {editingItemId === item.id ? (
                      <div className="flex-1 flex gap-2">
                        <Input
                          value={editingItemName}
                          onChange={(e) => setEditingItemName(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSaveItemEdit(item.id)}
                          autoFocus
                        />
                        <Button variant="ghost" size="icon" onClick={() => handleSaveItemEdit(item.id)}>
                          <Check className="h-4 w-4 text-primary" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setEditingItemId(null)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <span className={`flex-1 ${item.is_checked ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                          {item.name}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingItemId(item.id);
                            setEditingItemName(item.name);
                          }}
                        >
                          <Edit2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
