import { UUID } from "crypto";
import { Response } from "express";
import { Context, Request } from "openapi-backend";
import {v4} from "uuid";
import { IUser, User } from "../model/user";
import NeuronError from "../model/error";
import { Md5 } from "ts-md5";
import { Brain, IBrain } from "../model/brain";
export async function loadbrain(c: Context, req: Request, res: Response, user:User){
    const b = await Brain.loadBrain(user.json?.name as string, "");
    res.status(200).json(b.json);
}
export async function savebrain(c: Context, req: Request, res: Response, user:User){
    const braindata = req.body.brain;
    console.log(`brain = '${JSON.stringify(braindata)}'`);
    let b: Brain;
    try {
        b = await Brain.loadBrain(user.json?.name as string, "");
        const ib = b.json as IBrain; 
        ib.neurons = braindata.neurons;
        ib.changed = new Date();
        await b.load(ib);
    } catch (e) {
        const ib: IBrain = {
            username: user.json?.name as string,
            neurons: braindata.neurons,
            created: new Date(),
        }
        b = new Brain(undefined, ib);
    }
    await b.save();
    res.status(200).json(b.json);
}
