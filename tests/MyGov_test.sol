pragma solidity ^0.8.0;
import "../contracts/MyGov.sol";

contract Test {
    MyGovToken token;

    // beforeEach works before running each test
    function beforeEach() public {
        token = new MyGovToken();
    }

    function testDonationConsistency(){
        // TODO: Implement
    }

    /// Test if initial value is set correctly
    function initialValueShouldBe100() public returns (bool) {
        return Assert.equal(foo.get(), 100, "initial value is not correct");
    }

    /// Test if value is set as expected
    function valueIsSet200() public returns (bool) {
        foo.set(200);
        return Assert.equal(foo.get(), 200, "value is not 200");
    }
}