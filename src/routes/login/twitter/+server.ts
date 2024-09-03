import { redirect } from "@sveltejs/kit";
import { generateCodeVerifier, generateState } from "arctic";
import { CODE_VERIFIER, twitter } from "$lib/server/auth";

import type { RequestEvent } from "@sveltejs/kit";

export async function GET(event: RequestEvent): Promise<Response> {
    const state = generateState();

    const url = await twitter.createAuthorizationURL(state, CODE_VERIFIER, {
        scopes: ['users.read tweet.read offline.access']
    });

    event.cookies.set("twitter_oauth_state", state, {
        path: "/",
        secure: import.meta.env.PROD,
        httpOnly: true,
        maxAge: 60 * 10,
        sameSite: "lax"
    });
    console.log(event.cookies.get("twitter_oauth_state"));

    redirect(302, url.toString());
}
