export interface Manga {
  id: string;
  type: string;
  coverUrl?: string | null;
  attributes: {
    title: { [key: string]: string };
    altTitles: Array<{ [key: string]: string }>;
    description: { [key: string]: string };
    isLocked: boolean;
    links: { [key: string]: string };
    originalLanguage: string;
    lastVolume: string;
    lastChapter: string;
    publicationDemographic: string;
    status: "ongoing" | "completed" | "hiatus" | "cancelled";
    year: number;
    contentRating: string;
    tags: Tag[];
    state: string;
    chapterNumbersResetOnNewVolume: boolean;
    createdAt: string;
    updatedAt: string;
    version: number;
    availableTranslatedLanguages: string[];
    latestUploadedChapter: string;
  };
  relationships: Relationship[];
}

export interface Tag {
  id: string;
  type: string;
  attributes: {
    name: { [key: string]: string };
    description: { [key: string]: string };
    group: string;
    version: number;
  };
}

export interface Relationship {
  id: string;
  type: string;
  related?: string;
  attributes?: any;
}

export interface Chapter {
  id: string;
  type: string;
  attributes: {
    volume: string;
    chapter: string;
    title: string;
    translatedLanguage: string;
    externalUrl: string;
    publishAt: string;
    readableAt: string;
    createdAt: string;
    updatedAt: string;
    pages: number;
    version: number;
  };
  relationships: Relationship[];
}

export interface ChapterPages {
  baseUrl: string;
  chapter: {
    hash: string;
    data: string[];
    dataSaver: string[];
  };
}

export interface MangaResponse {
  result: string;
  response: string;
  data: Manga[];
  limit: number;
  offset: number;
  total: number;
}

export interface ChapterResponse {
  result: string;
  response: string;
  data: Chapter[];
  limit: number;
  offset: number;
  total: number;
}
