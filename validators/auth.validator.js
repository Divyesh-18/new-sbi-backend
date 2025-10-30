const yup = require("yup");

module.exports.loginSchema = yup.object({
	mobile: yup.number().required("Mobile number is required"),
	password: yup.string().required(),
});

module.exports.registerSchema = yup.object({
	mobile_number: yup
		.number()
		.typeError("That doesn't look like a Mobile number")
		.positive("A Mobile number can't start with a minus")
		.integer("A Mobile number can't include a decimal point")
		.min(10)
		.required("Mobile number is required"),
	password: yup.string().required(),
	otp: yup.number().required(),
	ref_code: yup.string(),
	agree: yup.string().required(),
	selectedRegMobile: yup.string().required(),
	email: yup.string().label("Email is required"),
});

module.exports.sendOtpSchema = yup.object({
	mobile_number: yup
		.number()
		.typeError("That doesn't look like a Mobile number")
		.positive("A Mobile number can't start with a minus")
		.integer("A Mobile number can't include a decimal point")
		.min(10)
		.required("Mobile number is required"),
	email: yup.string().label("Email is required"),
});

module.exports.forgotpasswordSchema = yup.object({
	mobile_number: yup
		.number()
		.typeError("That doesn't look like a Mobile number")
		.positive("A Mobile number can't start with a minus")
		.integer("A Mobile number can't include a decimal point")
		.required("Mobile number is required")
		.min(10),
	email: yup.string().label("Email is required"),
	otp: yup.string().required("Verification code is required"),
})

module.exports.rechargeShema = yup.object({
	amount: yup.number().required("Enter or Select recharge amount"),
	reference: yup.string().required("Reference Is required"),
	rechargetype: yup.string().required("Rechargetype Is required"),
})

module.exports.newaddbankdetailSchema = yup.object({
	name: yup.string().required("name is required"),
	email: yup.string(),
	ifsc_code: yup.string().required("ifsc_code is required"),
	bank_code: yup.string().required("bank_code is required"),
	bank_account: yup.number().required("bank_account is required"),
	otp: yup.number().required("otp is required"),

})

module.exports.withdrawalSchema = yup.object({
	amount: yup.number().required("amount field is required").label('minimum withdrawal 211'),
	account_id: yup.string().required("Select Bank Card")

})

module.exports.newCryptoAddressSchema = yup.object({
	crypto_address: yup.string().required(),
})

module.exports.addcryptodetailSchema = yup.object({
	crypto_address: yup.string().required(),
})

module.exports.batenowSchema = yup.object({
	type: yup.string().required(),
	value: yup.string().required(),
	counter: yup.number().required(),
	finalamount: yup.number().required(),
	tab: yup.string().required(),
})

module.exports.complaintSchema = yup.object({
	type: yup.string().required(),
	whatsApp: yup.string().required(),
	Description: yup.string().required(),
})

module.exports.addressSchema = yup.object({
	full_name: yup.string().required(),
	mobile_number: yup.number().required().min(10),
	pincode: yup.number().required(),
	state: yup.string().required(),
	city: yup.string().required(),
	detail_address: yup.string().required(),
})

module.exports.sendOtpEmailSchema = yup.object({
	mobile_number: yup
		.number()
		.typeError("That doesn't look like a Mobile number")
		.positive("A Mobile number can't start with a minus")
		.integer("A Mobile number can't include a decimal point")
		.min(10)
		.required("Mobile number is required"),
	email: yup.string().label("Email is required"),
})


module.exports.addmessageSchema = yup.object({
	message: yup.string().required(),
})

module.exports.editBankDetail = yup.object({
	name: yup.string().required("name is required"),
	ifsc_code: yup.string().required("ifsc_code is required"),
	bank_code: yup.string().required("bank_code is required"),
	bank_account: yup.number().required("bank_account is required"),
	state: yup.string().required("state is required"),
	city: yup.string().required("city is required"),
	address: yup.string().required("address is required"),
	mobile_number: yup.number().required("mobile_number is required").min(10),
})