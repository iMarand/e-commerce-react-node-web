/**
 * File Func: Database Configuration
 * Author: Isubirizigihe Confiance
 */

import { MongoClient } from "mongodb";
import "dotenv/config";

const FORM_URL = (configs, userName, userPassword) => (!userName) ? "mongodb://127.0.0.1:27017" : `mongodb://${userName}:${userPassword}@${configs.hostname}:${configs.port}`;

const FIRST_URL = FORM_URL({hostname: process.env.DB_HOSTNAME, port: process.env.DB_PORT });
const ORIGINAL_URL = FORM_URL({hostname: process.env.DB_HOSTNAME, port: process.env.DB_PORT }, process.env.USER_NAME, process.env.USER_PASSWORD);

const OPTIONS = {
    minPoolSize: 10,
    maxPoolSize: 100,
    serverSelectionTimeoutMS: 30000
}

export const connectionSignal = {
    connected: false,
    client: null
}

const EnsureUserExists = async () => {
    const client = new MongoClient(FIRST_URL);
    try {
        await client.connect();

        const db = client.db(process.env.DB_WHERE_ADMIN); // Goes in admin database
        let exists = await db.command({ usersInfo: 1 });
        exists = exists?.users.find(e => e.user === process.env.USER_NAME);

        (exists) ? 
            exists : await db.command(
                { createUser: process.env.USER_NAME, pwd: process.env.USER_PASSWORD, roles: [{ role: process.env.USER_ROLE, db: process.env.DB_NAME }]}
            ) && console.log("USER AND DB CREATED SUCCESSFULLY");
        
        return true;
    } catch(err) {
        console.error(err);
        return false;
    } finally {
        await client.close();
    }
}

const UserExists = async function() {
    const client = new MongoClient(ORIGINAL_URL, OPTIONS);

    try {
        await client.connect();

        connectionSignal.client = client;
        connectionSignal.connected = true;

        return client;
    } catch(err) {
        console.error(err);
        return false;
    }
}

export const TerminateConnection = async () => {
    if (connectionSignal.connected && connectionSignal.client) {
        await connectionSignal.client['close']();

        connectionSignal.connected = false;
        connectionSignal.client = null;

        return console.log("Connection Terminated Well")
    }

    return console.log("No Connection Available to Terminate");
}

export const isCollectionExists = async (collection, DBOBJ) => {
    const collections = await DBOBJ.listCollections({ name: collection }).toArray();
    return (collections.length > 0) ? true : false;
}

export const MONGOCLIENTCONNECTION = EnsureUserExists().then(async (exists) => {
    if (!exists) {
        throw new Error("Can't connect to db");
    }

    return await UserExists();
}).catch(console.log);




