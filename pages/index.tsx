import Head from 'next/head'
import React,{ useState, useRef, forwardRef } from 'react'
import { Card, Row,Button, Space, InputNumber, Input, notification } from 'antd'
import Web3 from 'web3'
import mygovContract from '../blockchain/mygov'
import DatePicker from "react-datepicker";
import 'react-datepicker/dist/react-datepicker.css';

declare var window: any

function FeatureCard (props: any) {
    return (
        <Card title={props.title} bordered={false} style={{ width: 450, marginLeft: 50, marginBottom: "20px" }}>
            {props.children}
            <Space direction="vertical" style={{ width: '100%' }}>
                <Button onClick={props.buttonFunction} style={{backgroundColor: '#1A1A40', position:'relative', top:'10px'}} type="primary" block >
                    {props.buttonTitle}
                </Button>
            </Space>
        </Card>
    )
}

function InputNum (props: any) {
    return (
        <InputNumber onChange={(value:number|null) => props.function(value)} placeholder={props.title} style={{ width: '100%' }} />
    )
}

function InputStr (props: any) {
    return (
        <Input onChange={(e) => props.function(e.target.value)} placeholder={props.title} style={{ width: '100%' }} />
    )
}

function RadioBoolean (props: any) {
    const func = (event: any) => {
        props.function(event.target.value==="true")
    }
    return (
        <div className="radio-group" style={{marginTop: "7px", marginBottom: "3px"}}>
            <label style={{fontSize: "1rem", marginRight: '1rem', fontWeight: 'bold'}}>{props.label}: </label>
            <label className="radio-label" style={{fontSize: "1rem", cursor: 'pointer', marginRight: '1rem'}} >
                <input className="radio-input" type="radio" value="true" checked={props.value === true} onChange={func} style={{cursor: 'pointer'}} /> Yes </label>
            <label className="radio-label" style={{fontSize: "1rem", cursor: 'pointer'}} >
                <input className="radio-input" type="radio" value="false" checked={props.value === false} onChange={func} style={{cursor: 'pointer'}} /> No </label>
        </div>
    )
}

function DateInput (props: any) {
        const CustomInput = forwardRef(({ value, onClick }, ref) => (
            <Input onClick={onClick} value={value} />
        ));
        if(props.placeholder){
            return(
                <div style={{ width: props.width }}>
                    <DatePicker selected={props.value} onChange={props.function} placeholderText={props.title} showTimeSelect customInput={<CustomInput />} />
                </div>
            )
        }else{
            return(
                <label style={{fontWeight: 'bold', display: "flex", fontSize:"1.2rem", width: props.width}}>{props.title}:
                <div style={{width: "100%", display: "flex", marginLeft: "1rem"}}>
                     <DatePicker selected={props.value} onChange={props.function} placeholderText={props.title} showTimeSelect customInput={<CustomInput />} />
                </div>
                </label>
            )
        }
}

function DynamicForm2 (props: any) {
    const prototype = { amount: null, schedule: new Date() }
  
    const handleFormChange = (name:string, value:number|Date|null, index: number) => {
      let data = [...props.formFields];
      data[index][name] = value;
      props.setFormFields(data);
    }

    const addFields = () => {
      props.setFormFields([...props.formFields, prototype])
    }

    const removeFields = (index: number) => {
        let data = [...props.formFields];
        data.splice(index, 1)
        props.setFormFields(data)
    }

    return (
      <div>
          {props.formFields.map((form, index) => {
            return (
              <div key={index} style={{ display: "flex" }}>
                <InputNumber onChange={(value:number|null) => handleFormChange("amount", value, index)} placeholder='Amount' value={form.amount} style={{ width: '45%' }} />
                <DateInput value={props.formFields[index]['schedule']} function={(date: Date) => handleFormChange("schedule", date, index)} title="Schedule" width="%45" placeholder={true}/>
                <Button onClick={() => removeFields(index)} style={{ width: '10%' }} >-</Button>
              </div>
            )
          })}
        <Button onClick={addFields}>Add Amount/Schedule</Button>
      </div>
    );
  }

function DynamicForm1 (props: any) {
    const prototype = { choices: "" }
  
    const handleFormChange = (name:string, value:number|Date|null, index: number) => {
      let data = [...props.formFields];
      data[index][name] = value;
      props.setFormFields(data);
    }
  
    const addFields = () => {
      props.setFormFields([...props.formFields, prototype])
    }

    const removeFields = (index: number) => {
        let data = [...props.formFields];
        data.splice(index, 1)
        props.setFormFields(data)
    }

    return (
        <div>
            {props.formFields.map((form, index) => {
              return (
                <div key={index} style={{ display: "flex" }}>
                  <Input onChange={(e:any) => handleFormChange("amount", e.target.value, index)} placeholder='Choice' value={form.amount} style={{ width: '90%' }} />
                  <Button onClick={() => removeFields(index)} style={{ width: '10%' }} >-</Button>
                </div>
              )
            })}
          <Button onClick={addFields}>Add Amount/Schedule</Button>
        </div>
    );
}

