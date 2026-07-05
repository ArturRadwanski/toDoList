import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load:PageServerLoad = async ({fetch}) => {
    const response = await fetch("/tasks")
}