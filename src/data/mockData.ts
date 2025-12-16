import { Product, Recipe } from '@/stores/useAppStore';

// Product images
import tomatoes from '@/assets/products/tomatoes.jpg';
import broccoli from '@/assets/products/broccoli.jpg';
import milk from '@/assets/products/milk.jpg';
import chicken from '@/assets/products/chicken.jpg';
import bread from '@/assets/products/bread.jpg';
import apples from '@/assets/products/apples.jpg';
import salmon from '@/assets/products/salmon.jpg';
import cheese from '@/assets/products/cheese.jpg';
import eggs from '@/assets/products/eggs.jpg';
import orangeJuice from '@/assets/products/orange-juice.jpg';
import pasta from '@/assets/products/pasta.jpg';
import salad from '@/assets/products/salad.jpg';
import beef from '@/assets/products/beef.jpg';
import honey from '@/assets/products/honey.jpg';
import avocado from '@/assets/products/avocado.jpg';

// Cosmetics images
import cream from '@/assets/cosmetics/cream.jpg';
import shampoo from '@/assets/cosmetics/shampoo.jpg';
import lipstick from '@/assets/cosmetics/lipstick.jpg';
import perfume from '@/assets/cosmetics/perfume.jpg';
import mascara from '@/assets/cosmetics/mascara.jpg';
import skincare from '@/assets/cosmetics/skincare.jpg';

// Household images
import detergent from '@/assets/household/detergent.jpg';
import cleaner from '@/assets/household/cleaner.jpg';
import dishSoap from '@/assets/household/dish-soap.jpg';
import sponges from '@/assets/household/sponges.jpg';
import toiletPaper from '@/assets/household/toilet-paper.jpg';
import trashBags from '@/assets/household/trash-bags.jpg';

export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Томаты на ветке',
    category: 'vegetables',
    image: tomatoes,
    price: 189,
    oldPrice: 249,
    unit: 'кг',
    rating: 4.8,
    reviewCount: 212,
    badge: 'sale',
    stores: [
      { name: 'Пятёрочка', price: 189 },
      { name: 'Магнит', price: 199 },
      { name: 'Перекрёсток', price: 219 },
    ],
  },
  {
    id: '2',
    name: 'Брокколи свежая',
    category: 'vegetables',
    image: broccoli,
    price: 159,
    unit: 'шт',
    rating: 4.6,
    reviewCount: 87,
    badge: 'new',
    stores: [
      { name: 'Пятёрочка', price: 169 },
      { name: 'Магнит', price: 159 },
      { name: 'ВкусВилл', price: 179 },
    ],
  },
  {
    id: '3',
    name: 'Молоко 3.2%',
    category: 'dairy',
    image: milk,
    price: 89,
    oldPrice: 109,
    unit: 'л',
    rating: 4.9,
    reviewCount: 543,
    badge: 'hot',
    stores: [
      { name: 'Пятёрочка', price: 89 },
      { name: 'Магнит', price: 95 },
      { name: 'Дикси', price: 99 },
    ],
  },
  {
    id: '4',
    name: 'Куриное филе',
    category: 'meat',
    image: chicken,
    price: 329,
    unit: 'кг',
    rating: 4.7,
    reviewCount: 324,
    stores: [
      { name: 'Пятёрочка', price: 349 },
      { name: 'Магнит', price: 329 },
      { name: 'Метро', price: 299 },
    ],
  },
  {
    id: '5',
    name: 'Хлеб белый',
    category: 'bakery',
    image: bread,
    price: 49,
    unit: 'шт',
    rating: 4.5,
    reviewCount: 156,
    badge: 'new',
    stores: [
      { name: 'Пятёрочка', price: 49 },
      { name: 'Магнит', price: 52 },
      { name: 'Перекрёсток', price: 55 },
    ],
  },
  {
    id: '6',
    name: 'Яблоки Гала',
    category: 'fruits',
    image: apples,
    price: 129,
    unit: 'кг',
    rating: 4.7,
    reviewCount: 198,
    stores: [
      { name: 'Пятёрочка', price: 139 },
      { name: 'Магнит', price: 129 },
      { name: 'ВкусВилл', price: 149 },
    ],
  },
  {
    id: '7',
    name: 'Лосось филе',
    category: 'fish',
    image: salmon,
    price: 899,
    oldPrice: 1099,
    unit: 'кг',
    rating: 4.9,
    reviewCount: 267,
    badge: 'sale',
    stores: [
      { name: 'Перекрёсток', price: 899 },
      { name: 'ВкусВилл', price: 949 },
      { name: 'Метро', price: 859 },
    ],
  },
  {
    id: '8',
    name: 'Сыр Российский',
    category: 'dairy',
    image: cheese,
    price: 449,
    unit: 'кг',
    rating: 4.6,
    reviewCount: 312,
    stores: [
      { name: 'Пятёрочка', price: 469 },
      { name: 'Магнит', price: 449 },
      { name: 'Дикси', price: 459 },
    ],
  },
  {
    id: '9',
    name: 'Яйца С0 10шт',
    category: 'dairy',
    image: eggs,
    price: 119,
    unit: 'уп',
    rating: 4.8,
    reviewCount: 456,
    badge: 'hot',
    stores: [
      { name: 'Пятёрочка', price: 119 },
      { name: 'Магнит', price: 125 },
      { name: 'Перекрёсток', price: 129 },
    ],
  },
  {
    id: '10',
    name: 'Сок апельсиновый',
    category: 'drinks',
    image: orangeJuice,
    price: 159,
    unit: 'л',
    rating: 4.5,
    reviewCount: 178,
    stores: [
      { name: 'Пятёрочка', price: 169 },
      { name: 'Магнит', price: 159 },
      { name: 'Перекрёсток', price: 175 },
    ],
  },
];

