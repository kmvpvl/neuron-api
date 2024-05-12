import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import OpenAPIBackend from "openapi-backend";
import { UUID } from "crypto";
import cors from 'cors';
import NeuronError from "./model/error";
import { User } from "./model/user";
import { brainlist, isusernamefree, newuser } from "./api/user";
import { loadbrain, savebrain } from "./api/brain";

var npm_package_version = require('../package.json').version;
dotenv.config();

const api = new OpenAPIBackend({ 
    definition: 'neuron-api.yml'
});

api.init();

api.register({
    version:  async (c, req, res, user, roles) => {return res.status(200).json({version: npm_package_version})},
    isusernamefree: async(c, req, res, user, roles) => await isusernamefree(c, req, res, user),
    newuser: async(c, req, res, user, roles) => await newuser(c, req, res, user),
    brainlist: async(c, req, res, user, roles) => await brainlist(c, req, res, user),
    loadbrain: async(c, req, res, user, roles) => await loadbrain(c, req, res, user),
    savebrain: async(c, req, res, user, roles) => await savebrain(c, req, res, user),
    validationFail: async (c, req, res, user, roles) => res.status(400).json({ err: c.validation.errors }),
    notFound: async (c, req, res, user, roles) => res.status(404).json({c}),
    notImplemented: async (c, req, res, user, roles) => res.status(500).json({ err: 'not implemented' }),
    unauthorizedHandler: async (c, req, res, user, roles) => res.status(401).json({ err: 'not auth' })
});

api.registerSecurityHandler('NeuronUserName', async (context, req, res, user)=> {
    return user !== undefined;
});

api.registerSecurityHandler('NeuronAuthToken',  (context, req, res, user)=> { 
    return true;
});

const app = express();
app.use(express.json());
//app.use(morgan('tiny'));
app.use(cors());

const PORT = process.env.PORT || 8000;

app.use(async (req, res) => {
    let user: User | null;
    const username = req.headers['neuron_username'] as string;
    const authtoken = req.headers['neuron_authtoken'] as UUID;
    console.log(`-----\n✅ [${req.method}:${req.originalUrl}] headers neuron_username='${username}'; neuron_authtoken='${authtoken}'`);
    try {
        user = await User.getUserByName(username, authtoken);
        console.log(`✅ Login successed`);
    } catch (e) {
        console.log(`🚫 Login failed`);
        //return res.status(401).json({err: "login failed"})
        user = null;
    }
    try {
        return await api.handleRequest({
            method: req.method,
            path: req.path,
            body: req.body,
            headers: {
                'neuron_username': username,
                'neuron_authtoken': authtoken
            }
        }, req, res, user);
    } 
    catch (e) {
        if (e instanceof NeuronError) {
            switch ((e as NeuronError).json.code) {
                case "forbidden:roleexpected": return res.status(403).json((e as NeuronError).json);
                default: return res.status(400).json((e as NeuronError).json);
            }
        } else {
            return res.status(500).json({code: "Wrong parameters", description: `Request ${req.url} - ${(e as Error).message}`});
            console.log(`🚫 Request ${req.url} - ${(e as Error).message}`);
        }
    }
});

app.listen(PORT, ()=>console.log(`✅ Now listening on port ${PORT}`));