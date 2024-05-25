const { App, LogLevel, AwsLambdaReceiver } = require('@slack/bolt');
const { registerListeners } = require('./listeners');
const customRoutes = require('./utils/custom_routes');
const app_menu = require('./src/config/menu.json')
const HifivesApi = require('./src/controllers/HifivesApi.js');

// Initialize your custom receiver
const awsLambdaReceiver = new AwsLambdaReceiver({
    signingSecret: "",
  });

/* 
This sample slack application uses SocketMode
For the companion getting started setup guide, 
see: https://slack.dev/bolt-js/tutorial/getting-started 
*/

// Initializes your app with your bot token and app token
const app = new App({
    token: process.env.SLACK_BOT_TOKEN,
    //socketMode: true,
    appToken: "",
    //signingSecret: "",
    // LogLevel can be imported and used to make debugging simpler
    logLevel: LogLevel.DEBUG,
    customRoutes: customRoutes.customRoutes,
    //processBeforeResponse: true,
    receiver: awsLambdaReceiver
});

app.shortcut('nominate', async ({ shortcut, ack, client, logger }) => {
    try {
        await createNominationModal(ack, logger, client, shortcut.user.id, shortcut.trigger_id);
    }
    catch (error) {
        logger.error(error);
    }
})

app.message('HiFives', async ({ message, client, logger }) => {
    try {
        await client.chat.postEphemeral({
            channel: message.channel,
            user: message.user,
            blocks: [{
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": `Welcome <@${message.user}>! \n\nWhat would like to do today?`
                }
            },
            {
                "type": "divider"
            },
                app_menu
            ]
        });
    }
    catch (error) {
        logger.error(error);
    }
});

app.message('hifives', async ({ message, client, logger }) => {
    try {
        await client.chat.postEphemeral({
            channel: message.channel,
            user: message.user,
            blocks: [{
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": `Welcome <@${message.user}>! \n\nWhat would like to do today?`
                }
            },
            {
                "type": "divider"
            },
                app_menu
            ]
        });
    }
    catch (error) {
        logger.error(error);
    }
});

// Handle a view_submission request
app.view('nomination_submit', async ({ ack, body, view, client, logger }) => {
    // Acknowledge the view_submission request
    //await ack();
    const userId = body.user.id;
    let channelId = '';
    let msg = 'There was an error with your submission';

    try {
        // Assume there's an input block with `block_1` as the block_id and `input_a`
        channelId = view['private_metadata'];
        const awardType = view['state']['values']['award_type']['award_type']['selected_option'];
        const awardRecipient = view['state']['values']['award_recipient']['award_recipient']['selected_user'];
        const citation = view['state']['values']['citation']['citation']['value'];
        const company_values_id = 0;

        const userDetails = await userBasicDetails(userId);
        const nomineeDetails = await userBasicDetails(awardRecipient);
        
        if(typeof nomineeDetails.email  == "undefined" || !nomineeDetails.email){
            await ack({
                response_action: 'errors',
                errors: {
                    award_recipient: 'Sorry, we are unable to find the employee based on the details provided by you',
                },
              });
              return;
        }
        //await ack();
        await ack( { "response_action": "clear" });
        if(typeof userDetails.email == "undefined" || !userDetails.email) {
            msg = "Sorry, we are unable to find the employee based on the details provided by you";
            await postStatusMessage(client, channelId, userId, msg);
            return true;
        }

        console.log("HiFives Object init");
        const hifivesapiObj = new HifivesApi();
        console.log("HiFives Object init - 1");
        const response = await hifivesapiObj.getUserDetails(userDetails.email);
        console.log("HiFives Object init - 2");
        const nomineeResponse = await hifivesapiObj.getUserDetails(nomineeDetails.email);
        console.log("HiFives Object init - end");
        if (response && nomineeResponse) {
            let userResponseData = JSON.parse(response);
            let nomineeResponseData = JSON.parse(nomineeResponse);
            //console.log(userResponseData);
            if ("error" in userResponseData && userResponseData.error) {
                msg = userResponseData.error;
                await postStatusMessage(client, channelId, userId, "Sorry, we are unable to find the employee based on the details provided by you");
                //return true;
            }
            if ("error" in nomineeResponseData && nomineeResponseData.error) {
                msg = nomineeResponseData.error;
                await postStatusMessage(client, channelId, userId, "Sorry, we are unable to find the employee based on the details provided by you");
                //return true;
            }
            
            const user_app_token = userResponseData.result.token;
            const customerID = userResponseData.result.id;
            const companyID = userResponseData.result.companyID;
            const nominateData = {
                "user_app_token": user_app_token,
                "RewardCitation": citation,
                "company_values_id": company_values_id,
                "rewardPoints": awardType.value.split('_')[1],
                "rewardType": awardType.value.split('_')[0],
                "companyEmail": nomineeResponseData.result.companyEmail,
                "buttonType": "Award",
                "customerID": customerID,
                "companyID": companyID
            };
           
            //let nominateResponse = {};
            //nominateResponse.status = "success"
            const nominateResponse = await hifivesapiObj.saveNominatedata(nominateData);
            if (nominateResponse.status == "success") {
                msg = "You have successfully nominated `" + nomineeResponseData.result.firstName + " " + nomineeResponseData.result.lastName + " (" + nomineeResponseData.result.companyEmail + ")` for `" + awardType.text.text + "`. If you want to nominate someone else, please click on nominate from the Menu or Shortcut";
                await postStatusMessage(client, channelId, userId, msg, "");
                return true;
            } else {
                //console.log(nominateResponse);
                msg = nominateResponse.data;
                await postStatusMessage(client, channelId, userId, msg);
                return true;
            }
        }
    }
    catch (error) {
        logger.error(error);
        msg = error;
        await postStatusMessage(client, channelId, userId, msg);
        return true;
    }
});

