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
                bat 'node -v'
                bat 'npm -v'
                bat 'npm config list'
                bat 'npm ci --verbose'
                bat 'npx playwright install --with-deps'
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
            archiveArtifacts artifacts: 'playwright-report/**, test-results/**', fingerprint: true
        }

        failure {
            echo '❌ Tests failed – sending email'

            emailext(
                subject: "❌ Playwright FAILED – ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                body: """
    Hi Team,

    Playwright automation execution FAILED.

    Job: ${env.JOB_NAME}
    Build Number: ${env.BUILD_NUMBER}
    Environment: ${ENV}
    Country: ${LOCATION}

    🔗 Jenkins Build:
    ${env.BUILD_URL}

    Playwright Report:
    ${env.BUILD_URL}artifact/playwright-report/index.html

    Regards,
    Jenkins
    """,
            to: "${EMAIL_USER}",
            mimeType: 'text/html'
        )
    }

    success {
        emailext(
            subject: "✅ Playwright PASSED – ${env.JOB_NAME} #${env.BUILD_NUMBER}",
            body: """
    Hi Team,

    Playwright automation execution PASSED 🎉

    Job: ${env.JOB_NAME}
    Build Number: ${env.BUILD_NUMBER}
    Environment: ${ENV}
    Country: ${LOCATION}

    Report:
    ${env.BUILD_URL}artifact/playwright-report/index.html

    Regards,
    Jenkins
    """,
            to: "${EMAIL_USER}",
            mimeType: 'text/html'
        )
    }
    }

}
