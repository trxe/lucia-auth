import { generateCodeVerifier, OAuth2RequestError } from "arctic";
import { generateIdFromEntropySize } from "lucia";
import { discord, lucia } from "$lib/server/auth";

import type { RequestEvent } from "@sveltejs/kit";
import { users_db } from "$lib/db/users";

export async function GET(event: RequestEvent): Promise<Response> {
    const code = event.url.searchParams.get("code");
    const state = event.url.searchParams.get("state");
    const storedState = event.cookies.get("discord_oauth_state") ?? null;

    if (!code || !state || !storedState || state !== storedState) {
        return new Response(null, {
            status: 400
        });
    }

    console.log("there");
    try {
        const tokens = await discord.validateAuthorizationCode(code);
        const discordUserResponse = await fetch("https://discord.com/api/users/@me", {
            headers: {
                Authorization: `Bearer ${tokens.accessToken}`
            }
        });
        const discordUser: DiscordUser = await discordUserResponse.json();
        console.log(discordUser);

        // Replace this with your own DB client.
        const existingUser = await users_db.findOne({ discord_id: discordUser.id });

        if (existingUser) {
            const session = await lucia.createSession(existingUser._id, {});
            const sessionCookie = lucia.createSessionCookie(session.id);
            event.cookies.set(sessionCookie.name, sessionCookie.value, {
                path: ".",
                ...sessionCookie.attributes
            });
        } else {
            const userId = generateIdFromEntropySize(10); // 16 characters long

            // Replace this with your own DB client.
            const res = await users_db.insertOne({
                discord_id: discordUser.id,
                username: discordUser.login,
                role: 'authenticated'
            });

            if (res.insertedId) {
                console.log("created discord acct", res.insertedId);
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

interface DiscordUser {
    id: string,
    username: string,
    avatar: string,
    banner: string | null,
    accent_color: string | null,
    global_name: string,
    avatar_decoration_data: any,
    banner_color: string | null,
    mfa_enabled: false,
    locale: string,
    premium_type: number,
    email: string,
    verified: boolean
}
