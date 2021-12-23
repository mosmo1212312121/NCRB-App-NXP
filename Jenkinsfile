pipeline {
  agent any
 
  tools {
      nodejs "node"
  }
 
  stages {
    stage('Setup') {
      steps {
        bat 'npm config set proxy http://apac.nics.nxp.com:8080 && npm config set https-proxy http://apac.nics.nxp.com:8080 && npm install && npm install --save-dev typescript@3.7.2'
      }
    }
    stage('Test and Build') {
      steps {
        parallel(
          infos: {
            bat 'type package.json'
          },
          // testing: {
          //   bat 'npm config set proxy http://apac.nics.nxp.com:8080 && npm config set https-proxy http://apac.nics.nxp.com:8080 && npm run e2e:prod'
          // },
          building: {
            bat 'npm run build:prod'
          }
        )
      }
    }
    stage('Deploy'){
      steps {
        cifsPublisher(publishers: [[configName: 'ncrb-ui', transfers: [[cleanRemote: true, excludes: '', flatten: false, makeEmptyDirs: false, noDefaultExcludes: false, patternSeparator: '[, ]+', remoteDirectory: '.', remoteDirectorySDF: false, removePrefix: 'dist/', sourceFiles: 'dist/**/*']], usePromotionTimestamp: false, useWorkspaceInPromotion: false, verbose: false]])
      }
    }
    stage('Rewrite web.config'){
      steps {
        cifsPublisher(publishers: [[configName: 'ncrb-ui', transfers: [[cleanRemote: false, excludes: '', flatten: false, makeEmptyDirs: false, noDefaultExcludes: false, patternSeparator: '[, ]+', remoteDirectory: '.', remoteDirectorySDF: false, removePrefix: '', sourceFiles: 'web.config']], usePromotionTimestamp: false, useWorkspaceInPromotion: false, verbose: false]])
      }
    }
    // stage('Acceptance Test') {
    //    steps {
    //      bat 'cd ./robot && C:\\Python\\Python38-32\\Scripts\\robot.exe ./test.robot'
    //    }
    // }
    // stage('Publish Reports') {
    //   steps {
    //    robot outputPath: './robot', passThreshold: 100.0
    //   }
    //   // steps {
    //   //   publishHTML([allowMissing: false, alwaysLinkToLastBuild: false, keepAll: false, reportDir: './reports/dashboardReport', reportFiles: 'index.html', reportName: 'Dashboard Report', reportTitles: ''])
    //   //   publishHTML([allowMissing: false, alwaysLinkToLastBuild: false, keepAll: false, reportDir: './reports/detailReport', reportFiles: 'index.html', reportName: 'Detail Report', reportTitles: ''])
    //   //   publishHTML([allowMissing: false, alwaysLinkToLastBuild: false, keepAll: false, reportDir: './reports/allReport', reportFiles: 'index.html', reportName: 'All Report', reportTitles: ''])
    //   //   robot outputPath: './robot', passThreshold: 100.0
    //   // }
    // }
  }
  post {
    success {  
      mail bcc: '', body: 'NCRB Building Success', cc: '', from: 'arthit.kanjai@nxp.com', replyTo: '', subject: 'NCRB built Successful', to: 'arthit.kanjai@nxp.com'
    }  
    failure {  
      mail bcc: '', body: 'NCRB Building Failed', cc: '', from: 'arthit.kanjai@nxp.com', replyTo: '', subject: 'NCRB built Failure', to: 'arthit.kanjai@nxp.com'
    } 
  }
}