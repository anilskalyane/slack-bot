const https = require('https');
                                                                                                                                                                                                                                                                                                                                                                                                                                                
class HttpHelper{

    constructor(){
        
    }

    sendRequest(options,postData) {
        try{
            return new Promise(async (resolve,reject)=>{
                console.log("Call Option: ",options);
                console.log("Call postData: ",postData);
                let requestResult = {"status":"error"};
                var req = https.request(options, function (res) {
                    var result = '';
                    res.on('data', function (chunk) {
                        result += chunk;
                    });
                    res.on('end', function () {
                        console.log("cal Res: end",result);
                        requestResult = {"status":"success","result":result};
                        resolve(requestResult);
                    });
                    res.on('error', function (err) {
                        console.log("cal Res: err ",err);
                        requestResult.result = err;
                        resolve(requestResult);
                    })
                });
   
                // req error
                req.on('error', function (error) {
                    console.log("cal Res: errorerr ",error);
                    requestResult.result = error;
                    resolve(requestResult);
                });
   
                //sending request with the postData form
                console.log("calling post request");
                req.write(postData);
                console.log("closing post request");
                req.end();
            });
        }catch(exceptionError){
            return {"status":"error","message":exceptionError};
        }        
    }
}

module.exports = new HttpHelper();