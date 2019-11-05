import mongoose, { SchemaTypes, Schema } from "mongoose";
import {ContractAddressMgr, ReserveTokenInfo} from "../ProjectMgr/contractAddressMgr";

export type ProjectInfoDocument =  mongoose.Document & {
	projId: string;
	type: string;
	platform: string;
	tokenName: string;
	adminAddress: string;
	projTokenName: string;
	projTokenSymbol: string;
	reserveTokenFlag: string;
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
	tokenName: String,
	adminAddress: String,
	projTokenName: String,
	projTokenSymbol: String,
	reserveTokenFlag: String,
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

export const ProjectInfoModel = mongoose.model<ProjectInfoDocument>("daoprojfinanceinfo", ProjectInfoSchema);