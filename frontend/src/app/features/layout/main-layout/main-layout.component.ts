import { Component, OnInit } from '@angular/core';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { filter } from 'rxjs';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../../core/services/auth.service';
import { SettingsService } from '../../../core/services/settings.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterModule, CommonModule, TranslateModule],
  templateUrl: `./main-layout.component.html`,
  styleUrls: [`./main-layout.component.css`],
})
export class MainLayoutComponent implements OnInit {
  isSignedIn: boolean = false;
  currentLang: string = 'en';

  constructor(
    private router: Router,
    private titleService: Title,
    private authService: AuthService,
    private settingsService: SettingsService,
  ) {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        const title =
          this.router.routerState.snapshot.root.data['title'] || 'VolunteerHub';
        this.titleService.setTitle(title);
      });
    this.currentLang = this.settingsService.getSettings().lang;
  }

  ngOnInit(): void {
    this.isSignedIn = this.authService.isAuthenticated();
    this.authService.getCurrentUser().subscribe((user) => {
      this.isSignedIn = !!user;
    });
  }

  signOut() {
    this.authService.logout();
  }

  signIn() {
    this.router.navigate(['/sign-in']);
  }

  switchLanguage(lang: 'hr' | 'en') {
    this.settingsService.setLanguage(lang);
    this.currentLang = lang;
  }
}
