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
        uint blockedUntil;
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
        mapping(address => uint8) paymentVotes; // 0->not voted, 1->no, 2->yes
        uint paymentVoteCount;
        uint paymentTrueVotes;
        bool isWon;
        bool isFunded;
        uint balanceOfProject;
    }

    struct Survey {
        string name;
        address surveyowner;
        uint surveydeadline;
        uint atmostchoice;
        uint numtaken;
        mapping(address => bool) participated;
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
        require(balanceOf(msg.sender)>=token, "Higher token amount than account have");
        require(voters[msg.sender].blockedUntil <= block.timestamp || balanceOf(msg.sender)-1 >= token, "Vote delegated or used. Cannot reduce account token amount to zero.");
        require(transfer(dest, token), "Failed to send token!");
    }
    function transferEth(address payable dest, uint eth)private{
        (bool success, ) = dest.call{value: eth}("");
        require(success, "Failed to send Ether!");
    }

    // Malfunctioning
    function withdrawEth(address payable dest, uint eth) private {
        transferEth(dest, eth);
    }

    function faucet()public{
        require(!faucetUsage[msg.sender], "Faucet already used!");
        require(supliedToken<maxSupply, "Supply limit reached!");
        _mint(msg.sender, 1);
        supliedToken++;
        faucetUsage[msg.sender] = true;
    }

    function delegateVoteTo(address memberaddr, uint projectid) public {
        Voter storage sender = voters[msg.sender];
        Voter storage receiver = voters[memberaddr];
        require(balanceOf(msg.sender)>=1, "Must have at least one token to delegate!");
        require(proposals[projectid].votes[msg.sender]==0, "You already voted for this project!");
        require(!sender.alreadyDelegatedHisVote[projectid], "You already delegate your vote to someone for this project!");
        require(!receiver.alreadyDelegatedHisVote[projectid], "Target already delegated their vote!");
        require(memberaddr != msg.sender, "Self delegation not allowed!");
        //sender.voted = true;
        //sender.delegate = memberaddr;
        //Voter storage delegate = voters[memberaddr];
        if(sender.blockedUntil < proposals[projectid].votedeadline){
            sender.blockedUntil = proposals[projectid].votedeadline;
        }
        receiver.delegates[projectid].push(msg.sender);
        sender.alreadyDelegatedHisVote[projectid] = true;

        for(uint i = 0; i < sender.delegates[projectid].length; i++ ){
            receiver.delegates[projectid].push(sender.delegates[projectid][i]);
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

    function tokenBalance() public returns(uint balance){
        balance = balanceOf(msg.sender);
    }

    function voteForProjectProposal(uint projectid, bool choice) public {
        require(balanceOf(msg.sender)>=1, "Must have at least one token to vote!");
        require(proposals[projectid].votes[msg.sender]==0, "Already voted for project proposal");
        //Members who voted or delegated vote cannot reduce their MyGov balance to zero until the voting deadlines

        // Member Control should be written!
        Voter storage sender = voters[msg.sender];
        if(sender.blockedUntil < proposals[projectid].votedeadline){
            sender.blockedUntil = proposals[projectid].votedeadline;
        }
        proposals[projectid].voteCount++;
        if(choice){
            proposals[projectid].trueVotes++;
            proposals[projectid].votes[msg.sender]=2;
        }else{
            proposals[projectid].votes[msg.sender]=1;
        }
        for(uint i = 0; i < sender.delegates[projectid].length; i++){
            proposals[projectid].voteCount++;
            if(choice){
                proposals[projectid].trueVotes++;
                proposals[projectid].votes[sender.delegates[projectid][i]]=2;
            }else{
                proposals[projectid].votes[sender.delegates[projectid][i]]=1;
            }
        }
    }

    function voteForProjectPayment(uint projectid, bool choice)public{
        require(balanceOf(msg.sender)>=1, "Must have at least one token to vote!");
        require(proposals[projectid].votes[msg.sender]==0, "Already voted for project proposal");
        //Members who voted or delegated vote cannot reduce their MyGov balance to zero until the voting deadlines

        // Member Control should be written!
        Voter storage sender = voters[msg.sender];
        if(sender.blockedUntil < proposals[projectid].votedeadline){
            sender.blockedUntil = proposals[projectid].votedeadline;
        }
        proposals[projectid].paymentVoteCount++;
        if(choice){
            proposals[projectid].paymentTrueVotes++;
            proposals[projectid].paymentVotes[msg.sender]=2;
        }else{
            proposals[projectid].paymentVotes[msg.sender]=1;
        }
        for(uint i = 0; i < sender.delegates[projectid].length; i++){
            proposals[projectid].paymentVoteCount++;
            if(choice){
                proposals[projectid].paymentTrueVotes++;
                proposals[projectid].paymentVotes[sender.delegates[projectid][i]]=2;
            }else{
                proposals[projectid].paymentVotes[sender.delegates[projectid][i]]=1;
            }
        }
    }

    function submitProjectProposal( // Payment yok
        string memory ipfshash,
        uint votedeadline,
        uint[] memory paymentamounts,
        uint[] memory payschedule
        ) public returns (uint projectid){ // Nerede donuyor?
        //bytes memory nameinbytes = bytes(ipfshash);
        require(paymentamounts.length==payschedule.length, "Payment amount and payment schedule arrays not equal!");
        transferToken(tokenOwner, 5);
        transferEth(tokenOwnerEth, 100*10**15);
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

        surveyid = surveys.length;
        Survey storage newSurvey = surveys.push();
        newSurvey.name = ipfshash;
        newSurvey.surveyowner = msg.sender;
        newSurvey.surveydeadline = surveydeadline;
        newSurvey.atmostchoice = atmostchoice;
        newSurvey.numtaken = 0;
        newSurvey.options = new bytes32[](numchoices);
        newSurvey.results = new uint[](numchoices);
        //Survey storage newSurvey = Survey(ipfshash, msg.sender, surveydeadline, atmostchoice, 0, new bytes32[](numchoices), new uint[](numchoices));
        //surveys.push(newSurvey);
    }

    // options[] = {a, b, c}
    // results[] = {2, 4, 3}
    // choices[] = {0, 1, 2}
    function takeSurvey(uint surveyid, uint[] memory choices)public{
        Survey storage s = surveys[surveyid];
        require(!s.participated[msg.sender], "Already participated!");
        require(s.results.length==choices.length, "Choices length mismatch");
        s.numtaken++;
        s.participated[msg.sender]=true;
        for(uint i = 0; i < choices.length; i++){
            s.results[i]+=choices[i];
        }
    }

    function reserveProjectGrant(uint projectid)public{
        // Community 1/10 u evet demeli
        // Deadline gecmemis olmali
        Proposal storage p = proposals[projectid];
        require(p.votedeadline <= block.timestamp, "Vote deadline is exceeded!");
        require(msg.sender == p.owner, "Only project owner should call this method");
        
        uint current_time_index = 0;
        for(uint i = 0; i < p.payschedule.length; i++){
            if(block.timestamp > p.payschedule[i]){
                current_time_index = i;
            }
        }    
        
        require(address(tokenOwnerEth).balance >= p.paymentamounts[current_time_index], 
            "There is not enough eth in the contract for current payment schedule!");
            
        if(p.trueVotes*10 > p.voteCount){
            p.isWon = true;
        }
        else {
            p.isWon = false;
        }
    }

    function withdrawProjectPayment(uint projectid)public{
        Proposal storage p = proposals[projectid];
        require(msg.sender == p.owner, "Only project owner should call this method");
        require(p.trueVotes*100 >= p.voteCount, "Less than 1 percent vote");
        require(p.isWon, "Project grant not reserved");
        uint nextPayment = getProjectNextPayment(projectid);
        withdrawEth(payable(p.owner), nextPayment);
        p.isFunded = true;
        p.balanceOfProject+=nextPayment;
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


    // Project Payment Schedule = [now, tomorrow, 3 days later]
    // Project Payment Amount =   [10 eth, 15 eth, 20 eth]
    function getProjectNextPayment(uint projectid)public view returns(uint next){
        Proposal storage p = proposals[projectid];
        uint current_time_index = 0;
        for(uint i = 0; i < p.payschedule.length; i++){
            if(block.timestamp > p.payschedule[i]){
                current_time_index = i;
            }
        }    
        next = p.paymentamounts[current_time_index]; // Parayı mı dönecek zamanı mı?
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
        amount = p.balanceOfProject;
        //amount = p.geteth
    }

    function getNoOfSurveys() public view returns (uint numsurveys) {
        numsurveys = surveys.length;
    }
}