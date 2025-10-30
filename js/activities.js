# js/activities.js
let activity_vis_spec;
let distance_vis_spec;
let distance_vis_agg_spec;

function toDayName(dow) {
  const names = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return names[dow];
}

function parseTweets(runkeeper_tweets) {
  if (runkeeper_tweets === undefined) {
    window.alert('No tweets returned');
    return;
  }

  const tweets = runkeeper_tweets.map(t => new Tweet(t.text, t.created_at));
  const completed = tweets.filter(t => t.source === 'completed_event' && t.activityType && typeof t.distance === 'number');

  
  const freq = {};
  for (const t of completed) {
    const type = t.activityType;
    if (!type) continue;
    freq[type] = (freq[type] ?? 0) + 1;
  }

  const freqArr = Object.entries(freq).map(([activityType, count]) => ({activityType, count}));
  freqArr.sort((a, b) => b.count - a.count);

  const top3 = freqArr.slice(0, 3).map(x => x.activityType);


  document.getElementById('numberActivities').innerText = Object.keys(freq).length.toString();
  document.getElementById('firstMost').innerText = top3[0] ?? '';
  document.getElementById('secondMost').innerText = top3[1] ?? '';
  document.getElementById('thirdMost').innerText = top3[2] ?? '';

 
  activity_vis_spec = {
    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
    description: 'Number of Tweets by activity type',
    data: { values: freqArr },
    mark: 'bar',
    encoding: {
      x: { field: 'activityType', type: 'nominal', sort: '-y', title: 'Activity type' },
      y: { field: 'count', type: 'quantitative', title: 'Count' },
      tooltip: [{field: 'activityType', type:'nominal'}, {field:'count', type:'quantitative'}]
    }
  };
  vegaEmbed('#activityVis', activity_vis_spec, {actions:false});

 
  const distRows = completed
    .filter(t => top3.includes(t.activityType))
    .map(t => ({
      activityType: t.activityType,
      distance: t.distance,
      day: toDayName(t.dayOfWeek)
    }));


  distance_vis_spec = {
    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
    description: 'Distances by day for the three most-tweeted activities',
    data: { values: distRows },
    mark: 'point',
    encoding: {
      x: { field: 'day', type: 'ordinal', sort: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'], title: 'Day of week' },
      y: { field: 'distance', type: 'quantitative', title: 'Distance (mi)' },
      color: { field: 'activityType', type: 'nominal', title: 'Activity' },
      tooltip: [
        {field: 'activityType', type: 'nominal'},
        {field: 'day', type: 'ordinal'},
        {field: 'distance', type: 'quantitative'}
      ]
    }
  };

  
  distance_vis_agg_spec = {
    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
    description: 'Mean distances by day for the three most-tweeted activities',
    data: { values: distRows },
    mark: 'line',
    encoding: {
      x: { field: 'day', type: 'ordinal', sort: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'], title: 'Day of week' },
      y: { aggregate: 'mean', field: 'distance', type: 'quantitative', title: 'Mean distance (mi)' },
      color: { field: 'activityType', type: 'nominal', title: 'Activity' },
      tooltip: [
        {field: 'activityType', type: 'nominal'},
        {field: 'day', type: 'ordinal'},
        {aggregate:'mean', field: 'distance', type: 'quantitative', title: 'Mean distance (mi)'}
      ]
    }
  };

  vegaEmbed('#distanceVis', distance_vis_spec, {actions:false});
  vegaEmbed('#distanceVisAggregated', distance_vis_agg_spec, {actions:false}).then(() => {
   
    document.getElementById('distanceVisAggregated').style.display = 'none';
  });

 
  const sums = {};
  const counts = {};
  for (const r of distRows) {
    sums[r.activityType] = (sums[r.activityType] ?? 0) + (r.distance ?? 0);
    counts[r.activityType] = (counts[r.activityType] ?? 0) + 1;
  }
  const avgs = Object.keys(sums).map(k => ({activityType: k, avg: sums[k]/counts[k]}));
  avgs.sort((a,b) => b.avg - a.avg);
  if (avgs.length > 0) {
    document.getElementById('longestActivityType').innerText = avgs[0].activityType;
    document.getElementById('shortestActivityType').innerText = avgs[avgs.length - 1].activityType;
  }

  
  const isWeekend = (d) => d === 0 || d === 6;
  let weekendSum = 0, weekendCnt = 0, weekdaySum = 0, weekdayCnt = 0;
  for (const t of completed) {
    if (typeof t.distance !== 'number') continue;
    if (isWeekend(t.dayOfWeek)) {
      weekendSum += t.distance; weekendCnt++;
    } else {
      weekdaySum += t.distance; weekdayCnt++;
    }
  }
  const weekendAvg = weekendCnt ? weekendSum/weekendCnt : 0;
  const weekdayAvg = weekdayCnt ? weekdaySum/weekdayCnt : 0;
  document.getElementById('weekdayOrWeekendLonger').innerText = (weekendAvg >= weekdayAvg) ? 'weekends' : 'weekdays';


  const btn = document.getElementById('aggregate');
  btn.addEventListener('click', () => {
    const agg = document.getElementById('distanceVisAggregated');
    const raw = document.getElementById('distanceVis');
    const aggVisible = agg.style.display !== 'none';
    if (aggVisible) {
      agg.style.display = 'none';
      raw.style.display = 'block';
      btn.textContent = 'Show means';
    } else {
      raw.style.display = 'none';
      agg.style.display = 'block';
      btn.textContent = 'Show all points';
    }
  });
}

document.addEventListener('DOMContentLoaded', function () {
  loadSavedRunkeeperTweets().then(parseTweets);
});
