import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
@Component({
  selector: 'app-frete',
  standalone: true,
  imports: [CommonModule, RouterModule, HttpClientModule],
  templateUrl: './frete.component.html',
  styleUrls: ['./frete.component.scss'],
})
export class FreteComponent {

}
