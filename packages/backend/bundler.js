const util = require('util');
const fs = require('fs');
const fse = require('fs-extra')
const exec = util.promisify(require('child_process').exec);

const buildConfig = {
    clean: true
};

const paths = {
    frontend: '../frontend',
    frontendBuild: `../frontend/build`,
    backendBuild: `lib`,
    backendBuildFrontendDir: `lib/ui`
};

async function execCommand(cmd) {
    const { stdout, stderr } = await exec(cmd);

    if (stderr && stderr !== '') {
        console.error(`Command ${cmd} had an error.`);
        console.error(stderr);
        throw Error(`Aborted on ${cmd}.`);
    }
}

async function doStep(description, cmd, ifDirsDoNotExist = [], dirsShouldExist = []) {
    console.log(description);

    if (
        !dirsShouldExist.map(dir => fs.existsSync(dir)).reduce((a, b) => a && b, true)
    ) {
        console.error(`The directory ${dirsShouldExist.find(dir => !fs.existsSync(dir))} does not exist, but should.`);
        throw Error(`Aborting because required directory does not exist.`);
    }

    if (
        !ifDirsDoNotExist.map(dir => fs.existsSync(dir)).reduce((a, b) => a && b, true)
    ) {
        await cmd();
    } else {
        if (buildConfig.clean) {
            console.log(`  ${ifDirsDoNotExist.join('; ')} already exists, removing directory.`);
            for (let dir of ifDirsDoNotExist) {
                if (fs.existsSync(dir)) {
                    console.log(`  Removing ${dir}`);
                    fse.remove(dir);
                }
            }
            console.log('  Directories removed, now running step.');
            await cmd();
        } else {
            console.log(`  ${ifDirsDoNotExist.join('; ')} already exists, skipping step.`);
        }
    }
}

async function ls() {
    if (buildConfig.clean) {
        console.log('Running clean build, artifacts from previous builds will be removed and recreated.');
    } else {
        console.log('Running dirty build, artifacts from previous builds will be reused.');
    }

    await doStep(
        'Building backend',
        async () => await execCommand(`yarn build`),
        [paths.backendBuild]
    );

    await doStep(
        'Building frontend',
        async () => await execCommand(`cd ${paths.frontend} && yarn build`),
        [paths.frontendBuild],
        [paths.backendBuild]
    );

    await doStep(
        'Copying frontend build to backend build directory',
        async () => fse.copy(paths.frontendBuild, paths.backendBuildFrontendDir),
        [paths.backendBuildFrontendDir],
        [paths.backendBuild, paths.frontendBuild]
    );

    console.log('Finished!');
}

ls();