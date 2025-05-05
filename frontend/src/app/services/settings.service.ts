import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  private readonly STORAGE_KEY = 'volunteerhub_settings';

  getSettings(): { lang: string } {
    const settings = localStorage.getItem(this.STORAGE_KEY);
    return settings ? JSON.parse(settings) : { lang: 'en' }; //Deafult
  }

  saveSettings(settings: { lang: string }) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(settings));
  }

  setLanguage(lang: 'hr' | 'en') {
    const settings = this.getSettings();
    settings.lang = lang;
    this.saveSettings(settings);
  }

  constructor() {}
}