// Cosmetics products
export const cosmeticsProducts: Product[] = [
  {
    id: 'cos1',
    name: 'Крем для лица увлажняющий',
    category: 'skincare',
    image: cream,
    price: 599,
    oldPrice: 799,
    unit: 'шт',
    rating: 4.8,
    reviewCount: 342,
    badge: 'sale',
    stores: [
      { name: 'Магнит Косметик', price: 599 },
      { name: 'Подружка', price: 649 },
      { name: 'Л\'Этуаль', price: 699 },
    ],
  },
  {
    id: 'cos2',
    name: 'Шампунь для волос',
    category: 'haircare',
    image: shampoo,
    price: 349,
    unit: 'шт',
    rating: 4.6,
    reviewCount: 256,
    stores: [
      { name: 'Магнит Косметик', price: 349 },
      { name: 'Подружка', price: 369 },
      { name: 'Пятёрочка', price: 379 },
    ],
  },
  {
    id: 'cos3',
    name: 'Помада матовая',
    category: 'makeup',
    image: lipstick,
    price: 499,
    unit: 'шт',
    rating: 4.7,
    reviewCount: 189,
    badge: 'new',
    stores: [
      { name: 'Л\'Этуаль', price: 499 },
      { name: 'Подружка', price: 529 },
      { name: 'РивГош', price: 549 },
    ],
  },
  {
    id: 'cos4',
    name: 'Духи женские 50мл',
    category: 'perfume',
    image: perfume,
    price: 2990,
    oldPrice: 3490,
    unit: 'шт',
    rating: 4.9,
    reviewCount: 423,
    badge: 'sale',
    stores: [
      { name: 'Л\'Этуаль', price: 2990 },
      { name: 'РивГош', price: 3190 },
      { name: 'Золотое Яблоко', price: 3290 },
    ],
  },
  {
    id: 'cos5',
    name: 'Сыворотка для лица',
    category: 'skincare',
    image: skincare,
    price: 899,
    unit: 'шт',
    rating: 4.8,
    reviewCount: 156,
    badge: 'hot',
    stores: [
      { name: 'Л\'Этуаль', price: 899 },
      { name: 'Подружка', price: 949 },
      { name: 'Магнит Косметик', price: 929 },
    ],
  },
];

