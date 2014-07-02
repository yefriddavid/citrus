var app = angular.module('citrus.service', ['ngSanitize','restangular', 'ui.bootstrap', 'ngResource','ngRoute']);
//var app = angular.module('citrus.service', ['ngSanitize','restangular', 'ui.bootstrap', 'ngResource','ngRoute','kendo.directives']);
//var app = angular.module('citrus.service', ['restangular', 'ngResource']);
//app.factory('restLogin', function ($resource) {
//    return $resource('api/login/:login/:password', {}, {
//        get:    {method: 'GET'}//,
//    });
//});
app.factory('restFiles', function ($resource) {
    return $resource('api/files/:id', {}, {
        /*query:  {method: 'GET', isArray: true}*/
        query:  {method: 'GET', isArray: true},
        get:  {method: 'GET'}
    });
});
app.factory('restCategories', function ($resource) {
    return $resource('api/categories/:id', {}, {
        query:  {method: 'GET', isArray: true},
        get:    {method: 'GET'},
        remove: {method: 'DELETE'},
        edit:   {method: 'PUT'},
        add:    {method: 'POST'}
    });
});
app.factory('restUsers', function ($resource) {
    return $resource('api/users/:id', {}, {
        query:  {method: 'GET', isArray: true},
        get:    {method: 'GET'},
        remove: {method: 'DELETE'},
        edit:   {method: 'PUT'},
        add:    {method: 'POST'}
    });
});
app.factory('restQuestions', function ($resource) {
    return $resource('api/questions/:id', {}, {
        query:  {method: 'GET', isArray: true},
        get:    {method: 'GET'},
        remove: {method: 'DELETE'},
        edit:   {method: 'PUT'},
        add:    {method: 'POST'}
    });
});
app.factory('restDictionaries', function ($resource) {
    return $resource('api/dictionaries/:id', {}, {
        query:  {method: 'GET', isArray: true},
        get:    {method: 'GET'},
        remove: {method: 'DELETE'},
        edit:   {method: 'PUT'},
        add:    {method: 'POST'}
    });
});
app.factory('restParameters', function ($resource) {
    return $resource('api/parameters/:id', {}, {
        query:  {method: 'GET', isArray: true},
        get:    {method: 'GET'},
        remove: {method: 'DELETE'},
        edit:   {method: 'PUT'},
        add:    {method: 'POST'}
    });
});
angular.module('citrus', ['citrus.service']).config(function ($httpProvider) {
    $httpProvider.defaults.transformRequest = function (data) {
        var str = [];
        for (var p in data) {
            data[p] !== undefined && str.push(encodeURIComponent(p) + '=' + encodeURIComponent(data[p]));
        }
        return str.join('&');
    };
    $httpProvider.defaults.headers.put['Content-Type'] = $httpProvider.defaults.headers.post['Content-Type'] =
        'application/x-www-form-urlencoded; charset=UTF-8';
});


