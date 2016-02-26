var app = angular.module('moneysnap');

app.directive('sidepanes', function() {
	return {
		restrict: 'A',
		link: function(scope, element, attrs) {

			$(document).on('click', '.sideMenuTrigger, .contentFader, .sideMenu a', function(event) {
				var animationSpeed = 100;
				if($('.contentFader').is(':visible')) {
					// $('.contentWrapper').removeClass('sidePaneActive');
					// $('.header').removeClass('sidePaneActive');
					$('.sideMenu').slideUp('fast');
					$('.contentFader').fadeOut('fast');
				} else {
					$('.contentFader').fadeIn('fast');
					// $('.contentWrapper').addClass('sidePaneActive');
					// $('.header').addClass('sidePaneActive');
					$('.sideMenu').slideDown('fast');
				}
			});

			$(document).on('click', '.searchIcon', function(event) {
				$('#search').focus();
				$('#search').effect("highlight", {}, 1000);
			});
			
		}  // end jQuery
	};
});

app.directive('grid', function() {
	return {
		restrict: 'A',
		link: function(scope, element, attrs) {

			initGrid();
			$(window).resize(function(event) {
				initGrid();
			});
			
		}  // end jQuery
	};
});

app.directive('contestimage', function() {
	return {
		restrict: 'A',
		link: function(scope, element, attrs) {


			Dropzone.autoDiscover = false;
			var myDropzone = new Dropzone(".imageDropzone", {
				url: 'https://api.cloudinary.com/v1_1/dsgmrzsui/image/upload',
				dictDefaultMessage: '<i class="fa fa-cloud-upload"></i> Upload',
				maxFiles: 1
			});
			myDropzone.on('sending', function (file, xhr, formData) {
				formData.append('api_key', 796794492527728);
				formData.append('timestamp', Date.now() / 1000 | 0);
				formData.append('upload_preset', 'MoneySnap');
			});
			myDropzone.on('success', function (file, response) {
				console.log('Success! Cloudinary public ID is', response.public_id);
				scope.contest.imageID = response.public_id;
				scope.$apply();
			});
			
		}  // end jQuery
	};
});

app.directive('judgeimage', function() {
	return {
		restrict: 'A',
		link: function(scope, element, attrs) {

			Dropzone.autoDiscover = false;
			var myDropzone = new Dropzone(".judgeDropzone", {
				url: 'https://api.cloudinary.com/v1_1/dsgmrzsui/image/upload',
				dictDefaultMessage: '<i class="fa fa-cloud-upload"></i> Upload',
				maxFiles: 1
			});
			myDropzone.on('sending', function (file, xhr, formData) {
				formData.append('api_key', 796794492527728);
				formData.append('timestamp', Date.now() / 1000 | 0);
				formData.append('upload_preset', 'MoneySnap');
			});
			myDropzone.on('success', function (file, response) {
				console.log('Success! Cloudinary public ID is', response.public_id);
				scope.contest.judgeImageID = response.public_id;
				scope.$apply();
			});
			
		}  // end jQuery
	};
});

app.directive('profileimage', function() {
	return {
		restrict: 'A',
		link: function(scope, element, attrs) {

			Dropzone.autoDiscover = false;
			var myDropzone = new Dropzone('.profileDropzoneButton', {
				url: 'https://api.cloudinary.com/v1_1/dsgmrzsui/image/upload',
				dictDefaultMessage: '<i class="fa fa-picture-o"></i> Change Photo',
				uploadMultiple: false,
				thumbnailWidth: 90,
				thumbnailHeight: 90
			});
			myDropzone.on('sending', function (file, xhr, formData) {
				formData.append('api_key', 796794492527728);
				formData.append('timestamp', Date.now() / 1000 | 0);
				formData.append('upload_preset', 'MoneySnap');
			});
			myDropzone.on('success', function (file, response) {
				console.log('Success! Cloudinary public ID is', response.public_id);
				scope.user.imageID = response.public_id;
				scope.saveUserImage();
				scope.$apply();
			});
			
		}  // end jQuery
	};
});

app.directive('photoentry', function() {
	return {
		restrict: 'A',
		link: function(scope, element, attrs) {

			Dropzone.autoDiscover = false;
			var myDropzone = new Dropzone(".photoEntry", {
				url: 'https://api.cloudinary.com/v1_1/dsgmrzsui/image/upload',
				dictDefaultMessage: '<i class="fa fa-cloud-upload"></i> Upload',
				maxFiles: 1
			});
			myDropzone.on('sending', function (file, xhr, formData) {
				formData.append('api_key', 796794492527728);
				formData.append('timestamp', Date.now() / 1000 | 0);
				formData.append('upload_preset', 'MoneySnap');
			});
			myDropzone.on('success', function (file, response) {
				console.log('Success! Cloudinary public ID is', response.public_id);
				scope.entry.imageID = response.public_id;
				scope.$apply();
			});
			
		}  // end jQuery
	};
});

app.directive('datepicker', function() {
	return {
		restrict: 'A',
		link: function(scope, element, attrs) {

			$('.submissionDeadlinePicker').datepicker({
				onSelect: function(dateText) {
					scope.contest.submissionDeadline=this.value;
					scope.$apply();
				}
			});

			$('.votingDeadlinePicker').datepicker({
				onSelect: function(dateText) {
					scope.contest.votingDeadline=this.value;
					scope.$apply();
				}
			});
			
		}  // end jQuery
	};
});

app.directive('stripe', ['$log', function($log) {
  return function(scope, elem, attrs) {
  			var form =  document.createElement("form");;
  			form.action = "http://zen.ninja/stripemoney/charge.php";
  			form.method = "POST";
  			form.innerHTML = '<input type="hidden" name="chargeAmount" value="'+parseFloat(scope.awardAmount)*100+'">';
  			form.innerHTML += '<input type="hidden" name="userKey" value="'+scope.currentUserKey+'">';
  			form.innerHTML += '<input type="hidden" name="contestPage" value="'+window.location.href+'">';
  			var script =  document.createElement("script");
  			script.src = "https://checkout.stripe.com/checkout.js";
  			script.className = "stripe-button";
  			script.setAttribute("data-key", "pk_test_H4b4ozdYndmpMTQZlmG2rUiX");
  			script.setAttribute("data-image", "https://res.cloudinary.com/dsgmrzsui/image/upload/v1456101620/vjrac5azdkpsx4ppefcj.jpg");
  			script.setAttribute("data-name", "MoneySnap");
  			script.setAttribute("data-description", "Entrance Fee: $" + parseFloat(scope.awardAmount));
  			script.setAttribute("data-amount", parseFloat(scope.awardAmount)*100);
  			script.setAttribute("data-label", 'Pay Entrance Fee');
  			
  			form.appendChild(script);

  			elem.append(angular.element(form));
  };
}]);

function initGrid() {
	// Initialize Responsive Grid
	
}