var angularApp = angular.module('ngApp', [
    'ngMaterial',
    'ngMessages',
    'ngAnimate',
    'ngRoute',
    'indexCtrl'
]).config(['$locationProvider', '$routeProvider',
    function config($locationProvider, $routeProvider) {
        $routeProvider.
        when('/', {
            template: '<index></index>',
            activetab: 'index',
            activename: 'Index',
            reloadOnSearch : false
        }).
        otherwise('/');

        // sinitation hack
        angular.lowercase = angular.$$lowercase;
        // route hack
        $locationProvider.hashPrefix('');
    }
]).run(function($templateCache) {
    $templateCache.put('/templates/index.html');
}).factory('NOTES', ['$resource',
    function($resource) {
        return $resource('/notes/:id', {id: '@_id'}, {
            'query':  {method:'GET', isArray:true},
            'get':    {method:'GET'},
            'update': {method:'PUT'},
            'save':   {method:'POST'},
            'remove': {method:'DELETE'},
            'delete': {method:'DELETE'}
        });
    }
]).directive('file', function () {
    return {
        scope: {
            file: '='
        },
        link: function (scope, el, attrs) {
            el.bind('change', function (event) {
                var file = event.target.files[0];
                scope.file = file ? file : undefined;
                scope.$apply();
            });
        }
    }
}).service('scrollAndResizeListener', function($window, $document, $timeout) {
    var id = 0,
        listeners = {},
        scrollTimeoutId,
        resizeTimeoutId;

    function invokeListeners() {
        var clientHeight = $document[0].documentElement.clientHeight,
            clientWidth = $document[0].documentElement.clientWidth;

        for (var key in listeners) {
            if (listeners.hasOwnProperty(key)) {
                listeners[key](clientHeight, clientWidth); // call listener with given arguments
            }
        }
    }


    $window.addEventListener('scroll', function() {
        // cancel previous timeout (simulates stop event)
        $timeout.cancel(scrollTimeoutId);

        // wait for 200ms and then invoke listeners (simulates stop event)
        scrollTimeoutId = $timeout(invokeListeners, 200);
    });


    $window.addEventListener('resize', function() {
        $timeout.cancel(resizeTimeoutId);
        resizeTimeoutId = $timeout(invokeListeners, 200);
    });


    return {
        bindListener: function(listener) {
            var index = ++id;

            listeners[id] = listener;

            return function() {
                delete listeners[index];
            }
        }
    };
}).directive('imageLazySrc', function ($document, scrollAndResizeListener) {
    return {
        restrict: 'A',
        link: function ($scope, $element, $attributes) {
            var listenerRemover;

            function isInView(clientHeight, clientWidth) {
                // get element position
                var imageRect = $element[0].getBoundingClientRect();

                if (
                    (imageRect.top >= 0 && imageRect.bottom <= clientHeight)
                    &&
                    (imageRect.left >= 0 && imageRect.right <= clientWidth)
                ) {
                    $element[0].src = $attributes.imageLazySrc; // set src attribute on element (it will load image)

                    // unbind event listeners when image src has been set
                    listenerRemover();
                }
            }

            // bind listener
            listenerRemover = scrollAndResizeListener.bindListener(isInView);

            // unbind event listeners if element was destroyed
            // it happens when you change view, etc
            $element.on('$destroy', function () {
                listenerRemover();
            });


            // explicitly call scroll listener (because, some images are in viewport already and we haven't scrolled yet)
            isInView(
                $document[0].documentElement.clientHeight,
                $document[0].documentElement.clientWidth
            );
        }
    };
});