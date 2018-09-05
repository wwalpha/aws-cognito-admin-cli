// require('es6-promise').polyfill();
// require('isomorphic-fetch');

import Config from './config';
import { CognitoIdentityServiceProvider, AWSError } from 'aws-sdk';
import { REQUIRED, USER_CREATED, USER_DELETED } from './Consts';
import * as Program from 'commander';
import { adminCreateUser, initiateAuth, respondToAuthChallenge } from './cognito';

// const co = require('co');
// const prompt = require('co');

// AWS.config = new Config({
//     httpOptions: {
//         proxy: 'http://10.201.0.10:60088',
//     },
// });

// console.log(AWS.config.httpOptions.proxy);
// AWS.config.httpOptions = {
//     proxy: 'http://10.201.0.10:60088',
// };

const provider: CognitoIdentityServiceProvider = new CognitoIdentityServiceProvider({
  accessKeyId: Config.aws_access_key_id,
  secretAccessKey: Config.aws_secret_access_key,
  region: Config.Auth.region,
});

Program
  .version('1.0.2');

// tslint:disable:ter-indent
const exit = (msg: string): void => {
  console.log(msg);
  console.log();
  process.exit(0);
};

Program
  .command('regist')
  .description('ユーザ登録')
  .option('-u, --username <username>', 'ユーザ名')
  .option('-p, --password <password>', 'パスワード')
  .option('-e, --email <email>', 'メール')
  .action(async (cmd: any) => {
    const { username, password, email } = cmd;

    if (!username) exit(REQUIRED('ユーザ名'));
    if (!password) exit(REQUIRED('パスワード'));
    if (!email) exit(REQUIRED('メール'));

    const resp = await adminCreateUser(provider, {
      Username: username,
      UserPoolId: Config.Auth.userPoolId,
      TemporaryPassword: password,
    });

    const auth = await initiateAuth(provider, {
      ClientId: Config.Auth.userPoolWebClientId,
      AuthFlow: 'ADMIN_NO_SRP_AUTH',
    });

    await respondToAuthChallenge(provider, {
      ChallengeName: 'NEW_PASSWORD_REQUIRED',
      ClientId: Config.Auth.userPoolWebClientId,
      ChallengeResponses: {
        USERNAME: username,
        NEW_PASSWORD: password,
      },
      Session: auth.Session,
    });
  });

Program
  .command('modify')
  .description('ユーザ変更')
  .option('-u, --username <username>', 'ユーザ名')
  .option('-p, --password <password>', 'パスワード')
  .option('-np, --newpassword <newpassword>', '新パスワード')
  .option('-nu, --newusername <newusername>', '新ユーザ名')
  .action((cmd: any) => {
    // tslint:disable-next-line:ter-indent
    // console.log(cmd, options);
    console.log(1111);
  });

Program
  .command('delete <username>')
  .description('ユーザ削除')
  .action((username: any) => {
    if (!username) exit(REQUIRED('ユーザ名'));

    provider.adminDeleteUser(
      {
        Username: username,
        UserPoolId: Config.Auth.userPoolId,
      },
      (err: AWSError, value: any) => {
        if (err) {
          console.log(err);
          process.exit(0);
        }

        // ユーザ削除しました
        exit(USER_DELETED(username));
      });
  });

Program.parse(process.argv);

process.on('unhandledRejection', console.dir);
