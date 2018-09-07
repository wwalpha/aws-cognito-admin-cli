import * as Program from 'commander';
import { registUser, deleteUser } from './cmd';

Program
  .version('1.0.2');

Program
  .command('regist')
  .description('ユーザ登録')
  .option('-u, --username <username>', 'ユーザ名')
  .option('-p, --password <password>', 'パスワード')
  .option('-e, --email <email>', 'メール')
  .option('-P, --proxy <proxy>', 'プロキシ')
  .action((cmd: any) => {
    // ユーザ登録処理
    registUser(cmd);
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

    // tslint:disable-next-line:ter-indent
    // console.log(cmd, options);
    console.log(1111);
  });

Program
  .command('delete <username>')
  .option('-P, --proxy <proxy>', 'プロキシ')
  .description('ユーザ削除')
  .action((username: string, options: any) => {
    // ユーザ削除
    deleteUser(username, options);
  });

Program.parse(process.argv);

process.on('unhandledRejection', console.dir);
