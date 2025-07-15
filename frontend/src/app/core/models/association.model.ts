export interface Association {
  _id: string;
  name: string;
  contact: string;
  description: string;
  followers?: { _id: string; name: string; email: string }[];
}
