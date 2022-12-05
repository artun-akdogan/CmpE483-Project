const MyGov = artifacts.require("MyGovToken")

module.exports = async () => {

    const [executor, proposer, voter1, voter2, voter3, voter4, voter5] = await web3.eth.getAccounts()

    const amount = web3.utils.toWei('5', 'ether')
    const governance = await MyGov.deployed()

    console.log(`Current eth amount of owner is ${await web3.eth.getBalance(executor)}\n`)

    console.log(executor)
    console.log(proposer)
    console.log(voter1)
    console.log(voter2)
    console.log(voter3)

    await governance.faucet(proposer)
    await governance.faucet(voter1)
    await governance.faucet(voter2)
    await governance.faucet(voter3)
    await governance.faucet(voter4)
    await governance.faucet(voter5)

    blockNumber = await web3.eth.getBlockNumber()
    console.log(`Current blocknumber: ${blockNumber}\n`)

    console.log(`Current token supply after faucet ${await governance.balanceOf(executor)}\n`)
    console.log(`Current token supply of proposer after faucet ${await governance.balanceOf(proposer)}\n`)
    console.log(`Current token supply of voter1 after faucet ${await governance.balanceOf(voter1)}\n`)
    console.log(`Current token supply of voter2 after faucet ${await governance.balanceOf(voter2)}\n`)
    console.log(`Current token supply of voter3 after faucet ${await governance.balanceOf(voter3)}\n`)
    console.log(`Current token supply of voter4 after faucet ${await governance.balanceOf(voter4)}\n`)
    console.log(`Current token supply of voter5 after faucet ${await governance.balanceOf(voter5)}\n`)

    const proposal_id_send = await governance.submitProjectProposal("Project is good?", 12312413, [3, 4, 5], [12312416, 12312417, 12312418])

    console.log(`Current eth amount of owner is ${await web3.eth.getBalance(executor)}\n`)
    console.log(`Current token supply after proposal send ${await governance.balanceOf(executor)}\n`)

    blockNumber = await web3.eth.getBlockNumber()
    console.log(`Current blocknumber: ${blockNumber}\n`)

    await governance.voteForProjectProposal(proposal_id_send, 1)
    await governance.voteForProjectProposal(proposal_id_send, 1)
    await governance.voteForProjectProposal(proposal_id_send, 1)
    await governance.voteForProjectProposal(proposal_id_send, 2)
    await governance.voteForProjectProposal(proposal_id_send, 2)

    blockNumber = await web3.eth.getBlockNumber()
    console.log(`Current blocknumber: ${blockNumber}\n`)
}