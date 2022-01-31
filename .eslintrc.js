const jestOff = Object.keys(require('eslint-plugin-jest').rules ).reduce((acc, rule) => {
    acc[`jest/${rule}`] = 'off';
    return acc;
}, {});

module.exports = {
    "root": true,
    "parserOptions": {
        "project": ["./tsconfig.json"]
    },
    "extends": [
        "@myrotvorets/myrotvorets-preact-ts"
    ],
    "rules": {
        ...jestOff,
    },
    "env": {
        "browser": true,
        "serviceworker": true
    }
};

