import { Component, OnInit, OnDestroy, HostListener } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ActivatedRoute, Router } from "@angular/router";
import { Subject, takeUntil, switchMap } from "rxjs";
import { MangaService } from "../../services/manga.service";
import { FavoritesService } from "../../services/favorites.service";
import { Chapter, ChapterPages } from "../../models/manga.model";
import { FormsModule } from "@angular/forms";

@Component({
  selector: "app-reader",
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-black text-white">
      <header
        class="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-sm border-b border-gray-800 transition-transform duration-300"
        [class.transform]="!showUI"
        [class.-translate-y-full]="!showUI"
      >
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex items-center justify-between h-16">
            <button
              (click)="goBack()"
              class="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors duration-200"
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
                  d="M15 19l-7-7 7-7"
                ></path>
              </svg>
              <span>Voltar</span>
            </button>

            <div *ngIf="chapter" class="text-center">
              <h1 class="text-lg font-semibold">
                Capítulo {{ chapter.attributes.chapter || "?" }}
              </h1>
              <p *ngIf="chapter.attributes.title" class="text-sm text-gray-400">
                {{ chapter.attributes.title }}
              </p>
            </div>

            <div class="flex items-center space-x-4">
              <div *ngIf="pages.length > 0" class="text-sm text-gray-400">
                {{ currentPage + 1 }} / {{ pages.length }}
              </div>

              <button
                (click)="toggleSettings()"
                class="p-2 rounded-lg hover:bg-gray-800 transition-colors duration-200"
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
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  ></path>
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  ></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div
        *ngIf="showSettings"
        class="fixed top-16 right-4 z-40 bg-gray-900 rounded-lg shadow-xl p-4 w-64 animate-slide-up"
      >
        <h3 class="text-lg font-semibold mb-4">Configurações</h3>

        <div class="mb-4">
          <label class="block text-sm font-medium mb-2">Modo de Leitura</label>
          <select
            [(ngModel)]="readingMode"
            (change)="onReadingModeChange()"
            class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
          >
            <option value="vertical">Vertical</option>
            <option value="horizontal">Horizontal</option>
          </select>
        </div>

        <div class="mb-4">
          <label class="block text-sm font-medium mb-2">Ajuste da Página</label>
          <select
            [(ngModel)]="pageFit"
            (change)="onPageFitChange()"
            class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
          >
            <option value="width">Ajustar à Largura</option>
            <option value="height">Ajustar à Altura</option>
            <option value="both">Ajustar à Tela</option>
            <option value="original">Tamanho Original</option>
          </select>
        </div>
      </div>

      <div
        *ngIf="loading"
        class="flex items-center justify-center min-h-screen"
      >
        <div class="text-center">
          <div
            class="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"
          ></div>
          <p class="text-gray-400">Carregando capítulo...</p>
        </div>
      </div>

      <div *ngIf="error" class="flex items-center justify-center min-h-screen">
        <div class="text-center">
          <div class="text-6xl mb-4">⚠️</div>
          <h3 class="text-xl font-semibold mb-2">Erro ao carregar capítulo</h3>
          <p class="text-gray-400 mb-6">{{ error }}</p>
          <button
            (click)="retry()"
            class="bg-white text-black px-6 py-2 rounded-lg hover:bg-gray-200 transition-colors duration-200"
          >
            Tentar Novamente
          </button>
        </div>
      </div>

      <div
        *ngIf="!loading && !error && pages.length > 0"
        class="pt-16"
        (click)="toggleUI()"
      >
        <div *ngIf="readingMode === 'vertical'" class="max-w-4xl mx-auto">
          <div
            *ngFor="let page of pages; let i = index; trackBy: trackByPageIndex"
            class="flex justify-center mb-2"
          >
            <img
              [src]="page"
              [alt]="'Página ' + (i + 1)"
              (load)="onImageLoad(i)"
              (error)="onImageError($event, i)"
              [class]="getImageClasses()"
              class="max-w-full h-auto"
            />
          </div>
        </div>

        <div
          *ngIf="readingMode === 'horizontal'"
          class="flex items-center justify-center min-h-screen"
        >
          <img
            *ngIf="pages[currentPage]"
            [src]="pages[currentPage]"
            [alt]="'Página ' + (currentPage + 1)"
            (load)="onImageLoad(currentPage)"
            (error)="onImageError($event, currentPage)"
            [class]="getImageClasses()"
            class="max-w-full max-h-full"
          />
        </div>
      </div>

      <div
        *ngIf="readingMode === 'horizontal' && pages.length > 0"
        class="fixed inset-y-0 left-0 right-0 flex items-center justify-between pointer-events-none z-30"
      >
        <button
          *ngIf="currentPage > 0"
          (click)="previousPage($event)"
          class="ml-4 p-3 bg-black/50 hover:bg-black/70 rounded-full transition-colors duration-200 pointer-events-auto"
        >
          <svg
            class="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 19l-7-7 7-7"
            ></path>
          </svg>
        </button>

        <button
          *ngIf="currentPage < pages.length - 1"
          (click)="nextPage($event)"
          class="mr-4 p-3 bg-black/50 hover:bg-black/70 rounded-full transition-colors duration-200 pointer-events-auto"
        >
          <svg
            class="w-6 h-6"
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
        </button>
      </div>

      <div
        *ngIf="!showUI && pages.length > 0"
        class="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-40 bg-black/90 backdrop-blur-sm rounded-full px-4 py-2"
      >
        <div class="flex items-center space-x-4 text-sm">
          <span>{{ currentPage + 1 }} / {{ pages.length }}</span>
          <div class="w-32 bg-gray-700 rounded-full h-2">
            <div
              class="bg-white h-2 rounded-full transition-all duration-300"
              [style.width.%]="((currentPage + 1) / pages.length) * 100"
            ></div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .animate-slide-up {
        animation: slideUp 0.3s ease-out;
      }

      @keyframes slideUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `,
  ],
})
export class ReaderComponent implements OnInit, OnDestroy {
  private _destroy$ = new Subject<void>();

  chapter: Chapter | null = null;
  pages: string[] = [];
  currentPage = 0;
  loading = true;
  error = "";

  showUI = true;
  showSettings = false;
  readingMode: "vertical" | "horizontal" = "vertical";
  pageFit: "width" | "height" | "both" | "original" = "width";

  private _uiTimeout: any;

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _mangaService: MangaService,
    private _favoritesService: FavoritesService
  ) {}

  ngOnInit(): void {
    this._loadSettings();
    this._route.params
      .pipe(
        switchMap((params) => {
          const id = params["id"];
          this.loading = true;
          this.error = "";
          return this._mangaService.getChapterPages(id);
        }),
        takeUntil(this._destroy$)
      )
      .subscribe({
        next: (chapterPages) => {
          if (chapterPages) {
            this._setupPages(chapterPages);
          } else {
            this.error = "Capítulo não encontrado ou páginas indisponíveis";
          }
          this.loading = false;
        },
        error: (error) => {
          console.error("Erro ao carregar capítulo:", error);
          this.error = "Erro ao carregar capítulo. Tente novamente.";
          this.loading = false;
        },
      });

    this._setupAutoHideUI();
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
    if (this._uiTimeout) {
      clearTimeout(this._uiTimeout);
    }
  }

  private _loadSettings(): void {
    const savedMode = localStorage.getItem("manga-reader-mode");
    const savedFit = localStorage.getItem("manga-reader-fit");

    if (savedMode) {
      this.readingMode = savedMode as "vertical" | "horizontal";
    }

    if (savedFit) {
      this.pageFit = savedFit as "width" | "height" | "both" | "original";
    }
  }

  private _setupPages(chapterPages: ChapterPages): void {
    const { baseUrl, chapter } = chapterPages;
    this.pages = chapter.data.map((filename) =>
      this._mangaService.getPageUrl(baseUrl, chapter.hash, filename, false)
    );
  }

  private _setupAutoHideUI(): void {
    this._resetUITimeout();
  }

  private _resetUITimeout(): void {
    if (this._uiTimeout) {
      clearTimeout(this._uiTimeout);
    }

    this._uiTimeout = setTimeout(() => {
      this.showUI = false;
      this.showSettings = false;
    }, 3000);
  }

  @HostListener("keydown", ["$event"])
  onKeyDown(event: KeyboardEvent): void {
    switch (event.key) {
      case "ArrowLeft":
        this.previousPage();
        break;
      case "ArrowRight":
        this.nextPage();
        break;
      case "Escape":
        this.goBack();
        break;
    }
  }

  @HostListener("mousemove")
  onMouseMove(): void {
    this.showUI = true;
    this._resetUITimeout();
  }

  toggleUI(): void {
    this.showUI = !this.showUI;
    if (this.showUI) {
      this._resetUITimeout();
    }
  }

  toggleSettings(): void {
    this.showSettings = !this.showSettings;
  }

  onReadingModeChange(): void {
    localStorage.setItem("manga-reader-mode", this.readingMode);
    this.currentPage = 0;
  }

  onPageFitChange(): void {
    localStorage.setItem("manga-reader-fit", this.pageFit);
  }

  getImageClasses(): string {
    const baseClasses = "transition-all duration-300";

    switch (this.pageFit) {
      case "width":
        return `${baseClasses} w-full h-auto`;
      case "height":
        return `${baseClasses} h-screen w-auto`;
      case "both":
        return `${baseClasses} max-w-full max-h-screen object-contain`;
      case "original":
        return baseClasses;
      default:
        return `${baseClasses} w-full h-auto`;
    }
  }

  previousPage(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }

    if (this.currentPage > 0) {
      this.currentPage--;
      this._updateReadingProgress();
    }
  }

  nextPage(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }

    if (this.currentPage < this.pages.length - 1) {
      this.currentPage++;
      this._updateReadingProgress();
    }
  }

  private _updateReadingProgress(): void {
    if (this.chapter) {
      const progress = Math.round(
        ((this.currentPage + 1) / this.pages.length) * 100
      );
      // Update reading progress in favorites if this manga is favorited
      // This would require knowing the manga ID, which we'd need to get from the chapter data
    }
  }

  onImageLoad(index: number): void {
    // Image loaded successfully
  }

  onImageError(event: any, index: number): void {
    console.error(`Erro ao carregar página ${index + 1}`);
    event.target.src =
      "https://via.placeholder.com/800x1200/374151/9ca3af?text=Erro+ao+Carregar";
  }

  goBack(): void {
    this._router.navigate(["/"]);
  }

  retry(): void {
    this.ngOnInit();
  }

  trackByPageIndex(index: number, page: string): number {
    return index;
  }
}
