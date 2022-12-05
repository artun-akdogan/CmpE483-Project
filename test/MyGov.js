const MyGov = artifacts.require('MyGovToken')
const Web3 = require('web3');

contract('MyGov', () => {
    it('should deploy smart contract properly', async () => {
        const myGov = await MyGov.deployed()
        console.log(myGov.address)
        assert(myGov.address !== '')
    })

    it('should get token from faucet', async () => {
        const myGov = await MyGov.deployed()
        const initialBalance = await myGov.balanceOf(myGov.address)
        await myGov.faucet()
        const afterBalance = await myGov.balanceOf(myGov.address)
        assert(afterBalance == (initialBalance + 1))
    })

    it('should submit proposal correctly', async () => {
        const myGov = await MyGov.deployed()

        const numberOfProposalsBefore = await MyGov.getNoOfProjectProposals()

        const projectid = await myGov.submitProjectProposal(
            'asdasdsad',
            1231241,
            [3, 5, 6, 8],
            [1231241, 1231241, 123124, 1231244]
        )
        const info = await myGov.getProjectInfo(projectid)
        assert(
            info.ipfshash === 'asdasdsad' &&
            info.votedeadline === 1231241 &&
            info.paymentamounts === [3, 5, 6, 8] &&
            info.payschedule === [1231241, 1231241, 123124, 1231244]
        )

        const numberOfProposalsAfter = await MyGov.getNoOfProjectProposals()

        assert(numberOfProposalsAfter === numberOfProposalsBefore + 1)
    })

    it('should submit survey correctly', async () => {
        const myGov = await MyGov.deployed()

        const numberOfSurveysBefore = await MyGov.getNoOfSurveys()

        const surveyid = await myGov.submitSurvey(
            'asdasdsad',
            1231241,
            3,
            5
        )

        const info = await myGov.getSurveyInfo(surveyid)
        assert(
            info.ipfshash === 'asdasdsad' &&
            info.surveydeadline === 1231241 &&
            info.numchoices === 3 &&
            info.atmostchoice === 5
        )

        const numberOfSurveysAfter = await MyGov.getNoOfSurveys()

        assert(numberOfSurveysAfter === numberOfSurveysBefore + 1)
    })
})