import { TestBed } from '@angular/core/testing';
import { CarrinhoService } from '@services/carrinho.service';
import { IprodutoCarrinho } from '@interfaces/iproduto-carrinho';

describe('CarrinhoService', () => {
  let service: CarrinhoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CarrinhoService);
    localStorage.clear(); // limpa antes de cada teste
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should add product to cart', () => {
    const produto: IprodutoCarrinho = { id: 1, nome: 'Teste', descricao: 'Desc', preco: 10, descricaoPreco: '10 reais', imagem: '', desconto: 0, quantidade: 1 };
    service.adicionarAoCarrinho(produto);
    expect(service.obterCarrinho().length).toBe(1);
  });

  it('should remove product from cart', () => {
    const produto: IprodutoCarrinho = { id: 1, nome: 'Teste', descricao: 'Desc', preco: 10, descricaoPreco: '10 reais', imagem: '', desconto: 0, quantidade: 1 };
    service.adicionarAoCarrinho(produto);
    service.removerProdutoCarrinho(1);
    expect(service.obterCarrinho().length).toBe(0);
  });
});
