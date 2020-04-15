var chart = chart || {};

(function() {
    chart.doughnutChart = function () {
        var chartObj = null;
        var config = null;
        var labelArr = [];
        var perArr = [];
        var dataSetsArr = [];
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
        var legendElObj = null;

        // API 에서 받은 데이터를 Chart에 넣을 데이터로 변환.
        function parseData(dataObj){
            var _totalNum = dataObj.dataset.length;
            var _totalLableNum = dataObj.dataset[0].dataArr.length;
            var _totalPrice = 0;
            var _colorArr = [];
            dataSetsArr = [];
            labelArr = dataObj.labelArr;
            perArr = [];

            // 컬러 세팅
            for(var i=0; i<labelArr.length; i++) {
                if(i<chartColors.length){
                    _colorArr.push(chartColors[i%chartColors.length]);
                }else{
                    _colorArr.push(Common.utils.getRandomColor());
                }
            }
            // 데이터 세팅.
            for(var i = 0; i < _totalNum; i++){
                var _item = {
                    data: dataObj.dataset[i].dataArr,
                    backgroundColor : _colorArr,
                    borderWidth: 0
                }
                dataSetsArr.push(_item);
            }

            // 퍼센트 미리 구하기.
            for(var j=0; j<_totalLableNum; j++) {
                _totalPrice += dataObj.dataset[0].dataArr[j];
            }
            for(var k=0; k<_totalLableNum; k++) {
                perArr.push(Math.round((dataObj.dataset[0].dataArr[k]/_totalPrice)*100));
            }
        };

        // 속성 정의
        function setChartConfig(){
            // 차트 속성 정의
            config = {
                type: 'doughnut',

                data: {
                    datasets: dataSetsArr,
                    labels: labelArr
                },
                options: {
                    maintainAspectRatio: false,
                    cutoutPercentage : 57,
                    legend: {
                        display:false,
                        position: 'right',
                        align : 'start',
                        fullWidth : false,
                        labels: {
                            fontSize : 14,
                            boxWidth: 12,
                            fontColor: '#555555'
                        }
                    },
                    animation: {
                        animateScale: true,
                        animateRotate: true
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
                        },
                        callbacks: {
                            title: function(tooltipItem, data) {
                                return '';
                            },
                            label: function(tooltipItem, data) {
                                var _price = data.datasets[0].data[tooltipItem.index] || '';
                                _price = Math.round(_price * 100) / 100;
                                return '$'+_price+' ('+perArr[tooltipItem.index]+'%)';
                            },
                            labelTextColor: function(tooltipItem, chart) {
                                return '#ffffff';
                            }
                        }
                    }
                }
            }
        };

        // 범례 동적 생성
        function createLegend(){
            legendElObj.html(chartObj.generateLegend());

            // 기존 범례 히든처리 모두 초기화.
            chartObj.data.datasets[0]._meta[0].data.forEach(function(_el){
                _el.hidden = false;
            });

            //범례 클릭 이벤트 등록
            $('#doughnutLegend > ul > li').on('click',function(_e){
                var _index = $(this).index();
                var _curr = chartObj.data.datasets[0]._meta[0].data[_index];
                $(this).toggleClass('strike');
                _curr.hidden = !_curr.hidden;
                chartObj.update();
            });
        };

        // public 업데이트
        this.update = function(chartData){
            parseData(chartData);
            config.data.labels = labelArr;
            config.data.datasets = dataSetsArr;
            chartObj.update();
            createLegend();
        };

        // public 초기화
        this.init = function(containerEl, chartData, legendEl) {
            legendElObj = legendEl;
            containerEl.append('<canvas></canvas>');
            parseData(chartData);
            setChartConfig();
            chartObj = new Chart(containerEl.children('canvas'), config);
            createLegend();
            Chart.defaults.global.defaultFontFamily = 'Open Sans';
        };
    }
}());