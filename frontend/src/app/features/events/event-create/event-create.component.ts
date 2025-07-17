import { Component } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { EventService } from '../../../core/services/event.service';
import { AuthService } from '../../../core/services/auth.service';
import { EventDto } from '../../../core/dtos/event.dto';

@Component({
  selector: 'app-event-create',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule, CommonModule, TranslateModule],
  templateUrl: './event-create.component.html',
  styleUrls: ['./event-create.component.css'],
})
export class EventCreateComponent {
  eventForm = new FormGroup({
    title: new FormControl<string>('', [
      Validators.required,
      Validators.minLength(2),
    ]),
    date: new FormControl<string>('', [Validators.required]),
    location: new FormControl<string>('', [Validators.required]),
    skillsRequired: new FormControl<string>(''),
    type: new FormControl<'event' | 'job'>('event', [Validators.required]),
  });

  errorMessage: string | null = null;

  ngOnInit(): void {
    this.loadVolunteerId();
  }

  constructor(
    private eventService: EventService,
    private authService: AuthService,
    private router: Router,
  ) {}

  loadVolunteerId() {
    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        if (user && user.userRole === 'volunteer') {
          this.router.navigate(['/events']);
        }
      },
      error: (error) => {
        console.error('Error getting current user:', error);
        this.router.navigate(['/']);
      },
    });
  }

  onSubmit() {
    if (this.eventForm.valid) {
      this.authService.getCurrentUser().subscribe({
        next: (user) => {
          if (!user) {
            this.errorMessage = 'EVENTS.NOT_AUTHENTICATED';
            this.router.navigate(['/sign-in']);
            return;
          }
          if (user.userRole !== 'organization') {
            this.errorMessage = 'EVENTS.ORGANIZATION_REQUIRED';
            return;
          }
          const eventData: EventDto = {
            title: this.eventForm.value.title!,
            date: new Date(this.eventForm.value.date!),
            location: this.eventForm.value.location!,
            skillsRequired:
              this.eventForm.value.skillsRequired
                ?.split(',')
                .map((s) => s.trim())
                .filter((s) => s) || [],
            associationId: user.id,
            type: this.eventForm.value.type!,
          };
          this.eventService.createEvent(eventData).subscribe({
            next: () => this.router.navigate(['/events']),
            error: (error) => {
              if (error.status === 401) {
                this.errorMessage = 'EVENTS.NOT_AUTHENTICATED';
                this.authService.logout();
              } else {
                this.errorMessage = error.message || 'EVENTS.CREATION_FAILED';
              }
            },
          });
        },
        error: () => {
          this.errorMessage = 'EVENTS.NOT_AUTHENTICATED';
          this.router.navigate(['/sign-in']);
        },
      });
    } else {
      this.eventForm.markAllAsTouched();
    }
  }
}
