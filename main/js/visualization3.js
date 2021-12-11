var margin = {top: 50, right: 50, bottom: 50, left: 50},
    width = 1400 - margin.left - margin.right,
    height = 1200 - margin.top - margin.bottom;

var top_width = 2 * width / 5;
var top_height = height / 6;

var middle_width = width / 3;
var middle_height = height / 4;

var bottom_width = width / 3;
var bottom_height = height - top_height - middle_height;

var global_gauge_svg_config = {
    dimension: {
        width: middle_width,
        height: middle_height
    },
    margin: {
        top: 40,
        right: 10,
        bottom: 10,
        left: 10
    },
};

var global_team_svg_config = {
    dimension: {
        width: top_width,
        height: top_height
    },
    margin: {
        top: 10,
        bottom: 10,
        left: 10,
        right: 10
    },
    box_size: 30
};

var global_spider_svg_config = {
    dimension: {
        width: middle_width,
        height: middle_height
    },
    margin: {
        top: 20,
        right: 40,
        bottom: 20,
        left: 100
    },
    circle_dimension: {
        width: middle_height*4/5,
        height: middle_height*4/5,
    },
    circle_margin: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
    },
};

var global_team_svg1 = d3.select("#top_area")
    .selectAll("feynman")
    .data([0])
    .enter()
    .append("svg")
    .attr("width", global_team_svg_config.dimension.width)
    .attr("height", global_team_svg_config.dimension.height)
    .style("background-color", "black")
    .append("g")
    .attr("id", "team_svg1");

var place_holder_svg = d3.select("#top_area")
    .selectAll("feynman")
    .data([0])
    .enter()
    .append("svg")
    .attr("width", width - 2 * global_team_svg_config.dimension.width)
    .attr("height", global_team_svg_config.dimension.height)
    .style("background-color", "black");

place_holder_svg.append("text")
    .attr("x", (width - 2 * global_team_svg_config.dimension.width) / 2)
    .attr("y", global_team_svg_config.dimension.height / 2)
    .attr("text-anchor", "middle")
    .style("fill", "white")
    .style("font-size", "23px")
    .text("V.S.");

var global_team_svg2 = d3.select("#top_area")
    .selectAll("feynman")
    .data([0])
    .enter()
    .append("svg")
    .attr("width", global_team_svg_config.dimension.width)
    .attr("height", global_team_svg_config.dimension.height)
    .style("background-color", "black")
    .append("g")
    .attr("id", "team_svg2");

var global_spider1_svg = d3.select("#middle_area")
    .selectAll("feynman")
    .data([0])
    .enter()
    .append("svg")
    .attr("width", global_spider_svg_config.dimension.width)
    .attr("height", global_spider_svg_config.dimension.height)
    .style("background-color", "black")
    .append("g")
    .attr("transform", "translate(" + global_spider_svg_config.margin.left + "," + global_spider_svg_config.margin.top + ")")
    .attr("id", "team_spider_svg1");

var global_gauge_svg = d3.select("#middle_area")
    .append("svg")
    .attr("width", global_gauge_svg_config.dimension.width)
    .attr("height", global_gauge_svg_config.dimension.height)
    .style("background-color", "black")
    .append("g")
    .attr("transform", "translate(" + global_gauge_svg_config.margin.left + "," + global_gauge_svg_config.margin.top + ")")
    .attr("id", "gauge_svg");


global_gauge_svg.append("text")
    .attr("x", (middle_width - global_gauge_svg_config.margin.left) / 2)
    .attr("y", -15)
    .attr("text-anchor", "middle")
    .style("fill", "white")
    .style("font-size", "20px")
    .text("POINTER OF VICTORY");

var global_spider2_svg = d3.select("#middle_area")
    .selectAll("feynman")
    .data([0])
    .enter()
    .append("svg")
    .attr("width", global_spider_svg_config.dimension.width)
    .attr("height", global_spider_svg_config.dimension.height)
    .style("background-color", "black")
    .append("g")
    .attr("transform", "translate(" + global_spider_svg_config.margin.left + "," + global_spider_svg_config.margin.top + ")")
    .attr("id", "team_spider_svg2");

var strength_svg = d3.select("#bottom_area")
    .selectAll("feynman")
    .data([0])
    .enter()
    .append("svg")
    .attr("width", bottom_width)
    .attr("height", bottom_height)
    .style("background-color", "black");

