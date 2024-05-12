import { Schema, Types, model } from "mongoose";
import MongoProto from "./mongoproto";
import { Md5 } from "ts-md5";
import NeuronError from "./error";

interface ILink {
    image?: {
        x: number;
        y: number;
    };
    neuron?: {
        neuron: string;
        Aindex: number;
    }
}

export interface INeuron {
    _name: string;
    _SWCount: number;
    _SHCount: number;
    _ACount: number;
    _SLinks: Array <ILink>;
    _learnCount: Array<number>;
    _W: Array<Array<number>>;
    _ANames: Array<string>;
    _layer?: number;
}

export interface IBrain {
    username: string;
    name: string;
    neurons: Array<INeuron>;
    created: Date;
    changed?: Date;
}

const BrainSchema = new Schema({
    username: {type: String, required: true},
    name: {type: String, required: true},
    neurons: {type: Array, required: true},
    created: {type: Date, required: true},
    changed: {type: Date, required: false}
});

export const modelBrain = model<IBrain>('brains', BrainSchema);

export class Brain extends MongoProto<IBrain> {
    constructor (id?: Types.ObjectId, data?: IBrain){
        super(modelBrain, id, data);
    }
    static async loadBrain(username: string, brainname: string): Promise<Brain> {
        const rawBrains = await modelBrain.aggregate([{
            "$match": {"username": username, "name": brainname}
        }]);
        if (rawBrains.length === 1) {
            const ret = new Brain(undefined, rawBrains[0]);
            await ret.load();
            return ret
        } 
        throw new NeuronError("brain:notfound", `Brain '${brainname}' for user '${username}' not found`);
    }
}