const packager = require('electron-packager');
const fs = require('fs-extra');
const path = require('path');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

const bundler = async () => {
    const platform = process.argv.includes('--all-platforms') ? 'all' : 'win32';
    const paths = {
        backendBuild: '../backend/lib',
        backendBuildFrontendDir: '../backend/lib/ui',
        guiBuild: './build'
    };

    console.log('Checking directories.');

    if (fs.existsSync(paths.backendBuild)) {
        console.log('Backend build directory exists.')
    } else {
        return console.error('Backend build directory does not exist.')
    }

    if (fs.existsSync(paths.backendBuildFrontendDir)) {
        console.log('Frontend build directory exists.')
    } else {
        return console.error('Frontend build directory does not exist.')
    }

    console.log('All directories exist!');

    console.log('Building gui.');
    const { stdout, stderr } = await exec('yarn build');
    if (stderr) {
        return console.error('GUI Build returned with an error: ' + stderr);
    }
    console.log('Gui build successfull.');

    console.log('Starting to package for ' + platform);

    const appPaths = await packager({
        dir: '.',
        platform: platform,
        overwrite: true,
        // icon: __dirname + '../client/public/favicon.ico',
        out: '../../dist',
        asar: true
    });

    console.log(`Sucessfully built to:\n  ${appPaths.join('  \n')}`);

    console.log('Now copying files over to build...');

    appPaths.forEach(appPath => {
        fs.copySync(paths.backendBuild, path.join(appPath, 'backend'));
        console.log(`Moved gui to ${appPath}`);
    });

    appPaths.forEach(appPath => {
        fs.copySync(paths.guiBuild, path.join(appPath, 'gui'));
        console.log(`Moved gui to ${appPath}`);
    });

    console.log('Finished successfully.');
};

// noinspection BadExpressionStatementJS
// noinspection JSIgnoredPromiseFromCall
bundler();