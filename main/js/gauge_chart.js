function getWinRate(team_a, team_b, features) {
    if (team_a.length == 0 || team_b.length == 0)
        return 0.5;
    else {
        var team_a_individual_features = features.filter(item => team_a.includes(item["hero_id"]));
        var team_b_individual_features = features.filter(item => team_b.includes(item["hero_id"]));

        var team_a_features = {
            gold_per_min: 0,
            xp_per_min: 0,
            hero_damage: 0,
            hero_healing: 0,
            tower_damage: 0,
            level: 0
        }

        var team_b_features = {
            gold_per_min: 0,
            xp_per_min: 0,
            hero_damage: 0,
            hero_healing: 0,
            tower_damage: 0,
            level: 0
        }

        for (item of team_a_individual_features) {
            team_a_features.gold_per_min += parseFloat(item["gold_per_min"]);
            team_a_features.xp_per_min += parseFloat(item["xp_per_min"]);
            team_a_features.hero_damage += parseFloat(item["hero_damage"]);
            team_a_features.hero_healing += parseFloat(item["hero_healing"]);
            team_a_features.tower_damage += parseFloat(item["tower_damage"]);
            team_a_features.level += parseFloat(item["level"]);
        }

        for (item of team_b_individual_features) {
            team_b_features.gold_per_min += parseFloat(item["gold_per_min"]);
            team_b_features.xp_per_min += parseFloat(item["xp_per_min"]);
            team_b_features.hero_damage += parseFloat(item["hero_damage"]);
            team_b_features.hero_healing += parseFloat(item["hero_healing"]);
            team_b_features.tower_damage += parseFloat(item["tower_damage"]);
            team_b_features.level += parseFloat(item["level"]);
        }

        team_a_features.gold_per_min = team_a_features.gold_per_min / team_a.length;
        team_a_features.xp_per_min = team_a_features.xp_per_min / team_a.length;
        team_a_features.hero_damage = team_a_features.hero_damage / team_a.length;
        team_a_features.hero_healing = team_a_features.hero_healing / team_a.length;
        team_a_features.tower_damage = team_a_features.tower_damage / team_a.length;
        team_a_features.level = team_a_features.level / team_a.length;

        team_b_features.gold_per_min = team_b_features.gold_per_min / team_b.length;
        team_b_features.xp_per_min = team_b_features.xp_per_min / team_b.length;
        team_b_features.hero_damage = team_b_features.hero_damage / team_b.length;
        team_b_features.hero_healing = team_b_features.hero_healing / team_b.length;
        team_b_features.tower_damage = team_b_features.tower_damage / team_b.length;
        team_b_features.level = team_b_features.level / team_b.length;

        // Creating a XHR object 
        let team_a_url = team_a_features.gold_per_min.toString() + "_" + team_a_features.xp_per_min.toString() + "_" + team_a_features.hero_damage.toString() + "_" + team_a_features.hero_healing.toString() + "_" + team_a_features.tower_damage.toString() + "_" + team_a_features.level.toString();
        let team_b_url = team_b_features.gold_per_min.toString() + "_" + team_b_features.xp_per_min.toString() + "_" + team_b_features.hero_damage.toString() + "_" + team_b_features.hero_healing.toString() + "_" + team_b_features.tower_damage.toString() + "_" + team_b_features.level.toString();
        let url = "http://127.0.0.1:5000/predict?team_a=" + team_a_url + "&team_b=" + team_b_url;

        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, false);
        xhr.send("");

        if (xhr.readyState === XMLHttpRequest.DONE) {
            var status = xhr.status;
            if (status === 0 || (status >= 200 && status < 400)) {
                // The request has been completed successfully
                var obj = JSON.parse(xhr.responseText)
                return obj["win_rate"];
            } else {
                // Oh no! There has been an error with the request!
            }
        }
    }
}

function updateHeroList(container, new_hero_id, other_container) {
    if (container !== null){
        idx = container.selections.indexOf(new_hero_id);
    } else {
        return false;
    }

    if (other_container !== null) {
        other_idx = other_container.selections.indexOf(new_hero_id);
    } else {
        other_idx = -1;
    };

    if (container.remove_on_reselect == 1) {
        if (idx !== -1) {
            // exists
            container.selections.splice(idx, 1);
            return true;
        } else {
            // not exist in current, append if no conflict
            if (other_idx == -1){
                container.selections.push(new_hero_id);
                if (container.selections.length > container.capacity) {
                    if (container.reject_on_limit) {
                        container.selections.splice(container.selections.length - 1, 1);
                        return false;
                    } else {
                        container.selections.splice(0, 1);
                        return true;
                    }
                };
                return true;
            } else {
                return false;
            }
        }
    } else {
        container.selections.push(new_hero_id);
        if (container.selections.length > container.capacity) {
            if (container.reject_on_limit) {
                container.selections.splice(container.selections.length - 1, 1);
                return false;
            } else {
                container.selections.splice(0, 1);
                return true;
            }
        }
        return true;
    }
}

