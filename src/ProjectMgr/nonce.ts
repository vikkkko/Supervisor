
import {webLink} from "../webLink";

class Nonce{
    public currentNonce: number;
    public async initNonce(addr: string){
        this.currentNonce =await webLink.web3.eth.getTransactionCount(addr);
    }
    public async getNonce(): Promise<number>{
        this.currentNonce ++;
        return this.currentNonce;
    }
}

export const nonce = new Nonce();