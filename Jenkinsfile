pipeline {
    agent any

    stages {
        stage('Test') {
            steps {
                nodejs(nodeJSInstallationName: 'Node.js 6.x', configId: 'deranged-npmrc') {
                    sh 'yarn install'
                    sh 'npm test'
                }
            }
        }

        stage('Coverage') {
            steps {
                nodejs(nodeJSInstallationName: 'Node.js 6.x', configId: 'deranged-npmrc') {
                    sh 'npm run cover'
                }
                step([$class: 'CoberturaPublisher', coberturaReportFile: 'coverage/cobertura-coverage.xml'])
            }
        }

        stage('Publish') {
            when { branch 'master' }
            steps {
                nodejs(nodeJSInstallationName: 'Node.js 6.x', configId: 'deranged-npmrc') {
                    sh 'npm publish && exit 0'
                    sh 'echo $?'
                }
            }
        }
    }
}
