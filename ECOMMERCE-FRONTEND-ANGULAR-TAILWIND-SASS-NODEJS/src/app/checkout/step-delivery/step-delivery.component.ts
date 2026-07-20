import { Component, Output, EventEmitter, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-step-delivery',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './step-delivery.component.html',
  styleUrls: ['./step-delivery.component.scss']
})
export class StepDeliveryComponent implements OnInit {
  @Input() initial: any;            // entrega já escolhida (para retomar a compra)
  @Output() deliveryData = new EventEmitter<any>();
  @Output() next = new EventEmitter<void>();
  @Output() back = new EventEmitter<void>();

  options = [
    { nome: 'PAC', valor: 50.00, prazo: '5 dias úteis' },
    { nome: 'SEDEX', valor: 120.00, prazo: '2 dias úteis' },
    { nome: 'Jadlog', valor: 80.00, prazo: '4 dias úteis' },
    { nome: 'Loggi', valor: 60.00, prazo: '3 dias úteis' },
    { nome: 'Total Express', valor: 70.00, prazo: '6 dias úteis' }
  ];

  selecionado: any = null;

  ngOnInit(): void {
    // Pré-seleciona a opção salva (combina pelo nome para o radio marcar)
    if (this.initial?.nome) {
      const achado = this.options.find(o => o.nome === this.initial.nome);
      if (achado) this.selecionado = achado;
    }
  }

  selecionar(opcao: any) {
    this.selecionado = opcao;
  }

  continuar() {
    if (this.selecionado) {
      this.deliveryData.emit(this.selecionado);
      this.next.emit();
    } else {
      alert('Por favor, selecione ao menos uma opção para prosseguir!');
    }
  }

  voltar() {
    this.back.emit();
  }
}
