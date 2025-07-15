import { Availability } from '../models/user.model';

export interface SignUpDto {
  name: string;
  email: string;
  password: string;
  userRole: 'volunteer' | 'organization';
  association?: {
    name: string;
    description?: string;
    contact: string;
  };
  skills?: string[];
  availability?: Availability[];
}
