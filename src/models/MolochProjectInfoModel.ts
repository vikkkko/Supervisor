import mongoose, { SchemaTypes, Schema } from "mongoose";

export class ContractInfo{
    name: string;
    hash: string;

    constructor(_name: string,_hash: string){
        this.hash = _hash;
        this.name = _name;
    }
} 


export type MolochProjectInfoDocument = mongoose.Document & {
    projId: string;
    projName: string;
    projBrief: string;
    projDetail: string;
    projCoverUrl: string; //项目封面
    projType: string;
    projVersion: string;
    officailWeb: string; //官网
    fundHash: string;
    fundSymbol: string;
    fundDecimals: number;
    votePeriod: string;
    notePeriod: string;
    cancelPeriod: string;
    periodDuration: string;
    votingPeriodLength: string;
    notingPeriodLength: string;
    cancelPeriodLength: string;
    proposalDeposit: string;
    proposalReward: string;
    summonerAddress: string;
    contractHashs: Array<ContractInfo>;
    fundTotal: string;
    tokenTotal: string;
    hasTokenCount: number;
    time: number;
    lastUpdateTime: number;
    discussCount: number;
    startTime: number;
};

const MolochProjectInfoSchema = new mongoose.Schema({
	projId: {type:String,unique:true},
    projName: String,
    projBrief: String,
    projDetail: String,
    projCoverUrl : String, //项目封面
    projType: String,
    projVersion : String,
    officailWeb : String, //官网
    fundHash : String,
    fundSymbol : String,
    fundDecimals : Number,
    votePeriod : String,
    notePeriod : String,
    cancelPeriod : String,
    periodDuration : String,
    votingPeriodLength : String,
    notingPeriodLength : String,
    cancelPeriodLength : String,
    proposalDeposit : String,
    proposalReward : String,
    summonerAddress: String,
    contractHashs : Array,
    fundTotal : String,
    tokenTotal : String,
    hasTokenCount : Number,
    time : Number,
    lastUpdateTime : Number,
    discussCount : Number,
    startTime : Number,
}, { timestamps: true });

export const MolochProjectInfoModel = mongoose.model<MolochProjectInfoDocument>("moloprojinfos", MolochProjectInfoSchema);