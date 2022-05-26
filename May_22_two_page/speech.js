document.body.style.zoom = "100%"
var num = 0
params.keepplaying = false
id = document.cookie[0]
params.zoomview = names[id]
params.subvizx +=2
params.subvizy +=1


// Get it in the profile.html
//var cookie = document.cookie;
//console.log(cookie)
d3.csv(paths[id], function(error1, data1) {
  d3.csv(paths2[id], function(error2, data2) {
    // do something with the data
    console.log(data1)
    data_array = makeWordArray(data1)
    amp = makeAmpArray(data2)


  });
});

function clearSVG(){
  d3.select("#my_dataviz").html("")
  d3.select("#zoomslider").html("")
  d3.select("#gradient").html("")
  d3.select("#amplitude").html("")
}

function getPhraseView(){
  params.pltphrase = !params.pltphrase
  if (params.pltphrase == true){params.height = 14}else{params.height = 3}
  clearSVG()
  doStuff(data_array, amp)
}
function getIntonationView(){
  params.pltint = !params.pltint
  if (params.pltint == true){params.height = 14}else{params.height = 3}
  clearSVG()
  doStuff(data_array, amp)
}

function getAltcMapView(){
  params.cmap = !params.cmap
  clearSVG()
  doStuff(data_array, amp)
}


function doStuff(data_array, amp){
 viz = new make_viz(data_array,amp,params,player0, links, id,params['zoomview'] )
  viz.make_viz()
}



function makeAmpArray(data) {
  var amp ={
    t:[],
    amp:[],
    pit:[],
  }


    for (var i = 0; i < data.length; i++) {
      amp.t[i] = data[i].time
      amp.amp[i] = data[i].amplitude
      amp.pit[i] = data[i].pitch
    }


  return amp

}

function makeWordArray(data) {
  var data_array = {
    words: [],
    //time: [],
    duration:[],
    space:[],
    timeloc:[],
    pitch:[],
    amplitude:[],
    start:[],
    end:[],
    speed:[],

  }



    for (var i = 0; i < data.length; i++) {
      data_array.words[i] = data[i].Word
      //data_array.time[i] = data[i].time
      data_array.duration[i] = data[i].std_time_spent
      data_array.space[i] = data[i].post_space
      data_array.timeloc[i] = data[i].time
      data_array.pitch[i] = data[i].pitch
      data_array.amplitude[i] = data[i].amplitude
      data_array.start[i] = data[i].Start
      data_array.end[i] = data[i].End
      data_array.speed[i] = data[i].speed
    }

  return data_array
};



class make_viz {
  constructor(data_array, amp, params, player, link, id, name) {
    this.dpr = window.devicePixelRatio || 1

    this.data_array = data_array
    this.amp = amp
    this.params = params
    this.player = player
    this.link = link
    this.widthoffset = 0;
    this.linespacing = 70;
    this.xscaleoffset = 0;
    this.n = data_array.words.length
    this.name = 'viz'+id
    this.id = id
    this.title = name
    this.n_print = this.n
    this.t = window.performance.now()
    console.log(player)
//###

  }

  /**
   * returns an array with moving average of the input array
   * -------moving average slider cuts off before the end: edges might not be accurate
   * @param array - the input array
   * @param count - the number of elements to include in the moving average calculation
   */
  movingAvg(array, count, mean) {

    // calculate average for subarray
    var avg = function (subarray,mean) {

      var sum = 0, num = 0, val;
      for (let i = 0; i < subarray.length; i++) {
        if (subarray[i]==""){subarray[i] = mean}
        val = parseFloat(subarray[i]);
        sum += val;

        num++;
      }
      return sum / num;
    };

    var result = array.slice(0, count - 1), val;

    // calculate average for each subarray and add to result
    for (let i = count - 1; i < array.length; i++) {


      val = avg(array.slice(i - Math.floor(count / 2), i + Math.ceil(count / 2)),mean);

      result.push(val);

    }

    return result;

  }

  norm(array){
    var max, min, new_array
    max = d3.max(array)
    min = d3.min(array)
    new_array = array.map(function (value) {return (value-min)/(max-min);})

    return new_array
  }

  notnan (x) {
    return x!=NaN;
  }

  notnoise(array,noiseval) {
    let newarray = array.map(function (value){if (value>noiseval){return value}else{return 0}})
    return newarray
  }





