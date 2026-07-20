import { Iproduto } from '@interfaces/iproduto';

export interface IprodutoCarrinho extends Iproduto {
  quantidadeSelecionada: number; // quantidade escolhida no carrinho
}
