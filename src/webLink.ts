import Web3 from "web3";
import { CronJob } from "cron";

class WebLink {
    public web3: Web3;
    public jobs: CronJob[] = [];
    constructor() {
        this.web3 = new Web3(new Web3.providers.WebsocketProvider("wss://ropsten.infura.io/ws/v3/638c755c81fe495e85debe581520b373"));
    }

    public reLink(){
        console.log("正在重连web3");
        this.web3 = null;
        this.web3 = new Web3(new Web3.providers.WebsocketProvider("wss://ropsten.infura.io/ws/v3/638c755c81fe495e85debe581520b373"));
    }

    public createJobs(){
        const job: CronJob = new CronJob("* * 1 * * *",()=>{
            console.log("````````````````````````````正在重连web3``````````````````````````");
            this.reLink();
        },null,true);
    }
}

export const webLink = new WebLink();