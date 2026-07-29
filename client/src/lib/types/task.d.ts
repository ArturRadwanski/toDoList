export default interface Task {
    id: number,
    name: string;
    description: string;
    requiredBy: number;
    ended: boolean;
    priority: number;
    tags: number[]
}