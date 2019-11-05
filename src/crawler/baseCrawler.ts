import { CronJob } from "cron";
import {Counter,CounterDocument} from "../models/Counter";

export class BaseCrawler {
    public initIndex: number = 6594260;
    
    public handlerIndex: number;

    public lastUpdateIndex: number;

    public counterDocument: CounterDocument;

    public jobs: CronJob[] = [];

    public async startJob(){
        console.log("start");
    }
}