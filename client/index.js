angular.module('factoriole', []).run(function ($rootScope, $http) {
  $rootScope.page = "intro";
})
.controller('tagcloud', function ($rootScope, $scope, $http) {
  $scope.tags = [];
  $http.get('/tags/top').then(
    function (response) { $scope.tags = response.data; },
    function (response) { alert(response.data.failure || response.data.error); }
  );
  $scope.searchTag = function (t) {
    $rootScope.page = "tag";
    $http.get('/facts?tags=' + t).then(
      function (response) { $rootScope.nofacts = false; $rootScope.facts = response.data; },
      function (response) {
        if (response.status == 404) {
          $rootScope.facts = [];
          $rootScope.nofacts = true;
        } else {
          alert(response.data.failure || response.data.error);
        }
      }
    )
  };
})
.controller('navbar', function ($rootScope, $scope, $http) {
  $scope.showAbout = function () { $rootScope.page = "about"; $rootScope.showFacts = false; };
  $scope.showContact = function () { $rootScope.page = "contact"; $rootScope.showFacts = false; };
  $scope.showReadingList = function () { $rootScope.page = "readingList"; $rootScope.showFacts = false; };
  $scope.showRecent = function () {
    $rootScope.page = "recent";
    $rootScope.showFacts = true;
    $http.get('/facts/recent?limit=25').then(
      function (response) { $rootScope.facts = response.data; },
      function (response) { alert(response.data.failure || response.data.error); }
    );
  };
  $scope.showRandom = function () {
    $rootScope.page = "random";
    $rootScope.showFacts = true;
    $http.get('/facts/random?limit=25').then(
      function (response) { $rootScope.facts = response.data; },
      function (response) { alert(response.data.failure || response.data.error); }
    );
  };
})
.controller('searchbar', function ($rootScope, $scope, $http) {
  $scope.searchQuery = "";
  $scope.search = function (query) {
    if ($scope.searchQuery.length > 3) {
      $rootScope.page = "search";
      $rootScope.showFacts = true;
      $http.get('/facts?text=' + encodeURIComponent($scope.searchQuery)).then(
        function (response) { $rootScope.nofacts = false; $rootScope.facts = response.data; },
        function (response) {
          if (response.status == 404) {
            $rootScope.facts = [];
            $rootScope.nofacts = true;
          } else {
            alert(response.data.failure || response.data.error);
          }
        }
      );
    }
  }
})
.controller('facts', function ($rootScope, $scope, $http) {
  $rootScope.facts = [];
  $rootScope.showFacts = true;
  $rootScope.nofacts = false;
  $http.get('/facts/recent').then(
    function (response) { $rootScope.facts = response.data; },
    function (response) { alert(response.data.failure || response.data.error); }
  );
  $scope.view = function (id) {
    window.location = '/fact/' + id;
  };
});
