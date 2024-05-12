import { Schema, Types, model } from "mongoose";
import MongoProto from "./mongoproto";
import { Md5 } from "ts-md5";
import NeuronError from "./error";
import { modelBrain } from "./brain";

export interface IUser {
    name: string;
    hash: string;
    created: Date;
    changed?: Date;
}
const UserSchema = new Schema({
    name: {type: String, required: true},
    hash: {type: String, required: true},
    created: {type: Date, required: true},
    changed: {type: Date, required: false}
});

const modelUser = model<IUser>('users', UserSchema);

export class User extends MongoProto<IUser> {
    constructor (id?: Types.ObjectId, data?: IUser){
        super(modelUser, id, data);
    }
    public static async getUserByName(name: string, authtoken: string): Promise<User> {
        MongoProto.connectMongo();
        const hash = Md5.hashStr(`${name} ${authtoken}`);
        const userraw = await modelUser.aggregate([
            {$match: {"hash": hash}}
        ]);
        if (userraw.length === 1) {
            const user = new User(undefined, userraw[0]);
            await user.load();
            return user;
        }
        throw new NeuronError("user:notfound", `User '${name}' not found or password incorrect`);
    }
    public static async isusernamefree(username: string): Promise<boolean> {
        MongoProto.connectMongo();
        const userraw = await modelUser.aggregate([
            {'$match': {'name': username}}
        ]);
        return userraw.length !==1;
    }

    public async brainList(): Promise<Array<string>> {
        MongoProto.connectMongo();
        const brains = await modelBrain.aggregate([
            {"$match": {"username": this.json?.name}}
        ]);
        return brains.flatMap(v=>v.name);
    }
}