  prep_data(amp){
    var amplitude, pitch
    this.meanpit = 0//math.mean((amp.pit).filter(this.notnan))
    this.meanamp = 0//math.mean((amp.amp).filter(this.notnan))

    if (this.params.n_avg>1) {
      this.amplitude = this.movingAvg(amp.amp, this.params.n_avg, this.meanamp)
      this.pitch = this.movingAvg(amp.pit, this.params.n_avg, this.meanpit)
    }else{this.amplitude = amp.amp;this.pitch = amp.pit}



    if (params.noise==true){
      this.amplitude = notnoise(amp.amp,this.params.noisefloor)
    }

    function impute(array){
      let num = 0
      let none = 0
      for (let i=0; i< array.length; i++){

        if (array[i] =='') {
          let id1 = i - 1
          while (array[i] == '') {
            i = i + 1
          }
          let id2 = i
          let dif = (+array[id2] - +array[id1]) / (id2 - id1)

          for (let j = id1 + 1; j < id2; j++) {
            array[j] = +array[j - 1] + dif

          }
        }

      }
      return array
    }

    this.opa = new Array(this.pitch.length).fill(1);
    this.pitch = impute(this.pitch)
    this.amplitude = impute(this.amplitude)
    if (params.norm == true){
      this.amplitude = this.norm(this.amplitude)

      //params.ampcurve = 1
    }

  }

//###
  make_scale(){
    var domval
    const t_words = this.params.num_words
    this.xScale = d3.scaleLinear()
      .domain([0, t_words ]) // input
      .range([0, this.width -this.widthoffset ]); // output

    // Y scale input between 0, 1 output in pxls
    this.yScale = d3.scaleLinear()
      .domain([0, 1]) // input
      .range([0, this.params.ampcurve*6 ]); // output

    if (params.ofs==true){domval = [-50,50]}else{domval = [60,300]}


  }

  make_svg(){

    var margin = {top: 50, right: 5, bottom: 50, left: 10}
      , width = (window.innerWidth - margin.left - margin.right)/this.params.subvizx// Use the window's width
      , height = (window.innerHeight - margin.top - margin.bottom) / this.params.subvizy // Use the window's height


//###
    this.svg = d3.select("#my_dataviz").data([this.name]).append("svg")
      .attr('id','svg'+this.name)
      .attr("width", width*this.params.width)
      .attr("height", 10*height*this.params.height)
      .attr("transform", "translate("+ margin.left+","+margin.top+")scale(" + params.zoomlvl + ")")
      .attr("overflow", "visible")
      //.call(zoom(this.name))
      .append("g")


    this.innerSVG = this.svg.append("svg")
      //.attr("width", width + margin.left + margin.right)
      //.attr("height", height + margin.top + margin.bottom)
      .attr("overflow", "visible")
      .append("g")
    this.width = width

    var zoom = d3.zoom()
      .scaleExtent([0.05, 1.7])
      .on("zoom", zoomed);
    d3.select("#zoomslider").append('text')
      .attr("text-anchor", "middle")
      .attr("x", 0)
      .attr("y", 0)
      .attr("font-size",  "1em")
      .attr("dy", .35 + "em")
      .attr("vertical-align", "middle")
      .attr('fill','black').text("Zoom")

    var slider = d3.select("#zoomslider").append("div").append("input")
      .attr('id','slider')
      .attr("type", "range")
      .attr("value", 1)
      .attr("min", zoom.scaleExtent()[0])
      .attr("max", zoom.scaleExtent()[1])
      .attr("step", (zoom.scaleExtent()[1] - zoom.scaleExtent()[0]) / 100)
      .on("input", slided);


    function zoomed() {
      console.log(d3.event.transform)
      const currentTransform = d3.event.transform;
      viz.svg.attr("transform", 'scale('+currentTransform.k+')');
      slider.property("value", currentTransform.k);
    }

    function slided() {

      zoom.scaleTo(viz.svg, d3.select('#slider').property("value"));
    }

  }



  makearea2(j,w,base) {
    let xScale = this.xScale, yScale = this.yScale, linespacing = this.linespacing
    var area
    area = d3.area()
      .defined(function(d) { return d[1]; })
      .x(function (d, i) {
        return xScale(d[0]);
      })
      .y1(function (d, i) {
        return  -1*yScale(d[2])+ linespacing * j-w;
      })
      .y0(function (d, i) {
        return  linespacing * j -w +base;
      })
      .curve(d3.curveMonotoneX);


    return area
  }

