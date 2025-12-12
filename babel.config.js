module.exports = function (api) {
  api.cache(true);

  return {
    presets: [
      "babel-preset-expo",
      // NativeWind exposes a Babel preset, not a direct plugin list.
      "nativewind/babel",
    ],
    plugins: ["react-native-reanimated/plugin"],
  };
};
