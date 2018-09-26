(function NeuralNetworksInit() {
	//import _ from 'lodash';
	const $ = require('jquery');
	const axios = require('axios');
	const path = require('path');
	const Mustache = require('mustache');

	let cachedDOM = (function () {
		return {
			$inpTrainFile: $('#inpTrainFile'),
			$inpPredictFile: $('#inpPredictFile'),
			$inpUpdateTime: $('#inpUpdateTime'),

			$lblTrainFile: $('#lblTrainFile'),
			$lblPredictFile: $('#lblPredictFile'),

			$chbRealtimeProgress: $('#chbRealtimeProgress'),

			$divServerMessage: $('#divServerMessage'),
			$txtUpdateTimeValue: $("#txtUpdateTimeValue"),
		}
	})();

	const rootPath = "http://localhost:3000";

	let trainFile, predictFile;
	let currentServerMessage = "empty";

	$(function () {
		$('#HTML_nn_navBar').load('nn_navBar.html', onNnNavBarLoad);
		$('#HTML_createNN_Modal').load('createNN_Modal.html', onCreateModalLoad);
		$('#HTML_visualizeNN_Modal').load('visualizeNN_Modal.html', onVisualizeModalLoad);
		$('#HTML_settingsNN_Modal').load('settingsNN_Modal.html');

		$('#btnSetData').on('click', callNN);
		$('#btnTrainBands').on('click', callNNBands);

		function onNnNavBarLoad() {
			$('#HTML_trainNN_Module').load('trainNN_Module.html', onTrainNNLoad);
			$('#HTML_trainedNN_Module').load('trainedNN_Module.html');
		}

		function onTrainNNLoad() {
			cachedDOM['$chipDataStatus'] = $('#chipDataStatus');
			cachedDOM['$chipDataValue'] = $('#chipDataValue');
			cachedDOM['$chipTipText'] = $('#chipTipText');
			cachedDOM['$nnStepper'] = [
				$('#stpSetData'), 
				$('#stpTraining'), 
				$('#stpPredict')
			];
		}

		//When the create modal is fully loaded, create firstlayer block using mustache
		function onCreateModalLoad() {
			addLayer("firstLayer", "First Layer", void (0), false);
			$('#btnAddHiddenLayer').on('click', addHiddenLayer);
			$('#btnSaveModel').on('click', saveCreationModel);

			//inputs of Create Model MODAL
			cachedDOM['$inpCM_modelName'] = $('#inpCM_modelName');
			cachedDOM['$inpCM_testSize'] = $('#inpCM_testSize');
			cachedDOM['$inpCM_firstLayer'] = $('#inpCM_firstLayer');
			cachedDOM['$inpCM_outputActivation'] = $('#inpCM_outputActivation');
			cachedDOM['$inpCM_modelOptimizer'] = $('#inpCM_modelOptimizer');
			cachedDOM['$inpCM_modelLoss'] = $('#inpCM_modelLoss');
			cachedDOM['$inpCM_numberOfEpochs'] = $('#inpCM_numberOfEpochs');
			//-----------------------------
		}

		function onVisualizeModalLoad() {
			cachedDOM['$vis_modelName'] = $('#vis_modelName');
			cachedDOM['$vis_testSize'] = $('#vis_testSize');
			cachedDOM['$vis_firstLayer'] = $('#vis_firstLayer');
			cachedDOM['$vis_outputActivation'] = $('#vis_outputActivation');
			cachedDOM['$vis_modelOptimizer'] = $('#vis_modelOptimizer');
			cachedDOM['$vis_modelLoss'] = $('#vis_modelLoss');
			cachedDOM['$vis_numberOfEpochs'] = $('#vis_numberOfEpochs');
		}

		(function inputValuesOnChange() {
			cachedDOM.$inpTrainFile.change(function (e) {
				trainFile = e.target.files[0];
				cachedDOM.$lblTrainFile.text(e.target.files[0].name);
			});

			cachedDOM.$inpPredictFile.change(function (e) {
				predictFile = e.target.files[0];
				cachedDOM.$lblPredictFile.text(e.target.files[0].name);
			});
		})();

		cachedDOM.$chbRealtimeProgress.on('click', function () {
			if (cachedDOM.$chbRealtimeProgress.prop("checked")) {
				cachedDOM.$divServerMessage.show();
			} else {
				cachedDOM.$divServerMessage.hide();
			}
		});

		configServerMessageBlock();

	});

	function configServerMessageBlock() {
		//This value needs to be the same of $inpUpdateTime
		var intervalId = setInterval(pingServer, 2000);

		cachedDOM.$inpUpdateTime.on('input', function () {
			var refreshTime = parseInt(cachedDOM.$inpUpdateTime.val());
			cachedDOM.$txtUpdateTimeValue.text(refreshTime);

			//Ping server with the value of inpUpateTime (range input 50 - 5000)
			clearInterval(intervalId);
			intervalId = setInterval(pingServer, refreshTime); // Time in milliseconds
		});
	}

	function callNN() {
		//let url = path.join(rootPath, "voiceRecognition");
		let url = path.join(rootPath, "send");

		var formData = new FormData();
		formData.append('csvFiles', trainFile);
		formData.append('csvFiles', predictFile);
		formData.append('text', 'pedrinho');

		axios.post(url, formData, {
			headers: {
				'Content-Type': 'multipart/form-data'
			}
		})
			.then(function (response) {
				console.log(response);
			})
			.catch(function (error) {
				console.log(error);
			});
	}

	function callNNBands() {
		//let url = path.join(rootPath, "voiceRecognition");
		let url = path.join(rootPath, "testBands");
		axios.get(url, {
		})
			.then(function (response) {
				console.log(response);
			})
			.catch(function (error) {
				console.log(error);
			});
	}

	function getModelValues() {
		var jsonRet = {
			modelName: cachedDOM.$inpCM_modelName.val(),
			testSize: cachedDOM.$inpCM_testSize.val(),
			firstlayer: cachedDOM.$inpCM_firstLayer.val(),
			outputActivation: cachedDOM.$inpCM_outputActivation.val(),
			modelOptimizer: cachedDOM.$inpCM_modelOptimizer.val(),
			modelLoss: cachedDOM.$inpCM_modelLoss.val(),
			numberOfEpochs: cachedDOM.$inpCM_numberOfEpochs.val()
		};

		var hiddenLayerDivs = $("#hiddenLayersDiv > div");
		for (var div in hiddenLayerDivs) {
			if (div === 'length') {
				break;
			}
			let id = $(hiddenLayerDivs[div]).prop('id');
			let val = $(hiddenLayerDivs[div]).val();
			jsonRet[id] = val;
		}
		return jsonRet;
	}

	function saveCreationModel() {
		const vals = getModelValues();

		cachedDOM.$vis_modelName.val(vals["modelName"]);
		cachedDOM.$vis_testSize.val(vals["testSize"]);
		cachedDOM.$vis_firstLayer.val(vals["firstLayer"]);
		cachedDOM.$vis_modelOptimizer.val(vals["modelOptimizer"]);
		cachedDOM.$vis_modelLoss.val(vals["modelLoss"]);
		cachedDOM.$vis_outputActivation.val(vals["outputActivation"]);
		cachedDOM.$vis_numberOfEpochs.val(vals["numberOfEpochs"]);

		checkCreationModelData(vals);
		$('#btnVisualizeData').show();
	}

	function checkCreationModelData(inpModelValues) {
		for (var item in inpModelValues) {
			if (isEmpty(inpModelValues[item])) {
				setChipData(false, item);
				return;
			}
		}
		setChipData(true);
		updateStepper(1);

	}

	//TODO: Add vezinho no step
	//Desbolquear Train
	fu   nction updateStepper(step) {
		console.log(cachedDOM.$nnStepper);
		console.log(cachedDOM.$nnStepper.length);
		for(var i = 0; i < cachedDOM.$nnStepper.length; i++){
			//Set step to done
			if(i < step){
				cachedDOM.$nnStepper[i].removeClass('active').addClass('done');
			} 
			//Set step to Active
			else if(i == step){
				cachedDOM.$nnStepper[i].addClass('active').removeClass('done');
			}
			//Set step none
			else {
				cachedDOM.$nnStepper[i].removeClass('active').removeClass('done');
			}
		}
		
	}

	function setChipData(isValid, item) {
		if (!isValid) {
			cachedDOM.$chipDataStatus.removeClass('bg-success').addClass('bg-danger');
			cachedDOM.$chipDataStatus.text("X");
			cachedDOM.$chipDataValue.text("Data missing");
			cachedDOM.$chipTipText.text("Inform " + item);
		}
		else {
			cachedDOM.$chipDataStatus.removeClass('bg-danger').addClass('bg-success');
			cachedDOM.$chipDataStatus.text("V");
			cachedDOM.$chipDataValue.text("All data set");
			cachedDOM.$chipTipText.text("");
		}
	}

	function pingServer() {
		if (!(cachedDOM.$chbRealtimeProgress.prop("checked"))) {
			return;
		}

		let url = path.join(rootPath, "pingClient");
		axios.get(url, {
		})
			.then(function (response) {
				if (currentServerMessage != response.data) {
					currentServerMessage = response.data;

					cachedDOM.$divServerMessage.text(currentServerMessage);
					console.log(currentServerMessage);
				}
			})
			.catch(function (error) {
				console.log(error);
			});
	}

	function addLayer(id, layerName, deleteClickFunc, isHidden = true) {
		try {
			var args = {
				layerId: id,
				inpLlayerId: 'inpCM_' + id,
				activationId: 'activationCM_' + id,
				name: layerName,
				onClick: {
					deleteButton: {
						id: "btnCM_Delete_" + id,
						func: deleteClickFunc
					}
				}
			};
			if (isHidden) {
				templateAppend('hiddenLayersDiv', 'nnLayerTemplate', args);
			} else {
				args['inpLlayerId'] = 'inpCM_firstLayer';
				templateAppend('firstLayerDiv', 'nnLayerTemplate', args);
			}
		} catch (err) {
			console.error(err);
		}
	}

	function addHiddenLayer() {
		//Get quantity of direct divs inside Hidden Layer DIV 
		var count = $("#hiddenLayersDiv > div").length;

		var id = "HiddenLayer_" + count;
		var name = "Hidden Layer " + count;

		addLayer(id, name, deleteHiddenLayer(id));
	}

	function deleteHiddenLayer(id) {
		return (function () {
			$('#' + id).remove();
			renameHiddenLayers();
		});
	}

	//TODO: When delete and create a lot of layers, a behavior broke the delete button of some items
	function renameHiddenLayers() {
		var count = 0;

		var hiddenLayerDivs = $("#hiddenLayersDiv > div");

		for (var div in hiddenLayerDivs) {
			if (div === 'length') {
				break;
			}
			var newId = "HiddenLayer_" + count;
			var name = "Hidden Layer " + count;
			var newButtonId = "btnCM_Delete_" + newId;
			var newInpId = "inpCM_" + newId;
			var newSelectId = 'activationCM_' + newId;

			$(hiddenLayerDivs[div]).prop('id', newId);
			$(hiddenLayerDivs[div]).children().find('.layer-name').text(name);
			$(hiddenLayerDivs[div]).children().find('.close').prop('id', newButtonId);
			$(hiddenLayerDivs[div]).children().find('.input-layer').prop('id', newInpId);
			$(hiddenLayerDivs[div]).children().find('.select-layer').prop('id', newSelectId);

			$("#newButtonId").unbind("click");
			$("#foo").bind("click", deleteHiddenLayer(newId));

			count++;
		}
	}

	function templateAppend(target, template, args) {
		var $target = $('#' + target);
		var $template = $('#' + template).html();

		Mustache.parse($template);
		var rendered = Mustache.render($template, args);
		$target.append(rendered);

		for (var item in args) {
			switch (item) {
				case 'onClick':
					{
						for (var onClick in args[item]) {
							$('#' + args[item][onClick].id).on('click', args[item][onClick].func);
						}
						break;
					}
			}
		}
	}

	//HELPER FUNCTION
	function isEmpty(obj) {
		for (var key in obj) {
			if (obj.hasOwnProperty(key))
				return false;
		}
		return true;
	}

})();