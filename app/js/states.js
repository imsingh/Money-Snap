// STATE ROUTING
var app = angular.module('moneysnap');
app.config(function($stateProvider, $urlRouterProvider) {

// For any unmatched url, redirect to /state1
$urlRouterProvider.otherwise("/");

$stateProvider
  .state('/', {
    url: "/",
    scope: true,
    templateUrl: "views/home.html"
  })
  .state('contest', {
    abstract: true,
    template: '<ui-view/>'
  })
  .state('contest.contestID', {
    url: "/contest/:contestID",
    scope: true,
    sticky: true,
    templateUrl: "views/contest.html"
  })
  .state('photo', {
    abstract: true,
    template: '<ui-view></ui-view>'
  })
  .state('photo.entryID', {
    url: "/photo/:entryID",
    scope: true,
    templateUrl: "views/photo.html"
  })
  .state('profile', {
    url: "/profile",
    scope: true,
    templateUrl: "views/profile.html"
  })
  .state('profile.userID', {
    url: "/:userID",
    scope: true,
    templateUrl: "views/profile.html"
  })
  .state('notifications', {
    url: "/notifications",
    scope: true,
    templateUrl: "views/notifications.html"
  })
  .state('login', {
    url: "/login",
    scope: true,
    templateUrl: "views/login.html"
  })
  .state('create-contest', {
    url: "/create-contest",
    scope: true,
    templateUrl: "views/create-contest.html"
  })
  .state('edit', {
    abstract: true,
    template: '<ui-view></ui-view>'
  })
  .state('edit.contestID', {
    url: "/edit/:contestID",
    scope: true,
    templateUrl: "views/create-contest.html"
  })
  .state('edit-entry', {
    abstract: true,
    template: '<ui-view></ui-view>'
  })
  .state('edit-entry.entryID', {
    url: "/edit-entry/:entryID",
    scope: true,
    templateUrl: "views/edit-entry.html"
  })
  .state('submit', {
    abstract: true,
    template: '<ui-view></ui-view>'
  })
  .state('submit.contestID', {
    url: "/submit/:contestID",
    scope: true,
    templateUrl: "views/submit.html"
  })
  .state('find', {
    url: "/find",
    scope: true,
    templateUrl: "views/findusers.html"
  })
  .state('invite', {
    abstract: true,
    template: '<ui-view></ui-view>'
  })
  .state('invite.contestID', {
    url: "/invite/:contestID",
    scope: true,
    templateUrl: "views/invite.html"
  })
  .state('reports', {
    url: "/reports",
    scope: true,
    templateUrl: "views/reports.html"
  })
  .state('more', {
    url: "/more",
    scope: true,
    templateUrl: "views/more.html"
  })
  .state('feed', {
    url: "/feed",
    scope: true,
    templateUrl: "views/feed.html"
  })
  .state('following', {
    abstract: true,
    template: '<ui-view></ui-view>'
  })
  .state('following.userID', {
    url: "/following/:userID",
    scope: true,
    templateUrl: "views/following.html"
  })
  .state('followers', {
    abstract: true,
    template: '<ui-view></ui-view>'
  })
  .state('followers.userID', {
    url: "/followers/:userID",
    scope: true,
    templateUrl: "views/followers.html"
  })
  .state('likes', {
    abstract: true,
    template: '<ui-view></ui-view>'
  })
  .state('likes.entryID', {
    url: "/likes/:entryID",
    scope: true,
    templateUrl: "views/likes.html"
  })
  .state('votes', {
    abstract: true,
    template: '<ui-view></ui-view>'
  })
  .state('votes.entryID', {
    url: "/votes/:entryID",
    scope: true,
    templateUrl: "views/votes.html"
  })
  .state('contestsWon', {
    abstract: true,
    template: '<ui-view></ui-view>'
  })
  .state('contestsWon.userID', {
    url: "/contestsWon/:userID",
    scope: true,
    templateUrl: "views/contestsWon.html"
  })
  .state('change-password', {
    url: "/change-password",
    scope: true,
    templateUrl: "views/change-password.html"
  })
  ;

});