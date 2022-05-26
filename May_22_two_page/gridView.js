document.body.style.zoom = "100%"
function load_audio(path2) {
  var amp ={
    t:[],
    amp:[],
    pit:[],
  }

  d3.csv(path2, function (data) {
    for (var i = 0; i < data.length; i++) {
      amp.t[i] = data[i].time
      amp.amp[i] = data[i].amplitude
      amp.pit[i] = data[i].pitch
    }
  })

  return amp

}

function load_data(path) {
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


  d3.csv(path, function (data) {
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
  })
  return data_array
};

function clear_svg(num){
  d3.select("#my_dataviz").html("")
  //for (i =0; i<num; i++){
  //  d3.select("svg").remove()
  //}
}
var amp = [];
for(i=0; i<paths.length; i++){
  amp[i] = load_audio(paths2[i])

}
var data_array = [];
for(i=0; i<paths.length; i++){
  data_array[i] = load_data(paths[i])

}

function addStartingSelectionBox(){
console.log(Number.isInteger(document.cookie[0]), document.cookie[0])
  if (Number.isInteger(parseFloat(document.cookie[0]))){

    var groupElement = document.querySelector('#svgviz' +document.cookie[0] );
    var bboxGroup = groupElement.getBBox();
    console.log(bboxGroup)
    //d3.select('#selection').remove()
    // Add the path using this helper function
    d3.select('#svgviz' +document.cookie[0]).append('rect').attr('id', 'selection')
      .attr('x', bboxGroup.x-10)
      .attr('y', bboxGroup.y)
      .attr('width', bboxGroup.width+20)
      .attr('height', bboxGroup.height+10)
      .attr('stroke', 'black')
      .attr('stroke-width',2)
      .attr('fill', '#69a3b2')
      .attr('opacity', 0.15)
  }
}
//console.log(Date.now())
function make_viz_array(data_array,amp){

  for (i=0; i<num;i++){

    id = names.indexOf(params['name'+i])
    eval('viz'+i+'= new make_viz(data_array[id],amp[id],params,player0, links[id], i,params[\'name\'+i] )')
    eval('viz'+i+'.make_viz()')
    //viz0 = new make_viz(data_array[id],amp[id],params,eval('player'+i), links[id])
    //viz0.make_viz()

  }
  addStartingSelectionBox()

  return

}


async function f() {
  return 1;
}

//f().then(console.log)

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var num = 0

params.resetAnimation =
  function() {
    clear_svg(num+1)
    make_viz_array(data_array,amp)
  };
setTimeout(params.resetAnimation, 1000)


params.keepplaying = false
params.name0 = 'Bill Gates'
params.name1 = 'AlGore'
params.name2 = 'Celeste Headlee: Better Conversation'
params.name3 = 'Tim Urban: Procrastinator'
params.name4 = 'Hyeonseo Lee: Escape from North Korea'
params.name5 = 'Pamela Meyer: Spot a Liar'
params.name6 = 'Lera Boroditsky: Language shapes thoughts'
params.name7 = 'Sir Ken Robinson: Schools kill Creativity',
  params.name8 = 'Finale'
params.name9 = 'Angela Duckworth: Passion and Perseverance'
params.subvizx +=8
params.subvizy +=8
num +=10;
//###
/*file = gui.addFolder('Choose Viz')

var obj = {

  add:function(){
    idx = String(num)
    eval('params.name' + idx + '= []')
    item = gui.add(params, 'name'+idx,names).name('Name '+idx).onChange(function() {
      params.keepplaying = false
      clear_svg(num + 1)
      //player0.loadVideoById(links[names.indexOf(params.name0)], "large")
      eval('player'+idx+'.loadVideoById(links[names.indexOf(params.name'+idx+')])')
      eval('player'+idx+'.pauseVideo()')

      make_viz_array(data_array,amp)

    });


    items.push(item)
    num +=1;
    params.subvizx +=1;
  },

  remove:function(){
    gui.remove(items.pop())
    delete params['name'+num]
    clear_svg(num+1)
    num = num -1
    params.subvizx -=1
    make_viz_array(data_array,amp);}

};




gui.add(obj,'add').name('Add Viz');
gui.add(obj,'remove').name('Remove Viz');*/

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

