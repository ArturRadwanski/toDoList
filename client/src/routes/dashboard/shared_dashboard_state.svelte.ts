import { setContext, getContext } from 'svelte';
import type Task from '$lib/types/task';
import type Tag from '$lib/types/tag';

class DashboardState {
    tasks = $state<Task[]>([]);
    tags = $state<Tag[]>([]);

    activeTask = $state<Partial<Task> | null>(null); //Task which is currently edited/created. 
    // Window for edition is closed when it's equal to null; 

    activeTag = $state<Tag | null>(null); //Tag which is currenttly created 

    removeTagsMode = $state<boolean>(false);
    
    selectedTask = $state<Task | null>(null);//Task which is currently displayed in detail

    constructor(initialTasks: Task[], initialTags: Tag[]) {
        this.tasks = initialTasks;
        this.tags = initialTags;
    }
    
    setRemoveTagsMode(mode:boolean){
        this.removeTagsMode = mode;
    }
    openDetailsModal(task: Task) {
        this.selectedTask = task;
    }

    closeDetailsModal() {
        this.selectedTask = null;
    }

    openTagModal(tag?: Tag) {

        this.activeTag = tag ? tag : {name: "Tag",
            hue: Math.random() * 359,
            saturation: Math.random() * 100,
            lightness: Math.random() * 100,
            id: -1 // placeholder id
        }

    }

    closeTagModal() {
        this.activeTag = null;
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
            const deleted = this.tasks.splice(index, 1);
            if(deleted[0].id === this.activeTask?.id){
                this.closeModal();
            } 
            if(deleted[0].id === this.selectedTask?.id){
                this.closeDetailsModal();
            }
    }
    }

    addTag(newTag: Tag) {
        this.tags.push(newTag);
    }

    deleteTag(tagId: number){
        const index = this.tags.findIndex(t => t.id === tagId);
        if(index !== -1) {
            this.tags.splice(index, 1);
        }

    }

    removeTagFromTasks(tagId:number){
        this.tasks.forEach(task => {
            const index = task.tags.findIndex(t => t === tagId);
            if(index !== -1){
                task.tags.splice(index, 1);
            }
        });
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