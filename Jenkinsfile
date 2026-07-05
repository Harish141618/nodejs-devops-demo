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
         stage('Tag Docker Image') {
              steps {
                  sh '''
                      docker tag nodejs-app:${BUILD_NUMBER} \
                      ${ECR_REPO}:${BUILD_NUMBER}
                  '''
               }
         }
         stage('Push Docker Image') {
              steps {
                  sh '''
                      docker push ${ECR_REPO}:${BUILD_NUMBER}
                  '''
               }
         }
         stage('Clone Manifest Repository') {
              steps {
                 dir('gitops') {
                      git branch: 'main',
                      credentialsId: 'github',
                      url: 'https://github.com/Harish141618/nodejs-k8s-manifests.git'
                 }
              }
         }  
        stage('Update Manifest') {
              steps {
                  dir('gitops') {
                           sh '''
                                sed -i "s|image:.*|image: ${ECR_REPO}:.*|image: ${ECR_REPO}:${BUILD_NUMBER}|g" deployment.yaml

                                cat deployment.yaml
                            '''
                   }
               }
         }
         stage('Commit & Push Manifest') {
                steps {
                   dir('gitops') {
                         withCredentials([usernamePassword(
                                  credentialsId: 'github',
                                  usernameVariable: 'GIT_USER',
                                  passwordVariable: 'GIT_TOKEN'
                          )]) {

                    sh '''
                          git config user.email "jenkins@demo.com"
                          git config user.name "Jenkins"

                          git add .

                          git commit -m "Updated image ${BUILD_NUMBER}" || true

                          git push https://${GIT_USER}:${GIT_TOKEN}@github.com/Harish141618/nodejs-k8s-manifests.git HEAD:main
                          '''
                     }
                  }
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
