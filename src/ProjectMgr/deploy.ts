import { CronJob, job } from "cron";
import {ProjectInfoModel,ProjectInfoDocument} from "../models/ProjectInfoModel";
import {webLink} from "../webLink";
import {ProjectContractModel,ProjectContractDocument} from "../models/ProjectContractModel";
import {ContractJson} from "../AbiExec";
import {ContractAddressMgr,ContractName} from "./contractAddressMgr";
import {nonce} from "./nonce";
export const DeployContractFlag = {
    Executing : "4",
    Done : "5",
    Deploying: "6"
};

export class Deploy{
    private address: string;
    constructor(_address: string){
        this.address = _address;
    }

    public startJob(){
        const job: CronJob = new CronJob("*/5 * * * * *",async()=>{
            try{
                const data = (await ProjectInfoModel.find({"deployContractFlag":DeployContractFlag.Executing})) ; ///4代表准备好了去部署了,6是已经开始发合约了，部署好了这个字段就是5
                for(let i = 0;i<data.length;i++){
                    if(data[i].deployContractFlag == DeployContractFlag.Deploying)
                        continue;
                    try{
                        data[i].deployContractFlag = DeployContractFlag.Deploying;
                        await data[i].save();
                        /////开始发合约啦
                        if(data[i].type == "daico"){
                            console.log(`开始创建daico系列合约:${data[i].projId}`);
                            const contractAddresses = await this.createDaicoContract(data[i]);
                            data[i].contractAddresses = contractAddresses;
                            data[i].deployContractFlag = DeployContractFlag.Done;
                            await data[i].save();
                            console.log(`完成创建daico系列合约:${data[i].projId}`);
                        }
                        else if(data[i].type == "gen"){
                            console.log(`开始创建gen系列合约:${data[i].projId}`);
                            const contractAddresses = await this.createDaicoContract(data[i]);
                            data[i].contractAddresses = contractAddresses;
                            data[i].deployContractFlag = DeployContractFlag.Done;
                            await data[i].save();
                            console.log(`完成创建gen系列合约:${data[i].projId}`);
                        }
                    }catch(e){
                        console.log(e);
                        data[i].deployContractFlag = DeployContractFlag.Executing;
                        await data[i].save();
                    }
                }
            }catch(e){
                console.log(e);
            }
        },null,true);
    }
    public async deployContract(_contractName: string,_sender: string,..._arguments: any[]){
        const abi: JSON[] = ContractJson.get(_contractName).abi;
        const bytecode = ContractJson.get(_contractName).bytecode;
        const contract = new webLink.web3.eth.Contract(abi);
        const ins = await contract
        .deploy({data:bytecode,arguments:_arguments})
        .send({
            from: _sender,
            gas: 5500000
        });
        return ins.options.address;
    };
    /// 先创建 appmanager
    /// 创建 co 和 fdt 
    /// 创建govern trade  aplyfund clearing
    /// dateTime合约实现创建好 全部用一个
    public async createDaicoContract(_projectInfoD: ProjectInfoDocument): Promise<ContractAddressMgr>{
        const contractAddressMgr = new ContractAddressMgr();
        contractAddressMgr.AppManagerAddress = await this.deployContract(ContractName.AppManager,this.address);
        console.log(`AppManagerAddress:${contractAddressMgr.AppManagerAddress}`);
        contractAddressMgr.CoAddress = await this.deployContract(ContractName.Co,this.address,contractAddressMgr.AppManagerAddress,1000*Math.pow(10,9),0);
        console.log(`CoAddress:${contractAddressMgr.CoAddress}`);
        contractAddressMgr.FdTokenAddress = await this.deployContract(ContractName.FdToken,this.address,contractAddressMgr.AppManagerAddress,_projectInfoD.tokenName,8,_projectInfoD.tokenSymbol);
        console.log(`FdTokenAddress:${contractAddressMgr.FdTokenAddress}`);
        contractAddressMgr.GovernAddress = await this.deployContract(ContractName.GovernShareManager,this.address,contractAddressMgr.AppManagerAddress,contractAddressMgr.FdTokenAddress);
        console.log(`GovernAddress${contractAddressMgr.GovernAddress}`);
        contractAddressMgr.TradeAddress = await this.deployContract(ContractName.TradeFundPool,this.address,contractAddressMgr.AppManagerAddress,contractAddressMgr.FdTokenAddress,0,0,contractAddressMgr.CoAddress);
        console.log(`TradeAddress${contractAddressMgr.TradeAddress}`);
        await contractAddressMgr.save(_projectInfoD.projId);
        return contractAddressMgr;
    }
    public async createGenContract(){
        console.log("开始创建gen系列合约");
    }
}