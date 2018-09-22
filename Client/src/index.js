//import _ from 'lodash';
import $ from 'jquery';
import axios from 'axios';
import path from 'path'

$(function () {

	const rootPath = "http://localhost:3000";

	var trainFile, predictFile;
	var currentServerMessage = "empty";

	var $inpTrainFile = $('#inpTrainFile');
	var $inpPredictFile = $('#inpPredictFile');
	var $lblTrainFile = $('#lblTrainFile');
	var $lblPredictFile = $('#lblPredictFile');
	var $inpUpdateTime = $('#inpUpdateTime');

	var $chbRealtimeProgress = $('#chbRealtimeProgress');

	$('#btnTrain').on('click', callNN);
	$('#btnTrainBands').on('click', callNNBands);

	//PRECISA SER FEITO:
	// - passar parametros de treino da rede (layers, tipo de treino)

	// update value of inputs
	$inpTrainFile.change(function (e) {
		trainFile = e.target.files[0];
		$lblTrainFile.text(e.target.files[0].name);
	});

	$inpPredictFile.change(function (e) {
		predictFile = e.target.files[0];
		$lblPredictFile.text(e.target.files[0].name);
	});

	$chbRealtimeProgress.on('click', function () {
		if ($chbRealtimeProgress.prop("checked")) {
			$('#divServerMessage').show();
		} else {
			$('#divServerMessage').hide();
		}
	});

	//This value needs to be the same of $inpUpdateTime
	var intervalId = setInterval(pingServer, 2000);

	$inpUpdateTime.on('input',function () {
		var refreshTime = parseInt($inpUpdateTime.val());
		$("#txtUpdateTimeValue").text(refreshTime);

		//Ping server with the value of inpUpateTime (range input 50 - 5000)
		clearInterval(intervalId);
		intervalId = setInterval(pingServer, refreshTime); // Time in milliseconds
	})

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

		// axios.get(url, {
		// 	params: {
		// 		trainDataPath: "trainPath...",
		// 		predictDataPath: "predictPath...",
		// 		numberOfLayers: 2,
		// 		hiddenLayersSize: 5,
		// 		activationFunc: "sigmoid",
		// 		splitTestSize: 0.33
		// 	}
		// })
		// 	.then(function (response) {
		// 		console.log(response);
		// 	})
		// 	.catch(function (error) {
		// 		console.log(error);
		// 	})
		// 	.then(function () {
		// 		// always executed
		// 	});
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

	//Criar este sistema de ping no server de forma parametrizavel:
	// - toggle atualizar em tempo real
	// - determinar tempo de atualização (em milisegundos)

	function pingServer() {
		if (!($chbRealtimeProgress.prop("checked"))) {
			return;
		}

		let url = path.join(rootPath, "pingClient");
		axios.get(url, {
		})
			.then(function (response) {
				if (currentServerMessage != response.data) {
					currentServerMessage = response.data;
					console.log(currentServerMessage);
					$("#txtServerMessage").text(currentServerMessage);
				}
			})
			.catch(function (error) {
				console.log(error);
			});
	}
});
