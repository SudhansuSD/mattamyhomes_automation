module.exports = {
  default: {
    require: [
      'src/tests/**/*.ts',
      'src/support/**/*.ts'
    ],
    requireModule: ['ts-node/register'],
    paths: ['features/**/*.feature'],
    format: [
      'progress',
      'html:reports/cucumber-report.html'
    ],
    publishQuiet: true
  }
};