function makeGaugePlot(container, configuration) {
    var that = {};
    var starting_value = 0.5;
    var config = {
        size: 200,
        clipWidth: 200,
        clipHeight: 110,
        ringInset: 20,
        ringWidth: 20,

        pointerWidth: 10,
        pointerTailLength: 5,
        pointerHeadLengthPercent: 0.9,

        minValue: 0.0,
        maxValue: 1.0,

        minAngle: -90,
        maxAngle: 90,

        transitionMs: 1000,

        majorTicks: 10,
        labelFormat: d3.format('.0%'),
        labelInset: 10,

        arcColorFn: d3.interpolateHsl("#d53e4f", "#4daf4a")
    };

    var range = undefined;
    var r = undefined;
    var pointerHeadLength = undefined;
    var value = 0.5; // starting value

    var svg = undefined;
    var arc = undefined;
    var scale = undefined;
    var ticks = undefined;
    var tickData = undefined;
    var pointer = undefined;

    function deg2rad(deg) {
        return deg * Math.PI / 180;
    }

    function newAngle(d) {
        var ratio = scale(d);
        var newAngle = config.minAngle + (ratio * range);
        return newAngle;
    }

    function configure(configuration) {
        var prop = undefined;
        for (prop in configuration) {
            config[prop] = configuration[prop];
        }

        range = config.maxAngle - config.minAngle;
        r = config.size / 2;
        pointerHeadLength = Math.round(r * config.pointerHeadLengthPercent);

        // a linear scale that maps domain values to a percent from 0..1
        scale = d3.scaleLinear()
            .range([0, 1])
            .domain([config.minValue, config.maxValue]);

        ticks = scale.ticks(config.majorTicks);
        tickData = d3.range(config.majorTicks).map(function () {
            return 1 / config.majorTicks;
        });

        arc = d3.arc()
            .innerRadius(r - config.ringWidth - config.ringInset)
            .outerRadius(r - config.ringInset)
            .startAngle(function (d, i) {
                var ratio = d * i;
                return deg2rad(config.minAngle + (ratio * range));
            })
            .endAngle(function (d, i) {
                var ratio = d * (i + 1);
                return deg2rad(config.minAngle + (ratio * range));
            });
    }

    that.configure = configure;

    function centerTranslation() {
        return 'translate(' + config.clipWidth / 2 + ',' + config.clipHeight * 0.8 + ')';
    }

    function isRendered() {
        return (svg !== undefined);
    }

    that.isRendered = isRendered;

    function render(newValue) {
        svg = d3.select(container)
            .append('svg')
            .attr('class', 'gauge')
            .attr('width', config.clipWidth)
            .attr('height', config.clipHeight);

        var centerTx = centerTranslation();

        var arcs = svg.append('g')
            .attr('class', 'arc')
            .attr('transform', centerTx);

        arcs.selectAll('path')
            .data(tickData)
            .enter().append('path')
            .attr('fill', function (d, i) {
                return config.arcColorFn(d * i);
            })
            .attr('d', arc);

        var lg = svg.append('g')
            .attr('class', 'label')
            .attr('transform', centerTx);
        lg.selectAll('text')
            .data(ticks)
            .enter().append('text')
            .attr('transform', function (d) {
                var ratio = scale(d);
                var newAngle = config.minAngle + (ratio * range);
                return 'rotate(' + (newAngle - 5) + ') translate(0,' + (config.labelInset - r) + ')';
            })
            .attr('fill', 'white')
            .text(function(prob) {return config.labelFormat(Math.abs(prob - 0.5) + 0.5)});

        var lineData = [[config.pointerWidth / 2, 0],
            [0, -pointerHeadLength],
            [-(config.pointerWidth / 2), 0],
            [0, config.pointerTailLength],
            [config.pointerWidth / 2, 0]];
        var pointerLine = d3.line().curve(d3.curveMonotoneX)
        var pg = svg.append('g').data([lineData])
            .attr('class', 'pointer')
            .attr('transform', centerTx);

        pointer = pg.append('path')
            .attr('d', pointerLine/*function(d) { return pointerLine(d) +'Z';}*/)
            .attr('fill', "cornsilk")
            .attr('transform', 'rotate(' + 0 + ')');

        update(newValue === undefined ? starting_value : newValue);
    }

    that.render = render;

    function update(newValue, newConfiguration) {
        if (newConfiguration !== undefined) {
            configure(newConfiguration);
        }
        var ratio = scale(newValue);
        var newAngle = config.minAngle + (ratio * range);
        pointer.transition()
            .duration(config.transitionMs)
            .ease(d3.easePoly)
            .attr('transform', 'rotate(' + newAngle + ')');
    }

    that.update = update;

    configure(configuration);

    return that;
}