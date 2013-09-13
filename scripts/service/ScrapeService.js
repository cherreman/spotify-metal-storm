require([
	"$api/models"
], function (models) {

	var getTopAlbumsOfYear = function (year) {
		return getTopAlbums("album_year", year);
	};

	var getTopAlbumsOfDecade = function (decade) {
		return getTopAlbums("album_decade", decade);
	};

	var getTopAlbumsOfStyle = function (style) {
		return getTopAlbums("album_style", style);
	};

	var getTopAlbums = function (param, value) {
		var result = new models.Promise();
		var albums = [];
		var xhr = new XMLHttpRequest();

		xhr.onreadystatechange = function (param, value) {
			if (xhr.readyState == 4) {
				var referenceIndex = xhr.responseText.indexOf("megatitle");
				var fromTableIndex = xhr.responseText.indexOf("<table", referenceIndex);
				var toTableIndex = xhr.responseText.indexOf("/table>", fromTableIndex) + 8;
				var rawData = xhr.responseText.substring(fromTableIndex, toTableIndex);
				var albumDataFound = true;
				var lastTrIndex = 0;

				while (albumDataFound) {
					var trBeginIndex = rawData.indexOf("<tr>", lastTrIndex);
					var trEndIndex = rawData.indexOf("</tr>", lastTrIndex);
					var trData = rawData.substring(trBeginIndex, trEndIndex);
					albums.push(getAlbumData(trData));
					lastTrIndex = trEndIndex + 1;
					albumDataFound = (rawData.indexOf("<tr>", lastTrIndex) > -1);
				}

				console.log("Loaded '" + albums.length + "' albums.");

				result.setDone(albums);
			}
		};

		xhr.open('GET', 'http://www.metalstorm.net/bands/albums_top.php?' + param + '=' + value, true);
		xhr.send(null);

		return result;
	};

	var getAlbumData = function (trData) {
		return {band: getBandName(trData), name: getAlbumName(trData), rating: getRating(trData)};
	};

	var getBandName = function (trData) {
		return getLinkText(trData, "band.php");
	};

	var getAlbumName = function (trData) {
		return getLinkText(trData, "album.php");
	};

	var getRating = function (trData) {
		return getLinkText(trData, "rating.php");
	};

	var getLinkText = function (trData, ref) {
		var refIndex = trData.indexOf(ref);
		var fromIndex = trData.indexOf(">", refIndex) + 1;
		var toIndex = trData.indexOf("</a>", refIndex);
		return trData.substring(fromIndex, toIndex);
	};

	exports.getTopAlbumsOfYear = getTopAlbumsOfYear;
	exports.getTopAlbumsOfDecade = getTopAlbumsOfDecade;
	exports.getTopAlbumsOfStyle = getTopAlbumsOfStyle;
});