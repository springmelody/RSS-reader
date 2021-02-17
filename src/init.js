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

  const delayTime = 5000;

  const buildUrl = (rssUrl) => {
    const urlWithProxy = new URL('/get', 'https://hexlet-allorigins.herokuapp.com');
    urlWithProxy.searchParams.set('url', rssUrl);
    urlWithProxy.searchParams.set('disableCache', 'true');
    return urlWithProxy.toString();
  };

  i18next.init({
    lng: 'en',
    debug: false,
    resources,
  }).then(() => {
    setLocale({
      string: {
        url: () => ({ key: 'url' }),
      },
      mixed: {
        required: () => ({ key: 'required' }),
        notOneOf: () => ({ key: 'duplicate' }),
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
      },
      viewedPosts: new Set(),
      modal: [],
    };

    const watchedState = watch(state, elements);

    const validateUrl = (url) => {
      const schema = string()
        .required()
        .url()
        .notOneOf(watchedState.rssContent.feedsUrl);
      try {
        schema.validateSync(url);
        return null;
      } catch (err) {
        return err.message;
      }
    };

    const updatePosts = (stateData) => {
      const promises = stateData.rssContent.feedsUrl.map((feedUrl) => {
        const url = buildUrl(feedUrl);
        return axios.get(url)
          .then(({ data }) => {
            const newDataFeed = parse(data.contents);
            const { itemsInfo } = newDataFeed;
            const currentFeedTitle = newDataFeed.title;
            const currentFeed = stateData.rssContent.feeds
              .find((feed) => feed.title === currentFeedTitle);
            const currentFeedId = currentFeed.id;
            const oldPosts = stateData.rssContent.posts
              .filter((el) => el.feedId === currentFeedId);
            const newItems = _.differenceBy(itemsInfo, oldPosts, 'itemLink');
            if (newItems.length !== 0) {
              const newPost = newItems
                .map((post) => ({ ...post, id: _.uniqueId(), currentFeedId }));
              stateData.rssContent.posts = [...newPost, ...stateData.rssContent.posts];
            }
          })
          .catch((err) => {
            stateData.form.errorType = err.message;
            stateData.formProcessState = 'invalid';
          });
      });
      Promise.all(promises).finally(() => setTimeout(() => updatePosts(stateData), delayTime));
    };

    const getErrorType = (error) => {
      if (error.isAxiosError) {
        return 'network';
      }
      if (error.isParsingError) {
        return 'valid';
      }
      return 'unknown';
    };

    elements.posts.addEventListener('click', (e) => {
      const postId = e.target.getAttribute('data-id');
      watchedState.viewedPosts.add(postId);
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
            updatePosts(watchedState);
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
