import Head from 'next/head'
import React,{ useState } from 'react'
import { Card, Row,Button, Space, InputNumber } from 'antd'
import Web3 from 'web3'
import mygovContract from '../blockchain/mygov'

declare var window: any

export default function myGov() {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [error, setError] = useState("")
    let web3

    const connectWalletHandler = async () => {
      if(typeof window !== "undefined" && typeof window.ethereum !== "undefined"){
        try{
            await window.ethereum.request({ method: "eth_requestAccounts" })
            web3 = new Web3(window.ethereum)
        } catch(err: any){
            setError(err.message)
        }
      } else{
        console.log("Please install Metamask")
      }
    }

    const donateEtherHandler = async () => {
        await mygovContract.methods.donateEther().call()
    }

    const donateMyGovTokenHandler = async () => {
        await mygovContract.methods.donateMyGovTokenHandler().call()
    }

    const delegateVoteHandler = async () => {
        await mygovContract.methods.delegateVoteTo("address", 1).call()
    }

    const voteForProjectProposalHandler = async () => {
        await mygovContract.methods.voteForProjectProposal(1, true).call()
    }

    const voteForProjectPaymentHandler = async () => {
        await mygovContract.methods.voteForProjectPayment(1, true).call()
    }

    const submitProjectProposalHandler = async () => {
        let projectId : number = await mygovContract.methods.submitProjectProposal("ipfshash", "123", [1,2], [2,3]).call()
    }

    const takeSurveyHandler = async () => {
        await mygovContract.methods.takeSurvey(1, [1,2]).call()
    }

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
        <div >
            <Head >
                <title>Governance App</title>
                <meta name="description" content="Governance App" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
            </Head>
            <nav className="navbar navbar-expand-lg navbar-light bg-light" >
                <a className="navbar-brand" href="#">My Gov App</a>
                <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarNav" >
                    <ul className="navbar-nav">
                        <li className="nav-item active">
                            <a className="nav-link" href="#">Home</a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link" href="#">Features</a>
                        </li>
                        <button onClick={connectWalletHandler} className="btn btn-outline-success my-2 my-sm-0" type="submit">Connect Wallet</button>
                    </ul>
                </div>
            </nav>
            
            <div className="card-container" style={{ padding: "25px", backgroundColor: '#F6F6F6'}}>
                <Row style={{marginTop: 50}}>
                    <Card title="Donate Ethereum To MyGov" bordered={false} style={{ width: 450, marginLeft: 50 }}>
                        <InputNumber placeholder='Enter Ether Amount' style={{ width: '100%' }} />
                        <Button onClick={donateEtherHandler} style={{backgroundColor: '#1A1A40', position:'relative', top:'10px'}} type="primary" block >
                            Donate Ethereum
                        </Button>
                    </Card>
                    <Card title="Donate MyGov Token" bordered={false} style={{ width: 450, marginLeft: 50  }}>
                        <InputNumber placeholder='Enter MyGov Amount' style={{ width: '100%' }} />
                        <Button style={{backgroundColor: '#1A1A40', position:'relative', top:'10px'}} type="primary" block >
                            Donate Ethereum
                        </Button>
                    </Card>
                    <Card title="Faucet" bordered={false} style={{ width: 450, marginLeft: 50  }}>
                        <text>You can not take more than one token</text>
                        <Space direction="vertical" style={{ width: '100%' }}>
                            <Button style={{backgroundColor: '#1A1A40', position:'relative', top:'10px'}} type="primary" block >
                                Take MyGov Token
                            </Button>
                        </Space>
                    </Card>
                </Row>
                <Row style={{marginTop: 50}}>
                    <Card title="Card title" bordered={false} style={{ width: 450, marginLeft: 50 }}>
                        <p>Card content</p>
                        <p>Card content</p>
                        <p>Card content</p>
                    </Card>
                    <Card title="Card title" bordered={false} style={{ width: 450, marginLeft: 50  }}>
                        <p>Card content</p>
                        <p>Card content</p>
                        <p>Card content</p>
                    </Card>
                    <Card title="Card title" bordered={false} style={{ width: 450, marginLeft: 50  }}>
                        <p>Card content</p>
                        <p>Card content</p>
                        <p>Card content</p>
                    </Card>
                </Row>
                <Row style={{marginTop: 50}}>
                    <Card title="Survey Result" bordered={false} style={{ width: 450, marginLeft: 50 }}>
                        <InputNumber placeholder='Enter Survey Id' style={{ width: '100%' }} />
                        <Button style={{backgroundColor: '#1A1A40', position:'relative', top:'10px'}} type="primary" block >
                            Get Result Of The Survey
                        </Button>
                    </Card>
                    <Card title="Survey Information"  bordered={false} style={{ width: 450, marginLeft: 50  }}>
                        <InputNumber placeholder='Enter Survey Id' style={{ width: '100%' }} />
                        <Button style={{backgroundColor: '#1A1A40', position:'relative', top:'10px'}} type="primary" block >
                            Get Information About The Survey
                        </Button>
                    </Card>
                    <Card title="Survey Owner" bordered={false} style={{ width: 450, marginLeft: 50  }}>
                        <InputNumber placeholder='Enter Survey Id' style={{ width: '100%' }} />
                        <Button style={{backgroundColor: '#1A1A40', position:'relative', top:'10px'}} type="primary" block >
                            Get Address of Survey Owner
                        </Button>
                    </Card>
                </Row>
                <Row style={{marginTop: 50}}>
                    <Card title="Total Project Proposals" bordered={false} style={{ width: 450, marginLeft: 50 }}>
                        <Button style={{backgroundColor: '#1A1A40', position:'relative', top:'10px'}} type="primary" block >
                            Get The Number Of Project Proposals
                        </Button>
                    </Card>
                    <Card title="Total Funded Projects" bordered={false} style={{ width: 450, marginLeft: 50  }}>
                        <Button style={{backgroundColor: '#1A1A40', position:'relative', top:'10px'}} type="primary" block >
                            Get The Number Of Funded Projects
                        </Button>
                    </Card>
                    <Card title="Total Surveys" bordered={false} style={{ width: 450, marginLeft: 50  }}>
                        <Button style={{backgroundColor: '#1A1A40', position:'relative', top:'10px'}} type="primary" block >
                            Get Number Of Surveys
                        </Button>
                    </Card>
                </Row>
                <Row style={{marginTop: 50}}>
                    <Card title="Card title" bordered={false} style={{ width: 450, marginLeft: 50 }}>
                        <p>Card content</p>
                        <p>Card content</p>
                        <p>Card content</p>
                    </Card>
                    <Card title="Card title" bordered={false} style={{ width: 450, marginLeft: 50  }}>
                        <p>Card content</p>
                        <p>Card content</p>
                        <p>Card content</p>
                    </Card>
                    <Card title="Card title" bordered={false} style={{ width: 450, marginLeft: 50  }}>
                        <p>Card content</p>
                        <p>Card content</p>
                        <p>Card content</p>
                    </Card>
                </Row>
                <Row style={{marginTop: 50}}>
                    <Card title="Card title" bordered={false} style={{ width: 450, marginLeft: 50 }}>
                        <p>Card content</p>
                        <p>Card content</p>
                        <p>Card content</p>
                    </Card>
                    <Card title="Card title" bordered={false} style={{ width: 450, marginLeft: 50  }}>
                        <p>Card content</p>
                        <p>Card content</p>
                        <p>Card content</p>
                    </Card>
                    <Card title="Card title" bordered={false} style={{ width: 450, marginLeft: 50  }}>
                        <p>Card content</p>
                        <p>Card content</p>
                        <p>Card content</p>
                    </Card>
                </Row>
            </div>
        </div>
    )
}
