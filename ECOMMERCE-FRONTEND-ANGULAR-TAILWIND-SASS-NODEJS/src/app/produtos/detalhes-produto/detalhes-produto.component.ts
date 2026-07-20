
import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, ParamMap, RouterLink } from '@angular/router';
import { IprodutoCarrinho } from '@interfaces/iproduto-carrinho';
import { Iproduto } from '@interfaces/iproduto';
import { produtos } from '@interfaces/produtos';
import { ProdutosService } from '@services/produtos.service';
import { CarrinhoService } from '@services/carrinho.service';
import { NotificacaoService } from '@services/notificacao.service';
import { ZoomOnClickDirective } from '@app/directives/zoom-on-click.directive';

@Component({
  selector: 'app-detalhes-produto',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,            // ✅ substitui RouterModule
    ZoomOnClickDirective   // ✅ diretiva standalone
  ],
  templateUrl: './detalhes-produto.component.html',
  styleUrls: ['./detalhes-produto.component.scss']
})
export class DetalhesProdutoComponent implements OnInit {
  produtoId: number | null = null;
  produto!: Iproduto; 
  quantidade: number = 1;
  produtoSelecionado: Iproduto | undefined;
  imgPath: string = '';

  @ViewChild('quantidadeInput') quantidadeInput!: ElementRef<HTMLInputElement>;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private produtosService: ProdutosService,
    private notificacaoService: NotificacaoService,
    private carrinhoService: CarrinhoService
  ) {}

  ngOnInit(): void {
    const routeParams: ParamMap = this.route.snapshot.paramMap;
    const produtoId: number = Number(routeParams.get("id"));
    this.produtoId = isNaN(produtoId) ? null : produtoId;

    this.produtosService.getById(produtoId);
    this.produtoSelecionado = produtos.find(p => p.id === this.produtoId);

    if (!this.produtoSelecionado) {
      this.router.navigateByUrl('/404');
      return;
    }

    this.imgPath = this.produtoSelecionado?.imagem ?? '';
  }

  adicionarAoCarrinho(): void {
    const quantidade = Number(this.quantidadeInput.nativeElement.value);

    if (this.produtoSelecionado) {
      const produtoComQuantidade: IprodutoCarrinho = {
        ...this.produtoSelecionado,
        quantidadeSelecionada: quantidade
      };

      this.carrinhoService.adicionarAoCarrinho(produtoComQuantidade);
      this.notificacaoService.notificar("Produto adicionado ao carrinho!");
    }
  }
}
