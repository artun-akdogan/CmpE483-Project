//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
//import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
//import "@openzeppelin/contracts/token/ERC20/utils/TokenTimelock.sol";
//import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";

contract MyGovToken is ERC20("MyGov Token", "MGT"){
    address payable tokenOwner;

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
        string name;
        address owner;
        uint votedeadline;
        uint[] paymentamounts;
        uint[] payschedule;
        uint voteCount;
        bool isWon;
        bool isFunded;
    }

    struct Survey {
        string name;
        address surveyowner;
        bytes32[] options;
        uint[] results;
    }

    mapping(address => Voter) public voters;
    mapping(uint => Survey) public surveys;
    mapping(uint => Proposal) public proposals;

    //Proposal[] public proposals;
    //Survey[] public surveys;
    //Voter[] public voters;

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
        //proposals[projectid].voteCount += sender.weight;
    }

    function voteForProjectPayment()public{
        // TODO: Implement function
    }

    function submitProjectProposal(
        string memory ipfshash,
        uint votedeadline,
        uint[] memory paymentamounts,
        uint[] memory payschedule
        ) public returns (uint projectid){
        bytes memory nameinbytes = bytes(ipfshash);
        Proposal memory newProposal = Proposal(nameinbytes, msg.sender, 0, false, false);
        //proposals.push(newProposal);
    }

    function submitSurvey(
        string memory ipfshash,
        uint surveydeadline,
        uint numchoices,
        uint atmostchoice
        ) public returns (uint surveyid){
        bytes memory nameinbytes = bytes(ipfshash);
        //Survey memory newSurvey = Survey(nameinbytes, msg.sender, [], []);
        //surveys.push(newSurvey);
    }

    function takeSurvey(uint surveyid, uint[] memory choices)public{
        Survey storage s = surveys[surveyid];
        for(uint i = 0; i < choices.length; i++){
            s.results[i]++;
        }
    }

    function reserveProjectGrant()public{
        // TODO: Implement function
    }

    function withdrawProjectPayment()public{
        // TODO: Implement function
    }

    function getSurveyResults(uint surveyid) public view returns(uint numtaken, uint[] memory results){
        Survey storage s = surveys[surveyid];
        numtaken = 1;
        results = s.results;
    }

    function getSurveyInfo(uint surveyid)public view returns(
        string memory ipfshash,
        uint surveydeadline,
        uint numchoices,
        uint atmostchoice
    ){
        Survey storage s = surveys[surveyid];
        //ipfshash = s.name;
        //surveydeadline = s.surveydeadline;
        //numchoices = s.numchoices;
        //atmostchoice = s.atmostchoice;
    }

    function getSurveyOwner(uint surveyid) public view returns(address surveyowner) {
        Survey storage survey = surveys[surveyid];
        surveyowner = survey.surveyowner;
    }

    function getIsProjectFunded(uint projectid)public view returns(bool funded){
        Proposal storage project = proposals[projectid];
        funded = project.isFunded;
    }

    function getProjectNextPayment(uint projectid)public view returns(uint next){
        next = proposals[projectid].voteCount;
    }

    function getProjectOwner(uint projectid)public view returns(address projectowner){
        Proposal storage p = proposals[projectid];
        projectowner = p.owner;
    }

    function getProjectInfo(uint activityid)public view returns(
        string memory ipfshash,
        uint votedeadline,
        uint[] memory paymentamounts,
        uint[] memory payschedule){
            ipfshash = proposals[activityid].name;
            votedeadline = proposals[activityid].votedeadline;
            paymentamounts = proposals[activityid].paymentamounts;
            payschedule = proposals[activityid].payschedule;
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

    function getEtherReceivedByProject(uint projectid) public view returns(uint amount){
        Proposal storage p = proposals[projectid];
        //amount = p.geteth
    }

    function getNoOfSurveys() public view returns (uint numsurveys) {
        numsurveys = surveys.length;
    }
}