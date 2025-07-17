import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EventService } from '../../../core/services/event.service';
import { AuthService } from '../../../core/services/auth.service';
import { Association } from '../../../core/models/association.model';
import { Event } from '../../../core/models/event.model';

@Component({
  selector: 'app-association-profile',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './association-profile.component.html',
  styleUrls: ['./association-profile.component.css'],
})
export class AssociationProfileComponent implements OnInit {
  association: Association | null = null;
  events: Event[] = [];
  jobs: Event[] = [];
  errorMessage: string | null = null;
  successMessage: string | null = null;
  userRole: 'volunteer' | 'organization' | null = null;
  associationId: string | null = null;
  loggedInUsersId: string | null | undefined = null;

  constructor(
    private eventService: EventService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.associationId = this.route.snapshot.paramMap.get('associationId');
    if (this.associationId) {
      this.loadAssociation();
    }
    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        this.userRole = user ? user.userRole : null;
        this.loggedInUsersId =
          user?.userRole === 'volunteer' ? user.id : user?.association?._id;
      },
    });
  }

  loadAssociation() {
    if (this.associationId) {
      this.eventService.getAssociation(this.associationId).subscribe({
        next: (association) => {
          this.association = association;
          this.events = association.events || [];
          this.jobs = association.jobs || [];
          this.errorMessage = null;
        },
        error: (error) => {
          console.error('Error loading association:', error);
          this.errorMessage = 'ASSOCIATIONS.LOAD_FAILED';
        },
      });
    }
  }

  approveOrRejectApplication(
    eventId: string,
    volunteerId: string,
    action: 'approve' | 'reject',
  ) {
    this.eventService
      .approveOrRejectApplication(eventId, volunteerId, action)
      .subscribe({
        next: () => {
          this.successMessage =
            action === 'approve'
              ? 'JOBS.APPROVE_SUCCESS'
              : 'JOBS.REJECT_SUCCESS';
          this.loadAssociation();
        },
        error: (error) => {
          console.error(`${action} error:`, error);
          this.errorMessage =
            error.error.message ||
            (action === 'approve'
              ? 'JOBS.APPROVE_FAILED'
              : 'JOBS.REJECT_FAILED');
        },
      });
  }

  getParticipantNames(
    participants:
      | { _id: string; userId: { _id: string; name: string; email: string } }[]
      | undefined,
  ): string {
    if (!participants || participants.length === 0) {
      return 'None';
    }
    participants.forEach((element) => {
      console.log(element);
    });
    //console.log(participants);
    return participants.map((p) => p.userId?.name || 'Unknown').join(', ');
  }

  viewJob(eventId: string) {
    // Placeholder for job-specific group chat
    console.log('View job:', eventId);
  }
}
