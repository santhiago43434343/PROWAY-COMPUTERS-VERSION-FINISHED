import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class NotificacaoService {
  constructor(private snackBar: MatSnackBar) {}

  // Exibe mensagem no topo da tela
  notificar(mensagem: string): void {
    this.snackBar.open(mensagem, 'OK', {
      duration: 2000,
      verticalPosition: 'top',
      horizontalPosition: 'center',
    });
  }
}
