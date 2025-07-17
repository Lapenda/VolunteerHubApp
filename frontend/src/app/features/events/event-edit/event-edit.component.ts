import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Router, ActivatedRoute } from '@angular/router';
import { EventService } from '../../../core/services/event.service';
import { AuthService } from '../../../core/services/auth.service';
import { EventDto } from '../../../core/dtos/event.dto';

@Component({
  selector: 'app-event-edit',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, TranslateModule],
  templateUrl: './event-edit.component.html',
  styleUrls: ['./event-edit.component.css'],
})
export class EventEditComponent implements OnInit {
  eventForm = new FormGroup({
    title: new FormControl<string>('', [
      Validators.required,
      Validators.minLength(2),
    ]),
    date: new FormControl<string>('', [Validators.required]),
    location: new FormControl<string>('', [Validators.required]),
    skillsRequired: new FormControl<string>(''),
    type: new FormControl<'event' | 'job'>('event', Validators.required),
  });
  errorMessage: string | null = null;
  eventId: string | null = null;

  constructor(
    private eventService: EventService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.eventId = this.route.snapshot.paramMap.get('eventId');
    if (this.eventId) {
      this.eventService.getEvent(this.eventId).subscribe({
        next: (event) => {
          const formattedDate = new Date(event.date)
            .toISOString()
            .split('T')[0];
          this.eventForm.patchValue({
            title: event.title,
            date: formattedDate,
            location: event.location,
            skillsRequired: event.skillsRequired.join(', '),
            type: event.type,
          });
        },
        error: (error) => {
          console.error('Error fetching event:', error);
          this.errorMessage = 'EVENTS.LOAD_FAILED';
        },
      });
    }
  }

  onSubmit() {
    if (this.eventForm.valid && this.eventId) {
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
            eventId: this.eventId,
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
          this.eventService.updateEvent(eventData).subscribe({
            next: () => {
              this.router.navigate(['/events']);
            },
            error: (error) => {
              console.error('Update event error:', error);
              if (error.status === 401) {
                this.errorMessage = 'EVENTS.NOT_AUTHENTICATED';
                this.authService.logout();
              } else {
                this.errorMessage =
                  error.error.message || 'EVENTS.UPDATE_FAILED';
              }
            },
          });
        },
        error: (error) => {
          console.error('Get current user error:', error);
          this.errorMessage = 'EVENTS.NOT_AUTHENTICATED';
          this.router.navigate(['/sign-in']);
        },
      });
    } else {
      this.eventForm.markAllAsTouched();
    }
  }
}
