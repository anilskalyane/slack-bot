// Load the AWS SDK for Node.js
var AWS = require('aws-sdk');
// Set the region 
AWS.config.update({region: 'us-east-1'});

class EmailHelper{

    async sendEmail(options){
        try {
            return new Promise((resolve,reject)=>{
                let params = {
                    Destination: {},
                    Message: { 
                        Body: {},
                        Subject: {}
                      }
                  };
                if(options.to_email){
                    if(Array.isArray(options.to_email)){
                        params["Destination"]["ToAddresses"]=options.to_email;
                    }else{
                        params["Destination"]["ToAddresses"]=[options.to_email];
                    }
                }
                if(options.cc_email){
                    if(Array.isArray(options.cc_email)){
                        params["Destination"]["CcAddresses"]=options.cc_email;
                    }else{
                        params["Destination"]["CcAddresses"]=[options.cc_email];
                    }
                }
                if(options.reply_email){
                    if(Array.isArray(options.reply_email)){
                        params["ReplyToAddresses"]=options.reply_email;
                    }else{
                        params["ReplyToAddresses"]=[options.reply_email];
                    }
                }
                if(options.from_email){
                        params["Source"]=options.from_email;
                }
                if(options.subject){
                    params["Message"]["Subject"]={
                                                Charset: 'UTF-8',
                                                Data: options.subject
                                            };
                }
                if(options.html_content){
                    params["Message"]["Body"]["Html"]={
                        Charset: 'UTF-8',
                        Data: options.html_content
                    };
                }
                if(options.text_content){
                    params["Message"]["Body"]["Text"]={
                        Charset: 'UTF-8',
                        Data: options.text_content
                    };
                }
    
                // Create the promise and SES service object
                var sendPromise = new AWS.SES({apiVersion: '2010-12-01'}).sendEmail(params).promise();
                // Handle promise's fulfilled/rejected states
                sendPromise.then(
                    function(data) {
                      resolve({"status":"success","data":data.MessageId,"message":"Email sent successfully"})
                    }).catch(
                      function(err) {
                      resolve({"status":"error","data":err.stack,"message":"Email sent failed"})
                    });
                
            });
        } catch (error) {
            let result = {"status":"error","message":error};
            console.log(result);
            return result;
        }
        
    }
}
module.exports = new EmailHelper();



