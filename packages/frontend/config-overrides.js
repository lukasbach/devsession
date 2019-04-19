const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
const ModuleScopePlugin = require('react-dev-utils/ModuleScopePlugin');
// const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const {
    override,
    addDecoratorsLegacy,
    disableEsLint,
    addBundleVisualizer,
    addWebpackAlias,
    adjustWorkbox,
    babelInclude,
    removeModuleScopePlugin,
    addBabelPlugin
} = require("customize-cra");
const path = require("path");

const regexEquals = (x, y) => x.toString() === y.toString();

/*module.exports = function override(config, env) {
    if (!config.plugins) {
        config.plugins = [];
    }
    config.plugins.push(
        new MonacoWebpackPlugin()
    );

    const tsLoader = getLoader(
        config.module.rules,
        rule => rule.test && regexEquals(rule.test, /\.(ts|tsx)$/)
    );

    const plugins = [
        // new ModuleScopePlugin(paths.appSrc, [paths.appPackageJson]),
        // new TsconfigPathsPlugin({ configFile: paths.appTsConfig }),
    ];

    // mutations
    delete tsLoader.include;
    config.resolve.plugins = plugins;*/


    // config.resolve.plugins = config.resolve.plugins.filter(plugin => !(plugin instanceof ModuleScopePlugin));


//};

const addMonacoWebPackPlugin = () => config => {
    config.plugins.push(new MonacoWebpackPlugin());
    return config;
};

const removeIncludeRestrictionFromTsLoader = () => config => {
    const oneOfObject = config.module.rules.find(rule => !!rule.oneOf);

    if (!oneOfObject) {
        console.error("Could not find oneOf object");
        console.log(config.module.rules);
        return;
    }

    console.log(oneOfObject);

    const tsLoader = oneOfObject.oneOf.find(rule => rule.test && rule.test.toString() === /\.(js|mjs|jsx|ts|tsx)$/.toString());

    console.log(tsLoader);
    if (!tsLoader) {
        console.error('Could not find tsLoader.');
        console.log(oneOfObject);
    } else {
        delete tsLoader.include;
    }
    console.log(tsLoader);

    return config;
};

const output = (description) => config => {
    console.log(description, config);
    return config;
};

module.exports = override(
    output('BEFORE'),
    babelInclude([
        path.resolve("../common")
    ]),
    addWebpackAlias({
        ["@devsession/common"]: path.resolve(__dirname, "../common")
    }),
    removeModuleScopePlugin(),
    addMonacoWebPackPlugin(),
    removeIncludeRestrictionFromTsLoader(), // should not be required because of babelInclude
    addBabelPlugin("@babel/transform-modules-commonjs"), // @babel/plugin-...
    output('AFTER'),
);
