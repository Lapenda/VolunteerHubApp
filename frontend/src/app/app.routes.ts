import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { SignUpComponent } from './sign-up/sign-up.component';
import { HomeComponent } from './home/home.component';
import { MainLayoutComponent } from './main-layout/main-layout.component';
import { ProfileComponent } from './profile/profile.component';
import { InboxComponent } from './inbox/inbox.component';

export const routes: Routes = [
  {
    path: 'sign-in',
    component: LoginComponent,
    data: { title: 'VolunteerHub | Sign In' },
  },
  {
    path: 'sign-up',
    component: SignUpComponent,
    data: { title: 'VolunteerHub | Sign Up' },
  },
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        component: HomeComponent,
        data: { title: 'VolunteerHub | Home' },
      },
      {
        path: 'profile',
        component: ProfileComponent,
        data: { title: 'VolunteerHub | Profile' },
      },
      {
        path: 'inbox',
        component: InboxComponent,
        data: { title: 'VolunteerHub | Inbox' },
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
