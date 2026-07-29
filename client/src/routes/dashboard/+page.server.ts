import { PUBLIC_API_URL } from "$env/static/public";
import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from './$types';
import type Task from "$lib/types/task";
import type Tag from "$lib/types/tag";

export const load:PageServerLoad = async ({fetch}) => {
    const taskResponse = await fetch(`${PUBLIC_API_URL}/task/`);
    const tagResponse = await fetch(`${PUBLIC_API_URL}/tag`);
    if(!tagResponse.ok || !taskResponse.ok){
        redirect(307, "/");
    }
    const [taskData, tagData]:[Task[], Tag[]] =  await Promise.all([taskResponse.json(), tagResponse.json()]);
    
    return {
        tasks: taskData,
        tags: tagData
    };
}