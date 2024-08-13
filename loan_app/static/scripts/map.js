// map.js

// Initialize the map
function initializeMap() {
    var map = L.map('map').setView([37.7749, -122.4194], 5);

    // Add a tile layer to the map
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: "&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
    }).addTo(map);

    // Load GeoJSON data for US states (data should be assigned before map initialization)
    fetchGeoJsonData().then(statesGeoJSON => {
        // Add geoJSON layers
        addGeoJsonLayers(map, statesGeoJSON);

        // Add layer control
        addLayerControl(map);

        // Add default legend
        addDefaultLegend(map);
    });
}

// Fetch GeoJSON data
function fetchGeoJsonData() {
    // Replace with actual URL or method to fetch your GeoJSON data
    return fetch('{{ states_geojson|safe }}') // Adjust the URL accordingly
        .then(response => response.json());
}

// Function to get color based on property value
function getColor(value, type) {
    const thresholds = {
        'loansapproved': [10000, 5000, 2000, 1000, 500, 200, 100, 50],
        'percent_loans_paid': [90, 80, 70, 60, 50, 40, 30, 20],
        'avg_income_to_loan_ratio': [10, 8, 6, 4, 2, 1, 0.5, 0],
        'sum_loan_amnt': [500000, 300000, 200000, 100000, 50000, 10000, 5000, 1000]
    };
    const colors = {
        'loansapproved': ['#FFEDA0', '#FED976', '#FEB24C', '#FD8D3C', '#FC4E2A', '#E31A1C', '#BD0026', '#800026'],
        'percent_loans_paid': ['#FFEDA0', '#FED976', '#FEB24C', '#FD8D3C', '#FC4E2A', '#E31A1C', '#BD0026', '#800026'],
        'avg_income_to_loan_ratio': ['#FFEDA0', '#FED976', '#FEB24C', '#FD8D3C', '#FC4E2A', '#E31A1C', '#BD0026', '#800026'],
        'sum_loan_amnt': ['#FFEDA0', '#FED976', '#FEB24C', '#FD8D3C', '#FC4E2A', '#E31A1C', '#BD0026', '#800026']
    };
    const typeThresholds = thresholds[type];
    const typeColors = colors[type];

    for (let i = 0; i < typeThresholds.length; i++) {
        if (value > typeThresholds[i]) {
            return typeColors[i];
        }
    }
    return typeColors[typeColors.length - 1];
}

// Function to create and add GeoJSON layers
function createGeoJsonLayer(property, colorType, statesGeoJSON) {
    return L.geoJson(statesGeoJSON, {
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
            layer.property = property; // Store property for use in popup
            var state = feature.properties.name;
            var dataValue = feature.properties[property];
            if (dataValue !== undefined) {
                layer.bindPopup(`<strong>${state}</strong><br>${property.replace(/_/g, ' ').toUpperCase()}: ${dataValue.toLocaleString()}`);
            } else {
                layer.bindPopup(`<strong>${state}</strong><br>${property.replace(/_/g, ' ').toUpperCase()}: Data not available`);
            }
        }
    });
}

