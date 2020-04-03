import mongoose from "mongoose";
import { BlockTransactionObject} from "web3-eth";
export type BlockDocument = BlockTransactionObject & mongoose.Document;

const BlockSchema = new mongoose.Schema({
    difficulty: String,
    extraData: String,
    gasLimit: Number,
    gasUsed: Number,
    hash: {type:String,unique:true},
    logsBloom: String,
    miner:String,
    mixHash:String,
    nonce:String,
    number:Number,
    parentHash:String,
    receiptsRoot:String,
    sha3Uncles:String,
    size:Number,
    stateRoot:String,
    timestamp:Number,
    totalDifficulty:String,
    transactions:Array,
    transactionsRoot:String,
    uncles:Array
}, { timestamps: true });

export const BlockModel = mongoose.model<BlockDocument>("Block", BlockSchema);