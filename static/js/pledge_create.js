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
		input.type = "hidden";
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

document.getElementById('paypal').addEventListener('click', function(e) {
	form.action = "/pay/paypal";
	form.submit();
});