const fixFunctions = {
  "lolibooru.moe": item => {
    const { preview_url, file_url } = item.data;
    item.previewUrl = preview_url;
    item.fileUrl = encodeURI(file_url);
    return item;
  },
  "gelbooru.com": item => {
    const { sample, directory, hash } = item.data;
    item.previewUrl = `https://gelbooru.com/thumbnails/${directory}/thumbnail_${hash}.jpg`;
    if (sample) {
      item.sampleUrl = `https://img2.gelbooru.com/samples/${directory}/sample_${hash}.jpg`;
    }
    return item;
  },
  "rule34.xxx": item => {
    const { sample, directory, image } = item.data;
    const basename = image.split(".")[0];
    item.previewUrl = `https://rule34.xxx/thumbnails/${directory}/thumbnail_${basename}.jpg`;
    if (sample) {
      item.sampleUrl = `https://rule34.xxx/samples/${directory}/sample_${basename}.jpg`;
    }
    return item;
  },
  "safebooru.org": item => {
    const { sample, directory, image } = item.data;
    const basename = image.split(".")[0];
    item.previewUrl = `https://safebooru.org/thumbnails/${directory}/thumbnail_${basename}.jpg`;
    if (sample) {
      item.sampleUrl = `https://safebooru.org/samples/${directory}/sample_${basename}.jpg`;
    }
    return item;
  },
  "tbib.org": item => {
    const { sample, directory, image } = item.data;
    const basename = image.split(".")[0];
    item.previewUrl = `https://tbib.org/thumbnails/${directory}/thumbnail_${basename}.jpg`;
    if (sample) {
      item.sampleUrl = `https://tbib.org/samples/${directory}/sample_${basename}.jpg`;
    }
    return item;
  },
  "xbooru.com": item => {
    const { sample, directory, image } = item.data;
    const basename = image.split(".")[0];
    item.previewUrl = `https://xbooru.com/thumbnails/${directory}/thumbnail_${basename}.jpg`;
    if (sample) {
      item.sampleUrl = `https://xbooru.com/samples/${directory}/sample_${basename}.jpg`;
    }
    return item;
  },
  "furry.booru.org": item => {
    const { sample, directory, image } = item.data;
    const basename = image.split(".")[0];
    item.previewUrl = `https://furry.booru.org/thumbnails/${directory}/thumbnail_${basename}.jpg`;
    if (sample) {
      item.sampleUrl = `https://furry.booru.org/samples/${directory}/sample_${basename}.jpg`;
    }
    return item;
  },
  "realbooru.com": item => {
    const { sample, directory, image } = item.data;
    const basename = image.split(".")[0];
    item.previewUrl = `https://realbooru.com/thumbnails/${directory}/thumbnail_${basename}.jpg`;
    if (sample) {
      item.sampleUrl = `https://realbooru.com/samples/${directory}/sample_${basename}.jpg`;
    }
    return item;
  },
  "danbooru.donmai.us": item => {
    if (!item.fileUrl) {
      item.fileUrl = item.data.file_url || null;
    }
    if (!item.previewUrl) {
      item.previewUrl = item.data.preview_file_url || null;
    }
    return item;
  }
};

function fix(item) {
  const domain = item.booru.domain;
  const fixFunction = fixFunctions[domain];
  if (fixFunction) {
    return fixFunction(item);
  } else {
    return item;
  }
}

module.exports = fix;
