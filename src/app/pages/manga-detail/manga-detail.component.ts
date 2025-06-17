import { Component, OnInit, OnDestroy } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { Subject, takeUntil, switchMap } from "rxjs";
import { MangaService } from "../../services/manga.service";
import { FavoritesService } from "../../services/favorites.service";
import { Manga, Chapter } from "../../models/manga.model";
import { FormsModule } from "@angular/forms";

@Component({
  selector: "app-manga-detail",
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gray-50 dark:bg-manga-dark">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Loading State -->
        <div *ngIf="loading" class="animate-pulse">
          <div class="flex flex-col lg:flex-row gap-8">
            <div class="lg:w-1/3">
              <div
                class="aspect-[3/4] bg-gray-300 dark:bg-manga-dark-accent rounded-lg"
              ></div>
            </div>
            <div class="lg:w-2/3 space-y-4">
              <div
                class="h-8 bg-gray-300 dark:bg-manga-dark-accent rounded w-3/4"
              ></div>
              <div
                class="h-4 bg-gray-300 dark:bg-manga-dark-accent rounded w-1/2"
              ></div>
              <div class="space-y-2">
                <div
                  class="h-4 bg-gray-300 dark:bg-manga-dark-accent rounded"
                ></div>
                <div
                  class="h-4 bg-gray-300 dark:bg-manga-dark-accent rounded"
                ></div>
                <div
                  class="h-4 bg-gray-300 dark:bg-manga-dark-accent rounded w-3/4"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Error State -->
        <div *ngIf="error" class="text-center py-12">
          <div class="text-6xl mb-4">⚠️</div>
          <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Erro ao carregar mangá
          </h3>
          <p class="text-gray-600 dark:text-gray-400 mb-6">{{ error }}</p>
          <button (click)="retry()" class="btn-primary">
            Tentar Novamente
          </button>
        </div>

        <!-- Manga Details -->
        <div *ngIf="manga && !loading" class="animate-fade-in">
          <div class="flex flex-col lg:flex-row gap-8 mb-8">
            <!-- Cover Image -->
            <div class="lg:w-1/3">
              <div class="sticky top-24">
                <img
                  [src]="coverUrl"
                  [alt]="getTitle()"
                  class="w-full aspect-[3/4] object-cover rounded-lg shadow-lg"
                />

                <!-- Actions -->
                <div class="mt-6 space-y-3">
                  <button
                    (click)="toggleFavorite()"
                    class="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-colors duration-200"
                    [class]="
                      isFavorite
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : 'bg-gray-200 hover:bg-gray-300 dark:bg-manga-dark-accent dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200'
                    "
                  >
                    <svg
                      class="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                        clip-rule="evenodd"
                      ></path>
                    </svg>
                    <span>{{
                      isFavorite
                        ? "Remover dos Favoritos"
                        : "Adicionar aos Favoritos"
                    }}</span>
                  </button>

                  <button
                    *ngIf="chapters.length > 0"
                    (click)="startReading()"
                    class="w-full btn-primary flex items-center justify-center space-x-2"
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
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                      ></path>
                    </svg>
                    <span>Começar a Ler</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- Info -->
            <div class="lg:w-2/3">
              <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                {{ getTitle() }}
              </h1>

              <!-- Status and Info -->
              <div class="flex flex-wrap gap-4 mb-6">
                <span [class]="getStatusClass()">{{ getStatusText() }}</span>
                <span
                  *ngIf="manga.attributes.year"
                  class="px-3 py-1 bg-gray-100 dark:bg-manga-dark-accent text-gray-700 dark:text-gray-300 text-sm rounded-full"
                >
                  {{ manga.attributes.year }}
                </span>
                <span
                  *ngIf="manga.attributes.contentRating"
                  class="px-3 py-1 bg-gray-100 dark:bg-manga-dark-accent text-gray-700 dark:text-gray-300 text-sm rounded-full"
                >
                  {{ getContentRating() }}
                </span>
              </div>

              <!-- Description -->
              <div class="mb-6">
                <h3
                  class="text-lg font-semibold text-gray-900 dark:text-white mb-3"
                >
                  Sinopse
                </h3>
                <p class="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {{ getDescription() }}
                </p>
              </div>

              <!-- Tags -->
              <div class="mb-6">
                <h3
                  class="text-lg font-semibold text-gray-900 dark:text-white mb-3"
                >
                  Gêneros
                </h3>
                <div class="flex flex-wrap gap-2">
                  <span
                    *ngFor="
                      let tag of manga.attributes.tags;
                      trackBy: trackByTagId
                    "
                    class="px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300 text-sm rounded-full"
                  >
                    {{ getTagName(tag) }}
                  </span>
                </div>
              </div>

              <!-- Authors -->
              <div *ngIf="getAuthors().length > 0" class="mb-6">
                <h3
                  class="text-lg font-semibold text-gray-900 dark:text-white mb-3"
                >
                  Autores
                </h3>
                <div class="flex flex-wrap gap-2">
                  <span
                    *ngFor="let author of getAuthors()"
                    class="px-3 py-1 bg-gray-100 dark:bg-manga-dark-accent text-gray-700 dark:text-gray-300 text-sm rounded-full"
                  >
                    {{ author }}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div class="mb-4" *ngIf="availableLanguages.length > 1">
            <label
              for="langSelect"
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Filtrar por idioma:
            </label>
            <select
              id="langSelect"
              [(ngModel)]="selectedLanguage"
              class="block w-40 px-3 py-2 bg-white dark:bg-manga-dark-accent border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm"
            >
              <option [ngValue]="null">Todos</option>
              <option *ngFor="let lang of availableLanguages" [ngValue]="lang">
                {{ getLanguageName(lang) }}
              </option>
            </select>
          </div>

          <!-- Chapters -->
          <div
            class="bg-white dark:bg-manga-dark-secondary rounded-lg shadow-sm p-6"
          >
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Capítulos ({{ chapters.length }})
            </h2>

            <div *ngIf="loadingChapters" class="space-y-3">
              <div *ngFor="let item of [1, 2, 3, 4, 5]" class="animate-pulse">
                <div
                  class="h-16 bg-gray-300 dark:bg-manga-dark-accent rounded-lg"
                ></div>
              </div>
            </div>

            <div
              *ngIf="chapters.length > 0 && !loadingChapters"
              class="space-y-2"
            >
              <div
                *ngFor="
                  let chapter of filteredChapters;
                  trackBy: trackByChapterId
                "
                class="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-manga-dark-accent rounded-lg transition-colors duration-200 cursor-pointer"
                (click)="readChapter(chapter.id)"
              >
                <div class="flex-1">
                  <div class="flex items-center space-x-3">
                    <span class="font-medium text-gray-900 dark:text-white">
                      Capítulo {{ chapter.attributes.chapter || "?" }}
                    </span>
                    <span
                      *ngIf="chapter.attributes.title"
                      class="text-gray-600 dark:text-gray-400"
                    >
                      {{ chapter.attributes.title }}
                    </span>
                  </div>
                  <div
                    class="flex items-center space-x-4 mt-1 text-sm text-gray-500 dark:text-gray-400"
                  >
                    <span>{{
                      getChapterDate(chapter.attributes.publishAt)
                    }}</span>
                    <span *ngIf="chapter.attributes.pages"
                      >{{ chapter.attributes.pages }} páginas</span
                    >
                    <span
                      class="px-2 py-0.5 bg-gray-100 dark:bg-manga-dark text-xs rounded"
                    >
                      {{
                        getLanguageName(chapter.attributes.translatedLanguage)
                      }}
                    </span>
                  </div>
                </div>
                <svg
                  class="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 5l7 7-7 7"
                  ></path>
                </svg>
              </div>
            </div>

            <div
              *ngIf="chapters.length === 0 && !loadingChapters"
              class="text-center py-8"
            >
              <div class="text-4xl mb-4">📖</div>
              <p class="text-gray-600 dark:text-gray-400">
                Nenhum capítulo disponível
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class MangaDetailComponent implements OnInit, OnDestroy {
  private _destroy$ = new Subject<void>();

  manga: Manga | null = null;
  chapters: Chapter[] = [];
  coverUrl = "";
  loading = true;
  loadingChapters = true;
  error = "";
  isFavorite = false;
  selectedLanguage: string | null = null;

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _mangaService: MangaService,
    private _favoritesService: FavoritesService
  ) {}

  ngOnInit(): void {
    this._route.params
      .pipe(
        switchMap((params) => {
          const id = params["id"];
          this.loading = true;
          this.error = "";
          return this._mangaService.getMangaById(id);
        }),
        takeUntil(this._destroy$)
      )
      .subscribe({
        next: (manga) => {
          if (manga) {
            this.manga = manga;
            this._setupCoverUrl();
            this._checkFavoriteStatus();
            this._loadChapters();
          } else {
            this.error = "Mangá não encontrado";
          }
          this.loading = false;
        },
        error: (error) => {
          console.error("Erro ao carregar mangá:", error);
          this.error = "Erro ao carregar mangá. Tente novamente.";
          this.loading = false;
        },
      });
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  private _setupCoverUrl(): void {
    if (!this.manga) return;

    const coverRelation = this.manga.relationships.find(
      (rel) => rel.type === "cover_art"
    );

    if (!coverRelation) {
      this.coverUrl =
        "https://placehold.co/512x683/e5e7eb/6b7280?text=No+Cover";
      return;
    }

    if (coverRelation.attributes?.fileName) {
      this.coverUrl = this._mangaService.getCoverUrl(
        this.manga.id,
        coverRelation.attributes.fileName,
        "512"
      );
    } else {
      this._mangaService
        .getCoverArtById(coverRelation.id)
        .subscribe((coverArt) => {
          if (coverArt?.attributes?.fileName) {
            this.coverUrl = this._mangaService.getCoverUrl(
              this.manga!.id,
              coverArt.attributes.fileName,
              "512"
            );
          } else {
            this.coverUrl =
              "https://placehold.co/512x683/e5e7eb/6b7280?text=No+Cover";
          }
        });
    }
  }

  private _checkFavoriteStatus(): void {
    if (this.manga) {
      this.isFavorite = this._favoritesService.isFavorite(this.manga.id);
    }
  }

  private _loadChapters(): void {
    if (!this.manga) return;

    this.loadingChapters = true;
    this._mangaService
      .getChaptersByManga(this.manga.id, {
        limit: 100,
        order: { chapter: "asc" },
      })
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: (response) => {
          if (response.result === "ok") {
            this.chapters = response.data;
          }
          this.loadingChapters = false;
        },
        error: (error) => {
          console.error("Erro ao carregar capítulos:", error);
          this.loadingChapters = false;
        },
      });
  }

  getTitle(): string {
    if (!this.manga) return "";
    const title = this.manga.attributes.title;
    return (
      title["en"] ||
      title["pt-br"] ||
      title["pt"] ||
      title["ja-ro"] ||
      title["ja"] ||
      Object.values(title)[0] ||
      "Título não disponível"
    );
  }

  getDescription(): string {
    if (!this.manga) return "";
    const description = this.manga.attributes.description;
    if (!description) return "Descrição não disponível";

    return (
      description["en"] ||
      description["pt-br"] ||
      description["pt"] ||
      Object.values(description)[0] ||
      "Descrição não disponível"
    );
  }

  getStatusText(): string {
    if (!this.manga) return "";
    const status = this.manga.attributes.status;
    const statusMap: { [key: string]: string } = {
      ongoing: "Em andamento",
      completed: "Completo",
      hiatus: "Hiato",
      cancelled: "Cancelado",
    };
    return statusMap[status] || status;
  }

  getStatusClass(): string {
    if (!this.manga) return "";
    const status = this.manga.attributes.status;
    const baseClasses = "px-3 py-1 text-sm font-medium rounded-full";

    switch (status) {
      case "ongoing":
        return `${baseClasses} bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400`;
      case "completed":
        return `${baseClasses} bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400`;
      case "hiatus":
        return `${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400`;
      case "cancelled":
        return `${baseClasses} bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400`;
    }
  }

  getContentRating(): string {
    if (!this.manga) return "";
    const rating = this.manga.attributes.contentRating;
    const ratingMap: { [key: string]: string } = {
      safe: "Livre",
      suggestive: "Sugestivo",
      erotica: "Erótico",
      pornographic: "Adulto",
    };
    return ratingMap[rating] || rating;
  }

  getTagName(tag: any): string {
    return (
      tag.attributes.name["en"] ||
      tag.attributes.name["pt-br"] ||
      Object.values(tag.attributes.name)[0] ||
      ""
    );
  }

  getAuthors(): string[] {
    if (!this.manga) return [];
    return this.manga.relationships
      .filter((rel) => rel.type === "author" || rel.type === "artist")
      .map((rel) => rel.attributes?.name)
      .filter((name) => name);
  }

  getChapterDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString("pt-BR");
  }

  getLanguageName(code: string): string {
    const languages: { [key: string]: string } = {
      "pt-br": "Português",
      en: "Inglês",
      es: "Espanhol",
      fr: "Francês",
      ja: "Japonês",
    };
    return languages[code] || code.toUpperCase();
  }

  get filteredChapters(): Chapter[] {
    if (!this.selectedLanguage) return this.chapters;
    return this.chapters.filter(
      (chapter) =>
        chapter.attributes.translatedLanguage === this.selectedLanguage
    );
  }

  get availableLanguages(): string[] {
    const langs = new Set(
      this.chapters.map((ch) => ch.attributes.translatedLanguage)
    );
    return Array.from(langs);
  }

  toggleFavorite(): void {
    if (!this.manga) return;

    if (this.isFavorite) {
      this._favoritesService.removeFromFavorites(this.manga.id);
    } else {
      this._favoritesService.addToFavorites(this.manga, this.coverUrl);
    }

    this.isFavorite = !this.isFavorite;
  }

  startReading(): void {
    if (this.chapters.length > 0) {
      this.readChapter(this.chapters[0].id);
    }
  }

  readChapter(chapterId: string): void {
    this._router.navigate(["/chapter", chapterId]);
  }

  retry(): void {
    this.ngOnInit();
  }

  trackByTagId(index: number, tag: any): string {
    return tag.id;
  }

  trackByChapterId(index: number, chapter: Chapter): string {
    return chapter.id;
  }
}
