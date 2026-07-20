import { Component, OnInit, afterNextRender } from '@angular/core';
import { CarrinhoService } from '@services/carrinho.service';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProdutosService } from '@services/produtos.service';
import { AuthService } from '@services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [FormsModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  termoBusca: string = '';
  // Só renderiza os links de auth no browser (evita mismatch de hidratação no SSR)
  mostrarAuth = false;

  constructor(
    public carrinhoService: CarrinhoService,
    private router: Router,
    private produtosService: ProdutosService,
    private auth: AuthService
  ) {
    afterNextRender(() => { this.mostrarAuth = true; });
  }

  ngOnInit(): void {}

  get logado(): boolean {
    return this.auth.isLoggedIn();
  }

  // Primeiro nome do usuário logado (para a saudação no header)
  get primeiroNome(): string {
    const usuario = this.auth.getUsuario();
    const nome = usuario?.name || '';
    return nome ? nome.split(' ')[0] : '';
  }

  sair(): void {
    this.auth.logout().subscribe({
      next: () => this.router.navigate(['/home']),
      error: () => this.router.navigate(['/home'])
    });
  }

  buscar(event?: Event): void {
    if (event) event.preventDefault();

    if (this.termoBusca.trim()) {
      const termo = this.termoBusca.toLowerCase();

      // lista de servidores (IDs 16–30)
      const servidores = this.produtosService.getServidores();

      const ehServidor = termo.includes('servidor') ||
        servidores.some(s =>
          s.nome.toLowerCase().includes(termo) ||
          s.descricao.toLowerCase().includes(termo)
        );

      if (ehServidor) {
        this.router.navigate(['/servidores'], { queryParams: { busca: this.termoBusca } });
      } else {
        this.router.navigate(['/produtos'], { queryParams: { busca: this.termoBusca } });
      }
    }
  }
}
