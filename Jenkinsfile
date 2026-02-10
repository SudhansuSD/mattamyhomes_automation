pipeline {
    agent any

    parameters {
        choice(
            name: 'ENV',
            choices: ['STAGE', 'PROD'],
            description: 'Test Environment'
        )
        choice(
            name: 'LOCATION',
            choices: ['CAN', 'USA'],
            description: 'Test Location'
        )
    }

    environment {
        EMAIL_TO = 'ssdas@ex2india.com'
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
                bat 'npm ci --verbose'
                bat 'npx playwright install --with-deps'
            }
        }

        stage('Run Playwright Tests') {
            steps {
                bat """
                    chcp 65001
                    set ENV=${params.ENV}
                    set LOCATION=${params.LOCATION}
                    npm test
                """
            }
        }
    }

    post {
    always {
        echo '📦 Archiving Playwright artifacts'

        // Ensure folders exist (prevents Jenkins aborting archive step)
        bat '''
        if not exist playwright-report mkdir playwright-report
        if not exist test-results mkdir test-results
        '''

        // Archive Playwright HTML report & test artifacts
        archiveArtifacts(
            artifacts: 'playwright-report/**, test-results/**',
            fingerprint: true,
            allowEmptyArchive: true
        )
    }

        failure {
            echo 'Tests failed - sending email'

            mail(
                to: EMAIL_TO,
                subject: "Playwright FAILED - ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                body: """\
Hi Team,

Playwright automation execution FAILED.

Job: ${env.JOB_NAME}
Build Number: ${env.BUILD_NUMBER}
Environment: ${params.ENV}
Country: ${params.LOCATION}

Jenkins Build:
${env.BUILD_URL}

Playwright Report (download & open locally):
${env.BUILD_URL}artifact/playwright-report/

Regards,
Jenkins
"""
            )
        }

        success {
            mail(
                to: EMAIL_TO,
                subject: "Playwright PASSED - ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                body: """\
Hi Team,

Playwright automation execution PASSED successfully.

Job: ${env.JOB_NAME}
Build Number: ${env.BUILD_NUMBER}
Environment: ${params.ENV}
Country: ${params.LOCATION}

Playwright Report (download & open locally):
${env.BUILD_URL}artifact/playwright-report/

Regards,
Jenkins
"""
            )
        }
    }
}
