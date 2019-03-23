const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
const ModuleScopePlugin = require('react-dev-utils/ModuleScopePlugin');

module.exports = function override(config, env) {
    if (!config.plugins) {
        config.plugins = [];
    }
    config.plugins.push(
        new MonacoWebpackPlugin()
    );

    config.resolve.plugins = config.resolve.plugins.filter(plugin => !(plugin instanceof ModuleScopePlugin));

    return config;
};
