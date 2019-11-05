import {webLink} from "../webLink";
import {Deploy} from "./deploy";
import {Init} from "./init";
import {SetParams} from "./setParams";
import {nonce} from "./nonce";

class ProjectMgr{
    private address: string;
    constructor(){
        //0x88F537DDC37758C32C793CBCF84D153E29747C1D23AC66783B9937E445118BEE  0x4b8db98D09e35D85E501321b68195F9f23EfDd87
        const account = webLink.web3.eth.accounts.privateKeyToAccount("0x88F537DDC37758C32C793CBCF84D153E29747C1D23AC66783B9937E445118BEE");
        this.address = account.address;
        webLink.web3.eth.accounts.wallet.add(account);
    }

    public async startJob(){
        await nonce.initNonce(this.address);
        new Deploy(this.address).startJob();
        new Init(this.address).startJob();
        new SetParams(this.address).startJob();
    }
}

export const projectMgr = new ProjectMgr();