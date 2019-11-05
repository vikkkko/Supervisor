import mongoose from "mongoose";


export type CounterDocument = mongoose.Document & {
    counter: string;
    lastUpdateIndex: number;
};

const CounterSchema = new mongoose.Schema({
    counter:{type:String,unique:true},
    lastUpdateIndex:Number
});

export const Counter = mongoose.model<CounterDocument>("Counter", CounterSchema);

