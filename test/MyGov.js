const MyGov = artifacts.require('MyGovToken')

let accounts = []
let myGov

function BigToIntArray(bigarr) {
    let array = []
    for (var i = 0; i < bigarr.length; i++) {
        array.push(bigarr[i].toNumber())
    }
    return array
}

function compareArray(arr1, arr2) {
    if (arr1.length !== arr2.length)
        return false;
    for (var i = 0; i < arr1.length; i++)
        if (arr1[i] !== arr2[i])
            return false;
    return true;
}

sendTokenFromOthers = (govToken, dest, _from, _to) => {
    return Promise.all([...Array(_to - _from).keys()].map(i => {
        return new Promise(async (resolve, reject) => {
            await govToken.faucet({ from: accounts[i + _from] })
            await new Promise(r => setTimeout(r, 300));
            await govToken.transferToken(accounts[dest], 1, { from: accounts[i + _from] })
            resolve()
        })
    }))
}

createEthAccounts = (size, coinbase) => {
    return Promise.all([...Array(size).keys()].map(i => {
        return new Promise(async (resolve, reject) => {
            let account = await web3.eth.personal.newAccount('password')
            await web3.eth.personal.unlockAccount(account, 'password', 0)
            await web3.eth.sendTransaction({ from: coinbase, to: account, value: web3.utils.toWei("10", "ether") })
            resolve(account)
        })
    }))
}

getReturnPayable = (returnPromise) => {
    return new Promise((resolve, reject) => {
        returnPromise.then((result) => {
            for (let i = 0; i < result.logs.length; i++) {
                if (result.logs[i].event == "Transfer") {
                    resolve(result.logs[i].args.value)
                }
            }
            reject(new Error("Value not found"))
        }).catch(err => reject(new Error(err)))
    })
}

contract('MyGov100', () => {
    before(async () => {
        const allAccounts = await web3.eth.getAccounts()
        const coinbase = allAccounts[0]
        console.log("coinbase account address:", coinbase)

        accounts = await createEthAccounts(100, coinbase)
        console.log(`Created account number: ${accounts.length}`)

        temp = await web3.eth.getAccounts()
        console.log(`Coinbase balance: ${web3.utils.fromWei(await web3.eth.getBalance(temp[0]), 'ether')}`)

        myGov = await MyGov.deployed()

        await sendTokenFromOthers(myGov, 1, 50, 100)
        console.log("Current token balance:", (await myGov.tokenBalance.call({ from: accounts[1] })).toNumber())
    })

    it('should deploy smart contract properly', async () => {
        console.log("contract address:", myGov.address)
        assert(myGov.address !== '')
    })

    it('should get token from faucet', async () => {
        const initialBalance = await myGov.tokenBalance({ from: accounts[1] })
        console.log(`token balance of ${accounts[1]} before faucet is:`, initialBalance.toNumber())
        await myGov.faucet({ from: accounts[1] })
        const afterBalance = await myGov.tokenBalance({ from: accounts[1] })
        console.log(`token balance of ${accounts[1]} after faucet is:`, afterBalance.toNumber())
        assert(afterBalance.toNumber() == (initialBalance.toNumber() + 1))
    })

    it('should submit proposal correctly', async () => {
        const numberOfProposalsBefore = await myGov.getNoOfProjectProposals()
        console.log(`number of proposals before submit proposal is:`, numberOfProposalsBefore.toNumber())
        const initialBalance = await web3.eth.getBalance(accounts[1])
        console.log(`eth balance of ${accounts[1]} before submit proposal is:`, initialBalance)
        const propResult = myGov.submitProjectProposal(
            "asdasdsad",
            1231241,
            [3, 5, 6, 8],
            [1231241, 1231241, 123124, 1231244],
            { from: accounts[1], value: web3.utils.toWei("0.1", "ether") }
        )
        const projectid = await getReturnPayable(propResult)
        const info = await myGov.getProjectInfo(0)
        assert(
            info.ipfshash === 'asdasdsad' &&
            info.votedeadline.toNumber() === 1231241 &&
            compareArray(BigToIntArray(info.paymentamounts), [3, 5, 6, 8]) &&
            compareArray(BigToIntArray(info.payschedule), [1231241, 1231241, 123124, 1231244])
        )

        const numberOfProposalsAfter = await myGov.getNoOfProjectProposals()
        console.log(`number of proposals after submit proposal is:`, numberOfProposalsAfter.toNumber())

        assert(numberOfProposalsAfter.toNumber() === numberOfProposalsBefore.toNumber() + 1)
        console.log(`Current eth balance of the contract: ${web3.utils.fromWei(await web3.eth.getBalance(myGov.address), "ether")}`)
        const afterBalance = await web3.eth.getBalance(accounts[1])
        console.log(`eth balance of ${accounts[1]} after submit proposal is:`, afterBalance)

    })

    it('should submit survey correctly', async () => {
        const numberOfSurveysBefore = await myGov.getNoOfSurveys()
        console.log(`number of surveys before submit survey is:`, numberOfSurveysBefore.toNumber())
        const initialBalance = await web3.eth.getBalance(accounts[1])
        console.log(`eth balance of ${accounts[1]} before submit survey is:`, initialBalance)
        const surveyResult = myGov.submitSurvey(
            'asdasdsad',
            1231241,
            3,
            5,
            { from: accounts[1], value: web3.utils.toWei("0.04", "ether") }
        )

        const surveyid = await getReturnPayable(surveyResult)
        const info = await myGov.getSurveyInfo(0)
        assert(
            info.ipfshash === 'asdasdsad' &&
            info.surveydeadline.toNumber() === 1231241 &&
            info.numchoices.toNumber() === 3 &&
            info.atmostchoice.toNumber() === 5
        )

        const numberOfSurveysAfter = await myGov.getNoOfSurveys()
        console.log(`number of surveys after submit survey is:`, numberOfSurveysAfter.toNumber())

        assert(numberOfSurveysAfter.toNumber() === numberOfSurveysBefore.toNumber() + 1)
        console.log(`Current eth balance of the contract: ${web3.utils.fromWei(await web3.eth.getBalance(myGov.address), "ether")}`)

        const afterBalance = await web3.eth.getBalance(accounts[1])
        console.log(`eth balance of ${accounts[1]} after submit survey is:`, afterBalance)
    })
})

