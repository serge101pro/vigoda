import { X, ChefHat, Heart, Trophy, MessageCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface ActivityItem {
  id: string;
  type: 'recipe_added' | 'likes_received' | 'award_unlocked' | 'comments';
  title: string;
  description?: string;
  timestamp: string;
  icon: string;
}

interface ActivityModalProps {
  open: boolean;
  onClose: () => void;
}

const mockActivities: ActivityItem[] = [
  {
    id: '1',
    type: 'recipe_added',
    title: 'Вы добавили рецепт "Мой фирменный салат Цезарь"',
    timestamp: '3 дня назад',
    icon: '📋'
  },
  {
    id: '2',
    type: 'likes_received',
    title: 'Ваш рецепт получил 10 лайков! 🎉',
    timestamp: '1 день назад',
    icon: '❤️'
  },
  {
    id: '3',
    type: 'award_unlocked',
    title: 'Разблокировано: ⭐ Кулинар (+100₽)',
    timestamp: '1 день назад',
    icon: '🏆'
  },
  {
    id: '4',
    type: 'comments',
    title: '3 новых комментария к вашему рецепту',
    timestamp: '12 часов назад',
    icon: '💬'
  },
];

const getIconComponent = (type: ActivityItem['type']) => {
  switch (type) {
    case 'recipe_added':
      return <ChefHat className="h-5 w-5 text-primary" />;
    case 'likes_received':
      return <Heart className="h-5 w-5 text-destructive" />;
    case 'award_unlocked':
      return <Trophy className="h-5 w-5 text-accent" />;
    case 'comments':
      return <MessageCircle className="h-5 w-5 text-primary" />;
  }
};

export function ActivityModal({ open, onClose }: ActivityModalProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              📊 Активность
            </DialogTitle>
            <button onClick={onClose} className="p-1 hover:bg-muted rounded-full transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          {mockActivities.map((activity) => (
            <div 
              key={activity.id}
              className="flex items-start gap-3 p-3 bg-muted rounded-xl"
            >
              <div className="w-10 h-10 rounded-full bg-card flex items-center justify-center text-xl shrink-0">
                {activity.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{activity.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{activity.timestamp}</p>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
