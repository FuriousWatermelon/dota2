function filter_hero(hero_list, type_id) {
    var res = [];
    hero_list.forEach(function(hero_struct){
        if (hero_struct.hero_type == type_id ) {
            res.push(hero_struct);
        }
    });
    return res;
};

function hero_chart(configurations) {

    hero_svg = configurations.hero_svg;
    gauge_svg = configurations.gauge_svg;
    spider_svg = configurations.spider_svg;
    team_svg1 = configurations.team_svg1;
    team_svg2 = configurations.team_svg2;
    team_spider_svg1 = configurations.team_spider_svg1;
    team_spider_svg2 = configurations.team_spider_svg2;
    selected_hero_1 = configurations.selected_hero_1,
    selected_hero_2 = configurations.selected_hero_2,
    item_svg = configurations.item_svg;
    counter_svg = configurations.counter_svg;
    recounter_svg = configurations.recounter_svg;
    title = configurations.title;
    n_col = configurations.n_col;


    var hero_name_map = {};
    for (var i = 0; i < global_hero_names_new.length; i++) {
        var id = global_hero_names_new[i]["id"];
        hero_name_map[id] = global_hero_names_new[i]["localized_name"];
    }

    var margin = {top: 50, right: 40, bottom: 50, left: 40};

    var interval = 1;

    hero_id_name = [];
    if (title == "Strength") {
        hero_id_name = filter_hero(global_hero_names, 1);
    } else if (title == "Agility") {
        hero_id_name = filter_hero(global_hero_names, 2);
    } else if (title == "Intelligence") {
        hero_id_name = filter_hero(global_hero_names, 3);
    } else {
        hero_id_name = global_hero_names;
    }

    var n_hero = hero_id_name.length;
    var n_row = Math.ceil(n_hero / n_col);

    var width = +hero_svg.attr("width");
    var height = +hero_svg.attr("height");

    var image_width = (width - interval * (n_col - 1) - margin.left - margin.right) / n_col;
    var image_height = (height - interval * (n_row - 1) - margin.top - margin.bottom) / n_row;

    hero_svg.append("text")
        .attr("x", width / 2)
        .attr("y", margin.top * 3 / 5)
        .attr("text-anchor", "middle")
        .style("fill", function (d) {
            if (title == "Strength") {
                return "darkred";
            } else if (title == "Agility") {
                return "limegreen";
            } else if (title == "Intelligence") {
                return "dodgerblue";
            } else {
                return "white"
            }
        })
        .style("font-size", "23px")
        .text(title);

    // define the nodes
    var node = hero_svg.selectAll(".node")
        .data(hero_id_name)
        .enter().append("g")
        .attr("class", "node")
        .on("click", clicked)
        .on("dblclick", dblclicked)
        .on("mouseover", function(d, i) {
            //Get this bar's x/y values, then augment for the tooltip
            var xPosition = (i % n_col) * (image_width + interval) + 5;
            var yPosition = Math.floor(i / n_col) * (image_height + interval) + 5;
            //Update the tooltip position and value
            d3.select("#tooltip")
                .style("left", xPosition + "px")
                .style("top", yPosition + "px")
                .select("#value")
                .text(d.hero_name)
                .attr("transform", "translate(" + margin.right + "," + margin.top + ")")
                .style('font-size', '14px');

            //Show the tooltip
            d3.select("#tooltip").classed("hidden", false);

       })
       .on("mouseout", function() {

            //Hide the tooltip
            d3.select("#tooltip").classed("hidden", true);

       });

    node.append("image")
        .attr("xlink:href", function (d, i) {
            var path = "../image/small/" + d.local_name + "_sb.png";
            return path;
        })
        .attr("width", image_width)
        .attr("height", image_height)
        .attr("x", function (d, i) {
            x = (i % n_col) * (image_width + interval);
            return x;
        })
        .attr("y", function (d, i) {
            y = Math.floor(i / n_col) * (image_height + interval);
            return y;
        })
        .attr("transform", "translate(" + margin.right + "," + margin.top + ")");

    node.append("rect")
        .attr("width", image_width)
        .attr("height", image_height)
        .attr("x", function (d, i) {
            x = (i % n_col) * (image_width + interval);
            return x;
        })
        .attr("y", function (d, i) {
            y = Math.floor(i / n_col) * (image_height + interval);
            return y;
        })
        .attr("transform", "translate(" + margin.right + "," + margin.top + ")")
        .classed("image-border-off", true);

    function clicked(d) {
        //
        clearTimeout(timeout);
        clicked_on = this;
        timeout = setTimeout( function (){
            // update the list of selections
            var updated = updateHeroList(selected_hero_1, d.hero_id, selected_hero_2);
            if (updated){
                var flag = d3.select(clicked_on).select("rect").classed("image-border-on-1");
                if (selected_hero_1.capacity == 1){
                    d3.selectAll("rect").classed("image-border-on-1", false);
                };
                d3.select(clicked_on).select("rect").classed("image-border-on-1", !flag);
                singleClickTask(d);
            }
        }, 300);
    }

    function dblclicked(d) {
        // d3.selectAll("rect").classed("image-border-on", false);
        clearTimeout(timeout);
        // update the list of selections
        var updated = updateHeroList(selected_hero_2, d.hero_id, selected_hero_1);
        if (updated) {
            var flag = d3.select(this).select("rect").classed("image-border-on-2");
            if (selected_hero_2.capacity == 1){
                d3.selectAll("rect").classed("image-border-on-2", false);
            };
            d3.select(this).select("rect").classed("image-border-on-2", !flag);
            doubleClickTask(d);
        };
    }

    function singleClickTask(select_hero) {
        /////////////////////////// OTHER STUFF FOR GAUGE PLOT ////////////////////
        // plot list of selections on gauge plot
        if (gauge_svg != null) {
            // plot list of selections on gauge plot
            gauge_svg.update(getWinRate(selected_hero_1.selections, selected_hero_2.selections, global_hero_features));
        }
        if (spider_svg != null) {
            // plot list of selections on gauge plot
            spider_svg.update(getFeature(select_hero.hero_id), hero_name_map[select_hero.hero_id]);
        }
        if (team_svg1 != null) {
            team_svg1.update(selected_hero_1);
        }
        if (item_svg != null) {
            updateAll(select_hero.hero_id, item_svg, counter_svg, recounter_svg);
        }
        if (team_spider_svg1 != null) {
            // plot list of selections on gauge plot
            team_spider_svg1.update(getTeamFeature(selected_hero_1.selections));
        }
    }

    function doubleClickTask(select_hero) {
        /////////////////////////// OTHER STUFF FOR GAUGE PLOT ////////////////////
        // plot list of selections on gauge plot
        if (gauge_svg != null) {
            // plot list of selections on gauge plot
            gauge_svg.update(getWinRate(selected_hero_1.selections, selected_hero_2.selections, global_hero_features));
        }
        if (team_svg2 != null) {
            team_svg2.update(selected_hero_2);
        }
        if (item_svg != null) {
            updateAll(select_hero.hero_id, item_svg, counter_svg, recounter_svg);
        }
        if (team_spider_svg2 != null) {
            team_spider_svg2.update(getTeamFeature(selected_hero_2.selections));
        }
    }
}