// Catering images
import familyDinner from '@/assets/catering/family-dinner.jpg';
import officeLunch from '@/assets/catering/office-lunch.jpg';
import kidsParty from '@/assets/catering/kids-party.jpg';
import romanticDinner from '@/assets/catering/romantic-dinner.jpg';
import corporateEvent from '@/assets/catering/corporate-event.jpg';
import picnic from '@/assets/catering/picnic.jpg';
import wedding from '@/assets/catering/wedding.jpg';
import coffeeBreak from '@/assets/catering/coffee-break.jpg';
import halloween from '@/assets/catering/halloween.jpg';
import birthday from '@/assets/catering/birthday.jpg';
import buffet from '@/assets/catering/buffet.jpg';

export interface CateringOffer {
  id: string;
  title: string;
  description: string;
  image: string;
  category: 'home' | 'office' | 'themed';
  priceFrom: number;
  guestsMin: number;
  guestsMax: number;
  rating: number;
  reviewCount: number;
  includes: string[];
  menuItems: string[];
  reviews: {
    author: string;
    rating: number;
    text: string;
    date: string;
  }[];
}

// Home catering offers
export const homeCateringOffers: CateringOffer[] = [
  {
    id: 'home-1',
    title: 'Семейный ужин',
    description: 'Уютный ужин на дому для всей семьи с изысканными блюдами от шеф-повара',
    image: familyDinner,
    category: 'home',
    priceFrom: 2500,
    guestsMin: 4,
    guestsMax: 8,
    rating: 4.9,
    reviewCount: 156,
    includes: ['Сервировка стола', 'Посуда', 'Официант на 3 часа', 'Уборка после'],
    menuItems: ['Закуски', 'Салаты', 'Горячее', 'Гарнир', 'Десерт'],
    reviews: [
      { author: 'Елена М.', rating: 5, text: 'Прекрасный ужин! Вся семья была в восторге. Блюда свежие и вкусные.', date: '15.12.2024' },
      { author: 'Андрей К.', rating: 5, text: 'Заказывали на юбилей мамы. Всё прошло идеально!', date: '10.12.2024' },
      { author: 'Ольга П.', rating: 4, text: 'Хороший сервис, немного опоздали с доставкой.', date: '05.12.2024' },
    ],
  },
  {
    id: 'home-2',
    title: 'Романтический ужин',
    description: 'Изысканный ужин на двоих с свечами, розами и шампанским',
    image: romanticDinner,
    category: 'home',
    priceFrom: 3000,
    guestsMin: 2,
    guestsMax: 2,
    rating: 4.8,
    reviewCount: 89,
    includes: ['Декор (свечи, розы)', 'Шампанское', 'Сервировка', 'Музыкальное сопровождение'],
    menuItems: ['Устрицы', 'Салат с морепродуктами', 'Стейк/Рыба', 'Десерт для двоих'],
    reviews: [
      { author: 'Михаил С.', rating: 5, text: 'Сделал предложение девушке - она сказала да! Спасибо за атмосферу!', date: '14.12.2024' },
      { author: 'Анна В.', rating: 5, text: 'Невероятно романтично! Шеф-повар постарался на славу.', date: '08.12.2024' },
      { author: 'Дмитрий Л.', rating: 4, text: 'Всё было хорошо, только порции могли бы быть побольше.', date: '01.12.2024' },
    ],
  },
  {
    id: 'home-3',
    title: 'Воскресный бранч',
    description: 'Расслабленный поздний завтрак для семьи и друзей',
    image: buffet,
    category: 'home',
    priceFrom: 1800,
    guestsMin: 4,
    guestsMax: 12,
    rating: 4.7,
    reviewCount: 67,
    includes: ['Сервировка', 'Посуда', 'Кофе/чай без ограничений'],
    menuItems: ['Круассаны', 'Яйца Бенедикт', 'Смузи-боул', 'Фрукты', 'Сырная тарелка'],
    reviews: [
      { author: 'Ирина К.', rating: 5, text: 'Идеально для семейного воскресенья! Дети были в восторге.', date: '17.12.2024' },
      { author: 'Павел Н.', rating: 4, text: 'Вкусно и красиво. Рекомендую!', date: '12.12.2024' },
      { author: 'Светлана Д.', rating: 5, text: 'Уже третий раз заказываем - всегда на высоте!', date: '07.12.2024' },
    ],
  },
];

