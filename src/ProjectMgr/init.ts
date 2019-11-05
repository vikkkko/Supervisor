import { CronJob, job } from "cron";
import {ProjectInfoModel,ProjectInfoDocument} from "../models/ProjectInfoModel";
import {webLink} from "../webLink";
import {ContractJson} from "../AbiExec";
import {ContractAddressMgr,ContractName, ReserveTokenInfo} from "./contractAddressMgr";
import {DeployContractFlag} from "./deploy";
import { now } from "moment";
import {nonce} from "./nonce";

export const InitContractFlag = {
    Executing : "4",
    Done : "5",
    Initing: "6"
};

export class Init{
    private address: string;
    constructor(_address: string){
        this.address =_address;
    }

    public async startJob(){
        const job: CronJob = new CronJob("*/5 * * * * *",async()=>{
            try{
                const data = (await ProjectInfoModel.find({"deployContractFlag":DeployContractFlag.Done,"rewardSetFlag":InitContractFlag.Executing})) ; ///合约已经发布完成，但是预发token为4
                for(let i = 0;i<data.length;i++){
                    if(data[i].rewardSetFlag == InitContractFlag.Initing)
                        continue;
                    try{
                        data[i].rewardSetFlag = InitContractFlag.Initing;
                        await data[i].save();
                        if(data[i].type == "daico"){
                            await this.initDaicoContract(data[i]);
                            data[i].rewardSetFlag = InitContractFlag.Done;
                            await data[i].save();
                        }
                        else if(data[i].type == "gen"){
                            await this.initDaicoContract(data[i]);
                            data[i].rewardSetFlag = InitContractFlag.Done;
                            await data[i].save();
                        }
                    }catch(e){
                        console.log(e);
                        data[i].rewardSetFlag = InitContractFlag.Executing;
                        await data[i].save();
                    }
                }
            }catch(e){
                console.log(e);
            }
        },null,true);
    }
    public async initDaicoContract(_projectInfoD: ProjectInfoDocument){
        console.log(`开始初始化daico系列合约:${_projectInfoD.projId}`);
        await this.initAppManager(_projectInfoD.contractAddresses);
        await this.addPermission(_projectInfoD);
        await this.preMint(_projectInfoD.reserveTokenInfo,_projectInfoD.contractAddresses);
        console.log(`完成初始化daico系列合约:${_projectInfoD.projId}`);
    }
    ///初始化appmanager的参数，其实就是将其他合约在这里存一下
    public async initAppManager(contractAddressMgr: ContractAddressMgr){
        const abi: JSON[] = ContractJson.get(ContractName.AppManager).abi;
        const contract = new webLink.web3.eth.Contract(abi,contractAddressMgr.AppManagerAddress);
        await contract.methods.initialize(
            contractAddressMgr.TradeAddress,
            contractAddressMgr.GovernAddress,
            contractAddressMgr.FdTokenAddress,
            contractAddressMgr.DateTimeAddress
            ).send({
                from:this.address,
                gas:5500000
            });
        console.log("初始化AppManager成功");
    }
    ///权限赋予   先同步一个个发  后续改成异步发
    public async addPermission(_projectInfoD: ProjectInfoDocument){
        const contractAddresses = _projectInfoD.contractAddresses;
        const abi: JSON[] = ContractJson.get(ContractName.AppManager).abi;
        const contract = new webLink.web3.eth.Contract(abi,contractAddresses.AppManagerAddress);


        //this.address 调用trade中的premint
        await contract.methods.addPermission(
            this.address,
            contractAddresses.TradeAddress,
            "0x3d63953bfada0c4cc3cea0a09daef824e50d00b680559062be96929898578847"
            ).send({
                from:this.address,
                gas:5500000
            });
        console.log("this.address 调用trade中的premint");


        //trade 调用govern中的mintbinding
        await contract.methods.addPermission(
            contractAddresses.TradeAddress,
            contractAddresses.GovernAddress,
            "0x90082550767d5a2f7196a325c6d91cb52f47d8a922a77189cc84925afee3574e"
            ).send({
                from:this.address,
                gas:5500000
            });
        console.log("trade 调用govern中的mintbinding");


        //trade 调用token中的mint
        await contract.methods.addPermission(
            contractAddresses.TradeAddress,
            contractAddresses.FdTokenAddress,
            "0x54c9f1283e9f2dd8858b45ec09e87377146697f4468e979b832606cf5954ed0b"
            ).send({
                from:this.address,
                gas:5500000
            });
        console.log("trade 调用token中的mint");


        //trade 调用token中的burn
        await contract.methods.addPermission(
            contractAddresses.TradeAddress,
            contractAddresses.FdTokenAddress,
            "0xb86787f628420ba4ed6ba9364dd1acd561500c39fafe020b677105105ce114f5"
            ).send({
                from:this.address,
                gas:5500000
            });
        console.log("trade 调用token中的burn");


        //this.address 调用trade中的start 0x7f7e25135283e50a436a940ff8fe4d12953b806cbb3bf028071414efdafaed89
        await contract.methods.addPermission(
            this.address,
            contractAddresses.TradeAddress,
            "0x7f7e25135283e50a436a940ff8fe4d12953b806cbb3bf028071414efdafaed89"
            ).send({
                from:this.address,
                gas:5500000
            });
        console.log("this.address 调用trade中的start");


        //this.address 调用co中的changeAlpha
        await contract.methods.addPermission(
            this.address,
            contractAddresses.CoAddress,
            "0x6665777ac77cd9d049abdc0dc3b1d350af557df5539a73a46525f733a956c5a0"
            ).send({
                from:this.address,
                gas:5500000
            });
        console.log("this.address 调用co中的changeAlpha");


        //admin 调用trade中的start
        await contract.methods.addPermission(
            _projectInfoD.adminAddress,
            contractAddresses.TradeAddress,
            "0x7f7e25135283e50a436a940ff8fe4d12953b806cbb3bf028071414efdafaed89"
            ).send({
                from:this.address,
                gas:5500000
            });
        console.log("this.address 调用co中的changeAlpha");
    }

    //预发一些token
    public async preMint(_reserveTokenInfos: Array<ReserveTokenInfo>,contractAddressMgr: ContractAddressMgr){
        const abi: JSON[] = ContractJson.get(ContractName.TradeFundPool).abi;
        const contract = new webLink.web3.eth.Contract(abi,contractAddressMgr.TradeAddress);
        for(let i = 0;i<_reserveTokenInfos.length;i++){
            const r = _reserveTokenInfos[i];
            const address = r.address;
            const infos = r.info;
            for(let i = 0;i<infos.length;i++){
                const amt = infos[i].amt;
                const days: number = infos[i].days;
                const timestamp = parseInt((now()/1000).toString()) + days*24*60*60;
                await contract.methods.preMint(
                    address,
                    amt,
                    timestamp
                    ).send({
                        from:this.address,
                        gas:5500000
                    });
                console.log(`预发token给${address}，数量为${amt},到期时间为${timestamp}`);
            }
        }
    }
}