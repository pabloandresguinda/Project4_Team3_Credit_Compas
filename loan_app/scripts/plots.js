// plots.js

// Function to render a plot
function renderPlot(plotId, data, layout) {
    Plotly.newPlot(plotId, data, layout, { responsive: true });
}

// Function to update an existing plot
function updatePlot(plotId, data, layout) {
    Plotly.react(plotId, data, layout, { responsive: true });
}
