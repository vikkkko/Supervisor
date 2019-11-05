import {ProjectContractModel,ProjectContractDocument} from "../models/ProjectContractModel";
export const ContractName = {
    AppManager:"AppManager",
    Co:"Co",
    FdToken:"FdToken",
    GovernShareManager:"GovernShareManager",
    TradeFundPool:"TradeFundPool",
    VoteApplyFund:"Vote_ApplyFund",
    VoteClearing:"Vote_Clearing"
};

export class ReserveTokenInfo{
    public address: string;
    public info: [{amt: number;days: number}];
}

export class ContractAddressMgr{
    public AppManagerAddress: string;
    public CoAddress: string;
    public FdTokenAddress: string;
    public GovernAddress: string;
    public TradeAddress: string;

    public DateTimeAddress: string = "0x628D1Cd08f0c7aaeF0Da0E16472546553beDa0B9";
    public async save(_projId: string){
        await ProjectContractModel.deleteMany({projId:_projId});
        //统一入库
        const projectContractApp = new ProjectContractModel({projId:_projId,contractName:ContractName.AppManager,contractHash:this.AppManagerAddress});
        await projectContractApp.save();

        const projectContractCo = new ProjectContractModel({projId:_projId,contractName:ContractName.Co,contractHash:this.CoAddress});
        await projectContractCo.save();

        
        const projectContractFdT = new ProjectContractModel({projId:_projId,contractName:ContractName.FdToken,contractHash:this.FdTokenAddress});
        await projectContractFdT.save();

        const projectContractGov = new ProjectContractModel({projId:_projId,contractName:ContractName.GovernShareManager,contractHash:this.GovernAddress});
        await projectContractGov.save();

        const projectContractTra = new ProjectContractModel({projId:_projId,contractName:ContractName.TradeFundPool,contractHash:this.TradeAddress});
        await projectContractTra.save();
    }
}


