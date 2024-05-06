import { Schema, Types, model } from "mongoose";
import MongoProto from "./mongoproto";
import { Md5 } from "ts-md5";
import NeuronError from "./error";

export interface IUser {
    name: string;
    hash: string;
}
const UserSchema = new Schema({
    name: {type: String, required: true},
    hash: {type: String, required: true},
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
            {$match: {"hash": {hash}}}
        ]);
        if (userraw.length === 1) {
            const user = new User(undefined, userraw[0]);
            await user.load();
        }
        throw new NeuronError("user:notfound", `User '${name}' not found or password incorrect`);
    }
}