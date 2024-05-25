'use strict';

const querystring = require('querystring');
const request = require('request');
const installUrl = `https://slack.com/oauth/authorize?client_id=${process.env.SLACK_CLIENT_ID}&scope=${process.env.SLACK_SCOPES}`;
const db = require("./src/models");
const Slackbot = db.slackbot;
let redirectResponse = {
  statusCode: 302,
  headers: {
    Location: installUrl
  }
};
module.exports.handler = (event, context) => {

  const body = JSON.parse(event.body)
  console.log(event.queryStringParameters);
  // const code = body.code

  let messageTest = {
    client_id: process.env.SLACK_CLIENT_ID,
    client_secret: process.env.SLACK_CLIENT_SECRET,
    code: event.queryStringParameters.code
  };

  let queryTest = querystring.stringify(messageTest);

  // Request URL
  var url = 'https://slack.com/api/oauth.v2.access?' + queryTest;

  request(url, (error, response, body) => {
    const responseData = JSON.parse(body);
    console.log(responseData);
    // Printing the error if occurred
    if (error) console.log(error);

    const teamOptions = {
      'method': 'GET',
      'url': 'https://slack.com/api/team.info',
      'headers': {
        'Authorization': 'Bearer ' + responseData.access_token
      }
    };
    request(teamOptions, (teamError, teamResponse, teamBody) => {
      console.log(teamBody);
      const teamResponseData = JSON.parse(teamBody);
      if (teamError) {
        //callback(null, redirectResponse);
        return redirectResponse;
      }

      db.mongoose
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
      // Create a slackbot
      const slackbot = new Slackbot({
        access_details: responseData,
        team_details: teamResponseData
      });

      // Save slackbot in the database
      slackbot
        .save(slackbot)
        .then(data => {
          console.log(data);
          console.log(teamResponseData);

          redirectResponse = {
            statusCode: 302,
            headers: {
              Location: 'https://' + teamResponseData.team.domain + '.slack.com/app_redirect?app=' + responseData.app_id
            }
          };
          console.log(redirectResponse);
          //callback(null, redirectResponse);
          return redirectResponse;
        })
        .catch(err => {
          console.log("Some error occurred while creating the slackbot.", err);
        });
    });
  });
  //callback(null, redirectResponse);
  return redirectResponse;
};