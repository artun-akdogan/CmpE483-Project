//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

//import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
//import "@openzeppelin/contracts/token/ERC20/utils/TokenTimelock.sol";
//import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";

contract MyGovToken is ERC20("MyGov Token", "MGT") {
    // Supply limit variables.
    uint256 reservedEth = 0;
    mapping(address => uint256) balances;

    // Map to keep track of faucet usage.
    mapping(address => bool) faucetUsage;

    // Set max token supply and owner address (coinbase).
    constructor(uint256 tokensupply) {
        _mint(address(this), tokensupply);
        approve(address(this), tokensupply);
    }

    // Participant's structure.
    struct Voter {
        uint256 blockedUntil;
        mapping(uint256 => address[]) delegates;
        mapping(uint256 => bool) alreadyDelegatedHisVote;
    }

    // Project proposal struct.
    struct Proposal {
        string name;
        address owner;
        uint256 votedeadline;
        uint256[] paymentamounts;
        uint256[] payschedule;
        mapping(uint256 => bool) paid; // Check if proposal schedule paid before.
        // Those values are used in voteForProjectProposal.
        mapping(address => uint8) votes; // 0->not voted, 1->no, 2->yes
        uint256 voteCount; // All vote count
        uint256 trueVotes; // Vote count that approved
        // Those values are used in voteForProjectPayment.
        mapping(address => uint8) paymentVotes; // 0->not voted, 1->no, 2->yes
        uint256 paymentVoteCount; // All vote count
        uint256 paymentTrueVotes; // Vote count that approved
        bool isWon;
        bool isFunded;
        uint256 balanceOfProject;
    }

    // Survey struct.
    struct Survey {
        string name;
        address surveyowner;
        uint256 surveydeadline;
        uint256 atmostchoice;
        uint256 numtaken;
        mapping(address => bool) participated;
        bytes32[] options;
        uint256[] results;
    }

    // Keep a list of different structures.
    mapping(address => Voter) public voters;
    Proposal[] public proposals;
    Survey[] public surveys;

    // Check for tests and transfer specified amounts (token) of token to destination address (dest).
    function transferToken(address dest, uint256 token) public {
        // Don't allow token transfer more than sender accounts balance
        require(balanceOf(msg.sender) >= token, "High token amount");
        // If account has voted or delegated vote, don't allow zero balance until all voted project's deadline has passed.
        require(
            voters[msg.sender].blockedUntil <= block.timestamp ||
                balanceOf(msg.sender) - 1 >= token,
            "Vote delegated or used"
        );
        // Transfer and revert if transfer failed.
        require(transfer(dest, token), "Failed send token!");
    }

    // Unused
    /*
    // Check for tests and transfer specified amounts (eth) of etherem to destination address (dest) in wei.
    function transferEth(address payable dest, uint eth) public payable {
        // Transfer ethereum to destined address as wei. Revert on failure.
        (bool success, ) = dest.call{value: eth}("");
        require(success, "Failed to send Ether!");
    }
    */
    function transferEthTokenContract(uint256 token, uint256 eth)
        public
        payable
    {
        // Check if user sent relevant Eth amount to the contract
        require(msg.value == eth, "Send required ethereum");
        // Transfer and revert if transfer failed.
        transferToken(address(this), token);
    }

    /*
    // Test only function for contract owner to send eth to specific addresses
    function withdrawEth(address payable dest, uint eth) private {
        require(msg.sender == tokenOwnerEth, "Only executable when get eth from the Contract Owner");
        transferEth(dest, eth);
    }
*/
    // Faucet function that creates new tokens on request.
    function faucet() public {
        // Every address can only use the faucet for once.
        require(!faucetUsage[msg.sender], "Faucet already used!");
        // Don't allow token transfer more than sender accounts balance
        require(balanceOf(address(this)) >= 1, "No tokens left on contract");
        // Transfer and revert if transfer failed.
        _transfer(address(this), msg.sender, 10);
        //supliedToken++;
        faucetUsage[msg.sender] = true;
    }

    // This function will transfer voting privilidge to another account with already delegated votes.
    function delegateVoteTo(address memberaddr, uint256 projectid) public {
        Voter storage sender = voters[msg.sender];
        Voter storage receiver = voters[memberaddr];
        // Check if delegator and target address is a member.
        require(balanceOf(msg.sender) >= 1, "Must have at least one token");
        require(balanceOf(memberaddr) >= 1, "Must have at least one token");
        // Check if delegated vote right hasn't been used.
        require(proposals[projectid].votes[msg.sender] == 0, "Already voted!");
        // Delegation for specified project by neither sender nor receiver should have been done before by sender account.
        require(
            !sender.alreadyDelegatedHisVote[projectid],
            "Already delegate your vote"
        );
        require(
            !receiver.alreadyDelegatedHisVote[projectid],
            "Target already delegated their vote!"
        );
        // Don't allow self delegation (Doesn't make sense)
        require(memberaddr != msg.sender, "Self delegation not allowed!");

        //Members who voted or delegated vote cannot reduce their MyGov balance to zero until the voting deadlines
        // Set token block for sender account to last delegated or voted project's deadline.
        if (sender.blockedUntil < proposals[projectid].votedeadline) {
            sender.blockedUntil = proposals[projectid].votedeadline;
        }
        // Set delegated address's delegates with sender address and their delegates.
        receiver.delegates[projectid].push(msg.sender);
        for (uint256 i = 0; i < sender.delegates[projectid].length; i++) {
            receiver.delegates[projectid].push(sender.delegates[projectid][i]);
        }
        // Mark sender and delete their delegates list.
        sender.alreadyDelegatedHisVote[projectid] = true;
        sender.delegates[projectid] = new address[](0);
    }

    // Send ethereum to coinbase account.
    function donateEther() external payable {}

    // Send token to coinbase account.
    function donateMyGovToken(uint256 amount) public {
        transferToken(address(this), amount);
    }

    // Return token balance of current address.
    function tokenBalance() public view returns (uint256 balance) {
        balance = balanceOf(msg.sender);
    }

    // This function is for voting project proposal. Results should be greater than 1/10.
    function voteForProjectProposal(uint256 projectid, bool choice) public {
        // Must be a member to vote and should not voted before.
        require(
            balanceOf(msg.sender) >= 1,
            "Must have at least one token to vote!"
        );
        require(
            proposals[projectid].votes[msg.sender] == 0,
            "Already voted for project proposal"
        );
        require(
            proposals[projectid].votedeadline > block.timestamp,
            "Deadline is exceeded"
        );

        // Members who voted or delegated vote cannot reduce their MyGov balance to zero until the voting deadlines
        Voter storage sender = voters[msg.sender];
        if (sender.blockedUntil < proposals[projectid].votedeadline) {
            sender.blockedUntil = proposals[projectid].votedeadline;
        }
        // Mark votes and related variables
        proposals[projectid].voteCount++;
        if (choice) {
            proposals[projectid].trueVotes++;
            proposals[projectid].votes[msg.sender] = 2;
        } else {
            proposals[projectid].votes[msg.sender] = 1;
        }
        // Mark votes and related variables for delegates
        for (uint256 i = 0; i < sender.delegates[projectid].length; i++) {
            proposals[projectid].voteCount++;
            if (choice) {
                proposals[projectid].trueVotes++;
                proposals[projectid].votes[sender.delegates[projectid][i]] = 2;
            } else {
                proposals[projectid].votes[sender.delegates[projectid][i]] = 1;
            }
        }
    }

    // This function is for voting project payment. Results should be greater than 1/100.
    function voteForProjectPayment(uint256 projectid, bool choice) public {
        // Must be a member to vote and should not voted before.
        require(balanceOf(msg.sender) >= 1, "Must have at least one token");
        require(proposals[projectid].votes[msg.sender] == 0, "Already voted");

        //Members who voted or delegated vote cannot reduce their MyGov balance to zero until the voting deadlines.
        Voter storage sender = voters[msg.sender];
        if (sender.blockedUntil < proposals[projectid].votedeadline) {
            sender.blockedUntil = proposals[projectid].votedeadline;
        }
        // Mark votes and related variables
        proposals[projectid].paymentVoteCount++;
        if (choice) {
            proposals[projectid].paymentTrueVotes++;
            proposals[projectid].paymentVotes[msg.sender] = 2;
        } else {
            proposals[projectid].paymentVotes[msg.sender] = 1;
        }
        // Mark votes and related variables for delegates
        for (uint256 i = 0; i < sender.delegates[projectid].length; i++) {
            proposals[projectid].paymentVoteCount++;
            if (choice) {
                proposals[projectid].paymentTrueVotes++;
                proposals[projectid].paymentVotes[
                    sender.delegates[projectid][i]
                ] = 2;
            } else {
                proposals[projectid].paymentVotes[
                    sender.delegates[projectid][i]
                ] = 1;
            }
        }
    }

    // Send project proposal and run required checks.
    function submitProjectProposal(
        string memory ipfshash,
        uint256 votedeadline,
        uint256[] memory paymentamounts,
        uint256[] memory payschedule
    ) public payable returns (uint256 projectid) {
        // Payment amount and payschedule should be equal in size.
        require(
            paymentamounts.length == payschedule.length,
            "Payment amount and schedule not equal"
        );
        require(balanceOf(msg.sender) >= 5, "Token balance not enough");
        require(
            address(msg.sender).balance >= 100 * 10**15,
            "ETH balance not enough"
        );
        // Pay to submit project proposal
        transferEthTokenContract(5, 100 * 10**15);
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
        uint256 surveydeadline,
        uint256 numchoices,
        uint256 atmostchoice
    ) public payable returns (uint256 surveyid) {
        require(balanceOf(msg.sender) >= 2, "Token balance not enough");
        require(
            address(msg.sender).balance >= 40 * 10**15,
            "ETH balance not enough"
        );
        // Pay to submit project proposal
        transferEthTokenContract(2, 40 * 10**15);
        // Set and initialize required fields
        surveyid = surveys.length;
        Survey storage newSurvey = surveys.push();
        newSurvey.name = ipfshash;
        newSurvey.surveyowner = msg.sender;
        newSurvey.surveydeadline = surveydeadline;
        newSurvey.atmostchoice = atmostchoice;
        newSurvey.numtaken = 0;
        newSurvey.options = new bytes32[](numchoices);
        newSurvey.results = new uint256[](numchoices);
        // Survey(ipfshash, msg.sender, surveydeadline, atmostchoice, 0, new bytes32[](numchoices), new uint[](numchoices));
    }

    // Participate in survey
    function takeSurvey(uint256 surveyid, uint256[] memory choices) public {
        Survey storage s = surveys[surveyid];
        // Must be a member to participate and should not participated before.
        require(balanceOf(msg.sender) >= 1, "Must have at least one token");
        require(!s.participated[msg.sender], "Already participated!");
        // Check array lengths
        require(s.results.length == choices.length, "Choices length mismatch");
        // Set and update relevant fields
        s.numtaken++;
        s.participated[msg.sender] = true;
        for (uint256 i = 0; i < choices.length; i++) {
            require(
                choices[i] <= s.atmostchoice,
                "Choices should not exceed atmostchoice value"
            );
            s.results[i] += choices[i];
        }
    }

    // Only project owner can call this function!
    // Check if coinbase account has enough ethereum for next payment schedule, and enable withdrawal.
    function reserveProjectGrant(uint256 projectid) public {
        Proposal storage p = proposals[projectid];
        // Only project owner should call this function and project deadline should not be passed.
        require(p.votedeadline <= block.timestamp, "Vote deadline exceeded!");
        require(msg.sender == p.owner, "Only project owner should call");

        // Get next payment schedule
        uint256 current_time_index = getProjectNextSchedule(p);

        // Check if coinbase account has enough balance in ethereum.
        require(
            address(this).balance - reservedEth >=
                p.paymentamounts[current_time_index],
            "There is not enough eth in the contract for current payment schedule!"
        );

        require(
            !p.paid[current_time_index],
            "Scheduled fund already reserved!"
        );

        if (p.isWon) {
            require(
                p.paymentTrueVotes * 100 >= p.paymentVoteCount,
                "Less than 1 percent vote"
            );
        } else {
            require(
                p.paymentTrueVotes * 10 >= p.paymentVoteCount,
                "Less than 10 percent vote"
            );
        }
        balances[p.owner] += p.paymentamounts[current_time_index];
        reservedEth += p.paymentamounts[current_time_index];
        p.paid[current_time_index] = true;
    }

    // Only project owner can call this function!
    // Send scheduled project payment to the project owner.
    function withdrawProjectPayment(uint256 projectid) public {
        Proposal storage p = proposals[projectid];
        require(
            msg.sender == p.owner,
            "Only project owner should call this method"
        );
        require(p.isWon, "Project grant not reserved");
        require(balances[p.owner] > 0, "No balance at contract");
        // Pay reserved value
        payable(msg.sender).transfer(balances[p.owner]);
        // Set payment information
        reservedEth -= balances[p.owner];
        p.balanceOfProject += balances[p.owner];
        balances[p.owner] = 0;
        p.isFunded = true;
    }

    // Return survey results.
    function getSurveyResults(uint256 surveyid)
        public
        view
        returns (uint256 numtaken, uint256[] memory results)
    {
        Survey storage s = surveys[surveyid];
        numtaken = s.numtaken;
        results = s.results;
    }

    // Return survey information.
    function getSurveyInfo(uint256 surveyid)
        public
        view
        returns (
            string memory ipfshash,
            uint256 surveydeadline,
            uint256 numchoices,
            uint256 atmostchoice
        )
    {
        Survey storage s = surveys[surveyid];
        ipfshash = s.name;
        surveydeadline = s.surveydeadline;
        numchoices = s.options.length;
        atmostchoice = s.atmostchoice;
    }

    // Return survey owner's address.
    function getSurveyOwner(uint256 surveyid)
        public
        view
        returns (address surveyowner)
    {
        Survey storage survey = surveys[surveyid];
        surveyowner = survey.surveyowner;
    }

    // Return if project owner has ever withdrawed ethereum.
    function getIsProjectFunded(uint256 projectid)
        public
        view
        returns (bool funded)
    {
        Proposal storage project = proposals[projectid];
        funded = project.isFunded;
    }

    // Get next project payment schedule.
    function getProjectNextSchedule(Proposal storage p)
        private
        view
        returns (uint256 current_time_index)
    {
        current_time_index = 0;
        // Get next scheduled project payment timing.
        for (uint256 i = 0; i < p.payschedule.length; i++) {
            if (block.timestamp > p.payschedule[i]) {
                current_time_index = i;
            }
        }
    }

    // Get next project payment amount.
    function getProjectNextPayment(uint256 projectid)
        public
        view
        returns (uint256 next)
    {
        // Return project payment amount from the timing obtained before.
        Proposal storage p = proposals[projectid];
        next = p.paymentamounts[getProjectNextSchedule(p)];
    }

    // Return project owner's address.
    function getProjectOwner(uint256 projectid)
        public
        view
        returns (address projectowner)
    {
        Proposal storage p = proposals[projectid];
        projectowner = p.owner;
    }

    // Return project information.
    function getProjectInfo(uint256 activityid)
        public
        view
        returns (
            string memory ipfshash,
            uint256 votedeadline,
            uint256[] memory paymentamounts,
            uint256[] memory payschedule
        )
    {
        ipfshash = proposals[activityid].name;
        votedeadline = proposals[activityid].votedeadline;
        paymentamounts = proposals[activityid].paymentamounts;
        payschedule = proposals[activityid].payschedule;
    }

    // Return the total number of project proposals that have ever submitted.
    function getNoOfProjectProposals()
        public
        view
        returns (uint256 numofproposals)
    {
        numofproposals = proposals.length;
    }

    // Return the total number of project proposals that their owners have ever withdrawed funding.
    function getNoOfFundedProjects() public view returns (uint256 numfunded) {
        uint256 total_funded = 0;
        for (uint256 i = 0; i < proposals.length; i++) {
            if (proposals[i].isFunded) total_funded++;
        }
        numfunded = total_funded;
    }

    // Return total amount of ethereums that withdrawed by project owner.
    function getEtherReceivedByProject(uint256 projectid)
        public
        view
        returns (uint256 amount)
    {
        Proposal storage p = proposals[projectid];
        amount = p.balanceOfProject;
        //amount = p.geteth
    }

    // Get the total number of surveys that ever have been submitted.
    function getNoOfSurveys() public view returns (uint256 numsurveys) {
        numsurveys = surveys.length;
    }
}
