let writtenTweets = [];

function clearTable() {
  const tbody = document.getElementById('tweetTable');
  while (tbody.firstChild) tbody.removeChild(tbody.firstChild);
}

function setSearchStats(count, text) {
  document.getElementById('searchCount').innerText = String(count);
  document.getElementById('searchText').innerText = text;
}

function renderRows(rows) {
  const tbody = document.getElementById('tweetTable');
  clearTable();
  rows.forEach((t, i) => {
    const html = t.getHTMLTableRow(i + 1);
    const tr = document.createElement('tr');
    tr.innerHTML = html.replace(/^<tr>|<\/tr>$/g, '');
    tbody.appendChild(tr);
  });
}

function parseTweets(runkeeper_tweets) {
  if (runkeeper_tweets === undefined) {
    window.alert('No tweets returned');
    return;
  }
  const all = runkeeper_tweets.map(t => new Tweet(t.text, t.created_at));
  writtenTweets = all.filter(t => t.written);
  setSearchStats(0, '');
  clearTable();
}

function addEventHandlerForSearch() {
  const input = document.getElementById('textFilter');
  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    if (q.length === 0) {
      setSearchStats(0, '');
      clearTable();
      return;
    }
    const results = writtenTweets.filter(t => t.writtenText.toLowerCase().includes(q));
    setSearchStats(results.length, q);
    renderRows(results);
  });
}

document.addEventListener('DOMContentLoaded', function () {
  addEventHandlerForSearch();
  loadSavedRunkeeperTweets().then(parseTweets);
});
