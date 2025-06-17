import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'manga-reader-theme';
  private _isDarkSubject = new BehaviorSubject<boolean>(false);
  
  isDark$ = this._isDarkSubject.asObservable();

  constructor() {
    this._initializeTheme();
  }

  private _initializeTheme(): void {
    const savedTheme = localStorage.getItem(this.THEME_KEY);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    const isDark = savedTheme ? savedTheme === 'dark' : prefersDark;
    this.setTheme(isDark);
  }

  toggleTheme(): void {
    const currentTheme = this._isDarkSubject.value;
    this.setTheme(!currentTheme);
  }

  setTheme(isDark: boolean): void {
    this._isDarkSubject.next(isDark);
    localStorage.setItem(this.THEME_KEY, isDark ? 'dark' : 'light');
    
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  getCurrentTheme(): boolean {
    return this._isDarkSubject.value;
  }
}