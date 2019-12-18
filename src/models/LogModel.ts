import mongoose from "mongoose";
import { Log } from "web3/types";
export type LogDocument = Log & mongoose.Document;

const LogSchema = new mongoose.Schema({
    address: String,
    contractHash:String,
    blockHash: String,
    blockNumber: Number,
    timestamp:Number,
    data: String,
    logIndex: Number,
    removed:Boolean,
    topics:Array,
    transactionHash:String,
    transactionIndex:Number,
    id:String,
    event:String,
    argsCount:Number,
    argsTypes:Array,
    args:Array
}, { timestamps: true });

export const LogModel = mongoose.model<LogDocument>("Log", LogSchema);