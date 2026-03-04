export enum Priority {
  high = 3,
  medium = 2,
  low = 1
}

export interface Task {
  id: number;
  name: string;
  description: string;
  requiredBy: Date;
  ended: Date | undefined;
  priority: Priority
}
