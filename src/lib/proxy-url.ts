/**
 * Автоматически преобразует внешние ссылки в проксированные.
 * Локальные пути и ссылки вашего домена остаются без изменений.
 */
export const getSafeUrl = (url: string | undefined | null): string => {
  if (!url) return '';

  // 1. Пропускаем локальные файлы, base64 и ссылки, которые уже ведут на ваш домен
  const isLocal = url.startsWith('/') || url.startsWith('data:');
  const isOwnDomain = url.includes('vigodnotut.ru') || url.includes('supabase.co');

  if (isLocal || isOwnDomain) {
    return url;
  }

  // 2. Оборачиваем внешние ресурсы (Unsplash, Pexels и т.д.) в ваш Cloudflare Worker
  const PROXY_BASE = 'https://media.vigodnotut.ru/?url=';
  
  // encodeURIComponent обязателен, чтобы спецсимволы в URL не сломали запрос
  return `${PROXY_BASE}${encodeURIComponent(url)}`;
};
