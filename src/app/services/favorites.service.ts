import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Manga } from '../models/manga.model';

export interface FavoriteManga {
  manga: Manga;
  addedAt: Date;
  lastReadChapter?: string;
  readingProgress?: number;
}

@Injectable({
  providedIn: 'root'
})
export class FavoritesService {
  private readonly STORAGE_KEY = 'manga-reader-favorites';
  private _favoritesSubject = new BehaviorSubject<FavoriteManga[]>([]);
  
  favorites$ = this._favoritesSubject.asObservable();

  constructor() {
    this._loadFavorites();
  }

  private _loadFavorites(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const favorites = JSON.parse(stored).map((fav: any) => ({
          ...fav,
          addedAt: new Date(fav.addedAt)
        }));
        this._favoritesSubject.next(favorites);
      }
    } catch (error) {
      console.error('Erro ao carregar favoritos:', error);
    }
  }

  private _saveFavorites(favorites: FavoriteManga[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(favorites));
      this._favoritesSubject.next(favorites);
    } catch (error) {
      console.error('Erro ao salvar favoritos:', error);
    }
  }

  addToFavorites(manga: Manga, coverUrl: string | null): void {
    const currentFavorites = this._favoritesSubject.value;
    const exists = currentFavorites.find(fav => fav.manga.id === manga.id);
    console.log(manga);
    if (!exists) {
      manga.coverUrl = coverUrl || null
      console.log(manga);
      const newFavorite: FavoriteManga = {
        manga,
        addedAt: new Date()
      };
      this._saveFavorites([...currentFavorites, newFavorite]);
    }
  }

  removeFromFavorites(mangaId: string): void {
    const currentFavorites = this._favoritesSubject.value;
    const filtered = currentFavorites.filter(fav => fav.manga.id !== mangaId);
    this._saveFavorites(filtered);
  }

  isFavorite(mangaId: string): boolean {
    return this._favoritesSubject.value.some(fav => fav.manga.id === mangaId);
  }

  updateReadingProgress(mangaId: string, chapterId: string, progress: number = 0): void {
    const currentFavorites = this._favoritesSubject.value;
    const favoriteIndex = currentFavorites.findIndex(fav => fav.manga.id === mangaId);
    
    if (favoriteIndex !== -1) {
      currentFavorites[favoriteIndex] = {
        ...currentFavorites[favoriteIndex],
        lastReadChapter: chapterId,
        readingProgress: progress
      };
      this._saveFavorites(currentFavorites);
    }
  }

  getFavorites(): Observable<FavoriteManga[]> {
    return this.favorites$;
  }

  getFavoriteCount(): number {
    return this._favoritesSubject.value.length;
  }
}