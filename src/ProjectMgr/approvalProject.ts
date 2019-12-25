
import {webLink} from "../util/webLink";
import { CronJob } from "cron";
import {PendingApprovalProjectDocument ,PendingApprovalProjectModel} from "../models/PendingApprovalProjectModel";
import {MolochProjectInfoModel,MolochProjectInfoDocument, ContractInfo} from "../models/MolochProjectInfoModel";
import {ContractJson} from "../util/AbiExec";
import _ from "lodash";
import { now } from "moment";
import { isNull } from "util";
import {httpHelper} from "../util/httpHelper";
import * as https from "https";
import { EnumProcessResult } from "../processer/processer";
import { processer } from "../processer/processer";
import { TransactionDocument } from "../models/TransactionModel";
import { Log } from "web3/types";
import { LogDocument } from "../models/LogModel";
import { ProjectContractModel } from "../models/ProjectContractModel";
import {BlockModel,BlockDocument} from "../models/BlockModel";
import { Int32 } from "bson";
import { promises } from "dns";
import Contract from "web3/eth/contract";

export const ApproveFlag = {
    New : "4",
    Approved : "5",
    Approving: "6"
};

interface MolochParams {
    periodDuration: string;
    votingPeriodLength: string;
    gracePeriodLength: string;
    abortWindow: string;
    proposalDeposit: string;
    processingReward: string;
    approvedToken: string;
    guildBankAddress: string;
}

interface ApprovedTokenParams {
    contractHash: string;
    decimals: number;
    symbol: string;
}

export class ApprovalProject{
    private address: string;

    constructor(_address: string){
        this.address =_address;
    }
    public startJob(){
        const job: CronJob = new CronJob("0 * * * * *",async()=>{
            console.log(now());
            const p: PendingApprovalProjectDocument= await PendingApprovalProjectModel.findOne({approved:ApproveFlag.New});
            if(isNull(p))
                return;
            console.log(`description:${p.description}`);
            try{
                p.approved = ApproveFlag.Approving;
                await p.save();
                const molochParams = await this.GetMolochParams(p.molochDaoAddress);
                const erc20Params = await this.GetErc20Params(molochParams.approvedToken);
                const molochProjInfo: MolochProjectInfoDocument = {
                    projId: p.projId,
                    projName: p.projName,
                    projBrief: p.projTitle,
                    projDetail: p.description,
                    projCoverUrl : "",
                    projType: p.projType,
                    projVersion : p.projVersion,
                    officailWeb : p.projUrl,
                    fundHash : molochParams.approvedToken,
                    fundSymbol : erc20Params.symbol,
                    fundDecimals : erc20Params.decimals,
                    votePeriod : (Number.parseInt(molochParams.periodDuration) * Number.parseInt(molochParams.votingPeriodLength)).toString(),
                    notePeriod : (Number.parseInt(molochParams.periodDuration) * Number.parseInt(molochParams.gracePeriodLength)).toString(),
                    cancelPeriod : (Number.parseInt(molochParams.periodDuration) * Number.parseInt(molochParams.abortWindow)).toString(),
                    periodDuration : molochParams.periodDuration,
                    votingPeriodLength : molochParams.votingPeriodLength,
                    notingPeriodLength : molochParams.gracePeriodLength,
                    cancelPeriodLength : molochParams.abortWindow,
                    proposalDeposit : molochParams.proposalDeposit,
                    proposalReward : molochParams.processingReward,
                    summonerAddress: p.summoner.toLowerCase(),
                    contractHashs : [new ContractInfo("moloch",p.molochDaoAddress),new ContractInfo("guildBank",molochParams.guildBankAddress)],
                    fundTotal : "0",
                    tokenTotal : "",
                    hasTokenCount : 0,
                    time : 0,
                    lastUpdateTime : 0,
                    discussCount : 0,
                    startTime : 0
                } as MolochProjectInfoDocument;
                //存入项目表
                const molochProjectInfo = new MolochProjectInfoModel(molochProjInfo);
                await molochProjectInfo.save();
                //把相关合约存起来
                const molochContract = new ProjectContractModel({projId:p.projId,contractName:"moloch",contractHash:p.molochDaoAddress.toLowerCase(),type:"1",fundDecimals:erc20Params.decimals});
                await molochContract.save();
                const guildBankContract = new ProjectContractModel({projId:p.projId,contractName:"guildBank",contractHash:molochParams.guildBankAddress.toLowerCase(),type:"1",fundDecimals:erc20Params.decimals});
                await guildBankContract.save();
                //获取这个项目之前已经存在的交易并分析进入logs中
                await this.GetAndProcessLogs(p.molochDaoAddress.toLowerCase());
                await this.GetAndProcessLogs(molochParams.guildBankAddress.toLowerCase());
                p.approved = ApproveFlag.Approved;
                await p.save();
            } catch(e) {
                console.log(e);
                p.approved = ApproveFlag.New;
                await p.save();
            }
        },null,true);
    }

