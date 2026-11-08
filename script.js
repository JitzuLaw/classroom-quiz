// ===== ELEMENTS =====
const $ = (id) => document.getElementById(id);
const editorView = $('editorView');
const quizView = $('quizView');
const storeView = $('storeView');
const slotsLayer = $('slots');
const btnBack = $('btnBack');
const countNote = $('countNote');
const boomSvg = $('boomSvg');
const btnEditor = $('btnEditor');
const btnQuiz = $('btnQuiz');
const btnExit = $('btnExit');
const btnFull = $('btnFull');
const editorTitle = $('editorTitle');
const qType = $('qType');
const qText = $('qText');
const qImage = $('qImage');
const imgPreview = $('imgPreview');
const btnRemoveImg = $('btnRemoveImg');
const mcFields = $('mcFields');
const tfFields = $('tfFields');
const mcInputs = document.querySelectorAll('.mc-input');
const btnSave = $('btnSave');
const btnCancelEdit = $('btnCancelEdit');
const questionList = $('questionList');
const emptyNote = $('emptyNote');
const btnExport = $('btnExport');
const btnImport = $('btnImport');
const importFile = $('importFile');
const btnSample = $('btnSample');
const btnClear = $('btnClear');
const toolMsg = $('toolMsg');
const progress = $('progress');
const quizQuestion = $('quizQuestion');
const quizImage = $('quizImage');
const choicesBox = $('choices');
const message = $('message');
const btnNext = $('btnNext');
const results = $('results');
const resultStars = $('resultStars');
const resultScore = $('resultScore');
const btnAgain = $('btnAgain');
const reaction = $('reaction');
const reactGood = $('reactGood');
const reactBad = $('reactBad');

// ===== STORAGE =====
let questions = [];
try {
  questions = JSON.parse(localStorage.getItem('quizQuestions')) || [];
} catch (e) {
  questions = [];
}

function saveQuestions() {
  try {
    localStorage.setItem('quizQuestions', JSON.stringify(questions));
    return true;
  } catch (e) {
    return false; // storage is full
  }
}

const MAX_Q = 10; // the toy shop has 10 toys

function showToolMsg(text, isError) {
  toolMsg.textContent = text;
  toolMsg.className = 'tool-msg' + (isError ? ' err' : '');
}

// ===== SOUNDS (made with the Web Audio API, so no sound files are needed) =====
let audioCtx = null;

function getAudio() {
  if (!audioCtx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    audioCtx = new AC();
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

function tone(freq, start, length, type, volume) {
  const ctx = getAudio();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const t = ctx.currentTime + start;
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(volume, t + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + length);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(t);
  osc.stop(t + length + 0.05);
}

// a burst of noise that sweeps down: "shhhh"
function noise(start, length, volume, fromHz, toHz) {
  const ctx = getAudio();
  if (!ctx) return;
  const n = Math.floor(ctx.sampleRate * length);
  const buf = ctx.createBuffer(1, n, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < n; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / n);
  const src = ctx.createBufferSource();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();
  const t = ctx.currentTime + start;
  src.buffer = buf;
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(fromHz, t);
  filter.frequency.exponentialRampToValueAtTime(toHz, t + length);
  gain.gain.setValueAtTime(volume, t);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + length);
  src.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  src.start(t);
}

// happy rising chime: C E G C
function playCorrect(delay = 0) {
  try {
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(f, delay + i * 0.11, 0.35, 'triangle', 0.28));
    tone(1318.5, delay + 0.5, 0.6, 'sine', 0.2);
  } catch (e) {}
}

// "BOOGSHHH!": a low boom, a whoosh, then the happy chime
function playBoom() {
  try {
    tone(110, 0, 0.4, 'sine', 0.5);
    noise(0, 0.7, 0.45, 3500, 150);
    playCorrect(0.12);
  } catch (e) {}
}

// a little "pop" when a toy goes away
function playPoof() {
  try {
    tone(700, 0, 0.12, 'sine', 0.25);
    tone(1100, 0.06, 0.14, 'sine', 0.2);
    tone(1500, 0.12, 0.18, 'sine', 0.15);
  } catch (e) {}
}

