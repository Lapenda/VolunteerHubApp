import { Component } from '@angular/core';
import { MainLayoutComponent } from './features/layout/main-layout/main-layout.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [MainLayoutComponent],
  template: ` <app-main-layout></app-main-layout> `,
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'VolunteerHub';
}
