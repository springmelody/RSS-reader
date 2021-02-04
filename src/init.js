/* eslint-disable no-param-reassign */
import 'bootstrap';
import axios from 'axios';
import { string, setLocale } from 'yup';
import _ from 'lodash';
import i18next from 'i18next';
import parse from './parse.js';
import resources from './locales/en.js';
import watch from './view.js';

export default () => {
  const elements = {
    form: document.querySelector('.rss-form'),
    input: document.querySelector('.form-control'),
    submitButton: document.querySelector('button[type="submit"]'),
    feedbackContainer: document.querySelector('.feedback'),
    posts: document.querySelector('.posts'),
    modal: document.querySelector('.modal'),
  };

  const crossOrigin = 'https://hexlet-allorigins.herokuapp.com/get?disableCache=true&url=';
  const delayTime = 5000;

  const buildUrl = (rssUrl) => `${crossOrigin}${rssUrl}`.trim();

  i18next.init({
    lng: 'en',
    debug: false,
    resources,
  }).then(() => {
    setLocale({
      string: {
        url: i18next.t('errorMessages.url'),
      },
      mixed: {
        required: i18next.t('errorMessages.required'),
        notOneOf: i18next.t('errorMessages.duplicate'),
      },
    });

    const state = {
      formProcessState: 'idle',
      form: {
        valid: null,
        text: '',
        errorType: null,
      },
      rssContent: {
        feeds: [],
        posts: [],
        feedsUrl: [],
        viewedPosts: new Set(),
      },
      modal: [],
    };

    const watchedState = watch(state, elements);

    const validateUrl = (url) => {
      try {
        const schema = string()
          .required()
          .url()
          .notOneOf(watchedState.rssContent.feedsUrl);
        schema.validateSync(url);
        return null;
      } catch (err) {
        return err.message;
      }
    };

    const updatePosts = (url, feedId) => {
      axios.get(url)
        .then(({ data }) => {
          const newDataFeed = parse(data.contents);
          const { itemsInfo } = newDataFeed;
          const oldPosts = watchedState.rssContent.posts.filter((el) => el.feedId === feedId);
          const newItems = _.differenceBy(itemsInfo, oldPosts, 'itemLink');
          if (newItems.length !== 0) {
            const newPost = newItems.map((post) => ({ ...post, id: _.uniqueId(), feedId }));
            watchedState.rssContent.posts = [...newPost, ...watchedState.rssContent.posts];
          }
          setTimeout(() => updatePosts(url, feedId), delayTime);
        })
        .catch((err) => {
          watchedState.form.errorType = err.message;
          watchedState.formProcessState = 'invalid';
        });
    };

    const getErrorType = (error) => {
      if (error.isAxiosError) {
        return i18next.t('errorMessages.network');
      }

      return i18next.t('errorMessages.valid');
    };

    elements.posts.addEventListener('click', (e) => {
      const postId = e.target.getAttribute('data-id');
      watchedState.rssContent.viewedPosts.add(Number(postId));
      if (_.isEmpty(watchedState.rssContent.posts)) {
        return;
      }
      const post = watchedState.rssContent.posts.find((el) => el.id === postId);
      watchedState.modal = {
        description: post.itemDescription,
        title: post.itemTitle,
        link: post.itemLink,
      };
    });

    elements.form.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const rssUrl = formData.get('url');
      const error = validateUrl(rssUrl);
      if (!error) {
        watchedState.formProcessState = 'loading';
        watchedState.form.valid = 'valid';
        const url = buildUrl(rssUrl);
        axios.get(url)
          .then(({ data }) => {
            const dataFeed = parse(data.contents);
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
            watchedState.formProcessState = 'idle';
            setTimeout(() => updatePosts(url, feedId), delayTime);
          })
          .catch((err) => {
            watchedState.form.errorType = getErrorType(err);
            watchedState.formProcessState = 'failed';
          });
      } else {
        watchedState.form.errorType = error;
        watchedState.form.valid = 'invalid';
      }
    });
  });
};
