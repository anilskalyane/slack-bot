const homeView = require('../views/home_view');
const listInvites = require('../../utils/list_invites');
const dbQuery = require('../../database/find_user');

const sharedChannelInviteDeclined = async ({ client, event }) => {
  // try {
  //   // when we get an event that our invite was declined, we want to update the apps home page
  //   console.log(event);

  //   const teamID = await event.invite.inviting_user.team_id;
  //   const userID = await event.invite.inviting_user.id;
  //   const homeblocks = await homeView.homeBlocks();
  //   const inviteBlocks = await listInvites(client, userID);
  //   const newBlocks = await homeblocks.concat(inviteBlocks);
  //   const curUser = await dbQuery.findUser(teamID);
  //   const curUserId = curUser.user.id;
  //   await client.views.publish({
  //     user_id: curUserId,
  //     view: {
  //       type: 'home',
  //       blocks: newBlocks,
  //       private_metadata: curUserId,
  //     },
  //   });
  //   // This means that someone has Approved your Slack Connect invite. This step is often needed
  //   // (depending on Org settings) after an invite has been accepted. This event can be used
  //   // to notify Slack Connect Admins when a channel has been approved and is ready to be connected.
  // } catch (error) {
  //   console.error(error);
  // }
};

module.exports = { sharedChannelInviteDeclined };
