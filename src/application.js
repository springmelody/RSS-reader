import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import parse from './parse.js';
import * as yup from 'yup';
import onChange from 'on-change';
import _ from "lodash";
import render from "./render.js";

const form = document.querySelector('.rss-form');
const input = form.querySelector('.form-control');
const submitButton = form.querySelector('button[type="submit"]');
const corps = 'https://api.allorigins.win/raw?url=';

const errorMessages = {
  required: 'Required',
  url: 'Must be valid url',
  duplicate: 'Rss already exists',
}

const buildSchema = (watchedState) => {
  return yup.object().shape({
    text: yup.string()
      .required(errorMessages.required)
      .url(errorMessages.url)
      .notOneOf(watchedState.rssContent.feedsUrl, errorMessages.duplicate),
  });
};

const validate = (watchedState) => {
  try {
    const schema = buildSchema(watchedState);
    schema.validateSync(watchedState.form);
    return null;
  }
  catch (err) {
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
    }
  };

  const renderErrors = (errorType) => {
    switch (errorType) {
      case errorMessages.required:
        renderFeedback(errorType)
        break;
      case errorMessages.url:
        renderFeedback(errorType)
        break;
      case errorMessages.duplicate:
        renderFeedback(errorType)
        break;
      case null:
        console.log(null);
        break;
      default:
        throw new Error(`Unknown errorType: ${errorType}`);
    }
  };

  const renderFeedback = (errorType) => {
    const feedbackContainer = document.querySelector('.feedback');
    feedbackContainer.classList.add('text-danger');
    feedbackContainer.innerHTML = errorType;
  };

  const renderSuccessMessage = () => {
    const feedbackContainer = document.querySelector('.feedback');
    feedbackContainer.classList.remove('text-danger');
    feedbackContainer.classList.add('text-success');
    feedbackContainer.innerHTML = 'Rss has been loaded';
  }

  const watchedState = onChange(state, (path) => {
    if (path === 'form.processState') {
      processStateHandler(watchedState);
    }
  });

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
      render(watchedState.rssContent);
      renderSuccessMessage();
    }

    if (watchedState.form.processState === 'failed') {
      submitButton.disabled = false;
      renderErrors(watchedState.form.errorType);
    }
  };

  const updateValidationState = (watchedState) => {
    const error = validate(watchedState);
    if (error === null) {
      watchedState.form.valid = true;
      watchedState.form.errorType = null;
    } else {
      watchedState.form.valid = false;
      watchedState.form.errorType = error;
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
        const { title , description, itemsInfo } = dataFeed
        const newFeed = { title, description };
        watchedState.rssContent.feeds.push(newFeed);
        watchedState.rssContent.feedsUrl.push(rssUrl);
        watchedState.rssContent.posts.unshift(itemsInfo);
        console.log('watchedState posts', watchedState.rssContent.posts);
        watchedState.form.processState = 'finished';
        form.reset();
        input.focus();
        watchedState.form.processState = 'empty';
        const maxPubDate = itemsInfo.map((el) => el.itemDate);
        // console.log(maxPubDate);
        // setTimeout(() => update(url, maxPubDate), 5000);
      })
      .catch((err) => {
        console.log('err', err);
        watchedState.form.errorType = err.message;
        watchedState.form.processState = 'failed';
      });
  }

  input.addEventListener('input', inputHandler);
  form.addEventListener('submit', formHandler)
}
