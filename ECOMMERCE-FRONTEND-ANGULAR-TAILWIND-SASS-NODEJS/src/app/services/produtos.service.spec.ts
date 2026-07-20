import { TestBed } from '@angular/core/testing';
import { ProdutosService } from '@services/produtos.service';

describe('ProdutosService', () => {
  let service: ProdutosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProdutosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return all products', () => {
    const produtos = service.getAll();
    expect(produtos.length).toBeGreaterThan(0);
  });

  it('should return product by id', () => {
    const produto = service.getById(1);
    expect(produto).toBeDefined();
  });

  it('should return undefined for invalid id', () => {
    const produto = service.getById(999);
    expect(produto).toBeUndefined();
  });
});
