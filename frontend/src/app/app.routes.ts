import { Routes } from '@angular/router';
import { MainLayoutComponent } from './features/layout/main-layout/main-layout.component';

export const routes: Routes = [
  {
    path: 'sign-in',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(
        (m) => m.LoginComponent,
      ),
    data: { title: 'VolunteerHub | Sign In' },
  },
  {
    path: 'sign-up',
    loadComponent: () =>
      import('./features/auth/sign-up/sign-up.component').then(
        (m) => m.SignUpComponent,
      ),
    data: { title: 'VolunteerHub | Sign Up' },
  },
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/home/home.component').then((m) => m.HomeComponent),
        data: { title: 'VolunteerHub | Home' },
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/profile/profile.component').then(
            (m) => m.ProfileComponent,
          ),
        data: { title: 'VolunteerHub | Profile' },
      },
      {
        path: 'inbox',
        loadComponent: () =>
          import('./features/inbox/inbox.component').then(
            (m) => m.InboxComponent,
          ),
        data: { title: 'VolunteerHub | Inbox' },
      },
      {
        path: 'events',
        loadComponent: () =>
          import('./features/events/event-search/event-search.component').then(
            (m) => m.EventSearchComponent,
          ),
        data: { title: 'VolunteerHub | Events' },
      },
      {
        path: 'events/create',
        loadComponent: () =>
          import('./features/events/event-create/event-create.component').then(
            (m) => m.EventCreateComponent,
          ),
        data: { title: 'VolunteerHub | Create Event' },
      },
      {
        path: 'events/edit/:eventId',
        loadComponent: () =>
          import('./features/events/event-edit/event-edit.component').then(
            (m) => m.EventEditComponent,
          ),
        data: { title: 'VolunteerHub | Edit Event' },
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
