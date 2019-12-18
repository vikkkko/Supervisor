import { CronJob, job } from "cron";
import {ProjectInfoModel,ProjectInfoDocument} from "../models/ProjectInfoModel";
import {webLink} from "../util/webLink";
import {ContractJson} from "../util/AbiExec";
import {ContractAddressMgr,ContractName, ReserveTokenInfo} from "./contractAddressMgr";
import {DeployContractFlag} from "./deploy";
import {InitContractFlag} from "./init";
import {nonce} from "./nonce";

export const SetParamsFlag = {
    Executing : "4",
    Done : "5",
    Initing: "6"
};

export class SetParams{
    private address: string;
    constructor(_address: string){
        this.address =_address;
    }

    public async startJob(){
        const job: CronJob = new CronJob("*/5 * * * * *",async()=>{
            try{
                const data = (await ProjectInfoModel.find({"deployContractFlag":DeployContractFlag.Done,"reserveTokenSetFlag":InitContractFlag.Done,"ratioSetFlag":SetParamsFlag.Executing})) ;
                for(let i = 0;i<data.length;i++){
                    if(data[i].ratioSetFlag == SetParamsFlag.Initing)
                        continue;
                    try{
                        data[i].ratioSetFlag = SetParamsFlag.Initing;
                        await data[i].save();
                        if(data[i].type == "daico"){
                            await this.setCoParams(data[i]);
                            data[i].ratioSetFlag = SetParamsFlag.Done;
                            await data[i].save();
                        }
                        else if(data[i].type == "gen"){
                            await this.setCoParams(data[i]);
                            data[i].ratioSetFlag = SetParamsFlag.Done;
                            await data[i].save();
                        }
                    }catch(e){
                        console.log(e);
                        data[i].ratioSetFlag = SetParamsFlag.Executing;
                        await data[i].save();
                    }
                }
            }catch(e){
                console.log(e);
            }
        },null,true);

        const job2: CronJob = new CronJob("*/5 * * * * *",async()=>{
            try{
                const data = (await ProjectInfoModel.find({"deployContractFlag":DeployContractFlag.Done,"reserveTokenSetFlag":InitContractFlag.Done,"ratioSetFlag":SetParamsFlag.Done,"financeStartFlag":SetParamsFlag.Executing})) ;
                for(let i = 0;i<data.length;i++){
                    if(data[i].financeStartFlag == SetParamsFlag.Initing)
                        continue;
                    try{
                        data[i].financeStartFlag = SetParamsFlag.Initing;
                        await data[i].save();
                        if(data[i].type == "daico"){
                            await this.start(data[i]);
                            data[i].financeStartFlag = SetParamsFlag.Done;
                            await data[i].save();
                        }
                        else if(data[i].type == "gen"){
                            await this.start(data[i]);
                            data[i].financeStartFlag = SetParamsFlag.Done;
                            await data[i].save();
                        }
                    }catch(e){
                        console.log(e);
                        data[i].financeStartFlag = SetParamsFlag.Executing;
                        await data[i].save();
                    }
                }
            }catch(e){
                console.log(e);
            }
        },null,true);
    }
    public async setCoParams(_projectInfoD: ProjectInfoDocument){
        console.log(`开始设置${_projectInfoD.projId}的alpha值${_projectInfoD.reserveFundRatio}`);
        const contractAddresses = _projectInfoD.contractAddresses;
        const abi: JSON[] = ContractJson.get(ContractName.Co).abi;
        const contract = new webLink.web3.eth.Contract(abi,contractAddresses.CoAddress);
        await contract.methods.changeAlpha(
            _projectInfoD.reserveFundRatio * 10
            ).send({
                from:this.address,
                gas:5500000
            });
        console.log("设置结束");
    }

    public async start(_projectInfoD: ProjectInfoDocument){
        console.log("开始");
        const contractAddresses = _projectInfoD.contractAddresses;
        const abi: JSON[] = ContractJson.get(ContractName.TradeFundPool).abi;
        const contract = new webLink.web3.eth.Contract(abi,contractAddresses.TradeAddress);
        await contract.methods.start()
        .send({
                from:this.address,
                gas:5500000
            });
        console.log("开始成功");
    }
}