const moment = require('moment');
const { SpecReporter } = require('jasmine-spec-reporter');
const jasmineReporters = require('jasmine-reporters');
const reportsDirectory = './reports';
const allReportDirectory = reportsDirectory + '/allReport';
const detailsReportDirectory = reportsDirectory + '/detailReport';
const dashboardReportDirectory = reportsDirectory + '/dashboardReport';
const HtmlScreenshotReporter = require('protractor-jasmine2-screenshot-reporter');
const ScreenshotAndStackReporter = new HtmlScreenshotReporter({
  dest: detailsReportDirectory,
  filename: 'index.html',
  reportTitle: 'Details Report',
  showSummary: true,
  reportOnlyFailedSpecs: false,
  captureOnlyFailedSpecs: false
});
const config = require('../protractor.conf').config;

config.capabilities = {
  browserName: 'chrome'
  // firefoxOptions: {
  //   args: ['--headless']
  // },
  // 'moz:firefoxOptions': {
  //   args: ['--headless']
  // }
};

config.jasmineNodeOpts = {
  showColors: true,
  defaultTimeoutInterval: 360000
};

config.allScriptsTimeout = 360000;

config.specs = ['./**/*.e2e-spec.ts'];

config.beforeLaunch = function() {
  return new Promise(function(resolve) {
    ScreenshotAndStackReporter.beforeLaunch(resolve);
  });
};

config.onPrepare = function() {
  // xml report generated for dashboard
  require('ts-node').register({
    project: 'e2e/tsconfig.e2e.json'
  });

  jasmine.getEnv().addReporter(new SpecReporter({ spec: { displayStacktrace: true } }));

  jasmine.getEnv().addReporter(
    new jasmineReporters.JUnitXmlReporter({
      consolidateAll: true,
      savePath: reportsDirectory + '/xml',
      filePrefix: 'xmlOutput'
    })
  );

  var fs = require('fs-extra');
  if (!fs.existsSync(dashboardReportDirectory)) {
    fs.mkdirSync(dashboardReportDirectory);
  }

  jasmine.getEnv().addReporter({
    specDone: function(result) {
      if (result.status == 'failed') {
        browser.getCapabilities().then(function(caps) {
          var browserName = caps.get('browserName');

          browser.takeScreenshot().then(function(png) {
            var stream = fs.createWriteStream(
              dashboardReportDirectory + '/' + browserName + '-' + result.fullName + '.png'
            );
            stream.write(new Buffer(png, 'base64'));
            stream.end();
          });
        });
      }
    }
  });

  jasmine.getEnv().addReporter(ScreenshotAndStackReporter);

  var htmlReporter = require('protractor-beautiful-reporter');
  jasmine.getEnv().addReporter(
    new htmlReporter({
      baseDirectory: allReportDirectory,
      docName: 'index.html', // Default report.html
      docTitle: 'Report',
      gatherBrowserLogs: false,
      jsonsSubfolder: 'jsons',
      // preserveDirectory: false,
      screenshotsSubfolder: 'images',
      clientDefaults: {
        showTotalDurationIn: 'header',
        totalDurationFormat: 'ms',
        columnSettings: {
          warningTime: 15000, // 10s
          dangerTime: 30000 // 20s
        }
      }
    }).getJasmine2Reporter()
  );
};

config.onComplete = function() {
  var browserName, browserVersion;
  var capsPromise = browser.getCapabilities();

  capsPromise.then(function(caps) {
    browserName = caps.get('browserName');
    browserVersion = caps.get('version');
    const platform = caps.get('platform');

    var HTMLReport = require('protractor-html-reporter-2');
    const testConfig = {
      reportTitle: 'Protractor Test Execution Report',
      outputPath: dashboardReportDirectory,
      outputFilename: 'index',
      screenshotPath: './',
      testBrowser: browserName,
      browserVersion: browserVersion,
      modifiedSuiteName: false,
      screenshotsOnlyOnFailure: true,
      testPlatform: platform
    };
    new HTMLReport().from(reportsDirectory + '/xml/xmlOutput.xml', testConfig);
  });
};

exports.config = config;