class make_viz {
  constructor(data_array, amp, params, player, link, id, name) {
    this.dpr = window.devicePixelRatio || 1
    console.log(this.dpr)
    this.data_array = data_array
    this.amp = amp
    this.params = params
    this.player = player
    this.link = link
    this.widthoffset = 50;
    this.linespacing = 14;
    this.xscaleoffset = 0;
    this.n = data_array.words.length
    this.name = 'viz'+id
    this.id = id
    this.title = name
    this.n_print = 500
    this.t = window.performance.now()
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
      .range([0, this.params.ampcurve*2 ]); // output

    if (params.ofs==true){domval = [-50,50]}else{domval = [60,300]}


  }

  make_svg(){

    var margin = {top: 50, right: 5, bottom: 50, left: 3}
      , width = (window.innerWidth - margin.left - margin.right)/this.params.subvizx// Use the window's width
      , height = (window.innerHeight - margin.top - margin.bottom) / this.params.subvizy // Use the window's height



    /*var zoomer = d3.zoom()
      .scaleExtent([0.01, 10])
      .on("zoom", zoomed1);

    var slider = d3.selectAll("svg").append("input")
      .datum({})
      .attr("type", "range")
      .attr("value", zoomer.scaleExtent()[0])
      .attr("min", zoomer.scaleExtent()[0])
      .attr("max", zoomer.scaleExtent()[1])
      .attr("step", (zoomer.scaleExtent()[1] - zoomer.scaleExtent()[0]) / 100)
      .on("input", slided(4));

    function zoomed1() {
      slider.property("value",  d3.event.scale);
    }



    function slided(d) {
      //fn(d3.event);
      console.log(d)
      //viz0.svg.attr("transform", "scale(" + d3.select(this).property("value") + ")");
      //viz0.zlvl = d3.event.transform.k
    }


    function callback(x){
      console.log(x);
    }

    function  zoom(d) {
      return d3.zoom().on("zoom", function () {
        zoomed(callback, d)
      });
    }

    function zoomed(fn,x) {
      //fn(d3.event);
      let viz = Function("return " + x)()

      viz.svg.attr("transform", d3.event.transform)
      viz.zlvl = d3.event.transform.k
    }

    on("zoom", function () {
       viz0.svg.attr("transform", d3.event.transform)
       viz0.zlvl = d3.event.transform.k
     })*/

    //console.log(window)
//###
    this.svg = d3.select("#my_dataviz").data([this.name]).append("svg")
      .attr('id','svg'+this.name)
      .attr("width", width*this.params.width)
      .attr("height", 2.2*height*this.params.height)
      .attr("transform", "translate("+ margin.left+",0)scale(" + params.zoomlvl + ")")
      .attr("overflow", "visible").attr('opacity',this.params.curveopacity)
      //.call(zoom(this.name))
      .append("g")
      .on("click", this.addtoZoomView)



    this.innerSVG = this.svg.append("svg")
      //.attr("width", width + margin.left + margin.right)
      //.attr("height", height + margin.top + margin.bottom)
      .attr("overflow", "visible")
      .append("g")


    this.width = width
  }


  addtoZoomView() {
    var content = d3.select(this.parentNode).node()
    let id = content.id.replace('svgviz','')
    document.cookie=id

    var rectBBox = document.querySelector('#rect_1');
    var groupElement = document.querySelector('#'+content.id);

    var bboxGroup = groupElement.getBBox();

    d3.select('#selection').remove()
    // Add the path using this helper function
    d3.select(this).append('rect').attr('id', 'selection')
      .attr('x', bboxGroup.x-10)
      .attr('y', bboxGroup.y)
      .attr('width', bboxGroup.width+20)
      .attr('height', bboxGroup.height+10)
      .attr('stroke', 'black')
      .attr('stroke-width',2)
      .attr('fill', '#69a3b2')
    .attr('opacity', 0.15)
  }

