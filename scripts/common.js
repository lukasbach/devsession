const util = require('util');
const childProc = require('child_process');
const chalk = require('chalk').default;
const fs = require('fs');
const fse = require('fs-extra');

const exec = util.promisify(childProc.exec);

const runCmd = async (cmd, cwd, name, verbose = false) => {
    console.log(`Running ${chalk.cyan(cmd)} at ${chalk.cyan(cwd)}`);
    const execution = childProc.exec(`cd ${cwd} && ${cmd}`);

    if (verbose) {
        execution.stdout.on('data', data => console.log(`${chalk.cyan(name)}/${chalk.gray('stdout')}: ${data}`));
        execution.stderr.on('data', data => console.log(`${chalk.cyan(name)}/${chalk.redBright('stderr')}: ${data}`));
    }

    return new Promise((resolve, reject) => {
        execution.once('close', code => {
            if (code === 0) {
                console.log(`${chalk.cyan(name)} closed with code ${code}`);
                resolve();
            } else {
                console.log(`${chalk.redBright(name)} closed with code ${code}`);
                reject();
            }
        })
    })
};

const assertThatFoldersExists = async (folders) => {
    for (const folder of folders) {
        if (!fs.existsSync(folder)) {
            throw Error(`Assumed that folder ${folder} exists, but it does not.`);
        }
    }
};

const doIfFolderDoesNotExist = async (name, folders, handler, clean = false) => {
    let exists = true;


    for (const folder of folders) {
        if (!fs.existsSync(folder)) {
            exists = false;
        }
    }

    if (exists && !clean) {
        console.log(`Task ${chalk.cyan(name)} skipped.`);
        return;
    }

    for (const folder of folders) {
        if (fs.existsSync(folder)) {
            console.log(`${chalk.yellow(`Removing ${folder}.`)}`);
            await fse.remove(folder);
        }
    }

    console.log(`Running task ${chalk.cyan(name)}.`);
    await handler();
    console.log(`Task ${chalk.cyan(name)} finished.`);
};

module.exports = {
    runCmd,
    assertThatFoldersExists,
    doIfFolderDoesNotExist
};