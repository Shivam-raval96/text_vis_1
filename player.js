

// 2. This code loads the IFrame Player API code asynchronously.
var tag = document.createElement('script');

tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// 3. This function creates an <iframe> (and YouTube player)
//    after the API code downloads.



  var player0, player1;

  function onYouTubeIframeAPIReady() {
    player0 = new YT.Player('player0', {
      height: '390',
      width: '640',
      videoId: 'NpEaa2P7qZI',
      playerVars: {
        'playsinline': 0
      },
      events: {
        'onReady': onPlayerReady,
        'onStateChange': onPlayerStateChange0
      }
    });

    player1 = new YT.Player('player1', {
      height: '390',
      width: '640',
      videoId: 'NpEaa2P7qZI',
      playerVars: {
        'playsinline': 0
      },
      events: {
        'onReady': onPlayerReady,
        'onStateChange': onPlayerStateChange1
      }
    });
  }

// 4. The API will call this function when the video player is ready.
  function onPlayerReady(event) {
    event.target.playVideo();

  }


// 5. The API calls this function when the player's state changes.
//    The function indicates that when playing a video (state=1),
//    the player should play for six seconds and then stop.
  var done = false;

  function onPlayerStateChange0(event) {
    /*if (event.data == YT.PlayerState.PLAYING) {
      //viz0.svg.append('circle').classed('movingPoint', true);
      viz0.svg.append('rect').classed('movingPoint', true);
      l = viz0.starts.findIndex(element => element >= player0.getCurrentTime())
      k = player0.getCurrentTime() - viz0.starts[l - 1]
      dot = viz0.svg.selectAll('.movingPoint')
        .attr('cx', viz0.xScale(k))
        .attr('cy', (l - 1) * viz0.linespacing)
        .attr('r', '7')
        .attr('fill', '#ee0059')
        .attr('stroke', 'black')
      let w = 0
      rec = viz0.svg.selectAll('.movingPoint')
        .attr('x', viz0.xScale(k))
        .attr('y', (l - 1) * viz0.linespacing-w)
        .attr('width', 200)
        .attr('height', viz0.linespacing -60)//80)
        //.attr('stroke', 'black')
        .attr('fill', 'rgba(105,163,178,0.2)');
//////gaps
      if (k<0){duration = -k}else{duration = 0}
      rec.transition().duration(duration*1000)
      console.log("hi")





        ///adjust time duration / delay based on start stop times

        let delay = duration*1000
      duration = viz0.ends[l - 1] - viz0.starts[l-1] - k
        for (let i = l; i < viz0.n_lines; i++) {


          rec.transition().ease(d3.easeLinear)
            .duration(duration*1000).delay(delay)
            .attr('x', (viz0.xScale(viz0.ends[i - 1]- viz0.starts[i-1] )))
            .attr('y', ( i-1) * viz0.linespacing-w)

          delay = delay + duration*1000
          rec.transition().ease(d3.easeLinear)
            .duration(20).delay(delay)
            .attr('x', (viz0.xScale(0)))
            .attr('y', (i) * viz0.linespacing-w)

          delay = delay + 20
          duration = viz0.ends[i] - viz0.starts[i]

        }





    } else {
      //viz0.svg.selectAll('.movingPoint').transition();
    }*/


    if (event.data == YT.PlayerState.PLAYING && !done) {
      setTimeout(stopVideo0, 6000);
      done = true;
    }
  }

  function onPlayerStateChange1(event) {
  if (event.data == YT.PlayerState.PLAYING) {
    viz1.svg.append('circle').classed('movingPoint', true);

    l = viz1.starts.findIndex(element => element >= player1.getCurrentTime())
    k = player1.getCurrentTime() - viz1.starts[l - 1]
    dot =  viz1.svg.selectAll('.movingPoint')
      .attr('cx', viz1.xScale(k))
      .attr('cy', (l - 1) * viz1.linespacing)
      .attr('r', '7')
      .attr('fill', '#ee0059')
      .attr('stroke', 'black')
//////gaps
    if (k<0){duration = -k}else{duration = 0}
    dot.transition().duration(duration*1000)






    ///adjust time duration / delay based on start stop times

    let delay = duration*1000
    for (let i = l; i < viz1.n_lines; i++) {
      duration = viz1.ends[i - 1] - viz1.starts[i- 1]

      dot.transition().ease(d3.easeLinear)
        .duration(duration*1000).delay(delay)
        .attr('cx', (viz1.xScale(5)))
        .attr('cy', ( i-1) * viz1.linespacing)

      delay = delay + duration*1000
      dot.transition().ease(d3.easeLinear)
        .duration(20).delay(delay)
        .attr('cx', (viz1.xScale(0)))
        .attr('cy', (i) * viz1.linespacing)

      delay = delay + 20

    }





  } else {
    viz1.svg.selectAll('.movingPoint').transition();
  }


  if (event.data == YT.PlayerState.PLAYING && !done) {
    setTimeout(stopVideo1, 6000);
    done = true;
  }
}

  function stopVideo0() {
    player0.stopVideo();
  }

function stopVideo1() {
  player1.stopVideo();
}


