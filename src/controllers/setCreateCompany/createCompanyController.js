import async from "async";
import UniversalFunctions from "../../utils/universalFunctions.js";
const ERROR = UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR;
import { connectToAlgorand, getBlockchainAccount, deployVault, deployCompany, respondToServer } from "../../helpers/helperFunctions.js";

const createCompanyOnBlockchain = async (data, account, algoClient) => {
	let response;

	try {
		const vaultData = {
			vaultName: data.vaultName,
			funding: data.vaultFunding,
		}
		const { vaultId, vaultAddress } = await deployVault(algoClient, account, vaultData);

		const companyData = {
			companyName: data.companyName,
			funding: data.companyFunding,
			founders: data.founders,
			shares: data.shares,
			coins: data.coins,
			vaultId,
			vaultAddress,
		}
		let appId = await deployCompany(algoClient, account, companyData);

		response = { appId, vaultId, vaultAddress };


	} catch (error) {
		console.log(error);
		response = null;
	} finally {
		respondToServer(data, response, (err, result) => {
			if (err) console.log(err);
			else console.log("Job sucessfully updated");
		})
	}
}

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
 * @param {Function} callback 
 */
const createCompany = (payloadData, callback) => {
	const data = payloadData.dataFileURL.json;
	// const data = JSON.parse(payloadData.dataFileURL);
	// console.log(data);
	let algoClient;
	let account;

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
		blockchainOperations: (cb) => {
			createCompanyOnBlockchain(data, account, algoClient);
			cb();
		}
	};
	async.series(tasks, (err, result) => {
		if (err) return callback(err);
		return callback(null, {});
	});
};

export default createCompany;