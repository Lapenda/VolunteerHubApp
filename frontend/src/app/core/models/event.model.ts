export interface Event {
  _id: string;
  title: string;
  date: Date;
  location: string;
  skillsRequired: string[];
  associationId?: {
    _id: string;
    name: string;
    contact: string;
  };
  participants?: string[];
}
