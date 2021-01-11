import onChange from 'on-change';
import i18next from 'i18next';

const form = document.querySelector('.rss-form');
const input = form.querySelector('.form-control');
const submitButton = form.querySelector('button[type="submit"]');

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

const renderViewedPosts = (viewedPosts) => {
  viewedPosts.forEach((id) => {
    const el = document.querySelector(`a[data-id="${id}"]`);
    el.classList.remove('font-weight-bold');
  });
};

const handleProcessState = (watchedState) => {
  const feedbackContainer = document.querySelector('.feedback');
  switch (watchedState.form.processState) {
    case 'empty':
      submitButton.disabled = false;
      input.value = '';
      break;
    case 'filling':
      submitButton.disabled = false;
      break;
    case 'sending':
      submitButton.disabled = true;
      feedbackContainer.classList.add('text-danger');
      input.classList.add('is-invalid');
      feedbackContainer.innerHTML = watchedState.form.errorType;
      break;
    case 'finished':
      feedbackContainer.classList.remove('text-danger');
      input.classList.remove('is-invalid');
      feedbackContainer.classList.add('text-success');
      feedbackContainer.innerHTML = i18next.t('loaded');
      break;
    case 'failed':
      submitButton.disabled = false;
      feedbackContainer.classList.add('text-danger');
      input.classList.add('is-invalid');
      feedbackContainer.innerHTML = watchedState.form.errorType;
      break;
    default:
      break;
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
      break;
  }
});

export default render;
