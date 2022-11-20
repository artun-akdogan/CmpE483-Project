//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
//import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
//import "@openzeppelin/contracts/token/ERC20/utils/TokenTimelock.sol";
//import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";

contract MyGovToken is ERC20("MyGov Token", "MGT"){
    
    constructor(uint tokensupply) {
        tokenOwner = payable(msg.sender);
        _mint(msg.sender, tokensupply * 10**18);
    }

    struct Voter {
        uint weight;
        bool voted;
        address delegate;
        uint votedProposal;
    }

    struct Proposal {
        bytes name;
        uint voteCount;
        bool isWon;
        bool isFunded;
    }

    struct Survey {
        bytes32 name;
        bytes32[] options;
        uint[] results;
    }

    address payable tokenOwner;
    mapping(address => Voter) public voters;
    Proposal[] public proposals;
    Survey[] public surveys;

    function delegateVoteTo(address memberaddr, uint projectid) public {
        Voter storage sender = voters[msg.sender];
        require(!sender.voted, "You already voted!");
        require(memberaddr != msg.sender, "Self delegation not allowed!");

        sender.voted = true;
        sender.delegate = memberaddr;

        Voter storage delegate = voters[memberaddr];

        delegate.weight += sender.weight;
    }

    function donateEther() external payable {
        tokenOwner.transfer(123);
    }

    function donateMyGovToken(uint amount) public {
        transfer(tokenOwner, amount);
    }

    function voteForProjectProposal(uint projectid, bool choice) public {
        Voter storage sender = voters[msg.sender];
        sender.voted = true;
        sender.votedProposal = projectid;
        proposals[projectid].voteCount += sender.weight;
    }

    function voteForProjectPayment()public{
        // TODO: Implement function
    }

    function submitProjectProposal(
        string memory ipfshash,
        uint votedeadline,
        uint[] memory paymentamounts,
        uint[] memory payschedule
        ) public {
        bytes memory nameinbytes = bytes(ipfshash);
        Proposal memory newProposal = Proposal(nameinbytes, 0, false, false);
        proposals.push(newProposal);
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

    function getSurveyOwner(uint surveyid) public view returns(address surveyowner) {
        
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

    function getNoOfProjectProposals() public view returns (uint numofproposals){
        numofproposals = proposals.length;
    }

    function getNoOfFundedProjects() public view returns (uint numfunded){
        uint total_funded = 0;
        for(uint i = 0; i < proposals.length; i++){
            if(proposals[i].isFunded)
                total_funded++;
        }
        numfunded = total_funded;
    }

    function getEtherReceivedByProject()public{
        // TODO: Implement function
    }

    function getNoOfSurveys() public view returns (uint numsurveys) {
        numsurveys = surveys.length;
    }
}