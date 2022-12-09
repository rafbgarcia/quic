module.exports = {
  content: [
    // For the best performance and to avoid false positives,
    // be as specific as possible with your content configuration.
    "./pages/**/*.tsx",
    "./components/**/*.tsx",
  ],
  corePlugins: {
    preflight: false,
  },
}
