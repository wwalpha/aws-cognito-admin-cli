import { CognitoIdentityServiceProvider } from 'aws-sdk';
import { REQUIRED, USER_CREATED, USER_DELETED } from './Consts';
import { adminCreateUser, adminInitiateAuth, respondToAuthChallenge, adminDeleteUser } from './cognito';
import Config from './config';

const exit = (msg: string): void => {
  console.log(msg);
  console.log();
  process.exit(0);
};

const provider: CognitoIdentityServiceProvider = new CognitoIdentityServiceProvider({
  accessKeyId: Config.aws_access_key_id,
  secretAccessKey: Config.aws_secret_access_key,
  region: Config.Auth.region,
});

/** プロキシ設定 */
const setProxy = (proxy: string) => {
  if (proxy) {
    provider.config.httpOptions = {
      proxy,
    };
  }
};

/** ユーザ登録 */
export const registUser = async (cmd: any) => {
  const { username, password, email, proxy } = cmd;

  // 必須チェック
  if (!username) exit(REQUIRED('ユーザ名'));
  if (!password) exit(REQUIRED('パスワード'));
  if (!email) exit(REQUIRED('メール'));

  // プロキシ設定
  setProxy(proxy);

  // ユーザ作成
  await adminCreateUser(provider, {
    Username: username,
    UserPoolId: Config.Auth.userPoolId,
    UserAttributes: [
      {
        Name: 'email',
        Value: email,
      },
      {
        Name: 'email_verified',
        Value: 'true',
      },
    ],
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
};

/** ユーザ削除 */
export const deleteUser = async (username: string, options: any) => {
  const { proxy } = options;

  // 必須チェック
  if (!username) exit(REQUIRED('ユーザ名'));

  // プロキシ設定
  if (proxy) {
    provider.config.httpOptions = {
      proxy,
    };
  }

  await adminDeleteUser(provider, {
    Username: username,
    UserPoolId: Config.Auth.userPoolId,
  });

  // ユーザ削除しました
  exit(USER_DELETED(username));
};
