import { Directive, HostListener, ElementRef } from '@angular/core';

@Directive({
  selector: 'img[zoomOnClick]',
  standalone: true
})
export class ZoomOnClickDirective {
  constructor(private el: ElementRef) {}

  @HostListener('click') onClick() {
    const src = this.el.nativeElement.src;

    // Evita múltiplos modais
    if (document.querySelector('.zoom-modal')) return;

    const modal = document.createElement('div');
    modal.className = 'zoom-modal fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50';

    const img = document.createElement('img');
    img.src = src;
    img.className = 'max-h-full max-w-full rounded shadow-lg';

    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '&times;';
    closeBtn.className = 'absolute top-4 right-4 text-white text-3xl';

    modal.appendChild(img);
    modal.appendChild(closeBtn);
    document.body.appendChild(modal);

    // Fecha ao clicar no botão
    closeBtn.addEventListener('click', () => modal.remove());

    // Fecha ao clicar fora da imagem
    modal.addEventListener('click', (event) => {
      if (event.target === modal) modal.remove();
    });
  }
}
