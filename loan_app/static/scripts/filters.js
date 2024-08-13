// filters.js

function applyFilters() {
    var year = $('#year').val();
    var state = $('#state').val();
    var loanStatus = $('#loan-status').val();

    $.getJSON('/filter_data', { year: year, state: state, loan_status: loanStatus })
        .done(function (data) {
            updatePlots(data);
        })
        .fail(function (jqXHR, textStatus, errorThrown) {
            console.error('Error fetching data:', textStatus, errorThrown);
        });
}

function updatePlots(data) {
    if (data) {
        Plotly.react('plot1', data.plot1 ? data.plot1.data : [], data.plot1 ? data.plot1.layout : {}, { responsive: true });
        Plotly.react('plot2', data.plot2 ? data.plot2.data : [], data.plot2 ? data.plot2.layout : {}, { responsive: true });
        Plotly.react('plot3', data.plot3 ? data.plot3.data : [], data.plot3 ? data.plot3.layout : {}, { responsive: true });
        Plotly.react('plot4', data.plot4 ? data.plot4.data : [], data.plot4 ? data.plot4.layout : {}, { responsive: true });
        Plotly.react('plot5', data.plot5 ? data.plot5.data : [], data.plot5 ? data.plot5.layout : {}, { responsive: true });
        Plotly.react('plot6', data.plot6 ? data.plot6.data : [], data.plot6 ? data.plot6.layout : {}, { responsive: true });
    } else {
        console.error('Data is undefined or null');
    }
}

function renderInitialPlots() {
    $.getJSON('/initial_data')
        .done(function (data) {
            Plotly.newPlot('plot1', data.plot1.data, data.plot1.layout, { responsive: true });
            Plotly.newPlot('plot2', data.plot2.data, data.plot2.layout, { responsive: true });
            Plotly.newPlot('plot3', data.plot3.data, data.plot3.layout, { responsive: true });
            Plotly.newPlot('plot4', data.plot4.data, data.plot4.layout, { responsive: true });
            Plotly.newPlot('plot5', data.plot5.data, data.plot5.layout, { responsive: true });
            Plotly.newPlot('plot6', data.plot6.data, data.plot6.layout, { responsive: true });
        })
        .fail(function (jqXHR, textStatus, errorThrown) {
            console.error('Error fetching initial data:', textStatus, errorThrown);
        });
}

// Bind filter application to form submission or changes
document.addEventListener('DOMContentLoaded', function () {
    $('#filter-form').on('submit', function (e) {
        e.preventDefault();
        applyFilters();
    });
    renderInitialPlots();
});
