export default (posts) => {
  const postsContainer = document.querySelector('.posts');
  postsContainer.innerHTML = '';
  const postsTitle = document.createElement('h2');
  postsTitle.innerText = 'Posts';
  postsContainer.appendChild(postsTitle);

  const postsList = posts;
  const list = document.createElement('ul');
  list.setAttribute('class', 'list-group');
  postsList.forEach((post) => {
    const item = document.createElement('li');
    item.setAttribute('class', 'list-group-item d-flex justify-content-between align-items-start');
    const itemElLink = document.createElement('a');
    itemElLink.setAttribute('href', post.itemLink);
    itemElLink.setAttribute('class', 'font-weight-bold');
    itemElLink.setAttribute('data-id', post.id);
    // console.log('post info', post);
    itemElLink.innerHTML = post.itemTitle;
    const itemElBtn = document.createElement('button');
    itemElBtn.setAttribute('class', 'btn btn-primary btn-sm');
    itemElBtn.setAttribute('data-toggle', 'modal');
    itemElBtn.setAttribute('data-target', '#exampleModal');
    itemElBtn.setAttribute('data-id', post.id);
    itemElBtn.innerHTML = 'Preview';
    item.appendChild(itemElLink);
    item.appendChild(itemElBtn);
    list.appendChild(item);
  });
  postsContainer.appendChild(list);
};
