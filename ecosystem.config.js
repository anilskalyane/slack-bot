require('dotenv').config();
// const node_args =   `--max_semi_space_size=64 --prof --logfile=${process.env.HEAPDUMP_PATH}profiles/${os.hostname()+Date.now()}.log`;
const node_args =   `--max_semi_space_size=64`;

console.log(`PM2 starting at ${node_args}`);

module.exports = {
  apps : [
  {
    name                : "slack-app",
    script              : "app.js",
    node_args           : node_args,
    time                : true,
    //exec_mode           : "cluster_mode",
    //instances          : 'max',
    log_date_format     : "DD-MM HH:mm:ss.SSS",
    watch               : false,
    autorestart         : true,
    error_file          : "logs/err.log",
    out_file            : "logs/out.log",
  },
  ]
}
