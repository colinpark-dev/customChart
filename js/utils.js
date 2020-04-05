(function(global) {
    var Common = global.Common || (global.Common = {});

    Common.utils = {
        // 숫자 앞에 0 추가.
        getPad: function(num, length){
            num = num + '';
            return num.length >= length ? num : new Array(length - num.length + 1).join('0') + num;
        },
        // 임의의 컬러 값 생성
        getRandomColor: function(){
            var varters = '0123456789ABCDEF';
            var color = '#';
            for (var i = 0; i < 6; i++) {
                color += varters[Math.floor(Math.random() * 16)];
            }
            return color;
        },
        srand: function(seed) {
            this._seed = seed;
        },

        rand: function(min, max) {
            var seed = this._seed;
            min = min === undefined ? 0 : min;
            max = max === undefined ? 1 : max;
            this._seed = (seed * 9301 + 49297) % 233280;
            return min + (this._seed / 233280) * (max - min);
        }
    };
    Common.utils.srand(Date.now());
}(this));
