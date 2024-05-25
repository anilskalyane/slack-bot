const { App, LogLevel } = require('@slack/bolt');
const { registerListeners } = require('./listeners');
const customRoutes = require('./utils/custom_routes');
const app_menu = require('./src/config/menu.json')
const HifivesApi = require('./src/controllers/HifivesApi.js');
const db = require("./src/models");
const Slackbot = db.slackbot;

// Initialize your custom receiver
// const awsLambdaReceiver = new AwsLambdaReceiver({
//     signingSecret: "a20c5226b749fbd19c6e42ca8a281415",
//   });

const databaseData = {};
const database = {
    set: async (key, data) => {
        databaseData[key] = data
    },
    get: async (key) => {
        return databaseData[key];
    },
};

const authorizeFn = async ({ teamId, enterpriseId }) => {
    console.log(teamId);
    // Fetch team info from database
    await db.mongoose
        .connect(process.env.DB_CONNECTION_STRING, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })
        .then(() => {
            console.log("Connected to the database!");
        })
        .catch(err => {
            console.log("Cannot connect to the database!", err);
            process.exit();
        });
    await Slackbot.find({ "access_details.team.id": teamId })
        .then(data => {
            if (!data)
                console.log("Not found slack user with team " + teamId);
            else {
                console.log(data[0].access_details);
                return {
                    // You could also set userToken instead
                    botToken: data[0].access_details.access_token,
                    botId: data[0].access_details.app_id,
                    botUserId: data[0].access_details.bot_user_id
                };
            }
        })
        .catch(err => {
            console.log("Error retrieving slack with team=" + teamId);
        });
}

// Initializes your app with your bot token and app token
const app = new App({
    //token: process.env.SLACK_BOT_TOKEN,
    socketMode: false,
    appToken: process.env.SLACK_APP_TOKEN,
    clientId: process.env.SLACK_CLIENT_ID,
    clientSecret: process.env.SLACK_CLIENT_SECRET,
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    // LogLevel can be imported and used to make debugging simpler
    logLevel: LogLevel.DEBUG,
    //customRoutes: customRoutes.customRoutes,
    //processBeforeResponse: true,
    //receiver: awsLambdaReceiver
    stateSecret: 'my-state-secret',
    scopes: [process.env.SLACK_SCOPES],
    //authorize: authorizeFn,
    developerMode: true,
    installationStore: {
        storeInstallation: async (installation) => {
            console.log("storeInstallation-1");
            console.log(installation);
            let slackBotResponse = {};
            await db.mongoose
                .connect(process.env.DB_CONNECTION_STRING, {
                    useNewUrlParser: true,
                    useUnifiedTopology: true
                })
                .then(() => {
                    console.log("Connected to the database!");
                })
                .catch(err => {
                    console.log("Cannot connect to the database!", err);
                    process.exit();
                });
            const slackbot = new Slackbot({
                access_details: installation
            });
            // change the line below so it saves to your database
            if (installation.isEnterpriseInstall && installation.enterprise !== undefined) {
                // support for org wide app installation
                console.log("storeInstallation-2");
                slackBotResponse = await slackbot.save(installation)
                    .then(data => {
                        console.log(data);
                        return data;
                    })
                    .catch(err => {
                        console.log("Error retrieving slack with team=" + installation.team.id);
                    });
                return slackBotResponse;
                //return await database.set(installation.enterprise.id, installation);
            }
            if (installation.team !== undefined) {
                console.log("storeInstallation-3");
                // single team app installation

                slackBotResponse = await slackbot.save(installation)
                    .then(data => {
                        console.log(data);
                        return data;
                    })
                    .catch(err => {
                        console.log("Error retrieving slack with team=" + installation.team.id);
                    });
                console.log("storeInstallation-4");
                return slackBotResponse;
                //return await database.set(installation.team.id, installation);
            }
            throw new Error('Failed saving installation data to installationStore');
        },
        fetchInstallation: async (installQuery) => {
            let slackBotResponse = {};
            console.log("fetchInstallation-1");
            // change the line below so it fetches from your database
            if (installQuery.isEnterpriseInstall && installQuery.enterpriseId !== undefined) {
                // org wide app installation lookup
                console.log("fetchInstallation-2");
                return await database.get(installQuery.enterpriseId);
            }
            if (installQuery.teamId !== undefined) {
                console.log("fetchInstallation-3");
                // single team app installation lookup
                await db.mongoose
                    .connect(process.env.DB_CONNECTION_STRING, {
                        useNewUrlParser: true,
                        useUnifiedTopology: true
                    })
                    .then(() => {
                        console.log("Connected to the database!");
                    })
                    .catch(err => {
                        console.log("Cannot connect to the database!", err);
                        process.exit();
                    });
                slackBotResponse = await Slackbot.find({ "access_details.team.id": installQuery.teamId })
                    .then(data => {
                        if (!data)
                            console.log("Not found slack user with team " + installQuery.teamId);
                        else {
                            console.log("fetchInstallation-4");
                            console.log(data[0].access_details);
                            return data[0].access_details;
                        }
                    })
                    .catch(err => {
                        console.log("Error retrieving slack with team=" + installQuery.teamId);
                    });
                console.log("fetchInstallation-5");
                //console.log(await database.get(installQuery.teamId));
                //return await database.get(installQuery.teamId);
                return slackBotResponse;
            }
            throw new Error('Failed fetching installation');
        }
    },
    installerOptions: {
        // If this is true, /slack/install redirects installers to the Slack authorize URL
        // without rendering the web page with "Add to Slack" button.
        // This flag is available in @slack/bolt v3.7 or higher
        directInstall: true,
    }
});

