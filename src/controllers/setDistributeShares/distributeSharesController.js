import async from "async";
import UniversalFunctions from "../../utils/universalFunctions.js";
const ERROR = UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR;
import { connectToAlgorand, getBlockchainAccount, distributeRemainShares, respondToServer } from "../../helpers/helperFunctions.js";

/**
 * 
 * @param {Object} payloadData
 * @param {String} payloadData.jobID
 * @param {String} payloadData.datashopServerAddress
 * @param {Object} payloadData.dataFileURL
 * @param {String} payloadData.dataFileURL.url
 * @param {Object} payloadData.dataFileURL.json
 * @param {String} payloadData.dataFileURL.json.receiverAddr
 * @param {Number} payloadData.dataFileURL.json.amount
 * @param {Number} payloadData.dataFileURL.json.companyId
 * @param {Number} payloadData.dataFileURL.json.sharesId
 * @param {Function} callback 
 */
const sendShares = async (payloadData, callback) => {
	const data = payloadData.dataFileURL.json;
	// const data = JSON.parse(payloadData.dataFileURL);
	// console.log(data);
	let algoClient;
	let account;
	let sharesBalance;

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
		distributeRemainShares: (cb) => {
			const receiverData = {
				receiver: data.receiver,
				companyId: data.companyId,
				sharesId: data.sharesId,
			};
			distributeRemainShares(algoClient, account, receiverData, (err, result) => {
				if (err) return cb(err);
				if (!result) return cb(ERROR.APP_ERROR);
				console.log(result);
				sharesBalance = result;
				cb();
			});
		}
	};
	async.series(tasks, async (err, result) => {
		let returnData;
		if (err || (!sharesBalance)) {
			// respond to server with error
			returnData = null;
		} else {
			// respond to server with success
			returnData = { sharesBalance };
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

export default sendShares;