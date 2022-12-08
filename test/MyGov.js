const MyGov = artifacts.require('MyGovToken')
const Web3 = require('web3');

let accounts = []
let myGov

function BigToIntArray(bigarr){
    let array = []
    for(var i=0;i<bigarr.length;i++){
        array.push(bigarr[i].toNumber())
    }
    return array
}

function compareArray(arr1, arr2){
    if(arr1.length!==arr2.length)
        return false;
    for(var i=0;i<arr1.length;i++)
        if(arr1[i]!==arr2[i])
            return false;
    return true;
}

sendTokenFromOthers = (govToken, dest, _from, _to)=>{
    return Promise.all([...Array(_to-_from).keys()].map(i => {
        return new Promise(async(resolve, reject) => {
            //console.log(`From address: ${i + _from}`)
            await govToken.faucet({from: accounts[i + _from]})
            await new Promise(r => setTimeout(r, 300));
            //console.log("test: ", i + _from, await myGov.tokenBalance.call({from: accounts[i + _from]}))
            await govToken.transferToken(accounts[dest], 1, {from: accounts[i + _from]})
            resolve()
        })
    }))
}

createEthAccounts = (size, coinbase)=>{
    return Promise.all([...Array(size).keys()].map(i => {
        return new Promise(async(resolve, reject) => {
            let account = await web3.eth.personal.newAccount('password')
            await web3.eth.personal.unlockAccount(account,'password',0) 
            await web3.eth.sendTransaction({from:coinbase,to:account,value:web3.utils.toWei("10", "ether")})
            resolve(account)
        })
    }))
}

getReturnPayable = (returnPromise)=>{
    return new Promise((resolve, reject) => {
        returnPromise.then((result)=>{
            for (let i = 0; i < result.logs.length; i++) {
                if (result.logs[i].event == "Transfer") {
                    //console.log(JSON.stringify(result))
                    resolve(result.logs[i].args.value)
                }
            }
            reject(new Error("Value not found"))
        }).catch(err => reject(new Error(err)))
    })
}

contract('MyGov', () => {
    before(async () => {
        //accounts = await web3.eth.getAccounts()
        const allAccounts = await web3.eth.getAccounts()
        const coinbase = allAccounts[0]
        console.log(coinbase)
        
        accounts = await createEthAccounts(20, coinbase)
        console.log(`Created account number: ${accounts.length}`)

        temp = await web3.eth.getAccounts()
        console.log(`Coinbase balance: ${web3.utils.fromWei(await web3.eth.getBalance(temp[0]), 'ether')}`)

        // wait for myGov to be deployed
        myGov = await MyGov.deployed()

        // Donate tokens to one account to be able to propose new surveys and proposals
        await sendTokenFromOthers(myGov, 1, 5, 20)
        console.log("current: ", (await myGov.tokenBalance.call({from: accounts[1]})).toNumber())
    })

    it('should deploy smart contract properly', async () => {
        console.log(myGov.address)
        assert(myGov.address !== '')
    })

    it('should get token from faucet', async () => {
        const initialBalance = await myGov.tokenBalance({from: accounts[1]})
        console.log(accounts[1], initialBalance)
        await myGov.faucet({from: accounts[1]})
        const afterBalance = await myGov.tokenBalance({from: accounts[1]})
        assert(afterBalance.toNumber() == (initialBalance.toNumber() + 1))
    })

    it('should submit proposal correctly', async () => {
        const numberOfProposalsBefore = await myGov.getNoOfProjectProposals()

        console.log(await web3.eth.getBalance(accounts[1]))
        const propResult = myGov.submitProjectProposal(
            "asdasdsad",
            1231241,
            [3, 5, 6, 8],
            [1231241, 1231241, 123124, 1231244],
            {from: accounts[1], value: web3.utils.toWei("0.1", "ether")}
        )
        const projectid= await getReturnPayable(propResult)
        console.log(`Returned ProjectId ${projectid}`)
        // Returned projectid is faulty.
        const info = await myGov.getProjectInfo(0)
        //console.log(JSON.stringify(info), info.votedeadline.toNumber())
        assert(
            info.ipfshash === 'asdasdsad' &&
            info.votedeadline.toNumber() === 1231241 &&
            compareArray(BigToIntArray(info.paymentamounts), [3, 5, 6, 8]) &&
            compareArray(BigToIntArray(info.payschedule), [1231241, 1231241, 123124, 1231244])
        )

        const numberOfProposalsAfter = await myGov.getNoOfProjectProposals()

        assert(numberOfProposalsAfter.toNumber() === numberOfProposalsBefore.toNumber() + 1)
        console.log(`Current eth balance: ${web3.utils.fromWei(await web3.eth.getBalance(myGov.address), "ether")}`)
    })

    it('should submit survey correctly', async () => {
        const numberOfSurveysBefore = await myGov.getNoOfSurveys()

        const surveyResult = myGov.submitSurvey(
            'asdasdsad',
            1231241,
            3,
            5,
            {from: accounts[1], value: web3.utils.toWei("0.04", "ether")}
        )

        const surveyid = await getReturnPayable(surveyResult)
        console.log(`Returned SurveyId ${surveyid}`)
        // surveyid not working correctly
        const info = await myGov.getSurveyInfo(0)
        assert(
            info.ipfshash === 'asdasdsad' &&
            info.surveydeadline.toNumber() === 1231241 &&
            info.numchoices.toNumber() === 3 &&
            info.atmostchoice.toNumber() === 5
        )

        const numberOfSurveysAfter = await myGov.getNoOfSurveys()

        assert(numberOfSurveysAfter.toNumber() === numberOfSurveysBefore.toNumber() + 1)
        console.log(`Current eth balance: ${web3.utils.fromWei(await web3.eth.getBalance(myGov.address), "ether")}`)
    })
})