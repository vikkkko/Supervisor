import {BaseCrawler} from "./baseCrawler";
import { CronJob } from "cron";
import {TransactionDocument,TransactionModel} from "../models/TransactionModel";
import {Counter,CounterDocument} from "../models/Counter";
import {ProjectContractModel} from "../models/ProjectContractModel";
import {LogDocument,LogModel} from "../models/LogModel";
import _ from "lodash";
import { Log } from "web3/types";
import {Eventmap} from "../util/AbiExec";
import {webLink} from "../util/webLink";
import { isNull } from "util";
import { EnumProcessResult , processer} from "../processer/processer";
import {BlockModel,BlockDocument} from "../models/BlockModel";

class TransactionCrawler extends BaseCrawler{
    public async start(){
        await super.start();
        await super.initCounterDocument("transaction");

        const job = new CronJob("* * * * * *",async()=>{
            try{
                if(this.handlerIndex && this.lastUpdateIndex && this.handlerIndex ==  this.lastUpdateIndex + 1)
                return;
    
                this.handlerIndex ++;
                //先查看这个高度出了没有
                // const count = await webLink.web3.eth.getBlockNumber();
                // if(this.handlerIndex > count){
                //     this.handlerIndex --;
                //     return;
                // }

                //这个高度的block出了，获取这个高度的block中的交易数量
                const block: BlockDocument = (await webLink.web3.eth.getBlock(this.handlerIndex)) as BlockDocument;
                if(isNull(block)){
                    this.handlerIndex --;
                    return;
                }

                const transactionCount: number =  await webLink.web3.eth.getBlockTransactionCount(this.handlerIndex);
                let _count = 0;
                console.log(`正在处理交易，高度：${this.handlerIndex}   数量：${transactionCount}`);
                if(isNull(transactionCount)){
                    this.handlerIndex --;
                    return;
                }
                if(transactionCount == 0){
                    await super.saveCounterDocument(block.timestamp);
                    return;
                }
                for(let i = 0;i<transactionCount;i++){
                    webLink.web3.eth.getTransactionFromBlock(this.handlerIndex,i).then(async(transaction: TransactionDocument)=>{
                        if(transaction){
                            const receipt = await webLink.web3.eth.getTransactionReceipt(transaction.hash);
                            _.assignIn(transaction,receipt);
                            const r: EnumProcessResult = await processer.processTransaction(transaction);
                            switch (r) {
                                case EnumProcessResult.success:
                                    //入库logs
                                    const logs: Log[] = transaction.logs;
                                    if(!isNull(logs)){
                                        for(let i = 0 ; i<logs.length;i++){
                                            const log: LogDocument = logs[i] as LogDocument;
                                            //查询这个log要不要处理（目前只处理我们记录在案的合约，太多的话处理太慢）
                                            const needProcess = await ProjectContractModel.findOne({contractHash:log.address.toLowerCase()});
                                            //console.log(`${log.address}:${needProcess}`);
                                            if(needProcess){
                                                await processer.processLog(log,block.timestamp);
                                            }
                                        }
                                    }
                                    break;
                                case EnumProcessResult.faildDataIsNull :
                                    break;
                                case EnumProcessResult.faildDataExistInDB :
                                    break;
                                default :
                                    break;
                            }
                        }
                        _count++;
                        //当所有的交易都存入库中后更新counter字段
                        if(_count == transactionCount){
                            //更新高度
                            await super.saveCounterDocument(block.timestamp);
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