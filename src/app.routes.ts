import { Routes } from "@angular/router";
import { HomeComponent } from "./app/pages/home/home.component";

export const appRoutes: Routes = [
  { path: "", component: HomeComponent },
  {
    path: "favorites",
    loadComponent: () =>
      import("./app/pages/favorites/favorites.component").then(
        (m) => m.FavoritesComponent
      ),
  },
  {
    path: "manga/:id",
    loadComponent: () =>
      import("./app/pages/manga-detail/manga-detail.component").then(
        (m) => m.MangaDetailComponent
      ),
  },
  {
    path: "chapter/:id",
    loadComponent: () =>
      import("./app/pages/reader/reader.component").then(
        (m) => m.ReaderComponent
      ),
  },
  { path: "**", redirectTo: "" },
];
