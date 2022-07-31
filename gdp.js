var DataArray = [];
async function init() {

  var svg = d3
    .select("#my_dataviz")
    .append("svg")
    .attr("width", width + margin.left + margin.right + 50)
    .attr("height", height + margin.top + margin.bottom + 50)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")").attr("class", "mainSVGDiv");

  d3.csv("./World-Data.csv").then(function (data) {
    // CREATING A different lists
    S = new Set();
    var GDPData = [];

    for (i = 0; i < data.length; i++) {
      S.add(data[i]["Country"]);
      if (data[i]["Series"] == "GDP") {
        GDPData.push(data[i]);
      }
    }
    countryData = Array.from(S);
    var yearList = [2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011,2012, 2013, 2014, 2015, 2016, 2017];

    //find min and max GDP
    let GDP_Max = 0;
    let GDP_Min = GDP_Max;
    for (i = 0; i < GDPData.length; i++) {
      for (j = 2001; j <= 2021; j++) {
        if (GDPData[i][j] > GDP_Max) {
          GDP_Max = GDPData[i][j];
        }
        if (GDPData[i][j] < GDP_Min) {
          GDP_Min = GDPData[i][j];
        }
      }
    }
    var hashCountry = window.location.hash.split("%20");
    hashCountry[0] = hashCountry[0].substring(1);
    hashCountry = hashCountry.join(" ");
    console.log(hashCountry);
    if(window.location.hash.length<1){
      window.location.hash="India"
    }


    var keys = Object.keys(GDPData[0]);
    keys = keys.splice(0, 20)

    GDP_Min = GDP_Min - GDP_Min * 0.1;
    const countryList = Array.from(S);
    //Country Drop Down
    var selectTag = d3.select("select");
    d3.select(".scene3box").style("visibility", "visible");
    var options = selectTag.selectAll("option").data(countryList);
    options
      .enter()
      .append("option")
      .attr("value", function (d, i) {
        return i;
      })
      .text(function (d) {
        return d;
      }).attr("selected",function(d){
        if(d==hashCountry){
          return "selected";
        }
      });


    var selected = d3.select("#dropDown").node().value;
    selectedText = d3.select("#dropDown option:checked").text();
    const mortalityButton = d3.select("#mortalityButton");
    mortalityButton.on("click", function () {
      window.location.href = "./mortality.html#"+selectedText;
    })

    var selectedCountryList = [];
    arrayData = []
    console.log(hashCountry);
    for (i = 0; i < GDPData.length; i++) {
        if (GDPData[i]["Country"]==hashCountry) {
            selectedCountryList = (GDPData[i]);
            break;
        }
    }

    d3.select("#dropDown").on("change", function () {     

        // changeValues(selectedText, DataArray);
        selected = d3.select("#dropDown").node().value;
        selectedText = d3.select("#dropDown option:checked").text();
        d3.selectAll("circle").style("fill", "#69b3a2");
        d3.selectAll("circle").style("opacity", 0.3);
        window.location.hash=selectedText

        const mortalityButton = d3.select("#mortalityButton");
        mortalityButton.on("click", function () {
          selectedText = d3.select("#dropDown option:checked").text();
          window.location.href = "./mortality.html#"+selectedText;
        })

        for(i=0;i<GDPData.length;i++){
            if(GDPData[i]["Country"]==selectedText){
                selectedCountryList = GDPData[i];
                break;
            }
        }
        for(i = 0;i<keys.length;i++){
            arrayData.push([keys[i], selectedCountryList[keys[i]]]);
        }

        changeValues(selectedText);
        d3.select("svg")
        .selectAll("circle")
        .data(arrayData , function (d) {
          return d;
        })
        .attr("cx", function (d, i) {
          return x(Number(d[0]))
        }).attr("cy", function (d) {
          return y(Number(d[1]));
        });
      });

    var x = d3.scaleLinear().domain([2001, 2020]).range([0, width]);
    var y = d3.scaleLinear().domain([GDP_Min, 120000]).range([height, 0]);
    svg.append("g").attr("transform", "translate(0," + height + ")").call(d3.axisBottom(x));
    svg.append("g").call(d3.axisLeft(y));

    changeValues(hashCountry);


    function changeValues(selectedCountry) {
    clear_all = []
      d3.selectAll("circle").data(clear_all).exit().remove();
      d3.selectAll(".tooltip").data(clear_all).exit().remove();
      d3.selectAll(".line").data(clear_all).exit().remove();

      DataArray = []
      for(i = 0;i<keys.length;i++){
        DataArray.push([keys[i], selectedCountryList[keys[i]]]);
    }
      svg
        .selectAll(".dot")
        .data(DataArray)
        .enter()
        .append("circle")
        .attr("class", function (d) {
          return "orangeDot";
        })
        .attr("cx", function (d, i) {
          return x(Number(d[0]))
        })
        .attr("cy", function (d) {
          return y(Number(d[1]));
        })
        .attr("r", 5)
        .style("stroke", "white")
        .on("mouseover", function (d, i) {
          var tooltip = document.getElementById("tooltip");
          div
            .transition()
            .duration(200)
            .style("opacity", 0.9)
            .style("transform", "scale(1.2)")
            .style("top", event.pageY - 180 + "px")
            .style("left", event.pageX - 10 + "px");
          tooltip.innerHTML ="Country: "+selectedCountry+"<br />Year: " + i[0] + "<br/> GDP: " + Math.round(Number(i[1]));
        })
        .on("mouseout", function (d) {
          div
            .transition()
            .duration(1000)
            .style("opacity", 0)
            .style("transform", "scale(0.8)");
        });

        var group = d3.select("#my_dataviz").select("svg").append('g')
        // .attr('id', countryid);
    group.append("path")
        .datum(DataArray)
        .attr("class", "line")
        .attr("transform", "translate(" + 120 + "," + 10 + ")")
        .style("fill", "none")
        .style("stroke", "#ffabab")
        .style("stroke-width", "3")
        .attr("d", function (d) {
            return d3.line()
                .x(function (d) {
                    return x(Number(d[0]))
                })
                .y(function (d) {
                    //console.log(d);
                    return y(Number(d[1]));
                })(d)
        })


      //labels
      var div = d3
        .select("#my_dataviz")
        .append("div")
        .attr("class", "tooltip")
        .attr("id", "tooltip")
        .style("opacity", 0);

      d3.select("svg")
        .append("text")
        .attr("class", "y label")
        .attr("text-anchor", "end")
        .attr("x", -200)
        .attr("y", 20)
        .attr("dy", ".25em")
        .style("fill", "Black")
        .style("font-weight", "bold")
        .attr("transform", "rotate(-90)")
        .text("GDP");

      d3.select("svg")
        .append("text")
        .attr("class", "x label")
        .attr("text-anchor", "end")
        .attr("x", 550)
        .attr("y", 470)
        .attr("dy", ".25em")
        .style("fill", "Black")
        .style("font-weight", "bold")
        .text("Year");
    
    
      }
    //annotation
   
    notes.innerHTML = "*The data is from the <a class='' href='https://www.worldbank.org/'>World Bank</a>";
    notes.innerHTML = "<b>GDP per Capita:</b>We can notice a sudden dip in the GDP of Countries in 2008-2009 due to <i>Great Recession<i/> and in 2020 due to <i>COVID-19</i>."
    notes.style.fontSize = "18px";

  });
}
