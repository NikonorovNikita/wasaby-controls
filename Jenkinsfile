@Library('pipeline') _

def version = '20.1000'

node ('controls') {
    checkout_pipeline("20.1000/pea/without_skips")
    run_branch = load '/home/sbis/jenkins_pipeline/platforma/branch/run_branch'
    run_branch.execute('controls', version)
}
