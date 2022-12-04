const myGov = artifacts.require('MyGovToken');

module.exports = function (deployer) {
    deployer.deploy(myGov, 10000000);
};