import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'sobre-nos',
  imports: [CommonModule, RouterLink],
  standalone: true,
  templateUrl: './sobre-nos.component.html',
  styleUrl: './sobre-nos.component.scss'
})
export class SobreNosComponent {
  //Technologies
  tecnologias = [
    'Angular 17+', 'Ruby on Rails API', 'Docker', 'SASS & Tailwind', 'NodeJS', 'Apache Tomcat'

  ];
}
