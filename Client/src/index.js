(function NeuralNetworksInit() {
	//import _ from 'lodash';
	const $ = require('jquery');
	const axios = require('axios');
	const path = require('path');

	const cachedDOM = (function () {
		return {
			$inpTrainFile: $('#inpTrainFile'),
			$inpPredictFile: $('#inpPredictFile'),
			$inpUpdateTime: $('#inpUpdateTime'),

			$lblTrainFile: $('#lblTrainFile'),
			$lblPredictFile: $('#lblPredictFile'),

			$chbRealtimeProgress: $('#chbRealtimeProgress'),

			$divServerMessage: $('#divServerMessage'),
			$txtUpdateTimeValue: $("#txtUpdateTimeValue")
		}
	})();

	//POR ALGUM MOTIVO BIZARRO NAO TA CHAMANDO O CONSOLE LOG
	console.log("A");
	
	$(function () {
		const rootPath = "http://localhost:3000";

		var trainFile, predictFile;
		var currentServerMessage = "empty";

		$('#btnSetData').on('click', callNN);
		$('#btnTrainBands').on('click', callNNBands);

		inputValuesOnChange();

		cachedDOM.$chbRealtimeProgress.on('click', function () {
			if (cachedDOM.$chbRealtimeProgress.prop("checked")) {
				cachedDOM.$divServerMessage.show();
			} else {
				cachedDOM.$divServerMessage.hide();
			}
		});

		function inputValuesOnChange() {
			cachedDOM.$inpTrainFile.change(function (e) {
				trainFile = e.target.files[0];
				cachedDOM.$lblTrainFile.text(e.target.files[0].name);
			});

			cachedDOM.$inpPredictFile.change(function (e) {
				predictFile = e.target.files[0];
				cachedDOM.$lblPredictFile.text(e.target.files[0].name);
			});
		}

		//This value needs to be the same of $inpUpdateTime
		var intervalId = setInterval(pingServer, 2000);

		cachedDOM.$inpUpdateTime.on('input', function () {
			var refreshTime = parseInt(cachedDOM.$inpUpdateTime.val());
			cachedDOM.$txtUpdateTimeValue.text(refreshTime);

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
	});
})();