app.run(['$route', angular.noop]);/*Permite mezclar views con templates*/
function authProvider() {    
    var inSession = false;
    var info = false;
    this.setState = function (state) {
        inSession = !! state;
    };
    this.$get = ['$window',
    function ($window) {
        return {
            getState: function () {
                return inSession;
            },
            set: function(infoData){
                info = infoData;
            },
            get: function(){
                return info;
            },
            reset: function () {
                info = false;
                inSession = false;
            },
            config: function (state) {
                inSession = state;            
            },
            validate: function ($location) {
                if(!inSession){
                    $location.path('/');
                }
                
            }
        };
    }];
}
app.provider('auth', authProvider);
app.config(['authProvider', function (authProvider) {
    authProvider.setState(false);
}]);
app.run(function($rootScope,auth,$location) {
    $rootScope.logout = function(){
        //alert("Aca estoy");
        auth.reset();
        $location.path('/');        
    };
    $rootScope.text = function($html){
        return jQuery("<div>"+ $html+ "</div>").text();
    };
    $rootScope.$on('$routeChangeSuccess', function (event, currentRoute) {
        $rootScope.inSession = auth.getState();
        $rootScope.ActiveItemCategories = '';
        $rootScope.ActiveItemUsers = '';
        $rootScope.ActiveItemHome = '';
        $rootScope.ActiveItemDictionaries = '';
        $rootScope.ActiveItemParameters = '';
        $rootScope.ActiveItemSupport = '';
        $rootScope.ActiveItemQuestions = '';
        $rootScope.ActiveItemParameters = '';
        $rootScope.ActiveItemFiles = '';
        
        var info = auth.get();
        $rootScope.isRoot = info.isRoot;
        //alert($rootScope.isRoot);
    switch(currentRoute.templateUrl) {
        case "views/support.html":        
            $rootScope.ActiveItemSupport = 'active';
            $rootScope.title = "Configuración";
            $rootScope.description = "Soporte";               
            break;          
        case "views/parameters/list.html":
        case "views/parameters/crud.html":
            $rootScope.ActiveItemParameters = 'active';
            $rootScope.title = "Configuración";
            $rootScope.description = "Parámetros";                
            break;        
        case "views/questions/list.html":
        case "views/questions/crud.html":
            $rootScope.ActiveItemQuestions = 'active';
            $rootScope.title = "Catálogos";
            $rootScope.description = "Preguntas";               
            break;        
        case "views/files/crud.html":
            $rootScope.ActiveItemFiles = 'active';
            $rootScope.title = "Archivos";
            $rootScope.description = "Soportes";               
            break;        
        case "views/dictionaries/list.html":
        case "views/dictionaries/crud.html":
            $rootScope.ActiveItemDictionaries = 'active';
            $rootScope.title = "Catálogos";
            $rootScope.description = "Diccionario";                    
            break;        
        case "views/categories/list.html":
        case "views/categories/crud.html":
            $rootScope.ActiveItemCategories = 'active';
            $rootScope.title = "Catálogos";
            $rootScope.description = "Categorías";                 
            break;        
        case "views/users/list.html":
        case "views/users/crud.html":
            $rootScope.ActiveItemUsers = 'active';
            $rootScope.title = "Configuración";
            $rootScope.description = "Usuarios";                 
            break;        
        case "views/home.html":
            $rootScope.ActiveItemHome = 'active';
            $rootScope.title = "Inicio";
            $rootScope.description = "Cuestionario";               
            break;
        default:
            $rootScope.bodyClass = '';
            break;
    }     
    });  
});
angular.module('citrus').config(['$routeProvider', function ($routeProvider) {                
//angular.module('citrus').config(['$routeProvider', function ($routeProvider,RestangularProvider) {                
    $routeProvider.when('/users',      {templateUrl: 'views/users/list.html',  controller: usersCtrl})
                  .when('/users/add', {templateUrl: 'views/users/crud.html', controller: usersCtrl})
                  .when('/users/:id', {templateUrl: 'views/users/crud.html', controller: usersCtrl})
          
                  .when('/categories', {templateUrl: 'views/categories/list.html', controller: categoriesCtrl})
                  .when('/categories/add', {templateUrl: 'views/categories/crud.html', controller: categoriesCtrl})
                  .when('/categories/:id', {templateUrl: 'views/categories/crud.html', controller: categoriesCtrl})
          
                  .when('/parameters', {templateUrl: 'views/parameters/list.html', controller: parametersCtrl})
                  .when('/parameters/:id', {templateUrl: 'views/parameters/crud.html', controller: parametersCtrl})
          
                  .when('/dictionaries', {templateUrl: 'views/dictionaries/list.html', controller: dictionariesCtrl})
                  .when('/dictionaries/add', {templateUrl: 'views/dictionaries/crud.html', controller: dictionariesCtrl})
                  .when('/dictionaries/:id', {templateUrl: 'views/dictionaries/crud.html', controller: dictionariesCtrl})
          
                  .when('/questions', {templateUrl: 'views/questions/list.html', controller: questionsCtrl})
                  .when('/questions/add', {templateUrl: 'views/questions/crud.html', controller: questionsCtrl})
                  .when('/questions/:id', {templateUrl: 'views/questions/crud.html', controller: questionsCtrl})
          
                  .when('/support', {templateUrl: 'views/support.html', controller: supportCtrl})
                  .when('/files', {templateUrl: 'views/files/crud.html', controller: filesCtrl})
                  .when('/lostPassword', {templateUrl: 'views/lostPassword.html', controller: lostPasswordCtrl})
                  //.when('/logout', {templateUrl: '',controller: logoutCtrl})
          
                  .when('/home',         {templateUrl: 'views/home.html', controller: homeCtrl})
                  .when('/',         {templateUrl: 'views/login.html', controller: authCtrl})                    
//                  .when('/',         {templateUrl: 'views/login.html', controller: authCtrl,resolve:{template:function(){return false;}}});
                    .otherwise({ redirectTo: '/'});
//      RestangularProvider.setBaseUrl('$GetUrl');
//      RestangularProvider.setDefaultRequestParams({ key: '<?=App_comunes::infoSession("key");?>' });             
}]);
function lostPasswordCtrl($scope,$location,$http){
    $scope.settings = [];
    $scope.settings['btnRecover'] = false;    
    $scope.recover = function(login){
        $scope.settings['btnRecover'] = true;   
            $http({
                url: 'api/sendMail.php?type=rememberme',
                method: "POST",
                data: {mail:login.mail}
            }).success(function(data, status, headers, config) {
                alert("Se ha enviado un correo a tu cuenta con el password");
                $location.path("/");            
            }).error(function(data, status, headers, config){
                alert("Por alguna razon no pudimos enviar el email con el password comunicate con el administrador");
                $location.path("/");
            });         
        

    };
    $scope.back = function(){
        $location.path("/");
    };
}
function filesCtrl($scope,$location, auth){
    auth.validate($location);    
    var info = auth.get();   
    if(info.isRoot!=='1'){        
        $location.path('/home');        
    }       
}
function authCtrl($scope, $location, $http,auth){
    $scope.noIsValidUserAndPass = false;
    if(auth.getState()){
        $location.path("/home");
    }
    $scope.settings = [];
    $scope.settings['btnSave'] = false;
    $scope.authenticate = function(){
        $scope.settings['btnSave'] = true;
        $http({
            url: "api/login/" + $scope.login.login + "/" + $scope.login.password,
            method: "GET",
            data: {}
        }).success(function(data, status, headers, config) {
            if(data.success===false){
                $scope.settings['btnSave'] = false;
                $scope.noIsValidUserAndPass = true;
                auth.config(false);
            }else{
                auth.set(data.success);
                auth.config(true);
                $location.path("/home");
            }
        }).error(function(data, status, headers, config){
            $location.path("/");
        });                
    };
}

