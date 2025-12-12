import tomatoesImg from '@/assets/products/tomatoes.jpg';
import broccoliImg from '@/assets/products/broccoli.jpg';
import milkImg from '@/assets/products/milk.jpg';
import chickenImg from '@/assets/products/chicken.jpg';
import breadImg from '@/assets/products/bread.jpg';
import pastaImg from '@/assets/recipes/pasta.jpg';
import saladImg from '@/assets/recipes/salad.jpg';
import { Product, Recipe } from '@/stores/useAppStore';

export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Томаты на ветке',
    category: 'vegetables',
    image: tomatoesImg,
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
    image: broccoliImg,
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
    image: milkImg,
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
    image: chickenImg,
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
    image: breadImg,
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
];

export const mockRecipes: Recipe[] = [
  {
    id: '1',
    name: 'Паста с томатами и базиликом',
    image: pastaImg,
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
    image: saladImg,
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
];

export const categories = [
  { id: 'all', emoji: '🛒', label: 'Все', color: 'bg-primary-light' },
  { id: 'vegetables', emoji: '🥦', label: 'Овощи', color: 'bg-green-100' },
  { id: 'fruits', emoji: '🍎', label: 'Фрукты', color: 'bg-red-100' },
  { id: 'dairy', emoji: '🥛', label: 'Молочное', color: 'bg-blue-100' },
  { id: 'meat', emoji: '🍖', label: 'Мясо', color: 'bg-orange-100' },
  { id: 'bakery', emoji: '🍞', label: 'Хлеб', color: 'bg-amber-100' },
  { id: 'fish', emoji: '🐟', label: 'Рыба', color: 'bg-cyan-100' },
  { id: 'drinks', emoji: '🥤', label: 'Напитки', color: 'bg-purple-100' },
];
