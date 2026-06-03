import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  ViewChild,
} from '@angular/core';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': Record<string, unknown>;
    }
  }
}

@Component({
  selector: 'app-model-viewer',
  standalone: true,
  template: `
    <div
      class="glass overflow-hidden
        aspect-square
        flex items-center justify-center"
    >
      @if (modelUrl) {
        <div
          #host
          class="w-full h-full"
          [attr.data-src]="modelUrl"
        ></div>
      } @else {
        <div
          class="flex flex-col items-center
            justify-center gap-3
            text-amber-100/40"
        >
          <span class="text-5xl">🜲</span>
          <span class="text-sm uppercase tracking-widest">
            sem modelo 3D
          </span>
        </div>
      }
    </div>
  `,
})
export class ModelViewerComponent
  implements AfterViewInit, OnChanges
{
  @Input() modelUrl: string | null = null;
  @Input() alt = 'Mockup 3D Elfas Design';
  @Input() autoRotate = true;
  @Input() cameraControls = true;

  @ViewChild('host') host!: ElementRef<HTMLDivElement>;

  ngAfterViewInit(): void {
    this.loadScript()
      .then(() => this.renderModel())
      .catch(() => {
        // falha silenciosa: o componente continua exibindo placeholder
      });
  }

  ngOnChanges(): void {
    if (this.host?.nativeElement) {
      this.renderModel();
    }
  }

  private loadScript(): Promise<void> {
    if (customElements.get('model-viewer')) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.type = 'module';
      s.src =
        'https://ajax.googleapis.com/ajax/libs/model-viewer/3.5.0/model-viewer.min.js';
      s.onload = () => resolve();
      s.onerror = () => reject(new Error('model-viewer failed'));
      document.head.appendChild(s);
    });
  }

  private renderModel(): void {
    if (!this.host?.nativeElement || !this.modelUrl) return;
    if (!customElements.get('model-viewer')) return;

    const el = document.createElement('model-viewer');
    el.setAttribute('src', this.modelUrl);
    el.setAttribute('alt', this.alt);
    el.setAttribute('camera-controls', String(this.cameraControls));
    el.setAttribute('auto-rotate', String(this.autoRotate));
    el.setAttribute('shadow-intensity', '1');
    el.setAttribute('exposure', '0.9');
    el.style.width = '100%';
    el.style.height = '100%';

    this.host.nativeElement.innerHTML = '';
    this.host.nativeElement.appendChild(el);
  }
}