// soft, gentle "boop-boop" (not scary for little kids)
function playWrong() {
  try {
    tone(300, 0, 0.18, 'sine', 0.3);
    tone(220, 0.18, 0.3, 'sine', 0.3);
  } catch (e) {}
}

// ===== PICTURES =====
let currentImage = null;

// shrink the picture so many of them fit in the browser's storage
function fileToDataURL(file, done) {
  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      const max = 800;
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * scale);
      c.height = Math.round(img.height * scale);
      const ctx = c.getContext('2d');
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, c.width, c.height);
      ctx.drawImage(img, 0, 0, c.width, c.height);
      done(c.toDataURL('image/jpeg', 0.8));
    };
    img.onerror = () => alert('That file could not be read as a picture.');
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
}

function setImage(dataUrl) {
  currentImage = dataUrl || null;
  if (currentImage) {
    imgPreview.src = currentImage;
    imgPreview.classList.remove('hidden');
    btnRemoveImg.classList.remove('hidden');
  } else {
    imgPreview.removeAttribute('src');
    imgPreview.classList.add('hidden');
    btnRemoveImg.classList.add('hidden');
    qImage.value = '';
  }
}

qImage.addEventListener('change', () => {
  const file = qImage.files[0];
  if (file) fileToDataURL(file, setImage);
});
btnRemoveImg.addEventListener('click', () => setImage(null));

// ===== EDITOR =====
let editingIndex = null;

qType.addEventListener('change', () => {
  mcFields.classList.toggle('hidden', qType.value !== 'mc');
  tfFields.classList.toggle('hidden', qType.value !== 'tf');
});

function resetForm() {
  editingIndex = null;
  qText.value = '';
  mcInputs.forEach(i => i.value = '');
  document.querySelector('input[name="correct"][value="0"]').checked = true;
  document.querySelector('input[name="tfCorrect"][value="True"]').checked = true;
  qType.value = 'mc';
  qType.dispatchEvent(new Event('change'));
  setImage(null);
  editorTitle.textContent = 'Add a Question';
  btnSave.textContent = 'Save Question';
  btnCancelEdit.classList.add('hidden');
}

btnSave.addEventListener('click', () => {
  const text = qText.value.trim();
  if (!text) { alert('Please type the question.'); return; }

  let q;
  if (qType.value === 'mc') {
    const choices = Array.from(mcInputs).map(i => i.value.trim());
    if (choices.some(c => !c)) { alert('Please fill in all 4 choices.'); return; }
    const answer = Number(document.querySelector('input[name="correct"]:checked').value);
    q = { type: 'mc', text, choices, answer, image: currentImage };
  } else {
    const isTrue = document.querySelector('input[name="tfCorrect"]:checked').value === 'True';
    q = { type: 'tf', text, choices: ['True', 'False'], answer: isTrue ? 0 : 1, image: currentImage };
  }

  if (editingIndex === null && questions.length >= MAX_Q) {
    alert('The toy shop has 10 toys, so a quiz can have up to 10 questions. Delete or edit one instead.');
    return;
  }

  const backup = JSON.stringify(questions);
  if (editingIndex === null) questions.push(q);
  else questions[editingIndex] = q;

  if (!saveQuestions()) {
    questions = JSON.parse(backup);
    alert('The browser storage is full. Try a smaller picture, or delete a picture from an older question.');
    return;
  }
  resetForm();
  renderList();
});

btnCancelEdit.addEventListener('click', resetForm);

function startEdit(i) {
  const q = questions[i];
  editingIndex = i;
  qType.value = q.type;
  qType.dispatchEvent(new Event('change'));
  qText.value = q.text;
  setImage(q.image);
  if (q.type === 'mc') {
    mcInputs.forEach((inp, n) => inp.value = q.choices[n]);
    document.querySelector(`input[name="correct"][value="${q.answer}"]`).checked = true;
  } else {
    const val = q.answer === 0 ? 'True' : 'False';
    document.querySelector(`input[name="tfCorrect"][value="${val}"]`).checked = true;
  }
  editorTitle.textContent = 'Edit Question';
  btnSave.textContent = 'Update Question';
  btnCancelEdit.classList.remove('hidden');
  window.scrollTo(0, 0);
}

