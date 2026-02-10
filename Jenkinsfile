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
        echo '📦 Collecting Playwright artifacts'

        // Debug output (safe to keep)
        bat '''
        echo ===== WORKSPACE =====
        dir
        '''

        // Ensure folders exist
        bat '''
        if not exist playwright-report (
            echo ❌ playwright-report folder missing
        ) else (
            echo ✅ playwright-report folder exists
        )
        '''

        // Zip report ONLY if it exists
        bat '''
        if exist playwright-report (
            powershell Compress-Archive `
              -Path playwright-report `
              -DestinationPath playwright-report.zip `
              -Force
        )
        '''

        // Archive artifacts (THIS creates the Artifacts tab)
        archiveArtifacts(
            artifacts: 'playwright-report/**, playwright-report.zip, test-results/**',
            fingerprint: true
        )
    }


        /* =========================================================
           FAILURE: Email with ZIP attached
           ========================================================= */
        failure {
            echo 'Tests failed - sending email with report attached'

            emailext(
                to: EMAIL_TO,
                subject: "Playwright FAILED | ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                body: """\
Hi Team,

Playwright automation execution FAILED.

Job: ${env.JOB_NAME}
Build Number: ${env.BUILD_NUMBER}
Environment: ${params.ENV}
Country: ${params.LOCATION}

Jenkins Build:
${env.BUILD_URL}

Playwright Report (downloadable):
${env.BUILD_URL}artifact/playwright-report/

The Playwright HTML report is attached as a ZIP
(download and open index.html locally).

Regards,
Jenkins
""",
                attachmentsPattern: 'playwright-report.zip',
                mimeType: 'text/plain'
            )
        }

        /* =========================================================
           SUCCESS: Optional email (ZIP included)
           ========================================================= */
        success {
            emailext(
                to: EMAIL_TO,
                subject: "Playwright PASSED | ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                body: """\
Hi Team,

Playwright automation execution PASSED successfully 🎉

Job: ${env.JOB_NAME}
Build Number: ${env.BUILD_NUMBER}
Environment: ${params.ENV}
Country: ${params.LOCATION}

Playwright Report:
${env.BUILD_URL}artifact/playwright-report/

Regards,
Jenkins
""",
                attachmentsPattern: 'playwright-report.zip',
                mimeType: 'text/plain'
            )
        }
    }
}
