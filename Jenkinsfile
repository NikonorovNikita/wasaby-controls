@Library('pipeline') _

def version = '20.3000'

node ('controls') {
    checkout_pipeline("20.2000/feature/pea/stability_tests_all")
    run_branch = load '/home/sbis/jenkins_pipeline/platforma/branch/run_branch'
    run_branch.execute('wasaby_controls', version)
}