  make_plot(data_array, amp,params,player){
    // console.log(window.performance.now()-this.t)
    viz.svg.selectAll('.movingPoint').remove()
    function mouseClick(player,start,k,id) {

      //player.seekTo(20, true)
      //console.log(k, start)
      if (player.getPlayerState() == 1){
        player.pauseVideo()
        d3.selectAll('#pointer').transition()
        return
      }

      d3.event.preventDefault();
      const mouse = d3.mouse(d3.event.target);
      const [
        xCoord,
        yCoord,
      ] = mouse;

      const mouseY = 0

      const mouseX = +start + viz.xScale.invert(xCoord)



      const bisectDat = d3.bisector(d => d).right;

      const xIndex = bisectDat(amp.t, mouseX, 1);

      // console.log(mouseX)

      let dot = viz.innerSVG.selectAll('.hoverPoint')
        .attr('cx', xCoord)
        .attr('cy', yCoord)
        .attr('r', '3')
        .attr('fill', '#54faff')
        .attr('stroke', 'black')
        .attr('stroke-width', 0.1)
      /*console.log( dot)
                dot.attr('cx', xCoord)
                .attr('cy', yCoord)
                .attr('r', '7')
                .attr('fill', '#54faff')
                .attr('stroke', 'black')
              ;*/


      viz.svg.append('rect').classed('movingPoint', true);
      let starts = viz.starts
      let ends = viz.ends
      l = starts.findIndex(element => element >= mouseX)
      k = mouseX - viz.starts[l - 1]
      /*dot = viz0.svg.selectAll('.movingPoint')
        .attr('cx', viz0.xScale(k))
        .attr('cy', (l - 1) * viz0.linespacing)
        .attr('r', '7')
        .attr('fill', '#ee0059')
        .attr('stroke', 'black')*/


      let w = 1
      let rect = viz.svg.selectAll('.movingPoint')
        .attr('id','pointer')
        .attr('x', viz.xScale(k)-w)
        .attr('y', (l - 1) * viz.linespacing)
        .attr('width', w)
        .attr('height', viz.linespacing -20)//80)
        //.attr('stroke', 'black')
        .attr('fill', '#962a2a')
        .attr('opacity',1);


      /*let duration = 0
      let delay = 0
      duration = viz.ends[l - 1] - viz.starts[l-1] - k


      rect.transition().ease(d3.easeLinear)
        .duration(duration *1000).delay(delay)
        .attr('x', (viz.xScale(viz.ends[l - 1]- viz.starts[l-1])))
        .attr('y', (l-1) * viz.linespacing-w)

        rec.transition().ease(d3.easeLinear)
          .duration(duration*1000).delay(delay)
          .attr('x', (viz0.xScale(viz0.ends[l - 1]- viz0.starts[l-1] )))
          .attr('y', ( l-1) * viz0.linespacing-w)

        delay = delay + duration*1000
        rec.transition().ease(d3.easeLinear)
          .duration(20).delay(delay)
          .attr('x', (viz0.xScale(0)))
          .attr('y', (l) * viz0.linespacing-w)

        delay = delay + 20
        duration = viz0.ends[l] - viz0.starts[l]*/

      let delay = 0
      let duration = viz.ends[l - 1] - viz.starts[l-1] - k
      player.loadVideoById(links[id],mouseX)

      for (let i = l; i < viz.n_lines; i++) {


        rect.transition().ease(d3.easeLinear)
          .duration(duration*1000+500).delay(delay)
          .attr('x', (viz.xScale(viz.ends[i - 1]- viz.starts[i-1] )))
          .attr('y', ( i-1) * viz.linespacing)

        delay = delay + duration*1000
        rect.transition().ease(d3.easeLinear)
          .duration(20).delay(delay)
          .attr('x', (viz.xScale(0)))
          .attr('y', (i) * viz.linespacing)

        duration = viz.ends[i] - viz.starts[i]
        delay = delay + 20

      }








    }

    this.starts = []
    this.ends = []
    let n = this.n
    let t_words = this.params.num_words

    const zip2 = (a, b,c) => a.map((k, i) => [k, b[i],c[i]]);


    var lineheight = 0
    var j = 0
    var k = 0
    var p =0
    var q =0
    var l =0
    var m = 0
    var mt = 0
    var area, area_amp
    const getColumns = (arr, indices) => arr.map(row => indices.map(i => row[i]));





    if(this.params.cmap ==true){
      let pitmean = d3.mean(amp.pit)
      let pitstd = d3.deviation(amp.pit)
      let pmin = pitmean - 3*pitstd
      let pmax = pitmean + 3*pitstd
      console.log(pmin,pmax)
      var colors = ['#053061','#2166ac','#4393c3','#92c5de',
        '#d1e5f0','#f7f7f7','#fddbc7','#f4a582',
        '#e06a59','#c93461','#be223f']
      var pitrange = [0, 0.1,0.2,0.3,0.4,0.5,0.6,0.7,0.8,0.9, 1.0] .map(x => x * (pmax-pmin)+pmin)
    }else{
      let pmin = 55
      let pmax = 340

      var colors = [ '#307264', '#50897c' ,'#6fa194' ,'#c8d4c8',
        '#d2d6c9' ,'#dcd7ca' ,'#d8cbb9','#ddbfa9'
        ,'#dba788' , '#ce8264', '#b1684c'];
      var pitrange = [0, 0.05,0.1, 0.2, 0.3, 0.35, 0.4, 0.6, 0.7,0.85,  1.0] .map(x => x * (pmax-pmin)+pmin)
    }

    var getcolor =  d3.scaleLinear()
      .domain(pitrange)
      .range(colors).interpolate(d3.interpolateHcl)

    var get_clr = function (value, range){
      let clr = colors[range.findIndex(element => element > value)]
      return clr
    }
    var get_binned = function (value, range){
      let val = range.findIndex(element => element > value)
      return val
    }

    let data = zip2(amp.t,this.pitch,this.amplitude)
    //console.log(window.performance.now()-this.t)
    for (let i = 0; i < this.n_print; i++) {
      //console.log(window.performance.now()-this.t)
      var meanval, pltarr, clr, maxv, ymax, a, pltmean, pltstd

      if ( (+data_array.end[i] - data_array.start[m] >=t_words)*(!params.pltint*!params.pltint)|| i == n-1  || (data_array.space[i-1]>=params.phrasespacing)|| (data_array.speed[i-1]<=params.speed)*params.pltint) {
//###
        area_amp = this.makearea2(lineheight+1,37, 2)
        q = amp.t.findIndex(element => element > parseFloat(data_array.start[j]))
        p = amp.t.findIndex(element => element > parseFloat(data_array.end[i-1]));
        k = data_array.start[j]
        mt = data_array.start[m]
        l = data_array.end[i-1]
        pltarr = [[k - 0.001, data[q][1],data[q][2]]].concat(data.slice(q, p))
        pltarr[p-q + 1] = [+l + 0.01, data[p-1][1],data[p-1][2]]
        pltarr = pltarr.map(function (value) {
          //if (value[1]==''){
          //  value[1] = meanval
          //}
          return [value[0] - mt, value[1],value[2]];
        });
        //if (params.ofs == true){pltarr = pltarr.map(function (value) {return [value[0], value[1]-meanval,value[2]]});ymax = 45}else{ymax = 280}

        // a = this.yScale2(math.max(pltarr[1]))

        //if (pltarr.length <=2){maxv = 0}else{maxv = math.max(pltarr[2])}

        if (this.params.gradient == true){
          var ofs = []
          var clr_val = []
          var test = []

          for (let z = 0; z <= p-q+1; z++){

            ofs = pltarr[z][0] - pltarr[0][0]

            clr_val[z] = {offset: this.xScale(ofs)/this.xScale(pltarr[p-q+1][0]- pltarr[0][0])*100+'%',color: getcolor(pltarr[z][1])}

          }



//###


          this.innerSVG.append("linearGradient")
            .attr("id", "line-gradient_"+ this.name+String(j))
            .attr("gradientUnits", "userSpaceOnUse")
            //.attr("angle", "180deg")
            .attr("x1", this.xScale(pltarr[0][0]))
            .attr("x2", this.xScale(pltarr[p-q+1][0]))
            //.attr("y1", -150)
            //.attr("y2", 100)
            .attr("y1", "0%")
            .attr("y2", "0%")
            .selectAll("stop")
            .data(clr_val)
            .enter().append("stop")
            .attr("offset", function (d) {
              return d.offset;
            })
            .attr("stop-color", function (d) {
              return d.color;
            });

/////////////test
          var x = this.xScale


          // Add Y axis
          let curve = this.params.ampcurve
          var y = this.yScale2
          var linespacing = this.linespacing



////////////////////

        }
        //console.log((-yScale2(350)-yScale(0.5))/2+linespacing * lineheight-17, 5 + linespacing * lineheight-20, lineheight)
        this.innerSVG.append('circle').classed('hoverPoint', true);
        //let mouseMove
        //if (this.id==0){mouseMove = mouseMove0}else{mouseMove = mouseMove1}

        /*this.innerSVG.append('path')
          .attr('class', 'area')
          .attr("id", "curveshow"+lineheight)
          .datum(pltarr)
          //.attr('fill', '#B0C4DE')
          .attr('fill', "url(#line-gradient"+String(j)+")")
          .attr("stroke", "url(#line-gradient"+String(j)+")" )
          // .attr('stroke', 'black')
          //.attr("stroke-width", 0.2)
          .attr('opacity', this.params.curveopacity)
          .attr('d', area)
          .datum([mt,lineheight])
          .on('click', function (d){mouseMove(player, d[0],d[1])})*/

//###
        let name = Function("return " + 'params.name'+this.id)()
        let w = 35
        // console.log(meanamp)
        //pitch curve

        this.innerSVG.append('rect')
          .attr("id", "rect"+lineheight)
          .attr('x', this.xScale(pltarr[0][0]))
          .attr('y', (lineheight)*linespacing)
          .attr('width', this.xScale(pltarr[p-q+1][0] - pltarr[0][0]) )
          //.attr('height', this.linespacing*meanamp*3)
          //.attr("pointer-events", "visibleStroke")
          .attr('height', this.linespacing-w)
          //.attr("stroke-width", this.params.border*(meanamp*15)**3 )
          .attr('fill', "url(#line-gradient_"+ this.name+String(j)+")")
          .attr("stroke", "black" )
          .attr("stroke-width", 0.4 )
          .attr('opacity',1)
          .datum([mt,lineheight, this.id])
          .on('click', function (d){mouseClick(player, d[0],d[1],d[2])})
        //
        //.on('click', function (d){make_curve(d[1]);})//mouseMove(player, d[0],d[1])})
        //ampcurve
        this.innerSVG.append('path')
          .attr('class', 'area')
          .attr("id", "ampcurve"+lineheight)
          .datum(pltarr)
          .attr('fill', '#494949')
          // .attr('stroke', 'black')
          //.attr("stroke-width", 0.2)
          .attr('opacity', 1)
          .attr('d', area_amp)
        //.datum([mt,lineheight])
        //.on('click', function (d){mouseClick(player, d[0],d[1])})

        this.pltarr = pltarr
        this.opacity = 0
        //pitch+amp curve
        //console.log(pltarr)
        /*this.innerSVG.append('path')
          .attr('class', 'area')
          .attr("id", "curveshow"+lineheight)
          .datum(pltarr)
          //.attr('fill', '#B0C4DE')
          .attr('fill', "url(#line-gradient"+String(j)+")")
          .attr("stroke", "url(#line-gradient"+String(j)+")" )
          // .attr('stroke', 'black')
          //.attr("stroke-width", 0.2)
          .attr('opacity', this.params.curveopacity)
          .attr('d', area)
          //.datum([mt,lineheight])
          //.on('click', function (d){mouseMove(player, d[0],d[1])})*/


//white rect

        this.innerSVG.append('rect')
          .attr('x', this.xScale(pltarr[p-q+1][0]))
          .attr('y', (lineheight)*linespacing)
          .attr('width', this.xScale(data_array.space[i-1]))
          //.attr('height', this.linespacing*meanamp*3)
          .attr('height', this.linespacing - w)
          .attr("stroke-width", 0.05)
          .attr('stroke', 'black')
          .attr('fill', 'white')
          .attr('opacity', 1);
        if ((data_array.speed[i-1]<params.speed)*params.pltint){
          this.innerSVG.append('rect')
            .attr('x', this.xScale(pltarr[p-q+1][0]+parseFloat(data_array.space[i-1])))
            .attr('y', (lineheight)*linespacing )
            .attr('width', 3)
            //.attr('height', this.linespacing*meanamp*3)
            .attr('height', this.linespacing -w)
            .attr("stroke-width", 0.3)
            .attr('stroke', 'rgb(8,39,86)')
            .attr('fill', 'rgb(8,39,86)')
            .attr('opacity', 1);
        }



        function make_curve(id){

          d3.selectAll("#rect"+id).transition().ease(d3.easeLinear)
            .duration(20000).attr('opacity', 0)
          d3.selectAll("#ampcurve"+id).transition().ease(d3.easeLinear)
            .duration(2000).attr('opacity', 0)
          d3.selectAll("#curve"+id).transition().ease(d3.easeLinear)
            .duration(2000).attr('opacity', 1)


        }
        //this.innerSVG.append('circle').classed('hoverPoint2', true);


        //innerSVG.append("text").classed('hoverText', true);

        //innerSVG.datum(lineheight).on('mouseover', function(d) {this.lineheight = lineheight;console.log(innerSVG.selectAll("curveshow"+lineheight)),mouseMove(player, lineheight,data_array.start[j])})


        //if (data_array.timeloc[i] - data_array.timeloc[j] > t_words || i == n || data_array.space[i-1]>params.phrasespacing){}

        if ( (+data_array.end[i] - data_array.start[m] >= t_words)*(!this.params.pltint )|| (this.params.pltphrase==true)*(!this.params.pltint ) || (data_array.speed[i-1]<=params.speed)*params.pltint || (data_array.space[i-1]>=params.phrasespacing)*params.pltphrase){
          this.starts.push(data_array.start[m])
          this.ends.push(+data_array.end[i-1]+parseFloat(data_array.space[i-1]))
          // console.log(this.ends)
          /*if (data_array.space[i]>params.phrasespacing){
            this.ends.push(data_array.timeloc[i]+data_array.space[i-1])
          }else {
            this.ends.push(data_array.timeloc[i])
          }*/
          lineheight++
          m = i
        }
        j = i

        //console.log(amp.t[q],amp.t[p])


      }
      //if (params.pltphrase==true){lineheight++}

      this.n_lines = lineheight

    }
    //console.log(window.performance.now()-this.t)
    //console.log('END')

  }

