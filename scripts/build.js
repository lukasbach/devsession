const {runCmd, assertThatFoldersExists, doIfFolderDoesNotExist} = require('./common');
const commander = require('commander');
const fse = require('fs-extra');

commander
    .version('0.1.0')
    .option('-c, --clean', 'Clean build, do not reuse existing build artifacts but start from scratch.')
    .option('-r, --reinstall', 'Reinstall dependencies with yarn and delete existing node_modules directories.')
    .option('-v, --verbose', 'Log messages from subtasks.')
    .parse(process.argv);

(async () => {
    if (commander.clean) {
        console.log('Running clean build, artifacts from previous builds will be removed and recreated.');
    } else {
        console.log('Running dirty build, artifacts from previous builds will be reused.');
    }

    if (commander.reinstall) {
        console.log('All dependencies will be reinstalled, even if they already exist.');
    }

    await assertThatFoldersExists([
        __dirname + '/../node_modules'
    ]);

    await doIfFolderDoesNotExist(
        'Common build',
        [__dirname + '/../packages/common/lib'],
        async () => await runCmd(
            'yarn start',
            __dirname + '/../packages/common',
            'Frontend dependencies',
            commander.verbose
        ),
        commander.clean
    );

    await assertThatFoldersExists([
        __dirname + '/../packages/common/lib'
    ]);

    await doIfFolderDoesNotExist(
        'Frontend build',
        [__dirname + '/../packages/frontend/build'],
        async () => await runCmd(
            'yarn build',
            __dirname + '/../packages/frontend',
            'Frontend build',
            commander.verbose
        ),
        commander.clean
    );

    await assertThatFoldersExists([
        __dirname + '/../packages/frontend/build'
    ]);

     await doIfFolderDoesNotExist(
        'Backend build',
        [__dirname + '/../packages/backend/lib'],
        async () => await runCmd(
            'yarn build',
            __dirname + '/../packages/backend',
            'Backend build',
            commander.verbose
        ),
        commander.clean
    );

    await assertThatFoldersExists([
        __dirname + '/../packages/backend/lib'
    ]);

    await doIfFolderDoesNotExist(
        'Copying frontend build to backend build directory',
        [__dirname + '/../packages/backend/lib/ui'],
        async () => await fse.copy(__dirname + '/../packages/frontend/build', __dirname + '/../packages/backend/lib/ui'),
        commander.clean
    );

    await assertThatFoldersExists([
        __dirname + '/../packages/backend/lib/ui'
    ]);

    await doIfFolderDoesNotExist(
        'Gui build',
        [__dirname + '/../dist'],
        async () => {
            await runCmd(
                'yarn build && yarn package',
                __dirname + '/../packages/guistarter',
                'Gui',
                commander.verbose
            );
        },
        commander.clean
    );

    await doIfFolderDoesNotExist(
        'Website build',
        [__dirname + '/../packages/website/build'],
        async () => {
            await runCmd(
                'yarn build',
                __dirname + '/../packages/website',
                'Website build',
                commander.verbose
            );
        },
        commander.clean
    );
})();