app.action('nominate_click', async ({ ack, body, client, logger }) => {
    try {
        await createNominationModal(ack, logger, client, body.user.id, body.trigger_id, 'channel' in body ? body.channel.id : '');
    }
    catch (error) {
        logger.error(error);
    }
});

app.action('challenges_click', async ({ body, ack, say }) => {
    // Acknowledge the action
    // ID of user you watch to fetch information for
    const userId = body.user.id;
    const userDetails = await userBasicDetails(userId);
    await ack();
    await say(`<@${body.user.id}> clicked the challenges button (${userDetails.email})`);
});

app.action('review_click', async ({ body, ack, say }) => {
    // Acknowledge the action
    // ID of user you watch to fetch information for
    const userId = body.user.id;
    const userDetails = await userBasicDetails(userId);
    await ack();
    await say(`<@${body.user.id}> clicked the review button (${userDetails.email})`);
});

app.action('redeem_click', async ({ body, ack, say }) => {
    // Acknowledge the action
    // ID of user you watch to fetch information for
    const userId = body.user.id;
    const userDetails = await userBasicDetails(userId);
    await ack();
    await say(`<@${body.user.id}> clicked the redeem button (${userDetails.email})`);
});

app.action('wall_of_fame_click', async ({ body, ack, say }) => {
    // Acknowledge the action
    // ID of user you watch to fetch information for
    const userId = body.user.id;
    const userDetails = await userBasicDetails(userId);
    await ack();
    await say(`<@${body.user.id}> clicked the Wall of Fame button (${userDetails.email})`);
});

app.action('leaderboard_click', async ({ body, ack, say }) => {
    // Acknowledge the action
    // ID of user you watch to fetch information for
    const userId = body.user.id;
    const userDetails = await userBasicDetails(userId);
    await ack();
    await say(`<@${body.user.id}> clicked the leaderboard button (${userDetails.email})`);
});

async function userBasicDetails(userId) {
    try {
        // Call the users.info method using the WebClient
        const result = await app.client.users.info({
            user: userId
        });
        //console.log(result.user.profile);
        return result.user.profile;

    }
    catch (error) {
        console.error(error);
    }
}

async function postStatusMessage(client, channelId, userId, msg, prefix="ERROR :"){
    const msgText = prefix? prefix + msg:msg;
    if (channelId) {
        await client.chat.postEphemeral({
            channel: channelId,
            user: userId,
            text: msgText
        })
    } else {
        await client.chat.postMessage({
            channel: userId,
            text: msgText
        });
    }
    return true;
}

