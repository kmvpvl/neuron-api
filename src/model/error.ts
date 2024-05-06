export type ErrorCode = 
"client:unknown" 
| "user:notfound"
| "settings:mongouriundefined"
| "forbidden:roleexpected"
| "user:couldnotcreate";

export default class NeuronError extends Error {
    private code: ErrorCode;
    constructor(code:ErrorCode, message?: string) {
        super(`${message}`);
        this.code = code;
    }
    get json(): any {
        return {
            code: this.code,
            message: this.message
        }
    }    
}