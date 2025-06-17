import { Component, Input, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router, RouterModule } from "@angular/router";
import { Manga } from "../../models/manga.model";
import { MangaService } from "../../services/manga.service";
import { FavoritesService } from "../../services/favorites.service";

@Component({
  selector: "app-manga-card",
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div
      class="manga-card h-full flex flex-col cursor-pointer"
      (click)="navigateToDetails()"
    >
      <div class="relative aspect-[3/4] overflow-hidden">
        <img
          [src]="coverUrl"
          [alt]="getTitle()"
          (error)="onImageError($event)"
          class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        <div class="absolute top-2 left-2">
          <span
            [class]="getStatusClass()"
            class="px-2 py-1 text-xs font-medium rounded-full"
          >
            {{ getStatusText() }}
          </span>
        </div>

        <button
          (click)="toggleFavorite($event)"
          class="absolute top-2 right-2 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors duration-200"
          [title]="
            isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'
          "
        >
          <svg
            class="w-4 h-4"
            [class.text-red-500]="isFavorite"
            [class.text-white]="!isFavorite"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
              clip-rule="evenodd"
            ></path>
          </svg>
        </button>

        <div
          class="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300"
        ></div>
      </div>

      <div class="p-4 flex-1 flex flex-col">
        <h3
          class="font-semibold text-gray-900 dark:text-white text-sm line-clamp-2 mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-200"
        >
          {{ getTitle() }}
        </h3>

        <div class="flex-1">
          <p class="text-gray-600 dark:text-gray-400 text-xs line-clamp-3 mb-3">
            {{ getDescription() }}
          </p>

          <div class="flex flex-wrap gap-1 mb-3">
            <span
              *ngFor="let tag of getTopTags(); trackBy: trackByTagId"
              class="px-2 py-1 bg-gray-100 dark:bg-manga-dark-accent text-gray-700 dark:text-gray-300 text-xs rounded-full"
            >
              {{ getTagName(tag) }}
            </span>
          </div>
        </div>

        <div
          class="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mt-auto"
        >
          <span *ngIf="manga.attributes.year">{{ manga.attributes.year }}</span>
          <span
            *ngIf="manga.attributes.lastChapter"
            class="flex items-center space-x-1"
          >
            <svg
              class="w-3 h-3"
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
            <span>Cap. {{ manga.attributes.lastChapter }}</span>
          </span>
        </div>
      </div>
    </div>
  `,
})
export class MangaCardComponent implements OnInit {
  @Input() manga!: Manga;

  coverUrl: string | null = null;
  isFavorite = false;

  constructor(
    private _router: Router,
    private _mangaService: MangaService,
    private _favoritesService: FavoritesService
  ) {}

  ngOnInit(): void {
    this._setupCoverUrl();
    this._checkFavoriteStatus();
  }

  navigateToDetails(): void {
    this._router.navigate(["/manga", this.manga.id]);
  }

  private _setupCoverUrl(): void {
    const coverRelation = this.manga.relationships.find(
      (rel) => rel.type === "cover_art"
    );
    if (coverRelation?.attributes?.fileName && !this.manga.coverUrl) {
      this.coverUrl = this._mangaService.getCoverUrl(
        this.manga.id,
        coverRelation.attributes.fileName,
        "256"
      ) || null;
    } else {
      this.coverUrl = this.manga.coverUrl ||
        "https://via.placeholder.com/256x341/e5e7eb/6b7280?text=No+Cover";
    }
  }

  private _checkFavoriteStatus(): void {
    this.isFavorite = this._favoritesService.isFavorite(this.manga.id);
  }

  getTitle(): string {
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

  getTopTags() {
    return this.manga.attributes.tags.slice(0, 3);
  }

  getTagName(tag: any): string {
    return (
      tag.attributes.name["en"] ||
      tag.attributes.name["pt-br"] ||
      Object.values(tag.attributes.name)[0] ||
      ""
    );
  }

  getStatusText(): string {
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
    const status = this.manga.attributes.status;
    const baseClasses = "px-2 py-1 text-xs font-medium rounded-full";

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

  toggleFavorite(event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    if (this.isFavorite) {
      this._favoritesService.removeFromFavorites(this.manga.id);
    } else {
      this._favoritesService.addToFavorites(this.manga, this.coverUrl);
    }

    this.isFavorite = !this.isFavorite;
  }

  onImageError(event: any): void {
    event.target.src =
      "https://via.placeholder.com/256x341/e5e7eb/6b7280?text=Erro+ao+Carregar";
  }

  trackByTagId(index: number, tag: any): string {
    return tag.id;
  }
}
