module.exports = mongoose => {
    const Slackbot = mongoose.model(
      "slackbot",
      mongoose.Schema(
        {
            access_details: Object,
            team_details: Object
        },
        { timestamps: true }
      )
    );
  
    return Slackbot;
  };