function questionsCtrl($scope, $routeParams, $location, auth,restQuestions,$http,restCategories,$route,$modal){//restCategories
    auth.validate($location);
    var info = auth.get();
    $scope.question = Object();
    $scope.settings = [];
    $scope.settings["btnSave"] = false;
    //$scope.$parent.categories = null;
    if(info.isRoot!=='1'){        
        $location.path('/home');        
    }    
    if ($location.path() === '/questions') {
//        $http({method: 'GET', url: 'api/categories'}).
//                success(function(data, status, headers, config) {
//                    $scope.$parent.categories = data;
//                }).
//                error(function(data, status, headers, config) {
//                    alert('Al ver que se produjo un error al traer las categorias intentalo nuevamente! y si ves que el error continua, comunicate con el administrador');
//                });            
        $scope.questions = restQuestions.query();
    }else{
        $scope.$parent.categories = restCategories.query();
        $scope.allFiles = [];//restFiles.query();  
        if ($routeParams.id) {
            $scope.question = restQuestions.get({id: $routeParams.id});
        }      
        $scope.settings["btnSave"] = true;
        $http({
            url: "api/files/get/questions/" + $routeParams.id + "/",
            method: "GET",
            data: {}
        }).success(function(data) {
            $scope.allFiles = data;
            /*Checkeamos los archivos que contiene esta pregunta*/
            angular.forEach($scope.allFiles, function(value, key){
                if(value['questionId'] === $routeParams.id){
                    //alert($routeParams.id);
                    $scope.checkedFile(true,value['fileId']);
                }
            });     
            $scope.settings["btnSave"] = false;
        }).error(function(){
            alert("Oh, se genero un error al cargar los arachivos, si el error continua comunicate con el administrador");
        });           
        
        
        $scope.customOptions = {
            dataSource: $scope.categories,//$scope.categories,//[{"CustomerID":"ALFKI","ContactName":"Maria Anders","CompanyName":"Alfreds Futterkiste"},{"CustomerID":"ANATR","ContactName":"Ana Trujillo","CompanyName":"Ana Trujillo Emparedados y helados"},{"CustomerID":"ANTON","ContactName":"Antonio Moreno","CompanyName":"Antonio Moreno Taquería"},{"CustomerID":"AROUT","ContactName":"Thomas Hardy","CompanyName":"Around the Horn"},{"CustomerID":"BERGS","ContactName":"Christina Berglund","CompanyName":"Berglunds snabbköp"},{"CustomerID":"BLAUS","ContactName":"Hanna Moos","CompanyName":"Blauer See Delikatessen"},{"CustomerID":"BLONP","ContactName":"Frédérique Citeaux","CompanyName":"Blondel père et fils"},{"CustomerID":"BOLID","ContactName":"Martín Sommer","CompanyName":"Bólido Comidas preparadas"},{"CustomerID":"BONAP","ContactName":"Laurence Lebihan","CompanyName":"Bon app\u0027"},{"CustomerID":"BOTTM","ContactName":"Elizabeth Lincoln","CompanyName":"Bottom-Dollar Markets"},{"CustomerID":"BSBEV","ContactName":"Victoria Ashworth","CompanyName":"B\u0027s Beverages"},{"CustomerID":"CACTU","ContactName":"Patricio Simpson","CompanyName":"Cactus Comidas para llevar"},{"CustomerID":"CENTC","ContactName":"Francisco Chang","CompanyName":"Centro comercial Moctezuma"},{"CustomerID":"CHOPS","ContactName":"Yang Wang","CompanyName":"Chop-suey Chinese"},{"CustomerID":"COMMI","ContactName":"Pedro Afonso","CompanyName":"Comércio Mineiro"},{"CustomerID":"CONSH","ContactName":"Elizabeth Brown","CompanyName":"Consolidated Holdings"},{"CustomerID":"DRACD","ContactName":"Sven Ottlieb","CompanyName":"Drachenblut Delikatessen"},{"CustomerID":"DUMON","ContactName":"Janine Labrune","CompanyName":"Du monde entier"},{"CustomerID":"EASTC","ContactName":"Ann Devon","CompanyName":"Eastern Connection"},{"CustomerID":"ERNSH","ContactName":"Roland Mendel","CompanyName":"Ernst Handel"},{"CustomerID":"FAMIA","ContactName":"Aria Cruz","CompanyName":"Familia Arquibaldo"},{"CustomerID":"FISSA","ContactName":"Diego Roel","CompanyName":"FISSA Fabrica Inter. Salchichas S.A."},{"CustomerID":"FOLIG","ContactName":"Martine Rancé","CompanyName":"Folies gourmandes"},{"CustomerID":"FOLKO","ContactName":"Maria Larsson","CompanyName":"Folk och fä HB"},{"CustomerID":"FRANK","ContactName":"Peter Franken","CompanyName":"Frankenversand"},{"CustomerID":"FRANR","ContactName":"Carine Schmitt","CompanyName":"France restauration"},{"CustomerID":"FRANS","ContactName":"Paolo Accorti","CompanyName":"Franchi S.p.A."},{"CustomerID":"FURIB","ContactName":"Lino Rodriguez","CompanyName":"Furia Bacalhau e Frutos do Mar"},{"CustomerID":"GALED","ContactName":"Eduardo Saavedra","CompanyName":"Galería del gastrónomo"},{"CustomerID":"GODOS","ContactName":"José Pedro Freyre","CompanyName":"Godos Cocina Típica"},{"CustomerID":"GOURL","ContactName":"André Fonseca","CompanyName":"Gourmet Lanchonetes"},{"CustomerID":"GREAL","ContactName":"Howard Snyder","CompanyName":"Great Lakes Food Market"},{"CustomerID":"GROSR","ContactName":"Manuel Pereira","CompanyName":"GROSELLA-Restaurante"},{"CustomerID":"HANAR","ContactName":"Mario Pontes","CompanyName":"Hanari Carnes"},{"CustomerID":"HILAA","ContactName":"Carlos Hernández","CompanyName":"HILARION-Abastos"},{"CustomerID":"HUNGC","ContactName":"Yoshi Latimer","CompanyName":"Hungry Coyote Import Store"},{"CustomerID":"HUNGO","ContactName":"Patricia McKenna","CompanyName":"Hungry Owl All-Night Grocers"},{"CustomerID":"ISLAT","ContactName":"Helen Bennett","CompanyName":"Island Trading"},{"CustomerID":"KOENE","ContactName":"Philip Cramer","CompanyName":"Königlich Essen"},{"CustomerID":"LACOR","ContactName":"Daniel Tonini","CompanyName":"La corne d\u0027abondance"},{"CustomerID":"LAMAI","ContactName":"Annette Roulet","CompanyName":"La maison d\u0027Asie"},{"CustomerID":"LAUGB","ContactName":"Yoshi Tannamuri","CompanyName":"Laughing Bacchus Wine Cellars"},{"CustomerID":"LAZYK","ContactName":"John Steel","CompanyName":"Lazy K Kountry Store"},{"CustomerID":"LEHMS","ContactName":"Renate Messner","CompanyName":"Lehmanns Marktstand"},{"CustomerID":"LETSS","ContactName":"Jaime Yorres","CompanyName":"Let\u0027s Stop N Shop"},{"CustomerID":"LILAS","ContactName":"Carlos González","CompanyName":"LILA-Supermercado"},{"CustomerID":"LINOD","ContactName":"Felipe Izquierdo","CompanyName":"LINO-Delicateses"},{"CustomerID":"LONEP","ContactName":"Fran Wilson","CompanyName":"Lonesome Pine Restaurant"},{"CustomerID":"MAGAA","ContactName":"Giovanni Rovelli","CompanyName":"Magazzini Alimentari Riuniti"},{"CustomerID":"MAISD","ContactName":"Catherine Dewey","CompanyName":"Maison Dewey"},{"CustomerID":"MEREP","ContactName":"Jean Fresnière","CompanyName":"Mère Paillarde"},{"CustomerID":"MORGK","ContactName":"Alexander Feuer","CompanyName":"Morgenstern Gesundkost"},{"CustomerID":"NORTS","ContactName":"Simon Crowther","CompanyName":"North/South"},{"CustomerID":"OCEAN","ContactName":"Yvonne Moncada","CompanyName":"Océano Atlántico Ltda."},{"CustomerID":"OLDWO","ContactName":"Rene Phillips","CompanyName":"Old World Delicatessen"},{"CustomerID":"OTTIK","ContactName":"Henriette Pfalzheim","CompanyName":"Ottilies Käseladen"},{"CustomerID":"PARIS","ContactName":"Marie Bertrand","CompanyName":"Paris spécialités"},{"CustomerID":"PERIC","ContactName":"Guillermo Fernández","CompanyName":"Pericles Comidas clásicas"},{"CustomerID":"PICCO","ContactName":"Georg Pipps","CompanyName":"Piccolo und mehr"},{"CustomerID":"PRINI","ContactName":"Isabel de Castro","CompanyName":"Princesa Isabel Vinhos"},{"CustomerID":"QUEDE","ContactName":"Bernardo Batista","CompanyName":"Que Delícia"},{"CustomerID":"QUEEN","ContactName":"Lúcia Carvalho","CompanyName":"Queen Cozinha"},{"CustomerID":"QUICK","ContactName":"Horst Kloss","CompanyName":"QUICK-Stop"},{"CustomerID":"RANCH","ContactName":"Sergio Gutiérrez","CompanyName":"Rancho grande"},{"CustomerID":"RATTC","ContactName":"Paula Wilson","CompanyName":"Rattlesnake Canyon Grocery"},{"CustomerID":"REGGC","ContactName":"Maurizio Moroni","CompanyName":"Reggiani Caseifici"},{"CustomerID":"RICAR","ContactName":"Janete Limeira","CompanyName":"Ricardo Adocicados"},{"CustomerID":"RICSU","ContactName":"Michael Holz","CompanyName":"Richter Supermarkt"},{"CustomerID":"ROMEY","ContactName":"Alejandra Camino","CompanyName":"Romero y tomillo"},{"CustomerID":"SANTG","ContactName":"Jonas Bergulfsen","CompanyName":"Santé Gourmet"},{"CustomerID":"SAVEA","ContactName":"Jose Pavarotti","CompanyName":"Save-a-lot Markets"},{"CustomerID":"SEVES","ContactName":"Hari Kumar","CompanyName":"Seven Seas Imports"},{"CustomerID":"SIMOB","ContactName":"Jytte Petersen","CompanyName":"Simons bistro"},{"CustomerID":"SPECD","ContactName":"Dominique Perrier","CompanyName":"Spécialités du monde"},{"CustomerID":"SPLIR","ContactName":"Art Braunschweiger","CompanyName":"Split Rail Beer & Ale"},{"CustomerID":"SUPRD","ContactName":"Pascale Cartrain","CompanyName":"Suprêmes délices"},{"CustomerID":"THEBI","ContactName":"Liz Nixon","CompanyName":"The Big Cheese"},{"CustomerID":"THECR","ContactName":"Liu Wong","CompanyName":"The Cracker Box"},{"CustomerID":"TOMSP","ContactName":"Karin Josephs","CompanyName":"Toms Spezialitäten"},{"CustomerID":"TORTU","ContactName":"Miguel Angel Paolino","CompanyName":"Tortuga Restaurante"},{"CustomerID":"TRADH","ContactName":"Anabela Domingues","CompanyName":"Tradição Hipermercados"},{"CustomerID":"TRAIH","ContactName":"Helvetius Nagy","CompanyName":"Trail\u0027s Head Gourmet Provisioners"},{"CustomerID":"VAFFE","ContactName":"Palle Ibsen","CompanyName":"Vaffeljernet"},{"CustomerID":"VICTE","ContactName":"Mary Saveley","CompanyName":"Victuailles en stock"},{"CustomerID":"VINET","ContactName":"Paul Henriot","CompanyName":"Vins et alcools Chevalier"},{"CustomerID":"WANDK","ContactName":"Rita Müller","CompanyName":"Die Wandernde Kuh"},{"CustomerID":"WARTH","ContactName":"Pirkko Koskitalo","CompanyName":"Wartian Herkku"},{"CustomerID":"WELLI","ContactName":"Paula Parente","CompanyName":"Wellington Importadora"},{"CustomerID":"WHITC","ContactName":"Karl Jablonski","CompanyName":"White Clover Markets"},{"CustomerID":"WILMK","ContactName":"Matti Karttunen","CompanyName":"Wilman Kala"},{"CustomerID":"WOLZA","ContactName":"Zbyszek Piestrzeniewicz","CompanyName":"Wolski  Zajazd"}],
            valueTemplate: '<span>{{dataItem.name}}</span><input type="hidden" name="selectedCategorieId" id="selectedCategorieId" value="{{dataItem.categorieId}}">',
            template: '<span class="k-state-default">{{dataItem.name}}<br /><b>{{dataItem.description}}</b></span>'
          };
     
    }

    $scope.Init = function(){  
    };    
    $scope.delete = function (id) {
        if (!confirm('Desea eliminar este registro?')) {
            return;
        }        
        restQuestions.remove({id: id}, {}, function (data) {
            $scope.questions = restQuestions.query();
        });
    };
    $scope.isValid = function(){
        if($scope.frmData.$valid && $scope.settings['btnSave']===false){
            return false;             
        }else{
            return true;
        }          
    };    
    
    //$scope.question.files = null;
    
    //$scope.question.files = [];
    $scope.checkedFile = function (checked,fileId) {
        if(typeof $scope.question.files == "undefined"){
            $scope.question.files = [];
        }
        if(checked){
            $scope.question.files.push(fileId);
        }else{
            angular.forEach($scope.seletedQuestions, function(value, key){
                if(value === fileId){
                    delete $scope.question.files[key];
                }
            });                             
        }
        //$scope.question.files.push(fileId);
    };
    $scope.save = function (CreateNew) {
        if(isNaN($scope.question.userCode)){
            alert("El consecutivo solo admite valores numéricos");
            return false;
        }
        //$scope.question.categorieId = $('#selectedCategorieId').val();
        $scope.settings["btnSave"] = true;                        
        //$scope.question.files = $scope.allFiles;                        
        $http({
            url: 'api/questions/' + $scope.question.questionId + '/' + $scope.question.categorieId + '/' + $scope.question.userCode,
            method: "GET"//,
        }).success(function(data, status, headers, config) {
            if(data==='false'){
                if(typeof $scope.question.questionId !=="undefined"){
                    restQuestions.edit({id: $scope.question.questionId}, $scope.question, function (data) {
                        $scope.postSaveCtrl(CreateNew);                       
                    });                    
                }else{
                    restQuestions.add({}, $scope.question, function (data) {
                        $scope.postSaveCtrl(CreateNew,data);
                    });                          
                }
            }else{
                alert("Ya existe una pregunta con estos datos, le recomiendo que cambie el consecutivo");
                $scope.settings["btnSave"] = false;
            }
        }).error(function(data, status, headers, config){
            alert("Se genero un error mientras Validábamos los datos, intentelo nuevamente o contacte al adminsitrador");
            $scope.settings["btnSave"] = false;
        });                      
        
    };
    $scope.postSaveCtrl = function(CreateNew,data){
        if(CreateNew===true){//y crear uno nuevo
            //$location.path('/questions/add');
            if($location.path()==="/questions/add"){
                $route.reload();
            }else{
                $location.path('/questions/add');
            }
        }else if(CreateNew===null){//y agregar archivos
            $scope.settings["btnSave"] = false; 
            $location.path('/questions/' + data['id']);
            //$scope.question = restQuestions.get({id: data['id']});
        }else{//y salir
            $location.path('/questions');
        }        
    };
    $scope.new = function () {
        $location.path('/questions/add');
             
    };
    $scope.back = function () {
        $location.path('/questions');
    };
    $scope.openFilesQuestions = function (size) {

        var modalInstance = $modal.open({
          templateUrl: 'questionFiles.html',
          controller: filesQuestionsModalController,
          size: size,
          resolve: {
            dictionaries: function () {
              return $scope.dictionaries;
            }
          }
        });

    modalInstance.result.then(function () {
      //$scope.selected = selectedItem;
    }, function () {
      //$log.info('Modal dismissed at: ' + new Date());
    });
  };
}


