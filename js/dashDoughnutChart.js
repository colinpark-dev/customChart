var chart = chart || {};

(function() {
    chart.dashLineChart = function () {
        //@todo 2. 툴팁 label 한픽셀 위로
        //@todo 2. 범례 동적 생성할지 고민.
        //@todo 2. 범례 오버시 툴팁 보이는 것 고민.

        var chartObj = null;
        var config = null;
        var labelArr = [];
        var priceArr = [];
        var perArr = [];
        var colorsArr = [];
        var legendElObj = null;

        // API 에서 받은 데이터를 Chart에 넣을 데이터로 변환.
        function parseData(dataObj){
            labelArr = dataObj.labelArr;
            perArr = dataObj.perArr;
            priceArr = dataObj.priceArr;
            colorsArr = dataObj.colorsArr;
        };

        // 속성 정의
        function setChartConfig(){
            // 차트 속성 정의
            config = {
                type: 'doughnut',

                data: {
                    datasets: [{
                        data: priceArr,
                        backgroundColor: colorsArr,
                        borderWidth: 0,
                    }],
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
                                var price = priceArr[tooltipItem.index] || '';

                                price = Math.round(price * 100) / 100;
                                return '$'+price+' ('+perArr[tooltipItem.index]+'%)';
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

        // 캔버스 동적 생성
        function createCanvas(canvasEl){
            canvasEl.append('<canvas style="position: relative;"></canvas>');
        };

        // public 업데이트
        this.update = function(chartData){
            parseData(chartData);
            config.data.labels = labelArr;
            config.data.datasets[0].data = priceArr;
            createLegend();
            chartObj.update();
        };

        // public 초기화
        this.init = function(canvasEl, chartData, legendEl) {
            legendElObj = legendEl;
            createCanvas(canvasEl);
            parseData(chartData);
            setChartConfig();
            chartObj = new Chart(canvasEl.children('canvas'), config);
            createLegend();
            Chart.defaults.global.defaultFontFamily = 'Open Sans';
        };
    }
}());