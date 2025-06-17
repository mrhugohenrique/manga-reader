import { Component, OnInit, OnDestroy } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from "rxjs";
import { MangaService } from "../../services/manga.service";
import { Manga, MangaResponse } from "../../models/manga.model";
import { MangaCardComponent } from "../../components/manga-card/manga-card.component";

@Component({
  selector: "app-home",
  standalone: true,
  imports: [CommonModule, FormsModule, MangaCardComponent],
  template: `
    <div class="min-h-screen bg-gray-50 dark:bg-manga-dark">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="text-center mb-8">
          <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Descubra Novos Mangás
          </h1>
          <p class="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Explore uma vasta coleção de mangás e encontre suas próximas
            leituras favoritas
          </p>
        </div>

        <div
          class="bg-white dark:bg-manga-dark-secondary rounded-lg shadow-sm p-6 mb-8"
        >
          <div class="flex flex-col lg:flex-row gap-4">
            <div class="flex-1">
              <div class="relative">
                <input
                  type="text"
                  [(ngModel)]="searchQuery"
                  (input)="onSearchChange()"
                  placeholder="Buscar mangás..."
                  class="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-manga-dark-accent rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-manga-dark text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
                <svg
                  class="absolute left-3 top-3.5 h-5 w-5 text-gray-400"
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
              </div>
            </div>

            <div class="lg:w-48">
              <select
                [(ngModel)]="selectedStatus"
                (change)="onFilterChange()"
                class="w-full py-3 px-4 border border-gray-300 dark:border-manga-dark-accent rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-manga-dark text-gray-900 dark:text-white"
              >
                <option value="">Todos os Status</option>
                <option value="ongoing">Em Andamento</option>
                <option value="completed">Completo</option>
                <option value="hiatus">Hiato</option>
                <option value="cancelled">Cancelado</option>
              </select>
            </div>

            <div class="lg:w-48">
              <select
                [(ngModel)]="selectedSort"
                (change)="onFilterChange()"
                class="w-full py-3 px-4 border border-gray-300 dark:border-manga-dark-accent rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-manga-dark text-gray-900 dark:text-white"
              >
                <option value="followedCount.desc">Mais Populares</option>
                <option value="latestUploadedChapter.desc">
                  Atualizados Recentemente
                </option>
                <option value="createdAt.desc">Mais Novos</option>
                <option value="title.asc">A-Z</option>
                <option value="title.desc">Z-A</option>
              </select>
            </div>
          </div>
        </div>

        <div
          *ngIf="loading"
          class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-8"
        >
          <div
            *ngFor="let item of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]"
            class="animate-pulse"
          >
            <div
              class="bg-gray-300 dark:bg-manga-dark-accent aspect-[3/4] rounded-lg mb-4"
            ></div>
            <div class="space-y-2">
              <div
                class="h-4 bg-gray-300 dark:bg-manga-dark-accent rounded w-3/4"
              ></div>
              <div
                class="h-3 bg-gray-300 dark:bg-manga-dark-accent rounded w-1/2"
              ></div>
            </div>
          </div>
        </div>

        <div
          *ngIf="!loading && totalResults > 0"
          class="flex justify-between items-center mb-6"
        >
          <p class="text-gray-600 dark:text-gray-400">
            Mostrando {{ mangas.length }} de {{ totalResults }} mangás
          </p>
          <div class="text-sm text-gray-500 dark:text-gray-400">
            Página {{ currentPage }} de {{ totalPages }}
          </div>
        </div>

        <div
          *ngIf="!loading && mangas.length > 0"
          class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-8"
        >
          <app-manga-card
            *ngFor="let manga of mangas; trackBy: trackByMangaId"
            [manga]="manga"
            class="animate-fade-in"
          >
          </app-manga-card>
        </div>

        <div
          *ngIf="!loading && !error && mangas.length === 0"
          class="text-center py-12"
        >
          <div class="text-6xl mb-4">📚</div>
          <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Nenhum mangá encontrado
          </h3>
          <p class="text-gray-600 dark:text-gray-400 mb-6">
            Tente ajustar seus filtros ou termos de busca
          </p>
          <button (click)="clearFilters()" class="btn-primary">
            Limpar Filtros
          </button>
        </div>

        <div
          *ngIf="!loading && mangas.length > 0 && hasMore"
          class="text-center"
        >
          <button
            (click)="loadMore()"
            [disabled]="loadingMore"
            class="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span
              *ngIf="!loadingMore"
              class="text-xl font-semibold text-gray-900 dark:text-white mb-2"
              >Carregar Mais</span
            >
            <span *ngIf="loadingMore" class="flex items-center space-x-2">
              <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span>Carregando...</span>
            </span>
          </button>
        </div>

        <div *ngIf="!loading && error" class="text-center py-12">
          <div class="text-6xl mb-4">⚠️</div>
          <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Erro ao carregar mangás
          </h3>
          <p class="text-gray-600 dark:text-gray-400 mb-6">
            {{ error }}
          </p>
          <button (click)="retry()" class="btn-primary">
            Tentar Novamente
          </button>
        </div>
      </div>
    </div>
  `,
})
export class HomeComponent implements OnInit, OnDestroy {
  private _destroy$ = new Subject<void>();
  private _searchSubject = new Subject<string>();

