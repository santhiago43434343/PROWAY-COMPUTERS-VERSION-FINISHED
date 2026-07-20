import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { produtos } from '../../interfaces/produtos';
import { Iproduto } from '../../interfaces/iproduto';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-buscar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './buscar.component.html',
  styleUrls: ['./buscar.component.scss']
})
export class BuscarComponent implements OnInit {
  resultados: Iproduto[] = [];
  termoBusca: string = '';

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    // escuta os queryParams enviados pelo Header
    this.route.queryParams.subscribe(params => {
      this.termoBusca = params['buscar'] || '';
      this.filtrarResultados();
    });
  }

  filtrarResultados(): void {
    const termo = this.termoBusca.toLowerCase();

    // todos os produtos
    const todosProdutos = produtos;

    // servidores são os produtos com id 16–30
    const servidores = produtos.filter(p => p.id >= 16 && p.id <= 30);

    // regra simples: se o termo contém "servidor", busca só nos servidores
    if (termo.includes('servidor')) {
      this.resultados = servidores.filter(s =>
        s.nome.toLowerCase().includes(termo)
      );
    } else {
      this.resultados = todosProdutos.filter(p =>
        p.nome.toLowerCase().includes(termo)
      );
    }
  }

  adicionarAoCarrinho(produto: Iproduto): void {
    alert(`${produto.nome} foi adicionado ao carrinho!`);
    console.log('Item adicionado ao carrinho', produto);
  }
}

