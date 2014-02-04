var form = document.querySelector("#progress_pledge");

////////////
// STRIPE //
////////////

var handler = StripeCheckout.configure({
	key: STRIPE_PUBLIC_KEY,
	image: "http://placekitten.com/128/128",
	token: function(token, args) {

		var input = document.createElement("input");
		input.name = "stripeToken";
		input.value = token.id;
		form.appendChild(input);

		form.action = "/pay/stripe";
		form.submit();
		
	}
});
document.getElementById('credit_card').addEventListener('click', function(e) {

	var backer_email = document.getElementsByName("backer_email")[0].value;

	// Open Checkout with further options
	handler.open({
		name: 'Nothing To Hide',
		description: "you won't be charged right now",
		email: backer_email,
		panelLabel: "Pledge!",
		amount: 0
	});

});


//////////////
// COINBASE //
//////////////

document.getElementById('bitcoin').addEventListener('click', function(e) {
	form.action = "/pay/coinbase";
	form.submit();
});

////////////
// PAYPAL //
////////////

document.getElementById('paypal').addEventListener('click', function(e){

	// Create new form
	var form = document.createElement("form");
	form.action = PAYPAL_API;
	form.method = "POST";
	form.target = "_top";

	// The progress pledge form's values
	var pledge = {
		backer_name: document.querySelector("input[name=backer_name]").value,
		backer_email: document.querySelector("input[name=backer_email]").value,
		pledge_total: document.querySelector("input[name=pledge_total]").value,
		pledge_split: document.querySelector("input[name=pledge_split]").value
	};

	// All parameters
	var params = {

		// Paypal
		button: "buynow",
		cmd: "_xclick",

		// People
		business: PAYPAL_EMAIL,
		item_name: "Nothing To Hide Backer",

		// Money
		amount: pledge.pledge_total,
		currency_code: "USD",

		// URLs
		address_override: 1,
		notify_url: DOMAIN_NAME + "/pay/paypal/ipn",
		"return": DOMAIN_NAME + "/pay/paypal/success",

		// Custom
		custom: JSON.stringify(pledge)

	};

	// Populate said variables
	for(var name in params){
		var input = document.createElement("input");
		input.name = name;
		input.value = params[name];
		form.appendChild(input);
	}

	// POST Redirect
	form.submit();

});

