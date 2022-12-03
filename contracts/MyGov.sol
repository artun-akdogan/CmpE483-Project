//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
//import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
//import "@openzeppelin/contracts/token/ERC20/utils/TokenTimelock.sol";
//import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";

contract MyGovToken is ERC20("MyGov Token", "MGT"){
    address tokenOwner;
    address payable tokenOwnerEth;
    uint supliedToken = 0;
    uint maxSupply;
    mapping(address => bool) faucetUsage;

    constructor(uint tokensupply) {
        maxSupply=tokensupply;
        tokenOwnerEth = payable(msg.sender);
        tokenOwner = msg.sender;
    }

    struct Voter {
        //uint weight; // Burası ne ise yarıyor
        //bool voted; // voted kalkabilir.
        // sender voted ayrıca project paymet için de tutulmalı??
        mapping(uint=>address[]) delegates;
        mapping(uint=>bool) alreadyDelegatedHisVote;
        // delegate eden kişilerin adresine sahip olmalı
        //uint votedProposal;
    }

    struct Proposal {
        string name;
        address owner;
        uint votedeadline;
        uint[] paymentamounts; // Neden array
        uint[] payschedule; // Ne ise yarıyor
        mapping(address => uint8) votes; // 0->not voted, 1->no, 2->yes
        uint voteCount;
        uint trueVotes;
        bool isWon;
        bool isFunded;

        address balanceOfProject;
    }

    struct Survey {
        string name;
        address surveyowner;
        uint surveydeadline;
        uint atmostchoice;
        uint numtaken;
        bytes32[] options;
        uint[] results; // Options ile birlestirebilir miyiz?
    }

    mapping(address => Voter) public voters;
    //mapping(uint => Survey) public surveys;
    //mapping(uint => Proposal) public proposals;

    Proposal[] public proposals;
    Survey[] public surveys;
    //Voter[] public voters;

    function transferToken(address dest, uint token)private{//başarılı olup olmadığını kontrol etmemiz
        transfer(dest, token);
        /*
        require(balances[msg.sender]>=token, "Don't have enough token");
        balances[msg.sender] -= token;
        balances[dest] += token;*/
    }
    function transferEth(address payable dest, uint eth)private{
        (bool success, ) = dest.call{value: eth}("");
        require(success, "Failed to send Ether");
    }

    function faucet()public{
        require(!faucetUsage[msg.sender], "Faucet already used!");
        require(supliedToken<maxSupply, "Supply limit reached!");
        _mint(msg.sender, 1);
        supliedToken++;
        faucetUsage[msg.sender] = true;
    }

    function delegateVoteTo(address memberaddr, uint projectid) public { // Bu fonksiyon ne yapıyor?
        Voter storage sender = voters[msg.sender];
        Voter storage receiver = voters[memberaddr];
        require(Proposal.votes[msg.sender]==0, "You already voted for this project!");
        require(!sender.alreadyDelegatedHisVote[projectid], "You already delegate your vote to someone for this project!");
        require(!receiver.alreadyDelegatedHisVote[projectid], "Target already delegated their vote!");
        require(memberaddr != msg.sender, "Self delegation not allowed!");
        //sender.voted = true;
        //sender.delegate = memberaddr;
        //Voter storage delegate = voters[memberaddr];
        receiver.delegates[projectid].add(msg.sender);
        sender.alreadyDelegatedHisVote[projectid] = true;

        for( i = 0; i < sender.delegates[projectid].length; i++ ){
            reveicer.delegates[projectid].push(sender.delegates[projectid][i]);
        }
        sender.delegates[projectid] = new address[](0);

        //Members who voted or delegated vote cannot reduce their MyGov balance to zero until the voting deadlines
    }

    function donateEther() external payable {
        transferEth(tokenOwnerEth, msg.value);
    }

    function donateMyGovToken(uint amount) public {
        transferToken(tokenOwner, amount);
    }

    function tokenBalance() returns(uint balance){
        balance = balanceOf(msg.sender);
    }

    function voteForProjectProposal(uint projectid, bool choice) public {
        //Voter storage sender = voters[msg.sender];
        //sender.votedProposal = projectid;
        //proposals[projectid].voteCount += sender.weight;
        //proposals[projectid].votes[msg.sender]=choice;

        //Members who voted or delegated vote cannot reduce their MyGov balance to zero until the voting deadlines

        Voter storage sender = voters[msg.sender];
        proposals[projectid].votes[msg.sender]=choice;
        for(uint i = 0; i < sender.delegates.length; i++){
            proposals[projectid].votes[sender.delegates[i]]=choice;
        }
    }

    function voteForProjectPayment(uint projectid, bool choice)public{
        Voter storage sender = voters[msg.sender];
        proposals[projectid].votes[msg.sender]=choice;
        for(uint i = 0; i < sender.delegates.length; i++){
            proposals[projectid].votes[sender.delegates[i]]=choice;
        }
    }

    function submitProjectProposal( // Payment yok
        string memory ipfshash,
        uint votedeadline,
        uint[] memory paymentamounts,
        uint[] memory payschedule
        ) public returns (uint projectid){ // Nerede donuyor?
        //bytes memory nameinbytes = bytes(ipfshash);
        transferToken(tokenOwner, 5);
        transferEth(tokenOwner, 100*10**15);
        projectid = proposals.length;
        Proposal storage newProposal = proposals.push();
        newProposal.name = ipfshash;
        newProposal.owner = msg.sender;
        newProposal.votedeadline = votedeadline;
        newProposal.paymentamounts = paymentamounts;
        newProposal.payschedule = payschedule;
        newProposal.voteCount = 0;
        newProposal.isWon = false;
        newProposal.isFunded = false;
        // Proposal(ipfshash, msg.sender, votedeadline, paymentamounts, payschedule, new Votes[](0), 0, false, false);
        
    }

    function submitSurvey( // Payment yok
        string memory ipfshash,
        uint surveydeadline,
        uint numchoices,
        uint atmostchoice
        ) public returns (uint surveyid){
        // bytes memory nameinbytes = bytes(ipfshash);
        transferEth(tokenOwnerEth, 40*10**15); //weiye çevirmek gerekebilir ya da farklı bir yol bulmamız gerekiyor
        transferToken(tokenOwner, 2); //işlemlerin gerçekleştiğini kontrol etmemiz gerekir

        Survey memory newSurvey = Survey(ipfshash, msg.sender, surveydeadline, atmostchoice, 0, new bytes32[](numchoices), new uint[](numchoices));
        surveys.push(newSurvey);
    }

    function takeSurvey(uint surveyid, uint[] memory choices)public{
        Survey storage s = surveys[surveyid];
        s.numtaken++;
        require(s.results.length==choices.length, "Choices length mismatch");
        for(uint i = 0; i < choices.length; i++){
            s.results[i]+=choices[i];
        }
    }

    function reserveProjectGrant(uint projectid)public{
        // Community 1/10 u evet demeli
        // Deadline gecmemis olmali
        Proposal p = proposals[projectid];
        require(p.votedeadline <= block.timestamp);
        if(p.trueVotes*10 > p.voteCount){
            p.isWon = true;
        }
        else {
            p.isWon = false;
        }
    }

    function withdrawProjectPayment(uint projectid)public{
        Proposal p = proposals[projectid];
        if(p.trueVotes*100 > p.voteCount){
            p.isFunded = true;
        }
        else {
            p.isFunded = false;
        }
    }

    function getSurveyResults(uint surveyid) public view returns(uint numtaken, uint[] memory results){
        Survey storage s = surveys[surveyid];
        numtaken = s.numtaken;
        results = s.results;
    }

    function getSurveyInfo(uint surveyid)public view returns(
        string memory ipfshash,
        uint surveydeadline,
        uint numchoices,
        uint atmostchoice
    ){
        Survey storage s = surveys[surveyid];
        ipfshash = s.name;
        surveydeadline = s.surveydeadline;
        numchoices = s.options.length;
        atmostchoice = s.atmostchoice;
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
        Proposal p = proposals[projectid]
        next = p.payschedule[0]; // Burası doğru mu?
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
        amount = balanceOf(p.balanceOfProject);
        //amount = p.geteth
    }

    function getNoOfSurveys() public view returns (uint numsurveys) {
        numsurveys = surveys.length;
    }
}