export enum Priority {
  high = 2,
  medium = 1,
  low = 0
}

export interface Task {
  id: number;
  name: string;
  tags: string[];
  description: string;
  requiredBy: number;
  ended: number | null; // both dates are kept as unix timestamps
  priority: Priority
}
