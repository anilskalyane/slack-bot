const app_menu = require('./../../src/config/menu.json')

// UI blocks which are always displayed on the App Home page.
const homeBlocks = async (userID) => {
  const blocks = [
		{
			"type": "section",
			"text": {
				"type": "mrkdwn",
				"text": `Hey <@${userID}>! 👋 \n\n The HiFives App once installed in your Slack Workspace would allow your managers and employees to recognize their team members/ co-workers from within Slack. This would improve the participation rates significantly and help drive your employee recognition program.\n\nThere are two ways to quickly nominate someone using the HiFives App:`
			}
		},
		{
			"type": "section",
			"text": {
				"type": "mrkdwn",
				"text": "*1️⃣ Use the `nominate` shorcut*. Just type `nominate` in the shortcuts searchbox that can initiated from the shortcuts button in the message composer of the channel."
			}
		},
		{
			"type": "image",
			"title": {
				"type": "plain_text",
				"text": "nominate-shortcut",
				"emoji": true
			},
			"image_url": "https://www.hifives.in/wp-content/uploads/2023/03/nominate-shortcut-slack_720.png",
			"alt_text": "nominate-shortcut"
		},
		{
			"type": "section",
			"text": {
				"type": "mrkdwn",
				"text": "*2️⃣ Use the nominate menu.* If you want to nominate from the message box of the app directly, just type `hifives` to start the conversation."
			}
		},
		{
			"type": "image",
			"title": {
				"type": "plain_text",
				"text": "hifives-message",
				"emoji": true
			},
			"image_url": "https://www.hifives.in/wp-content/uploads/2023/03/hifives-message-slackeevent.png",
			"alt_text": "hifives-message"
		},
		{
			"type": "divider"
		},
		{
			"type": "section",
			"text": {
				"type": "mrkdwn",
				"text": "*If you want to know more about this app, please visit our <https://www.hifives.in/slack-app/|Slack app page> Or you can watch <https://www.youtube.com/watch?v=6NyQu1mx9OE|this short video> on how it works.*"
			}
		},
		{
			"type": "section",
			"text": {
				"type": "mrkdwn",
				"text": "*To know more about the HiFives Employee Rewards, Recognition and Engagement Platform, please visit <https://www.hifives.in/|our website>*."
			}
		},
		{
			"type": "section",
			"text": {
				"type": "mrkdwn",
				"text": "*If your organization is already using HiFives, but do not have a user account yourself, please get in touch with your HR/ administrator*."
			}
		},
		{
			"type": "section",
			"text": {
				"type": "mrkdwn",
				"text": "*If you organization is not using HiFives and you would like to get a demo of the platform, please <https://www.hifives.in/digitize-automate-and-transform-employee-rewards-and-recognition/|get in touch> with us now!*"
			}
		},
		{
			"type": "divider"
		},
		{
			"type": "context",
			"elements": [
				{
					"type": "mrkdwn",
					"text": "❓How to get help? - Just email us at contactus@hifives.in"
				}
			]
		}
	];
  return blocks;
};

module.exports = { homeBlocks };
