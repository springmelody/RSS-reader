/* eslint-disable no-param-reassign */
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import * as yup from 'yup';
import onChange from 'on-change';
import i18next from 'i18next';
import parse from './parse.js';
import renderPosts from './renderPosts.js';
import renderFeeds from './renderFeeds.js';
import resources from './locales/en.js';

const form = document.querySelector('.rss-form');
const input = form.querySelector('.form-control');
const submitButton = form.querySelector('button[type="submit"]');
const corps = 'https://api.allorigins.win/raw?url=';
i18next.init({
  lng: 'en',
  debug: true,
  resources,
});

const errorMessages = {
  required: i18next.t('errorMessages.required'),
  url: i18next.t('errorMessages.url'),
  duplicate: i18next.t('duplicate'),
  network: i18next.t('errorMessages.network'),
};

const buildSchema = (watchedState) => (
  yup.object().shape({
    text: yup.string()
      .required(errorMessages.required)
      .url(errorMessages.url)
      .notOneOf(watchedState.rssContent.feedsUrl, errorMessages.duplicate),
  }));

const validate = (watchedState) => {
  try {
    const schema = buildSchema(watchedState);
    schema.validateSync(watchedState.form);
    return null;
  } catch (err) {
    return err.message;
  }
};

export default () => {
  const state = {
    form: {
      text: '',
      valid: null,
      errorType: null,
      processState: 'empty',
    },
    rssContent: {
      feeds: [],
      posts: [],
      feedsUrl: [],
    },
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
      case null:
        // console.log(null);
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

  const processStateHandler = (watchedState) => {
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

  const watchedState = onChange(state, (path) => {
    if (path === 'form.processState') {
      processStateHandler(watchedState);
    }

    if (path === 'rssContent.posts') {
      renderPosts(watchedState.rssContent.posts);
    }

    if (path === 'rssContent.feeds') {
      renderFeeds(watchedState.rssContent.feeds);
    }
  });

  const updateValidationState = (validationState) => {
    const error = validate(state);
    if (error === null) {
      validationState.form.valid = true;
      validationState.form.errorType = null;
    } else {
      validationState.form.valid = false;
      validationState.form.errorType = error;
    }
  };

  const inputHandler = ({ target: { value } }) => {
    watchedState.form.text = value;
    watchedState.form.processState = value === '' ? 'empty' : 'filling';
    updateValidationState(watchedState);
  };

  const formHandler = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const rssUrl = formData.get('url');
    const url = `${corps}${rssUrl}`;
    watchedState.form.processState = 'sending';

    if (watchedState.form.valid === false) {
      return;
    }

    axios.get(url)
      .then(({ data }) => data)
      .then((data) => {
        const dataFeed = parse(data);
        const {
          title, description, id, itemsInfo,
        } = dataFeed;
        const newFeed = {
          id, title, description,
        };
        watchedState.rssContent.feeds.push(newFeed);
        watchedState.rssContent.feedsUrl.push(rssUrl);
        watchedState.rssContent.posts.unshift(itemsInfo);
        // console.log('watchedState posts', watchedState.rssContent.posts);
        watchedState.form.processState = 'finished';
        form.reset();
        input.focus();
        watchedState.form.processState = 'empty';
        // const maxPubDate = itemsInfo.map((el) => el.itemDate);
        // console.log('itemsInfo', watchedState.rssContent.posts);
        // console.log('newFeed', watchedState.rssContent.feeds);
        // console.log(maxPubDate);
        // setTimeout(() => update(url, maxPubDate), 5000);
      })
      .catch((err) => {
        // console.log('err', err);
        watchedState.form.errorType = err.message;
        watchedState.form.processState = 'failed';
      });
  };

  input.addEventListener('input', inputHandler);
  form.addEventListener('submit', formHandler);
};
