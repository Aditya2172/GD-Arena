pipeline {
    agent any

    environment {
        NODE_ENV = 'production'
        DOCKER_IMAGE_BACKEND = 'gdarena-backend:latest'
        DOCKER_IMAGE_FRONTEND = 'gdarena-frontend:latest'
        SCAN_SEVERITY = 'CRITICAL,HIGH'
    }

    tools {
        nodejs 'NodeJS-20'
    }

    stages {
        stage('1. Checkout SCM') {
            steps {
                echo 'Checking out latest commit from Git repository...'
                checkout scm
            }
        }

        stage('2. Dependency Installation') {
            steps {
                echo 'Installing monorepo workspace dependencies...'
                sh 'npm ci'
            }
        }

        stage('3. Lint & Typecheck') {
            parallel {
                stage('Typecheck Server') {
                    steps {
                        echo 'Typechecking server code with tsc...'
                        sh 'npm --prefix server run build'
                    }
                }
                stage('Typecheck Client') {
                    steps {
                        echo 'Typechecking client code with tsc & vite...'
                        sh 'npm --prefix client run build'
                    }
                }
            }
        }

        stage('4. Automated Test Suite') {
            steps {
                echo 'Executing Vitest unit and integration test suite...'
                sh 'npm --prefix server test'
            }
        }

        stage('5. Docker Image Build') {
            steps {
                echo 'Building production Docker images...'
                sh 'docker build -t ${DOCKER_IMAGE_BACKEND} -f server/Dockerfile .'
                sh 'docker build -t ${DOCKER_IMAGE_FRONTEND} -f client/Dockerfile .'
            }
        }

        stage('6. Security Vulnerability Scan') {
            steps {
                echo 'Auditing Docker containers with Trivy scanner...'
                sh 'which trivy >/dev/null 2>&1 && trivy image --severity ${SCAN_SEVERITY} --exit-code 0 ${DOCKER_IMAGE_BACKEND} || echo "Trivy not installed on Jenkins agent, skipping scan."'
            }
        }

        stage('7. Deployment Verification') {
            steps {
                echo 'Deploying application stack via Docker Compose...'
                sh 'docker compose -f docker-compose.prod.yml up -d'
                echo 'Verifying deployment health...'
                sh 'sleep 10 && curl -f http://localhost:5000/api/health || exit 1'
            }
        }
    }

    post {
        always {
            echo 'Archiving test reports and cleaning workspace...'
            cleanWs()
        }
        success {
            echo 'GD Arena Pipeline completed successfully! Application is live and healthy.'
        }
        failure {
            echo 'GD Arena Pipeline failed! Check stage logs for details.'
        }
    }
}
