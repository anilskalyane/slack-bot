//const sqlHelper = require('../helpers/SqlHelper');
//const mongoHelper = require('../helpers/MongoHelper');
//const configData = require('../config/db');
const requestObj = require('request');
require('dotenv').config();

class HifivesApi {

    constructor() {
        this.key = 'api_config';
    }


    async userLogin(requestData) {
        //API call
        const options = {
            'method': 'POST',
            'url': 'https://' + process.env.APP_API_DOMAIN + '/api/authAPI',
            'headers': {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "email": requestData.email,
                "ssoFlag": true
            })

        };
        requestObj(options, function (error, response) {
            //console.log("Response data",response);
            let userResponseData = JSON.parse(response.body);
            if (typeof userResponseData.error == "undefined" || userResponseData.error) {
                return JSON.stringify({ status: false, message: userResponseData.error })
            }
            //end api call

            // mongoHelper.insertDataInMongoDB(configData[appKey].mongoUrl, configData[appKey].database,"whatsapp_temp_data", {
            //     "email": userResponseData.result.companyEmail,
            //     "mobileNumber": userResponseData.result.mobileNumber,
            //     "user_app_token": userResponseData.result.token,
            //     "nominationData": {"customerID": userResponseData.result.id, "companyID": userResponseData.result.companyID },
            //     "userData": userResponseData.result
            // },
            // {"mobileNumber": userResponseData.result.mobileNumber}
            // );
            console.log(JSON.stringify({ status: true, message: userResponseData.result }));
            return JSON.stringify({ status: true, message: userResponseData.result });
        });
    }

    getRewardTypes(token, companyID, customerID, type = "individual") {
        return new Promise(async resolveOuter => {
            const options = {
                'method': 'POST',
                'url': 'https://' + process.env.APP_API_DOMAIN + '/api/nominate/awardCategories',
                'headers': {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "companyID": companyID,
                    "customerID": customerID,
                    "token": token,
                    "type": type
                })

            };
            requestObj(options, function (error, response) {
                if (error) throw new Error(error);
                //console.log(response.body);
                resolveOuter(response.body);
                return true;
            });
        });
    }

    getUserDetails(email, ssoFlag = true) {
        return new Promise(async resolveOuter => {
            const options = {
                'method': 'POST',
                'url': 'https://' + process.env.APP_API_DOMAIN + '/api/authAPI',
                'headers': {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "email": email,
                    "ssoFlag": ssoFlag
                })

            };
            requestObj(options, function (error, response) {
                if (error) throw new Error(error);
                //console.log(response.body);
                resolveOuter(response.body);
                return true;
            });
        });
    }

    saveNominatedata(nominateData) {
        return new Promise(async resolveOuter => {
            const options = {
                'method': 'POST',
                'url': 'https://' + process.env.APP_API_DOMAIN + '/api/nominate/saveSelfNomination',
                'headers': {
                    'authorization': 'Bearer ' + nominateData.user_app_token,
                    'Content-Type': 'application/json',
                    'connection': 'Keep-Alive'
                },
                body: JSON.stringify({
                    "RewardCitation": nominateData.RewardCitation,
                    "company_values_id": nominateData.company_values_id,
                    "emessage": "",
                    "rewardPoints": nominateData.rewardPoints,
                    "rewardType": nominateData.rewardType,
                    "team_id": "",
                    "team_name": "",
                    "companyEmail": nominateData.companyEmail,
                    "teamEmails": "",
                    "buttonType": "Award",
                    "customerID": nominateData.customerID,
                    "companyID": nominateData.companyID
                })

            };
            // console.log(options);
            requestObj(options, function (error, response) {
                const userResponseData = JSON.parse(response.body);
                if (typeof userResponseData.error !== "undefined") {
                    console.log(response.body);
                    resolveOuter({
                        "status": "error",
                        "data": userResponseData.error
                    });
                }
                console.log(response.body);
                resolveOuter({
                    "status": "success",
                    "data": response.body
                });
            });
        });
    }
}

module.exports = HifivesApi;