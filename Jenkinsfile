pipeline {
    agent any

    parameters {
        choice(name: 'ENV', choices: ['STAGE', 'PROD'], description: 'Test Environment')
        choice(name: 'LOCATION', choices: ['CAN', 'US'], description: 'Test Location')
    }

    environment {
        EMAIL_USER = credentials('EMAIL_USER')
        EMAIL_PASS = credentials('EMAIL_PASS')
        EMAIL_TO   = 'sudhansusd@gmail.com'
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                bat '''
                  node -v
                  npm -v
                  npm ci
                  npx playwright install --with-deps
                '''
            }
        }

        stage('Run Playwright Tests') {
            steps {
                bat """
                  set ENV=${params.ENV}
                  set LOCATION=${params.LOCATION}
                  npm test
                """
            }
        }
    }

    post {
        always {
            archiveArtifacts artifacts: 'reports/**/*', allowEmptyArchive: true
        }

        success {
            echo '✅ Tests passed successfully'
        }

        failure {
            echo '❌ Tests failed'
        }

        cleanup {
            echo '🧹 Workspace cleanup complete'
        }
    }
}
