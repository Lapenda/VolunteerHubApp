import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { EventService } from '../../../core/services/event.service';
import { AuthService } from '../../../core/services/auth.service';
import { Event } from '../../../core/models/event.model';
import { EventSearchDto } from '../../../core/dtos/event.dto';
import { Router } from '@angular/router';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-event-search',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, TranslateModule],
  templateUrl: './event-search.component.html',
  styleUrls: ['./event-search.component.css'],
})
export class EventSearchComponent implements OnInit {
  searchForm = new FormGroup({
    location: new FormControl<string>(''),
    skills: new FormControl<string>(''),
    date: new FormControl<string>(''),
  });
  events: Event[] = [];
  errorMessage: string | null = null;
  successMessage: string | null = null;
  loggedInUsersId: string | null | undefined = null;
  userRole: 'volunteer' | 'organization' | null = null;
  followedAssociations: string[] = [];
  loggedInUser: User | null = null;

  constructor(
    private eventService: EventService,
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadUserData();
    this.searchEvents();
  }

  searchEvents() {
    const filters: EventSearchDto = {
      location: this.searchForm.value.location || undefined,
      skills:
        this.searchForm.value.skills
          ?.split(',')
          .map((s) => s.trim())
          .filter((s) => s) || undefined,
      date: this.searchForm.value.date
        ? new Date(this.searchForm.value.date)
        : undefined,
    };
    this.eventService.searchEvents(filters).subscribe({
      next: (events) => {
        this.events = events;
        console.log(this.events);
        this.errorMessage = null;
      },
      error: () => {
        this.errorMessage = 'EVENTS.SEARCH_FAILED';
      },
    });
  }

  loadUserData() {
    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        this.userRole = user ? user.userRole : null;
        this.loggedInUser = user;

        if (user && user.userRole === 'volunteer') {
          this.eventService.getVolunteerId(user.id).subscribe({
            next: (volunteerId) => {
              this.followedAssociations = user?.followedOrganizations || [];
              this.loggedInUsersId = volunteerId;
              console.log('Volunteer ID:', this.loggedInUsersId);
            },
            error: (error) => {
              console.error('Error loading volunteer ID:', error);
              this.loggedInUsersId = null;
            },
          });
        } else {
          this.loggedInUsersId = user?.association?._id;
        }
      },
      error: (error) => {
        console.error('Error getting current user:', error);
        this.loggedInUsersId = null;
        this.userRole = null;
      },
    });
  }

  isUserRegistered(event: Event): boolean {
    return this.loggedInUsersId
      ? event.participants?.includes(this.loggedInUsersId) || false
      : false;
  }

  editEvent(eventId: string) {
    this.router.navigate(['/events/edit', eventId]);
  }

  deleteEvent(eventId: string) {
    if (confirm('Are you sure you want to delete this event?')) {
      this.eventService.deleteEvent(eventId).subscribe({
        next: () => {
          this.successMessage = 'EVENTS.DELETE_SUCCESS';
          this.searchEvents();
        },
        error: (error) => {
          console.error('Delete event error:', error);
          this.errorMessage = error.error.message || 'EVENTS.DELETE_FAILED';
        },
      });
    }
  }

  register(eventId: string) {
    this.successMessage = null;
    if (!eventId) {
      console.error('Invalid event ID:', eventId);
      this.errorMessage = 'EVENTS.REGISTRATION_FAILED';
      return;
    }
    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        if (!user) {
          this.errorMessage = 'EVENTS.NOT_AUTHENTICATED';
          return;
        }
        if (user.userRole !== 'volunteer') {
          this.errorMessage = 'EVENTS.VOLUNTEER_REQUIRED';
          return;
        }
        this.eventService.registerForEvent(eventId).subscribe({
          next: (response) => {
            console.log('Registration successful:', response.message);
            this.errorMessage = null;
            this.successMessage = 'EVENTS.REGISTRATION_SUCCESS';
            this.searchEvents();
          },
          error: (error) => {
            console.error('Registration error:', error);
            if (error.status === 401) {
              this.errorMessage = 'EVENTS.NOT_AUTHENTICATED';
              this.authService.logout();
            } else if (error.status === 400) {
              this.errorMessage =
                error.error.message || 'EVENTS.REGISTRATION_FAILED';
            } else {
              this.errorMessage = 'EVENTS.REGISTRATION_FAILED';
            }
          },
        });
      },
      error: (error) => {
        console.error('Get current user error:', error);
        this.errorMessage = 'EVENTS.NOT_AUTHENTICATED';
        if (error.status === 401) {
          this.authService.logout();
        }
      },
    });
  }

  isFollowingAssociation(associationId: string): boolean {
    return this.followedAssociations.includes(associationId);
  }

  toggleFollow(associationId: string) {
    if (this.isFollowingAssociation(associationId)) {
      this.eventService.unfollowAssociation(associationId).subscribe({
        next: () => {
          this.followedAssociations = this.followedAssociations.filter(
            (id) => id !== associationId,
          );
          this.successMessage = 'ASSOCIATIONS.UNFOLLOW_SUCCESS';
        },
        error: (error) => {
          console.error('Unfollow error:', error);
          this.errorMessage =
            error.error.message || 'ASSOCIATIONS.UNFOLLOW_FAILED';
        },
      });
    } else {
      this.eventService.followAssociation(associationId).subscribe({
        next: () => {
          this.followedAssociations.push(associationId);
          this.successMessage = 'ASSOCIATIONS.FOLLOW_SUCCESS';
        },
        error: (error) => {
          console.error('Follow error:', error);
          this.errorMessage =
            error.error.message || 'ASSOCIATIONS.FOLLOW_FAILED';
        },
      });
    }
  }

  goToEvents() {
    this.router.navigate(['/events/create']);
  }
}