app.event('app_uninstalled', async ({ event, logger, context }) => {
    try {
        let slackBotResponse = {};
        await db.mongoose
                .connect(process.env.DB_CONNECTION_STRING, {
                    useNewUrlParser: true,
                    useUnifiedTopology: true
                })
                .then(() => {
                    console.log("Connected to the database!");
                })
                .catch(err => {
                    console.log("Cannot connect to the database!", err);
                    process.exit();
                });
        // change the line below so it deletes from your database
        if (context.isEnterpriseInstall && context.enterpriseId !== undefined) {
            // org wide app installation deletion
            slackBotResponse = await Slackbot.deleteMany({ "access_details.team.id": context.teamId })
                .then(data => {
                        console.log("Deleted the record!");
                        return data;
                })
                .catch(err => {
                    console.log("Error retrieving slack with team=" + context.teamId);
                });
                return slackBotResponse;
        }
        if (context.teamId !== undefined) {
            // single team app installation deletion
            slackBotResponse = await Slackbot.deleteMany({ "access_details.team.id": context.teamId })
                .then(data => {
                    console.log("Deleted the record!");
                        return data;
                })
                .catch(err => {
                    console.log("Error retrieving slack with team=" + context.teamId);
                });
                return slackBotResponse;
        }
    }
    catch (error) {
      logger.error(error);
    }
  });

app.error(async (error) => {
    // Check the details of the error to handle cases where you should retry sending a message or stop the app
    console.error(error);
});

app.shortcut('nominate', async ({ shortcut, ack, client, logger }) => {
    console.log(shortcut);
    try {
        await createNominationModal(ack, logger, client, shortcut.user.id, shortcut.trigger_id, '', shortcut, 1);
    }
    catch (error) {
        logger.error(error);
    }
})

