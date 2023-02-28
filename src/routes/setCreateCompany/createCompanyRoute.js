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
			console.log(JSON.stringify(payloadData));

			Controller.SetCreateCompany(payloadData)

			return new Promise((resolve, _) => {
				resolve(UniversalFunctions.sendSuccess(Config.APP_CONSTANTS.STATUS_MSG.SUCCESS.DEFAULT, {}));
			})
		},
		validate: {
			payload: Joi.object({
				jobID: Joi.string(),
				datashopServerAddress: Joi.string(),
				dataFileURL: Joi.object({
					url: Joi.string().min(0),
					json: Joi.object({
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
						shares: Joi.object({
							name: Joi.string(),
							unitName: Joi.string(),
							numberOfShares: Joi.number(),
							decimal: Joi.number(),
						}),
						coins: Joi.object({
							name: Joi.string(),
							unitName: Joi.string(),
							numberOfCoins: Joi.number(),
							decimal: Joi.number(),
						}),
						companyFunding: Joi.number(),
					}),
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
