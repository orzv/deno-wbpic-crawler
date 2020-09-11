import { Md5 } from "https://deno.land/std/hash/md5.ts";

/** 根据用户ID微博列表 */
export async function byUserId(id: string, since?: string) {
  let url = "https://m.weibo.cn/api/container/getIndex?" +
    `type=uid&value=${id}&containerid=107603${id}`;
  if (since) url += "&since_id=" + since;
  let res = await fetch(url);
  let data = await res.json();

  if (!data.ok) return null;

  let arr = (data.data.cards as Card[]).filter((i) => i.card_type == 9);
  let list = arr.map((i) => {
    let mb = i.mblog.retweeted_status ? i.mblog.retweeted_status : i.mblog;
    return {
      id: mb.id,
      text: mb.raw_text,
      pics: piclist(mb.pics),
      user_id: mb.user.id,
      user_name: mb.user.screen_name,
    };
  });

  let next = data.data.cardlistInfo.since_id as string;
  return { list, next };
}

/** 根据微博ID获取微博详情 */
export async function byWeiboId(id: string) {
  let url = `https://m.weibo.cn/statuses/show?id=${id}`;
  let json = await (await fetch(url)).json();
  if (!json.ok) return null;
  let data = json.data as Mblog;
  return {
    id: data.id,
    time: new Date(data.created_at),
    text: data.text,
    user_id: data.user.id,
    user_name: data.user.screen_name,
    pics: data.pic_ids,
  };
}

/** 获取话题微博列表 */
export async function byTopic(topic: string, page?: number) {
  let url = "https://m.weibo.cn/api/container/getIndex?";
  let params = new URLSearchParams({
    containerid: `231522type=61&q=#${topic}#`,
  });
  if (page) params.set("page", page.toString());
  url += params;
  let json = await (await fetch(url)).json();

  if (!json.ok) return null;

  let arr = (json.data.cards as Card[]).filter((i) => {
    if (i.card_type != 9) return false;
    if (!i.mblog.pic_num) return false;
    return true;
  });

  let list = arr.map((i) => {
    return {
      id: i.mblog.id,
      text: i.mblog.raw_text,
      pics: piclist(i.mblog.pics),
      user_id: i.mblog.user.id,
      user_name: i.mblog.user.screen_name,
    };
  });
  return { list };
}

/** 获取超话微博列表 */
export async function bySuperTopic(name: string, since?: string) {
  let url = "https://m.weibo.cn/api/container/getIndex?";
  let key = new Md5().update(name).toString();
  let params = new URLSearchParams({
    "containerid": `100808${key}_-_sort_time`,
  });
  if (since) params.set("since_id", since);
  url += params;
  let json = await (await fetch(url)).json();

  if (!json.ok) return null;

  let next = json.data.pageInfo.since_id.toString();
  let groups = (json.data.cards as Card[]).filter((i) => i.card_type == "11")
    .map((i) => i.card_group);

  let arr = groups.flat().filter((i) => i.card_type == "9");

  let list = arr.map((i) => {
    return {
      id: i.mblog.id,
      user_id: i.mblog.user.id,
      user_name: i.mblog.user.screen_name,
      text: i.mblog.raw_text ?? i.mblog.text,
      pics: piclist(i.mblog.pics),
    };
  });
  return { list, next };
}

/** 获取新鲜事微博列表 */
export async function byNovel(id: string, page: number = 1, blockid?: number) {
  if (!blockid) {
    let burl = "https://m.weibo.cn/api/novelty/feed/index?card_id=" + id;
    let bj = await (await fetch(burl)).json();
    if (!bj.ok) return null;

    blockid = bj.data.block_list[0].block_id as number;
  }
  let url = "https://m.weibo.cn/api/novelty/feed/getblock?" +
    new URLSearchParams({
      "card_id": id,
      "block_id": blockid.toString(),
      page: page.toString(),
    });
  let json = await (await fetch(url)).json();
  if (!json.ok) return null;

  let arr = (json.data.content as Novelty[]).filter((i) => {
    return i.type == "mblog" && +i.data.pic_num > 0;
  });
  let list = arr.map((i) => {
    return {
      id: i.data.id,
      user_id: i.data.user.id,
      user_name: i.data.user.screen_name,
      pics: i.data.pic_ids,
      text: i.data.text,
      time: new Date(i.data.created_at),
    };
  });
  return { list, blockid };
}

function piclist(arr: Pic[]) {
  return arr.map((i) => i.pid);
}

interface Card {
  card_type: number | string;
  mblog: Mblog;
  card_group: Card[];
}

interface User {
  id: number;
  screen_name: string;
  avatar_hd: string;
}

interface Pic {
  url: string;
  pid: string;
  large: {
    url: string;
  };
}

interface Mblog {
  text: string;
  id: string;
  pic_num: number;
  created_at: string;
  user: User;
  isLongText?: boolean;
  isTop?: number;
  pics: Pic[];
  pic_ids: string[];
  raw_text: string;
  retweeted_status?: Mblog;
  longText?: {
    longTextContent: string;
  };
}

interface Novelty {
  type: string;
  data: {
    id: string;
    isLongText: boolean;
    text: string;
    pic_num: string;
    pic_ids: string[];
    created_at: string;
    pics: Pic[];
    user: {
      id: string;
      screen_name: string;
    };
  };
}
