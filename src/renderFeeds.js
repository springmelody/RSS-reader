export default (feeds) => {
  const feedsContainer = document.querySelector('.feeds');
  feedsContainer.innerHTML = '';
  const feedsTitle = document.createElement('h2');
  feedsTitle.innerText = 'Feeds';
  feedsContainer.appendChild(feedsTitle);

  const list = document.createElement('ul');
  list.setAttribute('class', 'list-group mb-5');
  feeds.forEach((el) => {
    // console.log(el);
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