// Office catering offers
export const officeCateringOffers: CateringOffer[] = [
  {
    id: 'office-1',
    title: 'Бизнес-ланч',
    description: 'Деловые обеды с доставкой в офис для продуктивных встреч',
    image: officeLunch,
    category: 'office',
    priceFrom: 450,
    guestsMin: 10,
    guestsMax: 50,
    rating: 4.8,
    reviewCount: 234,
    includes: ['Индивидуальная упаковка', 'Столовые приборы', 'Салфетки', 'Доставка'],
    menuItems: ['Салат на выбор', 'Суп', 'Горячее с гарниром', 'Напиток', 'Десерт'],
    reviews: [
      { author: 'ООО "ТехСофт"', rating: 5, text: 'Регулярно заказываем для сотрудников. Качество стабильно высокое.', date: '18.12.2024' },
      { author: 'Алексей П.', rating: 5, text: 'Отличный вариант для деловых обедов. Рекомендую!', date: '15.12.2024' },
      { author: 'Марина И.', rating: 4, text: 'Вкусно, сытно, вовремя. Всё как надо.', date: '10.12.2024' },
    ],
  },
  {
    id: 'office-2',
    title: 'Корпоратив',
    description: 'Фуршет и банкет для корпоративных мероприятий любого масштаба',
    image: corporateEvent,
    category: 'office',
    priceFrom: 800,
    guestsMin: 20,
    guestsMax: 100,
    rating: 4.9,
    reviewCount: 178,
    includes: ['Официанты', 'Посуда', 'Декор', 'Музыка', 'Организация'],
    menuItems: ['Фуршетные закуски', 'Канапе', 'Мини-бургеры', 'Горячее', 'Торт'],
    reviews: [
      { author: 'HR "Газпром"', rating: 5, text: 'Проводили новогодний корпоратив - всё прошло идеально!', date: '16.12.2024' },
      { author: 'Директор "АльфаБанк"', rating: 5, text: 'Профессиональный подход, вкусная еда, довольные сотрудники.', date: '12.12.2024' },
      { author: 'Ольга С.', rating: 5, text: 'Лучший кейтеринг для корпоративов в городе!', date: '08.12.2024' },
    ],
  },
  {
    id: 'office-3',
    title: 'Кофе-брейк',
    description: 'Перерыв на кофе с угощениями для конференций и совещаний',
    image: coffeeBreak,
    category: 'office',
    priceFrom: 250,
    guestsMin: 10,
    guestsMax: 100,
    rating: 4.7,
    reviewCount: 312,
    includes: ['Кофе/чай', 'Посуда', 'Салфетки', 'Сервировка'],
    menuItems: ['Круассаны', 'Мини-пирожные', 'Печенье', 'Фрукты', 'Орехи'],
    reviews: [
      { author: 'Конференц-зал "Москва"', rating: 5, text: 'Постоянный партнёр для наших мероприятий.', date: '19.12.2024' },
      { author: 'Игорь В.', rating: 4, text: 'Быстро, вкусно, без лишней суеты.', date: '14.12.2024' },
      { author: 'Наталья К.', rating: 5, text: 'Гости конференции остались довольны!', date: '09.12.2024' },
    ],
  },
];