function filesQuestionsModalController($scope,$modalInstance) {    
  //$scope.dictionaries = dictionaries;

    $scope.init = function () {
        try {
            
            var dzFiiles = new Dropzone("#dzFiles",{
                paramName: "files", // The name that will be used to transfer the file
                maxFilesize: 10, // original 0.5 MB
                addRemoveLinks: true,
                dictDefaultMessage:
                        '<span class="bigger-150 bolder"><i class="icon-caret-right red"></i> Drop files</span> to upload \
                <span class="smaller-80 grey">(or click)</span> <br /> \
                <i class="upload-icon icon-cloud-upload blue icon-3x"></i>'
                ,
                dictResponseError: 'Error while uploading file!',
                previewTemplate: "<div class=\"dz-preview dz-file-preview\">\n  <div class=\"dz-details\">\n    <div class=\"dz-filename\"><span data-dz-name></span></div>\n    <div class=\"dz-size\" data-dz-size></div>\n    <img data-dz-thumbnail />\n  </div>\n  <div class=\"progress progress-small progress-striped active\"><div class=\"progress-bar progress-bar-success\" data-dz-uploadprogress></div></div>\n  <div class=\"dz-success-mark\"><span></span></div>\n  <div class=\"dz-error-mark\"><span></span></div>\n  <div class=\"dz-error-message\"><span data-dz-errormessage></span></div>\n</div>",
                init: function () {
                    this.on("addedfile", function(file) {

                    });
                    this.on("removedfile", function (file) {
                        $.ajax({   
                            url: 'api/upload.php',   
                            data: { questionId: 0, file: file.name,files:"" },
                            type: 'DELETE',   success: function(data) { 

                            }});                          
                    });
                }
            });          
            dzFiiles.on('sending', function(file, xhr, formData){
                formData.append('questionId', 0);
                return false;
            });
            //if($('#questionId').val() !==""){
                setTimeout(function(){
                    $.get( "api/files/get/0", function( data ) {
                        if(data){
                            $.each(data, function( index, value ) {
                              //alert( index + ": " + value );
                                var mockFile = { 
                                    name: value.name, 
                                    size: value.size
                                };
                                dzFiiles.options.addedfile.call(dzFiiles, mockFile);
                                dzFiiles.options.thumbnail.call(dzFiiles, mockFile, value.thumbnails);// "api/thumbnails/" + $('#questionId').val() + "/" + value.name);
                                $('#dzFiles div[data-dz-uploadprogress]').css("width","100%");                            
                            });
                        }
                    });                      
                },3000);
              
            
            //alert("init");
        } catch (e) {
            alert('Dropzone.js does not support older browsers!');
        }        
    };
    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };
};

