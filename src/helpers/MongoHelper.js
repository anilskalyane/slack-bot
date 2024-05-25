// const mongo = require('mongodb');
// const MongoClient = mongo.MongoClient;

const { MongoClient } = require('mongodb');
// or as an es module:
// import { MongoClient } from 'mongodb'

// Connection URL
const url = 'mongodb+srv://app_user:fjlT3weBIE41gF6D@hifives.aoxfr.mongodb.net/?retryWrites=true&w=majority';
const client = new MongoClient(url);

// Database Name
const dbName = 'hifives_app_prod';

async function main() {
  // Use connect method to connect to the server
  await client.connect();
  console.log('Connected successfully to server');
  const db = client.db(dbName);
  const collection = db.collection('documents');
  const insertResult = await collection.insertMany([{ a: 1 }, { a: 2 }, { a: 3 }]);
  console.log('Inserted documents =>', insertResult);
  // the following code examples can be pasted here...

  return 'done.';
}

main()
  .then(console.log)
  .catch(console.error)
  .finally(() => client.close());

// class MongoHelper{

//     async connectToMongoDB(url,database){
//         try{
//             return new Promise((resolve,reject)=>{
//                 MongoClient.connect(url,{useNewUrlParser: true, useUnifiedTopology: true},(err, db) => {
//                     if (err){
//                         console.log("error:",err);
//                         reject({"status":"error","error":err});
//                         throw err;
//                     }else{
//                         let dbo = db.db(database);
//                         resolve({"connection":db,"database":dbo});
//                     }
//                 });
//             });
//         }catch(error){
//             console.log(error);
//             let result = {"status":"error","message":error};
//             return result;
//         }        
//     }

//     async getDataFromMongoDB(url,database,collectionName,query){
//         try{
//             console.log("url: ",url);
//             console.log("database: ",database);
//             console.log("collectionName: ",collectionName);
//             console.log("query: ",query);
//             return new Promise(async (resolve,reject)=>{
//                 let dbConnect = await this.connectToMongoDB(url,database).catch(error=>{
//                     console.log("Connection error: ",error);
//                     reject(error);
//                 });
//                 dbConnect.database.collection(collectionName).find(query).toArray((err, result) => {
//                     if (err) {
//                         throw err;
//                     }else{
//                         resolve(result);
//                         dbConnect.connection.close();
//                     }
//                   })
//             });
//         }catch(error){
//             console.log("Error: ",error);
//             let result = {"status":"error","message":error};
//             return result;
//         }        
//     }

//     async getFirstDataFromMongoDB(url,database,collectionName,query){
//         try{
//             //console.log("url: ",url);
//             //console.log("database: ",database);
//             //console.log("collectionName: ",collectionName);
//             //console.log("query: ",query);
//             return new Promise(async (resolve,reject)=>{
//                 let dbConnect = await this.connectToMongoDB(url,database);
//                 dbConnect.database.collection(collectionName).findOne(query, (err, result) => {
//                     if (err) {
//                         throw err;
//                     }else{
//                         resolve(result);
//                         dbConnect.connection.close();
//                     }
//                   })
//             });
//         }catch(error){
            
//             let result = {"status":"error","message":error};
//             return result;
//         }        
//     }

//     async getPaginationData(url,database,collectionName,params){
//         try{
//             return new Promise(async (resolve,reject)=>{
//                 let dbConnect = await this.connectToMongoDB(url,database);
//                 let facet = {
//                     "data":[],
//                     "count":[]
//                 };
//                 if(params.condition_match)
//                     facet.data.push({"$match":params.condition_match});
//                 if(params.count_match)
//                     facet.count.push({"$match":params.count_match});    
//                 if(params.skip)
//                     facet.data.push({"$skip":params.skip});
//                 if(params.limit)
//                     facet.data.push({"$limit":params.limit});
//                 facet.count.push({"$count":"count"});
//                 let facetQuery = [{"$facet":facet}]
//                 console.log("Facet: "+JSON.stringify(facetQuery));             
//                 let dataCursor = dbConnect.database.collection(collectionName).aggregate(facetQuery);
//                 await dataCursor.forEach(data => {
//                     if(data.data && data.count){
//                         resolve(data);
//                     }
//                     dbConnect.connection.close();
//                 });               
//             });
//         }catch(error){
//             let result = {"status":"error","message":error};
//             return result;
//         }        
//     }

//     async getDistinctDataFromMongoDB(url,database,collectionName,field,query){
//         try{
//             return new Promise(async (resolve,reject)=>{
//                 let dbConnect = await this.connectToMongoDB(url,database);
//                 dbConnect.database.collection(collectionName).distinct(field,query, (err, result) => {
//                     if (err) {
//                         throw err;
//                     }else{
//                         resolve(result);
//                         dbConnect.connection.close();
//                     }
//                   })
//             });
//         }catch(error){
//             let result = {"status":"error","message":error};
//             return result;
//         }        
//     }

//     async insertDataInMongoDB(url,database,collectionName,dataToInsert,deleteCond={}){
//         try{
//             return new Promise(async (resolve,reject)=>{
//                 let dbConnect = await this.connectToMongoDB(url,database);
//                 if(Array.isArray(dataToInsert)){
//                     dbConnect.database.collection(collectionName).insertMany(dataToInsert, (err, result) => {
//                         if (err) {
//                             reject({"status":"error","error": err});
//                         }else{
//                             dbConnect.connection.close();
//                             resolve(result);
//                         }
//                       });
//                 }else{
//                     if(deleteCond) dbConnect.database.collection(collectionName).deleteMany(deleteCond);
//                     dbConnect.database.collection(collectionName).insertOne(dataToInsert, (err, result) => {
//                         if (err) {
//                             reject({"status":"error","error": err});
//                         }else{
//                             dbConnect.connection.close();
//                             resolve(result);
//                         }
//                       });
//                 }
                
//             });
//         }catch(error){
//             let result = {"status":"error","message":error};
//             return result;
//         }        
//     }

//     async updateOneDocument(url,database,collectionName,query,dataToUpdate){
//         try{
//             return new Promise(async (resolve,reject)=>{
//                 let dbConnect = await this.connectToMongoDB(url,database);
//                 dbConnect.database.collection(collectionName).updateOne(query,{"$set":dataToUpdate}, (err, result) => {
//                     if (err) {
//                         reject({"error": err});
//                     }else{
//                         dbConnect.connection.close();
//                         resolve(result);
//                     }
//                 });
//             });
//         }catch(error){
//             let result = {"status":"error","message":error};
//             return result;
//         } 
//     }

//     async updateManyDocument(url,database,collectionName,query,dataToUpdate){
//         try{
//             return new Promise(async (resolve,reject)=>{
//                 let dbConnect = await this.connectToMongoDB(url,database);
//                 dbConnect.database.collection(collectionName).updateMany(query,{"$set":dataToUpdate}, (err, result) => {
//                     if (err) {
//                         reject({"error": err});
//                     }else{
//                         dbConnect.connection.close();
//                         resolve(result);
//                     }
//                 });
//             });
//         }catch(error){
//             let result = {"status":"error","message":error};
//             return result;
//         } 
//     }

// }

// module.exports = new MongoHelper();