contract('MyGov200', () => {
    before(async () => {
        const allAccounts = await web3.eth.getAccounts()
        const coinbase = allAccounts[0]
        console.log(coinbase)

        accounts = [...accounts, ...(await createEthAccounts(100, coinbase))]
        console.log(`Created account number: ${accounts.length}`)

        temp = await web3.eth.getAccounts()
        console.log(`Coinbase balance: ${web3.utils.fromWei(await web3.eth.getBalance(temp[0]), 'ether')}`)

        console.log("current: ", (await myGov.tokenBalance.call({ from: accounts[1] })).toNumber())
    })

    it('should deploy smart contract properly', async () => {
        console.log(myGov.address)
        assert(myGov.address !== '')
    })

    it('should get token from faucet', async () => {
        const initialBalance = await myGov.tokenBalance({ from: accounts[1] })
        console.log(accounts[1], initialBalance)
        await myGov.faucet({ from: accounts[1] })
        const afterBalance = await myGov.tokenBalance({ from: accounts[1] })
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
            { from: accounts[1], value: web3.utils.toWei("0.1", "ether") }
        )
        const projectid = await getReturnPayable(propResult)
        const info = await myGov.getProjectInfo(0)
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
})

contract('MyGov300', () => {
    before(async () => {
        const allAccounts = await web3.eth.getAccounts()
        const coinbase = allAccounts[0]
        console.log(coinbase)

        accounts = [...accounts, ...(await createEthAccounts(100, coinbase))]
        console.log(`Created account number: ${accounts.length}`)

        temp = await web3.eth.getAccounts()
        console.log(`Coinbase balance: ${web3.utils.fromWei(await web3.eth.getBalance(temp[0]), 'ether')}`)

        console.log("current: ", (await myGov.tokenBalance.call({ from: accounts[1] })).toNumber())
    })

    it('should deploy smart contract properly', async () => {
        console.log(myGov.address)
        assert(myGov.address !== '')
    })

    it('should get token from faucet', async () => {
        const initialBalance = await myGov.tokenBalance({ from: accounts[1] })
        console.log(accounts[1], initialBalance)
        await myGov.faucet({ from: accounts[1] })
        const afterBalance = await myGov.tokenBalance({ from: accounts[1] })
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
            { from: accounts[1], value: web3.utils.toWei("0.1", "ether") }
        )
        const projectid = await getReturnPayable(propResult)
        const info = await myGov.getProjectInfo(0)
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
})

contract('MyGov400', () => {
    before(async () => {
        const allAccounts = await web3.eth.getAccounts()
        const coinbase = allAccounts[0]
        console.log(coinbase)

        accounts = [...accounts, ...(await createEthAccounts(100, coinbase))]
        console.log(`Created account number: ${accounts.length}`)

        temp = await web3.eth.getAccounts()
        console.log(`Coinbase balance: ${web3.utils.fromWei(await web3.eth.getBalance(temp[0]), 'ether')}`)

        console.log("current: ", (await myGov.tokenBalance.call({ from: accounts[1] })).toNumber())
    })

    it('should deploy smart contract properly', async () => {
        console.log(myGov.address)
        assert(myGov.address !== '')
    })

    it('should get token from faucet', async () => {
        const initialBalance = await myGov.tokenBalance({ from: accounts[1] })
        console.log(accounts[1], initialBalance)
        await myGov.faucet({ from: accounts[1] })
        const afterBalance = await myGov.tokenBalance({ from: accounts[1] })
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
            { from: accounts[1], value: web3.utils.toWei("0.1", "ether") }
        )
        const projectid = await getReturnPayable(propResult)
        const info = await myGov.getProjectInfo(0)
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
})