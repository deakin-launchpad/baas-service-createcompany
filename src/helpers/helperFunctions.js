import algosdk, { encodeUint64 } from "algosdk";
import axios from "axios";
import createCompany from "../contracts/createCompany.js";
import clear from "../contracts/clear.js";

/**
 *
 * @param {String} token
 * @param {String} server
 * @param {Number} port
 */
export function connectToAlgorand(token, server, port) {
	console.log("=== CONNECT TO NETWORK ===");
	const algoClient = new algosdk.Algodv2(token, server, port);
	return algoClient;
}

export function getBlockchainAccount() {
	console.log("=== GET ACCOUNT ===");
	const account = algosdk.mnemonicToSecretKey(process.env.MNEMONIC);
	console.log("Account: " + account.addr);
	return account;
}

/**
 *
 * @param {String} algoClient
 * @param {Object} account
 * @param {Object} transaction
 * @param {Object} data
 * @param {any} signedTx
 * @param {Callback} callback
 */
export async function createAndSignTransaction(algoClient, account, transaction, data, signedTx, callback) {
	console.log("=== CREATE AND SIGN TRANSACTION ===");
	let suggestedParams, signed;
	await algoClient
		.getTransactionParams()
		.do()
		.then(async (value) => {
			suggestedParams = value;
			const appIndex = 103723509;
			const appArgs = [new Uint8Array(Buffer.from("set_number")), encodeUint64(parseInt(data.numberToSet))];
			transaction = algosdk.makeApplicationNoOpTxn(account.addr, suggestedParams, appIndex, appArgs);
			signedTx = await algosdk.signTransaction(transaction, account.sk);
			signed = signedTx;
		})
		.catch((err) => {
			return callback(err);
		});
	return signed;
}

/**
 *
 * @param {String} algoClient
 * @param {any} callback
 */
export async function sendTransaction(algoClient, signedTx, txnId, cb) {
	console.log("=== SEND TRANSACTION ===");
	await algoClient
		.sendRawTransaction(signedTx.blob)
		.do()
		.then((_txnId) => {
			txnId = _txnId;
			console.log(txnId);
			return;
		})
		.catch((e) => {
			return cb(e);
		});
	return cb();
}

/**
 *
 * @param {Object} payloadData
 * @param {any} cb
 */
export function respondToServer(payloadData, data, cb) {
	console.log("=== RESPOND TO SERVER ===");
	let service = payloadData;
	let destination = service.datashopServerAddress + "/api/job/updateJob";
	let lambdaInput;
	if (data) {
		lambdaInput = {
			insightFileURL: service.dataFileURL,
			jobid: service.jobID,
			returnData: data,
		};
	} else {
		lambdaInput = {
			insightFileURL: service.dataFileURL,
			jobid: service.jobID,
		};
	}
	axios.put(destination, lambdaInput).catch((e) => {
		cb(e);
	});
	console.log("=== JOB RESPONDED ===");
	return;
}

async function compileProgram(client, programSource) {
	let encoder = new TextEncoder();
	let programBytes = encoder.encode(programSource);
	let compileResponse = await client.compile(programBytes).do();
	let compiledBytes = new Uint8Array(Buffer.from(compileResponse.result, "base64"));
	return compiledBytes;
}

function EncodeBytes(utf8String) {
	let enc = new TextEncoder();
	return enc.encode(utf8String);
}

export async function deployCompany(algoClient, account, data, cb) {
	console.log("=== DEPLOY COMPANY CONTRACT ===");
	try {
		let senderAccount = algosdk.mnemonicToSecretKey(process.env.MNEMONIC);
		let params = await algoClient.getTransactionParams().do();
		let sender = account.addr;
		let counterProgram = await compileProgram(algoClient, createCompany);
		let clearProgram = await compileProgram(algoClient, clear);
		let onComplete = algosdk.OnApplicationComplete.NoOpOC;

		let localInts = 0;
		let localBytes = 0;
		let globalInts = 10;
		let globalBytes = 10;

		let accounts = undefined;
		let foreignApps = undefined;
		let foreignAssets = undefined;
		let appAdmin = new algosdk.decodeAddress(sender);
		let appArgs = [];
		appArgs.push(
			EncodeBytes(data.companyName),
			EncodeBytes(data.directorsWallets.directorA),
			EncodeBytes(data.directorsWallets.directorB),
			EncodeBytes(data.directorsWallets.directorC)
		);

		// appArgs.push(appAdmin.publicKey);

		let deployContract = algosdk.makeApplicationCreateTxn(
			sender,
			params,
			onComplete,
			counterProgram,
			clearProgram,
			localInts,
			localBytes,
			globalInts,
			globalBytes,
			appArgs,
			accounts,
			foreignApps,
			foreignAssets
		);
		let signedTxn = deployContract.signTxn(senderAccount.sk);

		// Submit the transaction
		let tx = await algoClient.sendRawTransaction(signedTxn).do();
		let confirmedTxn = await algosdk.waitForConfirmation(algoClient, tx.txId, 4);
		let transactionResponse = await algoClient.pendingTransactionInformation(tx.txId).do();
		let appId = transactionResponse["application-index"];

		// Print the completed transaction and new ID
		console.log("Transaction " + tx.txId + " confirmed in round " + confirmedTxn["confirmed-round"]);
		console.log("The application ID is: " + appId);
		return appId;
	} catch (err) {
		cb(err);
	}
	process.exit();
}
