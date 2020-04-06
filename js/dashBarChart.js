var chart = chart || {};

(function() {
    chart.dashLineChart = function () {
        //@todo 3. 툴팁 label 한픽셀 위로
        //@todo 3. 바 끝 라운딩.
        //https://stackoverflow.com/questions/43254153/how-to-create-rounded-bars-for-bar-chart-js-v2
        var containerObj = null;
        var axisContainerObj = null;
        var chartObj = null;
        var config = null;
        var labelArr = [];
        var priceArr = [];
        var perArr = [];
        var colorsArr = [];
        var recreateBln = false;

        // API 에서 받은 데이터를 Chart에 넣을 데이터로 변환.
        function parseData(dataObj){
            labelArr = dataObj.labelArr;
            perArr = dataObj.perArr;
            priceArr = dataObj.priceArr;
            colorsArr = dataObj.colorsArr;
        };

        // 속성 정의
        function setChartConfig(axisVisible){
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
                    tooltips: {
                        backgroundColor: '#15283b',
                        yAlign: 'bottom',
                        xAlign: 'center',
                        bodyAlign: 'center',
                        bodyFontSize: 12,
                        cornerRadius: 15,
                        yPadding : 8,
                        xPadding : 8,
                        custom: function(tooltip) {
                            if (!tooltip) {return};
                            // 툴팁에 앞 박스 안나오게
                            tooltip.displayColors = false;
                            // 툴팁 masking 되는거 패칭
                            if(tooltip.y < 0){
                                tooltip.yAlign = 'top';
                                tooltip.y = tooltip.y + tooltip.height + (tooltip.height/2);
                            }else{
                                tooltip.yAlign = 'bottom';
                            }
                            // if(tooltip.x >= containerObj.width()){
                            //     tooltip.xAlign = 'left';
                            //     tooltip.yAlign = 'center';
                            //     tooltip.x = 10;//containerObj.width() - tooltip.width;
                            // }else{
                            //     tooltip.xAlign = 'center';
                            //     tooltip.yAlign = 'bottom';
                            //     tooltip.x = 10;
                            // }
                        },
                        callbacks: {
                            title: function(tooltipItem, data) {
                                return '';
                            },
                            label: function(tooltipItem, data) {
                                var price = priceArr[tooltipItem.index] || '';

                                price = Math.round(price * 100) / 100;
                                return '$'+price+' ('+perArr[tooltipItem.index]+'%)';
                            },
                            labelTextColor: function(tooltipItem, chart) {
                                return '#ffffff';
                            }
                        }
                    },
                    scales: {
                        xAxes: [{
                            gridLines: {
                                display : true,
                                zeroLineWidth : 0,
                                drawBorder: false,
                                color : ['#dee0e1','#dee0e1','#dee0e1','#dee0e1',0],
                                drawTicks : false
                            },
                            ticks: {
                                display : axisVisible,
                                //labelOffset : -15,
                                autoSkipPadding: 5,
                                min: 0,
                                max: 100,
                                stepSize: 25,
                                fontSize : 14,
                                padding : 9,
                                beginAtZero: true,
                                maxRotation: 0,
                                // X축 Label 10개 단위로 나오게
                                callback: function(dataLabel, index, data) {
                                    return index % 2 === 0 ? dataLabel + '%' : '';
                                }
                            }
                        }],
                        yAxes: [{
                            gridLines: {
                                display : true,
                                drawOnChartArea: false,
                                drawBorder : false,
                                drawTicks : false
                            },
                            ticks: {
                                fontSize : 14,
                                padding : 11,
                                beginAtZero: true
                            },
                            stacked: true
                        }]
                    },
                    animation : copyAxis()
                }
            }
        };

        // 캔버스 동적 생성
        function createCanvas(containerEl, axisEl){
            containerObj = containerEl;
            axisContainerObj = axisEl;
            containerObj.append('<canvas style="z-index: -1"></canvas>');
            axisContainerObj.append('<canvas></canvas>');
        };

        function copyAxis(){
            var _animation = {
                onComplete: function () {

                },
                onProgress: function () {
                    createXAxis();
                }
            }
            return _animation;
        };

        // 차트 컨테이너 리자이즈.
        function resizeContainer(){
            var _tarHeight = (labelArr.length * 34) + 5;
            containerObj.height(_tarHeight);
        };

        // 차트(x축 포함)를  만든다. -
        // 차트를 가린다. -
        // X 축 복사한다. -
        // 차트 X 축 제거 후 다시 그린다. -
        // 차트를 보이게 한다. -
        function createChartWithXaxis(){
            setChartConfig(true);
            if(chartObj){
                chartObj.destroy();
            }
            chartObj = new Chart(containerObj.children('canvas'), config);
        };

        // 차트 X 축 제거 후 다시 그린다. & 차트를 보이게 한다.
        function recreateChartWithoutXaxis(){
            chartObj.destroy();
            setChartConfig(false);
            chartObj = new Chart(containerObj.children('canvas'), config);
        };

        // X축 canvas로 복사하여 동적 생성.
        function createXAxis(){
            if (!recreateBln) {
                var _scale = window.devicePixelRatio;
                var sourceCanvas = chartObj.chart.canvas;
                var copyWidth = chartObj.width;
                var copyHeight = 30;
                var startPoX = 0;
                var startPoY = chartObj.height - copyHeight;
                var targetCtx = axisContainerObj.children('canvas')[0].getContext("2d");
                var scaledWidth = copyWidth * _scale;
                var scaledHeight = copyHeight * _scale;

                targetCtx.scale(_scale, _scale);
                targetCtx.canvas.width = scaledWidth;
                targetCtx.canvas.height = scaledHeight;
                targetCtx.canvas.style.width = `${copyWidth}px`;
                targetCtx.canvas.style.height = `${copyHeight}px`;
                targetCtx.beginPath();       // Start a new path
                targetCtx.moveTo(chartObj.scales['y-axis-0'].width , 0);    // Move the pen to (30, 50)
                targetCtx.lineTo(scaledWidth, 0);  // Draw a line to (150, 100)
                targetCtx.strokeStyle = "#d1d5da";
                targetCtx.stroke();          // Render the path

                targetCtx.drawImage(sourceCanvas, startPoX, startPoY, scaledWidth, scaledHeight,
                    0, 0, scaledWidth, scaledHeight);
                recreateBln = true;
                recreateChartWithoutXaxis();
            }
        };

        // public 업데이트
        this.update = function(chartData){
            recreateBln = false;
            parseData(chartData);
            config.data.labels = labelArr;
            config.data.datasets[0].data = priceArr;
            resizeContainer();
            createChartWithXaxis();
        };

        // public 초기화
        this.init = function(containerEl, chartData, axisEl) {
            createCanvas(containerEl, axisEl);
            parseData(chartData);
            resizeContainer();
            createChartWithXaxis();
            Chart.defaults.global.defaultFontFamily = 'Open Sans';
        };
    }
}());