  make_text(data_array, amp,params){
    this.svg.append("text")
      .attr("id", `textshow`)
      .attr("text-anchor", "middle")
      .attr("x", (this.xScale(this.params.num_words/2)))
      .attr("y", -28)
      .attr("font-size", 30)
      .attr("dy", .35 + "em")
      .attr("vertical-align", "middle")
      .attr('fill','black')
      .attr('stroke', 'white')
      .attr("stroke-width", 0.1)
      //.attr("fill", speaker_colors[data_array.speaker[i]])
      .attr("font-family", "Avenir Next")
      .attr("font-weight", 500)
      .text(this.title);


    let n = this.n
    let t_words = this.params.num_words
    const widthoffset = 50;
    const linespacing = this.linespacing;
    const xscaleoffset = 100;
    let lineheight = 0
    let k = 0
    let j=0

    for (let i = 0; i <this.n_print-1; i++) {
      if ( (+data_array.end[i] - data_array.start[j] >= t_words)*(!this.params.pltint )|| (data_array.speed[i-1]<=params.speed)*params.pltint || (data_array.space[i-1]>=params.phrasespacing)*params.pltphrase){
        // if ( (data_array.timeloc[i] - data_array.timeloc[j] > t_words)*(!params.pltphrase) || i == n-1  || (data_array.space[i-1]>params.phrasespacing)*params.pltphrase){

        j = i
        lineheight++
      }

      //if (params.pltphrase==true||data_array.space[i]>params.phrasespacing){lineheight++; k = word_loc[i]}
//###
      this.svg.append("text")
        .attr("id", `textshow`)
        .attr("text-anchor", "middle")
        .attr("x", (this.xScale(data_array.timeloc[i] - data_array.start[j] )))
        .attr("y", (linespacing) * (lineheight+1)-29)
        .attr("font-size", this.params.font/4+ "em")
        .attr("dy", .35 + "em")
        .attr("vertical-align", "middle")
        .attr('fill','black')
        //.attr("fill", speaker_colors[data_array.speaker[i]])
        //.attr("font-family", "Avenir Next")
        //.attr("font-weight", 500)
        //.attr("letter-spacing",  duration[i]-0.2+"px")
        //.attr("letter-spacing",  this.xScale(data_array.duration[i]/3)+"px")
        .text(data_array.words[i]);
    }
  }

