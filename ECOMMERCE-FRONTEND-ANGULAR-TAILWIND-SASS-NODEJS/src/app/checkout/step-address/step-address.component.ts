import { Component, EventEmitter, Output, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-step-address',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './step-address.component.html',
  styleUrls: ['./step-address.component.scss']
})
export class StepAddressComponent implements OnInit {
  @Input() initial: any;            // dados já preenchidos (para retomar a compra)
  @Output() next = new EventEmitter<void>();
  @Output() back = new EventEmitter<void>();
  @Output() addressData = new EventEmitter<any>();

  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      rua: [''],
      numero: [''],
      cidade: [''],
      estado: ['']
    });
  }

  ngOnInit(): void {
    if (this.initial) {
      this.form.patchValue({
        rua: this.initial.rua || '',
        numero: this.initial.numero || '',
        cidade: this.initial.cidade || '',
        estado: this.initial.estado || ''
      });
    }
  }

  submit() {
    if (this.form.valid) {
      this.addressData.emit(this.form.value);
      this.next.emit();
    }
  }

  goBack() {
    this.back.emit();
  }
}
