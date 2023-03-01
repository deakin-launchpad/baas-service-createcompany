import async from "async";
import UniversalFunctions from "../../utils/universalFunctions.js";
const ERROR = UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR;
import { connectToAlgorand, getBlockchainAccount, deployVault, deployCompany, respondToServer } from "../../helpers/helperFunctions.js";

/**
 * 
 * @param {Object} payloadData
 * @param {String} payloadData.vaultName
 * @param {Number} payloadData.funding
 * @param {Account} account
 * @param {ClientInstance} algoClient
 * @param {Function} callback 
 */
const createVault = (payloadData, account, algoClient, callback) => {
	console.log(payloadData);

	const tasks = {
		deployVault: (cb) => {
			deployVault(algoClient, account, payloadData, (err, result) => {
				if (err) return cb(err);
				if (!result) return cb(ERROR.APP_ERROR);
				cb(null, result);
			});
		},
	};
	async.series(tasks, (err, result) => {
		if (err) return callback(err);
		return callback(null, result);
	});
};

/**
 * 
 * @param {Object} payloadData
 * @param {String} payloadData.companyName
 * @param {Number} payloadData.companyFunding
 * @param {Object[]} payloadData.founders
 * @param {Object[]} payloadData.shares
 * @param {Object[]} payloadData.coins
 * @param {String} payloadData.vaultName
 * @param {Number} payloadData.vaultFunding
 */
const createCompany = async (payloadData) => {
	const data = payloadData.dataFileURL.json;
	// const data = JSON.parse(payloadData.dataFileURL);
	// console.log(data);
	let algoClient;
	let account;
	let appId;
	let vaultId;
	let vaultAddress;

	const tasks = {
		connectToBlockchain: (cb) => {
			algoClient = connectToAlgorand("", "https://testnet-api.algonode.cloud", 443);
			if (!algoClient) return cb(ERROR.APP_ERROR);
			cb();
		},
		getBlockchainAccount: (cb) => {
			account = getBlockchainAccount();
			if (!account) return cb(ERROR.APP_ERROR);
			cb();
		},
		deployVault: (cb) => {
			const vaultData = {
				vaultName: data.vaultName,
				funding: data.vaultFunding,
			}
			createVault(vaultData, account, algoClient, (err, result) => {
				if (err) return cb(err);
				vaultId = result.deployVault.appId;
				vaultAddress = result.deployVault.appAddress;
				cb();
			});
		},
		deployCompany: (cb) => {
			const companyData = {
				companyName: data.companyName,
				funding: data.companyFunding,
				founders: data.founders,
				shares: data.shares,
				coins: data.coins,
				vaultId,
				vaultAddress,
			}
			deployCompany(algoClient, account, companyData, (err, result) => {
				if (err) return cb(err);
				if (!result) return cb(ERROR.APP_ERROR);
				console.log(result);
				appId = result;
				cb();
			});
		}
	};
	async.series(tasks, async (err, result) => {
		let returnData;
		if (err || (!appId || !vaultId || !vaultAddress)) {
			// respond to server with error
			returnData = null;
		} else {
			// respond to server with success
			returnData = { appId, vaultId, vaultAddress };
		}
		respondToServer(payloadData, returnData, (err, result) => {
			if (err) {
				console.log(err);
			} else {
				console.log(result);
			}
		});
	});
};

export default createCompany;