angular.module('ang', []).run(function($rootScope, $http) {
  $rootScope.complete = false;
  $rootScope.success = false;
  $rootScope.invite = "";
  $http.post('/invites').then(
    function (response) {
      $rootScope.complete = true;
      $rootScope.success = true;
      $rootScope.invite = response.data.invite;
    },
    function (response) {
      $rootScope.complete = true;
      $rootScope.success = false;
    }
  );
});
