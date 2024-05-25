const Sequelize = require('sequelize');

class SqlHelper{

    constructor(){
        this.sequelize = {};
    }

    async createSqlConnection(sqlCredentials) {
        try{
            console.log("sqlCredentials: ",sqlCredentials);    return new Promise(async (resolve,reject)=>{
                this.sequelize = new Sequelize(sqlCredentials.database,sqlCredentials.username,sqlCredentials.password,{
                    "host":sqlCredentials.host,
                    "dialect":"mysql"
                });
                this.sequelize.authenticate()
                    .then(() => {
                        console.log("connection created");
                        resolve({"status":"success"})           
                    })
                    .catch(err => {
                        console.log("err: ",err);
                        reject({"status":"error","message":err});
                    });
            });
        }catch(exceptionError){
            console.log("exceptionError:", exceptionError);
            return {"status":"error","message":exceptionError};
        }        
    }

    async getDataUsingSqlQuery(sqlCredentials,sqlQuery){
        try{
            return new Promise(async (resolve,reject) => {
                let conn = await this.createSqlConnection(sqlCredentials);
                if(conn.status && conn.status=='success'){
                    let result = await this.sequelize.query(sqlQuery,{"plain":false,"raw":false});
                    console.log("Users: ",result[1].length);
                    if(result === null){
                        resolve({"status":"error"});
                    }else{
                        resolve({"status":"success","result":result[1]});
                    }
                }else{
                    console.log("Here here here");
                    throw conn;
                }
            });
        }catch(exceptionError){
            console.log("Here here");
            return {"status":"error","message":exceptionError};
        }
    }
}

module.exports = new SqlHelper();
