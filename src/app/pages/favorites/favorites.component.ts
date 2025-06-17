import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Observable } from "rxjs";
import {
  FavoritesService,
  FavoriteManga,
} from "../../services/favorites.service";
import { MangaCardComponent } from "../../components/manga-card/manga-card.component";

@Component({
  selector: "app-favorites",
  standalone: true,
  imports: [CommonModule, MangaCardComponent],
  template: `
    <div class="min-h-screen bg-gray-50 dark:bg-manga-dark">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="text-center mb-8">
          <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Seus Mangás Favoritos
          </h1>
          <p class="text-lg text-gray-600 dark:text-gray-400">
            Acompanhe seus mangás favoritos e continue de onde parou
          </p>
        </div>

        <div *ngIf="favorites$ | async as favorites">
          <div
            *ngIf="favorites.length > 0; else emptyState"
            class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
          >
            <div
              *ngFor="let favorite of favorites; trackBy: trackByFavoriteId"
              class="relative animate-fade-in"
            >
              <app-manga-card [manga]="favorite.manga"></app-manga-card>

              <div
                *ngIf="favorite.readingProgress !== undefined"
                class="absolute bottom-2 left-2 right-2"
              >
                <div class="bg-black/70 rounded-full px-2 py-1">
                  <div
                    class="flex items-center justify-between text-white text-xs"
                  >
                    <span>Progresso</span>
                    <span>{{ favorite.readingProgress }}%</span>
                  </div>
                  <div class="w-full bg-gray-600 rounded-full h-1 mt-1">
                    <div
                      class="bg-primary-500 h-1 rounded-full transition-all duration-300"
                      [style.width.%]="favorite.readingProgress"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <ng-template #emptyState>
            <div class="text-center py-16">
              <div class="text-8xl mb-6">💔</div>
              <h3
                class="text-2xl font-semibold text-gray-900 dark:text-white mb-4"
              >
                Nenhum favorito ainda
              </h3>
              <p class="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                Explore nossa coleção e adicione seus mangás favoritos para
                acompanhar facilmente
              </p>
              <a
                routerLink="/"
                class="btn-primary inline-flex items-center space-x-2"
              >
                <svg
                  class="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  ></path>
                </svg>
                <span>Explorar Mangás</span>
              </a>
            </div>
          </ng-template>
        </div>
      </div>
    </div>
  `,
})
export class FavoritesComponent {
  favorites$: Observable<FavoriteManga[]>;

  constructor(private _favoritesService: FavoritesService) {
    this.favorites$ = this._favoritesService.getFavorites();
  }

  trackByFavoriteId(index: number, favorite: FavoriteManga): string {
    return favorite.manga.id;
  }
}
