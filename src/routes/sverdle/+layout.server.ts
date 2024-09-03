import { redirect } from "@sveltejs/kit";
import type { PageServerLoad, Actions } from "./$types";

export const load: PageServerLoad = async (event) => {
    if (!event.locals.user) redirect(302, "/login");
    console.log("ALlowed in ", event.locals.user);
    return {
        username: event.locals.user.username
    };
};
