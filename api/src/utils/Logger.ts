import chalk from 'chalk';

const prefix = '[d-ployer]: ';

export default class Logger {
  static log = (...args: any) => {
    console.log(chalk.grey(prefix), ...args);
  }

  static ok = (...args: any) => {
    console.log(chalk.green(prefix), ...args);
  }

  static warn = (...args: any) => {
    console.log(chalk.yellow(prefix), ...args);
  }

  static error = (...args: any) => {
    console.log(chalk.red(prefix), ...args);
  }
}
