const STORAGE_KEY = 'futstats_favorites_v1';

function safeParse(json) {
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function getFavorites() {
  if (typeof window === 'undefined') return [];
  const raw = window.localStorage.getItem(STORAGE_KEY);
  const parsed = safeParse(raw);
  return Array.isArray(parsed) ? parsed : [];
}

export function isFavorite(matchId) {
  const id = String(matchId);
  return getFavorites().some((f) => String(f?.id) === id);
}

export function addFavorite(fav) {
  if (typeof window === 'undefined') return;
  if (!fav || fav.id === undefined || fav.id === null) return;
  const next = [
    fav,
    ...getFavorites().filter((f) => String(f?.id) !== String(fav.id)),
  ].slice(0, 200);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export function removeFavorite(matchId) {
  if (typeof window === 'undefined') return;
  const id = String(matchId);
  const next = getFavorites().filter((f) => String(f?.id) !== id);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export function toggleFavorite(fav) {
  const id = String(fav?.id);
  if (!id) return { isFavorite: false };
  if (isFavorite(id)) {
    removeFavorite(id);
    return { isFavorite: false };
  }
  addFavorite(fav);
  return { isFavorite: true };
}

