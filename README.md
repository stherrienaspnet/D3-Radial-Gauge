D3-Radial-Gauge
===============

D3.JS Radial Gauge

![alt tag](https://raw.github.com/stherrienaspnet/D3-Radial-Gauge/master/D3RadialGauge.png)

Here is the list of properties with their default value that can be changed according to your needs:

        var settings = $.extend({
            width: 300,
            innerRadius: 130,
            outterRadius: 145,
            majorGraduations: 6,
            minorGraduations: 10,
            majorGraduationLenght: 16,
            minorGraduationLenght: 10,
            majorGraduationMarginTop: 7,
            majorGraduationColor: "#EAEAEA",
            minorGraduationColor: "#EAEAEA",
            majorGraduationTextColor: "#6C6C6C",
            majorGraduationDecimals: 2,
            needleColor: "#2DABC1",
            valueVerticalOffset:40,
            data: [],
            value:0
        }, options);
 
Here is a usage sample:

    <div>
        <div id="svgTarget"></div>
    </div>
    <script>
        $(function () {
            var gaugeRanges = [
                {
                    From: 1.5,
                    To: 2.5,
                    Color: "#8DCB2A"
                }, {
                    From: 2.5,
                    To: 3.5,
                    Color: "#FFC700"
                }, {
                    From: 3.5,
                    To: 4.5,
                    Color: "#FF7A00"
                },
                {
                    From: 4.5,
                    To: 6,
                    Color: "#C20000"
                }];

            $("#svgTarget").mttD3Gauge({ data: gaugeRanges, value: 3 });
        });
    </script>

http://plnkr.co/edit/sP0dHuGoCpaIvCiqoNxF?p=preview
