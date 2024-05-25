module.exports  = {
    "api_config":{
        "mongoUrl":process.env.MONGO_DB_HOST,
        //"mongoUrl":"mongodb://localhost:27017/phone_tool_dev?authMechanism=SCRAM-SHA-1",
        "database":process.env.MONGO_DB_NAME,
        "jwt_secret": process.env.JWT_SECRET,
        "jwt_expire_time": process.env.JWT_EXPIRATION_TIME
    }
};