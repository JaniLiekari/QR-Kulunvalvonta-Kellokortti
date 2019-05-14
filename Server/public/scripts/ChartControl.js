var ctx = document.getElementById("myChart").getContext('2d');
var myChart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: ["Monday 7:00-11:00", "Monday 11:00-15:00", "Monday 15:00-19:00", 
                "Tuesday 7:00-11:00","Tuesday 7:00-15:00", "Tuesday 15:00-19:00",
                "Wednesday 7:00-11:00", "Wednesday 7:00-15:00", "Wednesday 15:00-19:00",
                "Thursday 7:00-11:00", "Thursday 7:00-15:00", "Thursday 15:00-19:00", 
                "Friday 7:00-11:00", "Friday 7:00-15:00", "Friday 15:00-19:00"],
        datasets: [{
            label: '# Signed on this week',
            data: [12,12,12,19,19,19,3,3,3,5,5,5,2,2,2],
            backgroundColor: [
                'rgba(255, 99, 132, 0.6)',
                'rgba(255, 99, 132, 0.6)',
                'rgba(255, 99, 132, 0.6)',

                'rgba(54, 162, 235, 0.6)',
                'rgba(54, 162, 235, 0.6)',
                'rgba(54, 162, 235, 0.6)',

                'rgba(255, 206, 86, 0.6)',
                'rgba(255, 206, 86, 0.6)',
                'rgba(255, 206, 86, 0.6)',

                'rgba(75, 192, 192, 0.6)',
                'rgba(75, 192, 192, 0.6)',
                'rgba(75, 192, 192, 0.6)',

                'rgba(153, 102, 255, 0.6)',
                'rgba(153, 102, 255, 0.6)',
                'rgba(153, 102, 255, 0.6)',

                'rgba(255, 159, 64, 0.6)',
                'rgba(255, 159, 64, 0.6)',
                'rgba(255, 159, 64, 0.6)'
            ],
            borderColor: [
                'rgba(255,99,132,1)',
                'rgba(255,99,132,1)',
                'rgba(255,99,132,1)',

                'rgba(54, 162, 235, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(54, 162, 235, 1)',

                'rgba(255, 206, 86, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(255, 206, 86, 1)',

                'rgba(75, 192, 192, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(75, 192, 192, 1)',

                'rgba(153, 102, 255, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(153, 102, 255, 1)',

                'rgba(255, 159, 64, 1)',
                'rgba(255, 159, 64, 1)',
                'rgba(255, 159, 64, 1)'
            ],
            borderWidth: 1
        }]
    },
    options: {
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero:true
                }
            }]
        }
    }
});