import mongoose from "mongoose";
export type EventInfoDocument = mongoose.Document & {
    hash: string;
    event: string;
    fields: Array<string>;
    types: Array<string>;
};

const EventInfoSchema = new mongoose.Schema({
    hash: {type:String,unique:true},
    event:String,
    fields: Array,
    types: Array
}, { timestamps: true });

export const EventInfoModel = mongoose.model<EventInfoDocument>("moloprojeventinfo", EventInfoSchema);