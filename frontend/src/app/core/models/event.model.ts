export interface Event {
  _id: string;
  title: string;
  date: Date;
  location: string;
  skillsRequired: string[];
  type: 'event' | 'job';
  associationId?: {
    _id: string;
    name: string;
    contact: string;
  };
  participants?: {
    _id: string;
    userId: { _id: string; name: string; email: string };
  }[];
  pendingApplicants?: {
    _id: string;
    userId: { _id: string; name: string; email: string };
  }[];
}
