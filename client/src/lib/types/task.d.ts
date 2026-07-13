export default interface Task {
    name: string;
    description: string;
    requiredBy: number;
    ended: number | null;
    priority: number
}