async function createNominationModal(ack, logger, client, userId, trigger_id, channelId = '') {
    // Acknowledge the action
    // ID of user you watch to fetch information for
    //const userId = body.user.id;
    const userDetails = await userBasicDetails(userId);
    const hifivesapiObj = new HifivesApi();
    const response = await hifivesapiObj.getUserDetails(userDetails.email);

    await ack();
    if (response) {
        //console.log("Response data",response);
        let userResponseData = JSON.parse(response);
        if (typeof userResponseData.error == "undefined" || userResponseData.error) {
            //await say(`${userResponseData.error}`);
            await postStatusMessage(client, channelId, userId, userResponseData.error);
            return true;
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
        const user_app_token = userResponseData.result.token;
        const customerID = userResponseData.result.id;
        const companyID = userResponseData.result.companyID;
        const rewardTypes = await hifivesapiObj.getRewardTypes(user_app_token, companyID, customerID);
        const rewardTypesParse = JSON.parse(rewardTypes);
        const rewardTypesResult = rewardTypesParse.result
        const optionGroups = [];
        for (const rewardType in rewardTypesResult) {
            const blockOptions = [];
            const rewardSubcategories = rewardTypesResult[rewardType]['subcategories'];
            if (rewardSubcategories) {
                for (const subcategories in rewardSubcategories) {
                    //console.log(rewardSubcategories[subcategories]['rewardName']);
                    blockOptions.push({
                        "text": {
                            "type": "plain_text",
                            "text": `${rewardSubcategories[subcategories]['rewardName']}`
                        },
                        "value": `${rewardSubcategories[subcategories]['id']}`+'_'+`${rewardSubcategories[subcategories]['minPoints']}`
                    });
                }
            }
            optionGroups.push({
                "label": {
                    "type": "plain_text",
                    "text": `${rewardTypesResult[rewardType]['rewardName']}`
                },
                "options": blockOptions
            });
        }
        try {
            // Call views.open with the built-in client
            const result = await client.views.open({
                // Pass a valid trigger_id within 3 seconds of receiving it
                trigger_id: trigger_id,
                // View payload
                view: {
                    type: 'modal',
                    // View identifier
                    callback_id: 'nomination_submit',
                    title: {
                        type: 'plain_text',
                        text: 'New Nomination',
                        emoji: true
                    },
                    submit: {
                        "type": "plain_text",
                        "text": "Submit",
                        "emoji": true
                    },
                    close: {
                        "type": "plain_text",
                        "text": "Cancel",
                        "emoji": true
                    },
                    private_metadata: channelId,
                    blocks: [
                        // {
                        //     "type": "section",
                        //     "text": {
                        //         "type": "plain_text",
                        //         "text": `:wave: Hey ${userDetails.display_name}!\n\nWe'd love to hear from you how we can make this place the best place you’ve ever worked.`,
                        //         "emoji": true
                        //     }
                        // },
                        {
                            "type": "divider"
                        },
                        {
                            "type": "input",
                            "block_id": 'award_type',
                            "label": {
                                "type": "plain_text",
                                "text": "Please choose from the following Spot Awards",
                                "emoji": true
                            },
                            "element": {
                                "type": "static_select",
                                "action_id": 'award_type',
                                "placeholder": {
                                    "type": "plain_text",
                                    "text": "Select an Reward Type",
                                    "emoji": true
                                },
                                "option_groups": optionGroups
                            }
                        },
                        {
                            "type": "input",
                            "block_id": 'award_recipient',
                            "label": {
                                "type": "plain_text",
                                "text": "Please select the award recipient",
                                "emoji": true
                            },
                            "element": {
                                "type": "users_select",
                                "action_id": 'award_recipient',
                                "placeholder": {
                                    "type": "plain_text",
                                    "text": "Select an award recipient..",
                                    "emoji": true
                                }
                            }
                        },
                        {
                            "type": "input",
                            "block_id": 'citation',
                            "label": {
                                "type": "plain_text",
                                "text": "Write Citation",
                                "emoji": true
                            },
                            "element": {
                                "type": "plain_text_input",
                                "multiline": true,
                                "action_id": 'citation'
                            }
                        }
                    ]
                }
            });
            logger.info(result);
        }
        catch (error) {
            logger.error(error);
        }
    }
}

/** Register Listeners */
registerListeners(app);

/** Start Bolt App */
(async () => {
    try {
        await app.start(process.env.PORT || 3000);
        console.log('⚡️ Bolt app is running! ⚡️');
        //db.connect();
        console.log('DB is connected.');
    } catch (error) {
        console.error('Unable to start App', error);
    }
})();

// Handle the Lambda function event
module.exports.handler = async (event, context, callback) => {
    const handler = await awsLambdaReceiver.start();
    return handler(event, context, callback);
  }