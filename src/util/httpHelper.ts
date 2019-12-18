import * as https from "https";

class HttpHelper {
    public async RequestAsync(options: https.RequestOptions): Promise<string> {
        return new Promise((resolve,reject)=>{
                const req = https.request(options,res=>{
                    const chunks: any[] = [];

                    res.on("data", function (chunk) {
                      chunks.push(chunk);
                    });
                  
                    res.on("end", function () {
                      const body = Buffer.concat(chunks);
                      resolve(body.toString());
                    });
                });
                req.end();
        });
    }
}

export const httpHelper = new HttpHelper();