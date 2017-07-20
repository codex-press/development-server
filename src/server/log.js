import chalk from 'chalk';

export function info(...args) {
  if (process.env.NODE_ENV !== 'test')
    console.log(...args);
}

export function error(...args) {
  console.error(...args);
}

export function magenta(...args) {
  info(chalk.magenta(...args));
}

export function cyan(...args) {
  info(chalk.cyan(...args));
}

export function yellow(...args) {
  info(chalk.yellow(...args));
}


