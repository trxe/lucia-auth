import { redirect } from "@sveltejs/kit";
import { generateCodeVerifier, generateState } from "arctic";
import { discord } from "$lib/server/auth";

import type { RequestEvent } from "@sveltejs/kit";

export async function GET(event: RequestEvent): Promise<Response> {
    const state = generateState();

    const url = await discord.createAuthorizationURL(state, {
        scopes: ['identify', 'email']
    });
    console.log(url);

    event.cookies.set("discord_oauth_state", state, {
        path: "/",
        secure: import.meta.env.PROD,
        httpOnly: true,
        maxAge: 60 * 10,
        sameSite: "lax"
    });

    redirect(302, url.toString());

}
