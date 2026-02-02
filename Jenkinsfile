pipeline {
    agent any

    // tools {
    //     nodejs 'node18'
    // }

    parameters {
        choice(name: 'ENV', choices: ['STAGE', 'PROD'], description: 'Test Environment')
        choice(name: 'LOCATION', choices: ['CAN', 'USA'], description: 'Test Location')
    }

    environment {
        EMAIL_USER = credentials('EMAIL_USER')
        EMAIL_PASS = credentials('EMAIL_PASS')
        EMAIL_TO   = 'qa-team@company.com'
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
            archiveArtifacts artifacts: 'reports/**/*.zip', allowEmptyArchive: true
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
