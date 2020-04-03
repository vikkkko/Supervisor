import {BaseCrawler} from "./baseCrawler";
import { CronJob, job } from "cron";
import {BlockModel,BlockDocument} from "../models/BlockModel";
import {Counter,CounterDocument} from "../models/Counter";
import {webLink} from "../util/webLink";
import { EnumProcessResult,processer } from "../processer/processer";
import fs from "fs";
import {ProjectMemberDocument,ProjectMemberModel} from "../models/ProjectMemberModel";

class BlockCrawler extends BaseCrawler
{
    public async start(){
        await super.start();
        await super.initCounterDocument("block");

        const job: CronJob = new CronJob("* * * * * *",async()=>{
            try{
                if( this.handlerIndex && this.lastUpdateIndex && this.handlerIndex ==  this.lastUpdateIndex+1)
                    return;
                this.handlerIndex ++;
                console.log(`正在处理块，高度：${this.handlerIndex}`);
                const block: BlockDocument = (await webLink.web3.eth.getBlock(this.handlerIndex,true)) as BlockDocument;
                const r: EnumProcessResult = await processer.processBlock(block);
                switch(r){
                    case EnumProcessResult.faildDataIsNull :
                        this.handlerIndex --;
                        break;
                    case EnumProcessResult.success :
                        //更新高度
                        await super.saveCounterDocument(block.timestamp as number);
                        break;
                    case EnumProcessResult.faildDataExistInDB :
                        this.lastUpdateIndex++;
                        break;
                    default :
                        this.handlerIndex --;
                        break;
                }
            }catch(e){
                console.log(`块：${e}`);
                webLink.reLink();
            }

        },null,true);
    }
}

export const  blockCrawler = new BlockCrawler();