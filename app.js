const hobbies = [
  { title: 'Скетчинг', cat: 'create', icon: '✎', desc: 'Блокнот, карандаш и десять минут наблюдений за миром.', tag: 'Рисовать' },
  { title: 'Керамика', cat: 'create', icon: '◉', desc: 'Работа с глиной помогает замедлиться и создать вещь руками.', tag: 'Создавать' },
  { title: 'Домашние растения', cat: 'learn', icon: '❋', desc: 'Узнай, как устроены растения, и начни с неприхотливого вида.', tag: 'Заботиться' },
  { title: 'Велопрогулки', cat: 'move', icon: '⌁', desc: 'Новый маршрут превращает обычный день в небольшое приключение.', tag: 'Двигаться' },
  { title: 'Кулинарные эксперименты', cat: 'create', icon: '✿', desc: 'Пробуй новые сочетания и собирай собственную книгу рецептов.', tag: 'Готовить' },
  { title: 'Наблюдение за звёздами', cat: 'learn', icon: '✦', desc: 'Начни с карты неба и найди созвездия прямо над городом.', tag: 'Исследовать' },
  { title: 'Танцы', cat: 'move', icon: '♬', desc: 'Выбери музыку, которая нравится, и двигайся в своём темпе.', tag: 'Двигаться' },
  { title: 'Фотография', cat: 'create', icon: '▧', desc: 'Замечай свет, фактуры и детали вокруг — камера уже под рукой.', tag: 'Создавать' },
  { title: 'Настольные игры', cat: 'learn', icon: '⌘', desc: 'Открывай новые стратегии и проводи время вместе.', tag: 'Играть' }
];

const storageKey = 'mir-hobby-favorites-v1';
const cards = document.querySelector('#cards');
const search = document.querySelector('#search');
const empty = document.querySelector('#empty');
const status = document.querySelector('#catalog-status');
const announcement = document.querySelector('#announcement');
const favoriteCount = document.querySelector('#favorite-count');
const randomPick = document.querySelector('#random-pick');
const filterButtons = [...document.querySelectorAll('.filter')];
let selected = 'all';

function readFavorites() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || '[]');
    return new Set(Array.isArray(saved)
      ? saved.filter((title) => hobbies.some((hobby) => hobby.title === title))
      : []);
  } catch {
    return new Set();
  }
}

const favorites = readFavorites();

function saveFavorites() {
  try {
    localStorage.setItem(storageKey, JSON.stringify([...favorites]));
  } catch {
    // Избранное продолжит работать до закрытия вкладки, если хранилище недоступно.
  }
}

function getVisibleHobbies() {
  const query = search.value.trim().toLocaleLowerCase('ru');

  return hobbies.filter((hobby) => {
    const matchesCategory = selected === 'all'
      || (selected === 'favorites' ? favorites.has(hobby.title) : hobby.cat === selected);
    const searchableText = `${hobby.title} ${hobby.desc} ${hobby.tag}`.toLocaleLowerCase('ru');
    return matchesCategory && searchableText.includes(query);
  });
}

function ideaWord(count) {
  const lastDigit = count % 10;
  const lastTwoDigits = count % 100;
  if (lastDigit === 1 && lastTwoDigits !== 11) return 'идея';
  if ([2, 3, 4].includes(lastDigit) && ![12, 13, 14].includes(lastTwoDigits)) return 'идеи';
  return 'идей';
}

function render() {
  const visibleHobbies = getVisibleHobbies();

  cards.innerHTML = visibleHobbies.map((hobby) => {
    const isFavorite = favorites.has(hobby.title);
    const favoriteLabel = isFavorite
      ? `Убрать «${hobby.title}» из избранного`
      : `Добавить «${hobby.title}» в избранное`;

    return `
      <article class="hobby-card" data-title="${hobby.title}">
        <button class="favorite-toggle${isFavorite ? ' is-favorite' : ''}"
          type="button" data-favorite="${hobby.title}" aria-pressed="${isFavorite}"
          aria-label="${favoriteLabel}" title="${favoriteLabel}">${isFavorite ? '♥' : '♡'}</button>
        <span class="card-arrow" aria-hidden="true">↗</span>
        <div class="card-icon" aria-hidden="true">${hobby.icon}</div>
        <span class="card-tag">${hobby.tag}</span>
        <h3>${hobby.title}</h3>
        <p>${hobby.desc}</p>
      </article>`;
  }).join('');

  status.textContent = `Показано ${visibleHobbies.length} ${ideaWord(visibleHobbies.length)}`;
  favoriteCount.textContent = favorites.size;
  empty.hidden = visibleHobbies.length > 0;
  empty.textContent = selected === 'favorites' && !search.value.trim()
    ? 'В избранном пока пусто. Нажми ♡ на карточке, чтобы сохранить идею.'
    : 'Пока не нашли такую идею. Попробуй другое слово.';
  randomPick.disabled = visibleHobbies.length === 0;
}

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    selected = button.dataset.filter;
    filterButtons.forEach((item) => {
      const isActive = item === button;
      item.classList.toggle('active', isActive);
      item.setAttribute('aria-pressed', String(isActive));
    });
    render();
  });
});

search.addEventListener('input', render);

cards.addEventListener('click', (event) => {
  const button = event.target.closest('[data-favorite]');
  if (!button) return;

  const title = button.dataset.favorite;
  if (favorites.has(title)) {
    favorites.delete(title);
    announcement.textContent = `«${title}» удалено из избранного.`;
  } else {
    favorites.add(title);
    announcement.textContent = `«${title}» добавлено в избранное.`;
  }

  saveFavorites();
  render();
});

randomPick.addEventListener('click', () => {
  const options = getVisibleHobbies();
  if (!options.length) return;

  const choice = options[Math.floor(Math.random() * options.length)];
  const card = [...cards.querySelectorAll('.hobby-card')]
    .find((item) => item.dataset.title === choice.title);
  if (!card) return;

  cards.querySelectorAll('.hobby-card.is-picked').forEach((item) => item.classList.remove('is-picked'));
  card.classList.add('is-picked');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  card.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
  announcement.textContent = `Попробуй ${choice.title}: ${choice.desc}`;
});

const menuToggle = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.topbar nav');

function closeMenu() {
  navigation.classList.remove('is-open');
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Открыть меню');
}

menuToggle.addEventListener('click', () => {
  const isOpen = navigation.classList.toggle('is-open');
  menuToggle.setAttribute('aria-expanded', String(isOpen));
  menuToggle.setAttribute('aria-label', isOpen ? 'Закрыть меню' : 'Открыть меню');
});

navigation.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeMenu();
});

render();