    public async GetAndProcessLogs(contractAddress: string){
        let records: any[] = [];
        for(let i =0;i<15;i++){ ///十次妥妥够了
            const options: https.RequestOptions = {
                method:"GET",
                hostname:"web3api.io",
                path:`/api/v2/addresses/${contractAddress}/logs?page=${i}&size=100`,
                headers:{
                    "x-api-key":"UAKc2836bc84f9326ce4737b7dab5be974d",
                    "x-amberdata-blockchain-id": "1c9c969065fcd1cf",
                    "Cache-Control": "no-cache",
                    "Postman-Token": "116261b1-6542-48a4-8131-f39c5d009ee6"
                }
            };
            const data = await httpHelper.RequestAsync(options);
            const _records: any[] = JSON.parse(data)["payload"]["records"];
            if(_records.length == 0)
                break;
            records = records.concat(_records);
        }
        console.log(`records.length:${records.length}`);
        for(let i =0;i<records.length;i++){
            let data = "";
            if(records[i].data){
                records[i].data.forEach((d: string) => {
                    data += d;
                });
            }
            const log: LogDocument = {
                address : records[i].address,
                blockHash : records[i].blockHash,
                blockNumber : records[i].blockNumber,
                data : data,
                logIndex : records[i].logIndex,
                topics : records[i].topics,
                transactionHash : records[i].transactionHash,
                transactionIndex : records[i].transactionIndex,
            } as LogDocument;
            //查询这个log要不要处理（目前只处理我们记录在案的合约，太多的话处理太慢）
            //const needProcess = await ProjectContractModel.findOne({contractHash:log.address.toLowerCase()});
            //if(needProcess){
                const block: BlockDocument = (await webLink.web3.eth.getBlock(records[i].blockNumber)) as BlockDocument;
                await processer.processLog(log,block.timestamp);
            //}
        }
    }

    public async GetMolochParams(molochAddress: string): Promise<MolochParams>{
        const abi: JSON[] = ContractJson.get("Moloch").abi;
        const contract = new webLink.web3.eth.Contract(abi,molochAddress);
        const periodDuration = await contract.methods.periodDuration().call({from:this.address});
        const votingPeriodLength = await contract.methods.votingPeriodLength().call({from:this.address});
        const gracePeriodLength = await contract.methods.gracePeriodLength().call({from:this.address});
        const abortWindow = await contract.methods.abortWindow().call({from:this.address});
        const proposalDeposit = await contract.methods.proposalDeposit().call({from:this.address});
        const processingReward = await contract.methods.processingReward().call({from:this.address});
        const approvedToken = await contract.methods.approvedToken().call({from:this.address});
        const guildBankAddress = await contract.methods.guildBank().call({from:this.address});
        return {periodDuration,votingPeriodLength,gracePeriodLength,abortWindow,proposalDeposit,processingReward,approvedToken,guildBankAddress};
    }

    public async GetErc20Params(contractHash: string): Promise<ApprovedTokenParams>{
        const abi: JSON[] = ContractJson.get("ERC20").abi;
        const contract = new webLink.web3.eth.Contract(abi,contractHash);
        const decimals = await contract.methods.decimals().call();
        const symbol = "";
        return {contractHash,decimals,symbol};
    }
}