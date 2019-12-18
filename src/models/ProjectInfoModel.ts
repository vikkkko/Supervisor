import mongoose, { SchemaTypes, Schema } from "mongoose";
import {ContractAddressMgr, ReserveTokenInfo} from "../ProjectMgr/contractAddressMgr";

export type ProjectInfoDocument =  mongoose.Document & {
	projId: string;
	type: string;
	platform: string;
	fundName: string;
	adminAddress: string;
	tokenName: string;
	tokenSymbol: string;
	reserveTokenFlag: string;
	reserveTokenSetFlag: string;
	reserveTokenInfo: Array<ReserveTokenInfo>;
	deployContractFlag: string;
	rewardSetFlag: string;
	connectorName: string;
	connectTel: string;
	ratioSetFlag: string;
	reserveFundRatio: number;
	financeStartFlag: string;
	time: number;
	lastUpdateTime: number;
	contractAddresses: ContractAddressMgr;
};

const ProjectInfoSchema = new mongoose.Schema({
	projId: {type:String,unique:true},
	type: String,
	platform: String,
	fundName: String,
	adminAddress: String,
	tokenName: String,
	tokenSymbol: String,
	reserveTokenFlag: String,
	reserveTokenSetFlag :String,
	reserveTokenInfo: Array,
	deployContractFlag: String,
	rewardSetFlag: String,
	connectorName: String,
	connectTel: String,
	ratioSetFlag: String,
	reserveFundRatio :Number,
	financeStartFlag : String,
	time: Number,
	lastUpdateTime : Number,
	contractAddresses : Schema.Types.Mixed,
}, { timestamps: true });

export const ProjectInfoModel = mongoose.model<ProjectInfoDocument>("daoprojinfo", ProjectInfoSchema);