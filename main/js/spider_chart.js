var global_default_feature = [
    // hero_id, gold_per_min, xp_per_min, kills, deaths, assists, hero_damage, hero_healing, tower_damage, level
    {axis: 'Gold Hunting', value: 0.5},
    {axis: 'Experience Growth', value: 0.5},
    {axis: 'Killer', value: 0.5},
    {axis: 'Defender', value: 0.5},
    {axis: 'Assistant', value: 0.5},
    {axis: 'Damage Dealer', value: 0.5},
    {axis: 'Healer', value: 0.5},
    {axis: 'Tower Destroyer', value: 0.5},
    {axis: 'Level', value: 0.5}
];

function makeSpiderPlot(container, options) {
    var that = {};
    var config = {
        w: options.width,				//Width of the circle
        h: options.height,				//Height of the circle
        margin: options.margin, //The margins of the SVG
        features: options.features.map(({axis}) => axis),
        featureCount: options.features.length,
        levels: 4,				//How many levels or inner circles should there be drawn
        labelFactor: 1.1, 	//How much farther than the radius of the outer circle should the labels be placed
        wrapWidth: 60, 		//The number of pixels after which a label needs to be given a new line
        opacityArea: 0.35, 	//The opacity of the area of the blob
        dotRadius: 4, 			//The size of the colored circles of each blog
        opacityCircles: 0.1, 	//The opacity of the circles of each blob
        strokeWidth: 2, 		//The width of the stroke around each blob
        color: d3.scaleOrdinal(d3.schemeCategory10),	//Color function
        maxValue: 1.0,
        transitionMS: 500
    };

    var allAxis = config.features,	//Names of each axis
        total = config.featureCount,					//The number of different axes
        radius = Math.min((config.w - config.margin.left - config.margin.right) / 2,
            (config.h - config.margin.top - config.margin.bottom) / 2) * 0.75, 	//Radius of the outermost circle
        Format = d3.format('.0%'),			 	//Percentage formatting
        angleSlice = Math.PI * 2 / total;		//The width in radians of each "slice"
    radarLine = d3.lineRadial()
        .curve(d3.curveCatmullRomClosed)
        .radius(function (d) {
            return rScale(d.value);
        })
        .angle(function (d, i) {
            return i * angleSlice;
        });
    blobWrapper = undefined;
    radar = undefined;
    blobCircleWrapper = undefined;
    tooltip = undefined;

    //Scale for the radius
    var rScale = d3.scaleLinear()
        .range([0, radius])
        .domain([0, config.maxValue]);

    function centerTranslation() {
        return 'translate(' + config.w / 2 + ',' + config.h / 2 + ')';
    }

    /////////////////////////////////////////////////////////
    /////////////////// Helper Function /////////////////////
    /////////////////////////////////////////////////////////

    //Taken from http://bl.ocks.org/mbostock/7555321
    //Wraps SVG text
    function wrap(text, width) {
        text.each(function () {
            var text = d3.select(this),
                words = text.text().split(/\s+/).reverse(),
                word,
                line = [],
                lineNumber = 0,
                lineHeight = 1.4, // ems
                y = text.attr("y"),
                x = text.attr("x"),
                dy = parseFloat(text.attr("dy")),
                tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");

            while (word = words.pop()) {
                line.push(word);
                tspan.text(line.join(" "));
                if (tspan.node().getComputedTextLength() > width) {
                    line.pop();
                    tspan.text(line.join(" "));
                    line = [word];
                    tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
                }
            }
        });
    }//wrap

    /////////////////////////////////////////////////////////
    //////////// Create the container SVG and g /////////////
    /////////////////////////////////////////////////////////
    function render(data) {
        //Initiate the radar chart SVG
        var svg = d3.select(container)
            .append("svg")
            .attr("class", "spider")
            .attr("width", config.w)
            .attr("height", config.h);

        var centerTx = centerTranslation();

        //Append a g element
        radar = svg.append("g")
            .attr("transform", centerTx);
        that.radar = radar;

        // Filter for outside glow
        var filter = radar.append('defs').append('filter').attr('id', 'glow'),
            feGaussianBlur = filter.append('feGaussianBlur').attr('stdDeviation', '2.5').attr('result', 'coloredBlur'),
            feMerge = filter.append('feMerge'),
            feMergeNode_1 = feMerge.append('feMergeNode').attr('in', 'coloredBlur'),
            feMergeNode_2 = feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

        // circular grid
        var axisGrid = radar.append("g").attr("class", "axisWrapper");

        //Draw the background circles
        axisGrid.selectAll(".levels")
            .data(d3.range(1, (config.levels + 1)).reverse())
            .enter()
            .append("circle")
            .attr("class", "gridCircle")
            .attr("r", function (d) {
                return radius / config.levels * d;
            })
            .style("fill", "#CDCDCD")
            .style("stroke", "#CDCDCD")
            .style("fill-opacity", config.opacityCircles)
            .style("filter", "url(#glow)");

        //Text indicating at what % each level is
        axisGrid.selectAll(".axisLabel")
            .data(d3.range(1, (config.levels + 1)).reverse())
            .enter().append("text")
            .attr("class", "axisLabel")
            .attr("x", 4)
            .attr("y", function (d) {
                return -d * radius / config.levels;
            })
            .attr("dy", "0.4em")
            .style("font-size", "10px")
            .attr("fill", "cornsilk")
            .text(function (d) {
                return Format(config.maxValue * d / config.levels);
            });

        //Create the straight lines radiating outward from the center
        var axis = axisGrid.selectAll(".axis")
            .data(allAxis)
            .enter()
            .append("g")
            .attr("class", "axis");
        //Append the lines
        axis.append("line")
            .attr("x1", 0)
            .attr("y1", 0)
            .attr("x2", function (d, i) {

                return rScale(config.maxValue * 1.1) * Math.cos(angleSlice * i - Math.PI / 2);
            })
            .attr("y2", function (d, i) {
                return rScale(config.maxValue * 1.1) * Math.sin(angleSlice * i - Math.PI / 2);
            })
            .attr("class", "line")
            .style("stroke", "white")
            .style("stroke-width", "2px");

        //Append the labels at each axis
        axis.append("text")
            .attr("class", "legend")
            .style("font-size", config.w/20 + 'px')
            .attr("text-anchor", "middle")
            .style("fill", 'cornsilk')
            .attr("dy", "0.35em")
            .attr("x", function (d, i) {
                return rScale(config.maxValue * config.labelFactor) * Math.cos(angleSlice * i - Math.PI / 2);
            })
            .attr("y", function (d, i) {
                return rScale(config.maxValue * config.labelFactor) * Math.sin(angleSlice * i - Math.PI / 2);
            })
            .text(function (d) {
                return d
            })
            .call(wrap, config.wrapWidth);

        /////////////////////////////////////////////////////////
        ///////////// Draw the radar chart blobs ////////////////
        /////////////////////////////////////////////////////////
        update(data);
        this.blobWrapper = blobWrapper;
        this.blobCircleWrapper = blobCircleWrapper;
    }

    that.render = render;

    function isRendered() {
        var blobWrapper = this.radar.selectAll(".radarWrapper");
        return (blobWrapper.size()>0);
    }

    that.isRendered = isRendered;

    function update(data) {
        if (isRendered() == false) {
            blobWrapper = this.radar.selectAll(".radarWrapper")
                .data(data)
                .enter().append("g")
                .attr("class", "radarWrapper");

            //Append the backgrounds
            blobWrapper
                .append("path")
                .attr("class", "radarArea")
                .attr("d", function (d, i) {
                    return radarLine(d);
                })
                .style("fill", function (d, i) {
                    return config.color(i);
                })
                .style("fill-opacity", config.opacityArea)
                .on('mouseover', function (d, i) {
                    //Dim all blobs
                    d3.selectAll(".radarArea")
                        .transition().duration(200)
                        .style("fill-opacity", 0.1);
                    //Bring back the hovered over blob
                    d3.select(this)
                        .transition().duration(200)
                        .style("fill-opacity", 0.7);
                })
                .on('mouseout', function () {
                    //Bring back all blobs
                    d3.selectAll(".radarArea")
                        .transition().duration(200)
                        .style("fill-opacity", config.opacityArea);
                });

            //Create the outlines
            blobWrapper.append("path")
                .attr("class", "radarStroke")
                .attr("d", function (d, i) {
                    return radarLine(d);
                })
                .style("stroke-width", config.strokeWidth + "px")
                .style("stroke", function (d, i) {
                    return config.color(i);
                })
                .style("fill", "none")
                .style("filter", "url(#glow)");

            //Append the circles
            blobWrapper.selectAll(".radarCircle")
                .data(function (d, i) {
                    return d;
                })
                .enter()
                .append("circle")
                .attr("class", "radarCircle")
                .attr("r", config.dotRadius)
                .attr("cx", function (d, i) {
                    return rScale(d.value) * Math.cos(angleSlice * i - Math.PI / 2);
                })
                .attr("cy", function (d, i) {
                    return rScale(d.value) * Math.sin(angleSlice * i - Math.PI / 2);
                })
                .style("fill", function (d, i, j) {
                    return config.color(j);
                })
                .style("fill-opacity", 0.8);

            //Wrapper for the invisible circles on top
            blobCircleWrapper = radar.selectAll(".radarCircleWrapper")
                .data(data)
                .enter().append("g")
                .attr("class", "radarCircleWrapper");

            //Append a set of invisible circles on top for the mouseover pop-up
            blobCircleWrapper.selectAll(".radarInvisibleCircle")
                .data(function (d, i) {
                    return d;
                })
                .enter().append("circle")
                .attr("class", "radarInvisibleCircle")
                .attr("r", config.dotRadius * 1.5)
                .attr("cx", function (d, i) {
                    return rScale(d.value) * Math.cos(angleSlice * i - Math.PI / 2);
                })
                .attr("cy", function (d, i) {
                    return rScale(d.value) * Math.sin(angleSlice * i - Math.PI / 2);
                })
                .style("fill", "none")
                .style("pointer-events", "all")
                .on("mouseover", function (d, i) {
                    newX = parseFloat(d3.select(this).attr('cx')) - 10;
                    newY = parseFloat(d3.select(this).attr('cy')) - 10;

                    tooltip
                        .attr('x', newX)
                        .attr('y', newY)
                        .text(Format(d.value))
                        .transition().duration(200)
                        .attr('fill', 'cornsilk')
                        .style('opacity', 1);
                })
                .on("mouseout", function () {
                    tooltip.transition().duration(200)
                        .style("opacity", 0);
                });

        } else {
            blobWrapper = this.radar.selectAll(".radarWrapper");
            blobCircleWrapper = this.radar.selectAll(".radarCircleWrapper");

            var areas_to_update = blobWrapper.selectAll(".radarArea").data(data);
            areas_to_update
                .transition().duration(config.transitionMS).ease(d3.easePoly)
                .attr("d", function (d, i) {
                    return radarLine(d);
                });

            var strokes_to_update = blobWrapper.selectAll(".radarStroke").data(data);
            strokes_to_update
                .transition().duration(config.transitionMS).ease(d3.easePoly)
                .attr("d", function (d, i) {
                    return radarLine(d);
                });


            var circles_to_update = blobWrapper.selectAll(".radarCircle").data(data[0]);
            circles_to_update
                .transition().duration(config.transitionMS).ease(d3.easePoly)
                .attr("cx", function (d, i) {
                    return rScale(d.value) * Math.cos(angleSlice * i - Math.PI / 2);
                })
                .attr("cy", function (d, i) {
                    return rScale(d.value) * Math.sin(angleSlice * i - Math.PI / 2);
                })
            ;

            var inv_circles_to_update = blobCircleWrapper.selectAll(".radarInvisibleCircle").data(data[0]);
            inv_circles_to_update
                .transition().duration(config.transitionMS).ease(d3.easePoly)
                .attr("cx", function (d, i) {
                    return rScale(d.value) * Math.cos(angleSlice * i - Math.PI / 2);
                })
                .attr("cy", function (d, i) {
                    return rScale(d.value) * Math.sin(angleSlice * i - Math.PI / 2);
                });

        }

        /////////////////////////////////////////////////////////
        //////// Append invisible circles for tooltip ///////////
        /////////////////////////////////////////////////////////


        //Set up the small tooltip for when you hover over a circle
        tooltip = radar.append("text")
            .attr("class", "tooltip")
            .style("opacity", 0);
    }

    that.update = update;

    return that;

}//RadarChart

