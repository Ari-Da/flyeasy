const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.watchFolders = [];
config.resolver.blockList = [
  /ios\/Pods\/.*/,
  /ios\/build\/.*/,
  /android\/.gradle\/.*/,
  /android\/build\/.*/,
];

module.exports = config;