function usersCtrl($scope, $routeParams, $location, restUsers,auth) {
    auth.validate($location);
    $scope.settings = [];
    $scope.settings["btnSave"] = false;    
    var info = auth.get();
    if(info.isRoot!=='1'){
        $location.path('/home');        
    }    
    if ($routeParams.id) {
        $scope.user = restUsers.get({id: $routeParams.id});
        //console.log($scope.user);
    }
    if ($location.path() === '/users') {
        $scope.users = restUsers.query();
    }
    $scope.add = function () {
        restUsers.add({}, $scope.newUser, function (data) {
            $location.path('/users');
        });
    };
    $scope.delete = function (id) {
        if (!confirm('Desea eliminar este registro?')) {
            return;
        }        
        restUsers.remove({id: id}, {}, function (data) {
            $scope.users = restUsers.query();
        });
    };
    $scope.save = function () {
        $scope.settings["btnSave"] = true;
        if(typeof $scope.user.userId !=="undefined"){
            restUsers.edit({id: $scope.user.userId}, $scope.user, function (data) {
                $location.path('/users');
            });
        }else{
            restUsers.add({}, $scope.user, function (data) {
                $location.path('/users');
            });        
        }
    };
    $scope.new = function () {
        $location.path('/users/add');
    };
    $scope.back = function () {
        $location.path('/users');
    };
}
function homeCtrl($scope,$location,auth,$modal,$log,restDictionaries,restQuestions,restFiles,$http,$compile){
    auth.validate($location);    
    $scope.printQuestion = function(){
        $("#iFramePdf").contents().find('html').html($(".printZone").html());
        $("#iFramePdf").contents().find('head').append('<link rel="stylesheet" href="css/docs.min.css">');
        $("#iFramePdf").contents().find('head').append('<link rel="stylesheet" href="css/bootstrap.min.css">');
        
        var getMyFrame = document.getElementById("iFramePdf");
        getMyFrame.focus();
        getMyFrame.contentWindow.print();           
    };
    $scope.openDictionary = function (size) {
        $scope.dictionaries = restDictionaries.query();  
            var modalInstance = $modal.open({
              templateUrl: 'dictionaryModal.html',
              controller: dictionaryModalController,
              size: size,
              resolve: {
                dictionaries: function () {
                  return $scope.dictionaries;
                }
              }
            });

    modalInstance.result.then(function () {
      //$scope.selected = selectedItem;
    }, function () {
      //$log.info('Modal dismissed at: ' + new Date());
    });
  };
  
  
    $scope.openViewFiles = function (file) {
        //alert(file.id);
        var modalInstance = $modal.open({
          templateUrl: 'fileViewModal.html',
          size: 'lg',
          controller: viewFilesModalController,
          resolve: {
            file:function(){
                return file
            },
            question: function () {
              return $scope.question;
            }
          }
        });

        modalInstance.result.then(function () {

        }, function () {

        });
    }; 
    
    $scope.currentSelectedItem = null;
    $scope.backOrNext = function (isNext) {
        var item = null;
        if(isNext){
            if($scope.currentSelectedItem === ($scope.seletedQuestions.length-1)){
                item = 0;
            }else{
                item = $scope.currentSelectedItem + 1;
            }
        }else{
            if($scope.currentSelectedItem === 0){
                item =  $scope.seletedQuestions.length-1;
            }else{
                item = $scope.currentSelectedItem - 1;
            }                
        }
        
        $scope.selectItem(item);                
    };
    $scope.files = [];//Almacena un arreglo con los archivos actuales para luego buscar el ID para mostrar el archivo
    $scope.selectItem = function (item) {    
        $scope.currentSelectedItem = item;
            $scope.question = $scope.seletedQuestions[item];      
            if(typeof $scope.myDropzone !="undefined"){
                
            }else{
    
            }
//            $(".dz-preview").unbind('click');
            $(".dz-preview").remove();
            $http({
                url: "api/files/" + $scope.question.questionId,
                method: "GET"
            }).success(function(data, status, headers, config){
                $scope.files = data;
            }).error(function(data, status, headers, config){

            });         
    };
    $scope.openQuestions = function (size) {
        $scope.questions = restQuestions.query();  
            var modalInstance = $modal.open({
              templateUrl: 'questionsModal.html',
              controller: questionsModalController,
              size: size,
              resolve: {
                questions: function () {
                  return $scope.questions;
                }
              }
            });
            
        modalInstance.result.then(function (selectedQuestions) {
            $scope.seletedQuestions = selectedQuestions;  
            $scope.selectItem(0);  
            
        }, function () {
    });
  };
  
    $scope.openFiles = function (size) {
        $scope.allFiles = restFiles.query();  
        var modalInstance = $modal.open({
          templateUrl: 'filesModal.html',
          controller: filesModalController,
          size: size,
          resolve: {
            files: function () {
              return $scope.allFiles;
            }
          }
        });
        modalInstance.result.then(function () {
        }, function () {
        });
  };
    $scope.openMail = function (size) {
        //$scope.files = restFiles.get({id:$scope.question.questionId});  
            var modalInstance = $modal.open({
              templateUrl: 'mailModal.html',
              controller: mailModalController,
              size: size,
              resolve: {
                question: function () {
                  return $scope.question;
                }
              }
            });
        modalInstance.result.then(function () {
        }, function () {
        });
  };
}
function viewFilesModalController($scope, $modalInstance,file,question) {
    $scope.question = question;
    $scope.file = file;
    $scope.url = file.id;//"https://docs.google.com/document/d/" + id + "/edit?usp=sharing"
    
    $scope.initIframe = function(){
        $("#iframeAdmision").attr("src",$scope.url);
    };    
  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };    
}
function dictionaryModalController($scope, $modalInstance,dictionaries) {    
  $scope.dictionaries = dictionaries;

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
};
function filesModalController($scope, $modalInstance,files) {    
    $scope.files = files;
    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };
};
function questionsModalController($scope, $modalInstance,questions) {    
    $scope.questions = questions;
    $scope.seletedQuestions = [];
    $scope.ok = function () {
      $modalInstance.close($scope.seletedQuestions);
      //console.log($scope.seletedQuestions);
    };

    //$scope.check = false;
    $scope.seletedItem = function (checked,question) {
        if(checked == "undefined" || checked == true){
            angular.forEach($scope.seletedQuestions, function(value, key){
                if(question.questionId == value.questionId){
                    $scope.seletedQuestions.splice(key,1);
                }
            });         
        }else{
            $scope.seletedQuestions.push(question);

        }
        //alert($scope.seletedQuestions.length);
    };  
    
    $scope.isOkValid = function (question) {
        if($scope.seletedQuestions.length>0){
            return false;
        }else{
            return true;
        }
    };
    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };
};
function mailModalController($scope, $modalInstance,question) {    
  $scope.question = question;
  $scope.sendMail = function (mail) {
    //$modalInstance.close($scope.question);
    var $questionId = question.questionId;
    $.ajax({   
        url: 'api/sendMail.php?questionId=' + $questionId,   
        data: { 
            question:$scope.question.question,
            to:mail.to,
            subject:mail.subject,
            userCode:$scope.question.userCode,
            response: $scope.question.response},
        type: 'POST',   success: function(data) { 

        }});      
    $modalInstance.dismiss('cancel');
  };
  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
};
function categoriesCtrl($scope, $routeParams, $location, restCategories,auth,$http) {
    auth.validate($location);
    var info = auth.get();    
    if(info.isRoot!=='1'){        
        $location.path('/home');        
    }
    $scope.settings = [];
    $scope.settings["btnSave"] = false;
    if ($routeParams.id) {/*Modificar*/
        $scope.categorie = restCategories.get({id: $routeParams.id});
    }
    if ($location.path() === '/categories') {
        $scope.categories = restCategories.query();
    }
    $scope.delete = function (id) {
        if (!confirm('Desea eliminar este registro?')) {
            return;
        }        
        restCategories.remove({id: id}, {}, function (data) {
            $scope.categories = restCategories.query();
        });
    };
    $scope.save = function () {
        $scope.settings["btnSave"] = true;
            $http({
                url: 'api/categories/validate/' + $scope.categorie.categorieId + '/' + $scope.categorie.name,
                method: "GET"//,
            }).success(function(data, status, headers, config) {
                if(data==='false'){
                    if(typeof $scope.categorie.categorieId !=="undefined"){
                        restCategories.edit({id: $scope.categorie.categorieId}, $scope.categorie, function (data) {
                            $location.path('/categories');
                        });
                    }else{
                        restCategories.add({}, $scope.categorie, function (data) {
                            $location.path('/categories');
                        });        
                    }               
                }else{
                    alert("Ya existe una categoría con estos datos, le recomiendo que cambie el número");
                    $scope.settings["btnSave"] = false;
                }
            }).error(function(data, status, headers, config){
                alert("Se genero un error mientras validabamos los datos, intentelo nuevamente o contacte al adminsitrador");
                $scope.settings["btnSave"] = false;
            });                                      

    };
    $scope.new = function () {
        $location.path('/categories/add');
    };
    $scope.back = function () {
        $location.path('/categories');
    };

}
function dictionariesCtrl($scope, $routeParams, $location, restDictionaries,auth) {
    auth.validate($location);
    $scope.settings = [];
    $scope.settings["btnSave"] = false;    
    var info = auth.get();
    if(info.isRoot!=='1'){
        $location.path('/home');        
    }      
    if ($routeParams.id) {/*Modificar*/
        $scope.dictionary = restDictionaries.get({id: $routeParams.id});
    }
    if ($location.path() === '/dictionaries') {
        $scope.dictionaries = restDictionaries.query();
    }
    $scope.delete = function (id) {
        if (!confirm('Desea eliminar este registro?')) {
            return;
        }
        
        restDictionaries.remove({id: id}, {}, function (data) {
            $scope.dictionaries = restDictionaries.query();
        });
    };
    $scope.save = function () {
        $scope.settings["btnSave"] = true;
        if(typeof $scope.dictionary.dictionaryId !=="undefined"){
            restDictionaries.edit({id: $scope.dictionary.dictionaryId}, $scope.dictionary, function (data) {
                $location.path('/dictionaries');
            });
        }else{
            restDictionaries.add({}, $scope.dictionary, function (data) {
                $location.path('/dictionaries');
            });        
        }
    };
    $scope.new = function () {
        $location.path('/dictionaries/add');
    };
    $scope.back = function () {
        $location.path('/dictionaries');
    };
 
}
function parametersCtrl($scope, $routeParams, $location, restParameters,auth) {
    auth.validate($location);
    $scope.settings = [];
    $scope.settings["btnSave"] = false;    
    var info = auth.get();
    if(info.isRoot!=='1'){
        $location.path('/home');        
    }    
    if ($routeParams.id) {/*Modificar*/
        $scope.parameter = restParameters.get({id: $routeParams.id});
    }
    if ($location.path() === '/parameters') {
        $scope.parameters = restParameters.query();
    }
    $scope.save = function () {   
        $scope.settings["btnSave"] = true;
        restParameters.edit({id: $scope.parameter.parameterId}, $scope.parameter, function (data) {
            $location.path('/parameters');
        });
    };
    $scope.back = function () {
        $location.path('/parameters');
    };
 
}

