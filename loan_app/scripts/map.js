// map.js

// Function to initialize the map
function initializeMap() {
    // Set up the initial map view
    var map = L.map('map').setView([37.7749, -122.4194], 5);

    // Add the OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: "&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
    }).addTo(map);

    // Fetch the GeoJSON data
    fetch('static/us-states-updated.json')
        .then(response => response.json())
        .then(data => {
            // Add GeoJSON layers to the map
            addGeoJsonLayers(map, data);
            addLayerControl(map);
            addDefaultLegend(map);
        })
        .catch(error => {
            console.error("Error fetching GeoJSON data:", error);
        });
}

// Function to create GeoJSON layer with given property and colorType
function createGeoJsonLayer(property, colorType, geojsonData) {
    return L.geoJson(geojsonData, {
        style: function (feature) {
            return {
                fillColor: getColor(feature.properties[property], colorType),
                weight: 2,
                opacity: 1,
                color: 'white',
                dashArray: '3',
                fillOpacity: 0.7
            };
        },
        onEachFeature: function (feature, layer) {
            layer.on({
                mouseover: highlightFeature,
                mouseout: resetHighlight,
                click: showPopup
            });
            layer.property = property;
            var state = feature.properties.name;
            var dataValue = feature.properties[property];
            layer.bindPopup(`<strong>${state}</strong><br>${property.replace(/_/g, ' ').toUpperCase()}: ${dataValue !== undefined ? dataValue.toLocaleString() : 'Data not available'}`);
        }
    });
}

// Function to add GeoJSON layers to the map
function addGeoJsonLayers(map, geojsonData) {
    // Define the layers with corresponding data properties and colors
    var layerGroups = {
        'Sum of Loan Amount': createGeoJsonLayer('sum_loan_amnt', 'sum_loan_amnt', geojsonData),
        'Average Income to Loan Ratio': createGeoJsonLayer('avg_income_to_loan_ratio', 'avg_income_to_loan_ratio', geojsonData),
        'Percentage of Loans Paid': createGeoJsonLayer('percent_loans_paid', 'percent_loans_paid', geojsonData),
        'Loans Approved': createGeoJsonLayer('loansapproved', 'loansapproved', geojsonData)
    };

    // Create a layer group and add all layers to the map
    var allLayers = L.layerGroup().addTo(map);
    for (var key in layerGroups) {
        layerGroups[key].addTo(allLayers);
    }

    // Store the layer groups globally for use in layer control
    window.layerGroups = layerGroups;
}

// Function to add layer controls to the map
function addLayerControl(map) {
    L.control.layers(null, {
        'Sum of Loan Amount': layerGroups['Sum of Loan Amount'],
        'Average Income to Loan Ratio': layerGroups['Average Income to Loan Ratio'],
        'Percentage of Loans Paid': layerGroups['Percentage of Loans Paid'],
        'Loans Approved': layerGroups['Loans Approved']
    }).addTo(map);
}

// Function to add the default legend to the map
function addDefaultLegend(map) {
    var defaultLegend = addLegend('sum_loan_amnt');
    defaultLegend.addTo(map);
}

// Function to get the color based on the value and type
function getColor(value, colorType) {
    // Define the color scale based on the type
    var colors = {
        'sum_loan_amnt': ['#f7fbff', '#deebf7', '#c6dbef', '#9ecae1', '#6baed6', '#4292c6', '#2171b5', '#08519c', '#08306b'],
        'avg_income_to_loan_ratio': ['#fff5f0', '#fee0d2', '#fcbba1', '#fc9272', '#fb6a4a', '#ef3b2c', '#cb181d', '#a50f15', '#67000d'],
        'percent_loans_paid': ['#f7fcf5', '#e5f5e0', '#c7e9c0', '#a1d99b', '#74c476', '#41ab5d', '#238b45', '#006d2c', '#00441b'],
        'loansapproved': ['#f7f7f7', '#d9d9d9', '#bdbdbd', '#969696', '#737373', '#525252', '#252525', '#000000']
    };

    // Calculate the color index based on the value
    var maxValue = 100;
    var index = Math.floor((value / maxValue) * (colors[colorType].length - 1));
    return colors[colorType][index];
}

// Function to highlight feature on mouseover
function highlightFeature(e) {
    var layer = e.target;

    layer.setStyle({
        weight: 5,
        color: '#666',
        dashArray: '',
        fillOpacity: 0.7
    });

    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
    }
}

// Function to reset highlight on mouseout
function resetHighlight(e) {
    var layer = e.target;
    layer.setStyle({
        weight: 2,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.7
    });
}

// Function to show popup on click
function showPopup(e) {
    var layer = e.target;
    layer.openPopup();
}

// Initialize the map on page load
document.addEventListener('DOMContentLoaded', initializeMap);
