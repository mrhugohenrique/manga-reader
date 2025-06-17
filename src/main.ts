import { bootstrapApplication } from "@angular/platform-browser";
import { provideRouter } from "@angular/router";
import { provideHttpClient } from "@angular/common/http";
import { App } from "./app.component";
import { appRoutes } from "./app.routes";

bootstrapApplication(App, {
  providers: [provideRouter(appRoutes), provideHttpClient()],
});
