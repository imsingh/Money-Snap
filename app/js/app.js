$(document).foundation();

var app = angular.module('moneysnap', ['ui.router', 'firebase', 'ngAnimate', 'ngSanitize', 'service.push']);
var firebaseURL = 'https://moneysnap.firebaseio.com/';

// Adding Push Notification to App
app.run(function($cordovaPushwoosh) {
  document.addEventListener('deviceready', function () {
    console.log("App.run is Called");
    $cordovaPushwoosh.initPushwoosh().then(function(status){
    	console.log("Device is registered!");
    });

    document.addEventListener('push-notification', function(event) {
      alert("Push Notification Received");
    });

  });
})

app.controller('main', function($scope, $firebaseArray, $firebaseObject, $firebaseAuth, $state, $timeout, $window,$cordovaPushwoosh) {
	// Debug Coding
	console.log("Main Running");
	function onDeviceReady() {
		console.log("Device Ready is Called");
	    $cordovaPushwoosh.initPushwoosh().then(function(status){
	    	console.log("Device is registered!");
	    });

	    document.addEventListener('push-notification', function(event) {
	      alert("Push Notification Received");
	    });
	}

	document.addEventListener("deviceready", onDeviceReady, false);
	    

	var firebase = new Firebase(firebaseURL);
	$scope.test = 'Angular is active';

	$scope.firebaseUser = $firebaseAuth(firebase).$getAuth();
	$firebaseAuth(firebase).$onAuth(function() {
		$scope.firebaseUser = $firebaseAuth(firebase).$getAuth();
	});

	// FIREBASE DATA
	$scope.contestsRef = firebase.child('Contests');
	$scope.contests = $firebaseArray($scope.contestsRef);
	$scope.contestsRef.on('value', function(contests) {
		contests.forEach(function(contest) {
			
		});
	});
	$scope.prizesRef = firebase.child('Prizes');
	$scope.prizes = $firebaseArray($scope.prizesRef);
	$scope.usersRef = firebase.child('Users');
	$scope.users = $firebaseArray($scope.usersRef);
	$scope.notificationsRef = firebase.child('Notifications');
	$scope.notifications = $firebaseArray($scope.notificationsRef);
	$scope.notificationsRef.on('value', function(notifications) {
		$scope.countNotifications();
	});
	$scope.entriesRef = firebase.child('Entries');
	$scope.entriesRef.once('value', function(entries) {
		entries.forEach(function(entry) {
			$scope.setNumLikes(entry.key());
		});
	}); 
	$scope.entriesRef.on('value', function(entries) {
		$scope.setTotalSubmissions();
		$scope.entriesInContest = 0;
	});
	$scope.entries = $firebaseArray($scope.entriesRef);
	$scope.likesRef = firebase.child('Likes');
	$scope.likes = $firebaseArray($scope.likesRef);
	$scope.votesRef = firebase.child('Votes'); 
	$scope.votes = $firebaseArray($scope.votesRef);
	$scope.followsRef = firebase.child('Follows');
	$scope.follows = $firebaseArray($scope.followsRef);
	$scope.paymentsRef = firebase.child('Payments');
	$scope.payments = $firebaseArray($scope.paymentsRef);
	// END FIREBASE DATA

	// VIEW LOADED
	$scope.$on('$viewContentLoaded', function(event){ 
		if($scope.firebaseUser) {

		} else {
			$state.go('login');
		}
	});
	$scope.$on('$stateChangeSuccess', function(event){
		$timeout(function(event) {

			clearInterval($scope.submissionDeadlineCounter);
			clearInterval($scope.votingDeadlineCounter);

			$scope.reportFilter = {votingOver:true};

			// INITIALIZE PAGE LANDINGS
			$('html, body').animate({scrollTop: $("#topScreen").offset().top}, 100); 
			if($state.current.name == 'create-contest') {
				$('#firstInput').focus();
				$('#firstInput').effect('highlight', {}, 1000);
			}
			$scope.stateParams = $state.params;

			$scope.birthDays = function () {
			  var year = parseInt($scope.newUser.birthYear, 10);
			  var month = parseInt($scope.newUser.birthMonth, 10);
			  var num = new Date(year, month + 1, 0).getDate();
			  var i;
			  var days = [];
			  for (i = 1; i <= num; i++) {days.push(String(i)); }
			  return days;
			};

			// FETCH DATA
			if($state.params.contestID) {
				$scope.contest = $firebaseObject(firebase.child('Contests').child($state.params.contestID));
				$scope.numEntries($scope.firebaseUser.uid, $state.params.contestID);
			}
			if($state.params.entryID) {
				$scope.syncPhotoPage();
			}
			if($state.current.name == 'submit.contestID') {
				$scope.entry = {};
			}
			if($state.current.name == 'create-contest') {
				$scope.contest = {};
				$scope.contest.entriesPerPerson = 1;
				$scope.contest.votesPerPerson = 1;
				$scope.contest.submissionDeadline = $scope.oneWeekFromNow();
				$scope.contest.votingDeadline = $scope.twoWeeksFromNow();
				$scope.contest.contestType = $scope.contestTypes[0].name;
				$scope.contest.entranceFee = 1;
			}
			if($state.current.name == 'contest.contestID') {
				$scope.setTotalUserVotes();
				$scope.hasUserVoted();
				$scope.setTimers();
				$scope.setPhase();
			}
			if($state.params.userID) {
				firebase.child('Users').orderByChild('userID').equalTo($state.params.userID).on('value', function(users) {
					users.forEach(function(user) {
						$scope.user = user.val();
						$scope.userKey = user.key();
					});
				});
				$scope.setFollowing();
				$scope.countFollowers();
				$scope.countFollowing();
			}

			if($scope.firebaseUser) {
				firebase.child('Users').orderByChild('userID').equalTo($scope.firebaseUser.uid).on('value', function(users) {
					users.forEach(function(user) {
						$scope.currentUser = user.val();
						$scope.currentUserKey = user.key();
					});
				});
			}
		}); // Timeout finished
	});
	// VIEW FINISHED LOADING

	$scope.setContestPhase = function(contest) {
		if(contest) {
			var now = new Date();
				now = Date.parse(now);
			if(Date.parse(contest.submissionDeadline) < now) {
				$scope.contestsRef.child(contest.$id).update({
					submissionsOver:true
				});
			} else {
				$scope.contestsRef.child(contest.$id).update({
					submissionsOver:false
				});
			}

			if(Date.parse(contest.votingDeadline) < now) {
				$scope.contestsRef.child(contest.$id).update({
					votingOver:true
				});
			} else {
				$scope.contestsRef.child(contest.$id).update({
					votingOver:false
				});
			}
			$scope.setContestEntriesCount(contest);
		}
	}
	$scope.smoothScroll = function(area) {
		$('html, body').animate({scrollTop: $(area).offset().top}, 300); 
	}
	$scope.setHasWinners = function(contest) {
		if(contest) {
			$scope.contestsRef.child(contest.$id).update({
				hasWinners: true
			});
		}
	}

	$scope.awardPayment = function(userID, prize, entry) {
		$scope.prizesRef.child(prize.$id).update({
			paidUser: userID,
			paidEntry: entry.$id
		});
		$scope.notificationsRef.push({
			sourceUser:$scope.firebaseUser.uid,
			targetUser: entry.userID,
			entryID: entry.$id,
			contestID: entry.contestID,
			action:'Awarded'
		});
	}
	$scope.awardPotPayment = function(userID, award, entry) {
		$scope.prizesRef.push({
			paidUser: userID,
			paidEntry: entry.$id,
			amount: award,
			contestID: entry.contestID
		});
		$scope.notificationsRef.push({
			sourceUser:$scope.firebaseUser.uid,
			targetUser: entry.userID,
			entryID: entry.$id,
			contestID: entry.contestID,
			action:'Awarded'
		});
	}

	$scope.saveUser = function() {
		$scope.usersRef.child($scope.userKey).update({
			description:$scope.user.description
		});
	}
	$scope.refresh = function() {
		$window.location.reload();
	}
	$scope.hasUserVoted = function() {
		$scope.votesRef.on('value', function(votes) {
			$scope.userVotedInContest = false;
			votes.forEach(function(vote) {
				if(vote.val().userID == $scope.currentUser.userID && vote.val().contestID == $scope.contest.$id) {
					$scope.userVotedInContest = true;
				}
			});
		});
	}
	$scope.setPhase = function() {
		$scope.contestsRef.on('value', function(contests) {
			$scope.submissionPhase = false;
			$scope.votingPhase = false;
			contests.forEach(function(contest) {
				if(contest.key() == $state.params.contestID) {
					var now = new Date();
						now = Date.parse(now);
					if(Date.parse(contest.val().submissionDeadline) > now) {
						$scope.submissionPhase = true;
					}
					if(Date.parse(contest.val().votingDeadline) > now && Date.parse(contest.val().submissionDeadline) < now) {
						$scope.votingPhase = true;
					}
				}
			});
		});
	}
	$scope.oneWeekFromNow = function() {
		var now = new Date();
        var nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

		var dateMsg = (nextWeek.getMonth()+1) + '/' + nextWeek.getDate() + '/' + nextWeek.getFullYear();

		return dateMsg;
	}
	$scope.twoWeeksFromNow = function() {
		var now = new Date();
		var twoWeeks = new Date();
		twoWeeks.setDate(now.getDate() + 14);
		var dateMsg = (twoWeeks.getMonth()+1) + '/' + twoWeeks.getDate() + '/' + twoWeeks.getFullYear();

		return dateMsg;
	}

	$scope.markAllNotificationsAsRead = function() {
		$scope.notificationsRef.on('value', function(notifications) {
			notifications.forEach(function(notification) {

				if(notification.val().targetUser == $scope.currentUser.userID) {
					$scope.notificationsRef.child(notification.key()).update({
						read:true
					});
				}

			});
		});
	}

	// USER MANAGEMENT

	$scope.newUser = {};
	$scope.registerUser = function() {
		firebase.createUser({
		  email    : $scope.newUser.email,
		  password : $scope.newUser.password
		}, function(error, userData) {
		  if (error) {
		  } else {
		    firebase.child('Users').push({
		    	name:$scope.newUser.name,
		    	email: $scope.newUser.email,
		    	userID: userData.uid
		    });
		    $scope.user = $scope.newUser;
		    $scope.loginUser();
		  }
		});
	}

	$scope.forgotPassword = function() {
		firebase.resetPassword({
		  email: $scope.user.email
		}, function(error) {
		  if (error) {
		    switch (error.code) {
		      case "INVALID_USER":
		        $scope.passwordMessage = "The specified user account does not exist.";
		        break;
		      default:
		        $scope.passwordMessage = "Error resetting password:" + error;
		    }
		  } else {
		    $scope.passwordMessage = "Password reset email sent successfully!";
		  }
		  $scope.$apply();
		});
	}

	$scope.changePass = {};
	$scope.changePassword = function() {
		firebase.changePassword({
		  email: $scope.currentUser.email,
		  oldPassword: $scope.changePass.oldPassword,
		  newPassword: $scope.changePass.newPassword
		}, function(error) {
		  if (error) {
		    switch (error.code) {
		      case "INVALID_PASSWORD":
		        $scope.changePass.passwordMessage = "The specified user account password is incorrect.";
		        break;
		      case "INVALID_USER":
		        $scope.changePass.passwordMessage = "The specified user account does not exist.";
		        break;
		      default:
		        $scope.changePass.passwordMessage = "Error changing password:" + error;
		    }
		  } else {
		    $scope.passwordMessage = "User password changed successfully!";
		  }
		  $scope.$apply();
		});
	}

	$scope.user = {};
	$scope.loginUser = function() {
		firebase.authWithPassword({
		  email    : $scope.user.email,
		  password : $scope.user.password
		}, function(error, authData) {
		  if (error) {
		  	$scope.loginError = error.message;
		  	$scope.$apply();
		  } else {
		  	$state.go('/');
		  }
		});
	}
	$scope.logout = function() {
		firebase.unauth();
		$state.go('login');
	}

	// END USER MANAGEMENT

	$scope.setContestEntriesCount = function(contest) {
		if(contest) {
			$scope.contestEntries = 0;
			$scope.entriesRef.once('value', function(entries){entries.forEach(function(entry) {
				if(contest.$id == entry.val().contestID) {
					$scope.contestEntries += 1;
				}
			})
				$scope.contestsRef.child(contest.$id).update({
					numEntries:$scope.contestEntries
				});
			});
		}
	}
	$scope.saveUserImage = function() {
		firebase.child('Users').orderByChild('userID').equalTo($scope.firebaseUser.uid).once('value', function(users) {
			users.forEach(function(user) {
				firebase.child('Users').child(user.key()).update({
					imageID:$scope.user.imageID
				});
			});
		});
	}
	$scope.setTotalUserVotes = function() {
		$scope.votesRef.on('value', function(votes) {
			$scope.totalUserVotes = 0;
			votes.forEach(function(vote) {
				if(vote.val().userID == $scope.currentUser.userID && vote.val().contestID == $scope.contest.$id) {
					$scope.totalUserVotes += 1;
				}
			});
		});
	}
	$scope.setProfile = function() {
		$scope.$watch('user', function(){
			if($scope.user.userID) {
				// COUNT NUMBER OF CONTESTS WON
				$scope.prizesRef.on('value',function(prizes) {
					$scope.totalContestsWon = 0;
					$scope.totalMoneyEarned = 0;
					prizes.forEach(function(prize) {
						if(prize.val().paidUser == $scope.user.userID) {
							$scope.totalContestsWon += 1;
							$scope.totalMoneyEarned += parseFloat(prize.val().amount);
						}
					});
				});
			}
		});
	}

	$scope.setTimers = function() {
		$scope.contestsRef.once('value', function(contests) {
			contests.forEach(function(contest) {
				if(contest.key() == $state.params.contestID) {
					$scope.submissionDeadlineCounter = {};
					$scope.votingDeadlineCounter = {};
					CountDownTimer(contest.val().submissionDeadline + ' 12:00 AM', 'submissionDeadlineCounter', $scope.submissionDeadlineCounter);
					CountDownTimer(contest.val().votingDeadline +  ' 12:00 AM', 'votingDeadlineCounter', $scope.votingDeadlineCounter);
				}
			});
		});
	}
	$scope.setCurrentPage = function(page) {
		$scope.usersRef.child($scope.currentUserKey).update({
			'currentPage':page
		});
	}
	$scope.setContestFilter = function(filter, label) {
		$scope.usersRef.child($scope.currentUserKey).update({
			contestFilter:filter,
			contestFilterLabel: label
		});
	}
	$scope.countFollowers = function() {
		$scope.followsRef.on('value', function(follows) {
			$scope.followers = 0;
			follows.forEach(function(follow) {
				if(follow.val().following == $scope.user.userID) {
					$scope.followers+=1;
				}
			});
		});
	}
	$scope.countFollowing = function() {
		$scope.followsRef.on('value', function(follows) {
			$scope.numFollowing = 0;
			follows.forEach(function(follow) {
				if(follow.val().follower == $scope.user.userID) {
					$scope.numFollowing+=1;
				}
			});
		});
	}
	$scope.follow = function() {
		$scope.followsRef.push({
			follower:$scope.currentUser.userID,
			following: $scope.user.userID
		});
		$scope.notificationsRef.push({
			sourceUser:$scope.firebaseUser.uid,
			targetUser: $scope.user.userID,
			action:'Followed'
		});
	}
	$scope.unfollow = function() {
		$scope.followsRef.once('value', function(follows) {
			follows.forEach(function(follow) {
				if(follow.val().follower == $scope.currentUser.userID && follow.val().following == $scope.user.userID) {
					$scope.followsRef.child(follow.key()).remove();
				}
			});
		});
	}
	$scope.setFollowing = function() {
		$scope.followsRef.on('value', function(follows) {
			$scope.following = false;
			follows.forEach(function(follow) {
				if(follow.val().follower == $scope.currentUser.userID && follow.val().following == $scope.user.userID) {
					$scope.following = true;
					return true;
				}
			});
		});
	}
	$scope.setTotalSubmissions = function() {
		if($scope.firebaseUser) {
			firebase.child('Users').orderByChild('userID').equalTo($scope.firebaseUser.uid).once('value', function(users) {
				users.forEach(function(user) {
					$scope.entriesRef.orderByChild('userID').equalTo($scope.firebaseUser.uid).once('value', function(entries) {
						$scope.totalSubmissions = 0;
						entries.forEach(function(entry) {
							$scope.totalSubmissions += 1;
						});
					});
					firebase.child('Users').child(user.key()).update({
						totalSubmissions:$scope.totalSubmissions
					});
				});
			});	
		}
	}
	$scope.createContest = function(contest) {
		$scope.contest.userID = $scope.currentUser.userID;
		var createdContest = firebase.child('Contests').push(contest);
		var createdContestID = $firebaseObject(createdContest).$id;
		$scope.contest = {};
		$state.go('edit.contestID', {contestID:createdContestID});
	}
	$scope.votedFor = function(entry) {
		return true;
	}
	$scope.syncPhotoPage = function() {
		$scope.entryRef = firebase.child('Entries').child($state.params.entryID);
		$scope.entry = $firebaseObject($scope.entryRef);
		$scope.setContest();
		$scope.setUserLike($state.params.entryID, $scope.firebaseUser.uid);
		$scope.setNumLikes($state.params.entryID);
		$scope.setUserVote($state.params.entryID, $scope.firebaseUser.uid);
		$scope.setNumVotes($state.params.entryID);
		$scope.entry = $firebaseObject(firebase.child('Entries').child($state.params.entryID));
	}
	$scope.like = function(entry) {
		$scope.likesRef.push({
			userID:$scope.firebaseUser.uid,
			entryID: entry.$id
		});
		$scope.notificationsRef.push({
			sourceUser:$scope.firebaseUser.uid,
			targetUser: $scope.entry.userID,
			entryID: entry.$id,
			contestID: entry.contestID,
			action:'Liked'
		});
	}
	$scope.invite = function(userID, contestID) {
		$scope.notificationsRef.push({
			sourceUser:$scope.firebaseUser.uid,
			targetUser: userID,
			contestID: contestID,
			action:'Invited'
		});
	}
	$scope.unlike = function(entry) {
		$scope.likesRef.once('value', function(snap) {
			snap.forEach(function(like) {
				if(like.val().entryID == entry.$id && like.val().userID == $scope.firebaseUser.uid) {
					firebase.child('Likes').child(like.key()).remove();
				}
			});
		});
	}
	$scope.markRead = function(notification) {
		$scope.notificationsRef.child(notification.$id).update({
			'read':true
		});
	}
	$scope.vote = function(entry) {
		$scope.votesRef.push({
			userID:$scope.firebaseUser.uid,
			entryID: entry.$id,
			contestID: entry.contestID
		});
		$scope.notificationsRef.push({
			sourceUser:$scope.firebaseUser.uid,
			targetUser: $scope.entry.userID,
			entryID: entry.$id,
			contestID: entry.contestID,
			action:'Voted'
		});
	}
	$scope.countNotifications = function() {
		if($scope.firebaseUser) {
			$scope.notificationsRef.once('value', function(notifications) {
				$scope.unreadNotifications = 0;
				notifications.forEach(function(notification) {
					if(notification.val().targetUser == $scope.currentUser.userID && !notification.val().read && notification.val().sourceUser != $scope.currentUser.userID) {
						$scope.unreadNotifications += 1;
					}
				});
			});
		}
	}
	$scope.unvote = function(entry) {
		$scope.votesRef.once('value', function(snap) {
			snap.forEach(function(vote) {
				if(vote.val().entryID == entry.$id && vote.val().userID == $scope.firebaseUser.uid) {
					firebase.child('Votes').child(vote.key()).remove();
				}
			});
		});
	}
	$scope.setContest = function() {
		$scope.entryRef.once('value', function(snap) {
			$scope.contestRef = firebase.child('Contests').child(snap.val().contestID);
			$scope.contest = $firebaseObject($scope.contestRef);

			$scope.contestRef.on('value', function(contest) {

				if(contest) {
					// Set how many votes the user has left in the contest
					$scope.votesRef.on('value', function(snap) {
						$scope.votesInContest = 0;
						snap.forEach(function(vote) {
							if(vote.val().contestID == contest.key() && vote.val().userID == $scope.firebaseUser.uid) {
								$scope.votesInContest += 1;
							}
						});
						$scope.votesLeft = contest.val().votesPerPerson - $scope.votesInContest;
					});
				}

				// Set total number of entries
				$scope.entriesRef.on('value', function(snap) {
					$scope.totalEntries = 0;
					snap.forEach(function(entry) {
						if(entry.val().contestID == contest.key()) {
							$scope.totalEntries += 1;
						}
					});
				});

			});

		});
	}

	$scope.buyCredits = function(amount) {
		var totalCredits = 0;
		if($scope.currentUser.credits) {
			totalCredits = parseFloat($scope.currentUser.credits) + parseFloat(amount);
		} else {
			totalCredits = amount;
		}
		$scope.usersRef.once('value', function(users) {
			users.forEach(function(user) {
				if(user.val().userID == $scope.currentUser.userID) {
					$scope.usersRef.child(user.key()).update({
						credits: totalCredits
					});
					$scope.justPaid = true;
				}
			});
		});
	}

	// DETECT USER LIKE
	$scope.setUserLike = function(entryID, userID) {
		$scope.likesRef.on('value', function(snap) {
			$scope.userLikes = false;
			snap.forEach(function(like) {
				if(like.val().entryID == entryID && like.val().userID == userID) {
					$scope.userLikes = true;
				}
			});
		});
	}

	$scope.setNumLikes = function(entryID) {
		$scope.likesRef.on('value', function(snap) {
			$scope.numLikes = 0;
			snap.forEach(function(like) {
				if(like.val().entryID == entryID) {
					$scope.numLikes += 1;
				}
			});
			$scope.entriesRef.child(entryID).update({
				numLikes:$scope.numLikes
			});
		});
		return $scope.numLikes;
	}

	$scope.setUserVote = function(entryID, userID) {
		$scope.votesRef.on('value', function(snap) {
			$scope.userVote = false;
			snap.forEach(function(vote) {
				if(vote.val().entryID == entryID && vote.val().userID == userID) {
					$scope.userVote = true;
				}
			});
		});
	}

	$scope.setNumVotes = function(entryID) {
		if(entryID) {
			$scope.votesRef.on('value', function(snap) {
				$scope.numVotes = 0;
				snap.forEach(function(vote) {
					if(vote.val().entryID == entryID) {
						$scope.numVotes += 1;
					}
				});
				$scope.entriesRef.child(entryID).update({
					numVotes:$scope.numVotes
				});
			});
		}
	}

	$scope.go = function(page, parameters) {
		$state.go(page, parameters);
	}

	$scope.setRank = function(entryID, rank) {
		$scope.entriesRef.child(entryID).update({rank:rank});
	}

	$scope.addPrize = function() {
		var createdPrize = firebase.child('Prizes').push({contestID:$state.params.contestID});
		var createdPrizeID = $firebaseObject(createdPrize).$id;
		$('.'+createdPrizeID).find('.prizeLabel').focus();
		$('.'+createdPrizeID).find('.prizeLabel').effect('highlight', {}, 1000);
	}
	$scope.entry = {};
	$scope.submitEntry = function() {
		$scope.entry.contestID = $state.params.contestID;
		$scope.entry.userID = $scope.firebaseUser.uid;
		$scope.entry.numLikes = 0;
		$scope.entry.numVotes = 0;
		$scope.entry.date = new Date();
		var createdEntry = firebase.child('Entries').push($scope.entry);
		var createdEntryID = $firebaseObject(createdEntry).$id;

		// Deduct entrance fee from users balance
		$scope.usersRef.once('value', function(users){users.forEach(function(user) {
			if(user.val().userID == $scope.entry.userID) {
				var totalCredits = 0;
				if(user.val().credits) {
					totalCredits = parseFloat(user.val().credits) - parseFloat($scope.contest.entranceFee);
				} else {
					totalCredits -= parseFloat($scope.contest.entranceFee);
				}
				$scope.usersRef.child(user.key()).update({
					credits:totalCredits
				});
			}
		})});

		// Notify the contest creator that someone has submitted an entry to their contest
		$scope.notificationsRef.push({
			sourceUser:$scope.firebaseUser.uid,
			targetUser:$scope.contest.userID,
			entryID: createdEntryID,
			contestID: $scope.entry.contestID,
			action:'Entered'
		});

		// Add money to the contest pot
		$scope.contestsRef.once('value', function(contests){contests.forEach(function(contest) {
			if(contest.key() == $scope.entry.contestID) {
				console.log(contest.val().entranceFee, 'Updating Contest');
				var potSize = 0;
				if(contest.val().potSize) {
					potSize = contest.val().potSize + contest.val().entranceFee;
				} else {
					potSize += contest.val().entranceFee;
				}
				$scope.contestsRef.child(contest.key()).update({
					potSize: potSize
				});
			}
		})});

		$scope.entry = {};
		$state.go('photo.entryID', {entryID:createdEntryID});

		
	}
	$scope.getPrize = function(id) {
		if(id) {
			var object = $firebaseObject(firebase.child('Prizes').child(id));
			return object;
		}
	}
	$scope.numEntries = function(userID, contestID) {
		if(userID && contestID) {
			$scope.entriesRef.orderByChild('contestID').equalTo(contestID).on('value', function(entries) {
				$scope.submissions = 0;
				entries.forEach(function(entry) {
					if(entry.val().userID == userID) {
						$scope.submissions +=1;
					}
				});
			});

			return $scope.submissions;
		} else {
			return 0;
		}
	}

	$scope.hasContestsMade = false;
	$scope.setContestsMade = function() {
		$scope.hasContestsMade = true;
	}
	$scope.hasVotes = false;
	$scope.setHasVotes = function() {
		$scope.hasVotes = true;
	}
	$scope.hasParticipatingContests = false;
	$scope.setParticipatingContests = function() {
		$scope.hasParticipatingContests = true;
	}

	$scope.contestTypes = [
		{
			name: 'Specific Judge'
		},
		{
			name: 'Contest Members Only'
		}
	];
});

app.filter('unique', function() {
   return function(collection, keyname) {
      var output = [], 
          keys = [];

      angular.forEach(collection, function(item) {
          var key = item[keyname];
          if(keys.indexOf(key) === -1) {
              keys.push(key);
              output.push(item);
          }
      });

      return output;
   };
});

app.directive('laterThan', laterThan);
function laterThan($parse) {
    return {
        restrict: 'A',
        require : 'ngModel',
        link: function(scope, element, attrs, ngModel) {    
            var validator = function(date) {
                var laterThan = $parse(attrs.laterThan)(scope);
                if(!date || !laterThan) return;
                var valid = (date > laterThan);
                ngModel.$setValidity('laterThan', valid);
                return date;
            };
            ngModel.$parsers.push(validator);
        }   
    };
}


function dynamicSort(property) {
    var sortOrder = 1;
    if(property[0] === "-") {
        sortOrder = -1;
        property = property.substr(1);
    }
    return function (a,b) {
        var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
        return result * sortOrder;
    }
}