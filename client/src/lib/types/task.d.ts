export default interface Task {
    id: number,
    name: string;
    description: string;
    requiredBy: number;
    ended: number | null;
    priority: number;
    tags: number[]
}