// Household products
export const householdProducts: Product[] = [
  {
    id: 'hh1',
    name: 'Стиральный порошок 3кг',
    category: 'laundry',
    image: detergent,
    price: 449,
    oldPrice: 549,
    unit: 'шт',
    rating: 4.7,
    reviewCount: 567,
    badge: 'sale',
    stores: [
      { name: 'Пятёрочка', price: 449 },
      { name: 'Магнит', price: 469 },
      { name: 'Лента', price: 429 },
    ],
  },
  {
    id: 'hh2',
    name: 'Средство для мытья полов',
    category: 'cleaning',
    image: cleaner,
    price: 189,
    unit: 'шт',
    rating: 4.5,
    reviewCount: 234,
    stores: [
      { name: 'Пятёрочка', price: 199 },
      { name: 'Магнит', price: 189 },
      { name: 'Дикси', price: 209 },
    ],
  },
  {
    id: 'hh3',
    name: 'Средство для посуды',
    category: 'dishes',
    image: dishSoap,
    price: 129,
    unit: 'шт',
    rating: 4.6,
    reviewCount: 456,
    stores: [
      { name: 'Пятёрочка', price: 129 },
      { name: 'Магнит', price: 135 },
      { name: 'Перекрёсток', price: 139 },
    ],
  },
  {
    id: 'hh4',
    name: 'Губки кухонные 5шт',
    category: 'accessories',
    image: sponges,
    price: 79,
    unit: 'уп',
    rating: 4.4,
    reviewCount: 189,
    stores: [
      { name: 'Пятёрочка', price: 79 },
      { name: 'Магнит', price: 85 },
      { name: 'Дикси', price: 89 },
    ],
  },
  {
    id: 'hh5',
    name: 'Туалетная бумага 12шт',
    category: 'paper',
    image: toiletPaper,
    price: 299,
    oldPrice: 349,
    unit: 'уп',
    rating: 4.7,
    reviewCount: 678,
    badge: 'sale',
    stores: [
      { name: 'Пятёрочка', price: 299 },
      { name: 'Магнит', price: 319 },
      { name: 'Лента', price: 289 },
    ],
  },
  {
    id: 'hh6',
    name: 'Мешки для мусора 60л',
    category: 'accessories',
    image: trashBags,
    price: 149,
    unit: 'уп',
    rating: 4.5,
    reviewCount: 234,
    stores: [
      { name: 'Пятёрочка', price: 149 },
      { name: 'Магнит', price: 159 },
      { name: 'Дикси', price: 155 },
    ],
  },
];

