const cachedImagePath = "assets/images";
const { Text, Image, Vgrid, Zstack } = require("./views/widgetViews");

function getRandomArrayElements(arr, count) {
  var shuffled = arr.slice(0),
    i = arr.length,
    min = i - count,
    temp,
    index;
  while (i-- > min) {
    index = Math.floor((i + 1) * Math.random());
    temp = shuffled[index];
    shuffled[index] = shuffled[i];
    shuffled[i] = temp;
  }
  return shuffled.slice(min);
}

function construct(ctx) {
  const family = ctx.family;
  const displaySize = ctx.displaySize;
  const images = ctx.entry.info.images;
  const title = new Text()
    .text("JSBooru")
    .frame({
      maxHeight: Infinity,
      maxWidth: Infinity,
      alignment: $widget.alignment.bottomLeading
    })
    .color($color("#E5E5EA"))
    .font($font(25))
    .bold()
    .padding(10);

  const timeText = new Text()
    .date(new Date())
    .style($widget.dateStyle.time)
    .frame({
      maxHeight: Infinity,
      maxWidth: Infinity,
      alignment: $widget.alignment.topTrailing
    })
    .color($color("#E5E5EA"))
    .font($font(20))
    .bold()
    .padding(10);

  const zstack = new Zstack();

  if (!images || !images.length) {
    const alertText = new Text()
      .text("⚠️缓存为空\n\n先去主应用，浏览一下收藏吧")
      .font($font(17))
      .bold()
    zstack.views = [alertText]
    return zstack.definition
  }
  switch (family) {
    case 0: {
      const image = new Image()
        .path(images[0])
        .frame(displaySize)
        .resizable(true)
        .scaledToFill(true)
        .clipped(true).definition;
      zstack.views = [image, title, timeText];
      return zstack.definition;
    }
    case 1: {
      const vgrid = new Vgrid()
        .columns(
          Array(3).fill({
            flexible: {
              mininum: 50,
              maximum: Infinity
            },
            spacing: 0
          })
        )
        .spacing(1);
      vgrid.views = images.slice(0, 3).map(n =>
        new Image()
          .path(n)
          .resizable(true)
          .scaledToFill(true)
          .clipped(true)
          .frame({
            width: displaySize.width / 3,
            height: displaySize.height
          })
          .link("jsbox://run?name=JSBooru")
      );
      zstack.views = [vgrid, title, timeText];
      return zstack.definition;
    }
    case 2: {
      const vgrid = new Vgrid()
        .columns(
          Array(2).fill({
            flexible: {
              mininum: 50,
              maximum: Infinity
            },
            spacing: 0
          })
        )
        .spacing(0);
      vgrid.views = images.slice(0, 4).map(n =>
        new Image()
          .path(n)
          .resizable(true)
          .scaledToFill(true)
          .clipped(true)
          .frame({
            width: displaySize.width / 2,
            height: displaySize.height / 2
          })
          .link("jsbox://run?name=JSBooru")
      );
      zstack.views = [vgrid, title, timeText];
      return zstack.definition;
    }
    default:
      break;
  }
}

async function init() {
  const pathes = ($file.list(cachedImagePath) || []).map(
    n => cachedImagePath + "/" + n
  );

  const randomImagePathes =
    pathes.length >= 4 ? getRandomArrayElements(pathes, 4) : pathes;

  const date = new Date();
  date.setMinutes(date.getMinutes() + 10);
  $widget.setTimeline({
    entries: [
      {
        date: new Date(),
        info: {
          images: randomImagePathes
        }
      }
    ],
    policy: {
      afterDate: date
    },
    render: ctx => construct(ctx)
  });
}

module.exports = {
  init
};