function moveQuestion(i, dir) {
  const j = i + dir;
  if (j < 0 || j >= questions.length) return;
  [questions[i], questions[j]] = [questions[j], questions[i]];
  saveQuestions();
  resetForm();
  renderList();
}

function makeButton(label, onClick, className, ariaLabel) {
  const b = document.createElement('button');
  b.textContent = label;
  if (className) b.className = className;
  if (ariaLabel) b.setAttribute('aria-label', ariaLabel);
  b.addEventListener('click', onClick);
  return b;
}

function renderList() {
  questionList.innerHTML = '';
  emptyNote.classList.toggle('hidden', questions.length > 0);
  btnExport.disabled = questions.length === 0;
  btnClear.disabled = questions.length === 0;
  countNote.textContent = questions.length + ' of ' + MAX_Q + ' questions (one for each toy)' +
    (questions.length > MAX_Q ? '. Only the first ' + MAX_Q + ' are used in the quiz.' : '.');

  questions.forEach((q, i) => {
    const li = document.createElement('li');

    const span = document.createElement('span');
    span.textContent = (i + 1) + '. ' + q.text + ' (' + (q.type === 'mc' ? 'Multiple Choice' : 'True/False') + ')' + (q.image ? ' 🖼️' : '');

    const actions = document.createElement('div');
    actions.className = 'row-actions';

    const up = makeButton('↑', () => moveQuestion(i, -1), 'btn-small', 'Move question ' + (i + 1) + ' up');
    const down = makeButton('↓', () => moveQuestion(i, 1), 'btn-small', 'Move question ' + (i + 1) + ' down');
    up.disabled = i === 0;
    down.disabled = i === questions.length - 1;

    const editBtn = makeButton('Edit', () => startEdit(i));
    const delBtn = makeButton('Delete', () => {
      if (confirm('Delete this question?')) {
        questions.splice(i, 1);
        saveQuestions();
        resetForm();
        renderList();
      }
    }, 'btn-delete');

    actions.append(up, down, editBtn, delBtn);
    li.append(span, actions);
    questionList.appendChild(li);
  });
}

// ===== SAVE / LOAD A QUIZ FILE, SAMPLE QUIZ =====
const SAMPLE_QUIZ = [
  { type: 'mc', text: 'How many legs does a spider have?', choices: ['6', '8', '10', '4'], answer: 1, image: null },
  { type: 'tf', text: 'The sun is a star.', choices: ['True', 'False'], answer: 0, image: null },
  { type: 'mc', text: 'What color do you get when you mix red and yellow?', choices: ['Green', 'Purple', 'Orange', 'Blue'], answer: 2, image: null },
  { type: 'tf', text: 'Fish can breathe air like we do.', choices: ['True', 'False'], answer: 1, image: null },
  { type: 'mc', text: 'Which shape has exactly 3 sides?', choices: ['Circle', 'Square', 'Triangle', 'Star'], answer: 2, image: null },
  { type: 'mc', text: 'How many days are in one week?', choices: ['5', '6', '7', '8'], answer: 2, image: null },
  { type: 'mc', text: 'Which animal says "moo"?', choices: ['Dog', 'Cow', 'Cat', 'Duck'], answer: 1, image: null },
  { type: 'tf', text: 'The moon is made of cheese.', choices: ['True', 'False'], answer: 1, image: null },
  { type: 'mc', text: 'Which season comes after winter?', choices: ['Summer', 'Autumn', 'Spring', 'Winter'], answer: 2, image: null },
  { type: 'mc', text: 'How many colors are in a rainbow?', choices: ['5', '6', '7', '8'], answer: 2, image: null }
];

btnSample.addEventListener('click', () => {
  const room = MAX_Q - questions.length;
  if (room <= 0) { showToolMsg('The toy shop is full (10 questions). Delete some first.', true); return; }
  const backup = JSON.stringify(questions);
  const add = JSON.parse(JSON.stringify(SAMPLE_QUIZ)).slice(0, room);
  questions = questions.concat(add);
  if (!saveQuestions()) { questions = JSON.parse(backup); showToolMsg('Not enough storage space.', true); return; }
  resetForm();
  renderList();
  showToolMsg('Added ' + add.length + ' sample questions. Press "Start Quiz" to try them!');
});

