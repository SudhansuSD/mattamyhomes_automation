pipeline {
    agent any

    parameters {
        choice(name: 'ENV', choices: ['STAGE', 'PROD'], description: 'Test Environment')
        choice(name: 'LOCATION', choices: ['CAN', 'US'], description: 'Test Location')
    }

    environment {
        EMAIL_USER = credentials('ssdas@ex2india.com')
        EMAIL_PASS = credentials('Sudhansu$89')
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
                sh '''
                  node -v
                  npm -v
                  npm ci
                  npx playwright install --with-deps
                '''
            }
        }

        stage('Run Playwright Tests') {
            steps {
                sh """
                  export ENV=${params.ENV}
                  export LOCATION=${params.LOCATION}
                  npm test
                """
            }
        }
    }

    post {
        always {
            // ✅ This now runs WITH workspace context
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
