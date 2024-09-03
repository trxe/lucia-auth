import { MongoClient } from 'mongodb';
import { MONGO_DEV_URL, MONGO_DB_NAME, MONGO_PROD_URL } from '$env/static/private'
import { dev } from '$app/environment';

const client = new MongoClient(dev ? MONGO_DEV_URL : MONGO_PROD_URL);

export function start_mongo() {
    console.log("starting mongo...");
    return client.connect();
}

export default client.db(MONGO_DB_NAME);