  make_legend(){
////###cmap
    if(this.params.cmap ==true){
      let pitmean = d3.mean(amp.pit)
      let pitstd = d3.deviation(amp.pit)
      let pmin = pitmean - 2*pitstd
      let pmax = pitmean + 2*pitstd
      console.log(pmin,pmax)
      var colors = ['#053061','#14558f','#2166ac','#92c5de',
        '#d1e5f0','#f7f7f7','#fddbc7','#f4a582',
        '#e06a59','#c93461','#be223f']
      var pitrange = [0, 0.1,0.2,0.3,0.4,0.5,0.6,0.7,0.8,0.9, 1.0] .map(x => x * (pmax-pmin)+pmin)

      var data = [{"color":"#053061","value":Math.round(pitrange[0] / 5) * 5},{"color":"#14558f","value":pitrange[1]},
        {"color":"#2166ac","value":pitrange[2]},{"color":"#92c5de","value":pitrange[3]},
        {"color":"#d1e5f0","value":pitrange[4]},{"color":"#f7f7f7","value":pitrange[5]},
        {"color":"#fddbc7","value":pitrange[6]},{"color":"#f4a582","value":pitrange[7]},
        {"color":"#e06a59","value":pitrange[8]},{"color":"#c93461","value":pitrange[9]},
        {"color":"#be223f","value":Math.round(pitrange[10] / 5) * 5}];
    }else{
      let pmin = 55
      let pmax = 340

      var colors = [ '#224237', '#2b5b4f' ,'#307264' ,'#c8d4c8',
        '#d2d6c9' ,'#dcd7ca' ,'#d8cbb9','#ddbfa9'
        ,'#dba788' , '#ce8264', '#b1684c'];
      var pitrange = [0, 0.05,0.1, 0.2, 0.3, 0.35, 0.4, 0.6, 0.7,0.85,  1.0] .map(x => x * (pmax-pmin)+pmin)

      var data = [{"color":"#224237","value":Math.round(pitrange[0] / 5) * 5},{"color":"#2b5b4f","value":pitrange[1]},
        {"color":"#307264","value":pitrange[2]},{"color":"#c8d4c8","value":pitrange[3]},
        {"color":"#d2d6c9","value":pitrange[4]},{"color":"#dcd7ca","value":pitrange[5]},
        {"color":"#d8cbb9","value":pitrange[6]},{"color":"#ddbfa9","value":pitrange[7]},
        {"color":"#dba788","value":pitrange[8]},{"color":"#ce8264","value":pitrange[9]},
        {"color":"#b1684c","value":Math.round(pitrange[10] / 5)*5}];


    }


      //var data = [{"color":"#000004","value":2},{"color":"#02020c","value":5},{"color":"#050417","value":10},{"color":"#0a0722","value":15},{"color":"#10092d","value":20},{"color":"#160b39","value":25},{"color":"#1e0c45","value":30},{"color":"#260c51","value":35},{"color":"#2f0a5b","value":40},{"color":"#380962","value":45},{"color":"#400a67","value":50},{"color":"#490b6a","value":55},{"color":"#510e6c","value":60},{"color":"#59106e","value":65},{"color":"#61136e","value":70},{"color":"#69166e","value":75},{"color":"#71196e","value":80},{"color":"#781c6d","value":85},{"color":"#801f6c","value":90},{"color":"#88226a","value":95},{"color":"#902568","value":100},{"color":"#982766","value":105},{"color":"#a02a63","value":110},{"color":"#a82e5f","value":115},{"color":"#b0315b","value":120},{"color":"#b73557","value":125},{"color":"#bf3952","value":130},{"color":"#c63d4d","value":135},{"color":"#cc4248","value":140},{"color":"#d34743","value":145},{"color":"#d94d3d","value":150},{"color":"#df5337","value":155},{"color":"#e45a31","value":160},{"color":"#e9612b","value":165},{"color":"#ed6925","value":170},{"color":"#f1711f","value":175},{"color":"#f47918","value":180},{"color":"#f78212","value":185},{"color":"#f98b0b","value":190},{"color":"#fa9407","value":195},{"color":"#fb9d07","value":200},{"color":"#fca60c","value":205},{"color":"#fcb014","value":210},{"color":"#fbba1f","value":215},{"color":"#fac42a","value":220},{"color":"#f8cd37","value":225},{"color":"#f6d746","value":230},{"color":"#f4e156","value":235},{"color":"#f2ea69","value":240},{"color":"#f2f27d","value":245},{"color":"#f5f992","value":250}];


    var extent = d3.extent(data, d => d.value);
      var padding = 12;
      var width = 320;
      var innerWidth = width - (padding * 2);
      var barHeight =30;
      var height = 80;

      var xScale = d3.scaleLog()
      .range([0, innerWidth])
      .domain(extent);


    let nticks = 5


    let a = Array.from(Array(10).keys()).map(i => extent[0]+ i*(extent[1] - extent[0])/nticks)
    var xAxis = d3.axisBottom(xScale)
      .tickSize(barHeight * 1.3)
      .ticks(5,1);

    console.log(a)

      var svg = d3.select("#gradient").append("svg").attr("width", width).attr("height", height).attr('overflow','visible');
      var g = svg.append("g").attr("transform", "translate(" + padding + ", 0)");

      svg.append('text').attr("y", -30)
        .attr("x", 30)
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Pitch");

      var defs = svg.append("defs");
      var linearGradient = defs.append("linearGradient").attr("id", "myGradient");
      linearGradient.selectAll("stop")
      .data(data)
      .enter().append("stop")
      .attr("offset", d => ((d.value - extent[0]) / (extent[1] - extent[0]) * 100) + "%")
      .attr("stop-color", d => d.color);

      g.append("rect")
      .attr("width", innerWidth)
      .attr("height", barHeight)
      .style("fill", "url(#myGradient)");

      g.append("g")
      .call(xAxis)
      .select(".domain").remove();

      ////#### amplitude
    console.log(this.pltarr)
    //let amp_data = [[0,100,0.1],[1,120,0.3],[2,150,0.5],[3,180,1],[4.5,100,1],[4.5,200,1],[5,120,1]]
    let area = this.makearea2(0,-10, 3)
      let amp_data = [
          [0.01, 131.73953071177834, 0.005658550912160169],
        [0.020000000000073, 131.73953071177834, 0.005658550912160169],
        [0.060000000000036, '121.699446640302', 0.25575590531795994],
        [0.1, '117.81205621347704', 0.510953596212421],
        [0.140000000000077, '120.28425487678992', 0.15786206312566467],
        [0.152499999999936, '126.72578979354637', 0.353976014643823],
        [0.197499999999991, '142.344806694011', 0.4561551319494851],
        [0.2625000000000455, '147.73526571279874', 0.38622185345546256],
        [0.3275000000001, '119.12841333610163', 0.11537010444265362],
        [0.399000000000115, 131.73953071177834, 0.005658550912160169],
     [0.420000000000073, 131.73953071177834, 0.005658550912160169],
     [0.460000000000036, '121.699446640302', 0.25575590531795994],
     [0.5, '117.81205621347704', 0.510953596212421],
     [0.540000000000077, '120.28425487678992', 0.15786206312566467],
     [0.632499999999936, '126.72578979354637', 0.353976014643823],
     [0.697499999999991, '142.344806694011', 0.4561551319494851],
    [0.7625000000000455, '147.73526571279874', 0.38622185345546256],
     [0.8275000000001, '119.12841333610163', 0.11537010444265362],
     [0.910000000000082, 130.9816885753566, 0.07380783485156504],
     [0.930000000000064, '142.8349638146116', 0.38127691896557886],
     [0.9500000000000455, '133.95878585571288', 0.37268638814443855],
    [0.970000000000027, '125.98514219342019', 0.3373779940411873],
    [1.060000000000059, '123.90348514287513', 0.2958715820031949],
     [1.100000000000136, '123.64464628204394', 0.4311674620084358],
     [1.1400000000001, '112.39491653491264', 0.4899771271783824],
    [1.180000000000064, 115.05010505417766, 0.2649351728813466],
     [1.235000000000014, '117.7052935734427', 0.32387296191613585],
    [1.264999999999986, '116.12357548638654', 0.3479374574635345],
    [1.295000000000073, '114.13083436910574', 0.3722263082952428],
    [1.3250000000000455, '106.82028278812581', 0.3553196431713289],
     [1.412500000000023, '100.80820670889955', 0.18595182465782994],
     [1.517500000000041, '108.54010671041998', 0.31356601304494863],
     [1.622500000000059, '110.79119965255013', 0.573164571838391],
     [1.727500000000077, 110.4540761577085, 0.15218245636003472],
     [1.810000000000059, '110.11695266286686', 0.28381835305458647],
     [1.830000000000041, '109.27876176122368', 0.3304050225130317],
     [1.850000000000023, '103.86743144920517', 0.359552948396232],
     [1.8700000000000045, '99.66045697894614', 0.3030892018939445],
    [1.889999999999986, '99.66045697894614', 0.3030892018939445]
  ]

    var yAxis = d3.axisLeft(this.yScale)
      .tickSize(barHeight*0.2)
      //
      .ticks(1);
    // append the svg object to the body of the page
    var svg = d3.select("#amplitude").append("svg")
      .attr('id','svg')
      .attr("width", 200)
      .attr("height", 100)
     // .attr("transform", "translate("+ -470+","+-25 +")scale(" + 2 + ")")
      .attr("overflow", "visible")
      //.call(zoom(this.name))
      .append("g")
console.log(this.pltarr,amp_data)

  svg.append('path')
  .attr('class', 'area')
  .datum(amp_data)
  .attr('fill', '#494949')
  // .attr('stroke', 'black')
  //.attr("stroke-width", 0.2)
  .attr('opacity', 1)
  .attr('d', area)


    svg.call(yAxis)
      .attr("transform", "translate("+ 10+","+15 +")scale(" + 1.5 + ")")
  }

