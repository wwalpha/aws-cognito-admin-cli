import Config from './config';
import { CognitoIdentityServiceProvider, AWSError } from 'aws-sdk';
import { REQUIRED, USER_CREATED, USER_DELETED } from './Consts';
import * as Program from 'commander';
import { adminCreateUser, adminInitiateAuth, respondToAuthChallenge } from './cognito';

const provider: CognitoIdentityServiceProvider = new CognitoIdentityServiceProvider({
  accessKeyId: Config.aws_access_key_id,
  secretAccessKey: Config.aws_secret_access_key,
  region: Config.Auth.region,
});

Program
  .version('1.0.2');

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
  .option('-P, --proxy <proxy>', 'プロキシ')
  .action(async (cmd: any) => {
    const { username, password, email, proxy } = cmd;

    // 必須チェック
    if (!username) exit(REQUIRED('ユーザ名'));
    if (!password) exit(REQUIRED('パスワード'));
    if (!email) exit(REQUIRED('メール'));

    // プロキシ設定
    if (proxy) {
      provider.config.httpOptions = {
        proxy,
      };
    }

    // ユーザ作成
    await adminCreateUser(provider, {
      Username: username,
      UserPoolId: Config.Auth.userPoolId,
      UserAttributes: [{
        Name: 'email',
        Value: email,
      }],
      TemporaryPassword: password,
      DesiredDeliveryMediums: [
        'EMAIL',
      ],
    });

    // 認証フロー
    const auth = await adminInitiateAuth(provider, {
      ClientId: Config.Auth.userPoolWebClientId,
      UserPoolId: Config.Auth.userPoolId,
      AuthFlow: 'ADMIN_NO_SRP_AUTH',
      AuthParameters: {
        USERNAME: username,
        PASSWORD: password,
      },
    });

    // 認証済み
    await respondToAuthChallenge(provider, {
      ChallengeName: 'NEW_PASSWORD_REQUIRED',
      ClientId: Config.Auth.userPoolWebClientId,
      ChallengeResponses: {
        USERNAME: username,
        NEW_PASSWORD: password,
      },
      Session: auth.Session,
    });

    // ユーザ作成しました
    exit(USER_CREATED(username));
  });

Program
  .command('modify')
  .description('ユーザ変更')
  .option('-u, --username <username>', 'ユーザ名')
  .option('-p, --password <password>', 'パスワード')
  .option('-np, --newpassword <newpassword>', '新パスワード')
  .option('-nu, --newusername <newusername>', '新ユーザ名')
  .option('-P, --proxy <proxy>', 'プロキシ')
  .action((cmd: any) => {
    const { proxy } = cmd;

    // プロキシ設定
    if (proxy) {
      provider.config.httpOptions = {
        proxy,
      };
    }

    // tslint:disable-next-line:ter-indent
    // console.log(cmd, options);
    console.log(1111);
  });

Program
  .command('delete <username>')
  .option('-P, --proxy <proxy>', 'プロキシ')
  .description('ユーザ削除')
  .action((username: string, options: any) => {
    const { proxy } = options;

    // 必須チェック
    if (!username) exit(REQUIRED('ユーザ名'));

    // プロキシ設定
    if (proxy) {
      provider.config.httpOptions = {
        proxy,
      };
    }

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
