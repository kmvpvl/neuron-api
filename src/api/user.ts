import { UUID } from "crypto";
import { Response } from "express";
import { Context, Request } from "openapi-backend";
import {v4} from "uuid";
import { IUser, User } from "../model/user";
import NeuronError from "../model/error";
import { Md5 } from "ts-md5";
export async function newuser(c: Context, req: Request, res: Response, user:User){
    const username = req.body.username;
    if (username === undefined) throw new NeuronError("user:couldnotcreate", "Could not create user. Username is empty")
    const authtoken: UUID = v4() as UUID;
    const userdata: IUser = {
        name: username,
        hash: Md5.hashStr(`${username} ${authtoken}`)
    }
    user = new User(undefined, userdata);
    await user.save();
    await user.load();
    res.status(200).json({"authtoken": authtoken});
}
//12b73ce7-1b6d-4137-86bc-707eeca91c51