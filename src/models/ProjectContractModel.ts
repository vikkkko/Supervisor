import mongoose from "mongoose";
export type ProjectContractDocument = mongoose.Document & {};

const projectContractSchema = new mongoose.Schema({
    projId: String,
    contractName: String,
    type:String,
    fundDecimals:Number,
    contractHash: {type:String,unique:true}
}, { timestamps: true });

export const ProjectContractModel = mongoose.model<ProjectContractDocument>("moloprojhashinfo", projectContractSchema);