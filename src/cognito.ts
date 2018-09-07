import { CognitoIdentityServiceProvider, AWSError } from 'aws-sdk';

export const adminCreateUser = (provider: CognitoIdentityServiceProvider, params: CognitoIdentityServiceProvider.Types.AdminCreateUserRequest):
  Promise<CognitoIdentityServiceProvider.AdminCreateUserResponse> => new Promise((resolve, reject) => {
    provider.adminCreateUser(params, (err: AWSError, data: CognitoIdentityServiceProvider.AdminCreateUserResponse) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(data);
    });
  });

export const adminInitiateAuth = (provider: CognitoIdentityServiceProvider, params: CognitoIdentityServiceProvider.Types.AdminInitiateAuthRequest):
  Promise<CognitoIdentityServiceProvider.AdminInitiateAuthResponse> => new Promise((resolve, reject) => {
    provider.adminInitiateAuth(params, (err: AWSError, data: CognitoIdentityServiceProvider.AdminInitiateAuthResponse) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(data);
    });
  });

export const respondToAuthChallenge = (provider: CognitoIdentityServiceProvider, params: CognitoIdentityServiceProvider.Types.RespondToAuthChallengeRequest):
  Promise<CognitoIdentityServiceProvider.RespondToAuthChallengeResponse> => new Promise((resolve, reject) => {
    provider.respondToAuthChallenge(params, (err: AWSError, data: CognitoIdentityServiceProvider.RespondToAuthChallengeResponse) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(data);
    });
  });
