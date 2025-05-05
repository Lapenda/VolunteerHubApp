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
import { OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsService } from '../services/settings.service';

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, RouterModule, CommonModule],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.css',
})
export class MainLayoutComponent implements OnInit {
  token: string | null = '';
  isSignedIn: boolean = false;
  currentLang: string = 'en';

  constructor(
    private router: Router,
    private titleService: Title,
    private settingsService: SettingsService,
  ) {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        const route = this.getChildRoute(this.router.routerState.root);
        const title = route.snapshot.data['title'] || 'VolunteerHub';
        this.titleService.setTitle(title);
      });
    this.currentLang = this.settingsService.getSettings().lang;
  }

  private getChildRoute(route: ActivatedRoute): ActivatedRoute {
    while (route.firstChild) {
      route = route.firstChild;
    }
    return route;
  }

  ngOnInit(): void {
    this.token = localStorage.getItem('token');
    if (this.token) {
      this.isSignedIn = true;
    }
  }

  signOut() {
    localStorage.clear();
    console.log('Signed out');
    this.isSignedIn = false;
  }

  signIn() {
    this.router.navigate(['/sign-in']);
  }

  switchLanguage(lang: 'hr' | 'en') {
    this.settingsService.setLanguage(lang);
    this.currentLang = lang;
  }
}
