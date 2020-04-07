var chart = chart || {};

(function() {
    chart.dashLineChart = function () {
        //@todo 1. 전체적으로 약2픽셀 아래로 와야함.
        //@todo 2. 툴팁 label 한픽셀 위로
        //@todo 2. 해당월 전체 날짜 표기, 데이터 들어온것만 표시.
        var chartObj = null;
        var config = null;
        var labelArr = [];
        var priceArr = [];
        var dateArr = [];

        // API 에서 받은 데이터를 Chart에 넣을 데이터로 변환.
        function parseData(dataObj){
            labelArr = [];
            dateArr = dataObj.dateArr;
            priceArr = dataObj.priceArr;
            var _totalDays = Common.utils.getDays(dataObj.year,dataObj.month);
            for(var i=0; i<_totalDays; i++) {
                labelArr.push('Day'+(i+1));
            }
            console.log(labelArr);
        };

        // 속성 정의
        function setChartConfig(){
            // 차트 속성 정의
            config = {
                type: 'LineWithLine',
                data: {
                    labels: labelArr,
                    datasets: [{
                        fill : false,
                        data: priceArr,
                        borderColor: '#0078ee',
                        borderWidth: 3,
                        pointBackgroundColor : '#0078ee'
                    }]
                },
                options: {
                    maintainAspectRatio: false,
                    legend: { //범례
                        display: false,
                    },
                    tooltips: {
                        mode: 'index',
                        intersect: false, // 그리드라인 오버시 툴팁 나오게
                        backgroundColor: '#15283b',
                        yAlign: 'top',
                        xAlign: 'center',
                        bodyAlign: 'center',
                        bodyFontSize: 12,
                        cornerRadius: 15,
                        yPadding : 8,
                        xPadding : 8,
                        custom: function(tooltip) {
                            if (!tooltip) {return}
                            // 툴팁에 앞 박스 안나오게
                            tooltip.displayColors = false;
                        },
                        callbacks: {
                            title: function() {
                                return '';
                            },
                            label: function(tooltipItem, data) {
                                var label =
                                    data.datasets[tooltipItem.datasetIndex].label ||
                                    Math.round(tooltipItem.yLabel * 100) / 100;
                                return dateArr[tooltipItem.index]+'  $'+label;
                            },
                            labelTextColor: function() {
                                return '#ffffff';
                            }
                        }
                    },
                    scales: {
                        xAxes: [{
                            gridLines : {
                                display : true,
                                drawOnChartArea: false,
                                drawTicks : false
                            },
                            ticks: {
                                maxTicksLimit : 100,
                                fontSize : 14,
                                padding : 10,
                                beginAtZero: true,
                                maxRotation: 0,
                                // X축 Label 10개 단위로 나오게
                                callback: function(dataLabel, index, data) {
                                    var period = Math.round(data.length/10);
                                    var returnLabel = (index+1) % 10 === 0 ? dataLabel : '';
                                    // 말일이 10으로 안떨어지는 달
                                    // 말일이 10으로 나눈 초과일떄,
                                    if(data.length > period*10){
                                        if(Number(index+1)===period*10) {returnLabel = ''}
                                        if(Number(index+1)===data.length) {returnLabel = dataLabel}
                                    }else{
                                        // 10으로 나눈 미만일대,
                                        if(Number(index+1)===data.length){
                                            returnLabel = dataLabel;
                                        }
                                    }
                                    if(index===0){returnLabel = dataLabel}
                                    return returnLabel;
                                }
                            }
                        }],
                        yAxes: [{
                            gridLines : {
                                display : true,
                                drawBorder : false,
                                drawTicks : false
                            },
                            ticks: {
                                fontSize : 14,
                                padding : 11,
                                beginAtZero: true,
                                stepSize : 50,
                                callback: function(dataLabel, index) {
                                    // Hide the label of every 2nd dataset. return null to hide the grid line too
                                    return index % 2 === 0 ? dataLabel : '';
                                }
                            }
                        }]
                    }
                }
            }
        };

        // 마우스 오버시 가이드라인 표시.
        function setLineWithLine(){
            Chart.defaults.LineWithLine = Chart.defaults.line;
            Chart.controllers.LineWithLine = Chart.controllers.line.extend({
                draw: function(ease) {
                    Chart.controllers.line.prototype.draw.call(this, ease);
                    if (this.chart.tooltip._active && this.chart.tooltip._active.length) {
                        // eslint-disable-next-line vars-on-top
                        var activePoint = this.chart.tooltip._active[0],
                        ctx = this.chart.ctx,
                        x = activePoint.tooltipPosition().x,
                        topY = this.chart.scales['y-axis-0'].top,
                        bottomY = this.chart.scales['y-axis-0'].bottom;
                        // draw line
                        ctx.save();
                        ctx.beginPath();
                        ctx.moveTo(x, topY);
                        ctx.lineTo(x, bottomY);
                        ctx.lineWidth = 1;
                        ctx.strokeStyle = '#000000';
                        ctx.stroke();
                        ctx.restore();
                    }
                }
            })
        };

        // 캔버스 동적 생성
        function createCanvas(containerEl){
            containerEl.append('<canvas></canvas>');
        };

        // public 업데이트
        this.update = function(chartData){
            parseData(chartData);
            config.data.labels = labelArr;
            config.data.datasets[0].data = priceArr;
            chartObj.update();
        };

        // public 초기화
        this.init = function(containerEl, chartData) {
            createCanvas(containerEl);
            parseData(chartData);
            setChartConfig();
            setLineWithLine();
            chartObj = new Chart(containerEl.children('canvas'), config);
            Chart.defaults.global.defaultFontFamily = 'Open Sans';
        };
    }
})();