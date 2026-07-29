import { setContext, getContext } from 'svelte';
import type Task from '$lib/types/task';
import type Tag from '$lib/types/tag';

class DashboardState {
    tasks = $state<Task[]>([]);
    tags = $state<Tag[]>([]);

    activeTask = $state<Partial<Task> | null>(null); //Task which is currently edited/created. 
    // Window for edition is closed when it's equal to null; 

    constructor(initialTasks: Task[], initialTags: Tag[]) {
        this.tasks = initialTasks;
        this.tags = initialTags;
    }

    openCreateModal() {
        this.activeTask = {
            name: '',
            description: '',
            requiredBy: Date.now(),
            priority: 0,
            tags: [],
        }
    }

    openEditModal(task:Task) {
        this.activeTask = {...task} //shallow copy so the state isn't updated during edition 
    }

    closeModal() {
        this.activeTask = null;
    }

    addTask(newTask: Task) {
        this.tasks.push(newTask);
    }


    deleteTask(taskId: number) {
        const index = this.tasks.findIndex(t => t.id === taskId);
        if (index !== -1) {
            this.tasks.splice(index, 1); 
    }
    }

    addTag(newTag: Tag) {
        this.tags.push(newTag);
    }

    editTask(taskId:number, updates: Partial<Task>){
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            Object.assign(task, updates);
        }
    }
}

const DASHBOARD_KEY = Symbol('DASHBOARD_STATE');

export function initDashboardState(initialTasks: Task[], initialTags: Tag[]) {
    return setContext(DASHBOARD_KEY, new DashboardState(initialTasks, initialTags));
}

export function useDashboardState() {
    const state = getContext<DashboardState>(DASHBOARD_KEY);
    if (!state) {
        throw new Error('useDashboardState must be used within a component that initialized it!');
    }
    return state;
}