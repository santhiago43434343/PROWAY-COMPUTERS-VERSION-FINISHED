import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Iproduto } from '../../interfaces/iproduto';
import { ProdutosService } from '@services/produtos.service';
import { ZoomOnClickDirective } from '@app/directives/zoom-on-click.directive';
import { CartService } from '@app/services/cart.service';
import { CarrinhoService } from '@app/services/carrinho.service';

@Component({
  selector: 'app-produtos',
  standalone: true,
  imports: [CommonModule, RouterModule, ZoomOnClickDirective ],
  templateUrl: './produtos.component.html',
  styleUrls: ['./produtos.component.scss']
})
export class ProdutosComponent implements OnInit {
  termoBusca: string = '';
  produtos: Iproduto[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private produtosService: ProdutosService,
    private carrinhoService: CarrinhoService
  ) {}

  ngOnInit(): void {
    // Escuta navegação para recarregar o componente mesmo se já estiver na rota
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.carregarProdutos();
      });

    // Carrega na primeira vez também
    this.carregarProdutos();
  }

  carregarProdutos(): void {
    this.route.queryParams.subscribe(params => {
      this.termoBusca = params['busca']?.toLowerCase() || '';
      const perifericos = this.produtosService.getPerifericos(); // 🔑 só IDs 1–15

      this.produtos = this.termoBusca
        ? perifericos.filter(p =>
            p.nome.toLowerCase().includes(this.termoBusca) ||
            p.descricao.toLowerCase().includes(this.termoBusca)
          )
        : perifericos;
    });
  }

 adicionarAoCarrinho(produto: Iproduto): void 
 { this.carrinhoService.adicionarAoCarrinho({ 
  ...produto, quantidadeSelecionada: 1 
 }); alert(`${produto.nome} foi adicionado ao carrinho!`); 

   }
 }
 