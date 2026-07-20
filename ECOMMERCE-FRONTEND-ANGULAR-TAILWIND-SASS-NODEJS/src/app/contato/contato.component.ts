
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule} from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-contato',
  standalone: true,
  imports: [RouterModule, ReactiveFormsModule, CommonModule ],
  /*CommonModule cuidara do *ngIf no "HTML" deve ser importado no ts   */
  templateUrl: './contato.component.html',
  styleUrls: ['./contato.component.scss']
})
export class ContatoComponent implements OnInit {

   /*Formulario reativo */
   formContato: FormGroup;

   // Construtor com FormBuilder
   constructor(private fb: FormBuilder) {
     this.formContato = this.fb.group({
     nome:["",[Validators.required, Validators.minLength(4)]],
     assunto: ["",[Validators.required,Validators.minLength(3)]],
     email: ["",[Validators.required, Validators.email]],
     telefone: ["",[Validators.required, Validators.pattern(/^\d{10,11}$/)]],
     mensagem: ["",[Validators.required,Validators.minLength(10)]]

    })
  }

 /* Metodo de ciclo de vida*/
 ngOnInit(): void {
   //logica de inicialização, se necessario
   
 }
 //metodo para reset de formulario apos envio
  enviarFormulario() {
    alert("a mensagem foi enviada");
    this.formContato.reset();

  }

  // Metodo para envio do formulario
  enviar(): void {
    if (this.formContato.valid) {
      console.log("Formulario enviado:", this.formContato.value);
      // Aqui voce pode adicionar logica de envio, como chamada HTTP
    } else {
      console.log("Formulario invalido");
      this.formContato.markAllAsTouched();
    }
  }










}
