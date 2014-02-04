// Make that bar grow!
window.onload = function(){
	document.querySelector("#bar_background").style.width = (CLAIMED_RATIO*100)+"%";
};

// If you're bitcoin, it needs to have your return address.
var button = document.getElementById('cancel_pledge');
var form = document.querySelector("#cancel_pledge_form");
if(PAYMENT_METHOD=="coinbase"){

	var REFUND_STAGE = false;
	button.addEventListener('click', function(e){
		if(!REFUND_STAGE){
			button.innerHTML = "REFUND BITCOIN"
			form.style.display = "block";
			REFUND_STAGE = true;
		}else{
			form.submit();
		}
	});
	
}else{

	button.addEventListener('click', function(e) {
		form.submit();
	});

}