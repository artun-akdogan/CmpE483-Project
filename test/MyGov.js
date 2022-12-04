const MyGov = artifacts.require('MyGovToken')

contract('MyGov', () => {
    it('should deploy smart contract properly', async () => {
        const myGov = await MyGov.deployed()
        console.log(myGov.address)
        assert(myGov.address !== '')
    })
})