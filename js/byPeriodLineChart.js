var chart = chart || {};

(function() {
    chart.byPeriodLineChart = function () {
        var chartObj = null;
        var config = null;
        var labelArr = [];
        var dataSetsArr = [];
        var legendBln = false;
        var chartColors = [
            '#394cb1',
            '#0078ee',
            '#15d4a9',
            '#f9bc5f',
            '#f98e5f',
            '#fd4d4d',
            '#b5e021',
            '#b139ad',
            '#00e6ee',
            '#6639b1',
            '#e83a3a',
            '#27ce66',
            '#f26a57',
            '#4139b1',
            '#e9e222',
            '#40e021',
            '#8239b1',
            '#d3249f',
            '#00aeee'
        ];

        // API 에서 받은 데이터를 Chart에 넣을 데이터로 변환.
        function parseData(dataObj){
            var _totalNum = dataObj.dataset.length;
            var _color = null;
            dataSetsArr = [];
            labelArr = dataObj.labelArr;
            for(var i = 0; i < _totalNum; i++){
                if(i<chartColors.length){
                    _color = chartColors[i];
                }else{
                    _color = Common.utils.getRandomColor();
                }
                var _item = {
                    label: dataObj.dataset[i].title,
                    data: dataObj.dataset[i].dataArr,
                    fill : false,
                    borderColor: _color,
                    pointBackgroundColor : chartColors[i],
                    borderWidth: 3
                }
                dataSetsArr.push(_item);
            }
            if(_totalNum === 1){
                legendBln = false;
            }else{
                legendBln = true;
            }
        };

        // 속성 정의
        function setChartConfig(){
            // 차트 속성 정의
            config = {
                type: 'LineWithLine',
                data: {
                    labels: labelArr,
                    datasets: dataSetsArr
                },
                options: {
                    maintainAspectRatio: false,
                    legend: { //범례
                        display: legendBln,
                    },
                    tooltips: {
                        mode: 'index',
                        intersect: false, // 그리드라인 오버시 툴팁 나오게
                        backgroundColor: '#15283b',
                        yAlign: 'bottom',
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
                            // 툴팁 masking 되는거 패칭
                            if(tooltip.y < 0){
                                tooltip.y = 0;
                            }
                        },
                        callbacks: {
                            title: function() {
                                return '';
                            },
                            label: function(tooltipItem, data) {
                                var _label = data.datasets[tooltipItem.datasetIndex].label
                                var _data = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
                                _data = Math.round(_data * 100) / 100;
                                return _label + '  $' + _data;
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
                                // beginAtZero: true,
                                // stepSize : 50,
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

        // public 업데이트
        this.update = function(chartData){
            parseData(chartData);
            config.data.labels = labelArr;
            config.data.datasets = dataSetsArr;
            config.options.legend.display = legendBln;
            chartObj.update();
        };

        // public 초기화
        this.init = function(containerEl, chartData) {
            containerEl.append('<canvas></canvas>');
            parseData(chartData);
            setChartConfig();
            setLineWithLine();
            chartObj = new Chart(containerEl.children('canvas'), config);
            Chart.defaults.global.defaultFontFamily = 'Open Sans';
        };
    }
})();