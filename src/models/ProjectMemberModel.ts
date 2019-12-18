import mongoose from "mongoose";


export type ProjectMemberDocument = mongoose.Document & {
    projId: string;
    delegateKey: string;
    memberAddress: string;
    shares: string;
};

const ProjectMemberSchema = new mongoose.Schema({
    projId:String,
    delegateKey:String,
    memberAddress:String,
    shares:String
});

export const ProjectMemberModel = mongoose.model<ProjectMemberDocument>("molochprojmember", ProjectMemberSchema);

