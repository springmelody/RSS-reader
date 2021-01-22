/* eslint-disable no-param-reassign */
import 'bootstrap';
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
  // const crossOrigin = 'https://cors-anywhere.herokuapp.com/';
  // const crossOrigin = 'https://api.allorigins.win/raw?url=';
  const crossOrigin = 'https://hexlet-allorigins.herokuapp.com/raw?url=';
  const delayTime = 5000;

  const buildUrl = (rssUrl) => `${crossOrigin}${rssUrl}`.trim();

  i18next.init({
    lng: 'en',
    debug: false,
    resources,
  }).then(() => {
    const state = {
      // formProcessState: 'empty'
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
        viewedPosts: new Set(),
      },
    };

    const errorMessages = {
      required: i18next.t('errorMessages.required'),
      url: i18next.t('errorMessages.url'),
      duplicate: i18next.t('duplicate'),
      network: i18next.t('errorMessages.network'),
    };
    const watchedState = render(state);

    const buildSchema = (validationState) => (
      yup.object().shape({
        text: yup.string()
          .required(errorMessages.required)
          .url(errorMessages.url)
          .notOneOf(validationState.rssContent.feedsUrl, errorMessages.duplicate),
      }));

    const validate = (validationState) => {
      try {
        // console.log('validationState', validationState);
        const schema = buildSchema(validationState);
        schema.validateSync(validationState.form);
        return null;
      } catch (err) {
        return err.message;
      }
    };

    const validateState = (validationState) => {
      console.log('validationState', validationState.form.text);
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
      watchedState.rssContent.viewedPosts.add(recipient);
    });

    const updatePosts = (url, maxPubDate, feedId) => {
      axios.get(url)
        .then(({ data }) => data)
        .then((data) => {
          const newDataFeed = parse(data);
          const { itemsInfo } = newDataFeed;
          const newPost = itemsInfo
            .filter((el) => el.itemDate > maxPubDate)
            .map((post) => ({ ...post, id: _.uniqueId(), feedId }));
          const newPost2 = _.differenceBy(...watchedState.rssContent.posts, itemsInfo); //?_.differenceWith('link')
          // console.log('newPost2', newPost2);
          watchedState.rssContent.posts = [...newPost, ...watchedState.rssContent.posts];
          const newMaxPubDate = _.max(itemsInfo.map((el) => el.itemDate));
          setTimeout(() => updatePosts(url, newMaxPubDate, feedId), delayTime);
        })
        .catch(() => {
          watchedState.form.errorType = errorMessages.network;
          watchedState.form.processState = 'failed';
        });
    };

    input.addEventListener('input', (e) => {
      const { value } = e.target;
      watchedState.form.text = value;
      watchedState.form.processState = value === '' ? 'empty' : 'filling';
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      validateState(watchedState);
      const formData = new FormData(e.target);
      const rssUrl = formData.get('url');
      const url = buildUrl(rssUrl);
      watchedState.form.processState = 'sending';

      if (watchedState.form.valid === false) {
        return;
      }

      axios.get(url)
        .then(({ data }) => {
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
          watchedState.form.processState = 'empty';
          const maxPubDate = _.max(itemsInfo.map((el) => el.itemDate));
          setTimeout(() => updatePosts(url, maxPubDate, feedId), delayTime);
        })
        .catch(() => {
          watchedState.form.errorType = errorMessages.network;
          watchedState.form.processState = 'failed';
        });
    });
  });

};