btnClear.addEventListener('click', () => {
  if (!questions.length) return;
  if (confirm('Delete ALL ' + questions.length + ' questions? This cannot be undone. (Tip: use "Save Quiz File" first.)')) {
    questions = [];
    saveQuestions();
    resetForm();
    renderList();
    showToolMsg('All questions deleted.');
  }
});

btnExport.addEventListener('click', () => {
  const data = { app: 'classroom-quiz', version: 1, questions };
  const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'my-quiz.json';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  showToolMsg('Saved "my-quiz.json" to your Downloads folder.');
});

btnImport.addEventListener('click', () => importFile.click());

// check one question from a file, and rebuild it so nothing unexpected gets in
function cleanQuestion(q) {
  if (!q || typeof q !== 'object' || typeof q.text !== 'string' || !q.text.trim()) return null;
  const image = (typeof q.image === 'string' && q.image.startsWith('data:image/')) ? q.image : null;
  const text = q.text.trim().slice(0, 300);

  if (q.type === 'tf') {
    if (q.answer !== 0 && q.answer !== 1) return null;
    return { type: 'tf', text, choices: ['True', 'False'], answer: q.answer, image };
  }
  if (q.type === 'mc') {
    if (!Array.isArray(q.choices) || q.choices.length !== 4) return null;
    const choices = q.choices.map(c => (typeof c === 'string' ? c.trim().slice(0, 200) : ''));
    if (choices.some(c => !c)) return null;
    if (![0, 1, 2, 3].includes(q.answer)) return null;
    return { type: 'mc', text, choices, answer: q.answer, image };
  }
  return null;
}

importFile.addEventListener('change', () => {
  const file = importFile.files[0];
  importFile.value = '';
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    let list;
    try {
      const data = JSON.parse(reader.result);
      list = Array.isArray(data) ? data : data.questions;
    } catch (e) {
      showToolMsg('That file is not a quiz file.', true);
      return;
    }
    if (!Array.isArray(list)) { showToolMsg('That file is not a quiz file.', true); return; }

    const valid = list.map(cleanQuestion).filter(Boolean);
    if (!valid.length) { showToolMsg('No valid questions were found in that file.', true); return; }

    const room = MAX_Q - questions.length;
    if (room <= 0) { showToolMsg('The toy shop is full (10 questions). Delete some first.', true); return; }
    const good = valid.slice(0, room);

    const backup = JSON.stringify(questions);
    questions = questions.concat(good);
    if (!saveQuestions()) {
      questions = JSON.parse(backup);
      showToolMsg('Not enough storage space for this quiz (pictures are big).', true);
      return;
    }
    resetForm();
    renderList();
    const skipped = list.length - good.length;
    showToolMsg('Added ' + good.length + ' question(s).' + (skipped ? ' Skipped ' + skipped + ' (not valid, or no room: the shop holds 10).' : ''));
  };
  reader.onerror = () => showToolMsg('That file could not be read.', true);
  reader.readAsText(file);
});

// ===== FULLSCREEN =====
btnFull.addEventListener('click', () => {
  if (!document.fullscreenEnabled) return;
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(() => {});
  } else {
    document.exitFullscreen();
  }
});
document.addEventListener('fullscreenchange', () => {
  btnFull.textContent = document.fullscreenElement ? 'Exit Fullscreen' : 'Fullscreen';
});
if (!document.fullscreenEnabled) btnFull.classList.add('hidden');

// ===== TOY SHOP + QUIZ =====
const slots = ToyShop.build(slotsLayer, openToy); // the 10 toys, in number order
let view = 'editor';      // 'editor', 'store' or 'quiz'
let answered = new Set(); // toys (questions) that were answered right
let current = 0;          // the toy that was picked
let firstTry = 0;         // how many were right on the first try
let missedThis = false;   // did the kids already miss the current question?
let reactTimer = null;

const playable = () => Math.min(questions.length, MAX_Q);
const toysLeft = () => playable() - answered.size;