  makearea(j, showvol,showpit) {
    let xScale = this.xScale, yScale = this.yScale, yScale2 = this.yScale2, linespacing = this.linespacing
    var area

    area = d3.area()
      .defined(function(d) { return d[1]; })
      .x(function (d, i) {
        return xScale(d[0]);
      })
      .y1(function (d, i) {
        return  +yScale(d[2])*showvol-yScale2(d[1])*showpit + linespacing * j-2;
      })
      .y0(function (d, i) {
        return  -yScale(d[2])*showvol-yScale2(d[1])*showpit+linespacing * j-2  + 1.5*(showvol==false)*(showpit==true);
      })
      .curve(d3.curveMonotoneX);


    return area
  }

  makearea2(j,w) {
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
        return  linespacing * j -w;
      })
      .curve(d3.curveMonotoneX);


    return area
  }

  make_plot(data_array, amp,params,player){
    // console.log(window.performance.now()-this.t)


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
    /*var colors = ['#f8e4a3', '#fce276', '#ddf68b', '#99e9e2',
      '#91afd2', '#7e7fb3', '#666ab9', '#886198']*/
    /*['#4a6e9d', '#55809a', '#5d9297',  '#64a493',
    '#69b78f', '#92c898', '#b7daa0', '#dbeba9',
    '#fffdb2', '#ffffce']*/


    /*      var colors = ['#12594c', '#3f7163', '#64897b', '#88a295',
            '#9aafa1', '#adbcae','#c8d4c8','#d2d6c9','#d2d6c9' ,
            '#dcd7ca','#d8cbb9','#ddbfa9' ,'#dba788' ,
            '#ce8264', '#bf7558', '#b1684c',];
          var pitrange = [0, 0.05, 0.1, 0.15,
            0.2, 0.25, 0.3, 0.32,
            0.35, 0.4, 0.45, 0.75,
            0.9, 0.95, 1.0] .map(x => x * 270+60)*/
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

      if ( (+data_array.end[i] - data_array.start[m] >=t_words)*(!params.pltint*!params.pltphrase)|| i == n-1  || (data_array.space[i-1]>=params.phrasespacing)|| (data_array.speed[i-1]<=params.speed)*params.pltint) {
//###
        area = this.makearea(lineheight+1,params.showvol,params.showpit)
        area_amp = this.makearea2(lineheight+1,3)
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

        let w = 3
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
          .attr('opacity',this.params.curveopacity)

        //ampcurve
        this.innerSVG.append('path')
          .attr('class', 'area')
          .attr("id", "ampcurve"+lineheight)
          .datum(pltarr)
          .attr('fill', '#000000')
          // .attr('stroke', 'black')
          //.attr("stroke-width", 0.2)
          .attr('opacity', this.params.curveopacity)
          .attr('d', area_amp)
        //.datum([mt,lineheight])
        //.on('click', function (d){mouseClick(player, d[0],d[1])})

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
          .attr('opacity', this.params.curveopacity);
        if ((data_array.speed[i-1]<params.speed)*params.pltint){
          this.innerSVG.append('rect')
            .attr('x', 4*w+this.xScale(pltarr[p-q+1][0]))
            .attr('y', (lineheight)*linespacing )
            .attr('width', 1)
            //.attr('height', this.linespacing*meanamp*3)
            .attr('height', this.linespacing -w)
            .attr("stroke-width", 0.3)
            .attr('stroke', 'rgb(8,39,86)')
            .attr('fill', 'rgb(8,39,86)')
            .attr('opacity', this.params.curveopacity);
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

  make_text(){
    this.svg.append("text")
      .attr("id", `textshow`)
      .attr("text-anchor", "middle")
      .attr("x", (this.xScale(this.params.num_words/2)))
      .attr("y", -12)
      .attr("font-size", 10)
      .attr("dy", .35 + "em")
      .attr("vertical-align", "middle")
      .attr('fill','black')
      .attr('stroke', 'white')
      .attr("stroke-width", 0.1)
      //.attr("fill", speaker_colors[data_array.speaker[i]])
      .attr("font-family", "Avenir Next")
      .attr("font-weight", 500)
      .text(this.title);

  }


  make_viz(){


    // console.log(this.params.name0)


    this.prep_data(this.amp)
    this.make_svg()
    this.make_scale()


    this.make_plot(this.data_array, this.amp,this.params,this.player)
    this.make_text()


  }







}