  make_scatter(data, offs){
    const zip = (a, b) => a.map((k, i) => [k, b[i]]);
    let width = 300
    let height = 300
    let data_plot = zip (data.amp, data.pit)
    // Add X axis
    var x = d3.scaleLinear()
      .domain([-0.0, d3.extent(data.amp)[1]])
      .range([ 0, width ]);
    this.svg.append("g")
      .attr('id','showstats')
      .attr("transform", "translate("+(width+offs)+"," + height + ")")
      .call(d3.axisBottom(x).ticks(5));

    // Add Y axis
    var y = d3.scaleLinear()
      .domain([50, 350])
      .range([ height, 0]);
    this.svg.append("g")
      .attr('id','showstats')
      .attr("transform", "translate("+(width+offs)+"," + 0 + ")")
      .call(d3.axisLeft(y).ticks(5));

    this.svg.append('g')
      .attr('id','showstats')
      .attr("transform", "translate("+(width+offs)+"," + 0 + ")")
      .selectAll("dot")
      .data(data_plot)
      .enter()
      .append("circle")
      .attr("cx", function (d) { return x(d[0])} )
      .attr("cy", function (d) { return y(d[1])} )
      //.attr("cx", function (d) { console.log(d);if (d[1] = '') {return 0}else{return x(d[1]);} } )
      //.attr("cy", function (d) { if (d[2] = '') {return 0}else{return y(d[2]);} } )
      .attr("r", 3)
      .attr('opacity',0.25)
      .style("fill", "#69a5b3")
    this.svg.append("text")
      .attr('id','showstats')
      .attr("y", height/2-10)
      .attr("x",offs+width-50)
      .style("text-anchor", "middle")
      .attr("dy", "1em")
      .text("Pitch");

    this.svg.append("text")
      .attr('id','showstats')
      //.attr("transform", "rotate(-90)")
      .attr("y", height+20)
      .attr("x", offs + width*1.5)
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("Amplitude");




  }

