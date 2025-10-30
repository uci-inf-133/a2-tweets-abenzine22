let tweet_array = [];

function formatDate(d) {
  return d.toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function countBy(arr, keyFn) {
  const map = new Map();
  for (const x of arr) {
    const k = keyFn(x);
    map.set(k, (map.get(k) ?? 0) + 1);
  }
  return map;
}

function setTextByClass(cls, text) {
  const nodes = document.getElementsByClassName(cls);
  for (const n of nodes) n.textContent = text;
}

function pct(n, d) {
  if (d === 0) return '0.00%';
  return math.format((n / d) * 100, {notation: 'fixed', precision: 2}) + '%';
}

function parseTweets(runkeeper_tweets) {
  if (runkeeper_tweets === undefined) {
    window.alert('No tweets returned');
    return;
  }

  tweet_array = runkeeper_tweets.map(t => new Tweet(t.text, t.created_at));

 
  document.getElementById('numberTweets').innerText = tweet_array.length;


  const times = tweet_array.map(t => t.time).sort((a, b) => a.getTime() - b.getTime());
  document.getElementById('firstDate').innerText = formatDate(times[0]);
  document.getElementById('lastDate').innerText = formatDate(times[times.length - 1]);


  const counts = countBy(tweet_array, t => t.source);
  const total = tweet_array.length;

  const completed = counts.get('completed_event') ?? 0;
  const live = counts.get('live_event') ?? 0;
  const achieve = counts.get('achievement') ?? 0;
  const misc = counts.get('miscellaneous') ?? 0;

  setTextByClass('completedEvents', String(completed));
  setTextByClass('completedEventsPct', pct(completed, total));

  setTextByClass('liveEvents', String(live));
  setTextByClass('liveEventsPct', pct(live, total));

  setTextByClass('achievements', String(achieve));
  setTextByClass('achievementsPct', pct(achieve, total));

  setTextByClass('miscellaneous', String(misc));
  setTextByClass('miscellaneousPct', pct(misc, total));

  
  const completedTweets = tweet_array.filter(t => t.source === 'completed_event');
  const withWritten = completedTweets.filter(t => t.written);
  setTextByClass('written', String(withWritten.length));
  setTextByClass('writtenPct', pct(withWritten.length, completedTweets.length));
}

document.addEventListener('DOMContentLoaded', function () {
  loadSavedRunkeeperTweets().then(parseTweets);
});
