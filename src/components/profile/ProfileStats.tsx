interface ProfileStatsProps {
  savings: number;
  listsCreated: number;
  recipesPublished: number;
  awardsEarned: number;
}

export function ProfileStats({ savings, listsCreated, recipesPublished, awardsEarned }: ProfileStatsProps) {
  const stats = [
    { value: `${savings.toLocaleString()} ₽`, label: 'Экономия в месяц', color: 'text-primary' },
    { value: listsCreated, label: 'Списка создано', color: 'text-accent' },
    { value: recipesPublished, label: 'Рецепт опубликован', color: 'text-primary' },
    { value: awardsEarned, label: 'Награды получено', color: 'text-accent' },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {stats.map((stat, idx) => (
        <div 
          key={idx}
          className="bg-card border border-border rounded-2xl p-4 text-center"
        >
          <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}
