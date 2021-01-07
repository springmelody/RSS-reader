/* eslint-disable no-param-reassign */
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import * as yup from 'yup';
import _ from 'lodash';
import $ from 'jquery';
import i18next from 'i18next';
import parse from './parse.js';
import resources from './locales/en.js';
import render from './view.js';

export default () => {
  const form = document.querySelector('.rss-form');
  const input = form.querySelector('.form-control');
  const corps = 'http://cors-anywhere.herokuapp.com/';

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
      viewedPosts: [],
    },
  };

  const watchedState = render(state);

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

  const buildSchema = (validationState) => (
    yup.object().shape({
      text: yup.string()
        .required(errorMessages.required)
        .url(errorMessages.url)
        .notOneOf(validationState.rssContent.feedsUrl, errorMessages.duplicate),
    }));

  const validate = (validationState) => {
    try {
      const schema = buildSchema(validationState);
      schema.validateSync(validationState.form);
      return null;
    } catch (err) {
      return err.message;
    }
  };

  const updateValidationState = (validationState) => {
    const error = validate(watchedState);
    if (error === null) {
      validationState.form.valid = true;
      validationState.form.errorType = null;
    } else {
      validationState.form.valid = false;
      validationState.form.errorType = error;
    }
  };

  $('#modalPreview').on('shown.bs.modal', (event) => {
    const button = $(event.relatedTarget);
    const recipient = button.data('id');
    const postInfo = watchedState.rssContent.posts.find((el) => Number(el.id) === recipient);
    const modal = $('#modalPreview');
    modal.find('.modal-body').text(postInfo.itemDescription);
    modal.find('.modal-title').text(postInfo.itemTitle);
    modal.find('.full-article').attr('href', postInfo.itemLink);
    watchedState.rssContent.viewedPosts.push(recipient);
  });

  const update = (url, maxPubDate, feedId) => {
    axios.get(url)
      .then(({ data }) => data)
      .then((data) => {
        const newDataFeed = parse(data);
        const { itemsInfo } = newDataFeed;
        const newPost = itemsInfo
          .filter((el) => el.itemDate > maxPubDate)
          .map((post) => ({ ...post, id: _.uniqueId(), feedId }));
        watchedState.rssContent.posts = [...newPost, ...watchedState.rssContent.posts];
        const newMaxPubDate = _.max(itemsInfo.map((el) => el.itemDate));
        setTimeout(() => update(url, newMaxPubDate, feedId), 5000);
      })
      .catch((err) => {
        watchedState.form.errorType = err.message;
        watchedState.form.processState = 'failed';
      });
  };

  const handleInput = ({ target: { value } }) => {
    watchedState.form.text = value;
    watchedState.form.processState = value === '' ? 'empty' : 'filling';
    updateValidationState(watchedState);
  };

  const handleForm = (e) => {
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
        const feedId = _.uniqueId();
        const {
          title, description, itemsInfo,
        } = dataFeed;
        const newFeed = {
          id: feedId, title, description,
        };
        const newPosts = [...itemsInfo].map((post) => ({ ...post, id: _.uniqueId(), feedId }));
        watchedState.rssContent.feeds.push(newFeed);
        watchedState.rssContent.feedsUrl.push(rssUrl);
        watchedState.rssContent.posts.unshift(...newPosts);
        watchedState.form.processState = 'finished';
        form.reset();
        input.focus();
        watchedState.form.processState = 'empty';
        const maxPubDate = _.max(itemsInfo.map((el) => el.itemDate));
        setTimeout(() => update(url, maxPubDate, feedId), 5000);
      })
      .catch((err) => {
        watchedState.form.errorType = err.message;
        watchedState.form.processState = 'failed';
      });
  };

  input.addEventListener('input', handleInput);
  form.addEventListener('submit', handleForm);
};
