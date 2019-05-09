import chalk from 'chalk';
import moment from 'moment';

export default class Logger {
  protected prefix: string;

  constructor(prefix: string = 'dployer-api') {
    this.prefix = `[${prefix}]:`;
  }

  public log(...args: any) {
    // print white
    console.log(this.getLoggDate(), this.prefix, ...args);
  }

  public ok(...args: any) {
    // print green
    console.log(chalk.green(this.getLoggDate(), this.prefix), ...args);

  }

  public error(...args: any) {
    // print red
    console.log(chalk.red(this.getLoggDate(), this.prefix), ...args);

  }

  public warn(...args: any) {
    // print yellow
    console.log(chalk.yellow(this.getLoggDate(), this.prefix), ...args);

  }

  public muted(...args: any) {
    // print gray
    console.log(chalk.gray(this.getLoggDate(), this.prefix), ...args);

  }

  private getLoggDate(): string {
    return `[${moment().format('MMMM Do YYYY, HH:mm:ss:SSS')}]`;
  }
}
