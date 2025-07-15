export interface Availability {
  start: Date;
  end: Date;
}

export class Volunteer {
  private id: string;
  private userId: string;
  private skills: string[];
  private availability: Availability[];

  constructor(
    id: string,
    userId: string,
    skills: string[] = [],
    availability: Availability[] = [],
  ) {
    this.id = id;
    this.userId = userId;
    this.skills = skills;
    this.availability = availability;
  }

  public getId(): string {
    return this.id;
  }

  public getUserId(): string {
    return this.userId;
  }

  public getSkills(): string[] {
    return [...this.skills];
  }

  public getAvailability(): Availability[] {
    return [...this.availability];
  }

  public addSkill(skill: string): void {
    if (skill && this.skills.includes(skill)) {
      this.skills.push(skill);
    }
  }

  public removeSkill(skill: string): void {
    this.skills = this.skills.filter((s) => s !== skill);
  }

  public addAvailability(start: Date, end: Date): void {
    if (start < end) {
      this.availability.push({ start, end });
    }
  }

  public hasSkill(skill: string): boolean {
    return this.skills.includes(skill);
  }
}
