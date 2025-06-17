import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";

@Component({
  selector: "app-footer",
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <footer
      class="bg-white dark:bg-manga-dark-secondary border-t border-gray-200 dark:border-manga-dark-accent"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div
          class="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0"
        >
          <div class="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
            © {{ currentYear }} Manga Reader. Todos os direitos reservados.
          </div>
          <nav class="flex space-x-4">
            <a
              href="https://github.com/mrhugohenrique/"
              target="_blank"
              rel="noopener"
              class="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 text-xs sm:text-sm transition-colors duration-200"
              >GitHub - Hugo Henrique</a
            >
          </nav>
        </div>
      </div>
    </footer>
  `,
})
export class FooterComponent {
  currentYear: number = new Date().getFullYear();
}