function showView(name) {
  view = name;
  editorView.classList.toggle('hidden', name !== 'editor');
  storeView.classList.toggle('hidden', name !== 'store');
  quizView.classList.toggle('hidden', name !== 'quiz');
  document.body.classList.toggle('playing', name !== 'editor');
  document.body.classList.toggle('in-store', name === 'store');
  window.scrollTo(0, 0);
}

// the cartoon star behind "BOOGSHHH!"
(function drawBurst() {
  const star = (outer, inner) => {
    const pts = [];
    for (let i = 0; i < 32; i++) {
      const r = i % 2 ? inner : outer;
      const a = (Math.PI * 2 * i) / 32;
      pts.push((Math.cos(a) * r).toFixed(1) + ',' + (Math.sin(a) * r).toFixed(1));
    }
    return pts.join(' ');
  };
  boomSvg.innerHTML =
    '<polygon points="' + star(106, 74) + '" fill="#ffe680" stroke="#ffb703" stroke-width="5" stroke-linejoin="round"/>' +
    '<polygon points="' + star(70, 48) + '" fill="#fff7c2" opacity=".9"/>';
})();

// teddy pop-up in the middle of the screen for 2 seconds
function showReaction(good) {
  const bubble = good ? reactGood : reactBad;
  reactGood.classList.toggle('hidden', !good);
  reactBad.classList.toggle('hidden', good);
  boomSvg.classList.toggle('hidden', !good);
  reaction.classList.remove('hidden');
  bubble.style.animation = 'none';
  boomSvg.style.animation = 'none';
  void bubble.offsetWidth; // restart the pop animations
  bubble.style.animation = '';
  boomSvg.style.animation = '';
  clearTimeout(reactTimer);
  reactTimer = setTimeout(() => reaction.classList.add('hidden'), 2000);
}

function addMark(btn, mark) {
  const s = document.createElement('span');
  s.className = 'mark';
  s.textContent = mark;
  btn.appendChild(s);
}

function celebrate(big) {
  if (typeof confetti !== 'function') return;
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!big) {
    confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
    return;
  }
  confetti({ particleCount: 200, spread: 100, origin: { x: 0.2, y: 0.7 } });
  confetti({ particleCount: 200, spread: 100, origin: { x: 0.8, y: 0.7 } });
}

function goToEditor() {
  clearTimeout(reactTimer);
  reaction.classList.add('hidden');
  showView('editor');
}

// show the shop; toys that were answered are gone
function renderStore() {
  slots.forEach((slot, i) => {
    slot.classList.remove('poof');
    slot.classList.toggle('empty', i >= playable());
    slot.classList.toggle('gone', answered.has(i));
  });
}

// back in the shop. If a toy was just answered, it goes "poof" and disappears.
function goToStore(poofIndex) {
  clearTimeout(reactTimer);
  reaction.classList.add('hidden');
  showView('store');
  renderStore();
  if (poofIndex === null || poofIndex === undefined) return;
  const slot = slots[poofIndex];
  slot.classList.remove('gone');
  void slot.getBoundingClientRect();
  slot.classList.add('poof');
  playPoof();
  setTimeout(() => {
    if (answered.has(poofIndex)) { slot.classList.remove('poof'); slot.classList.add('gone'); }
  }, 750);
}

function startQuiz() {
  if (playable() === 0) { alert('Add at least one question first (or press "Add Sample Questions").'); return; }
  answered = new Set();
  firstTry = 0;
  goToStore(null);
}

btnEditor.addEventListener('click', goToEditor);
btnExit.addEventListener('click', goToEditor);
btnQuiz.addEventListener('click', startQuiz);
btnAgain.addEventListener('click', startQuiz);
btnBack.addEventListener('click', () => goToStore(null));

// a toy was picked: show its question
function openToy(i) {
  if (view !== 'store') return;
  if (i >= playable() || answered.has(i)) return;
  current = i;
  showView('quiz');
  showQuestion();
}

