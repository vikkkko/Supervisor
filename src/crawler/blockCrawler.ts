import {BaseCrawler} from "./baseCrawler";
import { CronJob, job } from "cron";
import {BlockModel,BlockDocument} from "../models/BlockModel";
import {Counter,CounterDocument} from "../models/Counter";
import {webLink} from "../webLink";

class BlockCrawler extends BaseCrawler
{
    public async startJob(){
        await super.startJob();
        if(!this.lastUpdateIndex){
            //先获取当前入库到哪个高度了
            this.counterDocument = await Counter.findOne({counter:"block"});
            console.log(`库中block高度${this.counterDocument.lastUpdateIndex}`);
            if(this.counterDocument){
                this.lastUpdateIndex = this.counterDocument.lastUpdateIndex;
                this.handlerIndex =  this.counterDocument.lastUpdateIndex;
            }
            else{
                this.lastUpdateIndex =  this.initIndex;
                this.handlerIndex =  this.initIndex;
                this.counterDocument = new Counter({counter:"block",lastUpdateIndex:this.initIndex});
            }
        }

        const job: CronJob = new CronJob("* * * * * *",async()=>{
            try{
                if( this.handlerIndex && this.lastUpdateIndex && this.handlerIndex ==  this.lastUpdateIndex+1)
                return;
    
                this.handlerIndex ++;
                console.log(`正在处理块，高度：${this.handlerIndex}`);
                const block: BlockDocument = (await webLink.web3.eth.getBlock(this.handlerIndex)) as BlockDocument;
                if(block){
                    const existing = await BlockModel.findOne({hash:block.hash});
                    if(!existing){
                        const blockModel: BlockDocument = new BlockModel(block);
                        await blockModel.save();
                        //更新高度
                        this.counterDocument.lastUpdateIndex = this.handlerIndex;
                        await this.counterDocument.save();
                        this.lastUpdateIndex++;
                    }else{
                        this.lastUpdateIndex++;
                    }
                }
                else{
                    this.handlerIndex --;
                }
            }catch(e){
                console.log(`块：${e}`);
                webLink.reLink();
            }

        },null,true);
    }
}

export const  blockCrawler = new BlockCrawler();