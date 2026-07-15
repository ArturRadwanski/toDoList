import { setContext, getContext } from 'svelte';
import type Task from '$lib/types/task';
import type Tag from '$lib/types/tag';

class DashboardState {
    tasks = $state<Task[]>([]);
    tags = $state<Tag[]>([]);

    constructor(initialTasks: Task[], initialTags: Tag[]) {
        this.tasks = initialTasks;
        this.tags = initialTags;
    }

    addTask(newTask: Task) {
        this.tasks.push(newTask);
    }

    toggleTask(taskId: number) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task != null) {
            task.ended = Date.now();
        }
    }

    deleteTask(taskId: number) {
        this.tasks = this.tasks.filter(t => t.id !== taskId);
    }

    addTag(newTag: Tag) {
        this.tags.push(newTag);
    }

    editTask(taskId:number, updates: Partial<Task>){
        this.tasks = this.tasks.map(task => {
            if (task.id === taskId){
                return {...task, ...updates}
            }
            return task;
        })
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