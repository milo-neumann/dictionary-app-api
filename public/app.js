// app.js
const form = document.getElementById('lookup-form');
const input = document.getElementById('word-input');
const statusEl = document.getElementById('status');
const resultsEl = document.getElementById('results');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const word = input.value.trim();

  clearUI();

  if (!word) {
    setStatus('Please enter a word to search.');
    input.focus();
    return;
  }

  setStatus('Looking up definition…');

  try {
    const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`;
    const res = await fetch(url);

    // API returns 404 with a JSON body { title, message, resolution }
    if (!res.ok) {
      let message = `No results found for “${word}”.`;
      try {
        const errJson = await res.json();
        if (errJson && errJson.message) {
          message = errJson.message;
        }
      } catch (_) {} // ignore JSON parse errors
      throw new Error(message);
    }

    const data = await res.json(); // array of entries
    renderResults(data);
    setStatus(`Found ${data.length} entr${data.length === 1 ? 'y' : 'ies'} for “${word}”.`);
  } catch (err) {
    setStatus(err.message || 'Something went wrong. Please try again.');
  }
});

function setStatus(text) {
  statusEl.textContent = text;
}

function clearUI() {
  setStatus('');
  resultsEl.innerHTML = '';
}

function renderResults(entries) {
  // Each entry contains: word, phonetics[], meanings[]
  entries.forEach((entry) => {
    const wordRow = document.createElement('div');
    wordRow.className = 'result-word';

    const wordText = document.createElement('span');
    wordText.className = 'word-text';
    wordText.textContent = entry.word;

    const phoneticText = firstPhoneticText(entry);
    if (phoneticText) {
      const phon = document.createElement('span');
      phon.className = 'phonetic';
      phon.textContent = `/${phoneticText}/`;
      wordRow.appendChild(phon);
    }

    // Optional audio button
    const audioSrc = firstPhoneticAudio(entry);
    if (audioSrc) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'audio-btn';
      btn.setAttribute('aria-label', 'Play pronunciation');
      btn.textContent = '🔊 Play';
      const audio = new Audio(audioSrc);
      btn.addEventListener('click', () => audio.play());
      wordRow.appendChild(btn);
    }

    wordRow.prepend(wordText);
    resultsEl.appendChild(wordRow);

    // Meanings
    (entry.meanings || []).forEach((m) => {
      const meaning = document.createElement('div');
      meaning.className = 'meaning';

      const pos = document.createElement('div');
      pos.className = 'part-of-speech';
      pos.textContent = m.partOfSpeech || '—';
      meaning.appendChild(pos);

      const ul = document.createElement('ul');
      ul.className = 'definition-list';

      (m.definitions || []).forEach((defObj, idx) => {
        const li = document.createElement('li');
        const def = document.createElement('div');
        def.textContent = defObj.definition || '';
        li.appendChild(def);

        if (defObj.example) {
          const ex = document.createElement('div');
          ex.className = 'meta';
          ex.textContent = `Example: ${defObj.example}`;
          li.appendChild(ex);
        }

        if (Array.isArray(defObj.synonyms) && defObj.synonyms.length) {
          const syn = document.createElement('div');
          syn.className = 'meta';
          syn.textContent = `Synonyms: ${defObj.synonyms.slice(0, 6).join(', ')}`;
          li.appendChild(syn);
        }

        ul.appendChild(li);
      });

      meaning.appendChild(ul);
      resultsEl.appendChild(meaning);
    });
  });
}

function firstPhoneticText(entry) {
  if (!entry?.phonetics) return '';
  // Prefer a phonetic with text
  const withText = entry.phonetics.find(p => p.text);
  return withText?.text?.replace(/\//g, '') || '';
}

function firstPhoneticAudio(entry) {
  if (!entry?.phonetics) return '';
  const withAudio = entry.phonetics.find(p => p.audio);
  return withAudio?.audio || '';
}
