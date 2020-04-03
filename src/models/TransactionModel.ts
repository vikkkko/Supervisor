import mongoose from "mongoose";
import { Transaction} from "web3-core";
import { TransactionReceipt } from "web3-core";

export type TransactionDocument = TransactionReceipt & Transaction & mongoose.Document;

const TransactionSchema = new mongoose.Schema({
	transactionHash: {type:String,unique:true},
	nonce: Number,
	blockHash: String,
	blockNumber: Number,
	transactionIndex: Number,
	from: String,
	to: String,
	value: String,
	gasPrice: String,
	gas: Number,
	input: String,
	v: String,
	r: String,
	s: String,
	cumulativeGasUsed :Number,
	gasUsed : Number,
	contractAddress: String,
	logs : Array,
	events : Array,
	status: Boolean
}, { timestamps: true });

export const TransactionModel = mongoose.model<TransactionDocument>("Transaction", TransactionSchema);