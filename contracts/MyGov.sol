//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
//import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
//import "@openzeppelin/contracts/token/ERC20/utils/TokenTimelock.sol";
//import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";

contract MyGovToken is ERC20("MyGov Token", "MGT"){
    // Token owner's addresses.
    address tokenOwner;
    address payable tokenOwnerEth;

    // Supply limit variables.
    uint supliedToken = 0;
    uint maxSupply;

    // Map to keep track of faucet usage.
    mapping(address => bool) faucetUsage;

    // Set max token supply and owner address (coinbase).
    constructor(uint tokensupply) {
        maxSupply=tokensupply;
        tokenOwnerEth = payable(address(this));
        tokenOwner = address(this);
        _mint(address(this), tokensupply);
        approve(address(this), tokensupply);
    }

    // Participant's structure.
    struct Voter {
        uint blockedUntil;
        mapping(uint=>address[]) delegates;
        mapping(uint=>bool) alreadyDelegatedHisVote;
    }

    // Project proposal struct.
    struct Proposal {
        string name;
        address owner;
        uint votedeadline;
        uint[] paymentamounts;
        uint[] payschedule;

        // Those values are used in voteForProjectProposal.
        mapping(address => uint8) votes; // 0->not voted, 1->no, 2->yes
        uint voteCount; // All vote count
        uint trueVotes; // Vote count that approved

        // Those values are used in voteForProjectPayment.
        mapping(address => uint8) paymentVotes; // 0->not voted, 1->no, 2->yes
        uint paymentVoteCount; // All vote count
        uint paymentTrueVotes; // Vote count that approved

        bool isWon;
        bool isFunded;
        uint balanceOfProject;
    }

    // Survey struct.
    struct Survey {
        string name;
        address surveyowner;
        uint surveydeadline;
        uint atmostchoice;
        uint numtaken;
        mapping(address => bool) participated;
        bytes32[] options;
        uint[] results;
    }

    // Keep a list of different structures.
    mapping(address => Voter) public voters;
    Proposal[] public proposals;
    Survey[] public surveys;

    // Check for tests and transfer specified amounts (token) of token to destination address (dest).
    function transferToken(address dest, uint token)private{
        // Don't allow token transfer more than sender accounts balance
        require(balanceOf(msg.sender)>=token, "Higher token amount than account have");
        // If account has voted or delegated vote, don't allow zero balance until all voted project's deadline has passed.
        require(voters[msg.sender].blockedUntil <= block.timestamp || balanceOf(msg.sender)-1 >= token, "Vote delegated or used. Cannot reduce account token amount to zero.");
        // Transfer and revert if transfer failed.
        require(transfer(dest, token), "Failed to send token!");
    }

    // Check for tests and transfer specified amounts (eth) of etherem to destination address (dest) in wei.
    function transferEth(address payable dest, uint eth)private{
        // Transfer ethereum to destined address as wei. Revert on failure.
        (bool success, ) = dest.call{value: eth}("");
        require(success, "Failed to send Ether!");
    }
/*
    // Test only function for contract owner to send eth to specific addresses
    function withdrawEth(address payable dest, uint eth) private {
        require(msg.sender == tokenOwnerEth, "Only executable when get eth from the Contract Owner");
        transferEth(dest, eth);
    }
*/
    // Faucet function that creates new tokens on request.
    function faucet()public{
        // Every address can only use the faucet for once.
        require(!faucetUsage[msg.sender], "Faucet already used!");
        // Token creation should stop at specified supply limit.
        require(supliedToken<maxSupply, "Supply limit reached!");
        // Create token and mark tracking variables.
        require(1 <= balanceOf(tokenOwner));

        // Don't allow token transfer more than sender accounts balance
        require(balanceOf(address(this))>=1, "No tokens left on contract");
        // Transfer and revert if transfer failed.
        _transfer(address(this), msg.sender, 1);
        //supliedToken++;
        faucetUsage[msg.sender] = true;
    }

    // This function will transfer voting privilidge to another account with already delegated votes.
    function delegateVoteTo(address memberaddr, uint projectid) public {
        Voter storage sender = voters[msg.sender];
        Voter storage receiver = voters[memberaddr];
        // Check if delegator and target address is a member.
        require(balanceOf(msg.sender)>=1, "Current account must have at least one token to delegate!");
        require(balanceOf(memberaddr)>=1, "Target account must have at least one token to delegate!");
        // Check if delegated vote right hasn't been used.
        require(proposals[projectid].votes[msg.sender]==0, "You already voted for this project!");
        // Delegation for specified project by neither sender nor receiver should have been done before by sender account.
        require(!sender.alreadyDelegatedHisVote[projectid], "You already delegate your vote to someone for this project!");
        require(!receiver.alreadyDelegatedHisVote[projectid], "Target already delegated their vote!");
        // Don't allow self delegation (Doesn't make sense)
        require(memberaddr != msg.sender, "Self delegation not allowed!");

        //Members who voted or delegated vote cannot reduce their MyGov balance to zero until the voting deadlines
        // Set token block for sender account to last delegated or voted project's deadline.
        if(sender.blockedUntil < proposals[projectid].votedeadline){
            sender.blockedUntil = proposals[projectid].votedeadline;
        }
        // Set delegated address's delegates with sender address and their delegates.
        receiver.delegates[projectid].push(msg.sender);
        for(uint i = 0; i < sender.delegates[projectid].length; i++ ){
            receiver.delegates[projectid].push(sender.delegates[projectid][i]);
        }
        // Mark sender and delete their delegates list.
        sender.alreadyDelegatedHisVote[projectid] = true;
        sender.delegates[projectid] = new address[](0);
    }

    // Send ethereum to coinbase account.
    function donateEther() external payable {
        transferEth(tokenOwnerEth, msg.value);
    }

    // Send token to coinbase account.
    function donateMyGovToken(uint amount) public {
        transferToken(tokenOwner, amount);
    }

    // Return token balance of current address.
    function tokenBalance() public view returns(uint balance){
        balance = balanceOf(msg.sender);
    }

    // This function is for voting project proposal. Results should be greater than 1/10.
    function voteForProjectProposal(uint projectid, bool choice) public {
        // Must be a member to vote and should not voted before.
        require(balanceOf(msg.sender)>=1, "Must have at least one token to vote!");
        require(proposals[projectid].votes[msg.sender]==0, "Already voted for project proposal");
        require(proposals[projectid].votedeadline > block.timestamp,"Deadline is exceeded");

        // Members who voted or delegated vote cannot reduce their MyGov balance to zero until the voting deadlines
        Voter storage sender = voters[msg.sender];
        if(sender.blockedUntil < proposals[projectid].votedeadline){
            sender.blockedUntil = proposals[projectid].votedeadline;
        }
        // Mark votes and related variables
        proposals[projectid].voteCount++;
        if(choice){
            proposals[projectid].trueVotes++;
            proposals[projectid].votes[msg.sender]=2;
        }else{
            proposals[projectid].votes[msg.sender]=1;
        }
        // Mark votes and related variables for delegates
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

    // This function is for voting project payment. Results should be greater than 1/100.
    function voteForProjectPayment(uint projectid, bool choice)public{
        // Must be a member to vote and should not voted before.
        require(balanceOf(msg.sender)>=1, "Must have at least one token to vote!");
        require(proposals[projectid].votes[msg.sender]==0, "Already voted for project proposal");

        //Members who voted or delegated vote cannot reduce their MyGov balance to zero until the voting deadlines.
        Voter storage sender = voters[msg.sender];
        if(sender.blockedUntil < proposals[projectid].votedeadline){
            sender.blockedUntil = proposals[projectid].votedeadline;
        }
        // Mark votes and related variables
        proposals[projectid].paymentVoteCount++;
        if(choice){
            proposals[projectid].paymentTrueVotes++;
            proposals[projectid].paymentVotes[msg.sender]=2;
        }else{
            proposals[projectid].paymentVotes[msg.sender]=1;
        }
        // Mark votes and related variables for delegates
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

    // Send project proposal and run required checks.
    function submitProjectProposal(
        string memory ipfshash,
        uint votedeadline,
        uint[] memory paymentamounts,
        uint[] memory payschedule
        ) public returns (uint projectid){
        // Payment amount and payschedule should be equal in size.
        require(paymentamounts.length==payschedule.length, "Payment amount and payment schedule arrays not equal!");
        require(balanceOf(msg.sender) >= 5, "Token balance is not enough");
        require(address(msg.sender).balance >= 100 * 10**15,"ETH balance is not enough");
        // Pay to submit project proposal
        transferToken(tokenOwner, 5);
        transferEth(tokenOwnerEth, 100*10**15);
        // Set and initialize required fields
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

    // Send survey
    function submitSurvey(
        string memory ipfshash,
        uint surveydeadline,
        uint numchoices,
        uint atmostchoice
        ) public returns (uint surveyid){
        require(balanceOf(msg.sender) >= 2, "Token balance is not enough");
        require(address(msg.sender).balance >= 40 * 10**15,"ETH balance is not enough");
        // Pay to submit project proposal
        transferEth(tokenOwnerEth, 40*10**15);
        transferToken(tokenOwner, 2);
        // Set and initialize required fields
        surveyid = surveys.length;
        Survey storage newSurvey = surveys.push();
        newSurvey.name = ipfshash;
        newSurvey.surveyowner = msg.sender;
        newSurvey.surveydeadline = surveydeadline;
        newSurvey.atmostchoice = atmostchoice;
        newSurvey.numtaken = 0;
        newSurvey.options = new bytes32[](numchoices);
        newSurvey.results = new uint[](numchoices);
        // Survey(ipfshash, msg.sender, surveydeadline, atmostchoice, 0, new bytes32[](numchoices), new uint[](numchoices));
    }

    // Participate in survey
    function takeSurvey(uint surveyid, uint[] memory choices)public{
        Survey storage s = surveys[surveyid];
        // Must be a member to participate and should not participated before.
        require(balanceOf(msg.sender)>=1, "Must have at least one token to participate!");
        require(!s.participated[msg.sender], "Already participated!");
        // Check array lengths
        require(s.results.length==choices.length, "Choices length mismatch");
        // Set and update relevant fields
        s.numtaken++;
        s.participated[msg.sender]=true;
        for(uint i = 0; i < choices.length; i++){
            require(choices[i]<=s.atmostchoice, "Choices should not exceed atmostchoice value");
            s.results[i]+=choices[i];
        }
    }

    // Check if coinbase account has enough ethereum for next payment schedule, and enable withdrawal.
    function reserveProjectGrant(uint projectid)public{
        Proposal storage p = proposals[projectid];
        // Only project owner should call this function and project deadline should not be passed.
        require(p.votedeadline <= block.timestamp, "Vote deadline is exceeded!");
        require(msg.sender == p.owner, "Only project owner should call this method");
        
        // Get next payment schedule
        uint current_time_index = 0;
        for(uint i = 0; i < p.payschedule.length; i++){
            if(block.timestamp > p.payschedule[i]){
                current_time_index = i;
            }
        }
        
        // Check if coinbase account has enough balance in ethereum.
        require(address(tokenOwnerEth).balance >= p.paymentamounts[current_time_index], 
            "There is not enough eth in the contract for current payment schedule!");
        
        // If community vote is at least 1/10, enable withdrawal.
        if(p.trueVotes*10 > p.voteCount){
            p.isWon = true;
        }
        else {
            p.isWon = false;
        }
    }

    // Only contract owner can call this function!
    // Send scheduled project payment to the project owner.
    function withdrawProjectPayment(uint projectid)public{
        Proposal storage p = proposals[projectid];
        require(msg.sender == tokenOwner, "Only executable when get eth from the Contract Owner");
        // Withdrawal should be enabled and payment vote should be at leas 1/100.
        require(p.paymentTrueVotes*100 >= p.paymentVoteCount, "Less than 1 percent vote");
        require(p.isWon, "Project grant not reserved");
        // Get next payment value and transfer it to the project owner.
        uint nextPayment = getProjectNextPayment(projectid);
        transferEth(payable(p.owner), nextPayment);
        // Set payment information
        p.isFunded = true;
        p.balanceOfProject+=nextPayment;
    }

    // Return survey results.
    function getSurveyResults(uint surveyid) public view returns(uint numtaken, uint[] memory results){
        Survey storage s = surveys[surveyid];
        numtaken = s.numtaken;
        results = s.results;
    }

    // Return survey information.
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

    // Return survey owner's address.
    function getSurveyOwner(uint surveyid) public view returns(address surveyowner) {
        Survey storage survey = surveys[surveyid];
        surveyowner = survey.surveyowner;
    }

    // Return if project owner has ever withdrawed ethereum.
    function getIsProjectFunded(uint projectid)public view returns(bool funded){
        Proposal storage project = proposals[projectid];
        funded = project.isFunded;
    }


    // Get next project payment amount.
    function getProjectNextPayment(uint projectid)public view returns(uint next){
        Proposal storage p = proposals[projectid];
        uint current_time_index = 0;
        // Get next scheduled project payment timing.
        for(uint i = 0; i < p.payschedule.length; i++){
            if(block.timestamp > p.payschedule[i]){
                current_time_index = i;
            }
        }
        // Return project payment amount from the timing obtained before.
        next = p.paymentamounts[current_time_index];
    }

    // Return project owner's address.
    function getProjectOwner(uint projectid)public view returns(address projectowner){
        Proposal storage p = proposals[projectid];
        projectowner = p.owner;
    }

    // Return project information.
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

    // Return the total number of project proposals that have ever submitted.
    function getNoOfProjectProposals() public view returns (uint numofproposals){
        numofproposals = proposals.length;
    }

    // Return the total number of project proposals that their owners have ever withdrawed funding.
    function getNoOfFundedProjects() public view returns (uint numfunded){
        uint total_funded = 0;
        for(uint i = 0; i < proposals.length; i++){
            if(proposals[i].isFunded)
                total_funded++;
        }
        numfunded = total_funded;
    }

    // Return total amount of ethereums that withdrawed by project owner.
    function getEtherReceivedByProject(uint projectid) public view returns(uint amount){
        Proposal storage p = proposals[projectid];
        amount = p.balanceOfProject;
        //amount = p.geteth
    }

    // Get the total number of surveys that ever have been submitted.
    function getNoOfSurveys() public view returns (uint numsurveys) {
        numsurveys = surveys.length;
    }
}