function supportCtrl($scope,restParameters,$location,auth) {
    auth.validate($location);
    
    $scope.parameterEmail = restParameters.get({id:1});
    $scope.parameterDate = restParameters.get({id:6});
}



app.directive('ckeditor', ['$timeout', '$q', function($timeout, $q) {
        'use strict';

        return {
            restrict: 'AC',
            require: ['ngModel', '^?form'],
            scope: false,
            link: function(scope, element, attrs, ctrls) {

                var ngModel = ctrls[0];
                var form = ctrls[1] || null;
                var EMPTY_HTML = '<p></p>',
                        isTextarea = element[0].tagName.toLowerCase() == 'textarea',
                        data = [],
                        isReady = false;

                if (!isTextarea) {
                    element.attr('contenteditable', true);
                }

                var onLoad = function() {
                    //alert("Aca esoty cargando el editor html");
                    var options = {
                        toolbar: 'full',
                        toolbar_full: [
                            {name: 'basicstyles',
                                items: ['Bold', 'Italic', 'Strike', 'Underline']},
                            {name: 'paragraph', items: ['BulletedList', 'NumberedList', 'Blockquote']},
                            {name: 'editing', items: ['JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock']},
                            {name: 'links', items: ['Link', 'Unlink', 'Anchor']},
                            {name: 'tools', items: ['SpellChecker', 'Maximize']},
                            '/',
                            {name: 'styles', items: ['Format', 'FontSize', 'TextColor', 'PasteText', 'PasteFromWord', 'RemoveFormat']},
                            {name: 'insert', items: ['Image', 'Table', 'SpecialChar']},
                            {name: 'forms', items: ['Outdent', 'Indent']},
                            {name: 'clipboard', items: ['Undo', 'Redo']},
                            {name: 'document', items: ['PageBreak', 'Source']}
                        ],
                        disableNativeSpellChecker: false,
                        uiColor: '#FAFAFA',
                        height: '400px',
                        width: '100%'
                    };
                    options = angular.extend(options, scope[attrs.ckeditor]);

                    var instance = (isTextarea) ? CKEDITOR.replace(element[0], options) : CKEDITOR.inline(element[0], options),
//                var instance = (isTextarea) ? CKEDITOR.replace(element[0]) : CKEDITOR.inline(element[0], options),
                            configLoaderDef = $q.defer();

                    element.bind('$destroy', function() {
                        //alert("aca lo destruire todo");
                        instance.destroy(
                                false //If the instance is replacing a DOM element, this parameter indicates whether or not to update the element with the instance contents.
                                );
                    });
                    var setModelData = function(setPristine) {
                        var data = instance.getData();
                        if (data == '') {
                            data = null;
                        }
                        $timeout(function() { // for key up event
                            (setPristine !== true || data != ngModel.$viewValue) && ngModel.$setViewValue(data);
                            (setPristine === true && form) && form.$setPristine();
                        }, 0);
                    }, onUpdateModelData = function(setPristine) {
                        if (!data.length) {
                            return;
                        }


                        var item = data.pop() || EMPTY_HTML;
                        isReady = false;
                        instance.setData(item, function() {
                            setModelData(setPristine);
                            isReady = true;
                        });
                    }
                    instance.on('change', setModelData);
                    instance.on('blur', setModelData);
                    //instance.on('key',          setModelData); // for source view

                    instance.on('instanceReady', function() {
                        scope.$broadcast("ckeditor.ready");
                        scope.$apply(function() {
                            onUpdateModelData(true);
                        });

                        instance.document.on("keyup", setModelData);
                    });
                    instance.on('customConfigLoaded', function() {
                        configLoaderDef.resolve();
                    });

                    ngModel.$render = function() {
                        data.push(ngModel.$viewValue);
                        if (isReady) {
                            onUpdateModelData();
                        }
                    };
                };
                var loaded = false;
                //alert(CKEDITOR.status);
                if (CKEDITOR.status == 'loaded' || CKEDITOR.status == 'basic_ready') {
                    loaded = true;
                }
                if (loaded) {
                    onLoad();
                } else {
                    //$defer.promise.then(onLoad);
                }
            }
        };
    }]);