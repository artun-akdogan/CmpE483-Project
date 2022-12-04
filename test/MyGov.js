const MyGov = artifacts.require('MyGovToken')
const Web3 = require('web3');

contract('MyGov', () => {
    it('should deploy smart contract properly', async () => {
        const myGov = await MyGov.deployed()
        console.log(myGov.address)
        assert(myGov.address !== '')
    })

    it('should donate eth to the contract owner address', async () => {
        const myGov = await MyGov.deployed()
        myGov.donateEther();
        //assert(myGov.address)
    })
})