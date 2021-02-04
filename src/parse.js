export default (data) => {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(data, 'application/xml');
    const title = doc.querySelector('title').textContent;
    const description = doc.querySelector('description').textContent;
    const items = doc.querySelectorAll('item');
    const itemsInfo = [...items].map((item) => {
      const itemTitle = item.querySelector('title').textContent;
      const itemLink = item.querySelector('link').textContent;
      const itemDescription = item.querySelector('description').textContent;
      return {
        itemTitle, itemLink, itemDescription,
      };
    });

    return {
      title, description, itemsInfo,
    };
  } catch (error) {
    return error;
  }
};