export const mockRecipes: Recipe[] = [
  {
    id: '1',
    name: 'Паста с томатами и базиликом',
    image: pasta,
    time: 25,
    calories: 420,
    servings: 2,
    ingredients: [
      { name: 'Спагетти', amount: '200 г' },
      { name: 'Томаты', amount: '3 шт' },
      { name: 'Базилик', amount: '1 пучок' },
      { name: 'Чеснок', amount: '2 зубчика' },
      { name: 'Оливковое масло', amount: '2 ст.л.' },
    ],
  },
  {
    id: '2',
    name: 'Салат с авокадо',
    image: salad,
    time: 15,
    calories: 280,
    servings: 2,
    ingredients: [
      { name: 'Авокадо', amount: '1 шт' },
      { name: 'Томаты черри', amount: '150 г' },
      { name: 'Микс салатов', amount: '100 г' },
      { name: 'Лимон', amount: '1/2 шт' },
      { name: 'Оливковое масло', amount: '1 ст.л.' },
    ],
  },
  {
    id: '3',
    name: 'Борщ классический',
    image: beef,
    time: 120,
    calories: 350,
    servings: 6,
    ingredients: [
      { name: 'Говядина', amount: '500 г' },
      { name: 'Свёкла', amount: '2 шт' },
      { name: 'Капуста', amount: '300 г' },
      { name: 'Картофель', amount: '3 шт' },
      { name: 'Морковь', amount: '1 шт' },
    ],
  },
  {
    id: '4',
    name: 'Куриные котлеты',
    image: chicken,
    time: 40,
    calories: 250,
    servings: 4,
    ingredients: [
      { name: 'Куриный фарш', amount: '500 г' },
      { name: 'Лук', amount: '1 шт' },
      { name: 'Яйцо', amount: '1 шт' },
      { name: 'Хлеб', amount: '50 г' },
      { name: 'Соль, перец', amount: 'по вкусу' },
    ],
  },
  {
    id: '5',
    name: 'Смузи с бананом',
    image: honey,
    time: 5,
    calories: 180,
    servings: 1,
    ingredients: [
      { name: 'Банан', amount: '1 шт' },
      { name: 'Молоко', amount: '200 мл' },
      { name: 'Мёд', amount: '1 ст.л.' },
      { name: 'Овсяные хлопья', amount: '2 ст.л.' },
    ],
  },
  {
    id: '6',
    name: 'Греческий салат',
    image: salad,
    time: 10,
    calories: 220,
    servings: 2,
    ingredients: [
      { name: 'Огурцы', amount: '2 шт' },
      { name: 'Томаты', amount: '2 шт' },
      { name: 'Фета', amount: '150 г' },
      { name: 'Маслины', amount: '50 г' },
      { name: 'Оливковое масло', amount: '2 ст.л.' },
    ],
  },
];

export const categories = [
  { id: 'all', emoji: '🛒', label: 'Все', color: 'bg-primary/10' },
  { id: 'vegetables', emoji: '🥦', label: 'Овощи', color: 'bg-green-500/10' },
  { id: 'fruits', emoji: '🍎', label: 'Фрукты', color: 'bg-red-500/10' },
  { id: 'dairy', emoji: '🥛', label: 'Молочное', color: 'bg-blue-500/10' },
  { id: 'meat', emoji: '🍖', label: 'Мясо', color: 'bg-orange-500/10' },
  { id: 'bakery', emoji: '🍞', label: 'Хлеб', color: 'bg-amber-500/10' },
  { id: 'fish', emoji: '🐟', label: 'Рыба', color: 'bg-cyan-500/10' },
  { id: 'drinks', emoji: '🥤', label: 'Напитки', color: 'bg-purple-500/10' },
];

export const cosmeticsCategories = [
  { id: 'all', emoji: '💄', label: 'Все', color: 'bg-pink-500/10' },
  { id: 'skincare', emoji: '🧴', label: 'Уход', color: 'bg-rose-500/10' },
  { id: 'makeup', emoji: '💋', label: 'Макияж', color: 'bg-red-500/10' },
  { id: 'haircare', emoji: '💇', label: 'Волосы', color: 'bg-amber-500/10' },
  { id: 'perfume', emoji: '🌸', label: 'Парфюм', color: 'bg-purple-500/10' },
];

export const householdCategories = [
  { id: 'all', emoji: '🧹', label: 'Все', color: 'bg-blue-500/10' },
  { id: 'laundry', emoji: '👕', label: 'Стирка', color: 'bg-cyan-500/10' },
  { id: 'cleaning', emoji: '🧽', label: 'Уборка', color: 'bg-green-500/10' },
  { id: 'dishes', emoji: '🍽️', label: 'Посуда', color: 'bg-amber-500/10' },
  { id: 'paper', emoji: '🧻', label: 'Бумага', color: 'bg-gray-500/10' },
  { id: 'accessories', emoji: '🧰', label: 'Мелочи', color: 'bg-orange-500/10' },
];
