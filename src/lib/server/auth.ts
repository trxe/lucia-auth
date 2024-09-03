import { Lucia } from "lucia";
import { MongodbAdapter } from "@lucia-auth/adapter-mongodb";
import { dev } from "$app/environment";
import { sessions_db, users_db } from "$lib/db/users";
import type { ObjectId } from "mongodb";
import { Discord, generateCodeVerifier, Twitter } from "arctic";
import { DEV_HOME, DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET, DISCORD_REDIRECT_URL_DEV, DISCORD_REDIRECT_URL_PROD, PROD_HOME, TWITTER_CLIENT_ID, TWITTER_CLIENT_SECRET, TWITTER_REDIRECT_URL_DEV, TWITTER_REDIRECT_URL_PROD } from "$env/static/private";

const adapter = new MongodbAdapter(sessions_db, users_db); // your adapter

export const lucia = new Lucia(adapter, {
    sessionCookie: {
        attributes: {
            // set to `true` when using HTTPS
            secure: !dev
        }
    },
    getUserAttributes: (attributes) => {
        return {
            // attributes has the type of DatabaseUserAttributes
            twitter_id: attributes.twitter_id,
            discord_id: attributes.discord_id,
            role: attributes.role,
            username: attributes.username
        };
    }

});

export const CODE_VERIFIER = generateCodeVerifier();
export const twitter = new Twitter(TWITTER_CLIENT_ID, TWITTER_CLIENT_SECRET, `${dev ? DEV_HOME : PROD_HOME}/login/twitter/callback`);
export const discord = new Discord(DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET, `${dev ? DEV_HOME : PROD_HOME}/login/discord/callback`);

declare module "lucia" {
    interface Register {
        Lucia: typeof lucia;
        UserId: ObjectId;
        DatabaseUserAttributes: DatabaseUserAttributes;
    }
}

export interface DatabaseUserAttributes {
    username: string;
    role: string;
    twitter_id?: string;
    discord_id?: string;
}
