import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { CommonModule } from "@angular/common";
import { FooterComponent } from "./app/components/footer/footer.component";
import { HeaderComponent } from "./app/components/header/header.component";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, FooterComponent],
  template: `
    <div class="min-h-screen flex flex-col bg-gray-50 dark:bg-manga-dark">
      <app-header></app-header>

      <main class="flex-grow pb-16">
        <router-outlet></router-outlet>
      </main>

      <app-footer class="fixed bottom-0 left-0 w-full"></app-footer>
    </div>
  `,
})
export class App {}
