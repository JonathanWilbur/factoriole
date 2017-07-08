angular.module('addpage', []).run(function ($rootScope, $http) {
  if (document.cookie.indexOf("loggedIn") == -1) window.location = '/login.html';
})
.controller('addform', function ($rootScope, $scope, $http) {
  $scope.clear = function () {
    if (confirm("Are you sure you want to clear everything on this form away?")) {
      $scope.fact = "";
      $scope.details = "";
      $scope.related1 = "";
      $scope.related2 = "";
      $scope.related3 = "";
      $scope.related4 = "";
      $scope.tag1 = "";
      $scope.tag2 = "";
      $scope.tag3 = "";
      $scope.tag4 = "";
      $scope.hashtag1 = "";
      $scope.hashtag2 = "";
      $scope.hashtag3 = "";
      $scope.hashtag4 = "";
      $scope.source1 = "";
      $scope.source2 = "";
      $scope.source3 = "";
      $scope.source4 = "";
    }
  };
  $scope.submit = function () {
    var fact = {
      fact: $scope.fact,
      details: $scope.details,
      related: [ $scope.related1, $scope.related2, $scope.related3, $scope.related4 ],
      tags: [ $scope.tag1, $scope.tag2, $scope.tag3, $scope.tag4 ],
      hashtags: [ $scope.hashtag1, $scope.hashtag2, $scope.hashtag3, $scope.hashtag4 ],
      sources: [
        {
          citationMLA: $scope.source1
        }
      ]
    };

    if ($scope.source2) fact.sources[1].citationMLA = $scope.source2;
    if ($scope.source2) fact.sources[2].citationMLA = $scope.source3;
    if ($scope.source2) fact.sources[3].citationMLA = $scope.source4;

    $http.post('/facts', fact).then(
      function (response) {
        alert("Fact created with ID: " + response.data.id);
        window.location = '/add.html';
      },
      function (response) {
        alert(response.status + ": " + response.data);
      }
    );
  };
});
