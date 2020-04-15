var chart = chart || {};
//@todo 최소값 잡히게 하기.
//@todo 다른 차트 검수 완료 하기.
(function() {
    chart.barChart = function () {
        var containerObj = null;
        var axisContainerObj = null;
        var chartObj = null;
        var config = null;
        var labelArr = [];
        var perArr = [];
        var priceArr = [];
        var chartColors = ['#0078ee', '#f9bc5f'];
        var recreateBln = false;

        // API 에서 받은 데이터를 Chart에 넣을 데이터로 변환.
        function parseData(dataObj){
            var _totalNum = dataObj.dataset.length;
            var _totalLableNum = dataObj.dataset[0].dataArr.length;
            var _totalPrice = 0;
            var _colorArr = [];
            var _maxVal = 0;

            dataSetsArr = [];
            labelArr = dataObj.labelArr;
            priceArr = dataObj.dataset[0].dataArr;
            perArr = [];

            // 컬러 세팅
            for(var i=0; i<labelArr.length; i++) {
                if(i<chartColors.length){
                    _colorArr.push(chartColors[i%chartColors.length]);
                }else{
                    _colorArr.push(Common.utils.getRandomColor());
                }
            }

            // 전체합을 100% 기준으로
            // for(var j=0; j<_totalLableNum; j++) {
            //     _totalPrice += dataObj.dataset[0].dataArr[j];
            // }
            // for(var k=0; k<_totalLableNum; k++) {
            //     perArr.push(Math.round((dataObj.dataset[0].dataArr[k]/_totalPrice)*100));
            // }

            // 가장 큰값을 100% 기준으로
            _maxVal = Math.max.apply(null, priceArr);
            for(var k=0; k<_totalLableNum; k++) {
                perArr.push(Math.round((dataObj.dataset[0].dataArr[k]/_maxVal)*100));
            }

            // 데이터 세팅.
            for(var i = 0; i < _totalNum; i++){
                var _item = {
                    data: perArr,//dataObj.dataset[i].dataArr,
                    backgroundColor : _colorArr,
                    barThickness: 12
                }
                dataSetsArr.push(_item);
            }

        };
        // 속성 정의
        function setChartConfig(axisVisible){
            config = {
                type: 'horizontalBar',
                data: {
                    labels: labelArr,
                    datasets: dataSetsArr
                },
                options: {
                    cornerRadius: 10,
                    maintainAspectRatio: false,
                    legend: {
                        display:false
                    },
                    tooltips: {
                        backgroundColor: '#15283b',
                        bodyAlign: 'center',
                        bodyFontSize: 12,
                        cornerRadius: 15,
                        yPadding : 8,
                        xPadding : 8,
                        custom: function(tooltip) {
                            if (!tooltip) {return};
                            // 툴팁에 앞 박스 안나오게
                            tooltip.displayColors = false;
                        },
                        callbacks: {
                            title: function(tooltipItem, data) {
                                return '';
                            },
                            label: function(tooltipItem, data) {
                                var _price = priceArr[tooltipItem.index] || '';
                                _price = Math.round(_price * 100) / 100;
                                return '$'+_price+' ('+perArr[tooltipItem.index]+'%)';
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
        };

        // 차트가 다 그려질때, 그려지고 있을때 리스너
        function copyAxis(){
            var _animation = {
                onComplete: function () {
                    axisContainerObj.show();
                    resizeXAxisWidth();
                },
                onProgress: function () {
                }
            }
            return _animation;
        };

        // X축 Div 위치 갱신.
        function resizeXAxisWidth() {
            var _yAXisW = chartObj.scales['y-axis-0'].width;
            var _tarW = (axisContainerObj.width() - _yAXisW) / 3;
            axisContainerObj.children('#leftDiv').width(_yAXisW);
            $(axisContainerObj.find('div')[1]).width(_tarW);
            $(axisContainerObj.find('div')[2]).width(_tarW);
            $(axisContainerObj.find('div')[3]).width(_tarW);
        };

        // 차트 X 축 제거 후 차트 재생성
        function recreateChartWithoutXaxis(){
            if(chartObj)chartObj.destroy();
            setChartConfig(false);
            chartObj = new Chart(containerObj.children('canvas'), config);
        };

        /* 바 모양 라운딩으로 커스텀*/
        Chart.elements.Rectangle.prototype.draw = function() {
            var ctx = this._chart.ctx;
            var vm = this._view;
            var left, right, top, bottom, signX, signY, borderSkipped, radius;
            var borderWidth = vm.borderWidth;

            // If radius is less than 0 or is large enough to cause drawing errors a max
            //      radius is imposed. If cornerRadius is not defined set it to 0.
            var cornerRadius = this._chart.config.options.cornerRadius;
            var fullCornerRadius = this._chart.config.options.fullCornerRadius;
            var stackedRounded = this._chart.config.options.stackedRounded;
            var typeOfChart = this._chart.config.type;

            if (cornerRadius < 0) {
                cornerRadius = 0;
            }
            if (typeof cornerRadius == 'undefined') {
                cornerRadius = 0;
            }
            if (typeof fullCornerRadius == 'undefined') {
                fullCornerRadius = false;
            }
            if (typeof stackedRounded == 'undefined') {
                stackedRounded = false;
            }

            if (!vm.horizontal) {
                // bar
                left = vm.x - vm.width / 2;
                right = vm.x + vm.width / 2;
                top = vm.y;
                bottom = vm.base;
                signX = 1;
                signY = bottom > top ? 1 : -1;
                borderSkipped = vm.borderSkipped || 'bottom';
            } else {
                // horizontal bar
                left = vm.base;
                right = vm.x;
                top = vm.y - vm.height / 2;
                bottom = vm.y + vm.height / 2;
                signX = right > left ? 1 : -1;
                signY = 1;
                borderSkipped = vm.borderSkipped || 'left';
            }

            // Canvas doesn't allow us to stroke inside the width so we can
            // adjust the sizes to fit if we're setting a stroke on the line
            if (borderWidth) {
                // borderWidth shold be less than bar width and bar height.
                var barSize = Math.min(Math.abs(left - right), Math.abs(top - bottom));
                borderWidth = borderWidth > barSize ? barSize : borderWidth;
                var halfStroke = borderWidth / 2;
                // Adjust borderWidth when bar top position is near vm.base(zero).
                var borderLeft = left + (borderSkipped !== 'left' ? halfStroke * signX : 0);
                var borderRight = right + (borderSkipped !== 'right' ? -halfStroke * signX : 0);
                var borderTop = top + (borderSkipped !== 'top' ? halfStroke * signY : 0);
                var borderBottom = bottom + (borderSkipped !== 'bottom' ? -halfStroke * signY : 0);
                // not become a vertical line?
                if (borderLeft !== borderRight) {
                    top = borderTop;
                    bottom = borderBottom;
                }
                // not become a horizontal line?
                if (borderTop !== borderBottom) {
                    left = borderLeft;
                    right = borderRight;
                }
            }

            ctx.beginPath();
            ctx.fillStyle = vm.backgroundColor;
            ctx.strokeStyle = vm.borderColor;
            ctx.lineWidth = borderWidth;

            // Corner points, from bottom-left to bottom-right clockwise
            // | 1 2 |
            // | 0 3 |
            var corners = [
                [left, bottom],
                [left, top],
                [right, top],
                [right, bottom]
            ];

            // Find first (starting) corner with fallback to 'bottom'
            var borders = ['bottom', 'left', 'top', 'right'];
            var startCorner = borders.indexOf(borderSkipped, 0);
            if (startCorner === -1) {
                startCorner = 0;
            }

            function cornerAt(index) {
                return corners[(startCorner + index) % 4];
            }

            // Draw rectangle from 'startCorner'
            var corner = cornerAt(0);
            ctx.moveTo(corner[0], corner[1]);


            var nextCornerId, nextCorner, width, height, x, y;
            for (var i = 1; i < 4; i++) {
                corner = cornerAt(i);
                nextCornerId = i + 1;
                if (nextCornerId == 4) {
                    nextCornerId = 0
                }

                nextCorner = cornerAt(nextCornerId);

                width = corners[2][0] - corners[1][0];
                height = corners[0][1] - corners[1][1];
                x = corners[1][0];
                y = corners[1][1];

                var radius = cornerRadius;
                // Fix radius being too large
                if (radius > Math.abs(height) / 2) {
                    radius = Math.floor(Math.abs(height) / 2);
                }
                if (radius > Math.abs(width) / 2) {
                    radius = Math.floor(Math.abs(width) / 2);
                }

                var x_tl, x_tr, y_tl, y_tr, x_bl, x_br, y_bl, y_br;
                if (height < 0) {
                    // Negative values in a standard bar chart
                    x_tl = x;
                    x_tr = x + width;
                    y_tl = y + height;
                    y_tr = y + height;

                    x_bl = x;
                    x_br = x + width;
                    y_bl = y;
                    y_br = y;

                    // Draw
                    ctx.moveTo(x_bl + radius, y_bl);

                    ctx.lineTo(x_br - radius, y_br);

                    // bottom right
                    ctx.quadraticCurveTo(x_br, y_br, x_br, y_br - radius);


                    ctx.lineTo(x_tr, y_tr + radius);

                    // top right
                    fullCornerRadius ? ctx.quadraticCurveTo(x_tr, y_tr, x_tr - radius, y_tr) : ctx.lineTo(x_tr, y_tr, x_tr - radius, y_tr);


                    ctx.lineTo(x_tl + radius, y_tl);

                    // top left
                    fullCornerRadius ? ctx.quadraticCurveTo(x_tl, y_tl, x_tl, y_tl + radius) : ctx.lineTo(x_tl, y_tl, x_tl, y_tl + radius);


                    ctx.lineTo(x_bl, y_bl - radius);

                    //  bottom left
                    ctx.quadraticCurveTo(x_bl, y_bl, x_bl + radius, y_bl);

                } else if (width < 0) {
                    // Negative values in a horizontal bar chart
                    x_tl = x + width;
                    x_tr = x;
                    y_tl = y;
                    y_tr = y;

                    x_bl = x + width;
                    x_br = x;
                    y_bl = y + height;
                    y_br = y + height;

                    // Draw
                    ctx.moveTo(x_bl + radius, y_bl);

                    ctx.lineTo(x_br - radius, y_br);

                    //  Bottom right corner
                    fullCornerRadius ? ctx.quadraticCurveTo(x_br, y_br, x_br, y_br - radius) : ctx.lineTo(x_br, y_br, x_br, y_br - radius);

                    ctx.lineTo(x_tr, y_tr + radius);

                    // top right Corner
                    fullCornerRadius ? ctx.quadraticCurveTo(x_tr, y_tr, x_tr - radius, y_tr) : ctx.lineTo(x_tr, y_tr, x_tr - radius, y_tr);

                    ctx.lineTo(x_tl + radius, y_tl);

                    // top left corner
                    ctx.quadraticCurveTo(x_tl, y_tl, x_tl, y_tl + radius);

                    ctx.lineTo(x_bl, y_bl - radius);

                    //  bttom left corner
                    ctx.quadraticCurveTo(x_bl, y_bl, x_bl + radius, y_bl);

                } else {

                    var lastVisible = 0;
                    for (var findLast = 0, findLastTo = this._chart.data.datasets.length; findLast < findLastTo; findLast++) {
                        if (!this._chart.getDatasetMeta(findLast).hidden) {
                            lastVisible = findLast;
                        }
                    }
                    var rounded = this._datasetIndex === lastVisible;

                    if (rounded) {
                        //Positive Value
                        ctx.moveTo(x + radius, y);

                        ctx.lineTo(x + width - radius, y);

                        // top right
                        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);


                        ctx.lineTo(x + width, y + height - radius);

                        // bottom right
                        if (fullCornerRadius || typeOfChart == 'horizontalBar')
                            ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
                        else
                            ctx.lineTo(x + width, y + height, x + width - radius, y + height);


                        ctx.lineTo(x + radius, y + height);

                        // bottom left
                        if (fullCornerRadius)
                            ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
                        else
                            ctx.lineTo(x, y + height, x, y + height - radius);


                        ctx.lineTo(x, y + radius);

                        // top left
                        if (fullCornerRadius || typeOfChart == 'bar')
                            ctx.quadraticCurveTo(x, y, x + radius, y);
                        else
                            ctx.lineTo(x, y, x + radius, y);
                    }else {
                        ctx.moveTo(x, y);
                        ctx.lineTo(x + width, y);
                        ctx.lineTo(x + width, y + height);
                        ctx.lineTo(x, y + height);
                        ctx.lineTo(x, y);
                    }
                }

            }

            ctx.fill();
            if (borderWidth) {
                ctx.stroke();
            }
        };

        // 차트 컨테이너 리자이즈.
        function resizeContainer(){
            var _tarHeight = (labelArr.length * 34) + 3;
            containerObj.height(_tarHeight);
        };

        // public 업데이트
        this.update = function(chartData){
            recreateBln = false;
            parseData(chartData);
            resizeContainer();
            recreateChartWithoutXaxis();
        };

        // public 초기화
        this.init = function(containerEl, chartData, axisEl) {
            createCanvas(containerEl, axisEl);
            parseData(chartData);
            resizeContainer();
            recreateChartWithoutXaxis();
            Chart.defaults.global.defaultFontFamily = 'Open Sans';
        };
    }
}());