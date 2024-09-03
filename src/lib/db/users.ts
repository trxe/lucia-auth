import db from '$lib/db/mongo';
import type { Collection, ObjectId } from 'mongodb';

export interface CsUser {
    _id: ObjectId;
    username: string;
    role: string;
    password_hash?: string;
    twitter_id?: string;
    discord_id?: string;
}

export interface CsSession {
    _id: string;
    expires_at: Date;
    user_id: ObjectId;
}


export const users_db: Collection<CsUser> = db.collection('users');
export const sessions_db: Collection<CsSession> = db.collection('sessions');