import chalk from 'chalk';

export default class Logger {
  protected prefix: string;

  constructor(prefix: string = 'dployer-api') {
    this.prefix = `[${prefix}]:`;
  }

  public log(...args: any) {
    // print white
    console.log(this.prefix, ...args);
  }

  public ok(...args: any) {
    // print green
    console.log(chalk.green(this.prefix), ...args);

  }

  public error(...args: any) {
    // print red
    console.log(chalk.red(this.prefix), ...args);

  }

  public warn(...args: any) {
    // print yellow
    console.log(chalk.yellow(this.prefix), ...args);

  }
}

