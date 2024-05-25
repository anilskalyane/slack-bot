const jwt = require('jsonwebtoken');
                                                                                                                                                                                                                                                                                                                                                                                                                                                
class AuthHelper{

    constructor(){
    }

    /**
     * Return the JWT format auth token token
     * 
     * @param {String} secret - secret key for auth
     * @param {Object} tokenData - data for the token
     * @param {String} expirationTime - token expiration time
     * @returns {Object} result
     */
    async getAuthToken(secret, tokenData, expirationTime){
        let result = {"status": "error"};
        try {
            if (secret && tokenData && expirationTime) {
                const token = jwt.sign({ tokenData }, secret, { expiresIn: expirationTime });
                result.status = "success";
                result.token = token;
                return result;
            } else {
                result.message = "Required data is missing";
                return result;
            }
        } catch (error) {
            console.log("Error: ",error);
            result.message = JSON.stringify(error);
            return result;
        }
    }

    async verifyAuthToken(event, secret){
        let result = {"status":"error"}
        try {
            if (event && secret) {
                const token = event.authorizationToken;
                let splitToken = token.split(" ");
                // Verify JWT
                const decoded = jwt.verify(splitToken[splitToken.length-1], secret);
                const user = decoded.tokenData;
                const authorizerContext = { user: JSON.stringify(user) };
                let policy = this.buildIAMPolicy(user._id,'Allow',event.methodArn,authorizerContext);
                result.status = 'success';
                result.policy = policy;
                return result;
            } else {
                return result;    
            }
        } catch (error) {
            console.log("Error: ",error);
            result.message = "Unauthorized";
            return result;
        }
    }

    /**
     * Returns an IAM policy document for a given user and resource.
     *
     * @method buildIAMPolicy
     * @param {String} userId - user id
     * @param {String} effect  - Allow / Deny
     * @param {String} resource - resource ARN
     * @param {String} context - response context
     * @returns {Object} policyDocument
     */
    buildIAMPolicy(userId, effect, resource, context){
        const policy = {
        principalId: userId,
        policyDocument: {
            Version: '2012-10-17',
            Statement: [
            {
                Action: 'execute-api:Invoke',
                Effect: effect,
                Resource: resource,
            },
            ],
        },
        context,
        };
        return policy;
    }
    
}

module.exports = new AuthHelper();