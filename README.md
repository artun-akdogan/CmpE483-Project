# CmpE483-Project-1
Node-14 and required build tools must be installed in your computer to run the program

## To test the contract
* <b>Install truffle:</b> `npm install -g truffle`
* <b>Run in one terminal:</b> `geth --dev --http --http.api eth,web3,personal,net --allow-insecure-unlock`
* <b>Run in project folder:</b> `truffle test`

## To run frontend
* Ensure the contract is deployed.
* <b>Install packages in project folder:</b> `npm install`
* <b>Start frontend project folder:</b> `npm run dev` if in development (for now, npm start won't work because of typescript issues)
* <b>Open in browser:</b> `http://localhost:3000/`

## To deploy the contract
* <b>`truffle deploy --network fuji`</b>
