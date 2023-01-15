import Head from 'next/head'
import React,{ useState, useEffect } from 'react'
import { Row, notification } from 'antd'
import Web3 from 'web3'
import {mygovContractOwner, mygovContractDeploy, myGovOwnerAddress} from '../blockchain/mygov'
import {FeatureCard, InputNum, InputStr, RadioBoolean, DateInput, DynamicForm2, DynamicForm1} from './components'


declare var window: any

export default function myGov() {
    // eslint-disable-next-line react-hooks/rules-of-hooks

    const [web3, setWeb3] = useState<Web3|null>(null)
    const [address, setAddress] = useState<string|null>(null)
    const [mygovContract, setMyGovContract] = useState<any>(null)

    const connectWalletHandler = async () => {
      if(typeof window !== "undefined" && typeof window.ethereum !== "undefined"){
        try{
            await window.ethereum.request({ method: "eth_requestAccounts" })
            const tempWeb3 = new Web3(window.ethereum)
            setWeb3(tempWeb3)
            const accounts = await tempWeb3.eth.getAccounts()
            setAddress(accounts[0])
            const mygov = mygovContractDeploy(tempWeb3)
            setMyGovContract(mygov)
            
            notification['info']({message: "Account connected successfully"})
        } catch(err: any){
            notification['error']({message: `Error while wallet connection: ${err.message}`})
        }
      } else{
        notification['error']({message: `Please install Metamask`})
      }
    }

    
    const [destAddress, setDestAddress] = useState("");
    const [tokenAmount, setTokenAmount] = useState<number|null>(null);
    const transferTokenHandler = async () => {
        if(address === null){
            notification['error']({message: `Please connect your wallet first`})
            return;
        }
        if(etherValue === null){
            notification['error']({message: `Please enter a valid number`})
            return;
        }
        try{
            await mygovContract!.methods.transferToken(destAddress, tokenAmount).send({from: address })
            notification['info']({message: "Success"})
        } catch(err: any){
            notification['error']({message: `Error while operation ${err.message}`})
        }
    }

    const [etherValue, setEtherValue] = useState<number|null>(null);
    const donateEtherHandler = async () => {
        if(address === null){
            notification['error']({message: `Please connect your wallet first`})
            return;
        }
        if(etherValue === null){
            notification['error']({message: `Please enter a valid number`})
            return;
        }
        try{
            await mygovContract!.methods.donateEther().send({from: address, value: web3!.utils.toWei(etherValue!.toString(), "ether")})
            notification['info']({message: "Success"})
        } catch(err: any){
            notification['error']({message: `Error while operation ${err.message}`})
        }
    }

    const [myGovTokenValue, setMyGovTokenValue] = useState<number|null>(null);
    const donateMyGovTokenHandler = async () => {
        if(web3 === null){
            notification['error']({message: `Please connect your wallet first`})
            return;
        }
        if(myGovTokenValue === null){
            notification['error']({message: `Please enter a valid number`})
            return;
        }
        try{
            await mygovContract.methods.donateMyGovToken(myGovTokenValue).send({from: address})
            notification['info']({message: "Success"})
        } catch(err: any){
            notification['error']({message: `Error while operation ${err.message}`})
        }
    }

    const faucetHandler = async () => {
        if(web3 === null){
            notification['error']({message: `Please connect your wallet first`})
            return;
        }
        try{
            await mygovContract.methods.faucet().send({ from: address })
            notification['info']({message: "Success"})
        } catch(err: any){
            notification['error']({message: `Error while operation ${err.message}`})
        }
    }

    const [memAddrDelValue, setMemAddrDelValue] = useState("");
    const [projectIdDelValue, setProjectIdDelValue] = useState<number|null>(null);
    const delegateVoteHandler = async () => {
        if(address === null){
            notification['error']({message: `Please connect your wallet first`})
            return;
        }
        if(projectIdDelValue === null){
            notification['error']({message: `Please enter a valid number`})
            return;
        }
        try{
            await mygovContract.methods.delegateVoteTo(memAddrDelValue, projectIdDelValue).send({from: address})
            notification['info']({message: "Success"})
        } catch(err: any){
            notification['error']({message: `Error while operation ${err.message}`})
        }
    }

    const [projectIdPropValue, setProjectIdPropValue] = useState<number|null>(null);
    const [choicePropValue, setChoicePropValue] = useState<boolean>(false);
    const voteForProjectProposalHandler = async () => {
        if(address === null){
            notification['error']({message: `Please connect your wallet first`})
            return;
        }
        if(projectIdPropValue === null){
            notification['error']({message: `Please enter a valid number`})
            return;
        }
        try{
            await mygovContract.methods.voteForProjectProposal(projectIdPropValue, choicePropValue).send({from: address})
            notification['info']({message: "Success"})
        } catch(err: any){
            notification['error']({message: `Error while operation ${err.message}`})
        }
    }

    const [projectIdPayValue, setProjectIdPayValue] = useState<number|null>(null);
    const [choicePayValue, setChoicePayValue] = useState<boolean>(false);
    const voteForProjectPaymentHandler = async () => {
        if(address === null){
            notification['error']({message: `Please connect your wallet first`})
            return;
        }
        if(projectIdPayValue === null){
            notification['error']({message: `Please enter a valid number`})
            return;
        }
        try{
            await mygovContract.methods.voteForProjectPayment(projectIdPayValue, choicePayValue).send({from: address})
            notification['info']({message: "Success"})
        } catch(err: any){
            notification['error']({message: `Error while operation ${err.message}`})
        }
    }

    const [projectIpfshash, setProjectIpfshash] = useState("");
    const [voteDeadline, setVoteDeadline] = useState(new Date());
    const [projectSubmitPair, setProjectSubmitPair] = useState<any>([])
    const submitProjectProposalHandler = async () => {
        if(address === null){
            notification['error']({message: `Please connect your wallet first`})
            return;
        }
        const arrAmount = projectSubmitPair.map((d:any) => web3!.utils.toWei(d["amount"].toString(), "ether"));
        const arrSchedule = projectSubmitPair.map((d:any) => d["schedule"].getTime());
        try{
            const projectId : number = await mygovContract.methods.submitProjectProposal(projectIpfshash, voteDeadline.getTime(), 
                                            arrAmount, arrSchedule).send({from: address, value: web3!.utils.toWei("0.1", "ether")})
            notification['info']({message: `Success with Project Id: ${projectId}`})
        } catch(err: any){
            notification['error']({message: `Error while operation ${err.message}`})
        }
    }

    const [surveyIpfshash, setSurveyIpfshash] = useState("");
    const [surveyDeadline, setSurveyDeadline] = useState(new Date());
    const [surveyNumChoices, setSurveyNumChoices] = useState<number|null>(null);
    const [surveyAtMostChoice, setSurveyAtMostChoice] = useState<number|null>(null);
    const submitSurveyHandler = async () => {
        if(address === null){
            notification['error']({message: `Please connect your wallet first`})
            return;
        }
        if(surveyNumChoices === null || surveyNumChoices === null){
            notification['error']({message: `Please enter a valid number`})
            return;
        }
        try{
            const surveyId: number = await mygovContract.methods.submitSurvey(surveyIpfshash, surveyDeadline.getTime(), 
                                            surveyNumChoices, surveyAtMostChoice).send({from: address, value: web3!.utils.toWei("0.04", "ether")})
            notification['info']({message: `Success with Survey Id: ${surveyId}`})
        } catch(err: any){
            notification['error']({message: `Error while operation ${err.message}`})
        }
    }

    const [surveyId, setSurveyId] = useState<number|null>(null);
    const [surveyChoices, setSurveyChoices] = useState([])
    const takeSurveyHandler = async () => {
        if(address === null){
            notification['error']({message: `Please connect your wallet first`})
            return;
        }
        if(surveyId === null){
            notification['error']({message: `Please enter a valid number`})
            return;
        }
        const surveyArr = surveyChoices.map(d => d["choices"]);
        try{
            await mygovContract.methods.takeSurvey(surveyId, surveyArr).send({from: address})
            notification['info']({message: "Success"})
        } catch(err: any){
            notification['error']({message: `Error while operation ${err.message}`})
        }
    }

    const [projGrantId, setProjGrantId] = useState<number|null>(null);
    const reserveProjectGrantHandler = async () => {
        if(address === null){
            notification['error']({message: `Please connect your wallet first`})
            return;
        }
        if(projGrantId === null){
            notification['error']({message: `Please enter a valid number`})
            return;
        }
        try{
            await mygovContract.methods.reserveProjectGrant(projGrantId).send({from: address})
            notification['info']({message: "Success"})
        } catch(err: any){
            notification['error']({message: `Error while operation ${err.message}`})
        }
    }

    const [withdrawId, setWithdrawId] = useState<number|null>(null);
    const withdrawProjectPaymentHandler = async () => {
        if(address === null){
            notification['error']({message: `Please connect your wallet first`})
            return;
        }
        if(withdrawId === null){
            notification['error']({message: `Please enter a valid number`})
            return;
        }
        try{
            const result = await mygovContract.methods.withdrawProjectPayment(withdrawId).send({from: address})
            notification['info']({message: "Success"})
        } catch(err: any){
            notification['error']({message: `Error while operation ${err.message}`})
        }
    }

    const [surveyResultsId, setSurveyResultsId] = useState<number|null>(null);
    const getSurveyResultsHandler = async () => {
        try{
            let result = await mygovContractOwner.methods.getSurveyResults(surveyResultsId).call()
            notification['info']({message: `NumTaken: ${result["numtaken"]}\nResults: ${JSON.stringify(result["results"])}`})
        } catch(err: any){
            notification['error']({message: `Error while operation ${err.message}`})
        }
    }
    
    const [surveyInfoId, setSurveyInfoId] = useState<number|null>(null);
    const getSurveyInfoHandler = async () => {
        try{
            let result = await mygovContractOwner.methods.getSurveyInfo(surveyInfoId).call()
            notification['info']({message: `Ipfshash: ${result["ipfshash"]}\nSurvey Deadline: ${result["surveydeadline"]}\nNumChoices: ${result["numchoices"]}\nAt Most Choice: ${result["atmostchoices"]}`})
        } catch(err: any){
            notification['error']({message: `Error while operation ${err.message}`})
        }
    }

    const [surveyOwnerId, setSurveyOwnerId] = useState<number|null>(null);
    const getSurveyOwnerHandler = async () => {
        try{
            let surverOwner = await mygovContractOwner.methods.getSurveyOwner(surveyOwnerId).call()
            notification['info']({message: surverOwner.toString()})
        } catch(err: any){
            notification['error']({message: `Error while operation ${err.message}`})
        }
    }

    const [isProjectFundedId, setIsProjectFundedId] = useState<number|null>(null);
    const getIsProjectFundedHandler = async () => {
        try{
            let isFunded: boolean = await mygovContractOwner.methods.getIsProjectFunded(isProjectFundedId).call()
            notification['info']({message: isFunded.toString()})
        } catch(err: any){
            notification['error']({message: `Error while operation ${err.message}`})
        }
    }

    const [projectNextPaymentId, setProjectNextPaymentId] = useState<number|null>(null);
    const getProjectNextPaymentHandler = async () => {
        try{
            let result = await mygovContractOwner.methods.getProjectNextPayment(projectNextPaymentId).call()
            notification['info']({message: result.toString()})
        } catch(err: any){
            notification['error']({message: `Error while operation ${err.message}`})
        }
    }

    const [projectOwnerId, setProjectOwnerId] = useState<number|null>(null);
    const getProjectOwnerHandler = async () => {
        try{
            let result = await mygovContractOwner.methods.getProjectOwner(projectOwnerId).call()
            notification['info']({message: result.toString()})
        } catch(err: any){
            notification['error']({message: `Error while operation ${err.message}`})
        }
    }

    const [projectInfoId, setProjectInfoId] = useState<number|null>(null);
    const getProjectInfoHandler = async () => {
        try{
            let result = await mygovContractOwner.methods.getProjectInfo(projectInfoId).call()
            notification['info']({message: result.toString()})
        } catch(err: any){
            notification['error']({message: `Error while operation ${err.message}`})
        }
    }

    const getNoOfProjectProposalsHandler = async () => {
        try{
            let result = await mygovContractOwner.methods.getNoOfProjectProposals().call()
            notification['info']({message: result.toString()})
        } catch(err: any){
            notification['error']({message: `Error while operation ${err.message}`})
        }
    }

    const getNoOfFundedProjectsHandler = async () => {
        try{
            let result = await mygovContractOwner.methods.getNoOfFundedProjects().call()
            notification['info']({message: result.toString()})
        } catch(err: any){
            notification['error']({message: `Error while operation ${err.message}`})
        }
    }

    const [etherReceivedByProjectId, setEtherReceivedByProjectId] = useState<number|null>(null);
    const getEtherReceivedByProjectHandler = async () => {
        try{
            let result = await mygovContractOwner.methods.getEtherReceivedByProject(etherReceivedByProjectId).call()
            notification['info']({message: result.toString()})
        } catch(err: any){
            notification['error']({message: `Error while operation ${err.message}`})
        }
    }

    const getNoOfSurveysHandler = async () => {
        try{
            let result = await mygovContractOwner.methods.getNoOfSurveys().call()
            notification['info']({message: result.toString()})
        } catch(err: any){
            notification['error']({message: `Error while operation ${err.message}`})
        }
    }

    return(
        <div>
            <Head>
                <title>Governance App</title>
                <meta name="description" content="Governance App" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
            </Head>
            <nav className="navbar navbar-expand-lg navbar-light bg-light" >
                <a className="navbar-brand" href="#">My Gov App</a>
                <div className="navbar-nav" id="navbarNav" >
                    <ul className="navbar-nav">
                        <li className="nav-item">
                            <a className="nav-link" href="#">Home</a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link" href="#">Features</a>
                        </li>
                        <li className="nav-item">
                            <button onClick={connectWalletHandler} className="btn btn-outline-success my-2 my-sm-0" type="submit">Connect Wallet</button>
                        </li>
                    </ul>
                </div>
            </nav>
            
            <div className="card-container" style={{ padding: "25px", backgroundColor: '#F6F6F6'}}>
                <Row style={{marginTop: 50}}>
                    <FeatureCard title="Transfer Token to Another User" buttonTitle="Transfer" buttonFunction={transferTokenHandler}>
                        <InputStr function={setDestAddress} title='Enter Destination Address' />
                        <InputNum function={setTokenAmount} title='Enter Token Amount' />
                    </FeatureCard>
                    <FeatureCard title="Donate Ethereum To MyGov" buttonTitle="Donate Ethereum" buttonFunction={donateEtherHandler}>
                        <InputNum function={setEtherValue} title='Enter Ether Amount' />
                    </FeatureCard>
                    <FeatureCard title="Donate Token to MyGov" buttonTitle="Donate MyGov Token" buttonFunction={donateMyGovTokenHandler}>
                        <InputNum function={setMyGovTokenValue} title='Enter MyGov Amount' />
                    </FeatureCard>
                    <FeatureCard title="Faucet" buttonTitle="Get MyGov Token" buttonFunction={faucetHandler}>
                        <text><b>Note: </b>You can not take more than one token</text>
                    </FeatureCard>
                    <FeatureCard title="Delegate My Vote" buttonTitle="Delegate" buttonFunction={delegateVoteHandler}>
                        <text><b>Note: </b>You can only delegate once, this action cannot be undone</text>
                        <InputStr function={setMemAddrDelValue} title='Enter Target Address' />
                        <InputNum function={setProjectIdDelValue} title='Enter Project ID' />
                    </FeatureCard>
                    <FeatureCard title="Vote For Project Proposal" buttonTitle="Vote" buttonFunction={voteForProjectProposalHandler}>
                        <InputNum function={setProjectIdPropValue} title='Enter Project ID' />
                        <RadioBoolean value={choicePropValue} function={setChoicePropValue} label="Vote"/>
                    </FeatureCard>
                    <FeatureCard title="Vote For Project Payment" buttonTitle="Vote" buttonFunction={voteForProjectPaymentHandler}>
                        <InputNum function={setProjectIdPayValue} title='Enter Project ID' />
                        <RadioBoolean value={choicePayValue} function={setChoicePayValue} label="Vote"/>
                    </FeatureCard>
                    <FeatureCard title="Submit Project Proposal" buttonTitle="Submit" buttonFunction={submitProjectProposalHandler}>
                        <InputStr function={setProjectIpfshash} title='Enter Ipfshash' />
                        <DateInput function={setVoteDeadline} title="Deadline" value={voteDeadline} width="%100" placeholder={false}/>
                        <DynamicForm2 formFields={projectSubmitPair} setFormFields={setProjectSubmitPair} />
                    </FeatureCard>
                    <FeatureCard title="Submit Survey" buttonTitle="Submit" buttonFunction={submitSurveyHandler}>
                        <InputStr function={setSurveyIpfshash} title='Enter Ipfshash' />
                        <DateInput function={setSurveyDeadline} title="Deadline" value={voteDeadline} width="%100" placeholder={false}/>
                        <InputNum function={setSurveyNumChoices} title="Enter Survey's Number of Choices" />
                        <InputNum function={setSurveyAtMostChoice} title="Enter Survey's At Most Choice" />
                    </FeatureCard>
                    <FeatureCard title="Take Survey" buttonTitle="Submit" buttonFunction={takeSurveyHandler}>
                        <InputNum function={setSurveyId} title="Enter Survey's Id" />
                        <DynamicForm1 formFields={surveyChoices} setFormFields={setSurveyChoices} />
                    </FeatureCard>
                    <FeatureCard title="Reserve Project Grant" buttonTitle="Submit" buttonFunction={reserveProjectGrantHandler}>
                        <InputNum function={setProjGrantId} title="Enter Project Id" />
                    </FeatureCard>
                    <FeatureCard title="WithdrawProjectPayment" buttonTitle="Submit" buttonFunction={withdrawProjectPaymentHandler}>
                        <InputNum function={setWithdrawId} title="Enter Project Id" />
                    </FeatureCard>
                    <FeatureCard title="Get Survey Results" buttonTitle="Get" buttonFunction={getSurveyResultsHandler}>
                        <InputNum function={setSurveyResultsId} title="Enter Survey Id" />
                    </FeatureCard>
                    <FeatureCard title="Get Survey Info" buttonTitle="Get" buttonFunction={getSurveyInfoHandler}>
                        <InputNum function={setSurveyInfoId} title="Enter Survey Id" />
                    </FeatureCard>
                    <FeatureCard title="Get Survey Owner" buttonTitle="Get" buttonFunction={getSurveyOwnerHandler}>
                        <InputNum function={setSurveyOwnerId} title="Enter Survey Id" />
                    </FeatureCard>
                    <FeatureCard title="Get If Project Is Funded" buttonTitle="Get" buttonFunction={getIsProjectFundedHandler}>
                        <InputNum function={setIsProjectFundedId} title="Enter Project Id" />
                    </FeatureCard>
                    <FeatureCard title="Get Project Next Payment" buttonTitle="Get" buttonFunction={getProjectNextPaymentHandler}>
                        <InputNum function={setProjectNextPaymentId} title="Enter Project Id" />
                    </FeatureCard>
                    <FeatureCard title="Get Project Owner" buttonTitle="Get" buttonFunction={getProjectOwnerHandler}>
                        <InputNum function={setProjectOwnerId} title="Enter Project Id" />
                    </FeatureCard>
                    <FeatureCard title="Get Project Info" buttonTitle="Get" buttonFunction={getProjectInfoHandler}>
                        <InputNum function={setProjectInfoId} title="Enter Project Id" />
                    </FeatureCard>
                    <FeatureCard title="Get No Of Project Proposals" buttonTitle="Get" buttonFunction={getNoOfProjectProposalsHandler}>
                    </FeatureCard>
                    <FeatureCard title="Get No Of Funded Projects" buttonTitle="Get" buttonFunction={getNoOfFundedProjectsHandler}>
                    </FeatureCard>
                    <FeatureCard title="Get Ether Received By Project" buttonTitle="Get" buttonFunction={getEtherReceivedByProjectHandler}>
                        <InputNum function={setEtherReceivedByProjectId} title="Enter Project Id" />
                    </FeatureCard>
                    <FeatureCard title="Get No Of Surveys" buttonTitle="Get" buttonFunction={getNoOfSurveysHandler}>
                    </FeatureCard>
                </Row>
            </div>
        </div>
    )
}
