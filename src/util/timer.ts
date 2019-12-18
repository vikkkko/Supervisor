import { CronJob } from "cron";

export class Timer {
    private jobs: CronJob[];
    constructor() {
        this.InitJobs();
    }

    public InitJobs = ()=>{
        this.jobs = [];
    };

    public AddJob = (_jobs: CronJob[]) =>{
        this.jobs = this.jobs.concat(_jobs);
    };
    
    public  StartJob = ()=>{
        this.jobs.forEach(element => {
            element.start();
        });
    };
}



