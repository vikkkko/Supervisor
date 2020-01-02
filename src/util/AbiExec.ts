import fs from "fs";
import Web3 from "web3";
import {webLink} from "./webLink";
import {EventInfoModel,EventInfoDocument} from "../models/MolochProjectEventInfo";

export const Eventmap: Map<string,EventInfo> = new Map();


class ContractSimpleInfo{
    public abi: any[];
    public bytecode: string;

    constructor(_abi: any[],_bytecode: string){
        this.abi = _abi;
        this.bytecode = _bytecode;
    }
}

export const ContractJson: Map<string,ContractSimpleInfo> = new Map();

export class EventInfo{
    public eventName: string;
    public argsCount: number;
    public argsTypes: string[];
    public argsIndexeds: boolean[];

    constructor(_eventName: string,_argsCount: number,_argsTypes: string[],_argsIndexeds: boolean[]){
        this.eventName = _eventName;
        this.argsCount = _argsCount;
        this.argsTypes = _argsTypes;
        this.argsIndexeds = _argsIndexeds;
    }
}

export class AbiExec{
    public Init() {
        const files = fs.readdirSync("./src/contractJson/");
        files.forEach(async fileName => {
            const file: string = fs.readFileSync("./src/contractJson/"+fileName,{encoding:"utf-8"});
            const jsonFile: any = JSON.parse(file);
            const abi: any[] = jsonFile.abi;
            const bytecode: string = jsonFile.bytecode;
            ContractJson.set(jsonFile.contractName,new ContractSimpleInfo(abi,bytecode));
            abi.forEach(async item => {
                if(item.type == "event"){
                    const eventName: string = item.name;
                    let agrsStr: string = "";
                    const inputs: any[] = item.inputs;
                    const argsTypes: string[]=[]; 
                    const argsNames: string[]=[]; 
                    const argsIndexeds: boolean[] = [];
                    for(let i = 0 ;i<inputs.length;i++){
                        if(i==0){
                            agrsStr += "(";
                        }

                        agrsStr += inputs[i].type;
                        argsTypes.push(inputs[i].type);
                        argsNames.push(inputs[i].name);
                        argsIndexeds.push(inputs[i].indexed);
                        if(i==inputs.length-1){
                            agrsStr += ")"; 
                        }
                        else{
                            agrsStr += ",";
                        }
                    }
                    const str = eventName+agrsStr;

                    const sha3 = webLink.web3.utils.sha3(str);
                    Eventmap.set(sha3,new EventInfo(eventName,inputs.length,argsTypes,argsIndexeds));
                    const eventInfoDocument: EventInfoDocument = {
                        hash : sha3,
                        event : eventName,
                        fields : argsNames,
                        types : argsTypes
                    } as EventInfoDocument;
                    const eventInfoM = new EventInfoModel(eventInfoDocument);
                    await eventInfoM.save();
                    console.log(`${sha3}:${str}`);
                }
            });
        });
    }
}