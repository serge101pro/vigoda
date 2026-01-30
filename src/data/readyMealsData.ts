// Extended ready meals data with recipes, ingredients, and restaurant info

import chickenQuinoa from '@/assets/meals/chicken-quinoa.jpg';
import salmonTeriyaki from '@/assets/meals/salmon-teriyaki.jpg';

// Use available images with fallbacks
const chickenQuinoaHD = chickenQuinoa;
const salmonTeriyakiHD = salmonTeriyaki;
const oatmealBerriesHD = 'https://images.unsplash.com/photo-1517673400267-0251440c45dc?w=800&fit=crop';
const greekSaladHD = 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&fit=crop';
const borschtHD = 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&fit=crop';
const carbonaraHD = 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=800&fit=crop';

export interface MealIngredient {
  id: string;
  name: string;
  amount: number;
  unit: string;
  pricePerUnit: number;
  image?: string;
}

export interface RecipeStep {
  stepNumber: number;
  description: string;
  duration?: number;
}

export interface Restaurant {
  id: string;
  name: string;
  logo: string;
  rating: number;
  deliveryTime: string;
  deliveryFee: number;
  minOrder: number;
}

export interface ReadyMealFull {
  id: string;
  name: string;
  description: string;
  image: string;
  weight: number;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  price: number;
  oldPrice?: number;
  rating: number;
  reviewCount: number;
  cookTime: number;
  category: string;
  tags: string[];
  ingredients: MealIngredient[];
  allergens: string[];
  storageConditions: string;
  shelfLife: string;
  recipeSteps: RecipeStep[];
  reviews: { author: string; rating: number; text: string; date: string }[];
  baseServings: number;
  // Restaurant info for direct ordering
  restaurant: Restaurant;
  restaurantPrice: number;
  isAvailableForDelivery: boolean;
}

const restaurants: Restaurant[] = [
  {
    id: 'rest1',
    name: 'ЗОЖ Кухня',
    logo: '🥗',
    rating: 4.8,
    deliveryTime: '30-45 мин',
    deliveryFee: 99,
    minOrder: 500,
  },
  {
    id: 'rest2',
    name: 'Суши Мастер',
    logo: '🍣',
    rating: 4.9,
    deliveryTime: '40-60 мин',
    deliveryFee: 149,
    minOrder: 800,
  },
  {
    id: 'rest3',
    name: 'Breakfast Club',
    logo: '🍳',
    rating: 4.7,
    deliveryTime: '25-35 мин',
    deliveryFee: 79,
    minOrder: 400,
  },
  {
    id: 'rest4',
    name: 'Средиземноморская',
    logo: '🫒',
    rating: 4.6,
    deliveryTime: '35-50 мин',
    deliveryFee: 99,
    minOrder: 600,
  },
  {
    id: 'rest5',
    name: 'Борщ & Пельмени',
    logo: '🥣',
    rating: 4.9,
    deliveryTime: '30-40 мин',
    deliveryFee: 79,
    minOrder: 450,
  },
  {
    id: 'rest6',
    name: 'Pasta House',
    logo: '🍝',
    rating: 4.8,
    deliveryTime: '35-50 мин',
    deliveryFee: 119,
    minOrder: 700,
  },
];

