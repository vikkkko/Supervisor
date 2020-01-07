import { CronJob, time } from "cron";
import {Counter,CounterDocument} from "../models/Counter";

export class BaseCrawler {
    public initIndex: number = 6594260;
    
    public handlerIndex: number;

    public lastUpdateIndex: number;

    public counterDocument: CounterDocument;

    public jobs: CronJob[] = [];

    protected async initCounterDocument(key: string){
        if(!this.lastUpdateIndex){
            //先获取当前入库到哪个高度了
            this.counterDocument = await Counter.findOne({counter:key});
            if(this.counterDocument){
                this.lastUpdateIndex = this.counterDocument.lastUpdateIndex;
                this.handlerIndex =  this.counterDocument.lastUpdateIndex;
            }
            else{
                this.lastUpdateIndex =  this.initIndex;
                this.handlerIndex =  this.initIndex;
                this.counterDocument = new Counter({counter:key,lastUpdateIndex:this.initIndex});
            }
        }
    }
    
    protected async saveCounterDocument(timestamp: number){
        this.counterDocument.lastUpdateIndex = this.handlerIndex;
        this.counterDocument.timestamp = timestamp;
        await this.counterDocument.save();
        this.lastUpdateIndex++;
    }

    public async start(){
        console.log("start");
    }
}