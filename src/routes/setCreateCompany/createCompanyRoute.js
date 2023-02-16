import UniversalFunctions from "../../utils/universalFunctions.js";
import Joi from "joi";
import Controller from "../../controllers/index.js";
const Config = UniversalFunctions.CONFIG;

const createCompanyRoute = {
	method: "POST",
	path: "/api/demo/createCompanyRoute",
	options: {
		description: "demo api",
		tags: ["api"],
		handler: function (request, h) {
			var payloadData = request.payload;
			return new Promise((resolve, reject) => {
				Controller.SetCreateCompany(payloadData, function (err, data) {
					if (err) reject(UniversalFunctions.sendError(err));
					else resolve(UniversalFunctions.sendSuccess(Config.APP_CONSTANTS.STATUS_MSG.SUCCESS.DEFAULT, data));
				});
			});
		},
		validate: {
			payload: Joi.object({
				jobID: Joi.string(),
				datashopServerAddress: Joi.string(),
				dataFileURL: Joi.object({
					vaultName: Joi.string(),
					vaultFunding: Joi.number(),
					companyName: Joi.string(),
					founders: Joi.array().items(
						Joi.object({
							wallet: Joi.string(),
							shares: Joi.number(),
							logicSigString: Joi.string(),
						})
					),
					shares: Joi.array().items(
						Joi.object({
							name: Joi.string(),
							unitName: Joi.string(),
							numberOfShares: Joi.number(),
						})
					),
					coins: Joi.array().items(
						Joi.object({
							name: Joi.string(),
							unitName: Joi.string(),
							numberOfCoins: Joi.number(),
						})
					),
					companyFunding: Joi.number(),
				}),
			}).label("Demo Model"),
			failAction: UniversalFunctions.failActionFunction,
		},
		plugins: {
			"hapi-swagger": {
				responseMessages: UniversalFunctions.CONFIG.APP_CONSTANTS.swaggerDefaultResponseMessages,
			},
		},
	},
};

export default createCompanyRoute;