
const SUPABASE_URL = 'https://vwpcgyfpalysbjdziibs.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_n8UrUP_vbrXjVxUUyHo8HQ_Vb0Itl-L';

const db = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);

const form = document.getElementById('entryForm');
const feed = document.getElementById('feed');
const count = document.getElementById('count');
const notice = document.querySelector('.notice');

const colors = [
  '#e9a7bd',
  '#b5a3e2',
  '#a6d9c3',
  '#f1d28b',
  '#9fcfe0'
];

function arNum(number) {
  return new Intl.NumberFormat('ar-SA').format(number);
}

function renderMessages(items) {
  count.textContent = arNum(items.length) + ' مشاركة';
  feed.replaceChildren();

  if (items.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'empty';

    const emoji = document.createElement('span');
    emoji.className = 'emoji';
    emoji.textContent = '🕊️';

    empty.append(
      emoji,
      document.createTextNode('ما زالت اللوحة تنتظر أول رسالة…')
    );

    const line = document.createElement('p');
    line.textContent = 'كونوا أول من يزرع فيها كلمة أمل.';
    empty.append(line);
    feed.append(empty);
    return;
  }

  items.forEach((item, index) => {
    const card = document.createElement('article');
    card.className = 'entry';
    card.style.setProperty('--stripe', colors[index % colors.length]);

    const top = document.createElement('div');
    top.className = 'entry-top';

    const name = document.createElement('div');
    name.className = 'entry-name';
    name.textContent = '♡ ' + item.family_name;

    const time = document.createElement('time');
    time.className = 'entry-time';

    const date = new Date(item.created_at);
    time.dateTime = date.toISOString();
    time.textContent = new Intl.DateTimeFormat('ar-SA', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(date);

    top.append(name, time);

    const message = document.createElement('p');
    message.className = 'entry-message';
    message.textContent = item.message;

    card.append(top, message);
    feed.append(card);
  });
}

async function loadMessages() {
  const { data, error } = await db
    .from('messages')
    .select('id, family_name, message, created_at')
    .order('created_at', { ascending: false })
    .limit(500);

  if (error) {
    console.error('Supabase error:', error);
    notice.textContent =
      'تعذّر تحميل الرسائل. تحققي من إعدادات قاعدة البيانات.';
    return;
  }

  renderMessages(data || []);
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const name = document.getElementById('name').value.trim();
  const message = document.getElementById('message').value.trim();

  if (!name || !message) return;

  const button = form.querySelector('button[type="submit"]');
  button.disabled = true;
  button.textContent = 'جارٍ إرسال رسالتكم…';

  const { error } = await db.from('messages').insert({
    family_name: name,
    message: message
  });

  button.disabled = false;
  button.textContent = 'أضيفوا رسالتنا إلى لوحة المحبة ♡';

  if (error) {
    console.error('Insert error:', error);
    alert('لم تُرسل الرسالة. تحققي من الاتصال وإعدادات قاعدة البيانات.');
    return;
  }

  form.reset();
  await loadMessages();
});

document.getElementById('projectorBtn').addEventListener('click', () => {
  document.body.classList.toggle('projector');

  const active = document.body.classList.contains('projector');
  const button = document.getElementById('projectorBtn');

  button.textContent = active
    ? '↙ خروج من وضع العرض'
    : '⛶ وضع العرض';

  if (active && document.documentElement.requestFullscreen) {
    document.documentElement.requestFullscreen().catch(() => {});
  } else if (!active && document.fullscreenElement) {
    document.exitFullscreen().catch(() => {});
  }
});

loadMessages();
setInterval(loadMessages, 15000);
