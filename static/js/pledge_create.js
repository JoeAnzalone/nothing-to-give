var form = document.querySelector("#progress_pledge");

///////////////////
// VALIDATE FORM //
///////////////////

var pledge_total = document.getElementById("pledge_total");
pledge_total.onchange = function(){
	// Integer >= 2
	var num = parseInt(pledge_total.value);
	if(num<2) num=2;
	if(isNaN(num)) num=2;
	pledge_total.value = num;
};

function checkValidity(){
	var emailValid = document.getElementsByName("backer_email")[0].checkValidity();
	if(!emailValid){
		alert("Email address given is invalid!");
		return false;
	}
	return true;
}

////////////
// STRIPE //
////////////

var handler = StripeCheckout.configure({
	key: STRIPE_PUBLIC_KEY,
	image: "/img/icon.png",
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

	if(!checkValidity()) return;

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
	if(!checkValidity()) return;
	form.action = "/pay/coinbase";
	form.submit();
});

////////////
// PAYPAL //
////////////

document.getElementById('paypal').addEventListener('click', function(e) {
	if(!checkValidity()) return;
	form.action = "/pay/paypal";
	form.submit();
});