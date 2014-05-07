(function ($) {
    $.fn.mttD3Gauge = function (options) {
        var vis;

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

        this.create = function () {
            this.html("<svg class='mtt-svgGauge' width='" + settings.width + "' height='" + settings.width + "'></svg>");
            var maxLimit = 0;
            var minLimit = 9999999;
            var d3DataSource = [];

            //Data Genration
            $.each(settings.data, function (index, value) {
                d3DataSource.push([value.From, value.To, value.Color]);
                if (value.To > maxLimit) maxLimit = value.To;
                if (value.From < minLimit) minLimit = value.From;
            });

            if (minLimit > 0) {
                d3DataSource.push([0, minLimit, "#D7D7D7"]);
            }
            //Render Gauge Color Area
            vis = d3.select(this.selector + " .mtt-svgGauge");
            var translate = "translate(" + settings.width / 2 + "," + settings.width / 2 + ")";
            var cScale = d3.scale.linear().domain([0, maxLimit]).range([-120 * (Math.PI / 180), 120 * (Math.PI / 180)]);
            var arc = d3.svg.arc()
                .innerRadius(settings.innerRadius)
                .outerRadius(settings.outterRadius)
                .startAngle(function (d) { return cScale(d[0]); })
                .endAngle(function (d) { return cScale(d[1]); });
            vis.selectAll("path")
                .data(d3DataSource)
                .enter()
                .append("path")
                .attr("d", arc)
                .style("fill", function (d) { return d[2]; })
                .attr("transform", translate);
           
            var majorGraduationsAngles = getMajorGraduationAngles();
            var majorGraduationValues = getMajorGraduationValues(minLimit, maxLimit);
            renderMajorGraduations(majorGraduationsAngles);
            renderMajorGraduationTexts(majorGraduationsAngles, majorGraduationValues);
            renderGraduationNeedle(minLimit, maxLimit);

            return this;
        };

        var renderGraduationNeedle = function (minLimit, maxLimit) {
            var centerX = settings.width / 2;
            var centerY = settings.width / 2;

            vis.append("circle")
            .attr("r", 6)
            .attr("cy", centerX)
            .attr("cx", centerY)
            .attr("fill", settings.needleColor);

            var needleValue = ((settings.value - minLimit) * 240 / (maxLimit-minLimit))-30;
            var thetaRad = needleValue * Math.PI / 180;

            var needleLen = settings.innerRadius - settings.majorGraduationLenght - settings.majorGraduationMarginTop;
            var needleRadius = 2.5;
            var topX = centerX - needleLen * Math.cos(thetaRad);
            var topY = centerY - needleLen * Math.sin(thetaRad);
            var leftX = centerX - needleRadius * Math.cos(thetaRad - Math.PI / 2);
            var leftY = centerY - needleRadius * Math.sin(thetaRad - Math.PI / 2);
            var rightX = centerX - needleRadius * Math.cos(thetaRad + Math.PI / 2);
            var rightY = centerY - needleRadius * Math.sin(thetaRad + Math.PI / 2);
            var triangle = "M " + leftX + " " + leftY + " L " + topX + " " + topY + " L " + rightX + " " + rightY;

            vis.append("svg:path")
            .attr("d", triangle)
            .style("stroke-width", 1)
            .style("stroke", settings.needleColor)
            .style("fill", settings.needleColor);

            vis.append("text")
                .attr("x", centerX)
                .attr("y", centerY + settings.valueVerticalOffset)
                .attr("class", "mtt-graduationValueText")
                .attr("fill", settings.needleColor)
                .attr("text-anchor", "middle")
                .style("font", "12px Courier")
                .text('[' + settings.value.toFixed(settings.majorGraduationDecimals) + ']');
        };

        var renderMajorGraduationTexts = function (majorGraduationsAngles, majorGraduationValues) {
            var centerX = settings.width / 2;
            var centerY = settings.width / 2;
            var textVerticalPadding = 5;
            var textHorizontalPadding = 5;

            var lastGraduationValue = majorGraduationValues[majorGraduationValues.length - 1];

            var dummyText = vis.append("text")
                .attr("x", centerX)
                .attr("y", centerY)
                .attr("fill", "transparent")
                .attr("text-anchor", "middle")
                .style("font", "11px Courier ")
                .text(lastGraduationValue);

            var textWidth = dummyText.node().getBBox().width;

            for (var i = 0; i < majorGraduationsAngles.length; i++) {
                var angle = majorGraduationsAngles[i];
                var cos1Adj = Math.round(Math.cos((90 - angle) * Math.PI / 180) * (settings.innerRadius - settings.majorGraduationMarginTop - settings.majorGraduationLenght - textHorizontalPadding));
                var sin1Adj = Math.round(Math.sin((90 - angle) * Math.PI / 180) * (settings.innerRadius - settings.majorGraduationMarginTop - settings.majorGraduationLenght - textVerticalPadding));

                var sin1Factor = 1;
                if (sin1Adj < 0) sin1Factor = 1.1;
                if (sin1Adj > 0) sin1Factor = 0.9;
                if (cos1Adj > 0) cos1Adj -= textWidth;
                if (cos1Adj == 0) cos1Adj -= textWidth/2;

                var x1 = centerX + cos1Adj;
                var y1 = centerY + sin1Adj * sin1Factor * -1;

                vis.append("text")
                .attr("class", "mtt-majorGraduationText")
                .attr("x", x1)
                .attr("dy", y1)
                .attr("fill", settings.majorGraduationTextColor)
                .text(majorGraduationValues[i]);
            }
        };

        var getMajorGraduationAngles = function() {
            var scaleRange = 240;
            var minScale = -120;
            var graduationsAngles = [];
            for (var i = 0; i <= settings.majorGraduations; i++) {
                var scaleValue = minScale + i * scaleRange / settings.majorGraduations;
                graduationsAngles.push(scaleValue);
            }

            return graduationsAngles;
        };

        var getMajorGraduationValues = function (minLimit, maxLimit) {
            var scaleRange = maxLimit - minLimit;
            var minScale = -120;
            var majorGraduationValues = [];
            for (var i = 0; i <= settings.majorGraduations; i++) {
                var scaleValue = minLimit + i * scaleRange / settings.majorGraduations;
                majorGraduationValues.push(scaleValue.toFixed(settings.majorGraduationDecimals));
            }

            return majorGraduationValues;
        };

        var renderMinorGraduations = function (majorGraduationsAngles, indexMajor) {
            var minorGraduationsAngles = [];

            if (indexMajor > 0) {
                var minScale = majorGraduationsAngles[indexMajor - 1];
                var maxScale = majorGraduationsAngles[indexMajor];
                var scaleRange = maxScale - minScale;

                for (var i = 1; i < settings.minorGraduations; i++) {
                    var scaleValue = minScale + i * scaleRange / settings.minorGraduations;
                    minorGraduationsAngles.push(scaleValue);
                }

                var centerX = settings.width / 2;
                var centerY = settings.width / 2;
                //Render Minor Graduations
                $.each(minorGraduationsAngles, function (indexMinor, value) {
                    var cos1Adj = Math.round(Math.cos((90 - value) * Math.PI / 180) * (settings.innerRadius - settings.majorGraduationMarginTop - settings.minorGraduationLenght));
                    var sin1Adj = Math.round(Math.sin((90 - value) * Math.PI / 180) * (settings.innerRadius - settings.majorGraduationMarginTop - settings.minorGraduationLenght));
                    var cos2Adj = Math.round(Math.cos((90 - value) * Math.PI / 180) * (settings.innerRadius - settings.majorGraduationMarginTop));
                    var sin2Adj = Math.round(Math.sin((90 - value) * Math.PI / 180) * (settings.innerRadius - settings.majorGraduationMarginTop));
                    var x1 = centerX + cos1Adj;
                    var y1 = centerY + sin1Adj * -1;
                    var x2 = centerX + cos2Adj;
                    var y2 = centerY + sin2Adj * -1;
                    vis.append("svg:line")
                    .attr("x1", x1)
                    .attr("y1", y1)
                    .attr("x2", x2)
                    .attr("y2", y2)
                    .style("stroke", settings.minorGraduationColor);
                });
            }
        };

        var renderMajorGraduations = function (majorGraduationsAngles) {
            var centerX = settings.width / 2;
            var centerY = settings.width / 2;
            //Render Major Graduations
            $.each(majorGraduationsAngles, function (index, value) {
                var cos1Adj = Math.round(Math.cos((90 - value) * Math.PI / 180) * (settings.innerRadius - settings.majorGraduationMarginTop - settings.majorGraduationLenght));
                var sin1Adj = Math.round(Math.sin((90 - value) * Math.PI / 180) * (settings.innerRadius - settings.majorGraduationMarginTop - settings.majorGraduationLenght));
                var cos2Adj = Math.round(Math.cos((90 - value) * Math.PI / 180) * (settings.innerRadius - settings.majorGraduationMarginTop));
                var sin2Adj = Math.round(Math.sin((90 - value) * Math.PI / 180) * (settings.innerRadius - settings.majorGraduationMarginTop));
                var x1 = centerX + cos1Adj;
                var y1 = centerY + sin1Adj * -1;
                var x2 = centerX + cos2Adj;
                var y2 = centerY + sin2Adj * -1;
                vis.append("svg:line")
                .attr("x1", x1)
                .attr("y1", y1)
                .attr("x2", x2)
                .attr("y2", y2)
                .style("stroke", settings.majorGraduationColor);

                renderMinorGraduations(majorGraduationsAngles, index);
            });
        };

        return this.create();
    };

}(jQuery));
