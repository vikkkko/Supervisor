import {BlockModel,BlockDocument} from "../models/BlockModel";
import {TransactionDocument,TransactionModel} from "../models/TransactionModel";
import { LogDocument , LogModel } from "../models/LogModel";
import { Eventmap } from "../util/AbiExec";
import _ from "lodash";
import { isNull } from "util";

export enum EnumProcessResult {
    success,
    faildDataExistInDB,
    faildDataIsNull
}

class Processer {

    public async processBlock(block: BlockDocument): Promise<EnumProcessResult> {
        if(block){
            const existing = await BlockModel.findOne({hash:block.hash});
            if(!existing){
                const blockModel: BlockDocument = new BlockModel(block);
                try{
                    await blockModel.save();
                    return EnumProcessResult.success;
                }catch(e){
                    console.log(e);
                    return EnumProcessResult.faildDataExistInDB;
                }
            } else {
                return EnumProcessResult.faildDataExistInDB;
            }
        } else {
            return EnumProcessResult.faildDataIsNull;
        }
    }

    public async processTransaction(transaction: TransactionDocument): Promise<EnumProcessResult> {
        if(transaction){
            const existing = await TransactionModel.findOne({transactionHash:transaction.hash});
            if(!existing){
                const transactionDocument: TransactionDocument = new TransactionModel(transaction);
                try
                {
                    await transactionDocument.save();
                    return EnumProcessResult.success;
                }catch(e){
                    console.log(e);
                    return EnumProcessResult.faildDataExistInDB;
                }

            } else {
                return EnumProcessResult.faildDataExistInDB;
            }
        } else {
            return EnumProcessResult.faildDataIsNull;
        }
    }

    public async processLog(log: LogDocument,timestamp: number): Promise<EnumProcessResult> {
        if(log){
            let logCounter = await LogModel.count({});
            const existing = await LogModel.findOne({transactionHash:log.transactionHash,logIndex:log.logIndex});
            if(!existing){
                const eventinfo = Eventmap.get(log.topics[0]);
                if(eventinfo){
                    const args: any[] = [];
                    let topics = log.topics.slice(1);
                    let datas = [];
                    const str = log.data.replace("0x","");
                    for(let i =0;i<str.length /64;i++){
                        datas.push(`0x${str.substr(i*64,64)}`);
                    }
    
                    for(let i = 0;i<eventinfo.argsIndexeds.length;i++){
                        if(eventinfo.argsIndexeds[i] == true){
                            args.push(topics[0]);
                            topics = topics.slice(1);
                        } else {
                            args.push(datas[0]);
                            datas = datas.slice(1);
                        }
                    }

                    const logExtend = {
                        counter : logCounter,
                        contractHash:log.address.toLowerCase(),
                        event:eventinfo.eventName,
                        argsCount:eventinfo.argsCount,
                        argsTypes:eventinfo.argsTypes,
                        args:args,
                        timestamp:timestamp
                    };
                    _.assignIn(log,logExtend);
                    const logDocument = new LogModel(log);
                    await logDocument.save();
                }
            } else {
                return EnumProcessResult.faildDataExistInDB;
            }
        } else {
            return EnumProcessResult.faildDataIsNull;
        }
    }
}

export const processer = new Processer();