  make_hist(data, offs, label,clr, ext){
    console.log(d3.extent(data))
    let width = 300
    let height = 300
    // X axis: scale and draw:
    var x = d3.scaleLinear()
      .domain(ext)     // can use this instead of 1000 to have the max of data: d3.max(data, function(d) { return +d.price })
      .range([0, width]);
    this.svg.append("g")
      .attr('id','showstats')
      .attr("transform", "translate("+(width+offs)+"," + height + ")")
      .call(d3.axisBottom(x).ticks(7));

    // set the parameters for the histogram
    var histogram = d3.histogram()
      .value(function(d) { return d })   // I need to give the vector of value
      .domain(x.domain())  // then the domain of the graphic
      .thresholds(x.ticks(20)); // then the numbers of bins

    // And apply this function to data to get the bins
    var bins = histogram(data);

    // Y axis: scale and draw:
    var y = d3.scaleLinear()
      .range([height, 0]);
    y.domain([0, d3.max(bins, function(d) { return d.length; })]);   // d3.hist has to be called before the Y axis obviously
    this.svg.append("g")
      .attr('id','showstats')
      .attr("transform", "translate("+(width+offs)+"," + 0 + ")")
      .call(d3.axisLeft(y).ticks(5));

    // append the bar rectangles to the svg element
    this.svg.selectAll("rect2")
      .attr("transform", "translate("+(width+offs)+"," + 0 + ")")
      .data(bins)
      .enter()
      .append("rect")
      .attr("x", 1)
      .attr("transform", function(d) { return "translate(" +(width+offs+ x(d.x0)) + "," + y(d.length) + ")"; })
      .attr("width", function(d) { return x(d.x1) - x(d.x0) -1 ; })
      .attr("height", function(d) { return height - y(d.length); })
      .attr('id','showstats')
      .style("fill", clr)

    this.svg.append("text")
      .attr('id','showstats')
      //.attr("transform", "rotate(-90)")
      .attr("y", height+20)
      .attr("x", offs+width*1.5)
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text(label);

  }

  make_viz(){


    // console.log(this.params.name0)

    this.prep_data(this.amp)
    this.make_svg()
    this.make_scale()


    this.make_plot(this.data_array, this.amp,this.params,this.player)

    //this.make_svg()
    this.make_text(this.data_array, this.amp,this.params)

    this.make_legend()
    if (this.params.showstats == true){
      this.make_scatter(this.amp, 700)
      this.make_hist(this.amp.pit, 1100, "Pitch", "#69b3a5",[60, 300])
      this.make_hist(this.amp.amp, 1500, "Amplitude","#6978b3",[0,0.6])
      this.make_hist(this.data_array.space, 1900, "Pauses","#9e69b3",[0,0.5])
      this.make_hist(this.data_array.speed, 2300, "Speaking Rate","#69b38c",[0,100])
    }

  }







}



