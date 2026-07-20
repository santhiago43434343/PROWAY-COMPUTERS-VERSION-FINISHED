import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PedidoService } from '../../services/pedido.service';
import { forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Component({
  selector: 'app-meus-pedidos',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './meus-pedidos.component.html'
})
export class MeusPedidosComponent implements OnInit {
  pedidos: any[] = [];
  carregando = true;
  erro = '';

  // Seleção múltipla para exclusão em massa
  selecionados = new Set<number>();
  excluindoEmMassa = false;

  constructor(
    private pedidoService: PedidoService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.pedidoService.listarPedidos().subscribe({
      next: (res) => {
        this.pedidos = res || [];
        this.carregando = false;
      },
      error: () => {
        this.erro = 'Não foi possível carregar seus pedidos.';
        this.carregando = false;
      }
    });
  }

  rastreio(p: any): string {
    return `PED-${p.id}`;
  }

  excluir(p: any, event: Event): void {
    event.stopPropagation();
    if (!confirm(`Excluir o pedido #${p.id}?`)) return;

    this.pedidoService.excluirPedido(p.id).subscribe({
      next: () => {
        this.pedidos = this.pedidos.filter(x => x.id !== p.id);
        this.selecionados.delete(p.id);
      },
      error: () => {
        alert('Não foi possível excluir o pedido.');
      }
    });
  }

  cancelar(p: any, event: Event): void {
    event.stopPropagation();
    if (!confirm(`Cancelar o pedido #${p.id}?`)) return;

    this.pedidoService.cancelarPedido(p.id).subscribe({
      next: () => { p.status = 'cancelado'; },        // o badge vira CANCELADO na hora
      error: (e) => { alert(e?.error?.error || 'Não foi possível cancelar o pedido.'); }
    });
  }

  // ---------- Seleção múltipla / exclusão em massa ----------

  estaSelecionado(p: any): boolean {
    return this.selecionados.has(p.id);
  }

  toggleSelecionado(p: any): void {
    if (this.selecionados.has(p.id)) {
      this.selecionados.delete(p.id);
    } else {
      this.selecionados.add(p.id);
    }
  }

  get algumSelecionado(): boolean {
    return this.selecionados.size > 0;
  }

  // true quando TODOS os pedidos da tela estão marcados (controla o "Selecionar todos")
  get todosSelecionados(): boolean {
    return this.pedidos.length > 0 && this.selecionados.size === this.pedidos.length;
  }

  toggleTodos(event: Event): void {
    const marcado = (event.target as HTMLInputElement).checked;
    this.selecionados.clear();
    if (marcado) {
      this.pedidos.forEach(p => this.selecionados.add(p.id));
    }
  }

  // Exclui apenas os pedidos marcados via checkbox.
  excluirSelecionados(): void {
    const ids = Array.from(this.selecionados);
    this.excluirVarios(ids, `Excluir ${ids.length} pedido(s) selecionado(s)? Esta ação não pode ser desfeita.`);
  }

  // Exclui TODOS os pedidos da tela, independente da seleção.
  excluirTodos(): void {
    const ids = this.pedidos.map(p => p.id);
    this.excluirVarios(ids, `Excluir TODOS os ${ids.length} pedido(s)? Esta ação não pode ser desfeita.`);
  }

  // Núcleo da exclusão em massa: uma chamada DELETE por pedido, em paralelo.
  // Uma falha isolada não aborta as demais; ao final removemos os que deram certo.
  private excluirVarios(ids: number[], mensagemConfirmacao: string): void {
    if (ids.length === 0 || this.excluindoEmMassa) return;
    if (!confirm(mensagemConfirmacao)) return;

    this.excluindoEmMassa = true;

    forkJoin(
      ids.map(id =>
        this.pedidoService.excluirPedido(id).pipe(
          map(() => ({ id, ok: true })),
          catchError(() => of({ id, ok: false }))
        )
      )
    ).subscribe((resultados) => {
      const removidos = resultados.filter(r => r.ok).map(r => r.id);
      this.pedidos = this.pedidos.filter(p => !removidos.includes(p.id));
      removidos.forEach(id => this.selecionados.delete(id));
      this.excluindoEmMassa = false;

      const falhas = resultados.length - removidos.length;
      if (falhas > 0) alert(`${falhas} pedido(s) não puderam ser excluídos. Tente novamente.`);
    });
  }
}
