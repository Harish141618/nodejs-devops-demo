pipeline {
    agent any

    tools {
        nodejs 'NodeJS18'
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Verify Tools') {
            steps {
                sh '''
                node -v
                npm -v
                git --version
                '''
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('SonarQube Scan') {
            steps {
                script {
                    def scannerHome = tool 'SonarQube'

                    withSonarQubeEnv('SonarQube') {
                        sh "${scannerHome}/bin/sonar-scanner"
                    }
                }
            }
        }

        stage('Quality Gate') {
            steps {
                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        stage('Run Tests') {
            steps {
                sh 'npm test'
            }
        }

        stage('OWASP Dependency Check') {
            steps {
                dependencyCheck additionalArguments: '--scan .',
                                odcInstallation: 'DependencyCheck'
            }
        }
    
        stage('Docker Build') {
            steps {
                 sh '''
                         docker build -t nodejs-app:${BUILD_NUMBER} .
                    '''
             }
        }
        stage('Trivy File System Scan') {
            steps {
                 sh '''
                    trivy fs --severity HIGH,CRITICAL .
                 '''
             }
         }

         stage('Trivy Image Scan') {
             steps {
                  sh '''
                      trivy image --severity HIGH,CRITICAL nodejs-app:${BUILD_NUMBER}
                  '''
              }
         }
     }

    post {
        success {
            echo 'Pipeline Successful'
        }

        failure {
            echo 'Pipeline Failed'
        }
    }
}
