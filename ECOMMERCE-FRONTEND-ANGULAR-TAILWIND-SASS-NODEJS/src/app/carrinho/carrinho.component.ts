import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CarrinhoService } from '../services/carrinho.service';
import { FreteService, OpcaoFrete } from '../services/frete.service';
import { IprodutoCarrinho } from '@interfaces/iproduto-carrinho';

@Component({
  selector: 'app-carrinho',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './carrinho.component.html',
  styleUrls: ['./carrinho.component.scss'],
})
export class CarrinhoComponent implements OnInit {
  itemsCarrinho: IprodutoCarrinho[] = [];

  // Frete
  cep = '';
  cidadeUf = '';
  opcoesFrete: OpcaoFrete[] = [];
  carregandoFrete = false;
  erroFrete = '';
  freteMock = false;

  freteSelecionado = 0;
  servicoSelecionado = '';

  private ultimoCepCalculado = '';

  constructor(
    public carrinhoService: CarrinhoService,
    private freteService: FreteService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.itemsCarrinho = this.carrinhoService.obterCarrinho();
  }

  removerItem(index: number): void {
    this.itemsCarrinho.splice(index, 1);
    localStorage.setItem('carrinho', JSON.stringify(this.itemsCarrinho));
  }

  get total(): number {
    return this.itemsCarrinho.reduce((acc, item) => acc + item.preco * (item.quantidadeSelecionada || 1), 0);
  }

  get totalComFrete(): number {
    return this.total + this.freteSelecionado;
  }

  /** Dispara o cálculo automaticamente quando o CEP fica com 8 dígitos. */
  aoDigitarCep(valor: string): void {
    const digitos = (valor || '').replace(/\D/g, '');
    if (digitos.length === 8 && digitos !== this.ultimoCepCalculado) {
      this.calcularFrete();
    }
  }

  calcularFrete(): void {
    const digitos = (this.cep || '').replace(/\D/g, '');
    if (digitos.length !== 8) {
      this.erroFrete = 'Digite um CEP válido (8 dígitos).';
      return;
    }

    this.ultimoCepCalculado = digitos;
    this.erroFrete = '';
    this.carregandoFrete = true;
    this.opcoesFrete = [];
    this.freteSelecionado = 0;
    this.servicoSelecionado = '';
    this.cidadeUf = '';

    // Endereço (ViaCEP) — só pra exibir cidade/UF
    this.freteService.buscarEndereco(digitos).subscribe({
      next: (e) => { if (e && !e.erro) this.cidadeUf = `${e.localidade} - ${e.uf}`; },
      error: () => {}
    });

    // Cálculo do frete (backend -> Melhor Envio ou mock)
    const itens = this.itemsCarrinho.map(i => ({ preco: i.preco, quantidade: (i.quantidadeSelecionada || 1) }));
    this.freteService.calcular(digitos, itens).subscribe({
      next: (r) => {
        this.carregandoFrete = false;
        this.opcoesFrete = r.opcoes || [];
        this.freteMock = !!r.mock;
        if (this.opcoesFrete.length === 0) {
          this.erroFrete = 'Nenhuma opção de frete encontrada para este CEP.';
        }
      },
      error: () => {
        this.carregandoFrete = false;
        this.erroFrete = 'Não foi possível calcular o frete. Tente novamente.';
      }
    });
  }

  selecionarFrete(op: OpcaoFrete): void {
    this.freteSelecionado = op.preco;
    this.servicoSelecionado = op.servico;
    // Guarda o frete escolhido para o checkout usar (substitui a etapa manual de transportadora)
    localStorage.setItem('frete_checkout', JSON.stringify({
      nome: op.servico, valor: op.preco, prazo: `${op.prazo} dias úteis`
    }));
  }

  comprar(): void {
    alert('Obrigado pela preferência! Você será direcionado para o checkout.');
    this.router.navigate(['checkout']);
  }
}
