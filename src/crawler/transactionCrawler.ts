import {BaseCrawler} from "./baseCrawler";
import { CronJob } from "cron";
import {TransactionDocument,TransactionModel} from "../models/TransactionModel";
import {Counter,CounterDocument} from "../models/Counter";
import {ProjectContractModel} from "../models/ProjectContractModel";
import {LogDocument,LogModel} from "../models/LogModel";
import _ from "lodash";
import { Log } from "web3/types";
import {Eventmap} from "../AbiExec";
import {webLink} from "../webLink";


class TransactionCrawler extends BaseCrawler{
    public async startJob(){
        await super.startJob();

        if(!this.lastUpdateIndex){
            //先获取当前入库到哪个高度了
            this.counterDocument = await Counter.findOne({counter:"transaction"});
            console.log(`库中transaction高度${this.counterDocument.lastUpdateIndex}`);
            if(this.counterDocument){
                this.handlerIndex = this.counterDocument.lastUpdateIndex;
                this.lastUpdateIndex = this.counterDocument.lastUpdateIndex;
            }
            else{
                this.lastUpdateIndex =  this.initIndex;
                this.handlerIndex = this.initIndex;
                this.counterDocument = new Counter({counter:"transaction",lastUpdateIndex:this.initIndex});
            }
        }

        const job = new CronJob("* * * * * *",async()=>{
            try{
                if(this.handlerIndex && this.lastUpdateIndex && this.handlerIndex ==  this.lastUpdateIndex+1)
                return;
    
                this.handlerIndex ++;
                //先查看这个高度出了没有
                const count = await webLink.web3.eth.getBlockNumber();
                //console.log(`count:${count}`);
                if(this.handlerIndex>count){
                    this.handlerIndex --;
                    return;
                }
    
                const transactionCount: number =  await webLink.web3.eth.getBlockTransactionCount(this.handlerIndex);
                let _count = 0;
                console.log(`正在处理交易，高度：${this.handlerIndex}   数量：${transactionCount}`);
                //const time1 = Math.round(new Date().getTime());
                if(transactionCount!= 0 && !transactionCount){
                    this.handlerIndex --;
                    return;
                }


                if(transactionCount == 0){
                    //更新高度
                    this.counterDocument.lastUpdateIndex = this.handlerIndex;
                    await this.counterDocument.save();
                    this.lastUpdateIndex++;
                }
    
                for(let i = 0;i<transactionCount;i++){
                    webLink.web3.eth.getTransactionFromBlock(this.handlerIndex,i).then(async(transaction: TransactionDocument)=>{
                        if(transaction){
                            const receipt = await webLink.web3.eth.getTransactionReceipt(transaction.hash);
                            _.assignIn(transaction,receipt);
                            const existing = await TransactionModel.findOne({transactionHash:transaction.hash});
                            if(!existing){
                                const transactionDocument: TransactionDocument = new TransactionModel(transaction);
                                try{
                                    await transactionDocument.save();
                                }catch(e){
                                    console.log(e);
                                }
    
                                //入库logs
                                const logs: Log[] = transaction.logs;
                                if(logs){
                                    for(let i = 0;i<logs.length;i++){
                                        const log: LogDocument = logs[i] as LogDocument;
                                        //看看合约是不是需要入库的合约
                                        const existing = await ProjectContractModel.findOne({contractHash:log.address});
                                        //console.log(`transactionHash:${transaction.transactionHash} ___ existirng:${existing}`);
                                        if(existing){
                                            const eventinfo = Eventmap.get(log.topics[0]);
                                            const args = log.topics.slice(1);
                                            const str = log.data.substr(2,log.data.length);
                                            for(let i =0;i<str.length /64;i++){
                                                args.push(`0x${str.substr(i*64,64)}`);
                                            }
                                            const logExtend = {
                                                contractHash:log.address,
                                                event:eventinfo.eventName,
                                                argsCount:eventinfo.argsCount,
                                                argsTypes:eventinfo.argsTypes,
                                                args:args
                                            };
                                            _.assignIn(log,logExtend);
                                            const logDocument = new LogModel(log);
                                            try{
                                                await logDocument.save();
                                            }catch(e){
                                                console.log(e);
                                            }
                                        }
                                    }
                                }

                            }
                        }
                        _count++;
                        if(_count == transactionCount){
                            //更新高度
                            this.counterDocument.lastUpdateIndex = this.handlerIndex;
                            this.counterDocument.save();
                            this.lastUpdateIndex++;
                        }
    
                    });
                }
            }
            catch(e){
                console.log(`交易：${e}`);
                webLink.reLink();
            }
        },null,true);
    }
}

export const transactionCrawler = new TransactionCrawler();