angular.module('loginapp', []).controller('loginform', function($scope, $http) {
  if (document.cookie.indexOf("loggedIn") != -1) window.location = '/add.html';
  $scope.login = function () {
    var credentials = {
      username: $scope.username,
      password: $scope.password
    }
    $http.post('/sessions', credentials).then(
      function (response) { window.location = '/add.html'; },
      function (response) {
        switch (response.status) {
          case 403:
            alert("Invalid credentials!");
            $scope.username = '';
            $scope.password = '';
            break;
          case 429:
            alert("You have exceeded the number of allowable authentication attempts. Your IP address will be blocked for one hour.");
            break;
        }
      }
    );
  };
});
