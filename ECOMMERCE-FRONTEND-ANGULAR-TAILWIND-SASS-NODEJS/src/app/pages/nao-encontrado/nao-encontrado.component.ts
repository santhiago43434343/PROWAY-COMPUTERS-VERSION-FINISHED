import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-nao-encontrado',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './nao-encontrado.component.html',
  styleUrls: ['./nao-encontrado.component.scss']
})
export class NaoEncontradoComponent {

  constructor(private router: Router) {}

  voltarHome(): void {
    this.router.navigate(['/']); // rota da HomeComponent
  }
}
