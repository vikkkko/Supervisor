import mongoose from "mongoose";


export type CounterDocument = mongoose.Document & {
    counter: string;
    lastUpdateIndex: number;
    timestamp: number;
};

const CounterSchema = new mongoose.Schema({
    counter:{type:String,unique:true},
    lastUpdateIndex:Number,
    timestamp : Number
});

export const Counter = mongoose.model<CounterDocument>("Counter", CounterSchema);

