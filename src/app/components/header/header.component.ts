import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { ThemeService } from "../../services/theme.service";
import { FavoritesService } from "../../services/favorites.service";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

@Component({
  selector: "app-header",
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header
      class="bg-white dark:bg-manga-dark-secondary shadow-sm border-b border-gray-200 dark:border-manga-dark-accent sticky top-0 z-50"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center">
            <a routerLink="/" class="flex items-center space-x-2 group">
              <div
                class="text-2xl group-hover:scale-110 transition-transform duration-200"
              >
                📚
              </div>
              <span class="text-xl font-bold text-gray-900 dark:text-white"
                >Manga Reader</span
              >
            </a>
          </div>

          <nav class="hidden md:flex items-center space-x-8">
            <a
              routerLink="/"
              routerLinkActive="text-primary-600 dark:text-primary-400"
              [routerLinkActiveOptions]="{ exact: true }"
              class="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors duration-200"
            >
              Início
            </a>
            <a
              routerLink="/favorites"
              routerLinkActive="text-primary-600 dark:text-primary-400"
              class="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors duration-200 flex items-center space-x-1"
            >
              <span>Favoritos</span>
              <span
                *ngIf="favoriteCount$ | async as count"
                class="bg-primary-600 text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center"
              >
                {{ count }}
              </span>
            </a>
          </nav>

          <div class="flex items-center space-x-4">
            <button
              (click)="toggleTheme()"
              class="p-2 rounded-lg bg-gray-100 dark:bg-manga-dark-accent hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
              [title]="(isDark$ | async) ? 'Modo claro' : 'Modo escuro'"
            >
              <svg
                *ngIf="!(isDark$ | async)"
                class="w-5 h-5 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                ></path>
              </svg>
              <svg
                *ngIf="isDark$ | async"
                class="w-5 h-5 text-yellow-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                ></path>
              </svg>
            </button>

            <button
              (click)="toggleMobileMenu()"
              class="md:hidden p-2 rounded-lg bg-gray-100 dark:bg-manga-dark-accent hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
            >
              <svg
                class="w-5 h-5 text-gray-600 dark:text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 6h16M4 12h16M4 18h16"
                ></path>
              </svg>
            </button>
          </div>
        </div>

        <div
          *ngIf="showMobileMenu"
          class="md:hidden py-4 border-t border-gray-200 dark:border-manga-dark-accent animate-slide-up"
        >
          <nav class="flex flex-col space-y-4">
            <a
              routerLink="/"
              (click)="closeMobileMenu()"
              routerLinkActive="text-primary-600 dark:text-primary-400"
              [routerLinkActiveOptions]="{ exact: true }"
              class="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors duration-200"
            >
              Início
            </a>
            <a
              routerLink="/favorites"
              (click)="closeMobileMenu()"
              routerLinkActive="text-primary-600 dark:text-primary-400"
              class="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors duration-200 flex items-center space-x-2"
            >
              <span>Favoritos</span>
              <span
                *ngIf="favoriteCount$ | async as count"
                class="bg-primary-600 text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center"
              >
                {{ count }}
              </span>
            </a>
          </nav>
        </div>
      </div>
    </header>
  `,
})
export class HeaderComponent implements OnInit {
  isDark$ = this._themeService.isDark$;
  favoriteCount$: Observable<number>;
  showMobileMenu = false;

  constructor(
    private _themeService: ThemeService,
    private _favoritesService: FavoritesService
  ) {
    this.favoriteCount$ = this._favoritesService.favorites$.pipe(
      map((favorites) => favorites.length)
    );
  }

  ngOnInit(): void {}

  toggleTheme(): void {
    this._themeService.toggleTheme();
  }

  toggleMobileMenu(): void {
    this.showMobileMenu = !this.showMobileMenu;
  }

  closeMobileMenu(): void {
    this.showMobileMenu = false;
  }
}
