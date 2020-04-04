(function(global) {
    var Common = global.Common || (global.Common = {});
    var Color = global.Color;

    Common.utils = {
        getPad: function(num, length){
            num = num + '';
            return num.length >= length ? num : new Array(length - num.length + 1).join('0') + num;
        },
        getRandomColor: function(){
            var letters = '0123456789ABCDEF';
            var color = '#';
            for (var i = 0; i < 6; i++) {
                color += letters[Math.floor(Math.random() * 16)];
            }
            return color;
        },
    };

}(this));