function showQuestion() {
  const q = questions[current];
  missedThis = false;
  results.classList.add('hidden');
  quizQuestion.classList.remove('hidden');
  progress.classList.remove('hidden');
  btnBack.classList.remove('hidden');
  const left = toysLeft();
  progress.textContent = 'Toy ' + (current + 1) + ' · ' + left + (left === 1 ? ' toy left' : ' toys left');
  quizQuestion.textContent = q.text;
  message.textContent = '';
  message.className = '';
  btnNext.classList.add('hidden');

  if (q.image) {
    quizImage.src = q.image;
    quizImage.classList.remove('hidden');
  } else {
    quizImage.removeAttribute('src');
    quizImage.classList.add('hidden');
  }

  choicesBox.innerHTML = '';
  q.choices.forEach((c, i) => {
    const b = document.createElement('button');
    b.textContent = (q.type === 'mc' ? 'ABCD'[i] + '. ' : '') + c;
    b.addEventListener('click', () => checkAnswer(b, i));
    choicesBox.appendChild(b);
  });
}

function checkAnswer(btn, i) {
  const q = questions[current];

  if (i === q.answer) {
    if (!missedThis) firstTry++;
    answered.add(current);
    btn.classList.add('correct');
    addMark(btn, '✓');
    message.textContent = '🎉 Correct! Great job!';
    message.className = 'good';
    playBoom();
    showReaction(true);
    celebrate(false);
    choicesBox.querySelectorAll('button').forEach(b => b.disabled = true);
    btnBack.classList.add('hidden');
    btnNext.textContent = toysLeft() === 0 ? 'Finish' : 'Back to the store';
    btnNext.classList.remove('hidden');
    btnNext.focus();
  } else {
    missedThis = true;
    btn.classList.add('wrong');
    btn.disabled = true;
    addMark(btn, '✗');
    message.textContent = 'Almost! Try again, you can do it! 💪';
    message.className = 'bad';
    playWrong();
    showReaction(false);
  }
}

function showResults() {
  const total = playable();
  const share = firstTry / total;
  const stars = share >= 0.9 ? 3 : share >= 0.6 ? 2 : 1;

  progress.classList.add('hidden');
  btnBack.classList.add('hidden');
  quizQuestion.textContent = '🎉 All the toys are won!';
  quizImage.classList.add('hidden');
  choicesBox.innerHTML = '';
  message.textContent = '';
  btnNext.classList.add('hidden');

  resultStars.textContent = '⭐'.repeat(stars) + '☆'.repeat(3 - stars);
  resultScore.textContent = 'You got ' + firstTry + ' of ' + total + ' on the first try!';
  results.classList.remove('hidden');
  btnAgain.focus();

  playBoom();
  celebrate(true);
}

btnNext.addEventListener('click', () => {
  if (toysLeft() > 0) goToStore(current);
  else showResults();
});

// ===== KEYBOARD =====
// shop: 1-9 and 0 pick a toy.  quiz: A-D (or 1-4) answer, T/F for true/false, Enter = go on.
// Esc: quiz -> back to the shop; shop -> leave to the editor.
document.addEventListener('keydown', (e) => {
  if (view === 'editor') return;
  if (e.ctrlKey || e.metaKey || e.altKey) return;

  const k = e.key.toLowerCase();

  if (k === 'escape') {
    if (document.fullscreenElement) return; // in fullscreen, Esc only leaves fullscreen
    if (view === 'store') goToEditor();
    else if (!results.classList.contains('hidden')) goToEditor();
    else if (!btnBack.classList.contains('hidden')) goToStore(null);
    return;
  }

  if (view === 'store') {
    if (k.length === 1 && '0123456789'.includes(k)) openToy(k === '0' ? 9 : Number(k) - 1);
    return;
  }

  if (k === 'enter' || k === ' ' || k === 'arrowright') {
    if (e.target.tagName === 'BUTTON') return; // the button handles its own key press
    if (!btnNext.classList.contains('hidden')) {
      e.preventDefault();
      btnNext.click();
    }
    return;
  }

  if (!choicesBox.children.length) return;
  const q = questions[current];
  let idx = -1;
  if (k.length === 1 && 'abcd'.includes(k)) idx = 'abcd'.indexOf(k);
  else if (k.length === 1 && '1234'.includes(k)) idx = Number(k) - 1;
  else if (q && q.type === 'tf') {
    if (k === 't') idx = 0;
    else if (k === 'f') idx = 1;
  }

  const btn = choicesBox.children[idx];
  if (idx >= 0 && btn && !btn.disabled) btn.click();
});

// ===== START =====
renderList();