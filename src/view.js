import onChange from 'on-change';
import i18next from 'i18next';
import renderPosts from './renderPosts.js';
import renderFeeds from './renderFeeds.js';
import resources from './locales/en';

const form = document.querySelector('.rss-form');
const input = form.querySelector('.form-control');
const submitButton = form.querySelector('button[type="submit"]');

i18next.init({
  lng: 'en',
  debug: false,
  resources,
});

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
  if (path === 'form.processState') {
    handleProcessState(watchedState);
  }

  if (path === 'rssContent.posts') {
    renderPosts(watchedState);
  }

  if (path === 'rssContent.feeds') {
    renderFeeds(watchedState.rssContent.feeds);
  }

  if (path === 'rssContent.viewedPosts') {
    renderViewedPosts(watchedState.rssContent.viewedPosts);
  }
});

export default render;
