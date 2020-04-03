import Web3 from "web3";
import { CronJob } from "cron";
import { ETH_URI } from "./secrets";

class WebLink {
    public web3: Web3;
    public jobs: CronJob[] = [];
    constructor() {
        console.log(`ETH_URI:${ETH_URI}`);
        this.web3 = new Web3(new Web3.providers.WebsocketProvider(ETH_URI,{"timeout":30000}));
    }

    public reLink(){
        console.log("正在重连web3");
        this.web3 = null;
        this.web3 = new Web3(new Web3.providers.WebsocketProvider(ETH_URI,{"timeout":30000}));
    }

    public createJobs(){
        const job: CronJob = new CronJob("* * 1 * * *",()=>{
            console.log("````````````````````````````正在重连web3``````````````````````````");
            this.reLink();
        },null,true);
    }
}

export const webLink = new WebLink();