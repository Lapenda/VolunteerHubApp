export interface EventDto {
  eventId?: string | null;
  title: string;
  date: Date;
  location: string;
  skillsRequired?: string[];
  associationId: string;
}

export interface EventSearchDto {
  location?: string;
  skills?: string[];
  date?: Date;
}
