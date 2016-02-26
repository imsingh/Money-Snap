var app = angular.module('moneysnap');
app.directive('contestitem', function() {
    return {
        restrict: 'E',
        templateUrl: 'directives/contestitem.html',
        scope: true
    };
});
app.directive('profileentry', function() {
    return {
        restrict: 'E',
        templateUrl: 'directives/profileentry.html',
        scope: true
    };
});
app.directive('editentry', function() {
    return {
        restrict: 'E',
        templateUrl: 'directives/editentry.html',
        scope: true
    };
});
app.directive('contestreport', function() {
    return {
        restrict: 'E',
        templateUrl: 'directives/contestreport.html',
        scope: true
    };
});
app.directive('terms', function() {
    return {
        restrict: 'E',
        templateUrl: 'directives/terms.html',
        scope: true
    };
});
app.directive('stripebutton', function() {
    return {
        restrict: 'E',
        templateUrl: 'directives/stripebutton.html',
        scope: true
    };
});