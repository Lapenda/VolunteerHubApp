export class Association {
  private id: string;
  private userId: string;
  private name: string;
  private description: string | undefined;
  private contact: string;

  constructor(
    id: string,
    userId: string,
    name: string,
    contact: string,
    description?: string,
  ) {
    this.id = id;
    this.userId = userId;
    this.name = name;
    this.contact = contact;
    this.description = description;
  }

  // Getters
  public getId(): string {
    return this.id;
  }

  public getName(): string {
    return this.name;
  }

  public getContact(): string {
    return this.contact;
  }

  public getDescription(): string | undefined {
    return this.description;
  }

  // Methods
  public updateDescription(newDescription: string): void {
    this.description = newDescription;
  }

  public updateContact(newContact: string): void {
    if (/\S+@\S+\.\S+/.test(newContact)) {
      this.contact = newContact;
    }
  }

  public getSummary(): string {
    return `${this.name}: ${this.description || 'No description'}`;
  }
}
