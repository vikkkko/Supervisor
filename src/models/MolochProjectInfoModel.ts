import mongoose, { SchemaTypes, Schema } from "mongoose";




export type MolochProjectInfoDocument = mongoose.Document & {
    projId: string;
    projName: string;
    projTitle: string;
    projType: string;
    description: string;
    projUrl: string;
    minimumTrubute: string;
    shares: number;
    summonerAddress: string;
    molochAddress: string;
    guildBankAddress: string;
    periodDuration: string;
    votingPeriodLength: string;
    gracePeriodLength: string;
    abortWindow: string;
    proposalDeposit: string;
    processingReward: string;
    approvedToken: string;
};

const MolochProjectInfoSchema = new mongoose.Schema({
	projId: {type:String,unique:true},
    projName : String,
    projTitle : String,
    projType : String,
    description : String,
    projUrl : String,
    minimumTrubute : String,
    shares : Number,
    summonerAddress : String,
    molochAddress : String,
    guildBankAddress : String,
    periodDuration : String,
    votingPeriodLength : String,
    gracePeriodLength : String,
    proposalDeposit : String,
    processingReward : String,
    approvedToken : String
}, { timestamps: true });

export const MolochProjectInfoModel = mongoose.model<MolochProjectInfoDocument>("moloprojinfos", MolochProjectInfoSchema);