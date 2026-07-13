import { PUBLIC_API_URL } from "$env/static/public";
import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from './$types';
import type Task from "$lib/types/task";
import type Tag from "$lib/types/tag";

export const load:PageServerLoad = async ({fetch}) => {
    const taskResponse = await fetch(`${PUBLIC_API_URL}/task/`);
    const tagResponse = await fetch(`${PUBLIC_API_URL}/task/tag`);
    if(!tagResponse.ok || !taskResponse.ok){
        redirect(300, "/");
    }
    const taskData:Task[] = await taskResponse.json();
    const tagData:Tag[] = await tagResponse.json();
    
    return {
        tasks: taskData,
        tags: tagData
    };
}