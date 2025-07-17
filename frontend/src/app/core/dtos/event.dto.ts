export interface EventDto {
  eventId?: string | null;
  title: string;
  date: Date;
  location: string;
  skillsRequired?: string[];
  associationId: string;
  type: 'event' | 'job';
}

export interface EventSearchDto {
  location?: string;
  skills?: string[];
  date?: Date;
  type?: 'event' | 'job';
}
