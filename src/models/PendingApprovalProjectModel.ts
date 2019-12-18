import mongoose from "mongoose";
export type PendingApprovalProjectDocument = mongoose.Document & {
    projType: string;
    projId: string;
    projName: string;
    projDescription: string;
    molochDaoAddress: string;
    projUrl: string;
    email: string;
    approved: string;
    description: string;
    minimumTribute: string;
    summoner: string;
};

const PendingApprovalProjectSchema = new mongoose.Schema({
    projType: String,
    projId:String,
    projName:String,
    projDescription: String,
    molochDaoAddress: String,
    projUrl: String,
    email: String,
    approved : String,
    description : String,
    minimumTribute : String,
    summoner : String
}, { timestamps: true });

export const PendingApprovalProjectModel = mongoose.model<PendingApprovalProjectDocument>("pendingapprovalproj", PendingApprovalProjectSchema);