app.message('HiFives', async ({ message, client, logger }) => {

    try {
        const userDetails = await userBasicDetails(message.user, message.team);
        const hifivesapiObj = new HifivesApi();
        const response = await hifivesapiObj.getUserDetails(userDetails.email);
        let userResponseData = JSON.parse(response);
        if ("error" in userResponseData && userResponseData.error) {
            msg = userResponseData.error;
            await postStatusMessage(client, message.channel, message.user, "Sorry, we are unable to find the employee. Please contact your HR for assistance");
            return true;
        }
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

app.message('hifives', async ({ message, client, logger, ack }) => {
    console.log("message data", message);
    try {
        const userDetails = await userBasicDetails(message.user, message.team);
        const hifivesapiObj = new HifivesApi();
        const response = await hifivesapiObj.getUserDetails(userDetails.email);
        let userResponseData = JSON.parse(response);
        if ("error" in userResponseData && userResponseData.error) {
            msg = userResponseData.error;
            await postStatusMessage(client, message.channel, message.user, "Sorry, we are unable to find the employee. Please contact your HR for assistance");
            return true;
        }
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
    console.log(body);
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

        const userDetails = await userBasicDetails(userId, body.user.team_id);
        const nomineeDetails = await userBasicDetails(awardRecipient, body.user.team_id);

        if (typeof nomineeDetails.email == "undefined" || !nomineeDetails.email) {
            await ack({
                response_action: 'errors',
                errors: {
                    award_recipient: 'Sorry, we are unable to find the employee based on the details provided by you',
                },
            });
            return;
        }
        //await ack();
        await ack({ "response_action": "clear" });
        if (typeof userDetails.email == "undefined" || !userDetails.email) {
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
                return true;
            }
            if ("error" in nomineeResponseData && nomineeResponseData.error) {
                msg = nomineeResponseData.error;
                await postStatusMessage(client, channelId, userId, "Sorry, we are unable to find the employee based on the details provided by you");
                return true;
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
        await createNominationModal(ack, logger, client, body.user.id, body.trigger_id, 'channel' in body ? body.channel.id : '', body);
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

async function userBasicDetails(userId, teamId="") {
    try {
        let param = {
            user: userId
        };
        if(teamId){
            await db.mongoose
            .connect(process.env.DB_CONNECTION_STRING, {
                useNewUrlParser: true,
                useUnifiedTopology: true
            })
            .then(() => {
                console.log("Connected to the database!");
            })
            .catch(err => {
                console.log("Cannot connect to the database!", err);
                process.exit();
            });
        const slackBotResponse = await Slackbot.find({ "access_details.team.id": teamId })
            .then(data => {
                if (!data)
                    console.log("Not found slack user with team " + teamId);
                else {
                    console.log("fetchInstallation-4");
                    console.log(data[0].access_details);
                    return data[0].access_details;
                }
            })
            .catch(err => {
                console.log("Error retrieving slack with team=" + teamId);
            });
            param = {
                user: userId,
                token: slackBotResponse.bot.token
            };
        }
       
        // Call the users.info method using the WebClient
        const result = await app.client.users.info(param);
        console.log(result);
        return result.user.profile;

    }
    catch (error) {
        console.error(error);
    }
}

async function postStatusMessage(client, channelId, userId, msg, prefix = "ERROR :") {
    const msgText = prefix ? prefix + msg : msg;
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

async function createNominationModal(ack, logger, client, userId, trigger_id, channelId = '', body = {}, isShortcut=0) {
    // Acknowledge the action
    // ID of user you watch to fetch information for
    //const userId = body.user.id;
    const teamId = isShortcut? body.team.id:body.user.team_id;
    console.log("userId", userId);
    const userDetails = await userBasicDetails(userId, teamId);
    const hifivesapiObj = new HifivesApi();
    console.log("userDetails", userDetails);
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
                        "value": `${rewardSubcategories[subcategories]['id']}` + '_' + `${rewardSubcategories[subcategories]['minPoints']}`
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
    } catch (error) {
        console.error('Unable to start App', error);
    }
})();

// Handle the Lambda function event
// module.exports.handler = async (event, context, callback) => {
//     const handler = await awsLambdaReceiver.start();
//     return handler(event, context, callback);
//   }