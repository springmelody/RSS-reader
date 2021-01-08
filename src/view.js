import onChange from 'on-change';
import i18next from 'i18next';
import resources from './locales/en';

const form = document.querySelector('.rss-form');
const input = form.querySelector('.form-control');
const submitButton = form.querySelector('button[type="submit"]');

i18next.init({
  lng: 'en',
  debug: false,
  resources,
});

const renderFeeds = (feeds) => {
  const feedsContainer = document.querySelector('.feeds');
  feedsContainer.innerHTML = '';
  const feedsTitle = document.createElement('h2');
  feedsTitle.innerText = i18next.t('feedsTitle');
  feedsContainer.appendChild(feedsTitle);

  const list = document.createElement('ul');
  list.setAttribute('class', 'list-group mb-5');
  feeds.forEach((el) => {
    const item = document.createElement('li');
    item.setAttribute('class', 'list-group-item');
    const itemTitle = document.createElement('h3');
    itemTitle.innerHTML = el.title;
    item.appendChild(itemTitle);
    const itemDescEl = document.createElement('p');
    itemDescEl.innerHTML = el.description;
    item.appendChild(itemDescEl);
    list.appendChild(item);
    feedsContainer.appendChild(list);
  });
};

const renderPosts = (state) => {
  const postsContainer = document.querySelector('.posts');
  postsContainer.innerHTML = '';
  const postsTitle = document.createElement('h2');
  postsTitle.innerText = i18next.t('postsTitle');
  postsContainer.appendChild(postsTitle);
  const postsList = state.rssContent.posts;
  const listEl = document.createElement('ul');
  listEl.setAttribute('class', 'list-group');
  postsList.forEach((post) => {
    const itemEL = document.createElement('li');
    itemEL.setAttribute('class', 'list-group-item d-flex justify-content-between align-items-start');
    const itemElLink = document.createElement('a');
    itemElLink.setAttribute('href', post.itemLink);
    if (!state.rssContent.viewedPosts.includes(Number(post.id))) {
      itemElLink.setAttribute('class', 'font-weight-bold');
    }
    itemElLink.setAttribute('data-id', post.id);
    itemElLink.innerHTML = post.itemTitle;
    const itemElBtn = document.createElement('button');
    itemElBtn.setAttribute('class', 'btn btn-primary btn-sm');
    itemElBtn.setAttribute('data-toggle', 'modal');
    itemElBtn.setAttribute('data-target', '#modalPreview');
    itemElBtn.setAttribute('data-id', post.id);
    itemElBtn.innerHTML = 'Preview';
    itemEL.appendChild(itemElLink);
    itemEL.appendChild(itemElBtn);
    listEl.appendChild(itemEL);
  });
  postsContainer.appendChild(listEl);
};

const errorMessages = {
  required: i18next.t('errorMessages.required'),
  url: i18next.t('errorMessages.url'),
  duplicate: i18next.t('duplicate'),
  network: i18next.t('errorMessages.network'),
};

const renderViewedPosts = (viewedPosts) => {
  viewedPosts.forEach((id) => {
    const el = document.querySelector(`a[data-id="${id}"]`);
    el.classList.remove('font-weight-bold');
  });
};

const renderFeedback = (errorType) => {
  const feedbackContainer = document.querySelector('.feedback');
  feedbackContainer.classList.add('text-danger');
  input.classList.add('is-invalid');
  feedbackContainer.innerHTML = errorType;
};

const renderErrors = (errorType) => {
  switch (errorType) {
    case errorMessages.required:
      renderFeedback(errorType);
      break;
    case errorMessages.url:
      renderFeedback(errorType);
      break;
    case errorMessages.duplicate:
      renderFeedback(errorType);
      break;
    case errorMessages.network:
      renderFeedback(errorType);
      break;
    default:
      throw new Error(`Unknown errorType: ${errorType}`);
  }
};

const renderSuccessMessage = () => {
  const feedbackContainer = document.querySelector('.feedback');
  feedbackContainer.classList.remove('text-danger');
  input.classList.remove('is-invalid');
  feedbackContainer.classList.add('text-success');
  feedbackContainer.innerHTML = i18next.t('loaded');
};

const handleProcessState = (watchedState) => {
  if (watchedState.form.processState === 'empty' || watchedState.form.processState === 'filling') {
    submitButton.disabled = false;
  }

  if (watchedState.form.processState === 'sending') {
    submitButton.disabled = true;
  }

  if (watchedState.form.processState === 'sending' && watchedState.form.valid === false) {
    renderErrors(watchedState.form.errorType);
  }

  if (watchedState.form.processState === 'finished') {
    renderSuccessMessage();
  }

  if (watchedState.form.processState === 'failed') {
    submitButton.disabled = false;
    renderErrors(watchedState.form.errorType);
  }
};

const render = (state) => onChange(state, (path) => {
  const watchedState = render(state);
  switch (path) {
    case 'form.processState':
      handleProcessState(watchedState);
      break;
    case 'rssContent.posts':
      renderPosts(watchedState);
      break;
    case 'rssContent.feeds':
      renderFeeds(watchedState.rssContent.feeds);
      break;
    case 'rssContent.viewedPosts':
      renderViewedPosts(watchedState.rssContent.viewedPosts);
      break;
    default:
      console.log(`Unknown path: ${path}`);
      break;
      // throw new Error(`Unknown path: ${path}`);
  }
});

export default render;
