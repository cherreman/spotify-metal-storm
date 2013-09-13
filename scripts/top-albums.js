require([
	'$api/models',
	'$views/image#Image',
	'$views/buttons#PlayButton',
	"scripts/service/ScrapeService"
], function (models, Image, PlayButton, scrapeService) {
	'use strict';

	var type = "year";
	var typeValue = 2013;

	var loadAlbums = function () {
		clearResults();
		setTitle();

		var promise;

		if (type == "year") {
			promise = scrapeService.getTopAlbumsOfYear(typeValue);
		} else if (type == "decade") {
			promise = scrapeService.getTopAlbumsOfDecade(typeValue);
		} else if (type == "style") {
			promise = scrapeService.getTopAlbumsOfStyle(typeValue);
		}

		promise.done(function (result) {
			getAlbumIdsAndShowAlbums(result)
		});
	};

	var clearResults = function () {
		document.getElementById('albumCoverContainer').innerHTML = "";
	};

	var setTitle = function () {
		if (typeValue == "") {
			setHeading("Top 200 albums");
		} else if (type == "year") {
			setHeading("Top 20 albums of " + typeValue);
		} else if (type == "decade") {
			setHeading("Top 100 albums decade " + typeValue + "0");
		} else if (type == "style") {
			setHeading("Top 100 " + typeValue + " albums");
		}
	};

	var setHeading = function (value) {
		document.getElementById("heading").innerHTML = value;
	};

	var getAlbumIdsAndShowAlbums = function (albums) {
		for (var i = 0; i <= albums.length; i++) {
			getAlbumIdAndShowAlbum(i + 1, albums[i]);
		}
	};

	var getAlbumIdAndShowAlbum = function (rank, albumInfo) {
		var albumView = document.createElement("div");
		albumView.style.width = "180px";
		albumView.style.height = "230px";
		albumView.style.cssFloat = "left";
		albumView.style.textAlign = "center";
		document.getElementById('albumCoverContainer').appendChild(albumView);

		var req = new XMLHttpRequest;
		req.overrideMimeType("application/json");
		req.onreadystatechange = function () {
			if (req.readyState == 4) {
				var result = JSON.parse(req.responseText);
				var album;
				var image;

				if (result.albums.length > 0) {
					album = models.Album.fromURI(result.albums[0].href);
					image = Image.forAlbum(album, {player: true});
				} else {
					image = Image.fromSource("not-available.png");
				}

				image.setSize(150, 150);
				image.setOverlay("", rank + " - " + albumInfo.rating);
				image.node.style.margin = "auto";
				image.node.style.marginBottom = "10px";
				albumView.appendChild(image.node);

				var bandText;

				// If the album is not found, we need to retrieve the artist via
				// http://ws.spotify.com/search/1/artist.json?q=[name]
				if (result.albums.length > 0 && result.albums[0].artists.length > 0) {
					bandText = document.createElement("a");
					bandText.setAttribute("href", result.albums[0].artists[0].href);
				} else {
					bandText = document.createElement("span");
				}

				bandText.style.fontWeight = "bold";
				bandText.appendChild(document.createTextNode(decodeHTML(albumInfo.band)));
				albumView.appendChild(bandText);
				albumView.appendChild(document.createElement("br"));

				if (album) {
					var albumLink = document.createElement("a");
					albumLink.setAttribute("href", result.albums[0].href);
					albumLink.appendChild(document.createTextNode(decodeHTML(albumInfo.name)));
					albumView.appendChild(albumLink);
				} else {
					var albumText = document.createElement("span");
					albumText.appendChild(document.createTextNode(decodeHTML(albumInfo.name)));
					albumView.appendChild(albumText);
				}

				req = null;
			}
		};
		req.open('GET', "http://ws.spotify.com/search/1/album.json?q=" + encodeURIComponent(albumInfo.band) + "+" + encodeURIComponent(albumInfo.name), true);
		req.send(null);
	};

	var decodeHTML = function (text) {
		var div = document.createElement('div');
		div.innerHTML = text;
		return div.firstChild.nodeValue;
	};

	var application_argumentsHandler = function (event) {
		var args = models.application.arguments;
		//alert("args: " + args.length + " - " + args);
		if (args.length > 0) {
			type = args[0];
			if (args.length > 1) {
				typeValue = args[1];
			} else {
				typeValue = "";
			}
			loadAlbums();
		}
	};

	models.application.addEventListener("arguments", application_argumentsHandler);

	exports.loadAlbums = loadAlbums;
});