export const readyMealsData: ReadyMealFull[] = [
  {
    id: '1',
    name: 'Куриная грудка с киноа и овощами',
    description: 'Нежное филе курицы на гриле с гарниром из киноа, брокколи и моркови. Идеально для здорового обеда или ужина.',
    image: chickenQuinoaHD,
    weight: 350,
    calories: 420,
    protein: 38,
    fat: 12,
    carbs: 35,
    price: 449,
    oldPrice: 549,
    rating: 4.8,
    reviewCount: 234,
    cookTime: 3,
    category: 'Обеды',
    tags: ['Высокобелковое', 'Без глютена'],
    baseServings: 1,
    restaurant: restaurants[0],
    restaurantPrice: 499,
    isAvailableForDelivery: true,
    ingredients: [
      { id: 'ing1', name: 'Куриная грудка', amount: 200, unit: 'г', pricePerUnit: 3.29 },
      { id: 'ing2', name: 'Киноа', amount: 80, unit: 'г', pricePerUnit: 0.89 },
      { id: 'ing3', name: 'Брокколи', amount: 100, unit: 'г', pricePerUnit: 1.59 },
      { id: 'ing4', name: 'Морковь', amount: 50, unit: 'г', pricePerUnit: 0.49 },
      { id: 'ing5', name: 'Оливковое масло', amount: 15, unit: 'мл', pricePerUnit: 1.29 },
      { id: 'ing6', name: 'Специи (паприка, чеснок)', amount: 5, unit: 'г', pricePerUnit: 0.15 },
    ],
    allergens: [],
    storageConditions: 'Хранить при температуре от 0°C до +4°C',
    shelfLife: '5 суток',
    recipeSteps: [
      { stepNumber: 1, description: 'Промойте киноа и отварите в подсоленной воде 15-20 минут до готовности.', duration: 20 },
      { stepNumber: 2, description: 'Куриную грудку нарежьте порционными кусочками и натрите специями (паприка, соль, чеснок).', duration: 5 },
      { stepNumber: 3, description: 'Обжарьте курицу на оливковом масле на среднем огне до золотистой корочки, около 10-12 минут.', duration: 12 },
      { stepNumber: 4, description: 'Брокколи разберите на соцветия, морковь нарежьте кружочками. Приготовьте на пару или отварите 5-7 минут.', duration: 7 },
      { stepNumber: 5, description: 'Выложите на тарелку киноа, сверху курицу и овощи. Подавайте горячим.', duration: 2 },
    ],
    reviews: [
      { author: 'Мария П.', rating: 5, text: 'Очень вкусно и сытно! Идеально для обеда в офисе.', date: '18.12.2024' },
      { author: 'Алексей К.', rating: 5, text: 'Отличное соотношение белка и калорий. Рекомендую!', date: '15.12.2024' },
      { author: 'Елена С.', rating: 4, text: 'Хорошее блюдо, немного не хватило соуса.', date: '12.12.2024' },
    ],
  },
  {
    id: '2',
    name: 'Лосось терияки с рисом',
    description: 'Запечённое филе лосося в соусе терияки с рисом и свежими овощами. Богато Омега-3.',
    image: salmonTeriyakiHD,
    weight: 380,
    calories: 520,
    protein: 32,
    fat: 18,
    carbs: 48,
    price: 649,
    rating: 4.9,
    reviewCount: 189,
    cookTime: 3,
    category: 'Обеды',
    tags: ['Омега-3', 'Премиум'],
    baseServings: 1,
    restaurant: restaurants[1],
    restaurantPrice: 749,
    isAvailableForDelivery: true,
    ingredients: [
      { id: 'ing7', name: 'Филе лосося', amount: 180, unit: 'г', pricePerUnit: 8.99 },
      { id: 'ing8', name: 'Рис жасмин', amount: 100, unit: 'г', pricePerUnit: 0.79 },
      { id: 'ing9', name: 'Соус терияки', amount: 40, unit: 'мл', pricePerUnit: 0.69 },
      { id: 'ing10', name: 'Кунжут', amount: 10, unit: 'г', pricePerUnit: 0.35 },
      { id: 'ing11', name: 'Имбирь свежий', amount: 10, unit: 'г', pricePerUnit: 0.25 },
      { id: 'ing12', name: 'Зелёный лук', amount: 15, unit: 'г', pricePerUnit: 0.20 },
    ],
    allergens: ['Рыба', 'Соя', 'Кунжут'],
    storageConditions: 'Хранить при температуре от 0°C до +4°C',
    shelfLife: '3 суток',
    recipeSteps: [
      { stepNumber: 1, description: 'Промойте рис и отварите согласно инструкции на упаковке.', duration: 15 },
      { stepNumber: 2, description: 'Филе лосося посолите и выложите на противень кожей вниз.', duration: 3 },
      { stepNumber: 3, description: 'Смешайте соус терияки с тёртым имбирём. Смажьте лосось половиной соуса.', duration: 2 },
      { stepNumber: 4, description: 'Запекайте лосось в разогретой до 200°C духовке 12-15 минут.', duration: 15 },
      { stepNumber: 5, description: 'Подавайте с рисом, полейте оставшимся соусом, посыпьте кунжутом и зелёным луком.', duration: 2 },
    ],
    reviews: [
      { author: 'Дмитрий В.', rating: 5, text: 'Невероятно вкусный лосось! Как в ресторане.', date: '17.12.2024' },
      { author: 'Ольга М.', rating: 5, text: 'Обожаю это блюдо! Заказываю каждую неделю.', date: '14.12.2024' },
      { author: 'Игорь Л.', rating: 4, text: 'Очень вкусно, но цена немного высокая.', date: '10.12.2024' },
    ],
  },
  {
    id: '3',
    name: 'Овсянка с ягодами и орехами',
    description: 'Идеальный завтрак для бодрого утра. Овсяная каша с миксом свежих ягод и хрустящими орехами.',
    image: oatmealBerriesHD,
    weight: 280,
    calories: 340,
    protein: 12,
    fat: 14,
    carbs: 45,
    price: 249,
    rating: 4.7,
    reviewCount: 156,
    cookTime: 2,
    category: 'Завтраки',
    tags: ['Завтрак', 'Растительное'],
    baseServings: 1,
    restaurant: restaurants[2],
    restaurantPrice: 299,
    isAvailableForDelivery: true,
    ingredients: [
      { id: 'ing13', name: 'Овсяные хлопья', amount: 60, unit: 'г', pricePerUnit: 0.25 },
      { id: 'ing14', name: 'Молоко', amount: 150, unit: 'мл', pricePerUnit: 0.12 },
      { id: 'ing15', name: 'Черника', amount: 30, unit: 'г', pricePerUnit: 1.20 },
      { id: 'ing16', name: 'Малина', amount: 30, unit: 'г', pricePerUnit: 1.50 },
      { id: 'ing17', name: 'Миндаль', amount: 20, unit: 'г', pricePerUnit: 0.89 },
      { id: 'ing18', name: 'Мёд', amount: 15, unit: 'г', pricePerUnit: 0.35 },
    ],
    allergens: ['Молоко', 'Орехи'],
    storageConditions: 'Хранить при температуре от +2°C до +6°C',
    shelfLife: '2 суток',
    recipeSteps: [
      { stepNumber: 1, description: 'Залейте овсяные хлопья молоком в кастрюле и поставьте на средний огонь.', duration: 1 },
      { stepNumber: 2, description: 'Варите, помешивая, 5-7 минут до загустения каши.', duration: 7 },
      { stepNumber: 3, description: 'Переложите в тарелку и дайте немного остыть.', duration: 2 },
      { stepNumber: 4, description: 'Выложите сверху чернику и малину, посыпьте миндалём и полейте мёдом.', duration: 2 },
    ],
    reviews: [
      { author: 'Анна Б.', rating: 5, text: 'Лучший завтрак! Начинаю день с энергии.', date: '19.12.2024' },
      { author: 'Павел С.', rating: 4, text: 'Вкусно, но хотелось бы больше ягод.', date: '16.12.2024' },
    ],
  },
  {
    id: '4',
    name: 'Греческий салат с фетой',
    description: 'Свежие овощи с оливками, сыром фета и ароматным оливковым маслом. Лёгкий и освежающий.',
    image: greekSaladHD,
    weight: 250,
    calories: 280,
    protein: 8,
    fat: 22,
    carbs: 12,
    price: 349,
    oldPrice: 399,
    rating: 4.6,
    reviewCount: 98,
    cookTime: 0,
    category: 'Салаты',
    tags: ['Вегетарианское', 'Лёгкое'],
    baseServings: 1,
    restaurant: restaurants[3],
    restaurantPrice: 399,
    isAvailableForDelivery: true,
    ingredients: [
      { id: 'ing19', name: 'Огурцы', amount: 80, unit: 'г', pricePerUnit: 0.35 },
      { id: 'ing20', name: 'Томаты', amount: 100, unit: 'г', pricePerUnit: 0.45 },
      { id: 'ing21', name: 'Перец болгарский', amount: 50, unit: 'г', pricePerUnit: 0.40 },
      { id: 'ing22', name: 'Фета', amount: 60, unit: 'г', pricePerUnit: 1.20 },
      { id: 'ing23', name: 'Маслины', amount: 30, unit: 'г', pricePerUnit: 0.55 },
      { id: 'ing24', name: 'Оливковое масло', amount: 20, unit: 'мл', pricePerUnit: 1.29 },
      { id: 'ing25', name: 'Лук красный', amount: 20, unit: 'г', pricePerUnit: 0.15 },
    ],
    allergens: ['Молоко'],
    storageConditions: 'Хранить при температуре от +2°C до +6°C',
    shelfLife: '1 сутки',
    recipeSteps: [
      { stepNumber: 1, description: 'Огурцы, томаты и перец нарежьте крупными кубиками.', duration: 5 },
      { stepNumber: 2, description: 'Красный лук нарежьте тонкими полукольцами.', duration: 2 },
      { stepNumber: 3, description: 'Смешайте овощи в большой миске, добавьте маслины.', duration: 2 },
      { stepNumber: 4, description: 'Сверху выложите кубики феты, полейте оливковым маслом. Посолите и поперчите.', duration: 2 },
    ],
    reviews: [
      { author: 'Ирина К.', rating: 5, text: 'Свежий и вкусный! Настоящий греческий.', date: '18.12.2024' },
      { author: 'Сергей М.', rating: 4, text: 'Хороший салат, порция немного маленькая.', date: '15.12.2024' },
    ],
  },
  {
    id: '5',
    name: 'Борщ классический',
    description: 'Традиционный украинский борщ на говяжьем бульоне со сметаной и пампушками.',
    image: borschtHD,
    weight: 400,
    calories: 380,
    protein: 22,
    fat: 16,
    carbs: 38,
    price: 329,
    rating: 4.9,
    reviewCount: 312,
    cookTime: 5,
    category: 'Супы',
    tags: ['Традиционное', 'Сытное'],
    baseServings: 1,
    restaurant: restaurants[4],
    restaurantPrice: 379,
    isAvailableForDelivery: true,
    ingredients: [
      { id: 'ing26', name: 'Говядина', amount: 100, unit: 'г', pricePerUnit: 5.49 },
      { id: 'ing27', name: 'Свёкла', amount: 80, unit: 'г', pricePerUnit: 0.35 },
      { id: 'ing28', name: 'Капуста', amount: 60, unit: 'г', pricePerUnit: 0.25 },
      { id: 'ing29', name: 'Картофель', amount: 80, unit: 'г', pricePerUnit: 0.20 },
      { id: 'ing30', name: 'Морковь', amount: 40, unit: 'г', pricePerUnit: 0.15 },
      { id: 'ing31', name: 'Лук', amount: 30, unit: 'г', pricePerUnit: 0.10 },
      { id: 'ing32', name: 'Томатная паста', amount: 20, unit: 'г', pricePerUnit: 0.25 },
      { id: 'ing33', name: 'Сметана', amount: 30, unit: 'г', pricePerUnit: 0.35 },
    ],
    allergens: ['Молоко'],
    storageConditions: 'Хранить при температуре от 0°C до +4°C',
    shelfLife: '3 суток',
    recipeSteps: [
      { stepNumber: 1, description: 'Сварите мясной бульон из говядины (1.5-2 часа).', duration: 120 },
      { stepNumber: 2, description: 'Свёклу натрите на крупной тёрке и потушите с томатной пастой.', duration: 15 },
      { stepNumber: 3, description: 'В готовый бульон добавьте нарезанный картофель.', duration: 10 },
      { stepNumber: 4, description: 'Добавьте нашинкованную капусту, поджарку из лука и моркови.', duration: 10 },
      { stepNumber: 5, description: 'Добавьте тушёную свёклу, доведите до готовности. Подавайте со сметаной.', duration: 10 },
    ],
    reviews: [
      { author: 'Виктор А.', rating: 5, text: 'Как у бабушки! Настоящий домашний борщ.', date: '20.12.2024' },
      { author: 'Наталья В.', rating: 5, text: 'Очень наваристый и вкусный!', date: '17.12.2024' },
      { author: 'Максим Д.', rating: 5, text: 'Лучший борщ в городе!', date: '14.12.2024' },
    ],
  },
  {
    id: '6',
    name: 'Паста Карбонара',
    description: 'Итальянская классика: спагетти с беконом, яичным соусом и пармезаном.',
    image: carbonaraHD,
    weight: 350,
    calories: 580,
    protein: 24,
    fat: 28,
    carbs: 56,
    price: 429,
    rating: 4.8,
    reviewCount: 245,
    cookTime: 3,
    category: 'Обеды',
    tags: ['Итальянское', 'Классика'],
    baseServings: 1,
    restaurant: restaurants[5],
    restaurantPrice: 499,
    isAvailableForDelivery: true,
    ingredients: [
      { id: 'ing34', name: 'Спагетти', amount: 120, unit: 'г', pricePerUnit: 0.45 },
      { id: 'ing35', name: 'Бекон/Гуанчиале', amount: 80, unit: 'г', pricePerUnit: 1.89 },
      { id: 'ing36', name: 'Яйца (желтки)', amount: 60, unit: 'г', pricePerUnit: 0.40 },
      { id: 'ing37', name: 'Пармезан', amount: 40, unit: 'г', pricePerUnit: 1.50 },
      { id: 'ing38', name: 'Чёрный перец', amount: 2, unit: 'г', pricePerUnit: 0.10 },
    ],
    allergens: ['Яйца', 'Молоко', 'Глютен'],
    storageConditions: 'Хранить при температуре от 0°C до +4°C',
    shelfLife: '2 суток',
    recipeSteps: [
      { stepNumber: 1, description: 'Отварите спагетти в подсоленной воде до состояния аль-денте.', duration: 10 },
      { stepNumber: 2, description: 'Нарежьте бекон мелкими кубиками и обжарьте на сухой сковороде до хруста.', duration: 8 },
      { stepNumber: 3, description: 'Смешайте яичные желтки с тёртым пармезаном и щепоткой перца.', duration: 3 },
      { stepNumber: 4, description: 'Снимите сковороду с огня, добавьте горячие спагетти и яичную смесь. Быстро перемешайте.', duration: 2 },
      { stepNumber: 5, description: 'Подавайте немедленно, посыпав дополнительным пармезаном и перцем.', duration: 1 },
    ],
    reviews: [
      { author: 'Андрей П.', rating: 5, text: 'Аутентичная карбонара! Как в Риме.', date: '19.12.2024' },
      { author: 'Екатерина Л.', rating: 4, text: 'Очень вкусно, но калорийно.', date: '16.12.2024' },
      { author: 'Михаил К.', rating: 5, text: 'Идеальное соотношение ингредиентов!', date: '13.12.2024' },
    ],
  },
];

export function getMealById(id: string): ReadyMealFull | undefined {
  return readyMealsData.find(meal => meal.id === id);
}
