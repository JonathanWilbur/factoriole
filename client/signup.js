var signapp = angular.module('signupapp', []);
signapp.controller('signupform', function($scope, $http) {
  $scope.signup = function () {
    var signup = {
      username: $scope.username,
      password: $scope.password1,
      email: $scope.email,
      invite: window.location.search.replace("?invite=","")
    };
    $http.post('/users', signup).then(
      function (response) {
        $http.post('/sessions', {
          username: $scope.username,
          password: $scope.password1
        }).then(
          function (response) {
            window.location = '/add.html';
          },
          function (response) {
            alert("An error occurred while trying to sign in for the first time!");
            if (response.data.failure || response.data.error) console.error(response.data.failure || response.data.error);
          }
        )
      },
      function (response) { if (response.data.failure || response.data.error) alert(response.data.failure || response.data.error); }
    );
  };
});
//Password must be at least 12 characters, and may not contain quotes, spaces, backslashes, consecutive numbers, 321, 1488, qwerty, asdf, abc, password, meme, pepe, chat, chan, or other obvious or weak password characteristics.
