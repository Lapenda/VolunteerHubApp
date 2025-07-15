import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  private readonly STORAGE_KEY = 'volunteerhub_settings';

  constructor(private translate: TranslateService) {
    const settings = this.getSettings();
    this.translate.setDefaultLang('en');
    this.translate.use(settings.lang).subscribe({
      error: (err) => {
        console.error('Failed to load translation:', err);
        this.translate.use('en');
      },
    });
  }

  getSettings(): { lang: string } {
    const settings = localStorage.getItem(this.STORAGE_KEY);
    return settings ? JSON.parse(settings) : { lang: 'en' };
  }

  setLanguage(lang: 'hr' | 'en') {
    this.translate.use(lang).subscribe({
      next: () => {
        const settings = this.getSettings();
        settings.lang = lang;
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(settings));
      },
      error: (err) => {
        console.error('Failed to switch language:', err);
        this.translate.use('en');
      },
    });
  }
}
