const packager = require('electron-packager');
const fs = require('fs-extra');
const path = require('path');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

const platform = process.argv.includes('--all-platforms') ? 'all' : 'win32';
const paths = {
    backendBuild: '../backend/lib',
    backendBuildFrontendDir: '../backend/lib/ui',
    guiRoot: '../guistarter',
    guiBuild: '../guistarter/build',
    guiElectronMain: '../guistarter/main.js',
    thisElectronMain: './main.js',
    dist: '../../dist'
};

const verifyPath = (path, pathDescription) => {
    if (fs.existsSync(path)) {
        console.log(pathDescription + ' exists.');
    } else {
        console.error(pathDescription + ' does not exist.');
        throw Error('Aborting.');
    }
};

const copyElectronMain = () => {
    console.log('Moving temporary electron file from gui starter.');
    fs.copyFileSync(paths.guiElectronMain, paths.thisElectronMain);
};

const cleanUp = () => {
    console.log('Removing temporary electron file.');
    fs.removeSync(paths.thisElectronMain);
};

const packageCall = async () => {
    console.log('Starting to package for ' + platform);

    const appPaths = await packager({
        dir: '.',
        platform: platform,
        overwrite: true,
        // icon: __dirname + '../client/public/favicon.ico',
        out: paths.dist,
        asar: false,
        /*ignore: [
            /\.idea/,
            /demodirectory/,
            /node_modules/,
            /packages/,
            /dist/
        ]*/
    });

    console.log(`Sucessfully built to:\n  ${appPaths.join('  \n')}`);

    return appPaths;
};

const bundler = async () => {
    console.log('Checking directories.');

    verifyPath(paths.backendBuild, 'Backend build directory');
    verifyPath(paths.backendBuildFrontendDir, 'Frontend build directory');
    verifyPath(paths.guiElectronMain, 'Gui main file');

    console.log('All directories exist!');

    console.log('Building gui.');
    const { stdout, stderr } = await exec(`cd ${paths.guiRoot} && yarn build`);
    if (stderr) {
        return console.error('GUI Build returned with an error: ' + stderr);
    }
    console.log('Gui build successfull.');

    copyElectronMain();
    const appPaths = await packageCall();

    console.log('Now copying files over to build...');

    appPaths.forEach(appPath => {
        fs.copySync(paths.backendBuild, path.join(appPath, 'backend'));
        console.log(`Moved gui to ${appPath}`);
    });

    appPaths.forEach(appPath => {
        fs.copySync(paths.guiBuild, path.join(appPath, 'gui'));
        console.log(`Moved gui to ${appPath}`);
    });

    cleanUp();

    console.log('Finished successfully.');
};

// noinspection BadExpressionStatementJS
// noinspection JSIgnoredPromiseFromCall
bundler();