  mangas: Manga[] = [];
  loading = true;
  loadingMore = false;
  error = "";

  searchQuery = "";
  selectedStatus = "";
  selectedSort = "followedCount.desc";

  currentPage = 1;
  totalResults = 0;
  totalPages = 0;
  hasMore = false;

  private readonly _ITEMS_PER_PAGE = 20;

  constructor(private _mangaService: MangaService) {}

  ngOnInit(): void {
    this._setupSearch();
    this._loadMangas();
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  private _setupSearch(): void {
    this._searchSubject
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        takeUntil(this._destroy$)
      )
      .subscribe(() => {
        this._resetAndLoad();
      });
  }

  onSearchChange(): void {
    this._searchSubject.next(this.searchQuery);
  }

  onFilterChange(): void {
    this._resetAndLoad();
  }

  private _resetAndLoad(): void {
    this.currentPage = 1;
    this.mangas = [];
    this._loadMangas();
  }

  private _loadMangas(): void {
    this.loading = this.currentPage === 1;
    this.loadingMore = this.currentPage > 1;
    this.error = "";

    const params = this._buildSearchParams();

    this._mangaService
      .getMangas(params)
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: (response: MangaResponse) => {
          if (response.result === "ok") {
            if (this.currentPage === 1) {
              this.mangas = response.data;
            } else {
              this.mangas = [...this.mangas, ...response.data];
            }

            this.totalResults = response.total;
            this.totalPages = Math.ceil(response.total / this._ITEMS_PER_PAGE);
            this.hasMore = this.currentPage < this.totalPages;
          } else {
            this.error = "Erro ao carregar mangás. Tente novamente.";
          }
        },
        error: (error) => {
          console.error("Erro ao carregar mangás:", error);
          this.error =
            "Erro de conexão. Verifique sua internet e tente novamente.";
        },
        complete: () => {
          this.loading = false;
          this.loadingMore = false;
        },
      });
  }

  private _buildSearchParams() {
    const [sortField, sortOrder] = this.selectedSort.split(".");

    const params: any = {
      limit: this._ITEMS_PER_PAGE,
      offset: (this.currentPage - 1) * this._ITEMS_PER_PAGE,
      order: { [sortField]: sortOrder as "asc" | "desc" },
    };

    if (this.searchQuery.trim()) {
      params.title = this.searchQuery.trim();
    }

    if (this.selectedStatus) {
      params.status = [this.selectedStatus];
    }

    return params;
  }

  loadMore(): void {
    if (this.hasMore && !this.loadingMore) {
      this.currentPage++;
      this._loadMangas();
    }
  }

  clearFilters(): void {
    this.searchQuery = "";
    this.selectedStatus = "";
    this.selectedSort = "followedCount.desc";
    this._resetAndLoad();
  }

  retry(): void {
    this._resetAndLoad();
  }

  trackByMangaId(index: number, manga: Manga): string {
    return manga.id;
  }
}