var agility_svg = d3.select("#bottom_area")
    .selectAll("feynman")
    .data([0])
    .enter()
    .append("svg")
    .attr("width", bottom_width)
    .attr("height", bottom_height)
    .style("background-color", "black");

var intelligence_svg = d3.select("#bottom_area")
    .selectAll("feynman")
    .data([0])
    .enter()
    .append("svg")
    .attr("width", bottom_width)
    .attr("height", bottom_height)
    .style("background-color", "black");

global_hero_names = undefined;
global_hero_features = undefined;
timeout = null;

gauge_svg = makeGaugePlot('#gauge_svg', {
    size: global_gauge_svg_config.dimension.width * 0.8,
    clipWidth: global_gauge_svg_config.dimension.width - global_gauge_svg_config.margin.left - global_gauge_svg_config.margin.right,
    clipHeight: global_gauge_svg_config.dimension.height - global_gauge_svg_config.margin.top - global_gauge_svg_config.margin.bottom,
    ringWidth: global_gauge_svg_config.dimension.width / 5
});
team_svg1 = makeTeamPlot("#team_svg1", global_team_svg_config, "Team Radiant", true);
team_svg2 = makeTeamPlot("#team_svg2", global_team_svg_config, "Team Dire", false);

var global_selected_hero_1 = {
    // max capacity, =1 for figure 2, =5 for figure 3
    capacity: 5,
    // reject new element if max capacity is met, if 0 then act as fixed length queue (FIFO)
    reject_on_limit: 1,
    // reselect to remove element from selection. if 0 then allow duplicates
    remove_on_reselect: 1,
    // container
    selections: [],
};

var global_selected_hero_2 = {
    // max capacity, =1 for figure 2, =5 for figure 3
    capacity: 5,
    // reject new element if max capacity is met, if 0 then act as fixed length queue (FIFO)
    reject_on_limit: 1,
    // reselect to remove element from selection. if 0 then allow duplicates
    remove_on_reselect: 1,
    // container
    selections: [],
};

team_svg1.render(global_selected_hero_1);
team_svg2.render(global_selected_hero_2);
gauge_svg.render(0.5);

team_spider_svg1 = makeSpiderPlot('#team_spider_svg1',
    {
        width: global_spider_svg_config.circle_dimension.width,
        height: global_spider_svg_config.circle_dimension.height,
        margin: global_spider_svg_config.circle_margin,
        features: global_default_feature
    }
);
team_spider_svg2 = makeSpiderPlot('#team_spider_svg2',
    {
        width: global_spider_svg_config.circle_dimension.width,
        height: global_spider_svg_config.circle_dimension.height,
        margin: global_spider_svg_config.circle_margin,
        features: global_default_feature
    }
);
team_spider_svg1.render([global_default_feature]);
team_spider_svg2.render([global_default_feature]);



Promise.all([
    d3.csv("../data/hero_names.csv"),
    d3.csv("../data/hero_features.csv"),
    d3.csv("../data/hero_name_new.csv"),
]).then(function (data) {
        global_hero_names = data[0];
        global_hero_features = data[1];
        global_hero_names_new = data[2];

        hero_names_map = {};
        global_hero_names.forEach(function (item) {
            hero_names_map[item.hero_id] = item.local_name;
        });

        hero_chart({
            hero_svg: strength_svg,
            gauge_svg: gauge_svg,
            team_svg1: team_svg1,
            team_svg2: team_svg2,
            team_spider_svg1: team_spider_svg1,
            team_spider_svg2: team_spider_svg2,
            selected_hero_1: global_selected_hero_1,
            selected_hero_2: global_selected_hero_2,
            title: "Strength",
            n_col: 4,
        });

        hero_chart({
            hero_svg: agility_svg,
            gauge_svg: gauge_svg,
            team_svg1: team_svg1,
            team_svg2: team_svg2,
            team_spider_svg1: team_spider_svg1,
            team_spider_svg2: team_spider_svg2,
            selected_hero_1: global_selected_hero_1,
            selected_hero_2: global_selected_hero_2,

            title: "Agility",
            n_col: 4,
        });

        hero_chart({
            hero_svg: intelligence_svg,
            gauge_svg: gauge_svg,
            team_svg1: team_svg1,
            team_svg2: team_svg2,
            team_spider_svg1: team_spider_svg1,
            team_spider_svg2: team_spider_svg2,
            selected_hero_1: global_selected_hero_1,
            selected_hero_2: global_selected_hero_2,

            title: "Intelligence",
            n_col: 4,
        });
    }
).catch(function (error) {
    console.log(error);
});