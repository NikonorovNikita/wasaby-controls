@Library('pipeline') _

def version = '20.1100'

node ('controls') {
    checkout_pipeline("20.1100/pea/exlude_testing_3000")
    run_branch = load '/home/sbis/jenkins_pipeline/platforma/branch/run_branch'
    run_branch.execute('wasaby_controls', version)
}