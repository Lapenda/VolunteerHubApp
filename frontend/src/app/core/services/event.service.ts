import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, of, catchError } from 'rxjs';
import { Event } from '../models/event.model';
import { EventDto, EventSearchDto } from '../dtos/event.dto';
import { Association } from '../models/association.model';

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

@Injectable({
  providedIn: 'root',
})
export class EventService {
  private apiUrl = 'http://localhost:5500/api/v1/events';
  private volunteerApiUrl = 'http://localhost:5500/api/v1/volunteers';
  private associationApiUrl = 'http://localhost:5500/api/v1/associations';

  constructor(private http: HttpClient) {}

  createEvent(event: EventDto): Observable<Event> {
    return this.http.post<Event>(this.apiUrl, event);
  }

  getEvent(eventId: string): Observable<Event> {
    return this.http
      .get<ApiResponse<Event>>(`${this.apiUrl}/${eventId}`)
      .pipe(map((response) => response.data));
  }

  updateEvent(event: EventDto): Observable<Event> {
    return this.http.put<Event>(`${this.apiUrl}/${event.eventId}`, event);
  }

  deleteEvent(
    eventId: string,
  ): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(
      `${this.apiUrl}/${eventId}`,
    );
  }

  searchEvents(filters: EventSearchDto): Observable<Event[]> {
    let params = new HttpParams();
    if (filters.location) params = params.set('location', filters.location);
    if (filters.skills) params = params.set('skills', filters.skills.join(','));
    if (filters.date) params = params.set('date', filters.date.toISOString());
    if (filters.type) params = params.set('type', filters.type);

    return this.http
      .get<ApiResponse<Event[]>>(this.apiUrl, { params })
      .pipe(map((response) => response.data));
  }

  registerForEvent(
    eventId: string,
  ): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(
      `${this.apiUrl}/${eventId}/register`,
      {},
    );
  }

  applyForJob(
    eventId: string,
  ): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(
      `${this.apiUrl}/${eventId}/apply`,
      {},
    );
  }

  approveOrRejectApplication(
    eventId: string,
    volunteerId: string,
    action: 'approve' | 'reject',
  ): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(
      `${this.apiUrl}/${eventId}/approve-reject`,
      { eventId, volunteerId, action },
    );
  }

  getVolunteerId(userId: string): Observable<string | null> {
    return this.http
      .get<
        ApiResponse<{ _id: string }>
      >(`${this.volunteerApiUrl}/by-user/${userId}`)
      .pipe(
        map((response) => response.data?._id || null),

        catchError((error) => {
          console.error('Error fetching volunteer ID:', error);
          return of(null);
        }),
      );
  }

  followAssociation(
    associationId: string,
  ): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(
      `${this.associationApiUrl}/${associationId}/follow`,
      {},
    );
  }

  unfollowAssociation(
    associationId: string,
  ): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(
      `${this.associationApiUrl}/${associationId}/follow`,
    );
  }

  getAssociation(associationId: string): Observable<Association> {
    return this.http
      .get<
        ApiResponse<Association>
      >(`${this.associationApiUrl}/${associationId}`)
      .pipe(map((response) => response.data));
  }
}
