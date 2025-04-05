import { Component } from '@angular/core';
import {
  RouterOutlet,
  RouterModule,
  NavigationEnd,
  Router,
  ActivatedRoute,
} from '@angular/router';
import { Title } from '@angular/platform-browser';
import { filter } from 'rxjs';

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, RouterModule],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.css',
})
export class MainLayoutComponent {
  constructor(
    private router: Router,
    private titleService: Title,
  ) {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        const route = this.getChildRoute(this.router.routerState.root);
        const title = route.snapshot.data['title'] || 'VolunteerHub';
        this.titleService.setTitle(title);
      });
  }

  private getChildRoute(route: ActivatedRoute): ActivatedRoute {
    while (route.firstChild) {
      route = route.firstChild;
    }
    return route;
  }

  protected signOut() {}
}
