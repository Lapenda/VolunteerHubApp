export interface Availability {
  start: Date;
  end: Date;
}

export interface User {
  id: string;
  name: string;
  email: string;
  userRole: 'volunteer' | 'organization';
  skills?: string[];
  availability?: Availability[];
  association?: {
    name: string;
    description?: string;
    contact: string;
  };
}