// Themed catering offers
export const themedCateringOffers: CateringOffer[] = [
  {
    id: 'themed-1',
    title: 'День рождения',
    description: 'Праздничное меню для особого дня с тортом и развлечениями',
    image: birthday,
    category: 'themed',
    priceFrom: 3500,
    guestsMin: 8,
    guestsMax: 30,
    rating: 4.9,
    reviewCount: 423,
    includes: ['Декор', 'Торт', 'Официанты', 'Аниматор (опционально)'],
    menuItems: ['Закуски', 'Канапе', 'Горячее', 'Гарниры', 'Торт на заказ'],
    reviews: [
      { author: 'Мария П.', rating: 5, text: 'Отмечали 30-летие - праздник удался на славу!', date: '18.12.2024' },
      { author: 'Сергей К.', rating: 5, text: 'Дети были в восторге от аниматора и торта!', date: '13.12.2024' },
      { author: 'Анна Л.', rating: 5, text: 'Всё было идеально, от закусок до торта!', date: '08.12.2024' },
    ],
  },
  {
    id: 'themed-2',
    title: 'Детский праздник',
    description: 'Весёлое меню для малышей с играми и развлечениями',
    image: kidsParty,
    category: 'themed',
    priceFrom: 1500,
    guestsMin: 6,
    guestsMax: 20,
    rating: 4.8,
    reviewCount: 267,
    includes: ['Детский декор', 'Аниматор', 'Шоу мыльных пузырей', 'Призы'],
    menuItems: ['Мини-бургеры', 'Картофель фри', 'Фрукты', 'Сладкий стол', 'Торт'],
    reviews: [
      { author: 'Елена С.', rating: 5, text: 'Дети в восторге! Праздник прошёл замечательно.', date: '17.12.2024' },
      { author: 'Ольга М.', rating: 5, text: 'Лучший детский день рождения! Спасибо большое!', date: '12.12.2024' },
      { author: 'Дмитрий В.', rating: 4, text: 'Хорошо организовано, дети довольны.', date: '07.12.2024' },
    ],
  },
  {
    id: 'themed-3',
    title: 'Свадебный банкет',
    description: 'Праздничное меню для самого важного дня в вашей жизни',
    image: wedding,
    category: 'themed',
    priceFrom: 5000,
    guestsMin: 30,
    guestsMax: 200,
    rating: 4.9,
    reviewCount: 156,
    includes: ['Полная организация', 'Декор зала', 'Официанты', 'Свадебный торт'],
    menuItems: ['Банкетное меню', 'Фуршет', 'Свадебный торт', 'Напитки'],
    reviews: [
      { author: 'Молодожёны Ивановы', rating: 5, text: 'Наша свадьба была идеальной благодаря вам!', date: '20.12.2024' },
      { author: 'Анна и Сергей', rating: 5, text: 'Всё было на высшем уровне! Рекомендуем!', date: '15.12.2024' },
      { author: 'Гости свадьбы', rating: 5, text: 'Вкуснейшая еда и прекрасная организация!', date: '10.12.2024' },
    ],
  },
  {
    id: 'themed-4',
    title: 'Пикник на природе',
    description: 'Готовые сеты для пикника с доставкой в любую точку',
    image: picnic,
    category: 'themed',
    priceFrom: 1800,
    guestsMin: 4,
    guestsMax: 12,
    rating: 4.7,
    reviewCount: 134,
    includes: ['Плед', 'Посуда', 'Термосумка', 'Корзина для пикника'],
    menuItems: ['Сэндвичи', 'Салаты', 'Фрукты', 'Сыр и виноград', 'Лимонад'],
    reviews: [
      { author: 'Ирина Л.', rating: 5, text: 'Идеальный пикник без хлопот! Всё очень вкусно.', date: '16.12.2024' },
      { author: 'Павел Н.', rating: 4, text: 'Хороший набор, удобная доставка.', date: '11.12.2024' },
      { author: 'Светлана К.', rating: 5, text: 'Романтичный пикник получился на ура!', date: '06.12.2024' },
    ],
  },
  {
    id: 'themed-5',
    title: 'Хэллоуин-пати',
    description: 'Тематическое меню для жуткого праздника',
    image: halloween,
    category: 'themed',
    priceFrom: 2500,
    guestsMin: 10,
    guestsMax: 50,
    rating: 4.6,
    reviewCount: 78,
    includes: ['Тематический декор', 'Костюмированные официанты', 'Фотозона'],
    menuItems: ['Пальцы ведьмы', 'Глаза зомби', 'Тыквенный суп', 'Чёрный торт'],
    reviews: [
      { author: 'Клуб "Мистерия"', rating: 5, text: 'Самая крутая хэллоуин-вечеринка в городе!', date: '01.11.2024' },
      { author: 'Алексей М.', rating: 4, text: 'Атмосферно и вкусно. Рекомендую!', date: '31.10.2024' },
      { author: 'Ольга Д.', rating: 5, text: 'Дети в восторге от тематических блюд!', date: '31.10.2024' },
    ],
  },
];

// All catering offers combined
export const allCateringOffers: CateringOffer[] = [
  ...homeCateringOffers,
  ...officeCateringOffers,
  ...themedCateringOffers,
];
