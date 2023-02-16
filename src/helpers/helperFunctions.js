import algosdk, { decodeAddress, encodeAddress, encodeUint64, isValidAddress, makeBasicAccountTransactionSigner } from "algosdk";
import axios from "axios";
import createCompany from "../contracts/createCompany.js";
import clearCompany from "../contracts/clearCompany.js";
import createVault from "../contracts/createVault.js";
import clearVault from "../contracts/clearVault.js";

/**
 *
 * @param {String} token
 * @param {String} server
 * @param {Number} port
 */
export const connectToAlgorand = (token, server, port) => {
	console.log("=== CONNECT TO NETWORK ===");
	const algoClient = new algosdk.Algodv2(token, server, port);
	return algoClient;
}

export const getBlockchainAccount = () => {
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
export const createAndSignTransaction = async (algoClient, account, transaction, data, signedTx, callback) => {
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
export const sendTransaction = async (algoClient, signedTx, txnId, cb) => {
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
export const respondToServer = (payloadData, data, cb) => {
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

const compileProgram = async (client, programSource) => {
	let encoder = new TextEncoder();
	let programBytes = encoder.encode(programSource);
	let compileResponse = await client.compile(programBytes).do();
	let compiledBytes = new Uint8Array(Buffer.from(compileResponse.result, "base64"));
	return compiledBytes;
}

const EncodeBytes = (utf8String) => {
	let enc = new TextEncoder();
	return enc.encode(utf8String);
}

const stringToLogicSig = (logicSigString) => {
	let logicSigArray = logicSigString.split(",");
	let logicSigBytes = new Uint8Array(logicSigArray);
	return algosdk.LogicSigAccount.fromByte(logicSigBytes);
}

export const deployVault = async (algoClient, account, data, callback) => {
	console.log("=== DEPLOY VAULT CONTRACT ===");
	try {
		let params = await algoClient.getTransactionParams().do();
		let senderAddr = account.addr
		let counterProgram = await compileProgram(algoClient, createVault);
		let clearProgram = await compileProgram(algoClient, clearVault);
		let onComplete = algosdk.OnApplicationComplete.NoOpOC;

		let localInts = 0;
		let localBytes = 0;
		let globalInts = 32;
		let globalBytes = 32;

		let accounts = undefined;
		let foreignApps = undefined;
		let foreignAssets = undefined;
		let appArgs = [];
		appArgs.push(EncodeBytes(data.vaultName));

		let deployContract = algosdk.makeApplicationCreateTxn(
			senderAddr,
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
		let signedTxn = deployContract.signTxn(account.sk);

		// Submit the transaction
		let tx = await algoClient.sendRawTransaction(signedTxn).do();
		let confirmedTxn = await algosdk.waitForConfirmation(algoClient, tx.txId, 4);
		let transactionResponse = await algoClient.pendingTransactionInformation(tx.txId).do();
		let appId = transactionResponse["application-index"];

		// Print the completed transaction and new ID
		console.log("Transaction " + tx.txId + " confirmed in round " + confirmedTxn["confirmed-round"]);
		console.log("The application ID is: " + appId);
		let appAddress = algosdk.getApplicationAddress(appId);
		console.log("The application wallet is: " + appAddress);
		await payAlgod(algoClient, account, appAddress, parseInt(data.funding));
		callback(null, { appId, appAddress });
	} catch (err) {
		console.log(err);
		callback(err, null);
	}
}

export const deployCompany = async (algoClient, account, data, callback) => {
	console.log("=== DEPLOY COMPANY CONTRACT ===");
	try {
		// let senderAccount = algosdk.mnemonicToSecretKey(process.env.MNEMONIC);
		let params = await algoClient.getTransactionParams().do();
		let senderAddr = account.addr
		let counterProgram = await compileProgram(algoClient, createCompany);
		let clearProgram = await compileProgram(algoClient, clearCompany);
		let onComplete = algosdk.OnApplicationComplete.NoOpOC;

		let localInts = 0;
		let localBytes = 0;
		let globalInts = 32;
		let globalBytes = 32;

		let accounts = undefined;
		let foreignApps = undefined;
		let foreignAssets = undefined;
		let appArgs = [];
		appArgs.push(EncodeBytes(data.companyName));
		let numberOfFounders = data.founders.length;
		appArgs.push(encodeUint64(numberOfFounders));

		let deployContract = algosdk.makeApplicationCreateTxn(
			senderAddr,
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
		let signedTxn = deployContract.signTxn(account.sk);

		// Submit the transaction
		let tx = await algoClient.sendRawTransaction(signedTxn).do();
		let confirmedTxn = await algosdk.waitForConfirmation(algoClient, tx.txId, 4);
		let transactionResponse = await algoClient.pendingTransactionInformation(tx.txId).do();
		let appId = transactionResponse["application-index"];

		// Print the completed transaction and new ID
		console.log("Transaction " + tx.txId + " confirmed in round " + confirmedTxn["confirmed-round"]);
		console.log("The application ID is: " + appId);
		let appAddr = algosdk.getApplicationAddress(appId);
		console.log("The application wallet is: " + appAddr);
		await payAlgod(algoClient, account, appAddr, parseInt(data.funding));
		await addFounders(algoClient, account, appId, data.founders);
		let sharesId = await mintShares(algoClient, account, appId, data.shares);
		for (let i = 0; i < data.founders.length; i++) {
			await foundersOptinToShares(algoClient, data.founders[i], sharesId);
		};
		let founders;
		let foundersId = (Array.from(Array(data.founders.length), (_, index) => index + 1)).map(String);
		let indexes;
		for (let i = 0; i < data.founders.length; i += 4) {
			founders = data.founders.slice(i, i + 4);
			indexes = foundersId.slice(i, i + 4);
			await distributeShares(algoClient, account, appId, sharesId, founders, indexes);
		}
		const vaultData = {
			address: data.vaultAddress,
			ID: data.vaultId,
		}
		let coinsId = await mintCoins(algoClient, account, appId, data.coins, vaultData);
		await depositCoins(algoClient, account, appId, coinsId, vaultData);

		callback(null, appId);

	} catch (err) {
		console.log(err);
		callback(err, null);
	}
}

const payAlgod = async (algoClient, senderAccount, receiver, amount) => {
	console.log("=== fund contract ===");
	let params = await algoClient.getTransactionParams().do();
	let senderAddr = senderAccount.addr;
	let closeReminderTo = undefined;
	let note = undefined;
	let rekeyTo = undefined;
	let payment = algosdk.makePaymentTxnWithSuggestedParams(
		senderAddr,
		receiver,
		amount,
		closeReminderTo,
		note,
		params,
		rekeyTo);
	let signedTxn = payment.signTxn(senderAccount.sk);

	// Submit the transaction
	let tx = await algoClient.sendRawTransaction(signedTxn).do();
	let confirmedTxn = await algosdk.waitForConfirmation(algoClient, tx.txId, 10);
	console.log(amount + " algod has been transferred from " + senderAddr + " to " + receiver + " in the transaction " + tx.txId + " confirmed in round " + confirmedTxn["confirmed-round"]);
}

const addFounders = async (algoClient, senderAccount, companyId, foundersInfoArray) => {
	console.log("=== add company founders (up to 15) ===");
	let senderAddr = senderAccount.addr;
	let params = await algoClient.getTransactionParams().do();
	let operation = "add_founders"
	let appArgs = [];
	appArgs.push(EncodeBytes(operation));
	for (const property in foundersInfoArray) {
		appArgs.push((decodeAddress(foundersInfoArray[property].wallet)).publicKey);
	};
	let accounts = undefined;
	let foreignApps = undefined;
	let foreignAssets = undefined;
	let note = undefined;
	let lease = undefined;
	let rekeyTo = undefined;
	let boxes = undefined;
	let companyAddFounders = algosdk.makeApplicationNoOpTxn(senderAddr,
		params,
		companyId,
		appArgs,
		accounts,
		foreignApps,
		foreignAssets,
		note,
		lease,
		rekeyTo,
		boxes);
	let signedTxn = companyAddFounders.signTxn(senderAccount.sk);

	// Submit the transaction
	let tx = await algoClient.sendRawTransaction(signedTxn).do();
	let confirmedTxn = await algosdk.waitForConfirmation(algoClient, tx.txId, 4);
	console.log(" Company has added all founders in the transaction " + tx.txId + " confirmed in round " + confirmedTxn["confirmed-round"]);
}

const mintShares = async (algoClient, senderAccount, companyId, sharesInfoArray) => {
	console.log("=== mint company shares ===");
	let senderAddr = senderAccount.addr;
	let params = await algoClient.getTransactionParams().do();
	let operation = "mint_shares"
	let appArgs = [];
	appArgs.push(EncodeBytes(operation));
	for (const property in sharesInfoArray) {
		if (typeof sharesInfoArray[property] == "number") {
			appArgs.push(encodeUint64(sharesInfoArray[property]));
		}
		else {
			appArgs.push(EncodeBytes(sharesInfoArray[property]));
		}
	};
	let accounts = undefined;
	let foreignApps = undefined;
	let foreignAssets = undefined;
	let note = undefined;
	let lease = undefined;
	let rekeyTo = undefined;
	let boxes = undefined;
	let companyMintShres = algosdk.makeApplicationNoOpTxn(senderAddr,
		params,
		companyId,
		appArgs,
		accounts,
		foreignApps,
		foreignAssets,
		note,
		lease,
		rekeyTo,
		boxes);
	let signedTxn = companyMintShres.signTxn(senderAccount.sk);

	// Submit the transaction
	let tx = await algoClient.sendRawTransaction(signedTxn).do();
	let confirmedTxn = await algosdk.waitForConfirmation(algoClient, tx.txId, 10);
	let transactionResponse = await algoClient.pendingTransactionInformation(tx.txId).do();
	let sharesId = transactionResponse["inner-txns"][0]['asset-index'];
	console.log(" Company has minted shares with an asset ID " + sharesId + " in the transaction " + tx.txId + " confirmed in round " + confirmedTxn["confirmed-round"]);
	return sharesId;
}

const foundersOptinToShares = async (algoClient, founder, sharesId) => {
	console.log("=== optin to shares ===");
	let account = founder.wallet;
	let foundersLogicSig = stringToLogicSig(founder.logicSigString);
	let params = await algoClient.getTransactionParams().do();
	let closeRemainderTo = undefined;
	let revocationTarget = undefined;
	let note = undefined;
	let rekeyTo = undefined;
	let optInTxn = algosdk.makeAssetTransferTxnWithSuggestedParams(
		account,
		account,
		closeRemainderTo,
		revocationTarget,
		0,
		note,
		sharesId,
		params,
		rekeyTo);
	let signedTxn = algosdk.signLogicSigTransaction(optInTxn, foundersLogicSig).blob;
	let sendTxn = await algoClient.sendRawTransaction(signedTxn).do();
	let confirmedTxn = await algosdk.waitForConfirmation(algoClient, sendTxn.txId, 4);
	console.log("founder " + founder.wallet + " has optedIn to the shares " + sharesId + " at the transaction " + sendTxn.txId + ", confirmed in round " + confirmedTxn["confirmed-round"]);
}

const mintCoins = async (algoClient, senderAccount, companyId, coinsInfoArray, vaultInfo) => {
	console.log("=== mint company coins ===");
	let senderAddr = senderAccount.addr;
	let params = await algoClient.getTransactionParams().do();
	let accounts = [];
	accounts.push(vaultInfo.address);
	let foreignApps = [];
	foreignApps.push(vaultInfo.ID);
	let operation = "mint_coins";
	let appArgs = [];
	appArgs.push(EncodeBytes(operation));
	for (const property in coinsInfoArray) {
		if (typeof coinsInfoArray[property] == "number") {
			appArgs.push(encodeUint64(coinsInfoArray[property]));
		}
		else {
			appArgs.push(EncodeBytes(coinsInfoArray[property]));
		}
	};
	let foreignAssets = undefined;
	let note = undefined;
	let lease = undefined;
	let rekeyTo = undefined;
	let boxes = undefined;
	let companyMintShares = algosdk.makeApplicationNoOpTxn(senderAddr,
		params,
		companyId,
		appArgs,
		accounts,
		foreignApps,
		foreignAssets,
		note,
		lease,
		rekeyTo,
		boxes);
	let signedTxn = companyMintShares.signTxn(senderAccount.sk);

	// Submit the transaction
	let tx = await algoClient.sendRawTransaction(signedTxn).do();
	let confirmedTxn = await algosdk.waitForConfirmation(algoClient, tx.txId, 10);
	let transactionResponse = await algoClient.pendingTransactionInformation(tx.txId).do();
	let coinsId = transactionResponse["inner-txns"][0]['asset-index'];
	console.log(" Company has minted coins with an asset ID " + coinsId + " in the transaction " + tx.txId + " confirmed in round " + confirmedTxn["confirmed-round"]);
	return coinsId;
}

const depositCoins = async (algoClient, senderAccount, companyId, coinsId, vaultInfo) => {
	console.log("=== deposit company coins ===");
	let senderAddr = senderAccount.addr;
	let params = await algoClient.getTransactionParams().do();
	let accounts = [];
	accounts.push(vaultInfo.address);
	let appArgs = [];
	let operation = "deposit_coins";
	appArgs.push(EncodeBytes(operation));
	let foreignAssets = [];
	foreignAssets.push(coinsId);
	let foreignApps = undefined;
	let note = undefined;
	let rekeyTo = undefined;
	let lease = undefined;
	let boxes = undefined;
	let companyDepositCoins = algosdk.makeApplicationNoOpTxn(senderAddr,
		params,
		companyId,
		appArgs,
		accounts,
		foreignApps,
		foreignAssets,
		note,
		lease,
		rekeyTo,
		boxes);
	let signedTxn = companyDepositCoins.signTxn(senderAccount.sk);

	// Submit the transaction
	let tx = await algoClient.sendRawTransaction(signedTxn).do();
	let confirmedTxn = await algosdk.waitForConfirmation(algoClient, tx.txId, 10);
	console.log("The deposit of coins has been finished at the transaction " + tx.txId + ", confirmed in round " + confirmedTxn["confirmed-round"]);
}

const distributeShares = async (algoClient, senderAccount, companyId, sharesId, founders, foundersIndexes) => {
	let senderAddr = senderAccount.addr;
	let params = await algoClient.getTransactionParams().do();
	let accounts = [];
	for (const property in founders) {
		accounts.push(founders[property].wallet);
	};
	let note = undefined;
	let rekeyTo = undefined;
	let appArgs = [];
	let operation = "distribute_shares";
	appArgs.push(EncodeBytes(operation));
	for (const property in foundersIndexes) {
		appArgs.push(EncodeBytes(foundersIndexes[property]));
	};
	for (const property in founders) {
		appArgs.push(encodeUint64(founders[property].shares));
	};
	let foreignApps = undefined;
	let foreignAssets = [];
	foreignAssets.push(sharesId);
	let lease = undefined;
	let boxes = undefined;
	let companyDistributeShares = algosdk.makeApplicationNoOpTxn(senderAddr,
		params,
		companyId,
		appArgs,
		accounts,
		foreignApps,
		foreignAssets,
		note,
		lease,
		rekeyTo,
		boxes);
	let signedTxn = companyDistributeShares.signTxn(senderAccount.sk);
	// Submit the transaction
	let tx = await algoClient.sendRawTransaction(signedTxn).do();
	let confirmedTxn = await algosdk.waitForConfirmation(algoClient, tx.txId, 10);
	console.log("The distribution of shares to founder(s) " + foundersIndexes + " has been done at the transaction " + tx.txId + ", confirmed in round " + confirmedTxn["confirmed-round"]);
}