// Highlight feature function
function highlightFeature(e) {
    var layer = e.target;
    var originalStyle = {
        weight: layer.options.weight,
        color: layer.options.color,
        dashArray: layer.options.dashArray,
        fillOpacity: layer.options.fillOpacity
    };
    layer.options.originalStyle = originalStyle; // Store original style for resetting
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

// Reset highlight function
function resetHighlight(e) {
    var layer = e.target;
    if (layer.options.originalStyle) {
        layer.setStyle(layer.options.originalStyle);
    }
}

// Show popup with aggregated data from all selected layers
function showPopup(e) {
    var layer = e.target;
    var state = layer.feature.properties.name;
    var popupContent = `<strong>${state}</strong><br>`;

    // Collect data from all layers
    for (var key in layerGroups) {
        var group = layerGroups[key];
        if (group.hasLayer(layer)) {
            var property = key.replace(/ /g, '_').toLowerCase();
            var dataValue = layer.feature.properties[property];
            if (dataValue !== undefined) {
                popupContent += `${key}: ${dataValue.toLocaleString()}<br>`;
            } else {
                popupContent += `${key}: Data not available<br>`;
            }
        }
    }

    layer.bindPopup(popupContent).openPopup();
}

// Function to add legends
function addLegend(type) {
    var legend = L.control({ position: 'bottomright' });

    legend.onAdd = function () {
        var div = L.DomUtil.create('div', 'info legend');
        const thresholds = {
            'loansapproved': [50, 100, 200, 500, 1000, 2000, 5000, 10000],
            'percent_loans_paid': [20, 30, 40, 50, 60, 70, 80, 90],
            'avg_income_to_loan_ratio': [0, 0.5, 1, 2, 4, 6, 8, 10],
            'sum_loan_amnt': [1000, 5000, 10000, 50000, 100000, 200000, 300000, 500000]
        };
        const colors = {
            'loansapproved': ['#FFEDA0', '#FED976', '#FEB24C', '#FD8D3C', '#FC4E2A', '#E31A1C', '#BD0026', '#800026'],
            'percent_loans_paid': ['#FFEDA0', '#FED976', '#FEB24C', '#FD8D3C', '#FC4E2A', '#E31A1C', '#BD0026', '#800026'],
            'avg_income_to_loan_ratio': ['#FFEDA0', '#FED976', '#FEB24C', '#FD8D3C', '#FC4E2A', '#E31A1C', '#BD0026', '#800026'],
            'sum_loan_amnt': ['#FFEDA0', '#FED976', '#FEB24C', '#FD8D3C', '#FC4E2A', '#E31A1C', '#BD0026', '#800026']
        };

        div.innerHTML = '<strong>' + type.replace(/_/g, ' ').toUpperCase() + '</strong><br>';
        for (var i = 0; i < thresholds[type].length; i++) {
            div.innerHTML +=
                '<i style="background:' + colors[type][i] + '"></i> ' +
                (thresholds[type][i] ? thresholds[type][i] + (thresholds[type][i + 1] ? '&ndash;' + thresholds[type][i + 1] : '+') + '<br>' : '+');
        }

        return div;
    };

    return legend;
}

// Function to add GeoJSON layers to the map
function addGeoJsonLayers(map, statesGeoJSON) {
    var sumLoanAmountLayer = createGeoJsonLayer('sum_loan_amnt', 'sum_loan_amnt', statesGeoJSON);
    var avgIncomeToLoanRatioLayer = createGeoJsonLayer('avg_income_to_loan_ratio', 'avg_income_to_loan_ratio', statesGeoJSON);
    var percentLoansPaidLayer = createGeoJsonLayer('percent_loans_paid', 'percent_loans_paid', statesGeoJSON);
    var loansapprovedLayer = createGeoJsonLayer('loansapproved', 'loansapproved', statesGeoJSON);

    var layerGroups = {
        'Sum Loan Amount': sumLoanAmountLayer,
        'Average Income to Loan Ratio': avgIncomeToLoanRatioLayer,
        'Percent Loans Paid': percentLoansPaidLayer,
        'Loans Approved': loansapprovedLayer
    };

    for (var key in layerGroups) {
        layerGroups[key].addTo(map);
    }

    // Store layer groups globally for popup function
    window.layerGroups = layerGroups;
}

// Function to add layer control
function addLayerControl(map) {
    var baseMaps = {};
    var overlayMaps = {
        "Sum Loan Amount": window.layerGroups['Sum Loan Amount'],
        "Average Income to Loan Ratio": window.layerGroups['Average Income to Loan Ratio'],
        "Percent Loans Paid": window.layerGroups['Percent Loans Paid'],
        "Loans Approved": window.layerGroups['Loans Approved']
    };

    L.control.layers(baseMaps, overlayMaps).addTo(map);
}

// Function to add default legend
function addDefaultLegend(map) {
    var defaultLegend = addLegend('sum_loan_amnt');
    defaultLegend.addTo(map);
}

// Initialize the map on page load
document.addEventListener('DOMContentLoaded', initializeMap);
