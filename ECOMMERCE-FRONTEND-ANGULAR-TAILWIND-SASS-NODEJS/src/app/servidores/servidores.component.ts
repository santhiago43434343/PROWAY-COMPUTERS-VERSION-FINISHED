import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Iproduto } from '../../interfaces/iproduto';
import { ProdutosService } from '@services/produtos.service';
import { ZoomOnClickDirective } from '../directives/zoom-on-click.directive';
import { CartService } from '@services/cart.service'; // ✅ importa o mesmo serviço
import { CarrinhoService } from '@app/services/carrinho.service';

@Component({
  selector: 'app-servidores',
  standalone: true,
  imports: [CommonModule, RouterModule, ZoomOnClickDirective],
  templateUrl: './servidores.component.html',
  styleUrls: ['./servidores.component.scss']
})
export class ServidoresComponent implements OnInit {
  termoBusca: string = '';
  servidores: Iproduto[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private produtosService: ProdutosService,
    private cartService: CartService ,  // ✅ injeta o serviço
    private carrinhoService: CarrinhoService
  ) {}

  ngOnInit(): void {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.carregarServidores();
      });

    this.carregarServidores();
  }

  carregarServidores(): void {
    this.route.queryParams.subscribe(params => {
      this.termoBusca = params['busca']?.toLowerCase() || '';
      const servidores = this.produtosService.getServidores();

      this.servidores = this.termoBusca
        ? servidores.filter(s =>
            s.nome.toLowerCase().includes(this.termoBusca) ||
            s.descricao.toLowerCase().includes(this.termoBusca)
          )
        : servidores;
    });
  }

  adicionarAoCarrinho(servidor: Iproduto): void {
    this.carrinhoService.adicionarAoCarrinho({
      ...servidor,
      quantidadeSelecionada: 1   // ✅ define quantidade padrão
    });
    alert(`${servidor.nome} foi adicionado ao carrinho!`);
  }
}
