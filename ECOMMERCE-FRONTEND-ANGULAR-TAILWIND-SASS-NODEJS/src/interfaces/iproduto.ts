export interface Iproduto {
  id: number;
  nome: string;
  descricao: string;
  preco: number;
  descricaoPreco: string;
  imagem: string;
  desconto?: number;   // opcional
  quantidade: number;  // estoque disponível
  quantidadeSelecionada?: number;
}
