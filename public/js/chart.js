async function setChart() {
    const data = await fetch('/data')
        .then(res => res.json());
    const rows = data.map(r => ({
        ...r,
        year: r['bond'].slice(2),
        cd: r['bond'].slice(0, 2),
    }));

    var ctx = document.getElementById('myChart').getContext('2d');
    var scatterChart = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'GD',
                labels: rows.filter(b => b['cd'] == "GD").map(b => b['bond']),
                data: rows.filter(b => b['cd'] == "GD").map(b => ({ x: b['year'], y: b['d'] })),
                backgroundColor: '#5555FF',
                pointRadius: 8,
            }, {
                label: 'AL',
                labels: rows.filter(b => b['cd'] == "AL").map(b => b['bond']),
                data: rows.filter(b => b['cd'] == "AL").map(b => ({ x: b['year'], y: b['d'] })),
                backgroundColor: '#55FF55',
                pointRadius: 8,
            }]
        },
        options: {
            tooltips: {
                callbacks: {
                    label: function (tooltipItem, data) {
                        var label = data.datasets[tooltipItem.datasetIndex].labels[tooltipItem.index];
                        return label + ': (' + tooltipItem.xLabel + ', ' + tooltipItem.yLabel + ')';
                    }
                }
            }
        }
    });
}


window.onload = function () {
    setChart();
}