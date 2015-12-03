window.Port = window.Port || {};

(function(Port){

	var $port = $('#port')

	var initAnalytic = function(){
		var link = $(this);
		ga('send', 'event', 'Social', link.text(), link[0].href);
	}

	$port
	.on('mousedown','.links > a',initAnalytic)


})(Port)

angular.module('proCompra',['proCompra.controllers','proCompra.directives','proCompra.services'])
angular.module('proCompra.controllers', [])
.controller('QuestionaryCtrl', ['$scope','$window','Questionary','$filter','$rootScope','Upload','Auth',  function ($scope,$window,Questionary,$filter,$rootScope,Upload,Auth) {
	var questionaryAcceptContactLength = null;
	$scope.questionary = null;
	$scope.scrollTop = function(){
		angular.element($window)[0].scrollTo(0,0);
	};

	$scope.testFile = function(files,rejectFiles){
		$scope.filesError = false;
		if(rejectFiles.length){
			$scope.filesError = true;
		}
	}

	$scope.upload = function (brid,data,cb) {
		var files = $scope.files;
		var queue = [];
		var statusGlobal = true;
		if (files && files.length) {

			Questionary.listFile(brid,files).then(function(res){
				if(res.status){
					var files = $scope.files;
					for (var i = 0; i < files.length; i++) {
						queue.push(i)
						var file = files[i];
						Upload.upload({
							url: Auth.env()+'/save-request-files',
							fields:{incrementId:brid},
							file: file
						}).success(function (res) {
							queue.splice(0,1);
							statusGlobal = res.status ? statusGlobal : !statusGlobal;
							if(!queue.length){
								if(statusGlobal){
									cb({status:'ok'},data)    
								}else{
									cb({status:'error'},data)
								}
							}
						}).error(function () {
							queue.splice(0,1)
							if(!queue.length){
								cb({status:'error'},data)
							}
						})
					}
				}
			})
		}else{
			cb({status:'ok'},data)
		}
	};

	$scope.wizard = {
		step: 0,
		answers: null
	};
	$scope.error = {
		email: null
	};
	$scope.$watch('questionary', function(n){
		if(n){
			$scope.wizard.id = n.id;
			$scope.wizard.uri = n.uri;
			$scope.is_price_calculator_active = n.is_price_calculator_active || false;
			$scope.is_accept_contact_active = n.is_accept_contact_active || false;

			questionaryAcceptContactLength = n.questions.length;
			for (var i = n.questions.length - 1; i >= 0; i--) {

				if(n.questions[i].options.length > 4){
					$scope.bigQuestion = true;
				}
				if(n.questions[i].is_base){
					$scope.totalPrice.defaultMin = n.questions[i].defaultValues.min_value;
					$scope.totalPrice.defaultMax = n.questions[i].defaultValues.max_value;
				}
			};
		}
	});

	$scope.$watch('wizard', function(n,o){
		var totalMin = 0;
		var totalMax = 0;

		if(!$scope.is_accept_contact_active && n.step == questionaryAcceptContactLength +1){
			++n.step;
			n.accept_contact = '1';
		}

		if(n.id && n.answers && n.answers[n.answerCurrent]){

			if(n.answers){
				if(Object.keys(n.answers).length == 1){
					for(x in n.answers){
						if(n.answers[x].is_base){
							$scope.totalPrice.min = n.answers[x].minValue
							$scope.totalPrice.max = n.answers[x].maxValue
							$scope.totalPrice.is_only_base = true
						}
					}
				}else{
					$scope.totalPrice.is_only_base = false
				}
			}

			if($scope.totalPrice.min && $scope.totalPrice.max){
				for(price in n.answers){
					if(!$scope.totalPrice.is_only_base && !n.answers[price].is_base){
						totalMin += n.answers[price]['minValue'];
						totalMax += n.answers[price]['maxValue'];
					}
				}

				if(!$scope.totalPrice.is_only_base){
					$scope.totalPrice.min = totalMin
					$scope.totalPrice.max = totalMax
				}

				$scope.totalPrice.status = true;
			}else{            
				$scope.totalPrice = {
					status:true,
					min:n.answers[n.answerCurrent].minValue,
					max:n.answers[n.answerCurrent].maxValue,
				};
			}
		}
	},true);

	$scope.isEmpty = function(obj) {
		var status = false
		if($scope.questionary && $scope.questionary.questions.length){
			for (var i = 0; i < $scope.questionary.questions.length; i++) {
				if($scope.questionary.questions[i]['options']){
					for (var z = 0; z <  $scope.questionary.questions[i]['options'].length; z++) {
						if(obj == $scope.questionary.questions[i]['options'][z].id){
							status = true;
						}  
					};
				}  
			};
		}
		return status
	}
	$scope.loading = null;
	$scope.accept_contact = null
	$scope.totalPrice = {
		status:false,
		min:false,
		max:false,
	};

	document.getElementById('fieldPhone').addEventListener('keyup',function(){
		if(this.value && this.value[1] === "0" ){
			this.value = this.value.substr(2,this.value.length)
		}
	})

	var normalization = function(s){
		var res = _.deburr(s);
		res = _.trim(res).replace(/\s/g, "_")
		return res.toLowerCase();
	}

	$scope.prev = function(){
		$scope.wizard.step--;
		ga('send', 'event', 'Questionnaire', 'Step_'+$scope.wizard.step, 'Btn_Click_Prev');
	};
    $scope.next = function(){
    	$scope.wizard.step++;
      
        ga('send', 'event', 'Questionnaire', 'Step_'+$scope.wizard.step, 'Btn_Click_Next');
        if($scope.wizard.step == ($scope.questionary.questions.length + 2)){
       
            ga('send', 'event', 'Questionnaire', 'Question_AcceptTerms', 'Btn_Click_'+$scope.wizard.accept_contact);
            dataLayer.push({'event': 'inputPage'});
        }
    };
    $scope.setAnswer = function(q, o){
    	$scope.wizard.answers = $scope.wizard.answers || {};
    	$scope.wizard.answers[q.id] = {
    		id:o.id,
    		minValue:o.minValue,
    		maxValue:o.maxValue,
    		is_base:q.is_base,
    		defaultValues:q.defaultValues
    	};
    	$scope.wizard.answerCurrent = q.id;
       
        ga('send', 'event', 'Questionnaire', 'Question_'+normalization(q.title), 'Btn_Click_Answer_'+normalization(o.text));

        $scope.next();
    };
    $scope.submit = function(){
    	var isOk = true;
    	$scope.submitted = true;
    	$scope.error = {
    		name: null,
    		email: null,
    		phone: null
    	};
    	if($scope.wizard.name == null){
    		$scope.error.name = 'Campo obrigatório';
    		isOk = false;
    	}
    	if($scope.wizard.email == null){
    		$scope.error.email = 'Campo obrigatório';
    		isOk = false;
    	}else{
    		if(!$filter('isEmail')($scope.wizard.email)){
    			$scope.error.email = 'O email precisa ser válido';
    			isOk = false;
    		}
    	}
    	if($scope.wizard.phone == null){
    		$scope.error.phone = 'Campo obrigatório';
    		isOk = false;
    	}
    	if(!$scope.wizard.postal || $scope.wizard.postal == null){
    		$scope.error.postal = 'Campo obrigatório';
    		isOk = false;
    	}
    	if(isOk){
    		$scope.loading = true;
    		if(!$scope.wizard.answers){
    			$scope.wizard.min_value = $scope.totalPrice.defaultMin;
    			$scope.wizard.max_value = $scope.totalPrice.defaultMax;    
    		}else{
    			$scope.wizard.min_value = $scope.totalPrice.min;
    			$scope.wizard.max_value = $scope.totalPrice.max;
    		}
    		Questionary.post($scope.wizard).then(
    			function(r){
    				$scope.upload(r.data.incrementId,r,function(obj,r){
    					var qtdAnswers = $scope.wizard.answers || 0;
    					if(qtdAnswers && typeof qtdAnswers === 'object'){
    						qtdAnswers = Object.keys($scope.wizard.answers).length;
    					}
    					ga('send', 'event', 'Questionnaire', 'Success_AcceptContact_'+$scope.wizard.accept_contact, 'Completed');
    					ga('send', 'event', 'Questionnaire', 'Success_Answers_'+qtdAnswers+"/"+$scope.questionary.questions.length, 'Completed');
    					window['optimizely'] = window['optimizely'] || [];
    					window.optimizely.push(["trackEvent", "purchase"]);
    					$scope.questionary.incrementId = r.data.incrementId;
    					$scope.loading = null;
    					$scope.next();
    					Questionary.GA($scope.questionary);
    				});
    			}
    			);
    	}
    };
}]);
angular.module('proCompra.directives',[])
.directive('questionary', ['Questionary','$window','$rootScope', function(Questionary,$window,$rootScope) {
	return {
		restrict: 'E',
		controller:'QuestionaryCtrl',
		scope:true,
		templateUrl: '/questionary.html',
		link: function (scope, el, attr) {
			Questionary.get(attr.category).then(function(r){
				scope.questionary = r.data;
				$rootScope.$broadcast('Questionary.get',r.data);
				// setTimeout(function(){
				// 	Hyphenator.run();
				// },500)
			});
		}
	};
}])

