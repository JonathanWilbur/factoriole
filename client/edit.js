angular.module('editpage', []).run(function ($rootScope, $http) {
  if (document.cookie.indexOf("loggedIn") == -1) window.location = '/login.html';
})
.controller('editform', function ($rootScope, $scope, $http) {
  $http.get('/facts/' + window.location.search.replace("?id=","")).then(
    function (response) {
      $scope.fact = response.data.fact;
      $scope.details = response.data.details;
      $scope.related1 = response.data.related[0];
      $scope.related2 = response.data.related[1];
      $scope.related3 = response.data.related[2];
      $scope.related4 = response.data.related[3];
      $scope.tag1 = response.data.tags[0];
      $scope.tag2 = response.data.tags[1];
      $scope.tag3 = response.data.tags[2];
      $scope.tag4 = response.data.tags[3];
      $scope.hashtag1 = response.data.hashtags[0];
      $scope.hashtag2 = response.data.hashtags[1];
      $scope.hashtag3 = response.data.hashtags[2];
      $scope.hashtag4 = response.data.hashtags[3];
      $scope.source1 = response.data.sources[0].citationMLA;
      $scope.source2 = response.data.sources[1].citationMLA;
      $scope.source3 = response.data.sources[2].citationMLA;
      $scope.source4 = response.data.sources[3].citationMLA;
    },
    function (response) {
      alert(response.status + ": " + response.data.error || response.data.failure);
    }
  );
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

    $http.patch('/facts/' + window.location.search.replace("?id=",""), fact).then(
      function (response) {
        alert("Fact updated successfully.");
        window.location = '/fact/' + window.location.search.replace("?id=","");
      },
      function (response) {
        alert(response.status + ": " + response.data.error || response.data.failure);
      }
    );
  };
  $scope.cancel = function () {
    window.location = '/index.html';
  }
});
