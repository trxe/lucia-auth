import { generateCodeVerifier, OAuth2RequestError } from "arctic";
import { generateIdFromEntropySize } from "lucia";
import { twitter, lucia, CODE_VERIFIER } from "$lib/server/auth";

import type { RequestEvent } from "@sveltejs/kit";
import { users_db } from "$lib/db/users";

export async function GET(event: RequestEvent): Promise<Response> {
    const code = event.url.searchParams.get("code");
    const state = event.url.searchParams.get("state");
    const storedState = event.cookies.get("twitter_oauth_state") ?? null;
    console.log(code);
    console.log(state);
    console.log(storedState);

    if (!code || !state || !storedState || state !== storedState) {
        return new Response(null, {
            status: 400
        });
    }
    console.log("reached here");

    try {
        const tokens = await twitter.validateAuthorizationCode(code, CODE_VERIFIER);
        const twitterUserResponse = await fetch("https://api.twitter.com/2/users/me", {
            headers: {
                Authorization: `Bearer ${tokens.accessToken}`
            }
        });
        const twitterUser: TwitterUser = await twitterUserResponse.json();
        console.log("twitter user", twitterUser);

        // Replace this with your own DB client.
        const existingUser = await users_db.findOne({ twitter_id: twitterUser.id });

        if (existingUser) {
            console.log("existing user", existingUser._id);
            const session = await lucia.createSession(existingUser._id, {});
            const sessionCookie = lucia.createSessionCookie(session.id);
            event.cookies.set(sessionCookie.name, sessionCookie.value, {
                path: ".",
                ...sessionCookie.attributes
            });
        } else {
            console.log("new user");
            const userId = generateIdFromEntropySize(10); // 16 characters long

            // Replace this with your own DB client.
            const res = await users_db.insertOne({
                twitter_id: twitterUser.id,
                username: twitterUser.login,
                role: 'authenticated'
            });

            if (res.insertedId) {
                console.log("created twitter acct", res.insertedId);
            }

            const session = await lucia.createSession(res.insertedId, {});
            const sessionCookie = lucia.createSessionCookie(session.id);
            event.cookies.set(sessionCookie.name, sessionCookie.value, {
                path: ".",
                ...sessionCookie.attributes
            });
        }
        return new Response(null, {
            status: 302,
            headers: {
                Location: "/"
            }
        });
    } catch (e) {
        // the specific error message depends on the provider
        if (e instanceof OAuth2RequestError) {
            console.log(e);
            // invalid code
            return new Response(null, {
                status: 400
            });
        }
        return new Response(null, {
            status: 500
        });
    }
}

interface TwitterUser {
    data: {
        id: string;
        name: string;
        username: string;
    }
}
