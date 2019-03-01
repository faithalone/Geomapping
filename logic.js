// Store query variables
var queryURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

var tectonicURL = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";

// Perform a GET request to the query URL
d3.json(queryURL, function(data) {
  // Once we get a response, send the data.features object to the createFeatures function
  createFeatures(data.features);
});

function chooseColor(magnitude) {
  switch (magnitude) {
  case magnitude <1:
    return "yellow";
    break;
  case magnitude <2:
    return "red";
    break;
  case magnitude <3:
    return "brown";
    break;
  case magnitude <4:
    return "green";
    break;
  case magnitude <5:
    return "purple";
    break;
  default:
    return "orange"
  }
}

//Change the maginutde of the earthquake by a factor of 20,000 for the radius of the circle. 
function markerSize(magnitude){
  return magnitude*4
}


function createFeatures(earthquakeData) {

  // Define a function we want to run once for each feature in the features array
  // Give each feature a popup describing the place and time of the earthquake
  function onEachFeature(feature, layer) {
    layer.bindPopup("<h3>Magnitude: " + feature.properties.mag +
      "</h3><h3>Location: " + feature.properties.place +
      "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
  }

  
  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
  var earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature,

    pointToLayer: function (feature, latlng) {
			return L.circleMarker(latlng, {
				radius: markerSize(feature.properties.mag),
        // Call the chooseColor function to decide which color to color our magnitude (color based on borough)
        fillColor: chooseColor(feature.properties.mag),
				color: "#000",
				weight: 1.5,
				opacity: 1,
				fillOpacity: 0.8
			});
    }
  })

  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes);
}


function createMap(earthquakes) {

  // Define streetmap and darkmap layers
  var streetmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.streets",
    accessToken: API_KEY
  });

  var darkmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.dark",
    accessToken: API_KEY
  });

 
  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Street Map": streetmap,
    "Dark Map": darkmap
  };

  // Create a layer for the tectonic plates
  var tectonicBoundaries = new L.LayerGroup();

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    Earthquakes: earthquakes,
    "Tectonic": tectonicBoundaries 
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 5,
    layers: [streetmap, earthquakes, tectonicBoundaries]
  });

  // Read the Tectonic Plates data
  d3.json(tectonicURL, function(BoundariesData) {
    L.geoJSON(BoundariesData, {
      color: "yellow",
      weight: 2
    }).addTo(tectonicBoundaries);
  });

  // Add the layer control to the map
 L.control.layers(baseMaps, overlayMaps, {
  collapsed: false
  }).addTo(myMap);

}




  
