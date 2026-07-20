import { Injectable } from '@angular/core';
import { Iproduto } from '../../interfaces/iproduto';
import { produtos } from '../../interfaces/produtos';

@Injectable({
  providedIn: 'root'
})
export class ProdutosService {
  getPerifericos(): Iproduto[] {
    return produtos.filter(p => p.id >= 1 && p.id <= 15);
  }

  getServidores(): Iproduto[] {
    return produtos.filter(p => p.id >= 16 && p.id <= 30);
  }

  getById(id: number): Iproduto | undefined {
    return produtos.find(p => p.id === id);
  }
}