export default function myGov() {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    let web3 = null

    const connectWalletHandler = async () => {
      if(typeof window !== "undefined" && typeof window.ethereum !== "undefined"){
        try{
            await window.ethereum.request({ method: "eth_requestAccounts" })
            web3 = new Web3(window.ethereum)
        } catch(err: any){
            notification['error']({message: `Error while wallet connection: ${err.message}`})
        }
      } else{
        notification['error']({message: `Please install Metamask`})
      }
    }

    const [etherValue, setEtherValue] = useState<number|null>(null);
    const donateEtherHandler = async () => {
        if(etherValue === null){
            notification['error']({message: `Please enter a valid number`})
        }
        // Buralar değişmeli
        await mygovContract.methods.donateEther().call()
    }

    const [myGovTokenValue, setMyGovTokenValue] = useState<number|null>(null);
    const donateMyGovTokenHandler = async () => {
        if(myGovTokenValue === null){
            notification['error']({message: `Please enter a valid number`})
        }
        await mygovContract.methods.donateMyGovToken(myGovTokenValue).call()
    }

    const faucetHandler = async () => {
        await mygovContract.methods.faucet().call()
    }

    const [memAddrDelValue, setMemAddrDelValue] = useState("");
    const [projectIdDelValue, setProjectIdDelValue] = useState<number|null>(null);
    const delegateVoteHandler = async () => {
        await mygovContract.methods.delegateVoteTo("address", 1).call()
    }

    const [projectIdPropValue, setProjectIdPropValue] = useState<number|null>(null);
    const [choicePropValue, setChoicePropValue] = useState<boolean>(false);
    const voteForProjectProposalHandler = async () => {
        await mygovContract.methods.voteForProjectProposal(1, true).call()
    }

    const [projectIdPayValue, setProjectIdPayValue] = useState<number|null>(null);
    const [choicePayValue, setChoicePayValue] = useState<boolean>(false);
    const voteForProjectPaymentHandler = async () => {
        await mygovContract.methods.voteForProjectPayment(1, true).call()
    }

    const [projectIpfshash, setProjectIpfshash] = useState("");
    const [voteDeadline, setVoteDeadline] = useState(new Date());
    const [projectSubmitPair, setProjectSubmitPair] = useState([])
    const submitProjectProposalHandler = async () => {
        let projectId : number = await mygovContract.methods.submitProjectProposal("ipfshash", "123", [1,2], [2,3]).call()
    }

    const [surveyIpfshash, setSurveyIpfshash] = useState("");
    const [surveyDeadline, setSurveyDeadline] = useState(new Date());
    const [surveyNumChoices, setSurveyNumChoices] = useState<number|null>(null);
    const [surveyAtMostChoice, setSurveyAtMostChoice] = useState<number|null>(null);
    const submitSurveyHandler = async () => {
        await mygovContract.methods.submitSurvey().call()
    }

    const [surveyId, setSurveyId] = useState<number|null>(null);
    const [surveyChoices, setSurveyChoices] = useState([])
    const takeSurveyHandler = async () => {
        await mygovContract.methods.takeSurvey(1, [1,2]).call()
    }

    const [projGrantId, setProjGrantId] = useState<number|null>(null);
    const reserveProjectGrantHandler = async () => {
        await mygovContract.methods.reserveProjectGrant(1).call()
    }

    const [withdrawId, setWithdrawId] = useState<number|null>(null);
    const withdrawProjectPaymentHandler = async () => {
        await mygovContract.methods.withdrawProjectPayment(1).call()
    }

    const getSurveyResultsHandler = async () => {
        let result = await mygovContract.methods.getSurveyInfo(1).call()
    }

    const getSurveyOwnerHandler = async () => {
        let surverOwner = await mygovContract.methods.getSurveyOwner(1).call()
    }

    const getIsProjectFundedHandler = async () => {
        let isFunded: boolean = await mygovContract.methods.getIsProjectFunded(1).call()
    }

    const getProjectNextScheduleHandler = async () => {
        let nextSchedule: number = await mygovContract.methods.getProjectNextSchedule(1).call()
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
                </Row>
            </div>
        </div>
    )
}
