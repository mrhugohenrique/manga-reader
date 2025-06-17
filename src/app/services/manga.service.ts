import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable, map, catchError, of } from "rxjs";
import {
  Manga,
  MangaResponse,
  Chapter,
  ChapterResponse,
  ChapterPages,
} from "../models/manga.model";

@Injectable({
  providedIn: "root",
})
export class MangaService {
  private readonly API_BASE = "https://api.mangadex.org";
  private readonly COVERS_BASE = "https://uploads.mangadex.org/covers";

  constructor(private _http: HttpClient) {}

  getMangas(
    params: {
      limit?: number;
      offset?: number;
      title?: string;
      includedTags?: string[];
      excludedTags?: string[];
      status?: string[];
      publicationDemographic?: string[];
      contentRating?: string[];
      order?: { [key: string]: "asc" | "desc" };
    } = {}
  ): Observable<MangaResponse> {
    let httpParams = new HttpParams();

    httpParams = httpParams.set("limit", (params.limit ?? 20).toString());
    httpParams = httpParams.set("offset", (params.offset ?? 0).toString());

    ["cover_art", "author", "artist"].forEach((rel) => {
      httpParams = httpParams.append("includes[]", rel);
    });

    if (params.title) {
      httpParams = httpParams.set("title", params.title);
    }

    if (params.includedTags?.length) {
      params.includedTags.forEach((tag) => {
        httpParams = httpParams.append("includedTags[]", tag);
      });
    }

    if (params.excludedTags?.length) {
      params.excludedTags.forEach((tag) => {
        httpParams = httpParams.append("excludedTags[]", tag);
      });
    }

    if (params.status?.length) {
      params.status.forEach((status) => {
        httpParams = httpParams.append("status[]", status);
      });
    }

    if (params.publicationDemographic?.length) {
      params.publicationDemographic.forEach((demo) => {
        httpParams = httpParams.append("publicationDemographic[]", demo);
      });
    }

    if (params.contentRating?.length) {
      params.contentRating.forEach((rating) => {
        httpParams = httpParams.append("contentRating[]", rating);
      });
    }

    if (params.order) {
      Object.entries(params.order).forEach(([key, value]) => {
        httpParams = httpParams.set(`order[${key}]`, value);
      });
    } else {
      httpParams = httpParams.set("order[followedCount]", "desc");
    }

    return this._http
      .get<MangaResponse>(`${this.API_BASE}/manga`, { params: httpParams })
      .pipe(
        catchError((error) => {
          return of({
            result: "error",
            response: "error",
            data: [],
            limit: 0,
            offset: 0,
            total: 0,
          } as MangaResponse);
        })
      );
  }

  getMangaById(id: string): Observable<Manga | null> {
    const params = new HttpParams()
      .set("includes[]", "cover_art")
      .set("includes[]", "author")
      .set("includes[]", "artist");

    return this._http
      .get<{ data: Manga }>(`${this.API_BASE}/manga/${id}`, { params })
      .pipe(
        map((response) => response.data),
        catchError((error) => {
          console.error("Erro ao buscar mangá:", error);
          return of(null);
        })
      );
  }

  getChaptersByManga(
    mangaId: string,
    params: {
      limit?: number;
      offset?: number;
      translatedLanguage?: string[];
      order?: { [key: string]: "asc" | "desc" };
    } = {}
  ): Observable<ChapterResponse> {
    let httpParams = new HttpParams();

    httpParams = httpParams.set("manga", mangaId);
    httpParams = httpParams.set("limit", (params.limit || 100).toString());
    httpParams = httpParams.set("offset", (params.offset || 0).toString());
    httpParams = httpParams.set("includes[]", "scanlation_group");
    httpParams = httpParams.set("includes[]", "user");

    const languages = params.translatedLanguage || ["pt-br", "en"];
    languages.forEach((lang) => {
      httpParams = httpParams.append("translatedLanguage[]", lang);
    });

    if (params.order) {
      Object.entries(params.order).forEach(([key, value]) => {
        httpParams = httpParams.set(`order[${key}]`, value);
      });
    } else {
      httpParams = httpParams.set("order[chapter]", "asc");
    }

    return this._http
      .get<ChapterResponse>(`${this.API_BASE}/chapter`, { params: httpParams })
      .pipe(
        catchError((error) => {
          console.error("Erro ao buscar capítulos:", error);
          return of({
            result: "error",
            response: "error",
            data: [],
            limit: 0,
            offset: 0,
            total: 0,
          });
        })
      );
  }

  getChapterPages(chapterId: string): Observable<ChapterPages | null> {
    return this._http
      .get<ChapterPages>(`${this.API_BASE}/at-home/server/${chapterId}`)
      .pipe(
        catchError((error) => {
          console.error("Erro ao buscar páginas do capítulo:", error);
          return of(null);
        })
      );
  }

  getCoverUrl(
    mangaId: string,
    filename: string,
    size: "original" | "512" | "256" = "256"
  ): string {
    if (size === "original") {
      return `${this.COVERS_BASE}/${mangaId}/${filename}`;
    }
    return `${this.COVERS_BASE}/${mangaId}/${filename}.${size}.jpg`;
  }

  getCoverArtById(id: string): Observable<any> {
    return this._http.get<{ data: any }>(`${this.API_BASE}/cover/${id}`).pipe(
      map((res) => res.data),
      catchError((err) => {
        console.error("Erro ao buscar cover_art:", err);
        return of(null);
      })
    );
  }

  getPageUrl(
    baseUrl: string,
    hash: string,
    filename: string,
    dataSaver: boolean = false
  ): string {
    const quality = dataSaver ? "data-saver" : "data";
    return `${baseUrl}/${quality}/${hash}/${filename}`;
  }
}
