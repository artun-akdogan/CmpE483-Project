import Head from 'next/head'
import { useState } from 'react'
import Web3 from 'web3'

declare var window: any

export default function myGov() {
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

    return(
        <div>
            <Head>
                <title>Governance App</title>
                <meta name="description" content="Governance App" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
            </Head>
            <nav className="navbar navbar-expand-lg navbar-light bg-light">
                <a className="navbar-brand" href="#">My Gov App</a>
                <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarNav">
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
            <section>
                <div className='container'>
                    <p>text</p>
                </div>
            </section>
            <section>
                <div className='container'>
                    <p>{error}</p>
                </div>
            </section>
        </div>
    )
}