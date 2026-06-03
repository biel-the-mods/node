import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  template: `
    <footer
      class="border-t border-amber-500/20
        bg-charcoal-950/80 backdrop-blur-md
        mt-20"
    >
      <div
        class="max-w-7xl mx-auto
          px-4 sm:px-6 lg:px-8
          py-10
          flex flex-col md:flex-row
          items-center justify-between
          gap-4"
      >
        <div class="text-amber-100/50 text-sm">
          © {{ year }}
          <span class="text-amber-400 font-semibold">
            Elfas Design
          </span>
          — todos os direitos reservados.
        </div>
        <div class="text-xs uppercase tracking-widest text-amber-100/30">
          Amber &amp; Charcoal · feito por Elfas
        </div>
      </div>
    </footer>
  `,
})
export class FooterComponent {
  protected readonly year = new Date().getFullYear();
}
