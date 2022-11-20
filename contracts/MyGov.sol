//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MyGovToken is ERC20("MyGov Token", "MGT"){
    
    address payable tokenOwner;
    
    constructor(uint tokensupply) {
        tokenOwner = payable(msg.sender);
        _mint(msg.sender, tokensupply * 10**18);
    }

    function delegateVoteTo() public{
        // TODO: Implement function
    }

    function donateEther() external payable {
        tokenOwner.transfer(123);
    }

    function donateMyGovToken(uint amount) public {
        transfer(tokenOwner, amount);
    }

    function voteForProjectProposal()public{
        // TODO: Implement function
    }

    function voteForProjectPayment()public{
        // TODO: Implement function
    }

    function submitProjectProposal()public{
        // TODO: Implement function
    }

    function submitSurvey()public{
        // TODO: Implement function
    }

    function takeSurvey()public{
        // TODO: Implement function
    }

    function reserveProjectGrant()public{
        // TODO: Implement function
    }

    function withdrawProjectPayment()public{
        // TODO: Implement function
    }

    function getSurveyResults()public{
        // TODO: Implement function
    }

    function getSurveyInfo()public{
        // TODO: Implement function
    }

    function getSurveyOwner()public{
        // TODO: Implement function
    }

    function getIsProjectFunded()public{
        // TODO: Implement function
    }

    function getProjectNextPayment()public{
        // TODO: Implement function
    }

    function getProjectOwner()public{
        // TODO: Implement function
    }

    function getProjectInfo()public{
        // TODO: Implement function
    }

    function getNoOfProjectProposals()public{
        // TODO: Implement function
    }

    function getNoOfFundedProjects()public{
        // TODO: Implement function
    }

    function getEtherReceivedByProject()public{
        // TODO: Implement function
    }

    function getNoOfSurveys()public{
        // TODO: Implement function
    }
}