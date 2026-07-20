import { TestBed } from '@angular/core/testing';
import { NotificacaoService } from '@services/notificacao.service';
import { MatSnackBarModule } from '@angular/material/snack-bar';

describe('NotificacaoService', () => {
  let service: NotificacaoService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MatSnackBarModule]
    });
    service = TestBed.inject(NotificacaoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call notificar', () => {
    spyOn(service as any, 'snackBar').and.callThrough();
    service.notificar('Mensagem de teste');
    expect(service).toBeTruthy();
  });
});