function getFeature(hero_id) {
    var res;

    feature_names = [ 'hero_id', 'gold_per_min', 'xp_per_min',
        'kills', 'deaths', 'assists', 'hero_damage', 'hero_healing', 'tower_damage', 'level']

    feature_limits = {
        gold_per_min: 571,
        xp_per_min: 647,
        kills: 13,
        deaths: 11,
        assists: 20,
        hero_damage: 24695,
        hero_healing: 5247,
        tower_damage: 4359,
        level: 23
    };

    this_feature = global_hero_features.filter(hero_struct => hero_struct.hero_id == hero_id);

    if (this_feature.length > 0){
        this_feature = this_feature[0];
        res = [
            [
                {axis: 'Gold Hunting', value: parseFloat(this_feature.gold_per_min) / feature_limits.gold_per_min},
                {axis: 'Experience Growth', value: parseFloat(this_feature.xp_per_min) / feature_limits.xp_per_min},
                {axis: 'Killer', value: parseFloat(this_feature.kills) / feature_limits.kills},
                {axis: 'Defender', value: 1 - parseFloat(this_feature.deaths) / feature_limits.deaths},
                {axis: 'Assistant', value: parseFloat(this_feature.assists) / feature_limits.assists},
                {axis: 'Damage Dealer', value: parseFloat(this_feature.hero_damage) / feature_limits.hero_damage},
                {axis: 'Healer', value: parseFloat(this_feature.hero_healing) / feature_limits.hero_healing},
                {axis: 'Tower Destroyer', value: parseFloat(this_feature.tower_damage) / feature_limits.tower_damage},
                {axis: 'Level', value: parseFloat(this_feature.level) / feature_limits.level}
            ]
        ];
    } else {
        res = [
            [
                {axis: 'Gold Hunting', value: 0.0},
                {axis: 'Experience Growth', value: 0.0},
                {axis: 'Killer', value: 0.0},
                {axis: 'Defender', value: 0.0},
                {axis: 'Assistant', value: 0.0},
                {axis: 'Damage Dealer', value: 0.0},
                {axis: 'Healer', value: 0.0},
                {axis: 'Tower Destroyer', value: 0.0},
                {axis: 'Level', value: 0.0}
            ]
        ];
    }
    return res;
}

function getTeamFeature(team_a) {
    res = [
        [
            {axis: 'Gold Hunting', value: 0.0},
            {axis: 'Experience Growth', value: 0.0},
            {axis: 'Killer', value: 0.0},
            {axis: 'Defender', value: 0.0},
            {axis: 'Assistant', value: 0.0},
            {axis: 'Damage Dealer', value: 0.0},
            {axis: 'Healer', value: 0.0},
            {axis: 'Tower Destroyer', value: 0.0},
            {axis: 'Level', value: 0.0}
        ]
    ];

    team_a.forEach(function(hero_id) {
        this_feature = getFeature(hero_id);
        [0, 1, 2, 3, 4, 5, 6, 7, 8].forEach(function(item){
            res[0][item].value += this_feature[0][item].value / team_a.length;
        });
    })
    return res;
}