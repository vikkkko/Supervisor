import AsyncLock from "async-lock";

class Lock{
    public asyncLock = new AsyncLock();

    public async acquire(key: string,fn: Function){
        await this.asyncLock.acquire(key,async ()=>{
            await fn();
        });
    }
}

export const lock = new Lock();