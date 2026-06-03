import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastComponent } from './components/toast/toast.component';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent, ToastComponent],
  template: `
    <div class="min-h-screen flex flex-col">
      <app-header />

      <main class="flex-1">
        <router-outlet />
      </main>

      <app-footer />

      <app-toast />
    </div>
  `,
})
export class AppComponent {}
