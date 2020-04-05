var chart = chart || {};

(function() {
    chart.dashLineChart = function () {
        //@todo 1. 스크롤 만들어야함.
        //@todo 2. 바 위아래 간격 고정시키기
        //@todo 3. 툴팁 label 한픽셀 위로
        var chartObj = null;
        var config = null;
        var labelArr = [];
        var priceArr = [];
        var perArr = [];
        var colorsArr = [];

        // API 에서 받은 데이터를 Chart에 넣을 데이터로 변환.
        function parseData(dataObj){
            labelArr = dataObj.labelArr;
            perArr = dataObj.perArr;
            priceArr = dataObj.priceArr;
            colorsArr = dataObj.colorsArr;
        };

        // 속성 정의
        function setChartConfig(){
            config = {
                type: 'horizontalBar',
                data: {
                    labels: labelArr,
                    datasets: [{
                        backgroundColor: colorsArr,
                        barThickness: 12,
                        data: perArr
                    }]
                },
                options: {
                    maintainAspectRatio: false,
                    legend: {
                        display:false
                    },
                    // Elements options apply to all of the options unless overridden in a dataset
                    // In this case, we are setting the border of each horizontal bar to be 2px wide
                    elements: {
                        rectangle: {
                            borderWidth: 2,
                        }
                    }
                },
                scales: {
                    xAxes: [{
                        gridLines : {
                            display : false
                        }
                    }],
                    yAxes: [{
                        gridLines : {
                            display : false
                        }
                    }]
                }
            }
        };
        // 캔버스 동적 생성
        function createCanvas(canvasEl){
            canvasEl.append('<canvas style="position: relative;"></canvas>');
        };

        // public 업데이트
        this.update = function(chartData){
            parseData(chartData);
            config.data.labels = labelArr;
            config.data.datasets[0].data = priceArr;
            chartObj.update();
        };

        // public 초기화
        this.init = function(canvasEl, chartData) {
            createCanvas(canvasEl);
            parseData(chartData);
            setChartConfig();
            chartObj = new Chart(canvasEl.children('canvas'), config);
            Chart.defaults.global.defaultFontFamily = 'Open Sans';
        };
    }
}());