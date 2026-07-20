import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CartService } from '@services/cart.service';
import { Iproduto } from '@interfaces/iproduto';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent {
  itemsCarrinho: Iproduto[] = [];
  subtotal = 0;
  cep: string = '';

  fretePAC: number = 0;
  prazoPAC: string = '';
  freteSEDEX: number = 0;
  prazoSEDEX: string = '';
  freteSelecionado: number = 0;

  constructor(private cartService: CartService, private http: HttpClient) {}

  ngOnInit() {
    this.cartService.items$.subscribe(items => {
      this.itemsCarrinho = items;
      this.calcularSubtotal();
    });
  }

  calcularSubtotal() {
    this.subtotal = this.itemsCarrinho.reduce(
      (acc, item) => acc + item.preco * ((item as any).quantidadeSelecionada || (item as any).quantidade || 1),
      0
    );
  }

  calcularFrete() {
    const url = 'https://www.cepcerto.com/api/frete';

    const body = {
      cepOrigem: '11740000', // CEP da loja
      cepDestino: this.cep,
      peso: 1,
      comprimento: 20,
      altura: 10,
      largura: 15,
      servicos: ['PAC', 'SEDEX']
    };

    this.http.post<any>(url, body).subscribe(res => {
      const pac = res.servicos.find((s: any) => s.nome === 'PAC');
      const sedex = res.servicos.find((s: any) => s.nome === 'SEDEX');

      if (pac) {
        this.fretePAC = pac.valor;
        this.prazoPAC = pac.prazo;
      }
      if (sedex) {
        this.freteSEDEX = sedex.valor;
        this.prazoSEDEX = sedex.prazo;
      }
    });
  }

  selecionarFrete(valor: number) {
    this.freteSelecionado = valor;
  }

  get totalComFrete() {
    return this.subtotal + this.freteSelecionado;
  }
}