angular.module('proCompra.services', [])
.factory('SerializeWizard', ['$filter',function($filter) {
	return {
		get: function(data) {
			var buffer = [];
			for(var step in data.answers){
				buffer.push(encodeURIComponent('wizard[step'+step+']['+step+']' ) + "=" + data.answers[step]['id']);
			}
			buffer.push(encodeURIComponent('wizard[zip][postal_code]' ) + "=" + (data.postal || ""));
			buffer.push(encodeURIComponent('wizard[customer][first_name]' ) + "=" + (data.name || ""));
			buffer.push(encodeURIComponent('wizard[customer][accept_contact]' ) + "=" + (data.accept_contact || ""));
			buffer.push(encodeURIComponent('wizard[customer][min_value]' ) + "=" + (data.min_value || 0));
			buffer.push(encodeURIComponent('wizard[customer][max_value]' ) + "=" + (data.max_value || 0));
			buffer.push(encodeURIComponent('wizard[customer][last_name]' ) + "=" + (data.lastname || ""));
			buffer.push(encodeURIComponent('wizard[customer][email]' ) + "=" + (data.email || ""));
			buffer.push(encodeURIComponent('wizard[customer][phone_number]' ) + "=" + ($filter('brPhoneNumber')(data.phone) || ""));
			buffer.push(encodeURIComponent('wizard[customer][company_name]' ) + "=" +(data.company || ""));
			buffer.push(encodeURIComponent('wizard[customer][company_id]' ) + "=" + (data.companyId || ""));
			buffer.push(encodeURIComponent('wizard[customer][fk_product_category]' ) + "=" + (data.id || ""));
			buffer.push(encodeURIComponent('wizard[customer][category_url_key]' ) + "=" + (data.uri || ""));

			var source = buffer.join( "&" ).replace( /%20/g, "+" );
			return( source );
		}
	}
}])
.factory('Auth', ['$http', function($http){
	var Auth = {};
	var app = {environment: ['development','staging']};
	for (var i = 0; i < app.environment.length; i++) {
		if(location.host.indexOf(app.environment[i]) > -1){
			app.env = app.environment[i];
			break;
		}else{
			app.env = "prod";
		}
	};
	var environment = app.env || false;
	environment = {
		'development':'https://app-development.procompra.com.br',
		'staging':'https://app-staging.procompra.com.br',
		'prod':'https://app.procompra.com.br'
	}[environment];

	Auth.env = function () {
		return environment
	}

	return Auth;
}])
.factory('Questionary', ['$http','SerializeWizard','Auth', function($http, SerializeWizard,Auth){
	var questionary = {};
	questionary.get = function(category){
		var url = Auth.env()+'/'+category+'-json';
		return $http
		.get(url)
		.then(function (res) {
			return res;
		});
	};

	questionary.listFile = function(brid,files){
		var filesList = [];
		if(!brid) return false;
		for (var i = 0; i < files.length; i++) {
			if(files[i].name){
				filesList.push(files[i].name);
			}
		};
		return $http.post(Auth.env()+'/save-request-files-list',{incrementId:brid,files:filesList});
	}   

	questionary.post = function(answers){
		return $http({
			method: 'POST',
			url: Auth.env()+'/save-request',
			data: SerializeWizard.get(answers),
			headers: {'Content-Type': 'application/x-www-form-urlencoded'}
		})
	};
	questionary.GA = function(data){
		dataLayer.push({
			'event': 'purchase',
			'ecommerce' : {
				'purchase' : {
					'actionField' : {
						'id'      : data.incrementId,
						'revenue' : 1,
						'tax'     : 0
					},
					'products' : [{
						'name'     : data.uri || null,
						'category' : data.id || null
					}]
				}
			}
		})
	};
	return questionary;
}])