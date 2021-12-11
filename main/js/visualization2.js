var margin = {top: 50, right: 50, bottom: 50, left: 50},
    width = 1400 - margin.left - margin.right,
    height = 1200 - margin.top - margin.bottom;

var hero_width = width * 4 / 6;
var spider_width = width - hero_width;

var hero_height = height / 2;
var suggestion_height = (height - hero_height) / 4;


var global_spider_svg_config = {
    dimension: {
        width: spider_width,
        height: hero_height
    },
    margin: {
        top: 50,
        right: 20,
        bottom: 20,
        left: 20
    },
    circle_dimension: {
        width: 400,
        height: 400
    },
    circle_margin: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
    },
};

var imageWidth = width / 5;
var imageNum = 5;

var hero_pool = d3.select("#top_area")
    .selectAll("feynman")
    .data([0])
    .enter()
    .append("svg")
    .attr("width", hero_width)
    .attr("height", hero_height)
    .style("background-color", "black");

var global_spider_svg = d3.select("#top_area")
    .selectAll("feynman")
    .data([0])
    .enter()
    .append("svg")
    .attr("width", global_spider_svg_config.dimension.width)
    .attr("height", global_spider_svg_config.dimension.height)
    .style("background-color", "black")
    .append("g")
    .attr("transform", "translate(" + global_spider_svg_config.margin.left + "," + global_spider_svg_config.margin.top + ")")
    .attr("id", "spider_svg");

var item_svg = d3.select("#items")
    .selectAll("feynman")
    .data([0])
    .enter()
    .append("svg")
    .attr("width", width)
    .attr("height", suggestion_height)
    .style("background-color", "black");

var counter_svg = d3.select("#counter")
    .selectAll("feynman")
    .data([0])
    .enter()
    .append("svg")
    .attr("width", width)
    .attr("height", suggestion_height)
    .style("background-color", "black");

var recounter_svg = d3.select("#recounter")
    .selectAll("feynman")
    .data([0])
    .enter()
    .append("svg")
    .attr("width", width)
    .attr("height", suggestion_height)
    .style("background-color", "black");

global_hero_names = undefined;
global_hero_features = undefined;
global_hero_names_new = undefined;
global_item_recommendation = undefined;
global_counter_pick = undefined;
global_recounter_pick = undefined;
timeout = null;

spider_svg = makeSpiderPlot('#spider_svg',
    {
        width: global_spider_svg_config.circle_dimension.width,
        height: global_spider_svg_config.circle_dimension.height,
        margin: global_spider_svg_config.circle_margin,
        features: global_default_feature
    }
);
spider_svg.render([global_default_feature]);

var global_selected_hero = {
    // max capacity, =1 for figure 2, =5 for figure 3
    capacity: 1,
    // reject new element if max capacity is met, if 0 then act as fixed length queue (FIFO)
    reject_on_limit: 0,
    // reselect to remove element from selection. if 0 then allow duplicates
    remove_on_reselect: 0,
    // container
    selections: [],
};

Promise.all([
    d3.csv("../data/hero_names.csv"),
    d3.csv("../data/hero_features.csv"),
    d3.csv("../data/hero_name_new.csv"),
    d3.csv("./data/item_recommendation.csv"),
    d3.csv("./data/counter_pick.csv"),
    d3.csv("./data/recounter_pick.csv")
]).then(function (data) {
        global_hero_names = data[0];
        global_hero_features = data[1];
        global_hero_names_new = data[2];
        global_item_recommendation = data[3];
        global_counter_pick = data[4];
        global_recounter_pick = data[5];

        global_hero_names_new.forEach(element => {
            var image_name = element["name"].slice(element["name"].indexOf("npc_dota_hero_") + "npc_dota_hero_".length);
            var image_path = "../image/small/" + image_name + "_sb.png";
            element["image"] = image_path;
        });

        global_item_recommendation.forEach(element => {
            var image_path = "../image/itemsById/" + element["item_id"] + ".jpg";
            element["image"] = image_path;
        });

        hero_chart({
            hero_svg: hero_pool,
            gauge_svg: null,
            spider_svg: spider_svg,
            team_svg1: null,
            team_svg2: null,
            selected_hero_1: global_selected_hero,
            selected_hero_2: null,
            item_svg: item_svg,
            counter_svg: counter_svg,
            recounter_svg: recounter_svg,
            title: "All Hero",
            n_col: 12,
        });
    }
).catch(function (error) {
    console.log(error);
});
